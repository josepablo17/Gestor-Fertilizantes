import CONFIG from "../config";

export const obtenerPresentacionesProducto = async () => {
  try {
    const respuesta = await fetch(`${CONFIG.API_URL}/PresentacionProducto/ListarPresentacionesProducto`);

    if (!respuesta.ok) {
      throw new Error("Error al obtener presentaciones de producto");
    }

    return await respuesta.json();
  } catch (error) {
    console.error("Error en API:", error);
    throw error;
  }
};

export const obtenerPresentacionProductoPorId = async (idPresentacionProducto) => {
  try {
    const respuesta = await fetch(`${CONFIG.API_URL}/PresentacionProducto/ObtenerPresentacionProducto/${idPresentacionProducto}`);

    if (!respuesta.ok) {
      throw new Error("Error al obtener la presentación del producto");
    }

    return await respuesta.json();
  } catch (error) {
    console.error("Error en API:", error);
    throw error;
  }
};

export const insertarPresentacionProducto = async (presentacion) => {
  try {
    const respuesta = await fetch(`${CONFIG.API_URL}/PresentacionProducto/InsertarPresentacionProducto`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(presentacion)
    });

    if (!respuesta.ok) {
      throw new Error("Error al insertar presentación del producto");
    }

    return await respuesta.json();
  } catch (error) {
    console.error("Error en API:", error);
    throw error;
  }
};

export const actualizarPresentacionProducto = async (presentacion) => {
  try {
    const respuesta = await fetch(`${CONFIG.API_URL}/PresentacionProducto/ActualizarPresentacionProducto`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(presentacion)
    });

    if (!respuesta.ok) {
      throw new Error("Error al actualizar presentación del producto");
    }

    return await respuesta.json();
  } catch (error) {
    console.error("Error en API:", error);
    throw error;
  }
};

export const desactivarPresentacionProducto = async (idPresentacionProducto) => {
  try {
    const respuesta = await fetch(`${CONFIG.API_URL}/PresentacionProducto/DesactivarPresentacionProducto/${idPresentacionProducto}`, {
      method: "DELETE"
    });

    if (!respuesta.ok) {
      throw new Error("Error al desactivar presentación del producto");
    }

    return await respuesta.json();
  } catch (error) {
    console.error("Error en API:", error);
    throw error;
  }
};

// =========================
//  DROPDOWNS
// =========================

export const obtenerProductosDropdown = async () => {
  try {
    const respuesta = await fetch(`${CONFIG.API_URL}/PresentacionProducto/ListarProductosDropdown`);

    if (!respuesta.ok) {
      throw new Error("Error al obtener productos para dropdown");
    }

    return await respuesta.json();
  } catch (error) {
    console.error("Error en API:", error);
    throw error;
  }
};

export const obtenerUnidadesMedidaDropdown = async () => {
  try {
    const respuesta = await fetch(`${CONFIG.API_URL}/PresentacionProducto/ListarUnidadesMedidaDropdown`);

    if (!respuesta.ok) {
      throw new Error("Error al obtener unidades de medida para dropdown");
    }

    return await respuesta.json();
  } catch (error) {
    console.error("Error en API:", error);
    throw error;
  }
};