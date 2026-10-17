CREATE TABLE [dbo].[ProformasProveedor] (
    [IdProformaProveedor]            INT             IDENTITY (1, 1) NOT NULL,
    [NumeroProforma]                 NVARCHAR (50)   NULL,
    [IdProveedor]                    INT             NOT NULL,
    [FechaProforma]                  DATE            NULL,
    [FechaVencimiento]               DATE            NULL,
    [DiasCredito]                    INT             NULL,
    [TipoDocumento]                  NVARCHAR (50)   NULL,
    [NombreProveedorPdf]             NVARCHAR (200)  NULL,
    [NombreNegocio]                  NVARCHAR (250)  NULL,
    [RazonSocial]                    NVARCHAR (250)  NULL,
    [Cedula]                         NVARCHAR (50)   NULL,
    [Telefono]                       NVARCHAR (50)   NULL,
    [Vendedor]                       NVARCHAR (150)  NULL,
    [Subtotal]                       DECIMAL (18, 4) NULL,
    [Descuento]                      DECIMAL (18, 4) NULL,
    [IVA]                            DECIMAL (18, 4) NULL,
    [Total]                          DECIMAL (18, 4) NULL,
    [Estado]                         VARCHAR (30)    CONSTRAINT [DF_Proformas_Estado] DEFAULT ('Borrador') NOT NULL,
    [Observaciones]                  NVARCHAR (2000) NULL,
    [FechaCreacion]                  DATETIME2 (3)   CONSTRAINT [DF_Proformas_Creacion] DEFAULT (sysutcdatetime()) NOT NULL,
    [FechaModificacion]              DATETIME2 (3)   NULL,
    [IdSolicitudCotizacionProveedor] BIGINT          NOT NULL,
    [IdSolicitudCotizacion]          BIGINT          NOT NULL,
    [VersionRespuesta]               INT             CONSTRAINT [DF_Proformas_Version] DEFAULT ((1)) NOT NULL,
    [IdProformaAnterior]             INT             NULL,
    [Moneda]                         CHAR (3)        NULL,
    [IdDocumentoOrigen]              BIGINT          NULL,
    [IdImportacionDocumento]         BIGINT          NULL,
    [DatosProveedorOriginalJson]     NVARCHAR (MAX)  NULL,
    [DatosClienteOriginalJson]       NVARCHAR (MAX)  NULL,
    [CondicionesPago]                NVARCHAR (1000) NULL,
    [CondicionesEntrega]             NVARCHAR (1000) NULL,
    [OtrosCargos]                    DECIMAL (18, 4) NULL,
    [EstadoConciliacion]             VARCHAR (20)    CONSTRAINT [DF_Proformas_Conciliacion] DEFAULT ('Pendiente') NOT NULL,
    [JustificacionConciliacion]      NVARCHAR (1000) NULL,
    [FechaValidacion]                DATETIME2 (3)   NULL,
    PRIMARY KEY CLUSTERED ([IdProformaProveedor] ASC),
    CONSTRAINT [CK_Proformas_ClienteJson] CHECK ([DatosClienteOriginalJson] IS NULL OR isjson([DatosClienteOriginalJson])=(1)),
    CONSTRAINT [CK_Proformas_Conciliacion] CHECK ([EstadoConciliacion]='ConDiferencias' OR [EstadoConciliacion]='Conciliada' OR [EstadoConciliacion]='Pendiente'),
    CONSTRAINT [CK_Proformas_ConciliacionMotivo] CHECK ([EstadoConciliacion]<>'ConDiferencias' OR [JustificacionConciliacion] IS NOT NULL AND len(ltrim(rtrim([JustificacionConciliacion])))>(0)),
    CONSTRAINT [CK_Proformas_Estado] CHECK ([Estado]='Reemplazada' OR [Estado]='Cancelada' OR [Estado]='Validada' OR [Estado]='EnRevision' OR [Estado]='Borrador'),
    CONSTRAINT [CK_Proformas_Importacion] CHECK ([IdImportacionDocumento] IS NULL OR [IdDocumentoOrigen] IS NOT NULL),
    CONSTRAINT [CK_Proformas_Moneda] CHECK ([Moneda] IS NULL OR len([Moneda])=(3) AND NOT ([Moneda]) collate Latin1_General_100_BIN2 like '%[^A-Z]%'),
    CONSTRAINT [CK_Proformas_Montos] CHECK (([Subtotal] IS NULL OR [Subtotal]>=(0)) AND ([Descuento] IS NULL OR [Descuento]>=(0)) AND ([IVA] IS NULL OR [IVA]>=(0)) AND ([Total] IS NULL OR [Total]>=(0)) AND ([OtrosCargos] IS NULL OR [OtrosCargos]>=(0))),
    CONSTRAINT [CK_Proformas_Numero] CHECK ([NumeroProforma] IS NULL OR len(ltrim(rtrim([NumeroProforma])))>(0)),
    CONSTRAINT [CK_Proformas_ProveedorJson] CHECK ([DatosProveedorOriginalJson] IS NULL OR isjson([DatosProveedorOriginalJson])=(1)),
    CONSTRAINT [CK_Proformas_Validada] CHECK (NOT ([Estado]='Reemplazada' OR [Estado]='Validada') OR [Moneda] IS NOT NULL AND [IdDocumentoOrigen] IS NOT NULL AND [FechaValidacion] IS NOT NULL AND [FechaProforma] IS NOT NULL AND [Subtotal] IS NOT NULL AND [Descuento] IS NOT NULL AND [IVA] IS NOT NULL AND [Total] IS NOT NULL AND [OtrosCargos] IS NOT NULL AND [DatosProveedorOriginalJson] IS NOT NULL AND [DatosClienteOriginalJson] IS NOT NULL AND [EstadoConciliacion]<>'Pendiente'),
    CONSTRAINT [CK_Proformas_Version] CHECK ([VersionRespuesta]>=(1) AND ([IdProformaAnterior] IS NULL OR [IdProformaAnterior]<>[IdProformaProveedor])),
    CONSTRAINT [CK_ProformasProveedor_DiasCredito_Valido] CHECK ([DiasCredito] IS NULL OR [DiasCredito]>=(0)),
    CONSTRAINT [CK_ProformasProveedor_Fechas_Validas] CHECK ([FechaVencimiento] IS NULL OR [FechaProforma] IS NULL OR [FechaVencimiento]>=[FechaProforma]),
    CONSTRAINT [FK_Proformas_Anterior] FOREIGN KEY ([IdProformaAnterior]) REFERENCES [dbo].[ProformasProveedor] ([IdProformaProveedor]),
    CONSTRAINT [FK_Proformas_Documento] FOREIGN KEY ([IdDocumentoOrigen]) REFERENCES [dbo].[Documentos] ([IdDocumento]),
    CONSTRAINT [FK_Proformas_ImportacionDocumento] FOREIGN KEY ([IdImportacionDocumento], [IdDocumentoOrigen]) REFERENCES [dbo].[ImportacionesDocumento] ([IdImportacionDocumento], [IdDocumento]),
    CONSTRAINT [FK_Proformas_SolicitudProveedor] FOREIGN KEY ([IdSolicitudCotizacionProveedor], [IdSolicitudCotizacion], [IdProveedor]) REFERENCES [dbo].[SolicitudesCotizacionProveedor] ([IdSolicitudCotizacionProveedor], [IdSolicitudCotizacion], [IdProveedor]),
    CONSTRAINT [FK_ProformasProveedor_Proveedores] FOREIGN KEY ([IdProveedor]) REFERENCES [dbo].[Proveedores] ([IdProveedor]),
    CONSTRAINT [UQ_Proformas_Contexto] UNIQUE NONCLUSTERED ([IdProformaProveedor] ASC, [IdSolicitudCotizacion] ASC),
    CONSTRAINT [UQ_Proformas_VersionSolicitudProveedor] UNIQUE NONCLUSTERED ([IdSolicitudCotizacionProveedor] ASC, [VersionRespuesta] ASC)
);


