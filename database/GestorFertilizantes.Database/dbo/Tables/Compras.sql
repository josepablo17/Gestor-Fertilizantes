CREATE TABLE [dbo].[Compras] (
    [IdCompra]                BIGINT          IDENTITY (1, 1) NOT NULL,
    [IdProducto]              INT             NOT NULL,
    [IdProveedor]             INT             NOT NULL,
    [IdPresentacionProducto]  INT             NOT NULL,
    [FechaCompra]             DATE            NOT NULL,
    [CantidadComprada]        DECIMAL (18, 4) NOT NULL,
    [PrecioTotal]             DECIMAL (18, 4) NOT NULL,
    [Moneda]                  NVARCHAR (10)   CONSTRAINT [DF_Compras_Moneda] DEFAULT ('CRC') NOT NULL,
    [PrecioUnitarioCalculado] DECIMAL (18, 6) NOT NULL,
    [IdCompraAnterior]        BIGINT          NULL,
    [PrecioUnitarioAnterior]  DECIMAL (18, 6) NULL,
    [DiferenciaPrecio]        DECIMAL (18, 6) NULL,
    [PorcentajeCambioPrecio]  DECIMAL (18, 6) NULL,
    [TendenciaPrecio]         NVARCHAR (30)   NULL,
    [Observaciones]           NVARCHAR (500)  NULL,
    [FechaCreacion]           DATETIME2 (7)   CONSTRAINT [DF_Compras_FechaCreacion] DEFAULT (sysdatetime()) NOT NULL,
    [FechaModificacion]       DATETIME2 (7)   NULL,
    CONSTRAINT [PK_Compras] PRIMARY KEY CLUSTERED ([IdCompra] ASC),
    CONSTRAINT [CK_Compras_CantidadComprada_MayorCero] CHECK ([CantidadComprada]>(0)),
    CONSTRAINT [CK_Compras_Moneda_Valida] CHECK ([Moneda]='USD' OR [Moneda]='CRC'),
    CONSTRAINT [CK_Compras_PrecioTotal_MayorCero] CHECK ([PrecioTotal]>(0)),
    CONSTRAINT [CK_Compras_PrecioUnitarioCalculado_MayorCero] CHECK ([PrecioUnitarioCalculado]>(0)),
    CONSTRAINT [CK_Compras_TendenciaPrecio_Valida] CHECK ([TendenciaPrecio] IS NULL OR ([TendenciaPrecio]='NO_COMPARABLE' OR [TendenciaPrecio]='SIN_CAMBIO' OR [TendenciaPrecio]='DISMINUCION' OR [TendenciaPrecio]='AUMENTO' OR [TendenciaPrecio]='PRIMER_REGISTRO')),
    CONSTRAINT [FK_Compras_CompraAnterior] FOREIGN KEY ([IdCompraAnterior]) REFERENCES [dbo].[Compras] ([IdCompra]),
    CONSTRAINT [FK_Compras_PresentacionesProducto] FOREIGN KEY ([IdPresentacionProducto]) REFERENCES [dbo].[PresentacionesProducto] ([IdPresentacionProducto]),
    CONSTRAINT [FK_Compras_PresentacionProducto_Producto] FOREIGN KEY ([IdPresentacionProducto], [IdProducto]) REFERENCES [dbo].[PresentacionesProducto] ([IdPresentacionProducto], [IdProducto]),
    CONSTRAINT [FK_Compras_Productos] FOREIGN KEY ([IdProducto]) REFERENCES [dbo].[Productos] ([IdProducto]),
    CONSTRAINT [FK_Compras_Proveedores] FOREIGN KEY ([IdProveedor]) REFERENCES [dbo].[Proveedores] ([IdProveedor])
);


GO

CREATE NONCLUSTERED INDEX [IX_Compras_IdPresentacionProducto]
    ON [dbo].[Compras]([IdPresentacionProducto] ASC);


GO

CREATE NONCLUSTERED INDEX [IX_Compras_IdProducto_FechaCompra]
    ON [dbo].[Compras]([IdProducto] ASC, [FechaCompra] DESC, [IdCompra] DESC);


GO

CREATE NONCLUSTERED INDEX [IX_Compras_IdProveedor_FechaCompra]
    ON [dbo].[Compras]([IdProveedor] ASC, [FechaCompra] DESC, [IdCompra] DESC);


GO
