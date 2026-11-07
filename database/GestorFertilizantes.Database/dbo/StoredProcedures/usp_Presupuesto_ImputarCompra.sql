CREATE PROCEDURE dbo.usp_Presupuesto_ImputarCompra @IdCompra bigint, @DistribucionJson nvarchar(max),
    @IdOperacion uniqueidentifier, @Motivo nvarchar(500), @MotivoExceso nvarchar(500) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;
    DECLARE @TranInicial int = @@TRANCOUNT;
    IF @TranInicial = 0 BEGIN TRANSACTION; ELSE SAVE TRANSACTION Presupuesto;
    BEGIN TRY
        EXEC dbo.usp_Presupuesto_ValidarLineas @DistribucionJson, N'idPartidaPresupuesto', N'idCompromisoDetalle';
        SET @MotivoExceso = NULLIF(TRIM(@MotivoExceso),N'');
        DECLARE @Lineas table (IdPartida bigint, IdCompromisoDetalle bigint NULL, Monto decimal(18,4));
        INSERT @Lineas SELECT IdPartida, IdCompromisoDetalle, Monto FROM OPENJSON(@DistribucionJson)
            WITH (IdPartida bigint '$.idPartidaPresupuesto', IdCompromisoDetalle bigint '$.idCompromisoDetalle', Monto decimal(18,4) '$.monto');
        IF EXISTS (SELECT IdPartida FROM @Lineas GROUP BY IdPartida HAVING COUNT(*) > 1)
            THROW 52009, N'La distribución admite una imputación por partida.', 1;

        EXEC dbo.usp_Presupuesto_RegistrarOperacion @IdOperacion, 'ImputarCompra', @Motivo;
        DECLARE @Fecha date, @Moneda nvarchar(10), @Total decimal(18,4), @Producto int, @Presentacion int, @Proveedor int;
        SELECT @Fecha = FechaCompra, @Moneda = Moneda, @Total = PrecioTotal, @Producto = IdProducto,
            @Presentacion = IdPresentacionProducto, @Proveedor = IdProveedor
        FROM dbo.Compras WITH (UPDLOCK,HOLDLOCK) WHERE IdCompra = @IdCompra;
        IF @Fecha IS NULL THROW 52004, N'La compra no existe.', 1;
        IF EXISTS (SELECT 1 FROM dbo.vw_ComprasImputadasPresupuesto WHERE IdCompra = @IdCompra)
            THROW 52009, N'La compra ya fue imputada. Revierta su distribución antes de registrarla nuevamente.', 1;
        IF (SELECT SUM(Monto) FROM @Lineas) <> @Total
            THROW 52000, N'La distribución debe coincidir exactamente con el importe total de la compra.', 1;
        IF EXISTS
        (
            SELECT 1 FROM @Lineas AS l LEFT JOIN dbo.PartidasPresupuesto AS p ON p.IdPartidaPresupuesto = l.IdPartida
            LEFT JOIN dbo.Presupuestos AS b ON b.IdPresupuesto = p.IdPresupuesto AND b.Estado = 'Aprobado'
                AND b.Moneda = @Moneda AND @Fecha BETWEEN b.FechaInicio AND b.FechaFin
            WHERE b.IdPresupuesto IS NULL
        )
            THROW 52010, N'Las partidas deben estar aprobadas y cubrir la fecha y la moneda de la compra.', 1;
        IF EXISTS
        (
            SELECT 1 FROM @Lineas AS l LEFT JOIN dbo.CompromisosCompraDetalle AS d ON d.IdCompromisoDetalle = l.IdCompromisoDetalle
                AND d.IdPartidaPresupuesto = l.IdPartida
            LEFT JOIN dbo.CompromisosCompra AS c ON c.IdCompromisoCompra = d.IdCompromisoCompra AND c.Estado = 'Abierto'
                AND c.Moneda = @Moneda AND c.FechaCompromiso <= @Fecha
            LEFT JOIN dbo.ProformasProveedorDetalle AS o ON o.IdProformaProveedorDetalle = d.IdProformaProveedorDetalle
                AND o.IdProducto = @Producto AND o.IdPresentacionProducto = @Presentacion
            LEFT JOIN dbo.ProformasProveedor AS proforma ON proforma.IdProformaProveedor = o.IdProformaProveedor
                AND proforma.IdProveedor = @Proveedor
            WHERE l.IdCompromisoDetalle IS NOT NULL AND (c.IdCompromisoCompra IS NULL
                OR (d.IdProformaProveedorDetalle IS NOT NULL AND proforma.IdProformaProveedor IS NULL))
        )
            THROW 52010, N'El compromiso debe estar abierto y corresponder a la partida y a la compra.', 1;

        DECLARE @Aplicaciones table (IdPartida bigint, IdCompromisoDetalle bigint NULL, Monto decimal(18,4),
            Liberado decimal(18,4), Excede bit);
        INSERT @Aplicaciones
        SELECT l.IdPartida, l.IdCompromisoDetalle, l.Monto, a.Liberado,
            CASE WHEN l.Monto > a.Liberado AND l.Monto - a.Liberado > s.Disponible THEN 1 ELSE 0 END
        FROM @Lineas AS l JOIN dbo.vw_SaldosPresupuesto AS s ON s.IdPartidaPresupuesto = l.IdPartida
        LEFT JOIN dbo.vw_SaldosCompromisoCompra AS d ON d.IdCompromisoDetalle = l.IdCompromisoDetalle
        CROSS APPLY (SELECT CASE WHEN d.Pendiente IS NULL THEN 0 WHEN l.Monto < d.Pendiente THEN l.Monto ELSE d.Pendiente END AS Liberado) AS a;
        IF @MotivoExceso IS NULL AND EXISTS (SELECT 1 FROM @Aplicaciones WHERE Excede = 1)
            THROW 52010, N'La compra supera el presupuesto. Documente el motivo del exceso.', 1;

        INSERT dbo.MovimientosPresupuesto (IdOperacion, IdPartidaPresupuesto, Tipo, CambioAprobado, CambioComprometido,
            CambioEjecutado, IdCompromisoDetalle, IdCompra, MotivoExceso)
        SELECT @IdOperacion, IdPartida, 'Compra', 0, -Liberado, Monto, IdCompromisoDetalle, @IdCompra,
            CASE WHEN Excede = 1 THEN @MotivoExceso END FROM @Aplicaciones;
        IF @TranInicial = 0 COMMIT;
    END TRY
    BEGIN CATCH
        IF XACT_STATE() <> 0 AND @TranInicial = 0 ROLLBACK;
        ELSE IF XACT_STATE() = 1 ROLLBACK TRANSACTION Presupuesto;
        THROW;
    END CATCH;
END;
