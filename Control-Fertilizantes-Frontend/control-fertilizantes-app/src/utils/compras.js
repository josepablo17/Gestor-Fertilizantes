export function obtenerMonedasDisponibles(compras) {
  const monedasUnicas = [
    ...new Set(
      compras
        .map((compra) => compra.moneda?.trim())
        .filter((moneda) => moneda && moneda.length > 0)
    )
  ];

  return monedasUnicas.sort((a, b) => a.localeCompare(b));
}

export function obtenerTendenciasDisponibles(compras) {
  const tendenciasUnicas = [
    ...new Set(
      compras
        .map((compra) => compra.tendenciaPrecio?.trim())
        .filter((tendencia) => tendencia && tendencia.length > 0)
    )
  ];

  return tendenciasUnicas.sort((a, b) => a.localeCompare(b));
}

export function filtrarCompras(
  compras,
  busquedaProducto,
  busquedaProveedor,
  filtroMoneda,
  filtroTendencia,
  filtroFecha
) {
  const textoProducto = busquedaProducto.toLowerCase().trim();
  const textoProveedor = busquedaProveedor.toLowerCase().trim();

  return compras.filter((compra) => {
    const coincideProducto =
      !textoProducto ||
      compra.nombreProducto?.toLowerCase().includes(textoProducto) ||
      compra.categoria?.toLowerCase().includes(textoProducto) ||
      compra.marca?.toLowerCase().includes(textoProducto) ||
      compra.presentacion?.toLowerCase().includes(textoProducto) ||
      compra.unidadMedida?.toLowerCase().includes(textoProducto);

    const coincideProveedor =
      !textoProveedor ||
      compra.nombreProveedor?.toLowerCase().includes(textoProveedor);

    const coincideMoneda =
      filtroMoneda === "todas" ||
      (compra.moneda && compra.moneda === filtroMoneda);

    const coincideTendencia =
      filtroTendencia === "todas" ||
      (compra.tendenciaPrecio && compra.tendenciaPrecio === filtroTendencia);

    const coincideFecha =
      !filtroFecha ||
      compra.fechaCompra?.split("T")[0] === filtroFecha;

    return (
      coincideProducto &&
      coincideProveedor &&
      coincideMoneda &&
      coincideTendencia &&
      coincideFecha
    );
  });
}

export function obtenerTextoResumen(total, filtrados) {
  if (total === 0) {
    return "No hay compras registradas.";
  }

  if (filtrados === total) {
    return `Mostrando ${total} compra${total !== 1 ? "s" : ""}.`;
  }

  return `Mostrando ${filtrados} de ${total} compra${total !== 1 ? "s" : ""}.`;
}