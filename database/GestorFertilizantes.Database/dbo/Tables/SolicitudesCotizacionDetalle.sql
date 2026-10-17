CREATE TABLE [dbo].[SolicitudesCotizacionDetalle] (
    [IdSolicitudCotizacionDetalle] BIGINT          IDENTITY (1, 1) NOT NULL,
    [IdSolicitudCotizacion]        BIGINT          NOT NULL,
    [NumeroLinea]                  INT             NOT NULL,
    [IdProducto]                   INT             NOT NULL,
    [IdPresentacionProducto]       INT             NOT NULL,
    [CantidadEmpaquesSolicitada]   DECIMAL (18, 4) NOT NULL,
    [NombreProductoOriginal]       NVARCHAR (150)  NOT NULL,
    [MarcaOriginal]                NVARCHAR (150)  NULL,
    [PresentacionOriginal]         NVARCHAR (150)  NOT NULL,
    [ContenidoEmpaqueOriginal]     DECIMAL (18, 6) NOT NULL,
    [IdUnidadMedidaOriginal]       INT             NOT NULL,
    [CodigoUnidadOriginal]         NVARCHAR (20)   NOT NULL,
    [TipoBaseOriginal]             NVARCHAR (20)   NOT NULL,
    [FactorConversionOriginal]     DECIMAL (18, 6) NOT NULL,
    [ContenidoNormalizadoOriginal] DECIMAL (18, 6) NOT NULL,
    [PermiteAlternativas]          BIT             CONSTRAINT [DF_SolicitudesDetalle_Alternativas] DEFAULT ((1)) NOT NULL,
    [Observaciones]                NVARCHAR (1000) NULL,
    CONSTRAINT [PK_SolicitudesDetalle] PRIMARY KEY CLUSTERED ([IdSolicitudCotizacionDetalle] ASC),
    CONSTRAINT [CK_SolicitudesDetalle_Cantidades] CHECK ([CantidadEmpaquesSolicitada]>(0) AND [ContenidoEmpaqueOriginal]>(0) AND [FactorConversionOriginal]>(0) AND [ContenidoNormalizadoOriginal]>(0)),
    CONSTRAINT [CK_SolicitudesDetalle_Linea] CHECK ([NumeroLinea]>(0)),
    CONSTRAINT [CK_SolicitudesDetalle_Normalizada] CHECK ([ContenidoNormalizadoOriginal]=CONVERT([decimal](18,6),[ContenidoEmpaqueOriginal]*[FactorConversionOriginal])),
    CONSTRAINT [CK_SolicitudesDetalle_Textos] CHECK (len(ltrim(rtrim([NombreProductoOriginal])))>(0) AND len(ltrim(rtrim([PresentacionOriginal])))>(0) AND len(ltrim(rtrim([CodigoUnidadOriginal])))>(0)),
    CONSTRAINT [CK_SolicitudesDetalle_TipoBase] CHECK ([TipoBaseOriginal]='UNIDAD' OR [TipoBaseOriginal]='VOLUMEN' OR [TipoBaseOriginal]='PESO'),
    CONSTRAINT [FK_SolicitudesDetalle_PresentacionProducto] FOREIGN KEY ([IdPresentacionProducto], [IdProducto]) REFERENCES [dbo].[PresentacionesProducto] ([IdPresentacionProducto], [IdProducto]),
    CONSTRAINT [FK_SolicitudesDetalle_Producto] FOREIGN KEY ([IdProducto]) REFERENCES [dbo].[Productos] ([IdProducto]),
    CONSTRAINT [FK_SolicitudesDetalle_Solicitud] FOREIGN KEY ([IdSolicitudCotizacion]) REFERENCES [dbo].[SolicitudesCotizacion] ([IdSolicitudCotizacion]),
    CONSTRAINT [FK_SolicitudesDetalle_Unidad] FOREIGN KEY ([IdUnidadMedidaOriginal]) REFERENCES [dbo].[UnidadesMedida] ([IdUnidadMedida]),
    CONSTRAINT [UQ_SolicitudesDetalle_Linea] UNIQUE NONCLUSTERED ([IdSolicitudCotizacion] ASC, [NumeroLinea] ASC),
    CONSTRAINT [UQ_SolicitudesDetalle_SolicitudId] UNIQUE NONCLUSTERED ([IdSolicitudCotizacion] ASC, [IdSolicitudCotizacionDetalle] ASC)
);


GO

CREATE NONCLUSTERED INDEX [IX_SolicitudesDetalle_ProductoPresentacion]
    ON [dbo].[SolicitudesCotizacionDetalle]([IdProducto] ASC, [IdPresentacionProducto] ASC);


GO

CREATE NONCLUSTERED INDEX [IX_SolicitudesDetalle_Presentacion]
    ON [dbo].[SolicitudesCotizacionDetalle]([IdPresentacionProducto] ASC, [IdProducto] ASC);


GO

CREATE NONCLUSTERED INDEX [IX_SolicitudesDetalle_Unidad]
    ON [dbo].[SolicitudesCotizacionDetalle]([IdUnidadMedidaOriginal] ASC);


GO


CREATE   TRIGGER dbo.TR_SolicitudesDetalle_Proteccion ON dbo.SolicitudesCotizacionDetalle AFTER INSERT,UPDATE,DELETE AS
BEGIN
 SET NOCOUNT ON;
 IF EXISTS(SELECT 1 FROM (SELECT IdSolicitudCotizacion FROM inserted UNION SELECT IdSolicitudCotizacion FROM deleted)x
 JOIN dbo.SolicitudesCotizacion s WITH(UPDLOCK,HOLDLOCK) ON s.IdSolicitudCotizacion=x.IdSolicitudCotizacion WHERE s.Estado<>'Borrador')
 THROW 51110,N'Las lineas de una solicitud emitida son inmutables.',1;
 IF EXISTS(SELECT 1 FROM inserted i JOIN dbo.UnidadesMedida u ON u.IdUnidadMedida=i.IdUnidadMedidaOriginal
 JOIN dbo.PresentacionesProducto p ON p.IdPresentacionProducto=i.IdPresentacionProducto
 WHERE i.CodigoUnidadOriginal<>u.Codigo OR i.TipoBaseOriginal<>u.TipoBase OR i.FactorConversionOriginal<>u.FactorConversion
 OR i.ContenidoNormalizadoOriginal<>p.CantidadNormalizada)
 THROW 51111,N'La copia de unidad o contenido solicitado no coincide con la presentacion seleccionada.',1;
END;

GO
