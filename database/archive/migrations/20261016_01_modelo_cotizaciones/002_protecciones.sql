/* Protecciones de documento e historia. Ejecutar junto con 001, atomicamente. */
CREATE OR ALTER TRIGGER dbo.TR_Documentos_Inmutables ON dbo.Documentos AFTER UPDATE,DELETE AS
BEGIN
 SET NOCOUNT ON;
 IF EXISTS(SELECT 1 FROM deleted) THROW 51100,N'El registro del archivo original es inmutable. Registre otro documento.',1;
END;
GO
CREATE OR ALTER TRIGGER dbo.TR_Importaciones_Inmutables ON dbo.ImportacionesDocumento AFTER UPDATE,DELETE AS
BEGIN
 SET NOCOUNT ON;
 IF EXISTS(SELECT 1 FROM deleted) THROW 51101,N'Una extraccion es evidencia inmutable. Registre un nuevo intento.',1;
END;
GO
CREATE OR ALTER TRIGGER dbo.TR_CambiosCotizacion_Inmutables ON dbo.CambiosCotizacion AFTER UPDATE,DELETE AS
BEGIN
 SET NOCOUNT ON;
 IF EXISTS(SELECT 1 FROM deleted) THROW 51102,N'El historial de ajustes no se puede editar ni eliminar.',1;
END;
GO
CREATE OR ALTER TRIGGER dbo.TR_Productos_Marca ON dbo.Productos AFTER INSERT,UPDATE AS
BEGIN
 SET NOCOUNT ON;
 IF TRIGGER_NESTLEVEL(OBJECT_ID(N'dbo.TR_Productos_Marca'))>1 RETURN;
 IF EXISTS(SELECT 1 FROM inserted WHERE IdMarca IS NULL AND NULLIF(LTRIM(RTRIM(Marca)),N'') IS NOT NULL)
  THROW 51103,N'La marca debe identificarse en el catalogo Marcas mediante IdMarca.',1;
 UPDATE p SET Marca=m.Nombre FROM dbo.Productos p JOIN inserted i ON i.IdProducto=p.IdProducto
 LEFT JOIN dbo.Marcas m ON m.IdMarca=i.IdMarca
 WHERE ISNULL(p.Marca,N'')<>ISNULL(m.Nombre,N'');
END;
GO
CREATE OR ALTER TRIGGER dbo.TR_Marcas_SincronizarEtiqueta ON dbo.Marcas AFTER UPDATE AS
BEGIN
 SET NOCOUNT ON;
 IF UPDATE(Nombre)
 UPDATE p SET Marca=m.Nombre FROM dbo.Productos p JOIN inserted m ON m.IdMarca=p.IdMarca
 WHERE ISNULL(p.Marca,N'')<>m.Nombre;
END;
GO
CREATE OR ALTER TRIGGER dbo.TR_Presentaciones_ContenidoHistorico ON dbo.PresentacionesProducto AFTER UPDATE AS
BEGIN
 SET NOCOUNT ON;
 IF EXISTS(SELECT 1 FROM inserted i JOIN deleted d ON d.IdPresentacionProducto=i.IdPresentacionProducto
 WHERE (i.IdProducto<>d.IdProducto OR i.Cantidad<>d.Cantidad OR i.IdUnidadMedida<>d.IdUnidadMedida OR i.CantidadNormalizada<>d.CantidadNormalizada)
 AND (EXISTS(SELECT 1 FROM dbo.SolicitudesCotizacionDetalle s WHERE s.IdPresentacionProducto=i.IdPresentacionProducto)
 OR EXISTS(SELECT 1 FROM dbo.ProformasProveedorDetalle p WHERE p.IdPresentacionProducto=i.IdPresentacionProducto)
 OR EXISTS(SELECT 1 FROM dbo.Compras c WHERE c.IdPresentacionProducto=i.IdPresentacionProducto)))
 THROW 51104,N'La presentacion ya forma parte de documentos. Cree otra para cambiar su contenido, unidad o producto.',1;
