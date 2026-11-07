DECLARE @FincaNorte int, @FincaSur int, @Rubro int, @PresNorte bigint, @PresSur bigint;
DECLARE @PartidaNorte bigint, @PartidaSur bigint, @CompromisoPres bigint, @CompraPres bigint;
DECLARE @OperacionPres uniqueidentifier = NEWID(), @FechaPres date = '20261016', @DistribucionPres nvarchar(max);
EXEC dbo.usp_Finca_Guardar N'P-NORTE',N'Finca Norte de prueba',@FincaNorte OUTPUT;
EXEC dbo.usp_Finca_Guardar N'P-SUR',N'Finca Sur de prueba',@FincaSur OUTPUT;
EXEC dbo.usp_RubroPresupuesto_Guardar N'P-FERT',N'Fertilizantes de prueba',@Rubro OUTPUT;

SET @DistribucionPres = (SELECT @Rubro AS idRubroPresupuesto, 1000000 AS monto FOR JSON PATH);
EXEC dbo.usp_Presupuesto_Crear N'Ciclo Norte','20260101','20261231',N'CRC',@DistribucionPres,
    @OperacionPres,N'Plan de prueba',@PresNorte OUTPUT,@FincaNorte;
SET @OperacionPres = NEWID();
SET @DistribucionPres = (SELECT @Rubro AS idRubroPresupuesto, 500000 AS monto FOR JSON PATH);
EXEC dbo.usp_Presupuesto_Crear N'Ciclo Sur','20260101','20261231',N'CRC',@DistribucionPres,
    @OperacionPres,N'Plan de prueba',@PresSur OUTPUT,@FincaSur;

SET @OperacionPres = NEWID();
EXEC dbo.usp_Presupuesto_Aprobar @PresNorte,@OperacionPres,N'Plan aprobado';
SET @OperacionPres = NEWID();
EXEC dbo.usp_Presupuesto_Aprobar @PresSur,@OperacionPres,N'Plan aprobado';
SELECT @PartidaNorte = IdPartidaPresupuesto FROM dbo.PartidasPresupuesto WHERE IdPresupuesto = @PresNorte;
SELECT @PartidaSur = IdPartidaPresupuesto FROM dbo.PartidasPresupuesto WHERE IdPresupuesto = @PresSur;
SET @OperacionPres = NEWID();
