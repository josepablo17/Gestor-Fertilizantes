CREATE PROCEDURE dbo.usp_Presupuesto_EditarBorrador
 @IdPresupuesto bigint,@Version uniqueidentifier,@Nombre nvarchar(150),@FechaInicio date,@FechaFin date,
 @Moneda nvarchar(10),@PartidasJson nvarchar(max),@IdOperacion uniqueidentifier,@IdFinca int=NULL
AS
BEGIN
 SET NOCOUNT ON; SET XACT_ABORT ON;
 DECLARE @TranInicial int=@@TRANCOUNT;
 IF @TranInicial=0 BEGIN TRANSACTION; ELSE SAVE TRANSACTION EditarPresupuesto;
 BEGIN TRY
 EXEC dbo.usp_Presupuesto_Bloquear;
 IF NOT EXISTS(SELECT 1 FROM dbo.Presupuestos WHERE IdPresupuesto=@IdPresupuesto)
   THROW 52004,N'El presupuesto no existe.',1;
 IF NOT EXISTS(SELECT 1 FROM dbo.Presupuestos WHERE IdPresupuesto=@IdPresupuesto AND Estado='Borrador')
   THROW 52010,N'Solo se pueden editar los datos iniciales de un presupuesto en borrador.',1;
 IF @Version IS NULL OR NOT EXISTS(SELECT 1 FROM dbo.Presupuestos WHERE IdPresupuesto=@IdPresupuesto
     AND COALESCE(IdOperacionEdicion,IdOperacionCreacion)=@Version)
   THROW 52009,N'El borrador cambió. Recargue el presupuesto antes de guardar.',1;
 IF @IdOperacion IS NULL OR @IdOperacion='00000000-0000-0000-0000-000000000000'
   THROW 52000,N'Indique un identificador de operación válido.',1;
 SET @Moneda=UPPER(TRIM(@Moneda));
 IF NULLIF(TRIM(@Nombre),N'') IS NULL OR @FechaInicio IS NULL OR @FechaFin IS NULL OR @FechaFin<@FechaInicio
   OR @Moneda IS NULL OR @Moneda NOT IN(N'CRC',N'USD')
   THROW 52000,N'Indique nombre, período y moneda CRC o USD.',1;
 EXEC dbo.usp_Presupuesto_ValidarLineas @PartidasJson,N'idRubroPresupuesto';
 DECLARE @Partidas table(IdRubro int PRIMARY KEY,Monto decimal(18,4));
 IF EXISTS(SELECT IdRubro FROM OPENJSON(@PartidasJson) WITH(IdRubro bigint '$.idRubroPresupuesto') GROUP BY IdRubro HAVING COUNT(*)>1)
   THROW 52009,N'El rubro se repite en el presupuesto.',1;
 IF EXISTS(SELECT 1 FROM OPENJSON(@PartidasJson) WITH(IdRubro bigint '$.idRubroPresupuesto') WHERE IdRubro>2147483647)
   THROW 52000,N'El identificador de rubro está fuera del rango permitido.',1;
 INSERT @Partidas SELECT IdRubro,Monto FROM OPENJSON(@PartidasJson)
   WITH(IdRubro int '$.idRubroPresupuesto',Monto decimal(18,4) '$.monto');
 IF @IdFinca IS NOT NULL AND NOT EXISTS(SELECT 1 FROM dbo.Fincas WITH(HOLDLOCK) WHERE IdFinca=@IdFinca AND Activa=1)
   THROW 52000,N'Seleccione una finca activa.',1;
 IF EXISTS(SELECT 1 FROM @Partidas p LEFT JOIN dbo.RubrosPresupuesto r WITH(HOLDLOCK)
   ON r.IdRubroPresupuesto=p.IdRubro AND r.Activo=1 WHERE r.IdRubroPresupuesto IS NULL)
   THROW 52000,N'Use rubros activos para todas las partidas.',1;
 IF EXISTS(SELECT 1 FROM dbo.PartidasPresupuesto p JOIN dbo.MovimientosPresupuesto m ON m.IdPartidaPresupuesto=p.IdPartidaPresupuesto
     WHERE p.IdPresupuesto=@IdPresupuesto)
   OR EXISTS(SELECT 1 FROM dbo.PartidasPresupuesto p JOIN dbo.CompromisosCompraDetalle c ON c.IdPartidaPresupuesto=p.IdPartidaPresupuesto
     WHERE p.IdPresupuesto=@IdPresupuesto)
   THROW 52010,N'El borrador contiene movimientos o compromisos y debe revisarse antes de modificarlo.',1;
 DECLARE @Motivo nvarchar(500)=CONCAT(N'Edición de borrador del presupuesto #',@IdPresupuesto,N'.');
 EXEC dbo.usp_Presupuesto_RegistrarOperacion @IdOperacion,'EditarBorrador',@Motivo;
 UPDATE p SET MontoInicial=n.Monto FROM dbo.PartidasPresupuesto p JOIN @Partidas n ON n.IdRubro=p.IdRubroPresupuesto
   WHERE p.IdPresupuesto=@IdPresupuesto;
 DELETE p FROM dbo.PartidasPresupuesto p WHERE p.IdPresupuesto=@IdPresupuesto
   AND NOT EXISTS(SELECT 1 FROM @Partidas n WHERE n.IdRubro=p.IdRubroPresupuesto);
 INSERT dbo.PartidasPresupuesto(IdPresupuesto,IdRubroPresupuesto,MontoInicial)
 SELECT @IdPresupuesto,n.IdRubro,n.Monto FROM @Partidas n WHERE NOT EXISTS
   (SELECT 1 FROM dbo.PartidasPresupuesto p WHERE p.IdPresupuesto=@IdPresupuesto AND p.IdRubroPresupuesto=n.IdRubro);
 UPDATE dbo.Presupuestos SET Nombre=TRIM(@Nombre),IdFinca=@IdFinca,FechaInicio=@FechaInicio,FechaFin=@FechaFin,
   Moneda=@Moneda,IdOperacionEdicion=@IdOperacion WHERE IdPresupuesto=@IdPresupuesto;
 IF @TranInicial=0 COMMIT;
 END TRY BEGIN CATCH
 IF XACT_STATE()<>0 AND @TranInicial=0 ROLLBACK;
 ELSE IF XACT_STATE()=1 ROLLBACK TRANSACTION EditarPresupuesto;
 THROW;
 END CATCH;
END;
GO
