
CREATE   PROCEDURE dbo.usp_Documento_ObtenerPorId @IdDocumento bigint AS
BEGIN
 SET NOCOUNT ON;
 IF NOT EXISTS(SELECT 1 FROM dbo.Documentos WHERE IdDocumento=@IdDocumento) THROW 52004,N'Documento no existe.',1;
 SELECT * FROM dbo.Documentos WHERE IdDocumento=@IdDocumento;
END;

GO
