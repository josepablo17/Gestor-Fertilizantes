export function filtrarProveedores(proveedores,busqueda,filtroEstado){
    const textoBusqueda = busqueda.toLowerCase().trim();

    return proveedores.filter((proveedor)=>{
        const coincideBusqueda=
        proveedor.nombre?.toLowerCase().includes(textoBusqueda)||
        proveedor.contacto?.toLowerCase().includes(textoBusqueda)||
        proveedor.correo?.toLowerCase().includes(textoBusqueda)||
        proveedor.telefono?.toLowerCase().includes(textoBusqueda);

        const coincideEstado =
        filtroEstado ==="todos"||
        (filtroEstado === "activos" && proveedor.activo) ||
        (filtroEstado === "inactivos" && !proveedor.activo);

        return coincideBusqueda && coincideEstado;
    });
}
