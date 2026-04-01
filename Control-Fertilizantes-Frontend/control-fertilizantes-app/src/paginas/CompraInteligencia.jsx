import { useEffect, useState } from "react";
import FiltrosCompraInteligencia from "../componentes/compras-inteligencia/FiltrosCompraInteligencia";
import ResumenInteligenteCompras from "../componentes/compras-inteligencia/ResumenInteligenteCompras";
import TablaHistorialPrecios from "../componentes/compras-inteligencia/TablaHistorialPrecios";
import GraficoHistorialPrecios from "../componentes/compras-inteligencia/GraficoHistorialPrecios";
import EvaluacionCompra from "../componentes/compras-inteligencia/EvaluacionCompra";
import AlertasCompra from "../componentes/compras-inteligencia/AlertasCompras";
import useCompraInteligencia from "../hooks/useCompraInteligencia";
import { obtenerProductos } from "../api/productosApi";
import { obtenerPresentacionesProducto } from "../api/presentacionProductoApi";

function CompraInteligencia() {
  const [productos, setProductos] = useState([]);
  const [presentaciones, setPresentaciones] = useState([]);
  const [idProducto, setIdProducto] = useState("");
  const [idPresentacionProducto, setIdPresentacionProducto] = useState("");
  const [cargandoFiltros, setCargandoFiltros] = useState(false);
  const [errorFiltros, setErrorFiltros] = useState(null);

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

        {/* FILTROS */}
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

                <EvaluacionCompra evaluacion={evaluacion} />

                <ResumenInteligenteCompras resumen={resumen} />

                <AlertasCompra alertas={alertas} />

                <GraficoHistorialPrecios historial={historial} />

                <TablaHistorialPrecios historial={historial} />
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default CompraInteligencia;