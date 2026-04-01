export function obtenerProductosDisponibles(presentacionesProducto) {
  const productosUnicos = [
    ...new Set(
      presentacionesProducto
        .map((presentacion) => presentacion.nombreProducto?.trim())
        .filter((producto) => producto && producto.length > 0)
    )
  ];

  return productosUnicos.sort((a, b) => a.localeCompare(b));
}

export function obtenerUnidadesMedidaDisponibles(presentacionesProducto) {
  const unidadesUnicas = [
    ...new Set(
      presentacionesProducto
        .map((presentacion) => presentacion.nombreUnidadMedida?.trim())
        .filter((unidad) => unidad && unidad.length > 0)
    )
  ];

  return unidadesUnicas.sort((a, b) => a.localeCompare(b));
}

export function filtrarPresentacionesProducto(
  presentacionesProducto,
  busqueda,
  filtroEstado,
  filtroProducto,
  filtroUnidadMedida
) {
  const textoBusqueda = busqueda.toLowerCase().trim();

  return presentacionesProducto.filter((presentacion) => {
    const coincideBusqueda =
      presentacion.nombreProducto?.toLowerCase().includes(textoBusqueda) ||
      presentacion.descripcion?.toLowerCase().includes(textoBusqueda) ||
      presentacion.nombreUnidadMedida?.toLowerCase().includes(textoBusqueda) ||
      presentacion.cantidad?.toString().includes(textoBusqueda) ||
      presentacion.cantidadNormalizada?.toString().includes(textoBusqueda);

    const coincideEstado =
      filtroEstado === "todos" ||
      (filtroEstado === "activos" && presentacion.activo) ||
      (filtroEstado === "inactivos" && !presentacion.activo);

    const coincideProducto =
      filtroProducto === "todos" ||
      (presentacion.nombreProducto && presentacion.nombreProducto === filtroProducto);

    const coincideUnidadMedida =
      filtroUnidadMedida === "todas" ||
      (presentacion.nombreUnidadMedida &&
        presentacion.nombreUnidadMedida === filtroUnidadMedida);

    return coincideBusqueda && coincideEstado && coincideProducto && coincideUnidadMedida;
  });
}

export function obtenerTextoResumen(total, filtrados) {
  if (total === 0) {
    return "No hay presentaciones de producto registradas.";
  }

  if (filtrados === total) {
    return `Mostrando ${total} presentacion${total !== 1 ? "es" : ""} de producto.`;
  }

  return `Mostrando ${filtrados} de ${total} presentacion${total !== 1 ? "es" : ""} de producto.`;
}