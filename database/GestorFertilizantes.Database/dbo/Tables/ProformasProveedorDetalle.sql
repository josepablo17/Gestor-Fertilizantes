CREATE TABLE [dbo].[ProformasProveedorDetalle] (
    [IdProformaProveedorDetalle]   INT             IDENTITY (1, 1) NOT NULL,
    [IdProformaProveedor]          INT             NOT NULL,
    [CodigoProveedor]              NVARCHAR (100)  NULL,
    [DescripcionProveedor]         NVARCHAR (500)  NULL,
    [IdProducto]                   INT             NULL,
    [IdPresentacionProducto]       INT             NULL,
    [Cantidad]                     DECIMAL (18, 4) NULL,
    [PrecioUnitario]               DECIMAL (18, 6) NULL,
    [DescuentoPorcentaje]          DECIMAL (5, 2)  DEFAULT ((0)) NULL,
    [TotalLinea]                   DECIMAL (18, 4) NULL,
    [ProductoEncontrado]           BIT             DEFAULT ((0)) NOT NULL,
    [PresentacionEncontrada]       BIT             DEFAULT ((0)) NOT NULL,
    [SePuedeRegistrar]             BIT             DEFAULT ((0)) NOT NULL,
    [ObservacionValidacion]        NVARCHAR (1000) NULL,
    [FechaCreacion]                DATETIME2 (3)   CONSTRAINT [DF_ProformasDetalle_Creacion] DEFAULT (sysutcdatetime()) NOT NULL,
    [FechaModificacion]            DATETIME2 (3)   NULL,
    [IdSolicitudCotizacion]        BIGINT          NOT NULL,
    [IdSolicitudCotizacionDetalle] BIGINT          NULL,
    [NumeroLineaDocumento]         INT             NULL,
    [TipoOferta]                   VARCHAR (20)    CONSTRAINT [DF_ProformasDetalle_Tipo] DEFAULT ('Solicitada') NOT NULL,
    [EstadoOferta]                 VARCHAR (20)    CONSTRAINT [DF_ProformasDetalle_Oferta] DEFAULT ('Cotizada') NOT NULL,
    [EstadoRevision]               VARCHAR (20)    CONSTRAINT [DF_ProformasDetalle_Revision] DEFAULT ('Pendiente') NOT NULL,
    [NombreProductoOriginal]       NVARCHAR (150)  NULL,
    [MarcaOriginal]                NVARCHAR (150)  NULL,
    [PresentacionOriginal]         NVARCHAR (150)  NULL,
    [ContenidoEmpaqueOriginal]     DECIMAL (18, 6) NULL,
    [IdUnidadMedidaOriginal]       INT             NULL,
    [CodigoUnidadOriginal]         NVARCHAR (20)   NULL,
    [TipoBaseOriginal]             NVARCHAR (20)   NULL,
    [FactorConversionOriginal]     DECIMAL (18, 6) NULL,
    [ContenidoNormalizadoOriginal] DECIMAL (18, 6) NULL,
    [DescuentoMonto]               DECIMAL (18, 4) NULL,
    [ImpuestoMonto]                DECIMAL (18, 4) NULL,
    [BaseTotalLinea]               VARCHAR (30)    CONSTRAINT [DF_ProformasDetalle_BaseTotal] DEFAULT ('SinDefinir') NOT NULL,
    [MotivoAlternativa]            NVARCHAR (1000) NULL,
    PRIMARY KEY CLUSTERED ([IdProformaProveedorDetalle] ASC),
    CONSTRAINT [CK_ProformasDetalle_Alternativa] CHECK ([TipoOferta]<>'Alternativa' OR [EstadoRevision]<>'Revisada' OR [MotivoAlternativa] IS NOT NULL AND len(ltrim(rtrim([MotivoAlternativa])))>(0)),
    CONSTRAINT [CK_ProformasDetalle_BaseTotal] CHECK ([BaseTotalLinea]='ConImpuestos' OR [BaseTotalLinea]='NetoSinImpuestos' OR [BaseTotalLinea]='Bruto' OR [BaseTotalLinea]='SinDefinir'),
    CONSTRAINT [CK_ProformasDetalle_Cantidades] CHECK (([Cantidad] IS NULL OR [Cantidad]>(0)) AND ([ContenidoEmpaqueOriginal] IS NULL OR [ContenidoEmpaqueOriginal]>(0)) AND ([FactorConversionOriginal] IS NULL OR [FactorConversionOriginal]>(0)) AND ([ContenidoNormalizadoOriginal] IS NULL OR [ContenidoNormalizadoOriginal]>(0))),
    CONSTRAINT [CK_ProformasDetalle_Importes] CHECK (([PrecioUnitario] IS NULL OR [PrecioUnitario]>=(0)) AND ([TotalLinea] IS NULL OR [TotalLinea]>=(0)) AND ([DescuentoMonto] IS NULL OR [DescuentoMonto]>=(0)) AND ([ImpuestoMonto] IS NULL OR [ImpuestoMonto]>=(0))),
    CONSTRAINT [CK_ProformasDetalle_Normalizada] CHECK ([ContenidoNormalizadoOriginal] IS NULL OR [ContenidoEmpaqueOriginal] IS NOT NULL AND [FactorConversionOriginal] IS NOT NULL AND [ContenidoNormalizadoOriginal]=CONVERT([decimal](18,6),[ContenidoEmpaqueOriginal]*[FactorConversionOriginal])),
    CONSTRAINT [CK_ProformasDetalle_NumeroLinea] CHECK ([NumeroLineaDocumento] IS NULL OR [NumeroLineaDocumento]>(0)),
    CONSTRAINT [CK_ProformasDetalle_Oferta] CHECK ([EstadoOferta]='SinCotizar' OR [EstadoOferta]='NoDisponible' OR [EstadoOferta]='Cotizada'),
    CONSTRAINT [CK_ProformasDetalle_PresentacionProducto] CHECK ([IdPresentacionProducto] IS NULL OR [IdProducto] IS NOT NULL),
    CONSTRAINT [CK_ProformasDetalle_Revisada] CHECK ([EstadoRevision]<>'Revisada' OR ([TipoOferta]='Adicional' OR [IdSolicitudCotizacionDetalle] IS NOT NULL) AND ([EstadoOferta]<>'Cotizada' OR [Cantidad] IS NOT NULL AND [PrecioUnitario] IS NOT NULL AND [TotalLinea] IS NOT NULL AND [DescripcionProveedor] IS NOT NULL AND [NumeroLineaDocumento] IS NOT NULL AND [IdProducto] IS NOT NULL AND [IdPresentacionProducto] IS NOT NULL AND [NombreProductoOriginal] IS NOT NULL AND [PresentacionOriginal] IS NOT NULL AND [ContenidoEmpaqueOriginal] IS NOT NULL AND [IdUnidadMedidaOriginal] IS NOT NULL AND [CodigoUnidadOriginal] IS NOT NULL AND [TipoBaseOriginal] IS NOT NULL AND [FactorConversionOriginal] IS NOT NULL AND [ContenidoNormalizadoOriginal] IS NOT NULL AND [BaseTotalLinea]<>'SinDefinir')),
    CONSTRAINT [CK_ProformasDetalle_Revision] CHECK ([EstadoRevision]='Revisada' OR [EstadoRevision]='Pendiente'),
    CONSTRAINT [CK_ProformasDetalle_SinOferta] CHECK ([EstadoOferta]='Cotizada' OR [PrecioUnitario] IS NULL AND [TotalLinea] IS NULL AND [DescuentoMonto] IS NULL AND [ImpuestoMonto] IS NULL),
    CONSTRAINT [CK_ProformasDetalle_Textos] CHECK (([DescripcionProveedor] IS NULL OR len(ltrim(rtrim([DescripcionProveedor])))>(0)) AND ([NombreProductoOriginal] IS NULL OR len(ltrim(rtrim([NombreProductoOriginal])))>(0)) AND ([PresentacionOriginal] IS NULL OR len(ltrim(rtrim([PresentacionOriginal])))>(0)) AND ([CodigoUnidadOriginal] IS NULL OR len(ltrim(rtrim([CodigoUnidadOriginal])))>(0))),
    CONSTRAINT [CK_ProformasDetalle_Tipo] CHECK (([TipoOferta]='Adicional' OR [TipoOferta]='Alternativa' OR [TipoOferta]='Solicitada') AND ([TipoOferta]<>'Adicional' OR [IdSolicitudCotizacionDetalle] IS NULL)),
    CONSTRAINT [CK_ProformasDetalle_TipoBase] CHECK ([TipoBaseOriginal] IS NULL OR ([TipoBaseOriginal]='UNIDAD' OR [TipoBaseOriginal]='VOLUMEN' OR [TipoBaseOriginal]='PESO')),
    CONSTRAINT [CK_ProformasProveedorDetalle_DescuentoPorcentaje_Rango] CHECK ([DescuentoPorcentaje] IS NULL OR [DescuentoPorcentaje]>=(0) AND [DescuentoPorcentaje]<=(100)),
    CONSTRAINT [CK_ProformasProveedorDetalle_SePuedeRegistrar_Consistente] CHECK ([SePuedeRegistrar]=(0) OR [SePuedeRegistrar]=(1) AND [IdProducto] IS NOT NULL AND [IdPresentacionProducto] IS NOT NULL AND [ProductoEncontrado]=(1) AND [PresentacionEncontrada]=(1)),
    CONSTRAINT [FK_ProformasDetalle_Contexto] FOREIGN KEY ([IdProformaProveedor], [IdSolicitudCotizacion]) REFERENCES [dbo].[ProformasProveedor] ([IdProformaProveedor], [IdSolicitudCotizacion]),
    CONSTRAINT [FK_ProformasDetalle_SolicitudLinea] FOREIGN KEY ([IdSolicitudCotizacion], [IdSolicitudCotizacionDetalle]) REFERENCES [dbo].[SolicitudesCotizacionDetalle] ([IdSolicitudCotizacion], [IdSolicitudCotizacionDetalle]),
    CONSTRAINT [FK_ProformasDetalle_UnidadOriginal] FOREIGN KEY ([IdUnidadMedidaOriginal]) REFERENCES [dbo].[UnidadesMedida] ([IdUnidadMedida]),
    CONSTRAINT [FK_ProformasProveedorDetalle_PresentacionesProducto] FOREIGN KEY ([IdPresentacionProducto]) REFERENCES [dbo].[PresentacionesProducto] ([IdPresentacionProducto]),
    CONSTRAINT [FK_ProformasProveedorDetalle_PresentacionProducto_Producto] FOREIGN KEY ([IdPresentacionProducto], [IdProducto]) REFERENCES [dbo].[PresentacionesProducto] ([IdPresentacionProducto], [IdProducto]),
    CONSTRAINT [FK_ProformasProveedorDetalle_Productos] FOREIGN KEY ([IdProducto]) REFERENCES [dbo].[Productos] ([IdProducto]),
    CONSTRAINT [FK_ProformasProveedorDetalle_ProformasProveedor] FOREIGN KEY ([IdProformaProveedor]) REFERENCES [dbo].[ProformasProveedor] ([IdProformaProveedor]),
    CONSTRAINT [UQ_ProformasDetalle_Identidad] UNIQUE NONCLUSTERED ([IdProformaProveedor] ASC, [IdProformaProveedorDetalle] ASC)
);


