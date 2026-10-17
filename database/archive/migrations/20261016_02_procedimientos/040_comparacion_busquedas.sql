CREATE OR ALTER PROCEDURE dbo.usp_Cotizaciones_CompararSolicitud
 @IdSolicitudCotizacion bigint,@Moneda varchar(10),@BaseTotalLinea varchar(30),@FechaReferencia date,
 @IncluirAlternativas bit=1,@IdSolicitudCotizacionDetalle bigint=NULL,@TipoBase nvarchar(20)=NULL
AS
BEGIN
 SET NOCOUNT ON;
 IF NOT EXISTS(SELECT 1 FROM dbo.SolicitudesCotizacion WHERE IdSolicitudCotizacion=@IdSolicitudCotizacion) THROW 52004,N'Solicitud no existe.',1;
 IF @Moneda IS NULL OR LEN(@Moneda)<>3 OR @Moneda COLLATE Latin1_General_100_BIN2 LIKE '%[^A-Z]%'
 OR @BaseTotalLinea IS NULL OR @BaseTotalLinea NOT IN('Bruto','NetoSinImpuestos','ConImpuestos') OR @FechaReferencia IS NULL
 OR @IncluirAlternativas IS NULL THROW 52000,N'Indique moneda, base de importe y fecha de referencia de comparacion.',1;
 IF @TipoBase IS NOT NULL AND @TipoBase NOT IN('PESO','VOLUMEN','UNIDAD') THROW 52000,N'Dimension invalida.',1;
 IF @IdSolicitudCotizacionDetalle IS NOT NULL AND NOT EXISTS(SELECT 1 FROM dbo.SolicitudesCotizacionDetalle
 WHERE IdSolicitudCotizacionDetalle=@IdSolicitudCotizacionDetalle AND IdSolicitudCotizacion=@IdSolicitudCotizacion)
 THROW 52000,N'La linea no pertenece a la solicitud.',1;
 ;WITH Ultimas AS(
  SELECT p.*,ROW_NUMBER() OVER(PARTITION BY IdSolicitudCotizacionProveedor ORDER BY VersionRespuesta DESC) AS rn
  FROM dbo.ProformasProveedor p WHERE p.IdSolicitudCotizacion=@IdSolicitudCotizacion AND p.Estado='Validada'
 ),Datos AS(
 SELECT s.IdSolicitudCotizacionDetalle,s.NumeroLinea,s.NombreProductoOriginal AS ProductoSolicitado,s.MarcaOriginal AS MarcaSolicitada,
 s.PresentacionOriginal AS PresentacionSolicitada,s.TipoBaseOriginal AS TipoBaseSolicitado,s.CantidadEmpaquesSolicitada,
 CONVERT(decimal(28,6),s.CantidadEmpaquesSolicitada*s.ContenidoNormalizadoOriginal) AS ContenidoTotalSolicitado,
 sp.IdSolicitudCotizacionProveedor,sp.IdProveedor,pr.Nombre AS NombreProveedorActual,sp.Estado AS EstadoDestinatario,
 p.IdProformaProveedor,p.NumeroProforma,p.VersionRespuesta,p.FechaProforma,p.FechaVencimiento,p.Moneda,
 p.EstadoConciliacion,p.JustificacionConciliacion,p.Descuento AS DescuentoGlobalDocumento,p.IVA AS IVADocumento,
 p.OtrosCargos AS OtrosCargosDocumento,p.Total AS TotalDocumento,p.CondicionesPago,p.CondicionesEntrega,p.DatosProveedorOriginalJson,
 d.IdProformaProveedorDetalle,d.TipoOferta,d.EstadoOferta,d.NombreProductoOriginal AS ProductoOfrecido,d.MarcaOriginal AS MarcaOfrecida,
 d.PresentacionOriginal AS PresentacionOfrecida,d.Cantidad AS CantidadEmpaquesOfrecida,d.ContenidoNormalizadoOriginal,
 d.TipoBaseOriginal AS TipoBaseOfrecido,d.PrecioUnitario,d.TotalLinea,d.BaseTotalLinea,d.MotivoAlternativa,
 CONVERT(decimal(28,6),d.Cantidad*d.ContenidoNormalizadoOriginal) AS ContenidoTotalOfrecido,
 CASE WHEN p.IdProformaProveedor IS NULL THEN 'SinRespuestaValidada'
 WHEN d.IdProformaProveedorDetalle IS NULL THEN 'LineaSinCotizar'
 WHEN d.EstadoOferta<>'Cotizada' THEN d.EstadoOferta
 WHEN p.Moneda<>@Moneda THEN 'MonedaDistinta'
 WHEN d.BaseTotalLinea<>@BaseTotalLinea THEN 'BasePrecioDistinta'
 WHEN d.TipoBaseOriginal<>s.TipoBaseOriginal THEN 'DimensionDistinta'
 WHEN d.TipoOferta='Alternativa' AND @IncluirAlternativas=0 THEN 'AlternativaNoIncluida'
 WHEN d.IdProducto<>s.IdProducto AND NOT(po.IdProductoBase=ps.IdProductoBase AND b.ComparabilidadRevisada=1) THEN 'EquivalenciaNoRevisada'
 ELSE 'Comparable' END AS CondicionComparacion
 FROM dbo.SolicitudesCotizacionDetalle s JOIN dbo.SolicitudesCotizacionProveedor sp ON sp.IdSolicitudCotizacion=s.IdSolicitudCotizacion
 JOIN dbo.Proveedores pr ON pr.IdProveedor=sp.IdProveedor JOIN dbo.Productos ps ON ps.IdProducto=s.IdProducto
 LEFT JOIN Ultimas p ON p.IdSolicitudCotizacionProveedor=sp.IdSolicitudCotizacionProveedor AND p.rn=1
 LEFT JOIN dbo.ProformasProveedorDetalle d ON d.IdProformaProveedor=p.IdProformaProveedor AND d.IdSolicitudCotizacionDetalle=s.IdSolicitudCotizacionDetalle
 LEFT JOIN dbo.Productos po ON po.IdProducto=d.IdProducto LEFT JOIN dbo.ProductosBase b ON b.IdProductoBase=po.IdProductoBase
 WHERE s.IdSolicitudCotizacion=@IdSolicitudCotizacion AND (@IdSolicitudCotizacionDetalle IS NULL OR s.IdSolicitudCotizacionDetalle=@IdSolicitudCotizacionDetalle)
 AND (@TipoBase IS NULL OR s.TipoBaseOriginal=@TipoBase)
 ),Precios AS(
 SELECT *,CONVERT(bit,CASE WHEN CondicionComparacion='Comparable' THEN 1 ELSE 0 END) AS EsComparable,
 CASE WHEN CondicionComparacion='Comparable' THEN TRY_CONVERT(decimal(28,8),TotalLinea/NULLIF(ContenidoTotalOfrecido,0)) END AS PrecioPorUnidadBase,
 CONVERT(bit,CASE WHEN ContenidoTotalOfrecido>=ContenidoTotalSolicitado THEN 1 ELSE 0 END) AS CubreCantidadSolicitada,
 CONVERT(bit,CASE WHEN FechaVencimiento IS NULL THEN NULL WHEN FechaVencimiento>=@FechaReferencia THEN 1 ELSE 0 END) AS Vigente
 FROM Datos
 ),Minimos AS(
 SELECT *,MIN(PrecioPorUnidadBase) OVER(PARTITION BY IdSolicitudCotizacionDetalle) AS MenorPrecioPorUnidadBase,
 MIN(CASE WHEN CubreCantidadSolicitada=1 AND Vigente=1 THEN PrecioPorUnidadBase END) OVER(PARTITION BY IdSolicitudCotizacionDetalle) AS MenorPrecioConCoberturaYVigencia
 FROM Precios
 )
 SELECT *,CONVERT(bit,CASE WHEN EsComparable=1 AND PrecioPorUnidadBase=MenorPrecioPorUnidadBase THEN 1 ELSE 0 END) AS EsMenorPrecioUnitario,
 CONVERT(bit,CASE WHEN EsComparable=1 AND CubreCantidadSolicitada=1 AND Vigente=1 AND PrecioPorUnidadBase=MenorPrecioConCoberturaYVigencia THEN 1 ELSE 0 END) AS EsMenorPrecioConCoberturaYVigencia
 FROM Minimos ORDER BY NumeroLinea,CASE WHEN PrecioPorUnidadBase IS NULL THEN 1 ELSE 0 END,PrecioPorUnidadBase,IdProveedor,IdProformaProveedorDetalle;
