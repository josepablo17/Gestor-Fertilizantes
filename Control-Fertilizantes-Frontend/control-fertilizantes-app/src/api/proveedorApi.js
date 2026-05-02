import CONFIG from "../config";

export const obtenerProveedores = async () => {
  try {
    const respuesta = await fetch(`${CONFIG.API_URL}/Proveedor/ListarProveedor`);
    const resultado = await respuesta.json();

    if (!respuesta.ok) {
      throw new Error(resultado.mensaje || "Error al obtener los proveedores");
    }

    return resultado.data ?? [];
  } catch (error) {
    console.error("Error en API:", error);
    throw error;
  }
};

export const obtenerProveedorPorId = async (idProveedor) => {
  try {
    const respuesta = await fetch(`${CONFIG.API_URL}/Proveedor/ObtenerProveedor/${idProveedor}`);
    const resultado = await respuesta.json();

    if (!respuesta.ok) {
      throw new Error(resultado.mensaje || "Error al obtener el proveedor");
    }

    return resultado.data ?? null;
  } catch (error) {
    console.error("Error en API:", error);
    throw error;
  }
};

export const insertarProveedor = async (proveedor) => {
  try {
    const respuesta = await fetch(`${CONFIG.API_URL}/Proveedor/InsertarProveedor`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(proveedor)
    });

    const resultado = await respuesta.json();

    if (!respuesta.ok) {
      throw new Error(resultado.mensaje || "Error al insertar proveedor");
    }

    return resultado;
  } catch (error) {
    console.error("Error en API:", error);
    throw error;
  }
};

export const actualizarProveedor = async (proveedor) => {
  try {
    const respuesta = await fetch(`${CONFIG.API_URL}/Proveedor/ActualizarProveedor`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(proveedor)
    });

    const resultado = await respuesta.json();

    if (!respuesta.ok) {
      throw new Error(resultado.mensaje || "Error al actualizar el proveedor");
    }

    return resultado;
  } catch (error) {
    console.error("Error en API:", error);
    throw error;
  }
};

export const desactivarProveedor = async (idProveedor) => {
  try {
    const respuesta = await fetch(`${CONFIG.API_URL}/Proveedor/Desactivar/${idProveedor}`, {
      method: "DELETE"
    });

    const resultado = await respuesta.json();

    if (!respuesta.ok) {
      throw new Error(resultado.mensaje || "Error al desactivar proveedor");
    }

    return resultado;
  } catch (error) {
    console.error("Error en API:", error);
    throw error;
  }
};