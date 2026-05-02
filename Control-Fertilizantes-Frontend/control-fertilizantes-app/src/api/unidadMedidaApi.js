import CONFIG from "../config";

export const obtenerUnidadesMedida = async () => {
  try {
    const respuesta = await fetch(`${CONFIG.API_URL}/UnidadMedida/ListarUnidadMedida`);
    const resultado = await respuesta.json();

    if (!respuesta.ok) {
      throw new Error(resultado.mensaje || "Error al obtener las unidades de medida");
    }

    return resultado.data ?? [];
  } catch (error) {
    console.error("Error en API:", error);
    throw error;
  }
};

export const obtenerUnidadMedidaPorId = async (idUnidadMedida) => {
  try {
    const respuesta = await fetch(`${CONFIG.API_URL}/UnidadMedida/ObtenerUnidadMedida/${idUnidadMedida}`);
    const resultado = await respuesta.json();

    if (!respuesta.ok) {
      throw new Error(resultado.mensaje || "Error al obtener la unidad de medida");
    }

    return resultado.data ?? null;
  } catch (error) {
    console.error("Error en API:", error);
    throw error;
  }
};

export const insertarUnidadMedida = async (unidadMedida) => {
  try {
    const respuesta = await fetch(`${CONFIG.API_URL}/UnidadMedida/InsertarUnidadMedida`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(unidadMedida)
    });

    const resultado = await respuesta.json();

    if (!respuesta.ok) {
      throw new Error(resultado.mensaje || "Error al insertar la unidad de medida");
    }

    return resultado;
  } catch (error) {
    console.error("Error en API:", error);
    throw error;
  }
};

export const actualizarUnidadMedida = async (unidadMedida) => {
  try {
    const respuesta = await fetch(`${CONFIG.API_URL}/UnidadMedida/ActualizarUnidadMedida`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(unidadMedida)
    });

    const resultado = await respuesta.json();

    if (!respuesta.ok) {
      throw new Error(resultado.mensaje || "Error al actualizar la unidad de medida");
    }

    return resultado;
  } catch (error) {
    console.error("Error en API:", error);
    throw error;
  }
};

export const desactivarUnidadMedida = async (idUnidadMedida) => {
  try {
    const respuesta = await fetch(`${CONFIG.API_URL}/UnidadMedida/Desactivar/${idUnidadMedida}`, {
      method: "DELETE"
    });

    const resultado = await respuesta.json();

    if (!respuesta.ok) {
      throw new Error(resultado.mensaje || "Error al desactivar la unidad de medida");
    }

    return resultado;
  } catch (error) {
    console.error("Error en API:", error);
    throw error;
  }
};