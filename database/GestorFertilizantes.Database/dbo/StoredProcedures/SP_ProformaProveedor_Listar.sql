
CREATE   PROCEDURE dbo.SP_ProformaProveedor_Listar
 @IdSolicitudCotizacion bigint=NULL,@IdProveedor int=NULL,@Estado varchar(30)=NULL,@Pagina int=1,@TamanoPagina int=50
AS
BEGIN
 SET NOCOUNT ON;

 IF @Pagina IS NULL OR @Pagina<1 OR @TamanoPagina IS NULL OR @TamanoPagina NOT BETWEEN 1 AND 200 THROW 52000,N'Paginacion invalida.',1;
 SELECT p.*,pr.Nombre AS NombreProveedor,s.NumeroSolicitud,s.VersionSolicitud,COUNT_BIG(*) OVER() AS TotalRegistros
 FROM dbo.ProformasProveedor p JOIN dbo.Proveedores pr ON pr.IdProveedor=p.IdProveedor JOIN dbo.SolicitudesCotizacion s ON s.IdSolicitudCotizacion=p.IdSolicitudCotizacion
 WHERE (@IdSolicitudCotizacion IS NULL OR p.IdSolicitudCotizacion=@IdSolicitudCotizacion) AND (@IdProveedor IS NULL OR p.IdProveedor=@IdProveedor) AND (@Estado IS NULL OR p.Estado=@Estado)
 ORDER BY p.FechaCreacion DESC,p.IdProformaProveedor DESC OFFSET CONVERT(bigint,@Pagina-1)*@TamanoPagina ROWS FETCH NEXT @TamanoPagina ROWS ONLY;
END;

GO
