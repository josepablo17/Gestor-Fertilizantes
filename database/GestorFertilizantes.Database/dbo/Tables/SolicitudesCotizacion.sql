CREATE TABLE [dbo].[SolicitudesCotizacion] (
    [IdSolicitudCotizacion]    BIGINT          IDENTITY (1, 1) NOT NULL,
    [NumeroSolicitud]          NVARCHAR (50)   NOT NULL,
    [VersionSolicitud]         INT             CONSTRAINT [DF_Solicitudes_Version] DEFAULT ((1)) NOT NULL,
    [IdSolicitudAnterior]      BIGINT          NULL,
    [FechaSolicitud]           DATE            NOT NULL,
    [FechaLimiteRespuesta]     DATE            NULL,
    [Estado]                   VARCHAR (20)    CONSTRAINT [DF_Solicitudes_Estado] DEFAULT ('Borrador') NOT NULL,
    [DatosClienteOriginalJson] NVARCHAR (MAX)  NULL,
    [Observaciones]            NVARCHAR (2000) NULL,
    [FechaEmision]             DATETIME2 (3)   NULL,
    [FechaCreacion]            DATETIME2 (3)   CONSTRAINT [DF_Solicitudes_Creacion] DEFAULT (sysutcdatetime()) NOT NULL,
    [FechaModificacion]        DATETIME2 (3)   NULL,
    CONSTRAINT [PK_SolicitudesCotizacion] PRIMARY KEY CLUSTERED ([IdSolicitudCotizacion] ASC),
    CONSTRAINT [CK_Solicitudes_ClienteJson] CHECK ([DatosClienteOriginalJson] IS NULL OR isjson([DatosClienteOriginalJson])=(1)),
    CONSTRAINT [CK_Solicitudes_Emitida] CHECK (NOT ([Estado]='Cerrada' OR [Estado]='Emitida') OR [FechaEmision] IS NOT NULL AND [DatosClienteOriginalJson] IS NOT NULL),
    CONSTRAINT [CK_Solicitudes_Estado] CHECK ([Estado]='Cancelada' OR [Estado]='Cerrada' OR [Estado]='Emitida' OR [Estado]='Borrador'),
    CONSTRAINT [CK_Solicitudes_Fechas] CHECK ([FechaLimiteRespuesta] IS NULL OR [FechaLimiteRespuesta]>=[FechaSolicitud]),
    CONSTRAINT [CK_Solicitudes_Numero] CHECK (len(ltrim(rtrim([NumeroSolicitud])))>(0)),
    CONSTRAINT [CK_Solicitudes_Version] CHECK ([VersionSolicitud]>=(1) AND ([IdSolicitudAnterior] IS NULL OR [IdSolicitudAnterior]<>[IdSolicitudCotizacion])),
    CONSTRAINT [FK_Solicitudes_Anterior] FOREIGN KEY ([IdSolicitudAnterior]) REFERENCES [dbo].[SolicitudesCotizacion] ([IdSolicitudCotizacion]),
    CONSTRAINT [UQ_Solicitudes_NumeroVersion] UNIQUE NONCLUSTERED ([NumeroSolicitud] ASC, [VersionSolicitud] ASC)
);


GO

CREATE NONCLUSTERED INDEX [IX_Solicitudes_Anterior]
    ON [dbo].[SolicitudesCotizacion]([IdSolicitudAnterior] ASC) WHERE ([IdSolicitudAnterior] IS NOT NULL);


GO

CREATE NONCLUSTERED INDEX [IX_Solicitudes_Estado_Fecha]
    ON [dbo].[SolicitudesCotizacion]([Estado] ASC, [FechaSolicitud] DESC);


GO


CREATE   TRIGGER dbo.TR_Solicitudes_Proteccion ON dbo.SolicitudesCotizacion AFTER INSERT,UPDATE,DELETE AS
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
