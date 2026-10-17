SET NOCOUNT ON;
SELECT DB_NAME() AS BaseDatos,CAST(SERVERPROPERTY('ServerName') AS nvarchar(128)) AS Servidor,
 CAST((SELECT value FROM sys.extended_properties WHERE class=0 AND name=N'GestorFertilizantes.SchemaVersion') AS nvarchar(100)) AS VersionEsquema;
SELECT N'Tablas de negocio' AS Concepto,COUNT(*) AS Cantidad FROM sys.tables WHERE is_ms_shipped=0 AND name<>N'sysdiagrams'
UNION ALL SELECT N'Claves primarias',COUNT(*) FROM sys.key_constraints WHERE type='PK' AND parent_object_id<>OBJECT_ID(N'dbo.sysdiagrams')
UNION ALL SELECT N'Claves foraneas',COUNT(*) FROM sys.foreign_keys
UNION ALL SELECT N'CHECK',COUNT(*) FROM sys.check_constraints
UNION ALL SELECT N'Indices no hipoteticos',COUNT(*) FROM sys.indexes WHERE index_id>0 AND is_hypothetical=0 AND object_id IN(SELECT object_id FROM sys.tables WHERE is_ms_shipped=0 AND name<>N'sysdiagrams')
UNION ALL SELECT N'Triggers de negocio',COUNT(*) FROM sys.triggers WHERE is_ms_shipped=0
UNION ALL SELECT N'Restricciones deshabilitadas o no confiables',(SELECT COUNT(*) FROM sys.check_constraints WHERE is_disabled=1 OR is_not_trusted=1)+(SELECT COUNT(*) FROM sys.foreign_keys WHERE is_disabled=1 OR is_not_trusted=1);
SELECT t.name AS Tabla,SUM(p.rows) AS Filas FROM sys.tables t JOIN sys.partitions p ON p.object_id=t.object_id AND p.index_id IN(0,1)
WHERE t.is_ms_shipped=0 AND t.name<>N'sysdiagrams' GROUP BY t.name ORDER BY t.name;
IF (SELECT COUNT_BIG(*) FROM dbo.Productos)<>14 OR (SELECT COUNT_BIG(*) FROM dbo.Proveedores)<>9
 OR (SELECT COUNT_BIG(*) FROM dbo.PresentacionesProducto)<>8 OR (SELECT COUNT_BIG(*) FROM dbo.UnidadesMedida)<>5
 THROW 51990,N'Los conteos originales de catalogo cambiaron; revisar antes de dar por terminada la migracion.',1;
IF EXISTS(SELECT 1 FROM dbo.SolicitudesCotizacion) OR EXISTS(SELECT 1 FROM dbo.ProformasProveedor)
 OR EXISTS(SELECT 1 FROM dbo.Documentos) OR EXISTS(SELECT 1 FROM dbo.ImportacionesDocumento) OR EXISTS(SELECT 1 FROM dbo.CambiosCotizacion)
 THROW 51991,N'Hay filas de trabajo o de prueba no esperadas.',1;
IF EXISTS(SELECT 1 FROM sys.foreign_keys WHERE is_disabled=1 OR is_not_trusted=1)
 OR EXISTS(SELECT 1 FROM sys.check_constraints WHERE is_disabled=1 OR is_not_trusted=1)
 THROW 51992,N'Existen restricciones sin comprobar.',1;
SELECT N'Catalogos originales conservados; pruebas revertidas; restricciones confiables' AS Verificacion,N'OK' AS Resultado;
