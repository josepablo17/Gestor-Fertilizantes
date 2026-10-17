
CREATE   PROCEDURE dbo.SP_ProformaProveedorDetalle_Insertar
 @IdProformaProveedor int,@LineaJson nvarchar(max),@Motivo nvarchar(1000),@IdProformaProveedorDetalle int OUTPUT
AS
BEGIN
 SET NOCOUNT ON;

 EXEC dbo.usp_Proforma_AgregarLinea @IdProformaProveedor,@LineaJson,@Motivo,@IdProformaProveedorDetalle OUTPUT;
END;

GO
