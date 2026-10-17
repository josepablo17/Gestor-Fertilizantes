
CREATE   PROCEDURE dbo.usp_Equivalencia_CambiarActivo @IdEquivalencia int,@Activo bit AS
BEGIN
 SET NOCOUNT ON;
 IF @Activo IS NULL THROW 52000,N'Activo es obligatorio.',1;
 IF NOT EXISTS(SELECT 1 FROM dbo.CompraAutomaticaEquivalencias WHERE IdEquivalencia=@IdEquivalencia) THROW 52004,N'Equivalencia no existe.',1;
 UPDATE dbo.CompraAutomaticaEquivalencias SET Activo=@Activo,FechaModificacion=GETDATE() WHERE IdEquivalencia=@IdEquivalencia;
END;

GO
