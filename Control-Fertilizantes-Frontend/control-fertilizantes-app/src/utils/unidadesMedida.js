import { formatearNumero } from "./numeros.js";
export function formatearEstado(activo) {
    return activo ? "Activo" : "Inactivo";
}

export function formatearUnidadBase(esUnidadBase) {
    return esUnidadBase ? "Sí" : "No";
}

export const formatearFactorConversion = formatearNumero;

export function obtenerTextoResumen(total) {
    if (total === 0) {
        return "No hay unidades de medida registradas.";
    }

    if (total === 1) {
        return "Mostrando 1 unidad de medida.";
    }

    return `Mostrando ${total} unidades de medida.`;
}