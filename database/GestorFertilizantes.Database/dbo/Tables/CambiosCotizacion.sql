CREATE TABLE [dbo].[CambiosCotizacion] (
    [IdCambioCotizacion]         BIGINT          IDENTITY (1, 1) NOT NULL,
    [IdProformaProveedor]        INT             NOT NULL,
    [IdProformaProveedorDetalle] INT             NULL,
    [Origen]                     VARCHAR (20)    NOT NULL,
    [CambiosJson]                NVARCHAR (MAX)  NOT NULL,
    [Motivo]                     NVARCHAR (1000) NULL,
    [Responsable]                NVARCHAR (150)  CONSTRAINT [DF_Cambios_Responsable] DEFAULT (original_login()) NOT NULL,
    [FechaCambio]                DATETIME2 (3)   CONSTRAINT [DF_Cambios_Fecha] DEFAULT (sysutcdatetime()) NOT NULL,
    CONSTRAINT [PK_CambiosCotizacion] PRIMARY KEY CLUSTERED ([IdCambioCotizacion] ASC),
    CONSTRAINT [CK_Cambios_Json] CHECK (isjson([CambiosJson])=(1)),
    CONSTRAINT [CK_Cambios_Origen] CHECK ([Origen]='Importacion' OR [Origen]='Manual' OR [Origen]='BaseDatos'),
    CONSTRAINT [CK_Cambios_Responsable] CHECK (len(ltrim(rtrim([Responsable])))>(0)),
    CONSTRAINT [FK_Cambios_Detalle] FOREIGN KEY ([IdProformaProveedor], [IdProformaProveedorDetalle]) REFERENCES [dbo].[ProformasProveedorDetalle] ([IdProformaProveedor], [IdProformaProveedorDetalle]),
    CONSTRAINT [FK_Cambios_Proforma] FOREIGN KEY ([IdProformaProveedor]) REFERENCES [dbo].[ProformasProveedor] ([IdProformaProveedor])
);


GO

CREATE NONCLUSTERED INDEX [IX_Cambios_Detalle]
    ON [dbo].[CambiosCotizacion]([IdProformaProveedor] ASC, [IdProformaProveedorDetalle] ASC) WHERE ([IdProformaProveedorDetalle] IS NOT NULL);


GO

CREATE NONCLUSTERED INDEX [IX_Cambios_ProformaFecha]
    ON [dbo].[CambiosCotizacion]([IdProformaProveedor] ASC, [FechaCambio] DESC);


GO


CREATE   TRIGGER dbo.TR_CambiosCotizacion_Inmutables ON dbo.CambiosCotizacion AFTER UPDATE,DELETE AS
BEGIN
 SET NOCOUNT ON;
 IF EXISTS(SELECT 1 FROM deleted) THROW 51102,N'El historial de ajustes no se puede editar ni eliminar.',1;
END;

GO
