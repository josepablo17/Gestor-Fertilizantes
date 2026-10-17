-- Solo datos tecnicos imprescindibles. Nunca importar catalogos del equipo original.
-- No actualizar unidades existentes: una conversion usada en historia es inmutable.
DECLARE @Unidades table(Codigo nvarchar(20),Nombre nvarchar(50),TipoBase nvarchar(20),FactorConversion decimal(18,6),EsUnidadBase bit);
INSERT @Unidades VALUES
 (N'KG',N'Kilogramo',N'PESO',1,1),
 (N'G',N'Gramo',N'PESO',0.001,0),
 (N'L',N'Litro',N'VOLUMEN',1,1),
 (N'ML',N'Mililitro',N'VOLUMEN',0.001,0),
 (N'UND',N'Unidad',N'UNIDAD',1,1);
IF EXISTS(SELECT 1 FROM @Unidades s JOIN dbo.UnidadesMedida u ON u.Codigo=s.Codigo
 WHERE u.TipoBase<>s.TipoBase OR u.FactorConversion<>s.FactorConversion OR u.EsUnidadBase<>s.EsUnidadBase)
 THROW 52010,N'Una unidad tecnica existente difiere del modelo. Revisar antes de desplegar; no se reinterpretan datos historicos.',1;
INSERT dbo.UnidadesMedida(Codigo,Nombre,TipoBase,FactorConversion,EsUnidadBase)
SELECT s.Codigo,s.Nombre,s.TipoBase,s.FactorConversion,s.EsUnidadBase FROM @Unidades s
WHERE NOT EXISTS(SELECT 1 FROM dbo.UnidadesMedida u WITH(UPDLOCK,HOLDLOCK) WHERE u.Codigo=s.Codigo);
