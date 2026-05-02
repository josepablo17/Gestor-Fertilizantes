import CONFIG from "../config";

export const obtenerCompras = async () => {
  try {
    const respuesta = await fetch(`${CONFIG.API_URL}/Compra/ListarCompra`);
    const resultado = await respuesta.json();

    if (!respuesta.ok) {
      throw new Error(resultado.mensaje || "Error al obtener compras");
    }

    return resultado.data ?? [];
  } catch (error) {
    console.error("Error en API:", error);
    throw error;
  }
};

export const obtenerCompraPorId = async (idCompra) => {
  try {
    const respuesta = await fetch(`${CONFIG.API_URL}/Compra/ObtenerCompra/${idCompra}`);
    const resultado = await respuesta.json();

    if (!respuesta.ok) {
      throw new Error(resultado.mensaje || "Error al obtener la compra");
    }

    return resultado.data ?? null;
  } catch (error) {
    console.error("Error en API:", error);
    throw error;
  }
};

export const insertarCompra = async (compra) => {
  try {
    const respuesta = await fetch(`${CONFIG.API_URL}/Compra/InsertarCompra`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(compra)
    });

    const resultado = await respuesta.json();

    if (!respuesta.ok) {
      throw new Error(resultado.mensaje || "Error al insertar compra");
    }

    return resultado;
  } catch (error) {
    console.error("Error en API:", error);
    throw error;
  }
};

export const actualizarCompra = async (compra) => {
  try {
    const respuesta = await fetch(`${CONFIG.API_URL}/Compra/ActualizarCompra`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(compra)
    });

    const resultado = await respuesta.json();

    if (!respuesta.ok) {
      throw new Error(resultado.mensaje || "Error al actualizar compra");
    }

    return resultado;
  } catch (error) {
    console.error("Error en API:", error);
    throw error;
  }
};

export const obtenerHistorialComprasPorProducto = async (idProducto) => {
  try {
    const respuesta = await fetch(`${CONFIG.API_URL}/Compra/HistorialPorProducto/${idProducto}`);
    const resultado = await respuesta.json();

    if (!respuesta.ok) {
      throw new Error(resultado.mensaje || "Error al obtener el historial de compras del producto");
    }

    return resultado.data ?? [];
  } catch (error) {
    console.error("Error en API:", error);
    throw error;
  }
};

export const obtenerUltimoPrecioCompra = async (idProducto, idPresentacionProducto) => {
  try {
    const respuesta = await fetch(
      `${CONFIG.API_URL}/Compra/ObtenerUltimoPrecio?idProducto=${idProducto}&idPresentacionProducto=${idPresentacionProducto}`
    );

    const resultado = await respuesta.json();

    if (!respuesta.ok) {
      throw new Error(resultado.mensaje || "Error al obtener el último precio de compra");
    }

    return resultado.data ?? null;
  } catch (error) {
    console.error("Error en API:", error);
    throw error;
  }
};