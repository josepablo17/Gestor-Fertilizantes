CREATE TABLE [dbo].[ProductosBase] (
    [IdProductoBase]         INT            IDENTITY (1, 1) NOT NULL,
    [Codigo]                 NVARCHAR (40)  NOT NULL,
    [Nombre]                 NVARCHAR (150) NOT NULL,
    [FormulaDeclarada]       NVARCHAR (100) NULL,
    [Descripcion]            NVARCHAR (500) NULL,
    [ComparabilidadRevisada] BIT            CONSTRAINT [DF_ProductosBase_Revisada] DEFAULT ((0)) NOT NULL,
    [Activo]                 BIT            CONSTRAINT [DF_ProductosBase_Activo] DEFAULT ((1)) NOT NULL,
    [FechaCreacion]          DATETIME2 (3)  CONSTRAINT [DF_ProductosBase_FechaCreacion] DEFAULT (sysutcdatetime()) NOT NULL,
    [FechaModificacion]      DATETIME2 (3)  NULL,
    CONSTRAINT [PK_ProductosBase] PRIMARY KEY CLUSTERED ([IdProductoBase] ASC),
    CONSTRAINT [CK_ProductosBase_Formula] CHECK ([FormulaDeclarada] IS NULL OR len(ltrim(rtrim([FormulaDeclarada])))>(0)),
    CONSTRAINT [CK_ProductosBase_Texto] CHECK (len(ltrim(rtrim([Codigo])))>(0) AND len(ltrim(rtrim([Nombre])))>(0)),
    CONSTRAINT [UQ_ProductosBase_Codigo] UNIQUE NONCLUSTERED ([Codigo] ASC)
);


GO

CREATE NONCLUSTERED INDEX [IX_ProductosBase_Nombre]
    ON [dbo].[ProductosBase]([Nombre] ASC);


GO