END;
GO
CREATE OR ALTER TRIGGER dbo.TR_Unidades_ConversionHistorica ON dbo.UnidadesMedida AFTER UPDATE AS
BEGIN
 SET NOCOUNT ON;
 IF EXISTS(SELECT 1 FROM inserted i JOIN deleted d ON d.IdUnidadMedida=i.IdUnidadMedida
 WHERE (i.Codigo<>d.Codigo OR i.TipoBase<>d.TipoBase OR i.FactorConversion<>d.FactorConversion OR i.EsUnidadBase<>d.EsUnidadBase)
 AND (EXISTS(SELECT 1 FROM dbo.PresentacionesProducto p WHERE p.IdUnidadMedida=i.IdUnidadMedida)
 OR EXISTS(SELECT 1 FROM dbo.SolicitudesCotizacionDetalle s WHERE s.IdUnidadMedidaOriginal=i.IdUnidadMedida)
 OR EXISTS(SELECT 1 FROM dbo.ProformasProveedorDetalle p WHERE p.IdUnidadMedidaOriginal=i.IdUnidadMedida)))
 THROW 51105,N'No se puede reinterpretar una unidad utilizada. Registre una unidad distinta.',1;
END;
GO
CREATE OR ALTER TRIGGER dbo.TR_Solicitudes_Proteccion ON dbo.SolicitudesCotizacion AFTER INSERT,UPDATE,DELETE AS
BEGIN
 SET NOCOUNT ON;
 IF EXISTS(SELECT 1 FROM deleted d LEFT JOIN inserted i ON i.IdSolicitudCotizacion=d.IdSolicitudCotizacion
 WHERE d.Estado<>'Borrador' AND (i.IdSolicitudCotizacion IS NULL OR
 (d.Estado='Emitida' AND i.Estado NOT IN('Emitida','Cerrada','Cancelada')) OR
 (d.Estado IN('Cerrada','Cancelada') AND i.Estado<>d.Estado)))
 THROW 51106,N'No se puede borrar ni devolver a borrador una solicitud emitida.',1;
 IF EXISTS(
 SELECT d.IdSolicitudCotizacion,d.NumeroSolicitud,d.VersionSolicitud,d.IdSolicitudAnterior,d.FechaSolicitud,d.FechaLimiteRespuesta,d.DatosClienteOriginalJson,d.Observaciones,d.FechaEmision,d.FechaCreacion
 FROM deleted d JOIN inserted i ON i.IdSolicitudCotizacion=d.IdSolicitudCotizacion WHERE d.Estado<>'Borrador'
 EXCEPT
 SELECT i.IdSolicitudCotizacion,i.NumeroSolicitud,i.VersionSolicitud,i.IdSolicitudAnterior,i.FechaSolicitud,i.FechaLimiteRespuesta,i.DatosClienteOriginalJson,i.Observaciones,i.FechaEmision,i.FechaCreacion
 FROM inserted i JOIN deleted d ON i.IdSolicitudCotizacion=d.IdSolicitudCotizacion WHERE d.Estado<>'Borrador')
 THROW 51107,N'La solicitud emitida conserva su contenido. Cree una nueva version.',1;
 IF EXISTS(SELECT 1 FROM inserted i LEFT JOIN dbo.SolicitudesCotizacion a ON a.IdSolicitudCotizacion=i.IdSolicitudAnterior
 WHERE (i.VersionSolicitud=1 AND i.IdSolicitudAnterior IS NOT NULL) OR
 (i.VersionSolicitud>1 AND (a.IdSolicitudCotizacion IS NULL OR a.NumeroSolicitud<>i.NumeroSolicitud OR a.VersionSolicitud<>i.VersionSolicitud-1)))
 THROW 51108,N'La version de solicitud debe enlazar con la version anterior del mismo numero.',1;
 IF EXISTS(SELECT 1 FROM inserted i WHERE i.Estado IN('Emitida','Cerrada') AND
 (NOT EXISTS(SELECT 1 FROM dbo.SolicitudesCotizacionDetalle d WHERE d.IdSolicitudCotizacion=i.IdSolicitudCotizacion)
 OR NOT EXISTS(SELECT 1 FROM dbo.SolicitudesCotizacionProveedor p WHERE p.IdSolicitudCotizacion=i.IdSolicitudCotizacion)
 OR NULLIF(LTRIM(RTRIM(JSON_VALUE(i.DatosClienteOriginalJson,'$.nombre'))),N'') IS NULL))
 THROW 51109,N'Emitir requiere lineas, destinatarios y los datos originales del cliente (JSON: nombre).',1;
