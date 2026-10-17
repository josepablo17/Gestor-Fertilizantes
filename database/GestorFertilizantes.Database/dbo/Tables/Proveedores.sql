CREATE TABLE [dbo].[Proveedores] (
    [IdProveedor]               INT            IDENTITY (1, 1) NOT NULL,
    [Nombre]                    NVARCHAR (150) NOT NULL,
    [Contacto]                  NVARCHAR (150) NULL,
    [Telefono]                  NVARCHAR (50)  NULL,
    [Correo]                    NVARCHAR (150) NULL,
    [Direccion]                 NVARCHAR (250) NULL,
    [Provincia]                 NVARCHAR (100) NULL,
    [Canton]                    NVARCHAR (100) NULL,
    [Distrito]                  NVARCHAR (100) NULL,
    [FuenteExterna]             NVARCHAR (100) NULL,
    [IdExterno]                 NVARCHAR (100) NULL,
    [EsProveedorAutorizado]     BIT            CONSTRAINT [DF_Proveedores_EsProveedorAutorizado] DEFAULT ((0)) NOT NULL,
    [FechaUltimaSincronizacion] DATETIME2 (7)  NULL,
    [Activo]                    BIT            CONSTRAINT [DF_Proveedores_Activo] DEFAULT ((1)) NOT NULL,
    [FechaCreacion]             DATETIME2 (7)  CONSTRAINT [DF_Proveedores_FechaCreacion] DEFAULT (sysdatetime()) NOT NULL,
    [FechaModificacion]         DATETIME2 (7)  NULL,
    [TipoIdentificacion]        NVARCHAR (30)  NULL,
    [IdentificacionFiscal]      NVARCHAR (50)  NULL,
    [PaisIdentificacion]        CHAR (2)       NULL,
    CONSTRAINT [PK_Proveedores] PRIMARY KEY CLUSTERED ([IdProveedor] ASC),
    CONSTRAINT [CK_Proveedores_Correo_Formato] CHECK ([Correo] IS NULL OR len(ltrim(rtrim([Correo])))>(0) AND NOT [Correo] like '% %' AND [Correo] like '_%@_%._%'),
    CONSTRAINT [CK_Proveedores_IdentificacionFiscal] CHECK ([TipoIdentificacion] IS NULL AND [IdentificacionFiscal] IS NULL AND [PaisIdentificacion] IS NULL OR [TipoIdentificacion] IS NOT NULL AND [IdentificacionFiscal] IS NOT NULL AND [PaisIdentificacion] IS NOT NULL AND len(ltrim(rtrim([TipoIdentificacion])))>(0) AND len(ltrim(rtrim([IdentificacionFiscal])))>(0) AND NOT ([PaisIdentificacion]) collate Latin1_General_100_BIN2 like '%[^A-Z]%' AND len([PaisIdentificacion])=(2)),
    CONSTRAINT [CK_Proveedores_Nombre_NoVacio] CHECK (len(ltrim(rtrim([Nombre])))>(0)),
    CONSTRAINT [CK_Proveedores_Telefono_Formato] CHECK ([Telefono] IS NULL OR len(ltrim(rtrim([Telefono])))>(0) AND NOT [Telefono] like '%[^0-9+() -]%')
);


GO

CREATE NONCLUSTERED INDEX [IX_Proveedores_Nombre]
    ON [dbo].[Proveedores]([Nombre] ASC);


GO

CREATE UNIQUE NONCLUSTERED INDEX [UX_Proveedores_IdentificacionFiscal]
    ON [dbo].[Proveedores]([PaisIdentificacion] ASC, [TipoIdentificacion] ASC, [IdentificacionFiscal] ASC) WHERE ([IdentificacionFiscal] IS NOT NULL);


GO

CREATE NONCLUSTERED INDEX [IX_Proveedores_Ubicacion]
    ON [dbo].[Proveedores]([Provincia] ASC, [Canton] ASC, [Distrito] ASC);


GO

CREATE UNIQUE NONCLUSTERED INDEX [UX_Proveedores_Correo]
    ON [dbo].[Proveedores]([Correo] ASC) WHERE ([Correo] IS NOT NULL);


GO