END;
GO
/* Se conservan los numeros de las formulas. Esta funcion solo normaliza texto;
   no declara equivalencia comercial ni interpreta unidades o importes. */
CREATE OR ALTER FUNCTION dbo.ufn_NormalizarTextoCatalogo(@Texto nvarchar(1000)) RETURNS nvarchar(1000) AS
BEGIN
 DECLARE @Resultado nvarchar(1000)=UPPER(LTRIM(RTRIM(COALESCE(@Texto,N''))));
 SET @Resultado=TRANSLATE(@Resultado,N'-/(),',N'     ');
 WHILE CHARINDEX(N'  ',@Resultado)>0 SET @Resultado=REPLACE(@Resultado,N'  ',N' ');
 RETURN LTRIM(RTRIM(@Resultado));
END;
GO
CREATE OR ALTER PROCEDURE dbo.usp_Producto_BuscarCandidatos
 @Descripcion nvarchar(500),@IdProductoBase int=NULL,@IdMarca int=NULL
AS
BEGIN
 SET NOCOUNT ON;
 DECLARE @Texto nvarchar(1000)=dbo.ufn_NormalizarTextoCatalogo(@Descripcion);
 IF NULLIF(@Texto,N'') IS NULL THROW 52000,N'Descripcion vacia; requiere seleccion manual.',1;
 SELECT p.IdProducto,p.CodigoInterno,p.Nombre AS NombreProducto,p.IdProductoBase,p.IdMarca,m.Nombre AS Marca,b.FormulaDeclarada,
 CONVERT(bit,CASE WHEN dbo.ufn_NormalizarTextoCatalogo(p.Nombre)=@Texto THEN 1 ELSE 0 END) AS CoincidenciaExacta,
 COUNT(*) OVER() AS CantidadCandidatos
 FROM dbo.Productos p JOIN dbo.ProductosBase b ON b.IdProductoBase=p.IdProductoBase LEFT JOIN dbo.Marcas m ON m.IdMarca=p.IdMarca
 WHERE p.Activo=1 AND b.Activo=1 AND (p.IdMarca IS NULL OR m.Activo=1)
 AND (@IdProductoBase IS NULL OR p.IdProductoBase=@IdProductoBase) AND (@IdMarca IS NULL OR p.IdMarca=@IdMarca)
 AND (p.CodigoInterno=@Descripcion OR CHARINDEX(N' '+dbo.ufn_NormalizarTextoCatalogo(p.Nombre)+N' ',N' '+@Texto+N' ')>0)
 ORDER BY CoincidenciaExacta DESC,p.IdProducto;