END;
GO
CREATE OR ALTER TRIGGER dbo.TR_SolicitudesDetalle_Proteccion ON dbo.SolicitudesCotizacionDetalle AFTER INSERT,UPDATE,DELETE AS
BEGIN
 SET NOCOUNT ON;
 IF EXISTS(SELECT 1 FROM (SELECT IdSolicitudCotizacion FROM inserted UNION SELECT IdSolicitudCotizacion FROM deleted)x
 JOIN dbo.SolicitudesCotizacion s WITH(UPDLOCK,HOLDLOCK) ON s.IdSolicitudCotizacion=x.IdSolicitudCotizacion WHERE s.Estado<>'Borrador')
 THROW 51110,N'Las lineas de una solicitud emitida son inmutables.',1;
 IF EXISTS(SELECT 1 FROM inserted i JOIN dbo.UnidadesMedida u ON u.IdUnidadMedida=i.IdUnidadMedidaOriginal
 JOIN dbo.PresentacionesProducto p ON p.IdPresentacionProducto=i.IdPresentacionProducto
 WHERE i.CodigoUnidadOriginal<>u.Codigo OR i.TipoBaseOriginal<>u.TipoBase OR i.FactorConversionOriginal<>u.FactorConversion
 OR i.ContenidoNormalizadoOriginal<>p.CantidadNormalizada)
 THROW 51111,N'La copia de unidad o contenido solicitado no coincide con la presentacion seleccionada.',1;
END;
GO
CREATE OR ALTER TRIGGER dbo.TR_SolicitudesProveedor_Proteccion ON dbo.SolicitudesCotizacionProveedor AFTER INSERT,UPDATE,DELETE AS
BEGIN
 SET NOCOUNT ON;
 IF EXISTS(SELECT 1 FROM inserted i JOIN deleted d ON d.IdSolicitudCotizacionProveedor=i.IdSolicitudCotizacionProveedor
 JOIN dbo.SolicitudesCotizacion s ON s.IdSolicitudCotizacion=d.IdSolicitudCotizacion
 WHERE s.Estado<>'Borrador' AND (i.IdSolicitudCotizacion<>d.IdSolicitudCotizacion OR i.IdProveedor<>d.IdProveedor))
 THROW 51112,N'No se puede cambiar la identidad de un destinatario de una solicitud emitida.',1;
 IF EXISTS(SELECT 1 FROM deleted d LEFT JOIN inserted i ON i.IdSolicitudCotizacionProveedor=d.IdSolicitudCotizacionProveedor
 JOIN dbo.SolicitudesCotizacion s ON s.IdSolicitudCotizacion=d.IdSolicitudCotizacion
 WHERE i.IdSolicitudCotizacionProveedor IS NULL AND s.Estado<>'Borrador')
 THROW 51113,N'No se puede eliminar un destinatario despues de emitir.',1;
 IF EXISTS(SELECT 1 FROM inserted i JOIN dbo.Documentos a ON a.IdDocumento=i.IdDocumentoEnviado WHERE a.Origen<>'Generado')
 THROW 51114,N'El PDF de salida debe estar registrado como generado por el sistema.',1;
 IF EXISTS(SELECT 1 FROM inserted i JOIN deleted d ON i.IdSolicitudCotizacionProveedor=d.IdSolicitudCotizacionProveedor
 WHERE d.FechaEnvio IS NOT NULL AND (i.FechaEnvio IS NULL OR i.FechaEnvio<>d.FechaEnvio OR
 i.IdDocumentoEnviado IS NULL OR i.IdDocumentoEnviado<>d.IdDocumentoEnviado))
 THROW 51115,N'La evidencia de envio registrada no se sobrescribe; genere otra version de solicitud.',1;
