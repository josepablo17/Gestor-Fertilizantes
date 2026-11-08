CREATE PROCEDURE dbo.usp_Compra_RegistrarDocumento
 @IdProveedor int,@FechaCompra date,@Moneda nvarchar(10),@LineasJson nvarchar(max),@IdOperacion uniqueidentifier,
 @NumeroFactura nvarchar(100)=NULL,@Observaciones nvarchar(500)=NULL
AS
BEGIN
 SET NOCOUNT ON; SET XACT_ABORT ON;
 DECLARE @TranInicial int=@@TRANCOUNT;
 IF @TranInicial=0 BEGIN TRANSACTION; ELSE SAVE TRANSACTION CompraDocumento;
 BEGIN TRY
 EXEC dbo.usp_Presupuesto_Bloquear;
 SET @Moneda=UPPER(TRIM(@Moneda));
 SET @NumeroFactura=NULLIF(TRIM(@NumeroFactura),N'');
 SET @Observaciones=NULLIF(TRIM(@Observaciones),N'');
 IF @IdOperacion IS NULL OR @IdOperacion='00000000-0000-0000-0000-000000000000'
   OR @FechaCompra IS NULL OR @FechaCompra>CONVERT(date,GETDATE()) OR @Moneda IS NULL OR @Moneda NOT IN(N'CRC',N'USD')
   THROW 52000,N'Indique una operación válida, fecha no futura y moneda CRC o USD.',1;
 IF ISJSON(@LineasJson,ARRAY)<>1 OR @LineasJson IS NULL THROW 52000,N'Los productos deben enviarse como una lista.',1;
 IF EXISTS(SELECT 1 FROM OPENJSON(@LineasJson) WHERE [type]<>5)
   OR EXISTS(SELECT 1 FROM OPENJSON(@LineasJson) j CROSS APPLY OPENJSON(j.value) d
     WHERE d.[key]=N'imputacionPresupuesto' AND d.[type] NOT IN(0,5))
   THROW 52000,N'Los renglones y sus distribuciones presupuestarias deben ser objetos.',1;
 DECLARE @Lineas table(Numero int PRIMARY KEY,IdProducto int,IdPresentacionProducto int,Cantidad decimal(28,8),
   Precio decimal(28,8),Observaciones nvarchar(max),Imputacion nvarchar(max));
 INSERT @Lineas
 SELECT CONVERT(int,j.[key])+1,l.IdProducto,l.IdPresentacionProducto,l.Cantidad,l.Precio,l.Observaciones,l.Imputacion
 FROM OPENJSON(@LineasJson) j CROSS APPLY OPENJSON(j.value) WITH
 (IdProducto int '$.idProducto',IdPresentacionProducto int '$.idPresentacionProducto',Cantidad decimal(28,8) '$.cantidadComprada',
 Precio decimal(28,8) '$.precioTotal',Observaciones nvarchar(max) '$.observaciones',Imputacion nvarchar(max) '$.imputacionPresupuesto' AS JSON) l;
 IF (SELECT COUNT(*) FROM @Lineas) NOT BETWEEN 1 AND 100 OR EXISTS(SELECT 1 FROM @Lineas WHERE
   IdProducto IS NULL OR IdProducto<=0 OR IdPresentacionProducto IS NULL OR IdPresentacionProducto<=0 OR
   Cantidad IS NULL OR Cantidad<=0 OR Cantidad<>ROUND(Cantidad,0) OR Cantidad>99999999999999 OR
   Precio IS NULL OR Precio<=0 OR Precio>99999999999999.9999 OR Precio<>ROUND(Precio,4) OR LEN(Observaciones)>500)
   THROW 52000,N'Indique entre 1 y 100 productos con empaques enteros e importes positivos de hasta cuatro decimales.',1;
 DECLARE @Contenido nvarchar(max)=(SELECT @IdProveedor AS proveedor,@FechaCompra AS fecha,@Moneda AS moneda,
   @NumeroFactura AS factura,@Observaciones AS observaciones,JSON_QUERY(@LineasJson) AS lineas FOR JSON PATH,WITHOUT_ARRAY_WRAPPER);
 DECLARE @Huella binary(32)=HASHBYTES('SHA2_256',@Contenido),@Id bigint,@Anterior binary(32);
 SELECT @Id=IdCompraCabecera,@Anterior=HuellaSolicitud FROM dbo.ComprasCabecera WITH(UPDLOCK,HOLDLOCK) WHERE IdOperacion=@IdOperacion;
 IF @Id IS NOT NULL
 BEGIN
   IF @Anterior<>@Huella THROW 52009,N'La operación ya se utilizó con otros datos. Recargue la compra antes de continuar.',1;
 END
 ELSE
 BEGIN
   INSERT dbo.ComprasCabecera(IdProveedor,FechaCompra,Moneda,NumeroFactura,Observaciones,IdOperacion,HuellaSolicitud)
   VALUES(@IdProveedor,@FechaCompra,@Moneda,@NumeroFactura,@Observaciones,@IdOperacion,@Huella);
   SET @Id=CONVERT(bigint,SCOPE_IDENTITY());
   DECLARE @Numero int=1,@Producto int,@Presentacion int,@Cantidad decimal(18,4),@Precio decimal(18,4),
     @Nota nvarchar(500),@Imputacion nvarchar(max),@Distribucion nvarchar(max),@Motivo nvarchar(500),@Exceso nvarchar(500),@OperacionLinea uniqueidentifier;
   WHILE @Numero<=(SELECT COUNT(*) FROM @Lineas)
   BEGIN
     SELECT @Producto=IdProducto,@Presentacion=IdPresentacionProducto,@Cantidad=Cantidad,@Precio=Precio,
       @Nota=Observaciones,@Imputacion=Imputacion FROM @Lineas WHERE Numero=@Numero;
     SET @Distribucion=JSON_QUERY(@Imputacion,'$.distribucion');
     SET @Motivo=JSON_VALUE(@Imputacion,'$.motivo');
     SET @Exceso=JSON_VALUE(@Imputacion,'$.motivoExceso');
     IF @Imputacion IS NOT NULL AND @Distribucion IS NULL THROW 52000,N'Falta la distribución presupuestaria del renglón.',1;
     SET @OperacionLinea=CONVERT(uniqueidentifier,SUBSTRING(HASHBYTES('SHA2_256',CONCAT(CONVERT(nvarchar(36),@IdOperacion),N':',@Numero)),1,16));
     EXEC dbo.SP_Compra_Insertar @Producto,@IdProveedor,@Presentacion,@FechaCompra,@Cantidad,@Precio,@Moneda,@Nota,
       @Distribucion,@OperacionLinea,@Motivo,@Exceso,@Id,@Numero,@DevolverResultado=0;
     SET @Numero+=1;
   END;
 END;
 IF @TranInicial=0 COMMIT;
 SELECT @Id AS IdCompraCabecera;
 END TRY BEGIN CATCH
 IF XACT_STATE()<>0 AND @TranInicial=0 ROLLBACK;
 ELSE IF XACT_STATE()=1 ROLLBACK TRANSACTION CompraDocumento;
 THROW;
 END CATCH;
END;
GO
