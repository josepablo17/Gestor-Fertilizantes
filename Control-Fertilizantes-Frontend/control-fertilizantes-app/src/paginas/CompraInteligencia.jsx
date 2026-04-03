import { useEffect, useMemo, useState } from "react";
import FiltrosCompraInteligencia from "../componentes/compras-inteligencia/FiltrosCompraInteligencia";
import ResumenInteligenteCompras from "../componentes/compras-inteligencia/ResumenInteligenteCompras";
import TablaHistorialPrecios from "../componentes/compras-inteligencia/TablaHistorialPrecios";
import GraficoHistorialPrecios from "../componentes/compras-inteligencia/GraficoHistorialPrecios";
import EvaluacionCompra from "../componentes/compras-inteligencia/EvaluacionCompra";
import AlertasCompra from "../componentes/compras-inteligencia/AlertasCompras";
import useCompraInteligencia from "../hooks/useCompraInteligencia";
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
    <div className="pagina-compra-inteligencia">
      <div className="contenedor-compra-inteligencia">
        <div className="encabezado-compra-inteligencia">
          <div>
            <h1>Compras Inteligentes</h1>
            <p>
              Analiza el comportamiento histórico de precios, evalúa automáticamente
              la compra más reciente y detecta alertas clave para apoyar decisiones
              más estratégicas.
            </p>
          </div>
        </div>

        <FiltrosCompraInteligencia
          productos={productos}
          presentaciones={presentaciones}
          idProducto={idProducto}
          setIdProducto={setIdProducto}
          idPresentacionProducto={idPresentacionProducto}
          setIdPresentacionProducto={setIdPresentacionProducto}
          onLimpiarFiltros={limpiarFiltros}
        />

        {cargandoFiltros && (
          <div className="estado-modulo">Cargando filtros...</div>
        )}

        {errorFiltros && (
          <div className="estado-error">{errorFiltros}</div>
        )}

        {!cargandoFiltros && !errorFiltros && (
          <>
            {cargando && (
              <div className="estado-modulo">
                Cargando análisis inteligente...
              </div>
            )}

            {error && (
              <div className="estado-error">{error}</div>
            )}

            {!cargando && !error && (
              <>
                <div className="compra-inteligencia-panel-superior">
                  <div className="compra-inteligencia-resumen-rapido">
                    <div className="mini-card-inteligencia">
                      <span className="mini-card-etiqueta">Vista actual</span>
                      <strong>
                        {TABS_COMPRA_INTELIGENCIA.find((tab) => tab.id === tabActiva)?.label}
                      </strong>
                    </div>

                    <div className="mini-card-inteligencia">
                      <span className="mini-card-etiqueta">Alertas detectadas</span>
                      <strong>{cantidadAlertas}</strong>
                    </div>

                    <div className="mini-card-inteligencia">
                      <span className="mini-card-etiqueta">Compras analizadas</span>
                      <strong>{cantidadCompras}</strong>
                    </div>
                  </div>

                  <div className="tabs-compra-inteligencia">
                    {TABS_COMPRA_INTELIGENCIA.map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        className={`tab-compra-inteligencia ${
                          tabActiva === tab.id ? "activa" : ""
                        }`}
                        onClick={() => setTabActiva(tab.id)}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="contenido-tab-compra-inteligencia">
                  {renderizarContenidoTab()}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default CompraInteligencia;