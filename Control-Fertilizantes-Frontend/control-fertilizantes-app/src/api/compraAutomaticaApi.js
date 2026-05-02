import CONFIG from "../config";

export const obtenerVistaPreviaValidada = async (archivoPdf) => {
  try {
    const formData = new FormData();
    formData.append("ArchivoPdf", archivoPdf);

    const respuesta = await fetch(
      `${CONFIG.API_URL}/CompraAutomatica/VistaPreviaValidada`,
      {
        method: "POST",
        body: formData
      }
    );

    const resultado = await respuesta.json();

    if (!respuesta.ok) {
      throw new Error(
        resultado.mensaje ||
        resultado.Mensaje ||
        "Error al generar la vista previa validada"
      );
    }

    return resultado.data ?? resultado.Data ?? null;
  } catch (error) {
    console.error("Error en API:", error);
    throw error;
  }
};

export const confirmarComprasAutomaticas = async (confirmacionCompra) => {
  try {
    console.log("Entrando al API ConfirmarCompras:", confirmacionCompra);

    const respuesta = await fetch(
      `${CONFIG.API_URL}/CompraAutomatica/ConfirmarCompras`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(confirmacionCompra)
      }
    );

    const resultado = await respuesta.json();

    console.log("Status ConfirmarCompras:", respuesta.status);
    console.log("Respuesta ConfirmarCompras:", resultado);

    if (!respuesta.ok) {
      throw new Error(
        resultado.mensaje ||
          resultado.Mensaje ||
          "Error al confirmar las compras automáticas"
      );
    }

    return resultado;
  } catch (error) {
    console.error("Error en API:", error);
    throw error;
  }
};