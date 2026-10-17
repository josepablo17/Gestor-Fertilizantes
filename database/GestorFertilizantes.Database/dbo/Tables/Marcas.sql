CREATE TABLE [dbo].[Marcas] (
    [IdMarca]           INT            IDENTITY (1, 1) NOT NULL,
    [Nombre]            NVARCHAR (150) NOT NULL,
    [NombreNormalizado] AS             (upper(ltrim(rtrim([Nombre])))) PERSISTED,
    [Activo]            BIT            CONSTRAINT [DF_Marcas_Activo] DEFAULT ((1)) NOT NULL,
    [FechaCreacion]     DATETIME2 (3)  CONSTRAINT [DF_Marcas_FechaCreacion] DEFAULT (sysutcdatetime()) NOT NULL,
    [FechaModificacion] DATETIME2 (3)  NULL,
    CONSTRAINT [PK_Marcas] PRIMARY KEY CLUSTERED ([IdMarca] ASC),
    CONSTRAINT [CK_Marcas_Nombre] CHECK (len(ltrim(rtrim([Nombre])))>(0))
);


GO

CREATE UNIQUE NONCLUSTERED INDEX [UX_Marcas_Nombre]
    ON [dbo].[Marcas]([NombreNormalizado] ASC);


GO


CREATE   TRIGGER dbo.TR_Marcas_SincronizarEtiqueta ON dbo.Marcas AFTER UPDATE AS
BEGIN
 SET NOCOUNT ON;
 IF UPDATE(Nombre)
 UPDATE p SET Marca=m.Nombre FROM dbo.Productos p JOIN inserted m ON m.IdMarca=p.IdMarca
 WHERE ISNULL(p.Marca,N'')<>m.Nombre;
END;

GO
