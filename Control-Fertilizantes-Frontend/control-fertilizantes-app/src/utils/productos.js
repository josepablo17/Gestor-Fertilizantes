export function obtenerCategoriasDisponibles(productos) {
  const categoriasUnicas = [
    ...new Set(
      productos
        .map((producto) => producto.categoria?.trim())
        .filter((categoria) => categoria && categoria.length > 0)
    )
  ];

  return categoriasUnicas.sort((a, b) => a.localeCompare(b));
}

export function filtrarProductos(productos, busqueda, filtroEstado, filtroCategoria) {
  const textoBusqueda = busqueda.toLowerCase().trim();

  return productos.filter((producto) => {
    const coincideBusqueda =
      producto.nombre?.toLowerCase().includes(textoBusqueda) ||
      producto.categoria?.toLowerCase().includes(textoBusqueda) ||
      producto.marca?.toLowerCase().includes(textoBusqueda) ||
      producto.descripcion?.toLowerCase().includes(textoBusqueda);

    const coincideEstado =
      filtroEstado === "todos" ||
      (filtroEstado === "activos" && producto.activo) ||
      (filtroEstado === "inactivos" && !producto.activo);

    const coincideCategoria =
      filtroCategoria === "todas" ||
      (producto.categoria && producto.categoria === filtroCategoria);

    return coincideBusqueda && coincideEstado && coincideCategoria;
  });
}

export function obtenerTextoResumen(total, filtrados) {
  if (total === 0) {
    return "No hay productos registrados.";
  }

  if (filtrados === total) {
    return `Mostrando ${total} producto${total !== 1 ? "s" : ""}.`;
  }

  return `Mostrando ${filtrados} de ${total} producto${total !== 1 ? "s" : ""}.`;
}