import CONFIG from "../config";

export const obtenerProveedores = async () => {
    try {
        const respuesta = await fetch(`${CONFIG.API_URL}/Proveedor/ListarProveedor`);

        if (!respuesta.ok) {
            throw new Error("Error al obtener los proveedores");
        }
        return await respuesta.json();
    } catch (error) {
        console.error("Error en API")
        throw error;
    }
};

export const obtenerProveedorPorId = async (idProveedor) => {
    try {
        const respuesta = await fetch(`${CONFIG.API_URL}/Proveedor/ObtenerProveedor/${idProveedor}`);

        if (!respuesta.ok) {
            throw new Error("Error al obtener el proveedor");
        }

        return await respuesta.json();
    } catch (error) {
        console.error("Error en API");
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

        if (!respuesta.ok) {
            throw new Error("Error al insertar proveedor");
        }

        return await respuesta.json();
    } catch (error) {
        console.error("Error en API");
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

        if (!respuesta.ok) {
            throw new Error("Error al actualizar el proveedor")
        }
        return await respuesta.json();
    } catch (error) {
        console.error("Error en el API");
        throw error;
    }
};

export const desactivarProveedor = async (idProveedor) => {
    try {
        const respuesta = await fetch(`${CONFIG.API_URL}/Proveedor/Desactivar/${idProveedor}`, {
            method: "DELETE"
        });
        if (!respuesta.ok) {
            throw new Error("Error al desactivar proveedor");
        }
        return await respuesta.json();
    } catch (error) {
        console.error("Error en el API");
        throw error;
    }
};