END;
GO
CREATE OR ALTER PROCEDURE dbo.SP_CompraAutomatica_BuscarProducto @Descripcion nvarchar(500) AS
BEGIN
 SET NOCOUNT ON;
 DECLARE @C table(IdProducto int,CodigoInterno nvarchar(40),NombreProducto nvarchar(150),IdProductoBase int,IdMarca int,Marca nvarchar(150),FormulaDeclarada nvarchar(100),CoincidenciaExacta bit,CantidadCandidatos int);
 INSERT @C EXEC dbo.usp_Producto_BuscarCandidatos @Descripcion;
 IF (SELECT COUNT(*) FROM @C)>1 THROW 52009,N'Hay varios productos candidatos; requiere seleccion manual.',1;
 SELECT IdProducto,NombreProducto,IdProductoBase,IdMarca,Marca,CoincidenciaExacta,CantidadCandidatos FROM @C;
END;
GO
CREATE OR ALTER PROCEDURE dbo.SP_CompraAutomatica_BuscarPresentacion
 @IdProducto int,@Cantidad decimal(18,6),@IdUnidadMedida int
AS
BEGIN
 SET NOCOUNT ON;
 IF @Cantidad IS NULL OR @Cantidad<=0 THROW 52000,N'La cantidad de contenido debe ser explicita y positiva.',1;
 DECLARE @Factor decimal(18,6),@Tipo nvarchar(20);
 SELECT @Factor=FactorConversion,@Tipo=TipoBase FROM dbo.UnidadesMedida WHERE IdUnidadMedida=@IdUnidadMedida AND Activo=1;
 IF @Factor IS NULL THROW 52000,N'Unidad inexistente o inactiva. No se infiere desde texto ambiguo.',1;
 DECLARE @Normalizada decimal(18,6)=TRY_CONVERT(decimal(18,6),@Cantidad*@Factor);
 IF @Normalizada IS NULL OR @Normalizada<=0 THROW 52000,N'Contenido normalizado fuera de rango.',1;
 IF (SELECT COUNT(*) FROM dbo.PresentacionesProducto pp JOIN dbo.UnidadesMedida u ON u.IdUnidadMedida=pp.IdUnidadMedida
 WHERE pp.IdProducto=@IdProducto AND pp.Activo=1 AND u.Activo=1 AND u.TipoBase=@Tipo AND pp.CantidadNormalizada=@Normalizada)>1
 THROW 52009,N'Hay varias presentaciones con ese contenido; requiere seleccion manual.',1;
 SELECT pp.IdPresentacionProducto,pp.Descripcion AS NombrePresentacion,pp.Cantidad,pp.IdUnidadMedida,u.Codigo,u.TipoBase,pp.CantidadNormalizada
 FROM dbo.PresentacionesProducto pp JOIN dbo.Productos p ON p.IdProducto=pp.IdProducto AND p.Activo=1
 JOIN dbo.UnidadesMedida u ON u.IdUnidadMedida=pp.IdUnidadMedida AND u.Activo=1
 WHERE pp.IdProducto=@IdProducto AND pp.Activo=1 AND u.TipoBase=@Tipo AND pp.CantidadNormalizada=@Normalizada;
