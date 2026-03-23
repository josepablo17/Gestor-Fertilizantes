import CONFIG from "../config";

export const obtenerProductos = async () => {
  try {
    const respuesta = await fetch(`${CONFIG.API_URL}/Producto/ListarProducto`);

    if (!respuesta.ok) {
      throw new Error("Error al obtener productos");
    }

    return await respuesta.json();
  } catch (error) {
    console.error("Error en API:", error);
    throw error;
  }
};

export const obtenerProductoPorId = async (idProducto) => {
  try {
    const respuesta = await fetch(`${CONFIG.API_URL}/Producto/ObtenerProducto/${idProducto}`);

    if (!respuesta.ok) {
      throw new Error("Error al obtener el producto");
    }

    return await respuesta.json();
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

    if (!respuesta.ok) {
      throw new Error("Error al insertar producto");
    }

    return await respuesta.json();
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

    if (!respuesta.ok) {
      throw new Error("Error al actualizar producto");
    }

    return await respuesta.json();
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

    if (!respuesta.ok) {
      throw new Error("Error al desactivar producto");
    }

    return await respuesta.json();
  } catch (error) {
    console.error("Error en API:", error);
    throw error;
  }
};