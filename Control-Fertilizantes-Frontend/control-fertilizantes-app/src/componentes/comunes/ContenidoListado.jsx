import { EstadoConsulta, EstadoVacio } from "./Pagina.jsx";

export default function ContenidoListado({
  estado, mensajeVacio, detalleVacio, filtros, sinCoincidencias = false, resumen, children
}) {
  return (
    <EstadoConsulta estado={estado}>
      {!estado.datos?.length ? (
        <EstadoVacio mensaje={mensajeVacio} detalle={detalleVacio} />
      ) : (
        <>
          {filtros}
          {sinCoincidencias ? (
            <EstadoVacio mensaje="No se encontraron resultados"
              detalle="Prueba con otra búsqueda o cambia los filtros seleccionados." />
          ) : (
            <>
              {resumen && <p className="table__cell-muted">{resumen}</p>}
              {children}
            </>
          )}
        </>
      )}
    </EstadoConsulta>
  );
}
