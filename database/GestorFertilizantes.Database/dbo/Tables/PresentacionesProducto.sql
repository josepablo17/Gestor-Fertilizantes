CREATE TABLE [dbo].[PresentacionesProducto] (
    [IdPresentacionProducto] INT             IDENTITY (1, 1) NOT NULL,
    [IdProducto]             INT             NOT NULL,
    [Descripcion]            NVARCHAR (150)  NOT NULL,
    [Cantidad]               DECIMAL (18, 4) NOT NULL,
    [IdUnidadMedida]         INT             NOT NULL,
    [CantidadNormalizada]    DECIMAL (18, 6) NOT NULL,
    [Activo]                 BIT             CONSTRAINT [DF_PresentacionesProducto_Activo] DEFAULT ((1)) NOT NULL,
    [FechaCreacion]          DATETIME2 (7)   CONSTRAINT [DF_PresentacionesProducto_FechaCreacion] DEFAULT (sysdatetime()) NOT NULL,
    [FechaModificacion]      DATETIME2 (7)   NULL,
    CONSTRAINT [PK_PresentacionesProducto] PRIMARY KEY CLUSTERED ([IdPresentacionProducto] ASC),
    CONSTRAINT [CK_PresentacionesProducto_Cantidad_MayorCero] CHECK ([Cantidad]>(0)),
    CONSTRAINT [CK_PresentacionesProducto_CantidadNormalizada_MayorCero] CHECK ([CantidadNormalizada]>(0)),
    CONSTRAINT [CK_PresentacionesProducto_Descripcion_NoVacia] CHECK (len(ltrim(rtrim([Descripcion])))>(0)),
    CONSTRAINT [FK_PresentacionesProducto_Productos] FOREIGN KEY ([IdProducto]) REFERENCES [dbo].[Productos] ([IdProducto]),
    CONSTRAINT [FK_PresentacionesProducto_UnidadesMedida] FOREIGN KEY ([IdUnidadMedida]) REFERENCES [dbo].[UnidadesMedida] ([IdUnidadMedida]),
    CONSTRAINT [UQ_PresentacionesProducto_IdPresentacionProducto_IdProducto] UNIQUE NONCLUSTERED ([IdPresentacionProducto] ASC, [IdProducto] ASC),
    CONSTRAINT [UQ_PresentacionesProducto_Producto_Cantidad_Unidad] UNIQUE NONCLUSTERED ([IdProducto] ASC, [Cantidad] ASC, [IdUnidadMedida] ASC)
);


GO

CREATE NONCLUSTERED INDEX [IX_PresentacionesProducto_IdProducto]
    ON [dbo].[PresentacionesProducto]([IdProducto] ASC);


GO


CREATE   TRIGGER dbo.TR_Presentaciones_ContenidoHistorico ON dbo.PresentacionesProducto AFTER UPDATE AS
BEGIN
 SET NOCOUNT ON;
 IF EXISTS(SELECT 1 FROM inserted i JOIN deleted d ON d.IdPresentacionProducto=i.IdPresentacionProducto
 WHERE (i.IdProducto<>d.IdProducto OR i.Cantidad<>d.Cantidad OR i.IdUnidadMedida<>d.IdUnidadMedida OR i.CantidadNormalizada<>d.CantidadNormalizada)
 AND (EXISTS(SELECT 1 FROM dbo.SolicitudesCotizacionDetalle s WHERE s.IdPresentacionProducto=i.IdPresentacionProducto)
 OR EXISTS(SELECT 1 FROM dbo.ProformasProveedorDetalle p WHERE p.IdPresentacionProducto=i.IdPresentacionProducto)
 OR EXISTS(SELECT 1 FROM dbo.Compras c WHERE c.IdPresentacionProducto=i.IdPresentacionProducto)))
 THROW 51104,N'La presentacion ya forma parte de documentos. Cree otra para cambiar su contenido, unidad o producto.',1;
END;

GO
