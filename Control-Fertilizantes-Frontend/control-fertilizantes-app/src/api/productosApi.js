import CONFIG from "../config";

export const obtenerProductos = async () => {
  try {
    const respuesta = await fetch(`${CONFIG.API_URL}/Producto/ListarProducto`);
    const resultado = await respuesta.json();

    if (!respuesta.ok) {
      throw new Error(resultado.mensaje || "Error al obtener productos");
    }

    return resultado.data ?? [];
  } catch (error) {
    console.error("Error en API:", error);
    throw error;
  }
};

export const obtenerProductoPorId = async (idProducto) => {
  try {
    const respuesta = await fetch(`${CONFIG.API_URL}/Producto/ObtenerProducto/${idProducto}`);
    const resultado = await respuesta.json();

    if (!respuesta.ok) {
      throw new Error(resultado.mensaje || "Error al obtener el producto");
    }

    return resultado.data ?? null;
  } catch (error) {
    console.error("Error en API:", error);
    throw error;
  }
};

export const insertarProducto = async (producto) => {
  try {
    const respuesta = await fetch(`${CONFIG.API_URL}/Producto/InsertarProducto`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(producto)
    });

    const resultado = await respuesta.json();

    if (!respuesta.ok) {
      throw new Error(resultado.mensaje || "Error al insertar producto");
    }

    return resultado;
  } catch (error) {
    console.error("Error en API:", error);
    throw error;
  }
};

export const actualizarProducto = async (producto) => {
  try {
    const respuesta = await fetch(`${CONFIG.API_URL}/Producto/ActualizarProducto`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(producto)
    });

    const resultado = await respuesta.json();

    if (!respuesta.ok) {
      throw new Error(resultado.mensaje || "Error al actualizar producto");
    }

    return resultado;
  } catch (error) {
    console.error("Error en API:", error);
    throw error;
  }
};

export const desactivarProducto = async (idProducto) => {
  try {
    const respuesta = await fetch(`${CONFIG.API_URL}/Producto/Desactivar/${idProducto}`, {
      method: "DELETE"
    });

    const resultado = await respuesta.json();

    if (!respuesta.ok) {
      throw new Error(resultado.mensaje || "Error al desactivar producto");
    }

    return resultado;
  } catch (error) {
    console.error("Error en API:", error);
    throw error;
  }
};