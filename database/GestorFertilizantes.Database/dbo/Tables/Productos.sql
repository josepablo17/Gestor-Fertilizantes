CREATE TABLE [dbo].[Productos] (
    [IdProducto]        INT            IDENTITY (1, 1) NOT NULL,
    [Nombre]            NVARCHAR (150) NOT NULL,
    [Categoria]         NVARCHAR (100) NULL,
    [Marca]             NVARCHAR (100) NULL,
    [Descripcion]       NVARCHAR (250) NULL,
    [Activo]            BIT            CONSTRAINT [DF_Productos_Activo] DEFAULT ((1)) NOT NULL,
    [FechaCreacion]     DATETIME2 (7)  CONSTRAINT [DF_Productos_FechaCreacion] DEFAULT (sysdatetime()) NOT NULL,
    [FechaModificacion] DATETIME2 (7)  NULL,
    [CodigoInterno]     NVARCHAR (40)  CONSTRAINT [DF_Productos_CodigoInterno] DEFAULT (N'PRD-'+CONVERT([nvarchar](20),NEXT VALUE FOR [dbo].[SecCodigoProducto])) NOT NULL,
    [IdProductoBase]    INT            NOT NULL,
    [IdMarca]           INT            NULL,
    CONSTRAINT [PK_Productos] PRIMARY KEY CLUSTERED ([IdProducto] ASC),
    CONSTRAINT [CK_Productos_NombreCodigo] CHECK (len(ltrim(rtrim([Nombre])))>(0) AND len(ltrim(rtrim([CodigoInterno])))>(0)),
    CONSTRAINT [FK_Productos_Marcas] FOREIGN KEY ([IdMarca]) REFERENCES [dbo].[Marcas] ([IdMarca]),
    CONSTRAINT [FK_Productos_ProductosBase] FOREIGN KEY ([IdProductoBase]) REFERENCES [dbo].[ProductosBase] ([IdProductoBase]),
    CONSTRAINT [UQ_Productos_CodigoInterno] UNIQUE NONCLUSTERED ([CodigoInterno] ASC)
);


GO

CREATE NONCLUSTERED INDEX [IX_Productos_Base_Marca]
    ON [dbo].[Productos]([IdProductoBase] ASC, [IdMarca] ASC)
    INCLUDE([Nombre], [Activo]);


GO

CREATE NONCLUSTERED INDEX [IX_Productos_Nombre]
    ON [dbo].[Productos]([Nombre] ASC);


GO

CREATE NONCLUSTERED INDEX [IX_Productos_IdMarca]
    ON [dbo].[Productos]([IdMarca] ASC) WHERE ([IdMarca] IS NOT NULL);


GO


CREATE   TRIGGER dbo.TR_Productos_Marca ON dbo.Productos AFTER INSERT,UPDATE AS
BEGIN
 SET NOCOUNT ON;
 IF TRIGGER_NESTLEVEL(OBJECT_ID(N'dbo.TR_Productos_Marca'))>1 RETURN;
 IF EXISTS(SELECT 1 FROM inserted WHERE IdMarca IS NULL AND NULLIF(LTRIM(RTRIM(Marca)),N'') IS NOT NULL)
  THROW 51103,N'La marca debe identificarse en el catalogo Marcas mediante IdMarca.',1;
 UPDATE p SET Marca=m.Nombre FROM dbo.Productos p JOIN inserted i ON i.IdProducto=p.IdProducto
 LEFT JOIN dbo.Marcas m ON m.IdMarca=i.IdMarca
 WHERE ISNULL(p.Marca,N'')<>ISNULL(m.Nombre,N'');
END;

GO
