
CREATE   PROCEDURE dbo.usp_Importacion_ListarPorDocumento @IdDocumento bigint AS
BEGIN
 SET NOCOUNT ON;
 SELECT * FROM dbo.ImportacionesDocumento WHERE IdDocumento=@IdDocumento ORDER BY FechaImportacion DESC,IdImportacionDocumento DESC;
END;

GO
