CREATE TABLE [dbo].[CompraAutomaticaEquivalencias] (
    [IdEquivalencia]         INT            IDENTITY (1, 1) NOT NULL,
    [IdProveedor]            INT            NOT NULL,
    [CodigoProveedor]        NVARCHAR (100) NULL,
    [DescripcionProveedor]   NVARCHAR (300) NOT NULL,
    [IdProducto]             INT            NOT NULL,
    [IdPresentacionProducto] INT            NULL,
    [Activo]                 BIT            DEFAULT ((1)) NOT NULL,
    [FechaCreacion]          DATETIME       DEFAULT (getdate()) NOT NULL,
    [FechaModificacion]      DATETIME       NULL,
    [CodigoNormalizado]      AS             (nullif(upper(ltrim(rtrim([CodigoProveedor]))),N'')) PERSISTED,
    PRIMARY KEY CLUSTERED ([IdEquivalencia] ASC),
    CONSTRAINT [CK_Equivalencias_Codigo] CHECK ([CodigoProveedor] IS NULL OR len(ltrim(rtrim([CodigoProveedor])))>(0)),
    CONSTRAINT [CK_Equivalencias_Descripcion] CHECK (len(ltrim(rtrim([DescripcionProveedor])))>(0)),
    CONSTRAINT [FK_CompraAutomaticaEquivalencias_Presentacion] FOREIGN KEY ([IdPresentacionProducto]) REFERENCES [dbo].[PresentacionesProducto] ([IdPresentacionProducto]),
    CONSTRAINT [FK_CompraAutomaticaEquivalencias_Producto] FOREIGN KEY ([IdProducto]) REFERENCES [dbo].[Productos] ([IdProducto]),
    CONSTRAINT [FK_CompraAutomaticaEquivalencias_Proveedor] FOREIGN KEY ([IdProveedor]) REFERENCES [dbo].[Proveedores] ([IdProveedor]),
    CONSTRAINT [FK_Equivalencias_PresentacionProducto] FOREIGN KEY ([IdPresentacionProducto], [IdProducto]) REFERENCES [dbo].[PresentacionesProducto] ([IdPresentacionProducto], [IdProducto])
);


GO

CREATE NONCLUSTERED INDEX [IX_Equivalencias_PresentacionProducto]
    ON [dbo].[CompraAutomaticaEquivalencias]([IdPresentacionProducto] ASC, [IdProducto] ASC) WHERE ([IdPresentacionProducto] IS NOT NULL);


GO

CREATE UNIQUE NONCLUSTERED INDEX [UX_Equivalencias_ProveedorCodigoActivo]
    ON [dbo].[CompraAutomaticaEquivalencias]([IdProveedor] ASC, [CodigoNormalizado] ASC) WHERE ([Activo]=(1) AND [CodigoProveedor] IS NOT NULL);


GO

CREATE NONCLUSTERED INDEX [IX_Equivalencias_ProveedorDescripcion]
    ON [dbo].[CompraAutomaticaEquivalencias]([IdProveedor] ASC, [DescripcionProveedor] ASC)
    INCLUDE([IdProducto], [IdPresentacionProducto], [Activo]);


GO

CREATE NONCLUSTERED INDEX [IX_Equivalencias_ProductoPresentacion]
    ON [dbo].[CompraAutomaticaEquivalencias]([IdProducto] ASC, [IdPresentacionProducto] ASC);


GO
