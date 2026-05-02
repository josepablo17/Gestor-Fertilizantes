import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { obtenerProformaProveedorPorId } from "../api/proformaProveedorApi";

function obtenerValor(objeto, ...claves) {
  for (const clave of claves) {
    if (objeto?.[clave] !== undefined && objeto?.[clave] !== null) {
      return objeto[clave];
    }
  }

  return null;
}

function convertirNumero(valor) {
  const numero = Number(valor ?? 0);
  return Number.isNaN(numero) ? 0 : numero;
}

function formatearMoneda(valor, moneda = "CRC") {
  return new Intl.NumberFormat("es-CR", {
    style: "currency",
    currency: moneda || "CRC",
    minimumFractionDigits: 2
  }).format(convertirNumero(valor));
}

function formatearFecha(fecha) {
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

function normalizarProforma(proformaOriginal) {
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

function obtenerFilasComparativas(proformas) {
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

function obtenerMejorProveedor(fila, criterioComparacion) {
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

function CompararProformas() {
  const [searchParams] = useSearchParams();

  const ids = useMemo(() => {
    const idsQuery = searchParams.get("ids");

    if (!idsQuery) return [];

    return idsQuery
      .split(",")
      .map((id) => Number(id.trim()))
      .filter((id) => !Number.isNaN(id) && id > 0);
  }, [searchParams]);

  const [proformas, setProformas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [criterioComparacion, setCriterioComparacion] =
    useState("precioUnitario");

  useEffect(() => {
    async function cargarProformas() {
      try {
        setCargando(true);
        setError("");

        if (ids.length < 2) {
          setProformas([]);
          setError("Debe seleccionar al menos dos proformas para comparar.");
          return;
        }

        const respuestas = await Promise.all(
          ids.map((id) => obtenerProformaProveedorPorId(id))
        );

        const proformasNormalizadas = respuestas
          .map(normalizarProforma)
          .filter((proforma) => proforma?.idProformaProveedor);

        setProformas(proformasNormalizadas);
      } catch (error) {
        console.error(error);
        setError("No se pudieron cargar las proformas seleccionadas.");
      } finally {
        setCargando(false);
      }
    }

    cargarProformas();
  }, [ids]);

  const filasComparativas = useMemo(
    () => obtenerFilasComparativas(proformas),
    [proformas]
  );

  const monedaPrincipal = proformas[0]?.moneda || "CRC";

  if (cargando) {
    return (
      <section className="page">
        <div className="page__header">
          <div>
            <h1 className="page__title">Comparar proformas</h1>
            <p className="page__subtitle">
              Cargando información de las proformas seleccionadas.
            </p>
          </div>
        </div>

        <div className="card">
          <div className="card__body">
            <p className="text-muted">Cargando comparación...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="page">
        <div className="page__header">
          <div>
            <h1 className="page__title">Comparar proformas</h1>
            <p className="page__subtitle">
              No fue posible generar la comparación.
            </p>
          </div>

          <div className="page__actions">
            <Link to="/proformas-proveedor" className="btn btn--secondary">
              Volver
            </Link>
          </div>
        </div>

        <div className="card">
          <div className="card__body">
            <p className="text-danger">{error}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="page">
      <div className="page__header">
        <div>
          <h1 className="page__title">Comparar proformas</h1>
          <p className="page__subtitle">
            Revise precios, totales, condiciones de crédito y productos no
            cotizados por proveedor.
          </p>
        </div>

        <div className="page__actions">
          <Link to="/proformas-proveedor" className="btn btn--secondary">
            Volver
          </Link>
        </div>
      </div>

      <div className="page__body">
        <section className="card">
          <div className="card__header">
            <div>
              <h2 className="card__title">Resumen por proveedor</h2>
              <p className="card__subtitle">
                Totales generales y condiciones comerciales de cada proforma.
              </p>
            </div>
          </div>

          <div className="card__body">
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Proveedor</th>
                    <th>Proforma</th>
                    <th>Subtotal</th>
                    <th>Descuento</th>
                    <th>IVA</th>
                    <th>Total</th>
                    <th>Vencimiento</th>
                    <th>Días crédito</th>
                  </tr>
                </thead>

                <tbody>
                  {proformas.map((proforma) => (
                    <tr key={proforma.idProformaProveedor}>
                      <td className="table__cell-strong">
                        {proforma.nombreProveedor}
                      </td>
                      <td>{proforma.numeroProforma}</td>
                      <td>{formatearMoneda(proforma.subtotal, proforma.moneda)}</td>
                      <td>
                        {formatearMoneda(proforma.descuento, proforma.moneda)}
                      </td>
                      <td>{formatearMoneda(proforma.iva, proforma.moneda)}</td>
                      <td className="table__cell-strong">
                        {formatearMoneda(proforma.total, proforma.moneda)}
                      </td>
                      <td>{formatearFecha(proforma.fechaVencimiento)}</td>
                      <td>{proforma.diasCredito ?? "No indicado"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="card">
          <div className="card__header">
            <div>
              <h2 className="card__title">Comparación de líneas</h2>
              <p className="card__subtitle">
                Los productos se agrupan por producto y presentación. Si un
                proveedor no cotizó un producto, se muestra como no cotizado.
              </p>
            </div>

            <div className="toolbar__group">
              <select
                className="select"
                value={criterioComparacion}
                onChange={(e) => setCriterioComparacion(e.target.value)}
              >
                <option value="precioUnitario">Mejor por precio unitario</option>
                <option value="totalLinea">Mejor por total de línea</option>
              </select>
            </div>
          </div>

          <div className="card__body">
            <div className="table-wrapper">
              <table className="table quote-comparison-table">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Presentación</th>

                    {proformas.map((proforma) => (
                      <th key={proforma.idProformaProveedor}>
                        {proforma.nombreProveedor}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {filasComparativas.map((fila) => {
                    const mejorProveedor = obtenerMejorProveedor(
                      fila,
                      criterioComparacion
                    );

                    return (
                      <tr key={fila.clave}>
                        <td className="table__cell-strong">
                          {fila.nombreProducto}
                        </td>
                        <td>{fila.nombrePresentacion}</td>

                        {proformas.map((proforma) => {
                          const linea =
                            fila.cotizaciones[proforma.idProformaProveedor];

                          const esMejor =
                            mejorProveedor?.idProformaProveedor ===
                            proforma.idProformaProveedor;

                          return (
                            <td key={proforma.idProformaProveedor}>
                              {!linea ? (
                                <span className="badge quote-comparison-badge--missing">
                                  No cotizado
                                </span>
                              ) : (
                                <div
                                  className={`quote-comparison-cell ${
                                    esMejor ? "quote-comparison-cell--best" : ""
                                  }`}
                                >
                                  <div className="quote-comparison-cell__top">
                                    <strong>
                                      {formatearMoneda(
                                        linea.precioUnitario,
                                        monedaPrincipal
                                      )}
                                    </strong>

                                    {esMejor && (
                                      <span className="badge quote-comparison-badge--best">
                                        Mejor opción
                                      </span>
                                    )}
                                  </div>

                                  <div className="quote-comparison-cell__details">
                                    <span>
                                      Cantidad: {linea.cantidad}{" "}
                                      {linea.unidadMedida}
                                    </span>
                                    <span>
                                      Total:{" "}
                                      {formatearMoneda(
                                        linea.totalLinea,
                                        monedaPrincipal
                                      )}
                                    </span>
                                  </div>
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {filasComparativas.length === 0 && (
              <p className="text-muted">
                Las proformas seleccionadas no tienen líneas para comparar.
              </p>
            )}
          </div>
        </section>
      </div>
    </section>
  );
}

export default CompararProformas;