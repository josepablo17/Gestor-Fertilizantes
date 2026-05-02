import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { obtenerProformaProveedorPorId } from "../api/proformaProveedorApi";
import DetalleProformaProveedorContenido from "../componentes/proformasProveedor/DetalleProformaProveedorContenido";

function DetalleProformaProveedor() {
  const { idProformaProveedor } = useParams();
  const navigate = useNavigate();

  const [proforma, setProforma] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargarDetalleProforma();
  }, [idProformaProveedor]);

  const cargarDetalleProforma = async () => {
    try {
      setCargando(true);
      setError(null);

      const data = await obtenerProformaProveedorPorId(idProformaProveedor);
      setProforma(data);
    } catch (err) {
      console.error(err);
      setError(err.message || "No se pudo cargar el detalle de la proforma.");
    } finally {
      setCargando(false);
    }
  };

  const volver = () => {
    navigate("/proformas-proveedor");
  };

  const compararEstaProforma = () => {
    navigate(`/comparar-proformas?ids=${idProformaProveedor}`);
  };

  return (
    <main className="page">
      <header className="page__header">
        <div>
          <h1 className="page__title">Detalle de proforma</h1>
          <p className="page__subtitle">
            Revise la información general, las líneas detectadas y los totales
            registrados desde la proforma del proveedor.
          </p>
        </div>

        <div className="page__actions">
          <button type="button" className="btn btn--secondary" onClick={volver}>
            Volver
          </button>

          <button
            type="button"
            className="btn btn--ghost"
            onClick={cargarDetalleProforma}
            disabled={cargando}
          >
            {cargando ? "Actualizando..." : "Actualizar"}
          </button>

          <button
            type="button"
            className="btn btn--primary"
            onClick={compararEstaProforma}
            disabled={!proforma}
          >
            Comparar
          </button>
        </div>
      </header>

      {error && (
        <section className="card">
          <div className="card__body">
            <p className="text-danger">{error}</p>
          </div>
        </section>
      )}

      {cargando ? (
        <section className="card">
          <div className="card__body">
            <p className="text-muted">Cargando detalle de la proforma...</p>
          </div>
        </section>
      ) : (
        <DetalleProformaProveedorContenido proforma={proforma} />
      )}
    </main>
  );
}

export default DetalleProformaProveedor;