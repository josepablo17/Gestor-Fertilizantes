
CREATE   PROCEDURE dbo.SP_CompraAutomatica_BuscarProveedor
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
