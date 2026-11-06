import { useMemo, useState } from "react";
import FiltrosCompraInteligencia from "../componentes/compras-inteligencia/FiltrosCompraInteligencia";
import ResumenInteligenteCompras from "../componentes/compras-inteligencia/ResumenInteligenteCompras";
import TablaHistorialPrecios from "../componentes/compras-inteligencia/TablaHistorialPrecios";
import GraficoHistorialPrecios from "../componentes/compras-inteligencia/GraficoHistorialPrecios";
import EvaluacionCompra from "../componentes/compras-inteligencia/EvaluacionCompra";
import AlertasCompra from "../componentes/compras-inteligencia/AlertasCompras";
import useCompraInteligencia from "../hooks/useCompraInteligencia";
import Pagina, { EstadoConsulta } from "../componentes/comunes/Pagina.jsx";
import useConsulta from "../hooks/useConsulta.js";
import { obtenerProductos } from "../api/productosApi";
import { obtenerPresentacionesProducto } from "../api/presentacionProductoApi";
import { obtenerComprasClave } from "../utils/compras-inteligentes";

const TABS_COMPRA_INTELIGENCIA = [
  { id: "evaluacion", label: "Evaluación" },
  { id: "resumen", label: "Resumen" },
  { id: "alertas", label: "Alertas" },
  { id: "grafico", label: "Gráfico" },
  { id: "historial", label: "Historial" }
];

function CompraInteligencia() {
  const [idProducto, setIdProducto] = useState("");
  const [idPresentacionProducto, setIdPresentacionProducto] = useState("");
  const [tabActiva, setTabActiva] = useState("evaluacion");

  const {
    historial,
    resumen,
    evaluacion,
    alertas,
    cargando,
    error,
    cargarDatos
  } = useCompraInteligencia(idProducto, idPresentacionProducto);

  const productos = useConsulta(obtenerProductos);
  const presentaciones = useConsulta(obtenerPresentacionesProducto);
  const presentacionesFiltradas = presentaciones.datos?.filter(
    (presentacion) => String(presentacion.idProducto ?? presentacion.IdProducto) === idProducto
  ) ?? [];
  const estadoFiltros = {
    cargando: productos.cargando || presentaciones.cargando,
    error: productos.error || presentaciones.error,
    recargar: productos.error ? productos.recargar : presentaciones.recargar
  };


  const limpiarFiltros = () => {
    setIdProducto("");
    setIdPresentacionProducto("");
    setTabActiva("evaluacion");
  };

  const historialInteligente = useMemo(() => {
    return obtenerComprasClave(historial);
  }, [historial]);

  const cantidadAlertas = Array.isArray(alertas) ? alertas.length : 0;
  const cantidadCompras = Array.isArray(historial) ? historial.length : 0;

  const renderizarContenidoTab = () => {
    switch (tabActiva) {
      case "evaluacion":
        return <EvaluacionCompra evaluacion={evaluacion} />;

      case "resumen":
        return <ResumenInteligenteCompras resumen={resumen} />;

      case "alertas":
        return <AlertasCompra alertas={alertas} />;

      case "grafico":
        return <GraficoHistorialPrecios historial={historial} />;

      case "historial":
        return <TablaHistorialPrecios historial={historialInteligente} />;

      default:
        return <EvaluacionCompra evaluacion={evaluacion} />;
    }
  };

  return (
    <Pagina titulo="Compras Inteligentes"
      descripcion="Analiza precios, evalúa compras y detecta riesgos para tomar mejores decisiones.">
      <div className="compra-inteligencia">
        <EstadoConsulta estado={estadoFiltros}>
          {/* Filtros */}
          <div className="compra-inteligencia__bloque compra-inteligencia__bloque--filtros">
            <FiltrosCompraInteligencia
              productos={productos.datos ?? []}
              presentaciones={presentacionesFiltradas}
              idProducto={idProducto}
              setIdProducto={setIdProducto}
              idPresentacionProducto={idPresentacionProducto}
              setIdPresentacionProducto={setIdPresentacionProducto}
              onLimpiarFiltros={limpiarFiltros}
            />
          </div>

          <EstadoConsulta estado={{ cargando, error, recargar: cargarDatos }}>
            <section className="compra-inteligencia__seccion compra-inteligencia__seccion--tabs">
              <div className="compra-inteligencia__tabs">
                {TABS_COMPRA_INTELIGENCIA.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    className={
                      tabActiva === tab.id
                        ? "compra-inteligencia__tab compra-inteligencia__tab--activo"
                        : "compra-inteligencia__tab"
                    }
                    onClick={() => setTabActiva(tab.id)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </section>
            <section className="compra-inteligencia__seccion compra-inteligencia__seccion--metricas">
              <div className="compra-inteligencia__metricas">
                <article className="card card--mini compra-inteligencia__metrica compra-inteligencia__metrica--alertas">
                  <span className="label">Alertas activas</span>
                  <strong className="compra-inteligencia__metrica-valor">
                    {cantidadAlertas}
                  </strong>
                </article>

                <article className="card card--mini compra-inteligencia__metrica">
                  <span className="label">Compras analizadas</span>
                  <strong className="compra-inteligencia__metrica-valor">
                    {cantidadCompras}
                  </strong>
                </article>

                <article className="card card--mini compra-inteligencia__metrica">
                  <span className="label">Vista actual</span>
                  <strong className="compra-inteligencia__metrica-valor">
                    {
                      TABS_COMPRA_INTELIGENCIA.find(
                        (tab) => tab.id === tabActiva
                      )?.label
                    }
                  </strong>
                </article>
              </div>
            </section>
            <section className="compra-inteligencia__seccion compra-inteligencia__seccion--contenido">
              <div className="compra-inteligencia__contenido">
                {renderizarContenidoTab()}
              </div>
            </section>
          </EstadoConsulta>
        </EstadoConsulta>
      </div>
    </Pagina>
  );
}

export default CompraInteligencia;
