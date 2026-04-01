export function formatearEstado(activo) {
    return activo ? "Activo" : "Inactivo";
}

export function formatearUnidadBase(esUnidadBase) {
    return esUnidadBase ? "Sí" : "No";
}

export function formatearFactorConversion(factorConversion) {
    if (factorConversion === null || factorConversion === undefined || factorConversion === "") {
        return "-";
    }

    return Number(factorConversion).toLocaleString("es-CR", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 4
    });
}

export function obtenerTextoResumen(total) {
    if (total === 0) {
        return "No hay unidades de medida registradas.";
    }

    if (total === 1) {
        return "Mostrando 1 unidad de medida.";
    }

    return `Mostrando ${total} unidades de medida.`;
}