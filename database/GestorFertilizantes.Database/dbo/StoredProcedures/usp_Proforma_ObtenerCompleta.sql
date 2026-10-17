
CREATE   PROCEDURE dbo.usp_Proforma_ObtenerCompleta
 @IdProformaProveedor int
AS
BEGIN
 SET NOCOUNT ON;

 EXEC dbo.SP_ProformaProveedor_ObtenerPorId @IdProformaProveedor;
 EXEC dbo.SP_ProformaProveedorDetalle_ListarPorProforma @IdProformaProveedor;
 EXEC dbo.usp_Proforma_HistorialCambios @IdProformaProveedor;
END;

GO