END;
GO
CREATE OR ALTER TRIGGER dbo.TR_Proformas_Proteccion ON dbo.ProformasProveedor AFTER INSERT,UPDATE,DELETE AS
BEGIN
 SET NOCOUNT ON;
 IF EXISTS(SELECT 1 FROM deleted WHERE Estado IN('Validada','Reemplazada','Cancelada'))
 THROW 51116,N'Una respuesta finalizada es inmutable. Cree una nueva version.',1;
 IF EXISTS(SELECT 1 FROM deleted d LEFT JOIN inserted i ON i.IdProformaProveedor=d.IdProformaProveedor WHERE i.IdProformaProveedor IS NULL)
 THROW 51117,N'Las cotizaciones se cancelan, no se eliminan.',1;
 IF EXISTS(SELECT 1 FROM inserted i LEFT JOIN deleted d ON d.IdProformaProveedor=i.IdProformaProveedor
 WHERE d.IdProformaProveedor IS NULL AND i.Estado<>'Borrador')
 THROW 51118,N'Una cotizacion debe crearse como borrador antes de revisar sus lineas.',1;
 IF EXISTS(SELECT 1 FROM inserted i LEFT JOIN dbo.ProformasProveedor a ON a.IdProformaProveedor=i.IdProformaAnterior
 WHERE (i.VersionRespuesta=1 AND i.IdProformaAnterior IS NOT NULL) OR
 (i.VersionRespuesta>1 AND (a.IdProformaProveedor IS NULL OR a.IdSolicitudCotizacionProveedor<>i.IdSolicitudCotizacionProveedor
 OR a.VersionRespuesta<>i.VersionRespuesta-1 OR a.Estado NOT IN('Validada','Reemplazada','Cancelada'))))
 THROW 51119,N'La revision debe enlazar con la respuesta anterior finalizada del mismo destinatario.',1;
 IF EXISTS(SELECT 1 FROM inserted i JOIN dbo.SolicitudesCotizacion s WITH(UPDLOCK,HOLDLOCK) ON s.IdSolicitudCotizacion=i.IdSolicitudCotizacion
 WHERE i.Estado<>'Cancelada' AND s.Estado<>'Emitida')
 THROW 51120,N'La solicitud debe estar emitida para recibir o validar ofertas.',1;
 IF EXISTS(SELECT 1 FROM inserted i JOIN dbo.Documentos a ON a.IdDocumento=i.IdDocumentoOrigen WHERE a.Origen<>'Recibido')
 THROW 51121,N'La cotizacion debe conservar un PDF registrado como recibido.',1;
 IF EXISTS(SELECT 1 FROM inserted i WHERE i.Estado IN('Validada','Reemplazada') AND
 (NOT EXISTS(SELECT 1 FROM dbo.ProformasProveedorDetalle d WHERE d.IdProformaProveedor=i.IdProformaProveedor)
 OR EXISTS(SELECT 1 FROM dbo.ProformasProveedorDetalle d WITH(UPDLOCK,HOLDLOCK) WHERE d.IdProformaProveedor=i.IdProformaProveedor AND d.EstadoRevision<>'Revisada')))
 THROW 51122,N'La respuesta requiere al menos una linea y todas sus lineas revisadas.',1;
