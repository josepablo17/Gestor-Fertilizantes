
CREATE   PROCEDURE dbo.usp_Proforma_CrearRevision @IdProformaProveedor int,@IdNuevaProforma int OUTPUT AS
BEGIN
 SET NOCOUNT ON; SET XACT_ABORT ON;
 DECLARE @TranInicial int=@@TRANCOUNT;
 IF @TranInicial=0 BEGIN TRANSACTION; ELSE SAVE TRANSACTION RevisionProforma;
 BEGIN TRY
  DECLARE @Destinatario bigint,@Documento bigint,@Importacion bigint,@Version int;
  SELECT @Destinatario=IdSolicitudCotizacionProveedor FROM dbo.ProformasProveedor WHERE IdProformaProveedor=@IdProformaProveedor;
  IF @Destinatario IS NULL THROW 52004,N'Cotizacion no existe.',1;
  SELECT @Destinatario=IdSolicitudCotizacionProveedor FROM dbo.SolicitudesCotizacionProveedor WITH(UPDLOCK,HOLDLOCK) WHERE IdSolicitudCotizacionProveedor=@Destinatario;
  SELECT @Documento=IdDocumentoOrigen,@Importacion=IdImportacionDocumento,@Version=VersionRespuesta FROM dbo.ProformasProveedor WITH(UPDLOCK,HOLDLOCK)
  WHERE IdProformaProveedor=@IdProformaProveedor AND Estado IN('Validada','Reemplazada','Cancelada');
  IF @Version IS NULL THROW 52010,N'Solo se revisa una respuesta finalizada.',1;
  IF EXISTS(SELECT 1 FROM dbo.ProformasProveedor WHERE IdSolicitudCotizacionProveedor=@Destinatario AND VersionRespuesta>@Version) THROW 52009,N'Ya existe una revision posterior.',1;
  DECLARE @Cabecera nvarchar(max)=(SELECT NumeroProforma AS numeroProforma,FechaProforma AS fechaProforma,FechaVencimiento AS fechaVencimiento,DiasCredito AS diasCredito,
  TipoDocumento AS tipoDocumento,Moneda AS moneda,NombreProveedorPdf AS nombreProveedorPdf,NombreNegocio AS nombreNegocio,RazonSocial AS razonSocial,Cedula AS cedula,
  Telefono AS telefono,Vendedor AS vendedor,Subtotal AS subtotal,Descuento AS descuento,IVA AS iva,Total AS total,OtrosCargos AS otrosCargos,
  JSON_QUERY(DatosProveedorOriginalJson) AS datosProveedorOriginal,JSON_QUERY(DatosClienteOriginalJson) AS datosClienteOriginal,
  CondicionesPago AS condicionesPago,CondicionesEntrega AS condicionesEntrega,Observaciones AS observaciones FROM dbo.ProformasProveedor
  WHERE IdProformaProveedor=@IdProformaProveedor FOR JSON PATH,INCLUDE_NULL_VALUES,WITHOUT_ARRAY_WRAPPER);
  DECLARE @Lineas nvarchar(max)=(SELECT IdSolicitudCotizacionDetalle AS idSolicitudDetalle,NumeroLineaDocumento AS numeroLinea,CodigoProveedor AS codigo,DescripcionProveedor AS descripcion,
  IdProducto AS idProducto,IdPresentacionProducto AS idPresentacionProducto,Cantidad AS cantidadEmpaques,PrecioUnitario AS precioUnitario,DescuentoPorcentaje AS descuentoPorcentaje,
  TotalLinea AS totalLinea,TipoOferta AS tipoOferta,EstadoOferta AS estadoOferta,NombreProductoOriginal AS nombreProductoOriginal,MarcaOriginal AS marcaOriginal,
  PresentacionOriginal AS presentacionOriginal,ContenidoEmpaqueOriginal AS contenidoEmpaqueOriginal,IdUnidadMedidaOriginal AS idUnidadMedidaOriginal,
  CodigoUnidadOriginal AS codigoUnidadOriginal,TipoBaseOriginal AS tipoBaseOriginal,FactorConversionOriginal AS factorConversionOriginal,
  ContenidoNormalizadoOriginal AS contenidoNormalizadoOriginal,DescuentoMonto AS descuentoMonto,ImpuestoMonto AS impuestoMonto,BaseTotalLinea AS baseTotalLinea,
  MotivoAlternativa AS motivoAlternativa,ObservacionValidacion AS observacion FROM dbo.ProformasProveedorDetalle WHERE IdProformaProveedor=@IdProformaProveedor
  ORDER BY IdProformaProveedorDetalle FOR JSON PATH,INCLUDE_NULL_VALUES);
  EXEC dbo.usp_Proforma_GuardarBorrador @Destinatario,@Documento,@Importacion,@Cabecera,@Lineas,@IdNuevaProforma OUTPUT;
  IF @TranInicial=0 COMMIT;
 END TRY BEGIN CATCH
  IF XACT_STATE()<>0 AND @TranInicial=0 ROLLBACK; ELSE IF XACT_STATE()=1 ROLLBACK TRANSACTION RevisionProforma;
  THROW;
 END CATCH;
END;

GO