END;
GO
CREATE OR ALTER PROCEDURE dbo.SP_CompraAutomatica_BuscarProveedor
 @NombreNegocio nvarchar(200)=NULL,@RazonSocial nvarchar(200)=NULL,
 @IdentificacionFiscal nvarchar(50)=NULL,@PaisIdentificacion char(2)=NULL,@TipoIdentificacion nvarchar(30)=NULL
AS
BEGIN
 SET NOCOUNT ON;
 DECLARE @A nvarchar(1000)=dbo.ufn_NormalizarTextoCatalogo(@NombreNegocio),@B nvarchar(1000)=dbo.ufn_NormalizarTextoCatalogo(@RazonSocial);
 DECLARE @C table(IdProveedor int,NombreProveedor nvarchar(150));
 IF NULLIF(LTRIM(RTRIM(@IdentificacionFiscal)),N'') IS NOT NULL
 BEGIN
  IF @PaisIdentificacion IS NULL OR @TipoIdentificacion IS NULL THROW 52000,N'Indique pais y tipo para buscar por identificacion fiscal.',1;
  INSERT @C SELECT IdProveedor,Nombre FROM dbo.Proveedores WHERE Activo=1 AND IdentificacionFiscal=@IdentificacionFiscal AND PaisIdentificacion=@PaisIdentificacion AND TipoIdentificacion=@TipoIdentificacion;
 END ELSE BEGIN
  IF @A=N'' AND @B=N'' THROW 52000,N'El proveedor requiere identidad o nombre del emisor.',1;
  INSERT @C SELECT IdProveedor,Nombre FROM dbo.Proveedores WHERE Activo=1
  AND ((@A<>N'' AND dbo.ufn_NormalizarTextoCatalogo(Nombre)=@A) OR (@B<>N'' AND dbo.ufn_NormalizarTextoCatalogo(Nombre)=@B));
 END;
 IF (SELECT COUNT(*) FROM @C)>1 THROW 52009,N'El nombre corresponde a varios proveedores; requiere seleccion manual.',1;
 SELECT * FROM @C;
END;
GO
CREATE OR ALTER PROCEDURE dbo.SP_CompraAutomatica_InsertarEquivalencia
 @IdProveedor int,@CodigoProveedor nvarchar(100)=NULL,@DescripcionProveedor nvarchar(300),@IdProducto int,@IdPresentacionProducto int=NULL
