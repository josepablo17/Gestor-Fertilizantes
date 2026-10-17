-- Consulta de evidencia; no modifica datos ni version.
SELECT name,CAST(value AS nvarchar(100)) AS value FROM sys.extended_properties WHERE class=0 AND name LIKE N'GestorFertilizantes.%';
SELECT t.name AS Tabla,SUM(p.rows) AS Filas FROM sys.tables t JOIN sys.partitions p ON p.object_id=t.object_id AND p.index_id IN(0,1)
WHERE t.is_ms_shipped=0 AND t.name<>N'sysdiagrams' GROUP BY t.name ORDER BY t.name;
SELECT (SELECT COUNT(*) FROM sys.check_constraints WHERE is_disabled=1 OR is_not_trusted=1) AS ChecksSinVerificar,
(SELECT COUNT(*) FROM sys.foreign_keys WHERE is_disabled=1 OR is_not_trusted=1) AS FKsSinVerificar;
