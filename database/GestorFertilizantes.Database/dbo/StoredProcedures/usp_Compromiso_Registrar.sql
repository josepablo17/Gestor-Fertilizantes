CREATE PROCEDURE dbo.usp_Compromiso_Registrar @FechaCompromiso date, @Moneda nvarchar(10), @DistribucionJson nvarchar(max),
    @IdOperacion uniqueidentifier, @Motivo nvarchar(500), @IdCompromisoCompra bigint OUTPUT, @IdSolicitudCotizacion bigint = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;
    DECLARE @TranInicial int = @@TRANCOUNT;
    IF @TranInicial = 0 BEGIN TRANSACTION; ELSE SAVE TRANSACTION Presupuesto;
    BEGIN TRY
        SET @Moneda = UPPER(TRIM(@Moneda));
        IF @FechaCompromiso IS NULL OR @Moneda IS NULL OR @Moneda NOT IN ('CRC','USD')
            THROW 52000, N'Indique fecha y moneda CRC o USD para el compromiso.', 1;
        EXEC dbo.usp_Presupuesto_ValidarLineas @DistribucionJson, N'idPartidaPresupuesto', N'idProformaProveedorDetalle';
        DECLARE @Lineas table (IdPartida bigint, IdOferta bigint NULL, Monto decimal(18,4));
        INSERT @Lineas SELECT IdPartida, IdOferta, Monto FROM OPENJSON(@DistribucionJson)
            WITH (IdPartida bigint '$.idPartidaPresupuesto', IdOferta bigint '$.idProformaProveedorDetalle', Monto decimal(18,4) '$.monto');
        IF EXISTS (SELECT IdPartida, IdOferta FROM @Lineas GROUP BY IdPartida, IdOferta HAVING COUNT(*) > 1)
            THROW 52009, N'La oferta se repite dentro de la misma partida.', 1;
        IF EXISTS (SELECT 1 FROM @Lineas WHERE (@IdSolicitudCotizacion IS NULL AND IdOferta IS NOT NULL)
            OR (@IdSolicitudCotizacion IS NOT NULL AND IdOferta IS NULL))
            THROW 52000, N'Los compromisos desde una solicitud requieren una oferta por renglón.', 1;

        EXEC dbo.usp_Presupuesto_RegistrarOperacion @IdOperacion, 'Reservar', @Motivo;
        IF EXISTS
        (
            SELECT 1 FROM @Lineas AS l LEFT JOIN dbo.PartidasPresupuesto AS p ON p.IdPartidaPresupuesto = l.IdPartida
            LEFT JOIN dbo.Presupuestos AS b ON b.IdPresupuesto = p.IdPresupuesto AND b.Estado = 'Aprobado'
                AND b.Moneda = @Moneda AND @FechaCompromiso BETWEEN b.FechaInicio AND b.FechaFin
            WHERE b.IdPresupuesto IS NULL
        )
            THROW 52010, N'Las partidas deben estar aprobadas y cubrir la fecha y la moneda del compromiso.', 1;
        IF @IdSolicitudCotizacion IS NOT NULL AND EXISTS
        (
            SELECT 1 FROM @Lineas AS l LEFT JOIN dbo.vw_OfertasValidadasVigentes AS o
                ON o.IdProformaProveedorDetalle = l.IdOferta AND o.IdSolicitudCotizacion = @IdSolicitudCotizacion
                AND o.Moneda = @Moneda AND @FechaCompromiso BETWEEN o.FechaProforma AND o.FechaVencimiento
            WHERE o.IdProformaProveedorDetalle IS NULL
        )
            THROW 52010, N'Seleccione ofertas cotizadas, revisadas, vigentes y de la misma solicitud y moneda.', 1;
        IF EXISTS
        (
            SELECT 1 FROM (SELECT IdPartida, SUM(Monto) AS Monto FROM @Lineas GROUP BY IdPartida) AS l
            JOIN dbo.vw_SaldosPresupuesto AS s ON s.IdPartidaPresupuesto = l.IdPartida
            WHERE l.Monto > s.Disponible
        )
            THROW 52010, N'El compromiso supera el saldo disponible de una o más partidas.', 1;

        INSERT dbo.CompromisosCompra (IdSolicitudCotizacion, FechaCompromiso, Moneda, IdOperacionCreacion)
        VALUES (@IdSolicitudCotizacion, @FechaCompromiso, @Moneda, @IdOperacion);
        SET @IdCompromisoCompra = CONVERT(bigint,SCOPE_IDENTITY());
        INSERT dbo.CompromisosCompraDetalle (IdCompromisoCompra, IdPartidaPresupuesto, IdProformaProveedorDetalle, MontoReservado)
        SELECT @IdCompromisoCompra, IdPartida, CONVERT(int,IdOferta), Monto FROM @Lineas;
        INSERT dbo.MovimientosPresupuesto (IdOperacion, IdPartidaPresupuesto, Tipo, CambioAprobado, CambioComprometido,
            CambioEjecutado, IdCompromisoDetalle)
        SELECT @IdOperacion, IdPartidaPresupuesto, 'Reserva', 0, MontoReservado, 0, IdCompromisoDetalle
        FROM dbo.CompromisosCompraDetalle WHERE IdCompromisoCompra = @IdCompromisoCompra;
        IF @TranInicial = 0 COMMIT;
    END TRY
    BEGIN CATCH
        IF XACT_STATE() <> 0 AND @TranInicial = 0 ROLLBACK;
        ELSE IF XACT_STATE() = 1 ROLLBACK TRANSACTION Presupuesto;
        THROW;
    END CATCH;
END;
