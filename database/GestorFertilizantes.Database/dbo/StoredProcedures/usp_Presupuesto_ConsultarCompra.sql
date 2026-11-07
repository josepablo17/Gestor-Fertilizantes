CREATE PROCEDURE dbo.usp_Presupuesto_ConsultarCompra @IdCompra bigint
AS
BEGIN
    SET NOCOUNT ON;
    IF NOT EXISTS (SELECT 1 FROM dbo.Compras WHERE IdCompra=@IdCompra)
        THROW 52004,N'La compra no existe.',1;
    SELECT p.IdPresupuesto, p.Nombre AS Presupuesto, f.Nombre AS Finca, r.Nombre AS Rubro, p.Estado,
        m.CambioEjecutado AS Monto, m.IdCompromisoDetalle
    FROM dbo.vw_ComprasImputadasPresupuesto AS m
    JOIN dbo.PartidasPresupuesto AS pp ON pp.IdPartidaPresupuesto=m.IdPartidaPresupuesto
    JOIN dbo.Presupuestos AS p ON p.IdPresupuesto=pp.IdPresupuesto
    JOIN dbo.RubrosPresupuesto AS r ON r.IdRubroPresupuesto=pp.IdRubroPresupuesto
    LEFT JOIN dbo.Fincas AS f ON f.IdFinca=p.IdFinca
    WHERE m.IdCompra=@IdCompra ORDER BY p.Nombre,r.Nombre;
END;
