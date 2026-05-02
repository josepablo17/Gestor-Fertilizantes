import { useEffect, useMemo, useState } from "react";
import FiltrosCompraInteligencia from "../componentes/compras-inteligencia/FiltrosCompraInteligencia";
import ResumenInteligenteCompras from "../componentes/compras-inteligencia/ResumenInteligenteCompras";
import TablaHistorialPrecios from "../componentes/compras-inteligencia/TablaHistorialPrecios";
import GraficoHistorialPrecios from "../componentes/compras-inteligencia/GraficoHistorialPrecios";
import EvaluacionCompra from "../componentes/compras-inteligencia/EvaluacionCompra";
import AlertasCompra from "../componentes/compras-inteligencia/AlertasCompras";
import useCompraInteligencia from "../hooks/useCompraInteligencia";
import EstadoLista from "../EstadoLista"
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
  const [productos, setProductos] = useState([]);
  const [presentaciones, setPresentaciones] = useState([]);
  const [idProducto, setIdProducto] = useState("");
  const [idPresentacionProducto, setIdPresentacionProducto] = useState("");
  const [cargandoFiltros, setCargandoFiltros] = useState(false);
  const [errorFiltros, setErrorFiltros] = useState(null);
  const [tabActiva, setTabActiva] = useState("evaluacion");

  const {
    historial,
    resumen,
    evaluacion,
    alertas,
    cargando,
    error
  } = useCompraInteligencia(idProducto, idPresentacionProducto);

  useEffect(() => {
    cargarProductos();
  }, []);

  useEffect(() => {
    if (idProducto) {
      cargarPresentaciones(idProducto);
    } else {
      setPresentaciones([]);
      setIdPresentacionProducto("");
    }
  }, [idProducto]);

  const cargarProductos = async () => {
    try {
      setCargandoFiltros(true);
      setErrorFiltros(null);

      const data = await obtenerProductos();
      setProductos(data);
    } catch (err) {
      console.error(err);
      setErrorFiltros("No se pudieron cargar los productos.");
    } finally {
      setCargandoFiltros(false);
    }
  };

  const cargarPresentaciones = async (idProductoSeleccionado) => {
    try {
      setCargandoFiltros(true);
      setErrorFiltros(null);

      const data = await obtenerPresentacionesProducto();

      const presentacionesFiltradas = data.filter(
        (presentacion) =>
          String(presentacion.idProducto ?? presentacion.IdProducto) === String(idProductoSeleccionado)
      );

      setPresentaciones(presentacionesFiltradas);
    } catch (err) {
      console.error(err);
      setErrorFiltros("No se pudieron cargar las presentaciones del producto.");
      setPresentaciones([]);
    } finally {
      setCargandoFiltros(false);
    }
  };

  const limpiarFiltros = () => {
    setIdProducto("");
    setIdPresentacionProducto("");
    setPresentaciones([]);
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
  <section className="page">
    <div className="page__header">
      <div>
        <h1 className="page__title">Compras Inteligentes</h1>
        <p className="page__subtitle">
          Analiza precios, evalúa compras y detecta riesgos para tomar mejores decisiones.
        </p>
      </div>
    </div>

    <div className="compra-inteligencia">
      {/* Filtros */}
      <div className="compra-inteligencia__bloque compra-inteligencia__bloque--filtros">
        <FiltrosCompraInteligencia
          productos={productos}
          presentaciones={presentaciones}
          idProducto={idProducto}
          setIdProducto={setIdProducto}
          idPresentacionProducto={idPresentacionProducto}
          setIdPresentacionProducto={setIdPresentacionProducto}
          onLimpiarFiltros={limpiarFiltros}
        />
      </div>

      {/* Estados filtros */}
      {cargandoFiltros && (
        <EstadoLista tipo="cargando" mensaje="Cargando filtros..." />
      )}

      {errorFiltros && (
        <EstadoLista tipo="error" mensaje={errorFiltros} />
      )}

      {!cargandoFiltros && !errorFiltros && (
        <>
          {/* Estados análisis */}
          {cargando && (
            <EstadoLista tipo="cargando" mensaje="Cargando análisis..." />
          )}

          {error && (
            <EstadoLista tipo="error" mensaje={error} />
          )}

          {!cargando && !error && (
            <>
              {/* 🔥 Tabs (suben de nivel en jerarquía) */}
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

              {/* 🔥 Métricas globales (opcionales, no duplicar con Evaluación) */}
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

              {/* 🔥 Contenido único (clave del fix) */}
              <section className="compra-inteligencia__seccion compra-inteligencia__seccion--contenido">
                <div className="compra-inteligencia__contenido">
                  {renderizarContenidoTab()}
                </div>
              </section>
            </>
          )}
        </>
      )}
    </div>
  </section>
);
}

export default CompraInteligencia;