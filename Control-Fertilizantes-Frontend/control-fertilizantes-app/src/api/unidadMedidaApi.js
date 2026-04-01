import CONFIG from "../config";

export const obtenerUnidadesMedida = async () => {
    try {
        const respuesta = await fetch(`${CONFIG.API_URL}/UnidadMedida/ListarUnidadesMedida`);

        if (!respuesta.ok) {
            throw new Error("Error al obtener las unidades de medida");
        }

        return await respuesta.json();
    } catch (error) {
        console.error("Error en API");
        throw error;
    }
};

export const obtenerUnidadMedidaPorId = async (idUnidadMedida) => {
    try {
        const respuesta = await fetch(`${CONFIG.API_URL}/UnidadMedida/ObtenerUnidadMedida/${idUnidadMedida}`);

        if (!respuesta.ok) {
            throw new Error("Error al obtener la unidad de medida");
        }

        return await respuesta.json();
    } catch (error) {
        console.error("Error en API");
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

        if (!respuesta.ok) {
            throw new Error("Error al insertar la unidad de medida");
        }

        return await respuesta.json();
    } catch (error) {
        console.error("Error en API");
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

        if (!respuesta.ok) {
            throw new Error("Error al actualizar la unidad de medida");
        }

        return await respuesta.json();
        
    } catch (error) {
        console.error("Error en el API");
        throw error;
    }
};

export const desactivarUnidadMedida = async (idUnidadMedida) => {
    try {
        const respuesta = await fetch(`${CONFIG.API_URL}/UnidadMedida/Desactivar/${idUnidadMedida}`, {
            method: "DELETE"
        });

        if (!respuesta.ok) {
            throw new Error("Error al desactivar la unidad de medida");
        }

        return await respuesta.json();
    } catch (error) {
        console.error("Error en el API");
        throw error;
    }
};