GO

CREATE NONCLUSTERED INDEX [IX_ProformasDetalle_Cabecera]
    ON [dbo].[ProformasProveedorDetalle]([IdProformaProveedor] ASC, [IdProformaProveedorDetalle] ASC);


GO

CREATE NONCLUSTERED INDEX [IX_ProformasDetalle_SolicitudLinea]
    ON [dbo].[ProformasProveedorDetalle]([IdSolicitudCotizacion] ASC, [IdSolicitudCotizacionDetalle] ASC);


GO

CREATE NONCLUSTERED INDEX [IX_ProformasDetalle_ProductoPresentacion]
    ON [dbo].[ProformasProveedorDetalle]([IdProducto] ASC, [IdPresentacionProducto] ASC) WHERE ([IdProducto] IS NOT NULL);


GO

CREATE NONCLUSTERED INDEX [IX_ProformasDetalle_Unidad]
    ON [dbo].[ProformasProveedorDetalle]([IdUnidadMedidaOriginal] ASC) WHERE ([IdUnidadMedidaOriginal] IS NOT NULL);


GO

CREATE UNIQUE NONCLUSTERED INDEX [UX_ProformasDetalle_NumeroLinea]
    ON [dbo].[ProformasProveedorDetalle]([IdProformaProveedor] ASC, [NumeroLineaDocumento] ASC) WHERE ([NumeroLineaDocumento] IS NOT NULL);


