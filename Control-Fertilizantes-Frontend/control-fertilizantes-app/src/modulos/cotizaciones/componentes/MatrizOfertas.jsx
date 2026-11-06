import { formatearNumero } from "../../../utils/numeros.js";
import { Link } from "react-router-dom";
import { EstadoVacio, Tarjeta } from "../../../componentes/comunes/Pagina.jsx";
import { basesImporte } from "../utils/formularioRespuesta.js";

const condiciones = {
  Comparable: "Comparable",
  SinRespuestaValidada: "Sin respuesta validada",
  LineaSinCotizar: "Renglón sin cotizar",
  SinCotizar: "Sin cotizar",
  NoDisponible: "No disponible",
  MonedaDistinta: "Moneda distinta",
  BasePrecioDistinta: "Base de precio distinta",
  DimensionDistinta: "Dimensión distinta",
  AlternativaNoIncluida: "Alternativa excluida por filtro",
  EquivalenciaNoRevisada: "Equivalencia sin revisar",
  PrecioNoRepresentable: "Precio no representable",
};

function precioNormalizado(valor, moneda, unidad) {
  return valor == null ? "—" : `${moneda} ${formatearNumero(valor)}/${unidad}`;
}

function Oferta({ oferta, documento, moneda, unidad }) {
  const cotizada = oferta.estadoOferta === "Cotizada";
  const comparable = oferta.condicionComparacion === "Comparable";
  const producto = [oferta.productoOfrecido, oferta.marcaOfrecida, oferta.presentacionOfrecida].filter(Boolean).join(" · ");
  const vigencia = oferta.vigente === true ? "Vigente" : oferta.vigente === false ? "Vencida" : "Sin fecha conocida";

  return (
    <div className="matriz-oferta">
      {oferta.precioPorUnidadBase != null && (
        <strong className="matriz-oferta__precio">{precioNormalizado(oferta.precioPorUnidadBase, moneda, unidad)}</strong>
      )}
      {!comparable && <span className="text-muted">{condiciones[oferta.condicionComparacion] ?? oferta.condicionComparacion}</span>}
      {oferta.esMenorPrecioConCoberturaYVigencia ? (
        <span className="badge badge--sm badge--soft badge--success">Menor con cobertura y vigencia</span>
      ) : oferta.esMenorPrecioUnitario && <span className="badge badge--sm badge--soft badge--neutral">Menor precio</span>}
      {cotizada && <small>{oferta.cubreCantidadSolicitada ? "Cubre lo pedido" : "Cobertura parcial"} · {vigencia}</small>}
      {oferta.tipoOferta === "Alternativa" && <span className="badge badge--sm badge--soft badge--info">Alternativa</span>}
      {(cotizada || producto || oferta.motivoAlternativa) && (
        <details>
          <summary>Detalle de la oferta</summary>
          {producto && <p>{producto}</p>}
          {oferta.motivoAlternativa && <p>{oferta.motivoAlternativa}</p>}
          {oferta.contenidoTotalOfrecido != null && (
            <p>{formatearNumero(oferta.contenidoTotalOfrecido)} {oferta.unidadBaseOfrecida} ({formatearNumero(oferta.cantidadEmpaquesOfrecida)} empaques)</p>
          )}
          {oferta.precioPorEmpaque != null && <p>Por empaque {documento?.moneda} {formatearNumero(oferta.precioPorEmpaque)}</p>}
          {oferta.totalLinea != null && <p>Total de línea {documento?.moneda} {formatearNumero(oferta.totalLinea)} · {oferta.baseTotalLinea}</p>}
        </details>
      )}
    </div>
  );
}

export default function MatrizOfertas({ resultado }) {
  const { criterio, lineas, documentos } = resultado;
  const proveedores = new Map();
  const documentosPorDestino = new Map(documentos.map((doc) => [String(doc.idSolicitudCotizacionProveedor), doc]));
  const filas = lineas.map((linea) => {
    const ofertasPorDestino = new Map();
    for (const oferta of linea.ofertas) {
      const destino = String(oferta.idSolicitudCotizacionProveedor);
      proveedores.set(destino, oferta.nombreProveedorActual);
      if (!ofertasPorDestino.has(destino)) ofertasPorDestino.set(destino, []);
      ofertasPorDestino.get(destino).push(oferta);
    }
    return { linea, ofertasPorDestino };
  });

  return (
    <Tarjeta titulo="Comparación por producto">
      <p className="text-muted">
        {criterio.moneda} · {basesImporte.find((base) => base.value === criterio.baseTotalLinea)?.label} · Vigencia al {criterio.fechaReferencia}
      </p>
      {filas.length === 0 ? <EstadoVacio mensaje="No hay renglones para estos filtros." /> : (
        <div className="table-wrapper matriz-ofertas" role="region" aria-label="Comparación por producto y proveedor" tabIndex={0}>
          <table className="table matriz-ofertas__tabla" aria-label="Ofertas por producto y proveedor">
            <thead>
              <tr>
                <th scope="col">Producto solicitado</th>
                {[...proveedores].map(([destino, nombre]) => {
                  const documento = documentosPorDestino.get(destino);
                  return <th scope="col" key={destino}>
                    {nombre}
                    {documento && <Link className="enlace-contextual" to={`/respuestas/${documento.idProformaProveedor}`}>
                      Ver proforma {documento.numeroProforma ?? documento.idProformaProveedor}
                    </Link>}
                  </th>;
                })}
              </tr>
            </thead>
            <tbody>
              {filas.map(({ linea, ofertasPorDestino }) => (
                <tr key={linea.idSolicitudCotizacionDetalle}>
                  <th scope="row">
                    <strong>{linea.numeroLinea}. {linea.productoSolicitado}{linea.marcaSolicitada && ` · ${linea.marcaSolicitada}`}</strong>
                    <small>{linea.presentacionSolicitada}</small>
                    <small>Pedido {formatearNumero(linea.cantidadEmpaquesSolicitada)} empaques · {formatearNumero(linea.contenidoTotalSolicitado)} {linea.unidadBase}</small>
                    {linea.menorPrecioPorUnidadBase != null && <small>
                      Mínimo comparable {precioNormalizado(linea.menorPrecioPorUnidadBase, criterio.moneda, linea.unidadBase)}
                    </small>}
                  </th>
                  {[...proveedores.keys()].map((destino) => (
                    <td key={destino}>
                      {ofertasPorDestino.get(destino)?.map((oferta) => (
                        <Oferta key={oferta.idProformaProveedorDetalle ?? "sin-linea"} oferta={oferta}
                          documento={documentosPorDestino.get(destino)} moneda={criterio.moneda} unidad={linea.unidadBase} />
                      )) ?? <span className="text-muted">Sin oferta</span>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Tarjeta>
  );
}