END;
GO
CREATE OR ALTER TRIGGER dbo.TR_ProformasDetalle_Proteccion ON dbo.ProformasProveedorDetalle AFTER INSERT,UPDATE,DELETE AS
BEGIN
 SET NOCOUNT ON;
 IF EXISTS(SELECT 1 FROM (SELECT IdProformaProveedor FROM inserted UNION SELECT IdProformaProveedor FROM deleted)x
 JOIN dbo.ProformasProveedor p WITH(UPDLOCK,HOLDLOCK) ON p.IdProformaProveedor=x.IdProformaProveedor
 WHERE p.Estado NOT IN('Borrador','EnRevision'))
 THROW 51123,N'Las lineas de una cotizacion finalizada no se pueden modificar.',1;
 IF EXISTS(SELECT 1 FROM inserted i JOIN dbo.SolicitudesCotizacionDetalle s ON s.IdSolicitudCotizacionDetalle=i.IdSolicitudCotizacionDetalle
 WHERE i.EstadoRevision='Revisada' AND ((i.TipoOferta='Alternativa' AND s.PermiteAlternativas=0)
 OR (i.EstadoOferta='Cotizada' AND i.TipoOferta='Solicitada' AND
 (i.IdProducto<>s.IdProducto OR i.IdPresentacionProducto<>s.IdPresentacionProducto))))
 THROW 51124,N'Una oferta distinta de lo solicitado debe ser una alternativa permitida y revisada.',1;
 IF EXISTS(SELECT 1 FROM inserted i JOIN dbo.UnidadesMedida u ON u.IdUnidadMedida=i.IdUnidadMedidaOriginal
 JOIN dbo.PresentacionesProducto p ON p.IdPresentacionProducto=i.IdPresentacionProducto
 WHERE i.EstadoRevision='Revisada' AND i.EstadoOferta='Cotizada' AND
 (i.CodigoUnidadOriginal<>u.Codigo OR i.TipoBaseOriginal<>u.TipoBase OR i.FactorConversionOriginal<>u.FactorConversion
 OR i.ContenidoNormalizadoOriginal<>p.CantidadNormalizada))
 THROW 51125,N'Los datos fisicos de la oferta no corresponden a la presentacion asociada.',1;
 IF EXISTS(SELECT 1 FROM deleted d LEFT JOIN inserted i ON i.IdProformaProveedorDetalle=d.IdProformaProveedorDetalle
 WHERE i.IdProformaProveedorDetalle IS NULL)
 THROW 51126,N'Conserve las lineas importadas; corrija su estado o cree otra revision de respuesta.',1;
END;
GO
CREATE OR ALTER TRIGGER dbo.TR_Proformas_Auditoria ON dbo.ProformasProveedor AFTER UPDATE AS
BEGIN
 SET NOCOUNT ON;
 INSERT dbo.CambiosCotizacion(IdProformaProveedor,Origen,CambiosJson,Motivo)
 SELECT i.IdProformaProveedor,'BaseDatos',
 (SELECT JSON_QUERY((SELECT d.* FOR JSON PATH,INCLUDE_NULL_VALUES,WITHOUT_ARRAY_WRAPPER)) AS antes,
 JSON_QUERY((SELECT i.* FOR JSON PATH,INCLUDE_NULL_VALUES,WITHOUT_ARRAY_WRAPPER)) AS despues FOR JSON PATH,WITHOUT_ARRAY_WRAPPER),
 CONVERT(nvarchar(1000),SESSION_CONTEXT(N'MotivoCambio')) FROM inserted i JOIN deleted d ON d.IdProformaProveedor=i.IdProformaProveedor;
END;
GO
CREATE OR ALTER TRIGGER dbo.TR_ProformasDetalle_Auditoria ON dbo.ProformasProveedorDetalle AFTER UPDATE AS
BEGIN
 SET NOCOUNT ON;
 INSERT dbo.CambiosCotizacion(IdProformaProveedor,IdProformaProveedorDetalle,Origen,CambiosJson,Motivo)
 SELECT i.IdProformaProveedor,i.IdProformaProveedorDetalle,'BaseDatos',
 (SELECT JSON_QUERY((SELECT d.* FOR JSON PATH,INCLUDE_NULL_VALUES,WITHOUT_ARRAY_WRAPPER)) AS antes,
 JSON_QUERY((SELECT i.* FOR JSON PATH,INCLUDE_NULL_VALUES,WITHOUT_ARRAY_WRAPPER)) AS despues FOR JSON PATH,WITHOUT_ARRAY_WRAPPER),
 CONVERT(nvarchar(1000),SESSION_CONTEXT(N'MotivoCambio')) FROM inserted i JOIN deleted d ON d.IdProformaProveedorDetalle=i.IdProformaProveedorDetalle;
END;
GO
