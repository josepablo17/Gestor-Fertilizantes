
/* Operaciones transaccionales del nuevo contrato. La API debe adoptarlas. */
CREATE   PROCEDURE dbo.usp_Solicitud_Emitir @IdSolicitudCotizacion bigint AS
BEGIN
 SET NOCOUNT ON; SET XACT_ABORT ON;
 DECLARE @TranInicial int=@@TRANCOUNT;
 IF @TranInicial=0 BEGIN TRANSACTION; ELSE SAVE TRANSACTION EmitirSolicitud;
 BEGIN TRY
  IF NOT EXISTS(SELECT 1 FROM dbo.SolicitudesCotizacion WITH(UPDLOCK,HOLDLOCK)
  WHERE IdSolicitudCotizacion=@IdSolicitudCotizacion AND Estado='Borrador')
  THROW 51200,N'La solicitud no existe o ya no es borrador.',1;
  IF EXISTS(SELECT 1 FROM dbo.SolicitudesCotizacionDetalle d JOIN dbo.Productos p ON p.IdProducto=d.IdProducto
  JOIN dbo.ProductosBase b ON b.IdProductoBase=p.IdProductoBase LEFT JOIN dbo.Marcas m ON m.IdMarca=p.IdMarca
  JOIN dbo.PresentacionesProducto pp ON pp.IdPresentacionProducto=d.IdPresentacionProducto JOIN dbo.UnidadesMedida u ON u.IdUnidadMedida=pp.IdUnidadMedida
  WHERE d.IdSolicitudCotizacion=@IdSolicitudCotizacion AND (p.Activo=0 OR b.Activo=0 OR pp.Activo=0 OR u.Activo=0 OR (p.IdMarca IS NOT NULL AND m.Activo=0)))
  THROW 52000,N'La solicitud utiliza catalogos inactivos.',1;
  IF EXISTS(SELECT 1 FROM dbo.SolicitudesCotizacionProveedor sp JOIN dbo.Proveedores p ON p.IdProveedor=sp.IdProveedor WHERE sp.IdSolicitudCotizacion=@IdSolicitudCotizacion AND p.Activo=0)
  THROW 52000,N'La solicitud contiene destinatarios inactivos.',1;
  UPDATE dbo.SolicitudesCotizacion SET Estado='Emitida',FechaEmision=SYSUTCDATETIME(),FechaModificacion=SYSUTCDATETIME()
  WHERE IdSolicitudCotizacion=@IdSolicitudCotizacion;
  IF @TranInicial=0 COMMIT;
 END TRY BEGIN CATCH
  IF XACT_STATE()<>0 AND @TranInicial=0 ROLLBACK;
  ELSE IF XACT_STATE()=1 ROLLBACK TRANSACTION EmitirSolicitud;
  THROW;
 END CATCH;
END;

GO
