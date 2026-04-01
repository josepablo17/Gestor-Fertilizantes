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

export function obtenerTextoResumen(total, filtrados) {
  if (total === 0) {
    return "No hay proveedores registrados.";
  }

  if (filtrados === total) {
    return `Mostrando ${total} proveedor${total !== 1 ? "es" : ""}.`;
  }

  return `Mostrando ${filtrados} de ${total} proveedor${total !== 1 ? "es" : ""}.`;
}