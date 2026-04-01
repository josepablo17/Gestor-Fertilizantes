import CONFIG from "../config";

export const obtenerHistorialPrecios = async (idProducto, idPresentacionProducto) => {
    try {
        const respuesta = await fetch(
            `${CONFIG.API_URL}/CompraInteligencia/HistorialPrecios?idProducto=${idProducto}&idPresentacionProducto=${idPresentacionProducto}`
        );

        if (!respuesta.ok) {
            throw new Error("Error al obtener el historial de precios.");
        }

        return await respuesta.json();
    } catch (error) {
        console.error("Error en obtenerHistorialPrecios:", error);
        throw error;
    }
};

export const obtenerResumenInteligentePrecios = async (idProducto, idPresentacionProducto) => {
    try {
        const respuesta = await fetch(
            `${CONFIG.API_URL}/CompraInteligencia/ResumenInteligentePrecios?idProducto=${idProducto}&idPresentacionProducto=${idPresentacionProducto}`
        );

        if (respuesta.status === 404) {
            return null;
        }

        if (!respuesta.ok) {
            throw new Error("Error al obtener el resumen inteligente de precios.");
        }

        return await respuesta.json();
    } catch (error) {
        console.error("Error en obtenerResumenInteligentePrecios:", error);
        throw error;
    }
};

export const evaluarCompra = async (idCompra) => {
    try {
        const respuesta = await fetch(
            `${CONFIG.API_URL}/CompraInteligencia/EvaluarCompra/${idCompra}`
        );

        if (respuesta.status === 404) {
            return null;
        }

        if (!respuesta.ok) {
            throw new Error("Error al evaluar la compra.");
        }

        return await respuesta.json();
    } catch (error) {
        console.error("Error en evaluarCompra:", error);
        throw error;
    }
};

export const obtenerAlertasCompra = async (idProducto, idPresentacionProducto) => {
    try {
        const respuesta = await fetch(
            `${CONFIG.API_URL}/CompraInteligencia/Alertas?idProducto=${idProducto}&idPresentacionProducto=${idPresentacionProducto}`
        );

        if (!respuesta.ok) {
            throw new Error("Error al obtener las alertas de compra.");
        }

        return await respuesta.json();
    } catch (error) {
        console.error("Error en obtenerAlertasCompra:", error);
        throw error;
    }
};