GO

CREATE NONCLUSTERED INDEX [IX_Proformas_Documento]
    ON [dbo].[ProformasProveedor]([IdDocumentoOrigen] ASC) WHERE ([IdDocumentoOrigen] IS NOT NULL);


GO

CREATE NONCLUSTERED INDEX [IX_Proformas_Importacion]
    ON [dbo].[ProformasProveedor]([IdImportacionDocumento] ASC, [IdDocumentoOrigen] ASC) WHERE ([IdImportacionDocumento] IS NOT NULL);


GO

CREATE UNIQUE NONCLUSTERED INDEX [UX_Proformas_NumeroProveedorVersion]
    ON [dbo].[ProformasProveedor]([IdProveedor] ASC, [NumeroProforma] ASC, [VersionRespuesta] ASC) WHERE ([NumeroProforma] IS NOT NULL);


GO

CREATE NONCLUSTERED INDEX [IX_Proformas_Anterior]
    ON [dbo].[ProformasProveedor]([IdProformaAnterior] ASC) WHERE ([IdProformaAnterior] IS NOT NULL);


GO

CREATE NONCLUSTERED INDEX [IX_Proformas_SolicitudEstado]
    ON [dbo].[ProformasProveedor]([IdSolicitudCotizacion] ASC, [Estado] ASC)
    INCLUDE([IdProveedor], [Moneda], [Total]);


GO


CREATE   TRIGGER dbo.TR_Proformas_Proteccion ON dbo.ProformasProveedor AFTER INSERT,UPDATE,DELETE AS
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


CREATE   TRIGGER dbo.TR_Proformas_Auditoria ON dbo.ProformasProveedor AFTER UPDATE AS
BEGIN
 SET NOCOUNT ON;
 INSERT dbo.CambiosCotizacion(IdProformaProveedor,Origen,CambiosJson,Motivo)
 SELECT i.IdProformaProveedor,'BaseDatos',
 (SELECT JSON_QUERY((SELECT d.* FOR JSON PATH,INCLUDE_NULL_VALUES,WITHOUT_ARRAY_WRAPPER)) AS antes,
 JSON_QUERY((SELECT i.* FOR JSON PATH,INCLUDE_NULL_VALUES,WITHOUT_ARRAY_WRAPPER)) AS despues FOR JSON PATH,WITHOUT_ARRAY_WRAPPER),
 CONVERT(nvarchar(1000),SESSION_CONTEXT(N'MotivoCambio')) FROM inserted i JOIN deleted d ON d.IdProformaProveedor=i.IdProformaProveedor;
END;

GO