GO

CREATE NONCLUSTERED INDEX [IX_ProformasDetalle_PresentacionProducto]
    ON [dbo].[ProformasProveedorDetalle]([IdPresentacionProducto] ASC, [IdProducto] ASC) WHERE ([IdPresentacionProducto] IS NOT NULL);


GO


CREATE   TRIGGER dbo.TR_ProformasDetalle_Proteccion ON dbo.ProformasProveedorDetalle AFTER INSERT,UPDATE,DELETE AS
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


CREATE   TRIGGER dbo.TR_ProformasDetalle_Auditoria ON dbo.ProformasProveedorDetalle AFTER UPDATE AS
BEGIN
 SET NOCOUNT ON;
 INSERT dbo.CambiosCotizacion(IdProformaProveedor,IdProformaProveedorDetalle,Origen,CambiosJson,Motivo)
 SELECT i.IdProformaProveedor,i.IdProformaProveedorDetalle,'BaseDatos',
 (SELECT JSON_QUERY((SELECT d.* FOR JSON PATH,INCLUDE_NULL_VALUES,WITHOUT_ARRAY_WRAPPER)) AS antes,
 JSON_QUERY((SELECT i.* FOR JSON PATH,INCLUDE_NULL_VALUES,WITHOUT_ARRAY_WRAPPER)) AS despues FOR JSON PATH,WITHOUT_ARRAY_WRAPPER),
 CONVERT(nvarchar(1000),SESSION_CONTEXT(N'MotivoCambio')) FROM inserted i JOIN deleted d ON d.IdProformaProveedorDetalle=i.IdProformaProveedorDetalle;
END;

GO
