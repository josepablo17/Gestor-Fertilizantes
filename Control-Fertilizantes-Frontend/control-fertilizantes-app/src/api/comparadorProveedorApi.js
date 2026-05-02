import CONFIG from "../config";

export async function obtenerComparativaProveedores({
  idProducto,
  idPresentacionProducto,
  moneda,
  mesesAnalisis,
  soloAutorizados
}) {
  try {
    const params = new URLSearchParams();

    params.append("idProducto", idProducto);
    params.append("idPresentacionProducto", idPresentacionProducto);

    if (moneda) params.append("moneda", moneda);
    if (mesesAnalisis) params.append("mesesAnalisis", mesesAnalisis);
    params.append("soloAutorizados", soloAutorizados);

    const respuesta = await fetch(
      `${CONFIG.API_URL}/ComparadorProveedor/Comparar?${params.toString()}`
    );

    const resultado = await respuesta.json();

    if (!respuesta.ok) {
      throw new Error(resultado.mensaje || "No se pudo obtener la comparativa de proveedores.");
    }

    return resultado.data ?? [];
  } catch (error) {
    console.error("Error en obtenerComparativaProveedores:", error);
    throw error;
  }
}

export async function obtenerDetalleProveedor({
  idProducto,
  idPresentacionProducto,
  idProveedor,
  moneda,
  mesesAnalisis
}) {
  try {
    const params = new URLSearchParams();

    params.append("idProducto", idProducto);
    params.append("idPresentacionProducto", idPresentacionProducto);
    params.append("idProveedor", idProveedor);

    if (moneda) params.append("moneda", moneda);
    if (mesesAnalisis) params.append("mesesAnalisis", mesesAnalisis);

    const respuesta = await fetch(
      `${CONFIG.API_URL}/ComparadorProveedor/DetalleProveedor?${params.toString()}`
    );

    const resultado = await respuesta.json();

    if (!respuesta.ok) {
      throw new Error(resultado.mensaje || "No se pudo obtener el detalle del proveedor.");
    }

    return resultado.data ?? null;
  } catch (error) {
    console.error("Error en obtenerDetalleProveedor:", error);
    throw error;
  }
}