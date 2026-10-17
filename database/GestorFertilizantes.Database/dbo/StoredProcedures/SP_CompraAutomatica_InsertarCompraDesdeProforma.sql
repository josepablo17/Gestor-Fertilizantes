
CREATE   PROCEDURE dbo.SP_CompraAutomatica_InsertarCompraDesdeProforma @IdProducto int,@IdProveedor int,@IdPresentacionProducto int,@FechaCompra date,@CantidadComprada decimal(18,4),@PrecioTotal decimal(18,4),@Moneda nvarchar(10),@Observaciones nvarchar(500)=NULL AS
BEGIN
 SET NOCOUNT ON;
 THROW 52010,N'Una cotizacion recibida no es una compra. Use usp_Proforma_GuardarBorrador y valide la respuesta; registre una compra real por separado.',1;
END;

GO
