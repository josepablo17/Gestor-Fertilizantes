import CONFIG from "../config";

export async function obtenerComparativaProveedores({
  idProducto,
  idPresentacionProducto,
  moneda,
  mesesAnalisis,
  soloAutorizados
}) {
  const params = new URLSearchParams();

  params.append("idProducto", idProducto);
  params.append("idPresentacionProducto", idPresentacionProducto);

  if (moneda) params.append("moneda", moneda);
  if (mesesAnalisis) params.append("mesesAnalisis", mesesAnalisis);
  params.append("soloAutorizados", soloAutorizados);

  const response = await fetch(
    `${CONFIG.API_URL}/ComparadorProveedor/Comparar?${params.toString()}`
  );

  if (!response.ok) {
    throw new Error("No se pudo obtener la comparativa de proveedores.");
  }

  return await response.json();
}

export async function obtenerDetalleProveedor({
  idProducto,
  idPresentacionProducto,
  idProveedor,
  moneda,
  mesesAnalisis
}) {
  const params = new URLSearchParams();

  params.append("idProducto", idProducto);
  params.append("idPresentacionProducto", idPresentacionProducto);
  params.append("idProveedor", idProveedor);

  if (moneda) params.append("moneda", moneda);
  if (mesesAnalisis) params.append("mesesAnalisis", mesesAnalisis);

  const response = await fetch(
    `${CONFIG.API_URL}/ComparadorProveedor/DetalleProveedor?${params.toString()}`
  );

  if (!response.ok) {
    throw new Error("No se pudo obtener el detalle del proveedor.");
  }

  return await response.json();
}