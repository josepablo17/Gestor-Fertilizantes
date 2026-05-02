import CONFIG from "../config";

export const obtenerPresentacionesProducto = async () => {
  try {
    const respuesta = await fetch(`${CONFIG.API_URL}/PresentacionProducto/ListarPresentacionesProducto`);
    const resultado = await respuesta.json();

    if (!respuesta.ok) {
      throw new Error(resultado.mensaje || "Error al obtener presentaciones de producto");
    }

    return resultado.data ?? [];
  } catch (error) {
    console.error("Error en API:", error);
    throw error;
  }
};

export const obtenerPresentacionProductoPorId = async (idPresentacionProducto) => {
  try {
    const respuesta = await fetch(`${CONFIG.API_URL}/PresentacionProducto/ObtenerPresentacionProducto/${idPresentacionProducto}`);
    const resultado = await respuesta.json();

    if (!respuesta.ok) {
      throw new Error(resultado.mensaje || "Error al obtener la presentación del producto");
    }

    return resultado.data ?? null;
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

    const resultado = await respuesta.json();

    if (!respuesta.ok) {
      throw new Error(resultado.mensaje || "Error al insertar presentación del producto");
    }

    return resultado;
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

    const resultado = await respuesta.json();

    if (!respuesta.ok) {
      throw new Error(resultado.mensaje || "Error al actualizar presentación del producto");
    }

    return resultado;
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

    const resultado = await respuesta.json();

    if (!respuesta.ok) {
      throw new Error(resultado.mensaje || "Error al desactivar presentación del producto");
    }

    return resultado;
  } catch (error) {
    console.error("Error en API:", error);
    throw error;
  }
};

// =========================
// DROPDOWNS
// =========================

export const obtenerProductosDropdown = async () => {
  try {
    const respuesta = await fetch(`${CONFIG.API_URL}/PresentacionProducto/ListarProductosDropdown`);
    const resultado = await respuesta.json();

    if (!respuesta.ok) {
      throw new Error(resultado.mensaje || "Error al obtener productos para dropdown");
    }

    return resultado.data ?? [];
  } catch (error) {
    console.error("Error en API:", error);
    throw error;
  }
};

export const obtenerUnidadesMedidaDropdown = async () => {
  try {
    const respuesta = await fetch(`${CONFIG.API_URL}/PresentacionProducto/ListarUnidadesMedidaDropdown`);
    const resultado = await respuesta.json();

    if (!respuesta.ok) {
      throw new Error(resultado.mensaje || "Error al obtener unidades de medida para dropdown");
    }

    return resultado.data ?? [];
  } catch (error) {
    console.error("Error en API:", error);
    throw error;
  }
};