import CONFIG from "../config";

export const obtenerProformasProveedor = async () => {
  try {
    const respuesta = await fetch(
      `${CONFIG.API_URL}/ProformaProveedor/ListarProformasProveedor`
    );

    const resultado = await respuesta.json();

    if (!respuesta.ok) {
      throw new Error(resultado.mensaje || "Error al obtener las proformas");
    }

    return resultado.data ?? [];
  } catch (error) {
    console.error("Error en API:", error);
    throw error;
  }
};

export const obtenerProformaProveedorPorId = async (idProformaProveedor) => {
  try {
    const respuesta = await fetch(
      `${CONFIG.API_URL}/ProformaProveedor/ObtenerProformaProveedor/${idProformaProveedor}`
    );

    const resultado = await respuesta.json();

    if (!respuesta.ok) {
      throw new Error(resultado.mensaje || "Error al obtener la proforma");
    }

    return resultado.data ?? null;
  } catch (error) {
    console.error("Error en API:", error);
    throw error;
  }
};

export const guardarProformaProveedor = async (proforma) => {
  try {
    const respuesta = await fetch(
      `${CONFIG.API_URL}/ProformaProveedor/GuardarProformaProveedor`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(proforma)
      }
    );

    const resultado = await respuesta.json();

    if (!respuesta.ok) {
      throw new Error(resultado.mensaje || "Error al guardar la proforma");
    }

    return resultado.data ?? resultado;
  } catch (error) {
    console.error("Error en API:", error);
    throw error;
  }
};