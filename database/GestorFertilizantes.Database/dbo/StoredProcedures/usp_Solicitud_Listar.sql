
CREATE   PROCEDURE dbo.usp_Solicitud_Listar
 @Estado varchar(20)=NULL,@Buscar nvarchar(50)=NULL,@Pagina int=1,@TamanoPagina int=50
AS
BEGIN
 SET NOCOUNT ON;
 IF @Pagina IS NULL OR @Pagina<1 OR @TamanoPagina IS NULL OR @TamanoPagina NOT BETWEEN 1 AND 200 THROW 52000,N'Paginacion invalida.',1;
 SELECT s.*,COUNT_BIG(*) OVER() AS TotalRegistros,
 (SELECT COUNT(*) FROM dbo.SolicitudesCotizacionDetalle d WHERE d.IdSolicitudCotizacion=s.IdSolicitudCotizacion) AS CantidadLineas,
 (SELECT COUNT(*) FROM dbo.SolicitudesCotizacionProveedor p WHERE p.IdSolicitudCotizacion=s.IdSolicitudCotizacion) AS CantidadProveedores
 FROM dbo.SolicitudesCotizacion s WHERE (@Estado IS NULL OR s.Estado=@Estado) AND (@Buscar IS NULL OR s.NumeroSolicitud LIKE N'%'+@Buscar+N'%')
 ORDER BY s.FechaCreacion DESC,s.IdSolicitudCotizacion DESC OFFSET CONVERT(bigint,@Pagina-1)*@TamanoPagina ROWS FETCH NEXT @TamanoPagina ROWS ONLY;
END;

GO