AS
BEGIN
 SET NOCOUNT ON;
 IF NOT EXISTS(SELECT 1 FROM dbo.Proveedores WHERE IdProveedor=@IdProveedor AND Activo=1)
 OR NOT EXISTS(SELECT 1 FROM dbo.Productos WHERE IdProducto=@IdProducto AND Activo=1)
 THROW 52000,N'Proveedor o producto inexistente/inactivo.',1;
 IF @IdPresentacionProducto IS NOT NULL AND NOT EXISTS(SELECT 1 FROM dbo.PresentacionesProducto WHERE IdPresentacionProducto=@IdPresentacionProducto AND IdProducto=@IdProducto AND Activo=1)
 THROW 52000,N'La presentacion debe estar activa y pertenecer al producto.',1;
 IF NULLIF(LTRIM(RTRIM(@DescripcionProveedor)),N'') IS NULL THROW 52000,N'Descripcion de proveedor obligatoria.',1;
 INSERT dbo.CompraAutomaticaEquivalencias(IdProveedor,CodigoProveedor,DescripcionProveedor,IdProducto,IdPresentacionProducto)
 VALUES(@IdProveedor,NULLIF(LTRIM(RTRIM(@CodigoProveedor)),N''),LTRIM(RTRIM(@DescripcionProveedor)),@IdProducto,@IdPresentacionProducto);
 SELECT CONVERT(int,SCOPE_IDENTITY()) AS IdEquivalencia;
END;
GO
CREATE OR ALTER PROCEDURE dbo.usp_Equivalencia_Listar @IdProveedor int,@SoloActivos bit=1 AS
BEGIN
 SET NOCOUNT ON;
 SELECT e.*,p.Nombre AS NombreProducto,pp.Descripcion AS NombrePresentacion FROM dbo.CompraAutomaticaEquivalencias e
 JOIN dbo.Productos p ON p.IdProducto=e.IdProducto LEFT JOIN dbo.PresentacionesProducto pp ON pp.IdPresentacionProducto=e.IdPresentacionProducto
 WHERE e.IdProveedor=@IdProveedor AND (@SoloActivos=0 OR e.Activo=1) ORDER BY e.IdEquivalencia;
END;
GO
CREATE OR ALTER PROCEDURE dbo.usp_Equivalencia_Actualizar
 @IdEquivalencia int,@CodigoProveedor nvarchar(100)=NULL,@DescripcionProveedor nvarchar(300),@IdProducto int,@IdPresentacionProducto int=NULL
AS
BEGIN
 SET NOCOUNT ON;
 IF NOT EXISTS(SELECT 1 FROM dbo.CompraAutomaticaEquivalencias WHERE IdEquivalencia=@IdEquivalencia) THROW 52004,N'Equivalencia no existe.',1;
 IF NOT EXISTS(SELECT 1 FROM dbo.Productos WHERE IdProducto=@IdProducto AND Activo=1) THROW 52000,N'Producto inexistente o inactivo.',1;
 IF @IdPresentacionProducto IS NOT NULL AND NOT EXISTS(SELECT 1 FROM dbo.PresentacionesProducto WHERE IdPresentacionProducto=@IdPresentacionProducto AND IdProducto=@IdProducto AND Activo=1)
 THROW 52000,N'Presentacion incorrecta o inactiva.',1;
 UPDATE dbo.CompraAutomaticaEquivalencias SET CodigoProveedor=NULLIF(LTRIM(RTRIM(@CodigoProveedor)),N''),DescripcionProveedor=LTRIM(RTRIM(@DescripcionProveedor)),
 IdProducto=@IdProducto,IdPresentacionProducto=@IdPresentacionProducto,FechaModificacion=GETDATE() WHERE IdEquivalencia=@IdEquivalencia;
END;
GO
CREATE OR ALTER PROCEDURE dbo.usp_Equivalencia_CambiarActivo @IdEquivalencia int,@Activo bit AS
BEGIN
 SET NOCOUNT ON;
 IF @Activo IS NULL THROW 52000,N'Activo es obligatorio.',1;
 IF NOT EXISTS(SELECT 1 FROM dbo.CompraAutomaticaEquivalencias WHERE IdEquivalencia=@IdEquivalencia) THROW 52004,N'Equivalencia no existe.',1;
 UPDATE dbo.CompraAutomaticaEquivalencias SET Activo=@Activo,FechaModificacion=GETDATE() WHERE IdEquivalencia=@IdEquivalencia;
END;
GO
