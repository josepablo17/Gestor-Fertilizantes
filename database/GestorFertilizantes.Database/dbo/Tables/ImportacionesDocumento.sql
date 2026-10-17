CREATE TABLE [dbo].[ImportacionesDocumento] (
    [IdImportacionDocumento] BIGINT         IDENTITY (1, 1) NOT NULL,
    [IdDocumento]            BIGINT         NOT NULL,
    [VersionLector]          NVARCHAR (50)  NOT NULL,
    [Metodo]                 VARCHAR (20)   NOT NULL,
    [Estado]                 VARCHAR (30)   NOT NULL,
    [DatosExtraidosJson]     NVARCHAR (MAX) NULL,
    [AdvertenciasJson]       NVARCHAR (MAX) NULL,
    [FechaImportacion]       DATETIME2 (3)  CONSTRAINT [DF_ImportacionesDocumento_Fecha] DEFAULT (sysutcdatetime()) NOT NULL,
    CONSTRAINT [PK_ImportacionesDocumento] PRIMARY KEY CLUSTERED ([IdImportacionDocumento] ASC),
    CONSTRAINT [CK_ImportacionesDocumento_Advertencias] CHECK ([AdvertenciasJson] IS NULL OR isjson([AdvertenciasJson])=(1)),
    CONSTRAINT [CK_ImportacionesDocumento_Completada] CHECK ([Estado]<>'Completada' OR [DatosExtraidosJson] IS NOT NULL),
    CONSTRAINT [CK_ImportacionesDocumento_Datos] CHECK ([DatosExtraidosJson] IS NULL OR isjson([DatosExtraidosJson])=(1)),
    CONSTRAINT [CK_ImportacionesDocumento_Estado] CHECK ([Estado]='NoCompatible' OR [Estado]='Fallida' OR [Estado]='Parcial' OR [Estado]='Completada'),
    CONSTRAINT [CK_ImportacionesDocumento_Lector] CHECK (len(ltrim(rtrim([VersionLector])))>(0)),
    CONSTRAINT [CK_ImportacionesDocumento_Metodo] CHECK ([Metodo]='Manual' OR [Metodo]='Posiciones' OR [Metodo]='AcroForm'),
    CONSTRAINT [FK_ImportacionesDocumento_Documento] FOREIGN KEY ([IdDocumento]) REFERENCES [dbo].[Documentos] ([IdDocumento]),
    CONSTRAINT [UQ_ImportacionesDocumento_Documento] UNIQUE NONCLUSTERED ([IdImportacionDocumento] ASC, [IdDocumento] ASC)
);


GO

CREATE NONCLUSTERED INDEX [IX_ImportacionesDocumento_DocumentoFecha]
    ON [dbo].[ImportacionesDocumento]([IdDocumento] ASC, [FechaImportacion] DESC);


GO


CREATE   TRIGGER dbo.TR_Importaciones_Inmutables ON dbo.ImportacionesDocumento AFTER UPDATE,DELETE AS
BEGIN
 SET NOCOUNT ON;
 IF EXISTS(SELECT 1 FROM deleted) THROW 51101,N'Una extraccion es evidencia inmutable. Registre un nuevo intento.',1;
END;

GO
