CREATE TABLE [dbo].[SolicitudesCotizacionProveedor] (
    [IdSolicitudCotizacionProveedor] BIGINT          IDENTITY (1, 1) NOT NULL,
    [IdSolicitudCotizacion]          BIGINT          NOT NULL,
    [IdProveedor]                    INT             NOT NULL,
    [IdDocumentoEnviado]             BIGINT          NULL,
    [Estado]                         VARCHAR (20)    CONSTRAINT [DF_SolicitudesProveedor_Estado] DEFAULT ('PendienteEnvio') NOT NULL,
    [FechaEnvio]                     DATETIME2 (3)   NULL,
    [FechaRespuesta]                 DATETIME2 (3)   NULL,
    [Observaciones]                  NVARCHAR (1000) NULL,
    CONSTRAINT [PK_SolicitudesProveedor] PRIMARY KEY CLUSTERED ([IdSolicitudCotizacionProveedor] ASC),
    CONSTRAINT [CK_SolicitudesProveedor_Envio] CHECK (NOT ([Estado]='Respondida' OR [Estado]='Enviada') OR [FechaEnvio] IS NOT NULL AND [IdDocumentoEnviado] IS NOT NULL),
    CONSTRAINT [CK_SolicitudesProveedor_Estado] CHECK ([Estado]='Cancelada' OR [Estado]='Declinada' OR [Estado]='Respondida' OR [Estado]='Enviada' OR [Estado]='PendienteEnvio'),
    CONSTRAINT [CK_SolicitudesProveedor_Fechas] CHECK ([FechaRespuesta] IS NULL OR [FechaEnvio] IS NULL OR [FechaRespuesta]>=[FechaEnvio]),
    CONSTRAINT [CK_SolicitudesProveedor_Respuesta] CHECK ([Estado]<>'Respondida' OR [FechaRespuesta] IS NOT NULL),
    CONSTRAINT [FK_SolicitudesProveedor_Documento] FOREIGN KEY ([IdDocumentoEnviado]) REFERENCES [dbo].[Documentos] ([IdDocumento]),
    CONSTRAINT [FK_SolicitudesProveedor_Proveedor] FOREIGN KEY ([IdProveedor]) REFERENCES [dbo].[Proveedores] ([IdProveedor]),
    CONSTRAINT [FK_SolicitudesProveedor_Solicitud] FOREIGN KEY ([IdSolicitudCotizacion]) REFERENCES [dbo].[SolicitudesCotizacion] ([IdSolicitudCotizacion]),
    CONSTRAINT [UQ_SolicitudesProveedor_Destinatario] UNIQUE NONCLUSTERED ([IdSolicitudCotizacion] ASC, [IdProveedor] ASC),
    CONSTRAINT [UQ_SolicitudesProveedor_Identidad] UNIQUE NONCLUSTERED ([IdSolicitudCotizacionProveedor] ASC, [IdSolicitudCotizacion] ASC, [IdProveedor] ASC)
);


GO

CREATE NONCLUSTERED INDEX [IX_SolicitudesProveedor_ProveedorEstado]
    ON [dbo].[SolicitudesCotizacionProveedor]([IdProveedor] ASC, [Estado] ASC);


GO

CREATE NONCLUSTERED INDEX [IX_SolicitudesProveedor_Documento]
    ON [dbo].[SolicitudesCotizacionProveedor]([IdDocumentoEnviado] ASC) WHERE ([IdDocumentoEnviado] IS NOT NULL);


GO


CREATE   TRIGGER dbo.TR_SolicitudesProveedor_Proteccion ON dbo.SolicitudesCotizacionProveedor AFTER INSERT,UPDATE,DELETE AS
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
