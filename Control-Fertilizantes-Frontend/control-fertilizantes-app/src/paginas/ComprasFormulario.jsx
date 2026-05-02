import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import FormularioCompra from "../componentes/compras/FormularioCompras";
import { obtenerCompraPorId } from "../api/compraApi";
import { mostrarError } from "../utils/alertas";
import Loader from "../componentes/Loader";

function CompraFormulario() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [compraEditar, setCompraEditar] = useState(null);
  const [cargando, setCargando] = useState(false);

  const estaEditando = Boolean(id);

  useEffect(() => {
    if (estaEditando) {
      cargarCompraPorId();
    }
  }, [id]);

  const cargarCompraPorId = async () => {
    try {
      setCargando(true);

      const compra = await obtenerCompraPorId(id);
      setCompraEditar(compra);
    } catch (error) {
      await mostrarError(
        "Ocurrió un error",
        "No se pudo cargar la información de la compra."
      );
      navigate("/compras");
      console.error(error);
    } finally {
      setCargando(false);
    }
  };

  const manejarCompraGuardada = () => {
    navigate("/compras");
  };

  const manejarCancelar = () => {
    navigate("/compras");
  };

return (
  <section className="page">
    {/* HEADER */}
    <header className="page__header">
      <div className="page__header-content">
        <h1 className="page__title">
          {estaEditando ? "Editar compra" : "Nueva compra"}
        </h1>
        <p className="page__subtitle">
          {estaEditando
            ? "Actualiza la información de la compra seleccionada."
            : "Completa el formulario para registrar una nueva compra."}
        </p>
      </div>

      <div className="page__actions">
        <button
          type="button"
          className="btn btn--secondary"
          onClick={manejarCancelar}
        >
          Volver al listado
        </button>
      </div>
    </header>

    {/* BODY */}
    <div className="page__body">
      <section className="card">
        <div className="card__body">
          {cargando ? (
            <Loader
              texto="Cargando información de la compra..."
              alto="260px"
            />
          ) : (
            <FormularioCompra
              onCompraGuardada={manejarCompraGuardada}
              compraEditar={compraEditar}
              onCancelarEdicion={manejarCancelar}
            />
          )}
        </div>
      </section>
    </div>
  </section>
);
}

export default CompraFormulario;