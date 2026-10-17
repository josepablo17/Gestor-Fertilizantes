CREATE TABLE [dbo].[Documentos] (
    [IdDocumento]        BIGINT         IDENTITY (1, 1) NOT NULL,
    [NombreOriginal]     NVARCHAR (255) NOT NULL,
    [RutaAlmacenamiento] NVARCHAR (800) NOT NULL,
    [Sha256]             BINARY (32)    NOT NULL,
    [TamanoBytes]        BIGINT         NOT NULL,
    [TipoContenido]      VARCHAR (100)  CONSTRAINT [DF_Documentos_Tipo] DEFAULT ('application/pdf') NOT NULL,
    [Origen]             VARCHAR (20)   NOT NULL,
    [VersionPlantilla]   NVARCHAR (40)  NULL,
    [FechaRegistro]      DATETIME2 (3)  CONSTRAINT [DF_Documentos_Fecha] DEFAULT (sysutcdatetime()) NOT NULL,
    CONSTRAINT [PK_Documentos] PRIMARY KEY CLUSTERED ([IdDocumento] ASC),
    CONSTRAINT [CK_Documentos_Origen] CHECK ([Origen]='Recibido' OR [Origen]='Generado'),
    CONSTRAINT [CK_Documentos_Plantilla] CHECK ([VersionPlantilla] IS NULL OR len(ltrim(rtrim([VersionPlantilla])))>(0)),
    CONSTRAINT [CK_Documentos_Tamano] CHECK ([TamanoBytes]>(0)),
    CONSTRAINT [CK_Documentos_Textos] CHECK (len(ltrim(rtrim([NombreOriginal])))>(0) AND len(ltrim(rtrim([RutaAlmacenamiento])))>(0)),
    CONSTRAINT [CK_Documentos_Tipo] CHECK ([TipoContenido]='application/pdf'),
    CONSTRAINT [UQ_Documentos_Ruta] UNIQUE NONCLUSTERED ([RutaAlmacenamiento] ASC)
);


GO

CREATE NONCLUSTERED INDEX [IX_Documentos_Sha256]
    ON [dbo].[Documentos]([Sha256] ASC);


GO


/* Protecciones de documento e historia. Ejecutar junto con 001, atomicamente. */
CREATE   TRIGGER dbo.TR_Documentos_Inmutables ON dbo.Documentos AFTER UPDATE,DELETE AS
BEGIN
 SET NOCOUNT ON;
 IF EXISTS(SELECT 1 FROM deleted) THROW 51100,N'El registro del archivo original es inmutable. Registre otro documento.',1;
END;

GO
