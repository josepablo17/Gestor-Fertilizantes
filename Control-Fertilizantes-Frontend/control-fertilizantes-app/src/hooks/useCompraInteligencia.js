import { useCallback, useEffect, useState } from "react";
import {
    obtenerHistorialPrecios,
    obtenerResumenInteligentePrecios,
    evaluarCompra,
    obtenerAlertasCompra
} from "../api/compraInteligenciaApi";

function useCompraInteligencia(idProducto, idPresentacionProducto) {
    const [historial, setHistorial] = useState([]);
    const [resumen, setResumen] = useState(null);
    const [evaluacion, setEvaluacion] = useState(null);
    const [alertas, setAlertas] = useState([]);
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState(null);

    const cargarDatos = useCallback(async () => {
        if (!idProducto || !idPresentacionProducto) {
            setHistorial([]);
            setResumen(null);
            setEvaluacion(null);
            setAlertas([]);
            setError(null);
            return;
        }

        try {
            setCargando(true);
            setError(null);

            const datosHistorial = await obtenerHistorialPrecios(idProducto, idPresentacionProducto);
            setHistorial(datosHistorial);

            const datosResumen = await obtenerResumenInteligentePrecios(idProducto, idPresentacionProducto);
            setResumen(datosResumen);

            const datosAlertas = await obtenerAlertasCompra(idProducto, idPresentacionProducto);
            setAlertas(datosAlertas);

            if (datosHistorial && datosHistorial.length > 0) {
                const ultimaCompra = datosHistorial[datosHistorial.length - 1];
                const idCompra = ultimaCompra.idCompra ?? ultimaCompra.idCompra;

                if (idCompra) {
                    const datosEvaluacion = await evaluarCompra(idCompra);
                    setEvaluacion(datosEvaluacion);
                } else {
                    setEvaluacion(null);
                }
            } else {
                setEvaluacion(null);
            }
        } catch (err) {
            console.error(err);
            setError("No se pudo cargar la información inteligente de compras.");
            setHistorial([]);
            setResumen(null);
            setEvaluacion(null);
            setAlertas([]);
        } finally {
            setCargando(false);
        }
    }, [idProducto, idPresentacionProducto]);

    useEffect(() => {
        cargarDatos();
    }, [cargarDatos]);

    return {
        historial,
        resumen,
        evaluacion,
        alertas,
        cargando,
        error,
        cargarDatos
    };
}

export default useCompraInteligencia;