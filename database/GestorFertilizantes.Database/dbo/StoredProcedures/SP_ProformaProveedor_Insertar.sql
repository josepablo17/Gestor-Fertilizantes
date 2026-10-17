
CREATE   PROCEDURE dbo.SP_ProformaProveedor_Insertar
 @IdSolicitudCotizacionProveedor bigint,@IdDocumentoOrigen bigint,@IdImportacionDocumento bigint=NULL,@CabeceraJson nvarchar(max),@LineasJson nvarchar(max),@IdProformaProveedor int OUTPUT
AS
BEGIN
 SET NOCOUNT ON;

 EXEC dbo.usp_Proforma_GuardarBorrador @IdSolicitudCotizacionProveedor,@IdDocumentoOrigen,@IdImportacionDocumento,@CabeceraJson,@LineasJson,@IdProformaProveedor OUTPUT;
END;

GO
