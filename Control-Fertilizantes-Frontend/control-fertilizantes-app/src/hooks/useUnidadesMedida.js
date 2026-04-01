import { useCallback, useEffect, useState } from "react";
import { desactivarUnidadMedida, obtenerUnidadesMedida } from "../api/unidadMedidaApi";
import { mostrarConfirmacion, mostrarError, mostrarExito } from "../utils/alertas";

function useUnidadesMedida(recargar, onUnidadMedidaDesactivada) {
    const [unidadesMedida, setUnidadesMedida] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);

    const cargarUnidadesMedida = useCallback(async () => {
        try {
            setCargando(true);
            setError(null);

            const data = await obtenerUnidadesMedida();
            setUnidadesMedida(data);
        } catch (err) {
            setError("No se pueden cargar las unidades de medida.");
            console.error(err);
        } finally {
            setCargando(false);
        }
    }, []);

    useEffect(() => {
        cargarUnidadesMedida();
    }, [cargarUnidadesMedida, recargar]);

    const manejarDesactivar = async (unidadMedida) => {
        const resultado = await mostrarConfirmacion(
            "Desactivar unidad de medida",
            `¿Deseas desactivar la unidad de medida "${unidadMedida.nombre}"?`
        );

        if (!resultado.isConfirmed) {
            return false;
        }

        try {
            await desactivarUnidadMedida(unidadMedida.idUnidadMedida);
            await mostrarExito(
                "Unidad de medida desactivada",
                "La unidad de medida fue desactivada correctamente."
            );
            await cargarUnidadesMedida();

            if (onUnidadMedidaDesactivada) {
                onUnidadMedidaDesactivada();
            }

            return true;
        } catch (err) {
            await mostrarError(
                "Ocurrió un error",
                "No se pudo desactivar la unidad de medida."
            );
            console.error(err);
            return false;
        }
    };

    return {
        unidadesMedida,
        cargando,
        error,
        cargarUnidadesMedida,
        manejarDesactivar
    };
}

export default useUnidadesMedida;