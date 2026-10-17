IF DB_NAME()<>N'BDComprasFertilizantes' OR @@TRANCOUNT=0 THROW 52010,N'La instalacion requiere la base correcta y una transaccion externa.',1;
DECLARE @Objeto nvarchar(517);
DECLARE Modulos CURSOR LOCAL FAST_FORWARD FOR
 SELECT QUOTENAME(OBJECT_SCHEMA_NAME(o.object_id))+N'.'+QUOTENAME(o.name)
 FROM sys.objects o WHERE o.schema_id=SCHEMA_ID(N'dbo') AND o.type IN('P','V','FN','TR') AND o.is_ms_shipped=0
 AND o.name NOT IN(N'sp_alterdiagram',N'sp_creatediagram',N'sp_dropdiagram',N'sp_helpdiagramdefinition',N'sp_helpdiagrams',N'sp_renamediagram',N'sp_upgraddiagrams',N'fn_diagramobjects');
OPEN Modulos; FETCH NEXT FROM Modulos INTO @Objeto;
WHILE @@FETCH_STATUS=0
BEGIN
 EXEC sys.sp_refreshsqlmodule @name=@Objeto;
 FETCH NEXT FROM Modulos INTO @Objeto;
END;
CLOSE Modulos; DEALLOCATE Modulos;
IF EXISTS(SELECT 1 FROM sys.check_constraints WHERE is_disabled=1 OR is_not_trusted=1)
OR EXISTS(SELECT 1 FROM sys.foreign_keys WHERE is_disabled=1 OR is_not_trusted=1)
THROW 52010,N'Hay restricciones deshabilitadas o sin verificar.',1;
IF EXISTS(SELECT 1 FROM sys.extended_properties WHERE class=0 AND name=N'GestorFertilizantes.ProceduresVersion')
 EXEC sys.sp_updateextendedproperty @name=N'GestorFertilizantes.ProceduresVersion',@value=N'2026-10-16-procedimientos-v2';
ELSE EXEC sys.sp_addextendedproperty @name=N'GestorFertilizantes.ProceduresVersion',@value=N'2026-10-16-procedimientos-v2';
SELECT CAST(value AS nvarchar(100)) AS VersionProcedimientos FROM sys.extended_properties WHERE class=0 AND name=N'GestorFertilizantes.ProceduresVersion';
SELECT COUNT(*) AS ProcedimientosNegocio FROM sys.procedures WHERE schema_id=SCHEMA_ID(N'dbo') AND is_ms_shipped=0
AND name NOT IN(N'sp_alterdiagram',N'sp_creatediagram',N'sp_dropdiagram',N'sp_helpdiagramdefinition',N'sp_helpdiagrams',N'sp_renamediagram',N'sp_upgraddiagrams');
GO
