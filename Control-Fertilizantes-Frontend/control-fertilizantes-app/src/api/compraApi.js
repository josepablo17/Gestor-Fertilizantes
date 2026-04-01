import CONFIG from "../config";

export const obtenerCompras = async () => {
  try {
    const respuesta = await fetch(`${CONFIG.API_URL}/Compra/ListarCompra`);

    if (!respuesta.ok) {
      throw new Error("Error al obtener compras");
    }

    return await respuesta.json();
  } catch (error) {
    console.error("Error en API:", error);
    throw error;
  }
};

export const obtenerCompraPorId = async (idCompra) => {
  try {
    const respuesta = await fetch(`${CONFIG.API_URL}/Compra/ObtenerCompra/${idCompra}`);

    if (!respuesta.ok) {
      throw new Error("Error al obtener la compra");
    }

    return await respuesta.json();
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

    if (!respuesta.ok) {
      throw new Error("Error al insertar compra");
    }

    return await respuesta.json();
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

    if (!respuesta.ok) {
      throw new Error("Error al actualizar compra");
    }

    return await respuesta.json();
  } catch (error) {
    console.error("Error en API:", error);
    throw error;
  }
};

export const obtenerHistorialComprasPorProducto = async (idProducto) => {
  try {
    const respuesta = await fetch(`${CONFIG.API_URL}/Compra/HistorialPorProducto/${idProducto}`);

    if (!respuesta.ok) {
      throw new Error("Error al obtener el historial de compras del producto");
    }

    return await respuesta.json();
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

    if (!respuesta.ok) {
      throw new Error("Error al obtener el último precio de compra");
    }

    return await respuesta.json();
  } catch (error) {
    console.error("Error en API:", error);
    throw error;
  }
};