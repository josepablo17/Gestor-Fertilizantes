export function obtenerValor(objeto, ...claves) {
  for (const clave of claves) {
    if (objeto?.[clave] !== undefined && objeto?.[clave] !== null) {
      return objeto[clave];
    }
  }

  return null;
}

export function convertirNumero(valor) {
  const numero = Number(valor ?? 0);
  return Number.isNaN(numero) ? 0 : numero;
}

export function formatearMoneda(valor, moneda = "CRC") {
  return new Intl.NumberFormat("es-CR", {
    style: "currency",
    currency: moneda || "CRC",
    minimumFractionDigits: 2
  }).format(convertirNumero(valor));
}

export function formatearFecha(fecha) {
  if (!fecha) return "Sin fecha";

  return new Date(fecha).toLocaleDateString("es-CR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  });
}

function obtenerDataRespuesta(respuesta) {
  return respuesta?.data ?? respuesta?.Data ?? respuesta;
}

function normalizarLinea(linea) {
  const idProducto = obtenerValor(linea, "idProducto", "IdProducto");
  const idPresentacionProducto = obtenerValor(
    linea,
    "idPresentacionProducto",
    "IdPresentacionProducto"
  );

  const cantidad = convertirNumero(obtenerValor(linea, "cantidad", "Cantidad"));
  const precioUnitario = convertirNumero(
    obtenerValor(linea, "precioUnitario", "PrecioUnitario")
  );

  return {
    idProducto,
    idPresentacionProducto,
    clave: `${idProducto ?? "sin-producto"}-${idPresentacionProducto ?? "sin-presentacion"}`,

    nombreProducto:
      obtenerValor(linea, "nombreProducto", "NombreProducto") ||
      obtenerValor(linea, "producto", "Producto") ||
      "Producto sin nombre",

    nombrePresentacion:
      obtenerValor(
        linea,
        "nombrePresentacionProducto",
        "NombrePresentacionProducto"
      ) ||
      obtenerValor(linea, "presentacionProducto", "PresentacionProducto") ||
      obtenerValor(linea, "presentacion", "Presentacion") ||
      "Sin presentación",

    unidadMedida:
      obtenerValor(linea, "unidadMedida", "UnidadMedida") ||
      obtenerValor(linea, "nombreUnidadMedida", "NombreUnidadMedida") ||
      "",

    cantidad,
    precioUnitario,
    subtotalLinea: convertirNumero(
      obtenerValor(linea, "subtotalLinea", "SubtotalLinea", "subtotal", "Subtotal")
    ),
    descuentoLinea: convertirNumero(
      obtenerValor(linea, "descuentoLinea", "DescuentoLinea", "descuento", "Descuento")
    ),
    ivaLinea: convertirNumero(
      obtenerValor(linea, "ivaLinea", "IvaLinea", "iva", "IVA", "Iva")
    ),
    totalLinea: convertirNumero(
      obtenerValor(linea, "totalLinea", "TotalLinea", "total", "Total")
    )
  };
}

export function normalizarProforma(proformaOriginal) {
  const data = obtenerDataRespuesta(proformaOriginal);

  const cabecera =
    data?.proforma ??
    data?.Proforma ??
    data?.cabecera ??
    data?.Cabecera ??
    data;

  const lineasOriginales =
    data?.detalle ??
    data?.Detalle ??
    data?.detalles ??
    data?.Detalles ??
    data?.lineas ??
    data?.Lineas ??
    data?.proformasProveedorDetalle ??
    data?.ProformasProveedorDetalle ??
    [];

  const lineas = lineasOriginales.map(normalizarLinea);

  return {
    idProformaProveedor: obtenerValor(
      cabecera,
      "idProformaProveedor",
      "IdProformaProveedor"
    ),
    numeroProforma:
      obtenerValor(cabecera, "numeroProforma", "NumeroProforma") ||
      "Sin número",
    nombreProveedor:
      obtenerValor(cabecera, "nombreProveedor", "NombreProveedor") ||
      obtenerValor(cabecera, "nombreProveedorSistema", "NombreProveedorSistema") ||
      "Proveedor sin nombre",
    fecha: obtenerValor(cabecera, "fecha", "Fecha"),
    fechaVencimiento: obtenerValor(
      cabecera,
      "fechaVencimiento",
      "FechaVencimiento"
    ),
    diasCredito: obtenerValor(cabecera, "diasCredito", "DiasCredito"),
    moneda: obtenerValor(cabecera, "moneda", "Moneda") || "CRC",
    subtotal: convertirNumero(obtenerValor(cabecera, "subtotal", "Subtotal")),
    descuento: convertirNumero(obtenerValor(cabecera, "descuento", "Descuento")),
    iva: convertirNumero(obtenerValor(cabecera, "iva", "IVA", "Iva")),
    total: convertirNumero(obtenerValor(cabecera, "total", "Total")),
    lineas
  };
}

function consolidarLinea(lineas) {
  const cantidadTotal = lineas.reduce((total, linea) => total + linea.cantidad, 0);

  const precioPonderado =
    cantidadTotal > 0
      ? lineas.reduce(
          (total, linea) => total + linea.precioUnitario * linea.cantidad,
          0
        ) / cantidadTotal
      : lineas[0]?.precioUnitario ?? 0;

  return {
    ...lineas[0],
    cantidad: cantidadTotal,
    precioUnitario: precioPonderado,
    subtotalLinea: lineas.reduce((total, linea) => total + linea.subtotalLinea, 0),
    descuentoLinea: lineas.reduce(
      (total, linea) => total + linea.descuentoLinea,
      0
    ),
    ivaLinea: lineas.reduce((total, linea) => total + linea.ivaLinea, 0),
    totalLinea: lineas.reduce((total, linea) => total + linea.totalLinea, 0)
  };
}

export function obtenerFilasComparativas(proformas) {
  const mapa = new Map();

  for (const proforma of proformas) {
    const lineasPorClave = new Map();

    for (const linea of proforma.lineas) {
      if (!lineasPorClave.has(linea.clave)) {
        lineasPorClave.set(linea.clave, []);
      }

      lineasPorClave.get(linea.clave).push(linea);
    }

    for (const [clave, lineas] of lineasPorClave.entries()) {
      const lineaConsolidada = consolidarLinea(lineas);

      if (!mapa.has(clave)) {
        mapa.set(clave, {
          clave,
          nombreProducto: lineaConsolidada.nombreProducto,
          nombrePresentacion: lineaConsolidada.nombrePresentacion,
          unidadMedida: lineaConsolidada.unidadMedida,
          cotizaciones: {}
        });
      }

      mapa.get(clave).cotizaciones[proforma.idProformaProveedor] =
        lineaConsolidada;
    }
  }

  return Array.from(mapa.values()).sort((a, b) =>
    a.nombreProducto.localeCompare(b.nombreProducto)
  );
}

export function obtenerMejorProveedor(fila, criterioComparacion) {
  const cotizaciones = Object.entries(fila.cotizaciones)
    .filter(([, linea]) => linea)
    .map(([idProformaProveedor, linea]) => ({
      idProformaProveedor: Number(idProformaProveedor),
      valor: convertirNumero(linea[criterioComparacion])
    }))
    .filter((item) => item.valor > 0);

  if (cotizaciones.length === 0) return null;

  return cotizaciones.reduce((mejor, actual) =>
    actual.valor < mejor.valor ? actual : mejor
  );
}
