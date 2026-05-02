import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { obtenerProformasProveedor } from "../api/proformaProveedorApi";
import TablaProformasProveedor from "../componentes/proformasProveedor/TablaProformasProveedor";

function formatearMoneda(valor) {
  const numero = Number(valor ?? 0);

  return new Intl.NumberFormat("es-CR", {
    style: "currency",
    currency: "CRC",
    minimumFractionDigits: 2,
  }).format(numero);
}

function formatearFecha(fecha) {
  if (!fecha) return "Sin fecha";

  return new Date(fecha).toLocaleDateString("es-CR");
}

function ProformasProveedor() {
  const navigate = useNavigate();

  const [proformas, setProformas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState("todos");
  const [proformasSeleccionadas, setProformasSeleccionadas] = useState([]);

  useEffect(() => {
    cargarProformas();
  }, []);

  const cargarProformas = async () => {
    try {
      setCargando(true);
      setError(null);

      const data = await obtenerProformasProveedor();
      setProformas(data);
    } catch (err) {
      console.error(err);
      setError(err.message || "No se pudieron cargar las proformas.");
    } finally {
      setCargando(false);
    }
  };

  const proformasFiltradas = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    return proformas.filter((proforma) => {
      const coincideBusqueda =
        !texto ||
        proforma.numeroProforma?.toLowerCase().includes(texto) ||
        proforma.nombreProveedor?.toLowerCase().includes(texto) ||
        proforma.nombreProveedorPdf?.toLowerCase().includes(texto) ||
        proforma.nombreNegocio?.toLowerCase().includes(texto);

      const coincideEstado =
        estadoFiltro === "todos" ||
        proforma.estado?.toLowerCase() === estadoFiltro.toLowerCase();

      return coincideBusqueda && coincideEstado;
    });
  }, [proformas, busqueda, estadoFiltro]);

  const totalSeleccionadas = proformasSeleccionadas.length;

  const manejarSeleccion = (idProformaProveedor) => {
    setProformasSeleccionadas((seleccionActual) => {
      const yaSeleccionada = seleccionActual.includes(idProformaProveedor);

      if (yaSeleccionada) {
        return seleccionActual.filter((id) => id !== idProformaProveedor);
      }

      return [...seleccionActual, idProformaProveedor];
    });
  };

  const limpiarSeleccion = () => {
    setProformasSeleccionadas([]);
  };

  const verDetalle = (idProformaProveedor) => {
    navigate(`/proformas-proveedor/${idProformaProveedor}`);
  };

  const compararSeleccionadas = () => {
    if (totalSeleccionadas < 2) return;

    const ids = proformasSeleccionadas.join(",");
    navigate(`/comparar-proformas?ids=${ids}`);
  };

  return (
    <main className="page">
      <header className="page__header">
        <div>
          <h1 className="page__title">Proformas de proveedores</h1>
          <p className="page__subtitle">
            Consulte las proformas guardadas desde compra automática y
            seleccione varias para compararlas entre proveedores.
          </p>
        </div>

        <div className="page__actions">
          <button
            type="button"
            className="btn btn--secondary"
            onClick={cargarProformas}
            disabled={cargando}
          >
            {cargando ? "Actualizando..." : "Actualizar"}
          </button>

          <button
            type="button"
            className="btn btn--primary"
            onClick={() => navigate("/compra-automatica")}
          >
            Nueva proforma
          </button>
        </div>
      </header>

      {error && (
        <div className="card">
          <div className="card__body">
            <p className="text-danger">{error}</p>
          </div>
        </div>
      )}

      <section className="card">
        <div className="card__header">
          <div>
            <h2 className="card__title">Listado de proformas</h2>
            <p className="card__subtitle">
              Seleccione dos o más proformas para iniciar una comparación.
            </p>
          </div>
        </div>

        <div className="card__body">
          <div className="toolbar">
            <div className="toolbar__search">
              <input
                type="text"
                className="input"
                placeholder="Buscar por número, proveedor o negocio..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>

            <div className="toolbar__group">
              <select
                className="select"
                value={estadoFiltro}
                onChange={(e) => setEstadoFiltro(e.target.value)}
              >
                <option value="todos">Todos los estados</option>
                <option value="Pendiente">Pendiente</option>
                <option value="Comparada">Comparada</option>
                <option value="Registrada">Registrada</option>
              </select>

              <button
                type="button"
                className="btn btn--ghost"
                onClick={() => {
                  setBusqueda("");
                  setEstadoFiltro("todos");
                }}
              >
                Limpiar filtros
              </button>
            </div>
          </div>

          <div className="toolbar">
            <div>
              <strong>{totalSeleccionadas}</strong>{" "}
              <span className="text-muted">
                proforma{totalSeleccionadas === 1 ? "" : "s"} seleccionada
                {totalSeleccionadas === 1 ? "" : "s"}
              </span>
            </div>

            <div className="toolbar__group">
              <button
                type="button"
                className="btn btn--ghost"
                onClick={limpiarSeleccion}
                disabled={totalSeleccionadas === 0}
              >
                Limpiar selección
              </button>

              <button
                type="button"
                className="btn btn--primary"
                onClick={compararSeleccionadas}
                disabled={totalSeleccionadas < 2}
              >
                Comparar seleccionadas
              </button>
            </div>
          </div>
          <TablaProformasProveedor
            proformas={proformasFiltradas}
            cargando={cargando}
            proformasSeleccionadas={proformasSeleccionadas}
            onSeleccionar={manejarSeleccion}
            onVerDetalle={verDetalle}
          />
        </div>
      </section>
    </main>
  );
}

export default ProformasProveedor;
