CREATE PROCEDURE dbo.usp_Presupuesto_OpcionesImputacion @Fecha date,@Moneda char(3),
    @IdProducto int=NULL,@IdPresentacionProducto int=NULL,@IdProveedor int=NULL
AS
BEGIN
    SET NOCOUNT ON;
    SELECT s.IdPartidaPresupuesto, s.IdPresupuesto, p.Nombre AS Presupuesto, f.Nombre AS Finca, r.Nombre AS Rubro, s.Disponible
    FROM dbo.vw_SaldosPresupuesto AS s JOIN dbo.Presupuestos AS p ON p.IdPresupuesto=s.IdPresupuesto
    JOIN dbo.RubrosPresupuesto AS r ON r.IdRubroPresupuesto=s.IdRubroPresupuesto
    LEFT JOIN dbo.Fincas AS f ON f.IdFinca=p.IdFinca
    WHERE p.Estado='Aprobado' AND p.Moneda=@Moneda AND @Fecha BETWEEN p.FechaInicio AND p.FechaFin
    ORDER BY p.Nombre,r.Nombre,s.IdPartidaPresupuesto;

    SELECT d.IdCompromisoDetalle,d.IdCompromisoCompra,d.IdPartidaPresupuesto,d.Pendiente,c.FechaCompromiso,
        o.NombreProductoOriginal AS Producto,pv.Nombre AS Proveedor
    FROM dbo.vw_SaldosCompromisoCompra AS d JOIN dbo.CompromisosCompra AS c ON c.IdCompromisoCompra=d.IdCompromisoCompra
    JOIN dbo.PartidasPresupuesto AS pp ON pp.IdPartidaPresupuesto=d.IdPartidaPresupuesto
    JOIN dbo.Presupuestos AS p ON p.IdPresupuesto=pp.IdPresupuesto
    LEFT JOIN dbo.ProformasProveedorDetalle AS o ON o.IdProformaProveedorDetalle=d.IdProformaProveedorDetalle
    LEFT JOIN dbo.ProformasProveedor AS pr ON pr.IdProformaProveedor=o.IdProformaProveedor
    LEFT JOIN dbo.Proveedores AS pv ON pv.IdProveedor=pr.IdProveedor
    WHERE @IdProducto IS NOT NULL AND @IdPresentacionProducto IS NOT NULL AND @IdProveedor IS NOT NULL
        AND c.Estado='Abierto' AND p.Estado='Aprobado' AND p.Moneda=@Moneda
        AND @Fecha BETWEEN p.FechaInicio AND p.FechaFin AND c.FechaCompromiso<=@Fecha
        AND (o.IdProformaProveedorDetalle IS NULL OR
            (o.IdProducto=@IdProducto AND o.IdPresentacionProducto=@IdPresentacionProducto AND pr.IdProveedor=@IdProveedor))
    ORDER BY c.FechaCompromiso DESC,d.IdCompromisoDetalle DESC;
END;
