
CREATE   PROCEDURE dbo.usp_Proforma_ComprobarJson @CabeceraJson nvarchar(max)=NULL,@LineasJson nvarchar(max)=NULL AS
BEGIN
 SET NOCOUNT ON;
 DECLARE @H table(Clave nvarchar(4000) COLLATE Latin1_General_100_BIN2,Valor nvarchar(max),Tipo int);
 DECLARE @L table(Linea int,Clave nvarchar(4000) COLLATE Latin1_General_100_BIN2,Valor nvarchar(max),Tipo int);
 IF @CabeceraJson IS NOT NULL BEGIN
  IF ISJSON(@CabeceraJson,OBJECT)<>1 THROW 52000,N'Cabecera JSON debe ser objeto.',1;
  INSERT @H SELECT [key],[value],[type] FROM OPENJSON(@CabeceraJson);
 END;
 IF @LineasJson IS NOT NULL BEGIN
  IF ISJSON(@LineasJson,ARRAY)<>1 THROW 52000,N'Lineas JSON debe ser arreglo.',1;
  IF EXISTS(SELECT 1 FROM OPENJSON(@LineasJson) WHERE [type]<>5) THROW 52000,N'Cada linea debe ser un objeto JSON.',1;
  INSERT @L SELECT CONVERT(int,j.[key]),v.[key],v.[value],v.[type] FROM OPENJSON(@LineasJson)j CROSS APPLY OPENJSON(j.[value])v;
 END;
 IF EXISTS(SELECT Clave FROM @H GROUP BY Clave HAVING COUNT(*)>1) OR EXISTS(SELECT Linea,Clave FROM @L GROUP BY Linea,Clave HAVING COUNT(*)>1)
 THROW 52000,N'El JSON contiene propiedades duplicadas.',1;
 IF EXISTS(SELECT 1 FROM @H WHERE Clave NOT IN(N'numeroProforma',N'tipoDocumento',N'nombreProveedorPdf',N'nombreNegocio',N'razonSocial',N'cedula',N'telefono',N'vendedor',N'condicionesPago',N'condicionesEntrega',N'observaciones',N'moneda',N'subtotal',N'descuento',N'iva',N'total',N'otrosCargos',N'fechaProforma',N'fechaVencimiento',N'diasCredito',N'datosProveedorOriginal',N'datosClienteOriginal'))
 OR EXISTS(SELECT 1 FROM @L WHERE Clave NOT IN(N'codigo',N'descripcion',N'tipoOferta',N'estadoOferta',N'nombreProductoOriginal',N'marcaOriginal',N'presentacionOriginal',N'codigoUnidadOriginal',N'tipoBaseOriginal',N'baseTotalLinea',N'motivoAlternativa',N'observacion',N'cantidadEmpaques',N'precioUnitario',N'descuentoPorcentaje',N'totalLinea',N'contenidoEmpaqueOriginal',N'factorConversionOriginal',N'contenidoNormalizadoOriginal',N'descuentoMonto',N'impuestoMonto',N'idSolicitudDetalle',N'numeroLinea',N'idProducto',N'idPresentacionProducto',N'idUnidadMedidaOriginal')) THROW 52000,N'Propiedad JSON desconocida; respete nombres camelCase del contrato.',1;
 IF EXISTS(SELECT 1 FROM @H WHERE Clave=N'numeroProforma' AND Tipo<>0 AND (Tipo<>1 OR DATALENGTH(Valor)>100)) THROW 52000,N'numeroProforma: texto o longitud invalida.',1;
 IF EXISTS(SELECT 1 FROM @H WHERE Clave=N'tipoDocumento' AND Tipo<>0 AND (Tipo<>1 OR DATALENGTH(Valor)>100)) THROW 52000,N'tipoDocumento: texto o longitud invalida.',1;
 IF EXISTS(SELECT 1 FROM @H WHERE Clave=N'nombreProveedorPdf' AND Tipo<>0 AND (Tipo<>1 OR DATALENGTH(Valor)>400)) THROW 52000,N'nombreProveedorPdf: texto o longitud invalida.',1;
 IF EXISTS(SELECT 1 FROM @H WHERE Clave=N'nombreNegocio' AND Tipo<>0 AND (Tipo<>1 OR DATALENGTH(Valor)>500)) THROW 52000,N'nombreNegocio: texto o longitud invalida.',1;
 IF EXISTS(SELECT 1 FROM @H WHERE Clave=N'razonSocial' AND Tipo<>0 AND (Tipo<>1 OR DATALENGTH(Valor)>500)) THROW 52000,N'razonSocial: texto o longitud invalida.',1;
 IF EXISTS(SELECT 1 FROM @H WHERE Clave=N'cedula' AND Tipo<>0 AND (Tipo<>1 OR DATALENGTH(Valor)>100)) THROW 52000,N'cedula: texto o longitud invalida.',1;
 IF EXISTS(SELECT 1 FROM @H WHERE Clave=N'telefono' AND Tipo<>0 AND (Tipo<>1 OR DATALENGTH(Valor)>100)) THROW 52000,N'telefono: texto o longitud invalida.',1;
 IF EXISTS(SELECT 1 FROM @H WHERE Clave=N'vendedor' AND Tipo<>0 AND (Tipo<>1 OR DATALENGTH(Valor)>300)) THROW 52000,N'vendedor: texto o longitud invalida.',1;
 IF EXISTS(SELECT 1 FROM @H WHERE Clave=N'condicionesPago' AND Tipo<>0 AND (Tipo<>1 OR DATALENGTH(Valor)>2000)) THROW 52000,N'condicionesPago: texto o longitud invalida.',1;
 IF EXISTS(SELECT 1 FROM @H WHERE Clave=N'condicionesEntrega' AND Tipo<>0 AND (Tipo<>1 OR DATALENGTH(Valor)>2000)) THROW 52000,N'condicionesEntrega: texto o longitud invalida.',1;
 IF EXISTS(SELECT 1 FROM @H WHERE Clave=N'observaciones' AND Tipo<>0 AND (Tipo<>1 OR DATALENGTH(Valor)>4000)) THROW 52000,N'observaciones: texto o longitud invalida.',1;
 IF EXISTS(SELECT 1 FROM @H WHERE Clave=N'moneda' AND Tipo<>0 AND (Tipo<>1 OR DATALENGTH(Valor)>6)) THROW 52000,N'moneda: texto o longitud invalida.',1;
 IF EXISTS(SELECT 1 FROM @L WHERE Clave=N'codigo' AND Tipo<>0 AND (Tipo<>1 OR DATALENGTH(Valor)>200)) THROW 52000,N'codigo: texto o longitud invalida.',1;
 IF EXISTS(SELECT 1 FROM @L WHERE Clave=N'descripcion' AND Tipo<>0 AND (Tipo<>1 OR DATALENGTH(Valor)>1000)) THROW 52000,N'descripcion: texto o longitud invalida.',1;
 IF EXISTS(SELECT 1 FROM @L WHERE Clave=N'tipoOferta' AND Tipo<>0 AND (Tipo<>1 OR DATALENGTH(Valor)>40)) THROW 52000,N'tipoOferta: texto o longitud invalida.',1;
 IF EXISTS(SELECT 1 FROM @L WHERE Clave=N'estadoOferta' AND Tipo<>0 AND (Tipo<>1 OR DATALENGTH(Valor)>40)) THROW 52000,N'estadoOferta: texto o longitud invalida.',1;
 IF EXISTS(SELECT 1 FROM @L WHERE Clave=N'nombreProductoOriginal' AND Tipo<>0 AND (Tipo<>1 OR DATALENGTH(Valor)>300)) THROW 52000,N'nombreProductoOriginal: texto o longitud invalida.',1;
 IF EXISTS(SELECT 1 FROM @L WHERE Clave=N'marcaOriginal' AND Tipo<>0 AND (Tipo<>1 OR DATALENGTH(Valor)>300)) THROW 52000,N'marcaOriginal: texto o longitud invalida.',1;
 IF EXISTS(SELECT 1 FROM @L WHERE Clave=N'presentacionOriginal' AND Tipo<>0 AND (Tipo<>1 OR DATALENGTH(Valor)>300)) THROW 52000,N'presentacionOriginal: texto o longitud invalida.',1;
 IF EXISTS(SELECT 1 FROM @L WHERE Clave=N'codigoUnidadOriginal' AND Tipo<>0 AND (Tipo<>1 OR DATALENGTH(Valor)>40)) THROW 52000,N'codigoUnidadOriginal: texto o longitud invalida.',1;
 IF EXISTS(SELECT 1 FROM @L WHERE Clave=N'tipoBaseOriginal' AND Tipo<>0 AND (Tipo<>1 OR DATALENGTH(Valor)>40)) THROW 52000,N'tipoBaseOriginal: texto o longitud invalida.',1;
 IF EXISTS(SELECT 1 FROM @L WHERE Clave=N'baseTotalLinea' AND Tipo<>0 AND (Tipo<>1 OR DATALENGTH(Valor)>60)) THROW 52000,N'baseTotalLinea: texto o longitud invalida.',1;
 IF EXISTS(SELECT 1 FROM @L WHERE Clave=N'motivoAlternativa' AND Tipo<>0 AND (Tipo<>1 OR DATALENGTH(Valor)>2000)) THROW 52000,N'motivoAlternativa: texto o longitud invalida.',1;
 IF EXISTS(SELECT 1 FROM @L WHERE Clave=N'observacion' AND Tipo<>0 AND (Tipo<>1 OR DATALENGTH(Valor)>2000)) THROW 52000,N'observacion: texto o longitud invalida.',1;
 IF EXISTS(SELECT 1 FROM @H WHERE Clave=N'subtotal' AND Tipo<>0 AND (Tipo NOT IN(1,2) OR TRY_CONVERT(decimal(18,4),Valor) IS NULL OR TRY_CONVERT(decimal(38,18),Valor)<>TRY_CONVERT(decimal(18,4),Valor) OR (CHARINDEX(N'.',Valor)>0 AND SUBSTRING(Valor,CHARINDEX(N'.',Valor)+5,4000) LIKE N'%[^0]%'))) THROW 52000,N'subtotal: importe fuera de precision decimal(18,4).',1;
 IF EXISTS(SELECT 1 FROM @H WHERE Clave=N'descuento' AND Tipo<>0 AND (Tipo NOT IN(1,2) OR TRY_CONVERT(decimal(18,4),Valor) IS NULL OR TRY_CONVERT(decimal(38,18),Valor)<>TRY_CONVERT(decimal(18,4),Valor) OR (CHARINDEX(N'.',Valor)>0 AND SUBSTRING(Valor,CHARINDEX(N'.',Valor)+5,4000) LIKE N'%[^0]%'))) THROW 52000,N'descuento: importe fuera de precision decimal(18,4).',1;
 IF EXISTS(SELECT 1 FROM @H WHERE Clave=N'iva' AND Tipo<>0 AND (Tipo NOT IN(1,2) OR TRY_CONVERT(decimal(18,4),Valor) IS NULL OR TRY_CONVERT(decimal(38,18),Valor)<>TRY_CONVERT(decimal(18,4),Valor) OR (CHARINDEX(N'.',Valor)>0 AND SUBSTRING(Valor,CHARINDEX(N'.',Valor)+5,4000) LIKE N'%[^0]%'))) THROW 52000,N'iva: importe fuera de precision decimal(18,4).',1;
 IF EXISTS(SELECT 1 FROM @H WHERE Clave=N'total' AND Tipo<>0 AND (Tipo NOT IN(1,2) OR TRY_CONVERT(decimal(18,4),Valor) IS NULL OR TRY_CONVERT(decimal(38,18),Valor)<>TRY_CONVERT(decimal(18,4),Valor) OR (CHARINDEX(N'.',Valor)>0 AND SUBSTRING(Valor,CHARINDEX(N'.',Valor)+5,4000) LIKE N'%[^0]%'))) THROW 52000,N'total: importe fuera de precision decimal(18,4).',1;
 IF EXISTS(SELECT 1 FROM @H WHERE Clave=N'otrosCargos' AND Tipo<>0 AND (Tipo NOT IN(1,2) OR TRY_CONVERT(decimal(18,4),Valor) IS NULL OR TRY_CONVERT(decimal(38,18),Valor)<>TRY_CONVERT(decimal(18,4),Valor) OR (CHARINDEX(N'.',Valor)>0 AND SUBSTRING(Valor,CHARINDEX(N'.',Valor)+5,4000) LIKE N'%[^0]%'))) THROW 52000,N'otrosCargos: importe fuera de precision decimal(18,4).',1;
 IF EXISTS(SELECT 1 FROM @L WHERE Clave=N'cantidadEmpaques' AND Tipo<>0 AND (Tipo NOT IN(1,2) OR TRY_CONVERT(decimal(18,4),Valor) IS NULL OR TRY_CONVERT(decimal(38,18),Valor)<>TRY_CONVERT(decimal(18,4),Valor) OR (CHARINDEX(N'.',Valor)>0 AND SUBSTRING(Valor,CHARINDEX(N'.',Valor)+5,4000) LIKE N'%[^0]%'))) THROW 52000,N'cantidadEmpaques: numero fuera de precision admitida.',1;
 IF EXISTS(SELECT 1 FROM @L WHERE Clave=N'precioUnitario' AND Tipo<>0 AND (Tipo NOT IN(1,2) OR TRY_CONVERT(decimal(18,6),Valor) IS NULL OR TRY_CONVERT(decimal(38,18),Valor)<>TRY_CONVERT(decimal(18,6),Valor) OR (CHARINDEX(N'.',Valor)>0 AND SUBSTRING(Valor,CHARINDEX(N'.',Valor)+7,4000) LIKE N'%[^0]%'))) THROW 52000,N'precioUnitario: numero fuera de precision admitida.',1;
 IF EXISTS(SELECT 1 FROM @L WHERE Clave=N'descuentoPorcentaje' AND Tipo<>0 AND (Tipo NOT IN(1,2) OR TRY_CONVERT(decimal(18,2),Valor) IS NULL OR TRY_CONVERT(decimal(38,18),Valor)<>TRY_CONVERT(decimal(18,2),Valor) OR (CHARINDEX(N'.',Valor)>0 AND SUBSTRING(Valor,CHARINDEX(N'.',Valor)+3,4000) LIKE N'%[^0]%'))) THROW 52000,N'descuentoPorcentaje: numero fuera de precision admitida.',1;
 IF EXISTS(SELECT 1 FROM @L WHERE Clave=N'totalLinea' AND Tipo<>0 AND (Tipo NOT IN(1,2) OR TRY_CONVERT(decimal(18,4),Valor) IS NULL OR TRY_CONVERT(decimal(38,18),Valor)<>TRY_CONVERT(decimal(18,4),Valor) OR (CHARINDEX(N'.',Valor)>0 AND SUBSTRING(Valor,CHARINDEX(N'.',Valor)+5,4000) LIKE N'%[^0]%'))) THROW 52000,N'totalLinea: numero fuera de precision admitida.',1;
 IF EXISTS(SELECT 1 FROM @L WHERE Clave=N'contenidoEmpaqueOriginal' AND Tipo<>0 AND (Tipo NOT IN(1,2) OR TRY_CONVERT(decimal(18,6),Valor) IS NULL OR TRY_CONVERT(decimal(38,18),Valor)<>TRY_CONVERT(decimal(18,6),Valor) OR (CHARINDEX(N'.',Valor)>0 AND SUBSTRING(Valor,CHARINDEX(N'.',Valor)+7,4000) LIKE N'%[^0]%'))) THROW 52000,N'contenidoEmpaqueOriginal: numero fuera de precision admitida.',1;
 IF EXISTS(SELECT 1 FROM @L WHERE Clave=N'factorConversionOriginal' AND Tipo<>0 AND (Tipo NOT IN(1,2) OR TRY_CONVERT(decimal(18,6),Valor) IS NULL OR TRY_CONVERT(decimal(38,18),Valor)<>TRY_CONVERT(decimal(18,6),Valor) OR (CHARINDEX(N'.',Valor)>0 AND SUBSTRING(Valor,CHARINDEX(N'.',Valor)+7,4000) LIKE N'%[^0]%'))) THROW 52000,N'factorConversionOriginal: numero fuera de precision admitida.',1;
 IF EXISTS(SELECT 1 FROM @L WHERE Clave=N'contenidoNormalizadoOriginal' AND Tipo<>0 AND (Tipo NOT IN(1,2) OR TRY_CONVERT(decimal(18,6),Valor) IS NULL OR TRY_CONVERT(decimal(38,18),Valor)<>TRY_CONVERT(decimal(18,6),Valor) OR (CHARINDEX(N'.',Valor)>0 AND SUBSTRING(Valor,CHARINDEX(N'.',Valor)+7,4000) LIKE N'%[^0]%'))) THROW 52000,N'contenidoNormalizadoOriginal: numero fuera de precision admitida.',1;
 IF EXISTS(SELECT 1 FROM @L WHERE Clave=N'descuentoMonto' AND Tipo<>0 AND (Tipo NOT IN(1,2) OR TRY_CONVERT(decimal(18,4),Valor) IS NULL OR TRY_CONVERT(decimal(38,18),Valor)<>TRY_CONVERT(decimal(18,4),Valor) OR (CHARINDEX(N'.',Valor)>0 AND SUBSTRING(Valor,CHARINDEX(N'.',Valor)+5,4000) LIKE N'%[^0]%'))) THROW 52000,N'descuentoMonto: numero fuera de precision admitida.',1;
 IF EXISTS(SELECT 1 FROM @L WHERE Clave=N'impuestoMonto' AND Tipo<>0 AND (Tipo NOT IN(1,2) OR TRY_CONVERT(decimal(18,4),Valor) IS NULL OR TRY_CONVERT(decimal(38,18),Valor)<>TRY_CONVERT(decimal(18,4),Valor) OR (CHARINDEX(N'.',Valor)>0 AND SUBSTRING(Valor,CHARINDEX(N'.',Valor)+5,4000) LIKE N'%[^0]%'))) THROW 52000,N'impuestoMonto: numero fuera de precision admitida.',1;
 IF EXISTS(SELECT 1 FROM @L WHERE Clave IN(N'idSolicitudDetalle',N'numeroLinea',N'idProducto',N'idPresentacionProducto',N'idUnidadMedidaOriginal') AND Tipo<>0
 AND (Tipo NOT IN(1,2) OR TRY_CONVERT(bigint,Valor) IS NULL OR TRY_CONVERT(bigint,Valor)<=0)) THROW 52000,N'Identificador o numero de linea invalido.',1;
 IF EXISTS(SELECT 1 FROM @H WHERE Clave IN(N'fechaProforma',N'fechaVencimiento') AND Tipo<>0 AND (Tipo<>1 OR LEN(Valor)<>10 OR TRY_CONVERT(date,Valor,23) IS NULL)) THROW 52000,N'Fecha debe tener formato yyyy-MM-dd.',1;
 IF EXISTS(SELECT 1 FROM @H WHERE Clave=N'diasCredito' AND Tipo<>0 AND (TRY_CONVERT(int,Valor) IS NULL OR TRY_CONVERT(int,Valor)<0)) THROW 52000,N'Dias de credito invalidos.',1;
 IF EXISTS(SELECT 1 FROM @H WHERE Clave IN(N'datosProveedorOriginal',N'datosClienteOriginal') AND Tipo NOT IN(0,5)) THROW 52000,N'Los datos originales de las partes deben ser objetos JSON.',1;
END;

GO
