CREATE TABLE [dbo].[UnidadesMedida] (
    [IdUnidadMedida]   INT             IDENTITY (1, 1) NOT NULL,
    [Codigo]           NVARCHAR (20)   NOT NULL,
    [Nombre]           NVARCHAR (50)   NOT NULL,
    [TipoBase]         NVARCHAR (20)   NOT NULL,
    [FactorConversion] DECIMAL (18, 6) NOT NULL,
    [EsUnidadBase]     BIT             CONSTRAINT [DF_UnidadesMedida_EsUnidadBase] DEFAULT ((0)) NOT NULL,
    [Activo]           BIT             CONSTRAINT [DF_UnidadesMedida_Activo] DEFAULT ((1)) NOT NULL,
    CONSTRAINT [PK_UnidadesMedida] PRIMARY KEY CLUSTERED ([IdUnidadMedida] ASC),
    CONSTRAINT [CK_UnidadesMedida_FactorConversion_MayorCero] CHECK ([FactorConversion]>(0)),
    CONSTRAINT [CK_UnidadesMedida_TipoBase_Valido] CHECK ([TipoBase]='UNIDAD' OR [TipoBase]='VOLUMEN' OR [TipoBase]='PESO'),
    CONSTRAINT [CK_UnidadesMedida_UnidadBase_FactorUno] CHECK ([EsUnidadBase]=(0) OR [FactorConversion]=(1)),
    CONSTRAINT [UQ_UnidadesMedida_Codigo] UNIQUE NONCLUSTERED ([Codigo] ASC)
);


GO

CREATE NONCLUSTERED INDEX [IX_UnidadesMedida_Activo]
    ON [dbo].[UnidadesMedida]([Activo] ASC);


GO

CREATE UNIQUE NONCLUSTERED INDEX [UQ_UnidadesMedida_Nombre]
    ON [dbo].[UnidadesMedida]([Nombre] ASC);


GO

CREATE UNIQUE NONCLUSTERED INDEX [UX_UnidadesMedida_TipoBase_UnidadBase_Activa]
    ON [dbo].[UnidadesMedida]([TipoBase] ASC) WHERE ([EsUnidadBase]=(1) AND [Activo]=(1));


GO


CREATE   TRIGGER dbo.TR_Unidades_ConversionHistorica ON dbo.UnidadesMedida AFTER UPDATE AS
BEGIN
 SET NOCOUNT ON;
 IF EXISTS(SELECT 1 FROM inserted i JOIN deleted d ON d.IdUnidadMedida=i.IdUnidadMedida
 WHERE (i.Codigo<>d.Codigo OR i.TipoBase<>d.TipoBase OR i.FactorConversion<>d.FactorConversion OR i.EsUnidadBase<>d.EsUnidadBase)
 AND (EXISTS(SELECT 1 FROM dbo.PresentacionesProducto p WHERE p.IdUnidadMedida=i.IdUnidadMedida)
 OR EXISTS(SELECT 1 FROM dbo.SolicitudesCotizacionDetalle s WHERE s.IdUnidadMedidaOriginal=i.IdUnidadMedida)
 OR EXISTS(SELECT 1 FROM dbo.ProformasProveedorDetalle p WHERE p.IdUnidadMedidaOriginal=i.IdUnidadMedida)))
 THROW 51105,N'No se puede reinterpretar una unidad utilizada. Registre una unidad distinta.',1;
END;

GO
