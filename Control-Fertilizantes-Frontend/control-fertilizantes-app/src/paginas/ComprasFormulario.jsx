import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import FormularioCompra from "../componentes/compras/FormularioCompras";
import { obtenerCompraPorId } from "../api/compraApi";
import { mostrarError } from "../utils/alertas";
import Loader from "../componentes/Loader";
import "../estilos/loader.css";

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
    <div className="pagina-modulo">
      <div className="contenedor-modulo">
        <div className="encabezado-modulo encabezado-con-acciones">
          <div>
            <h1>{estaEditando ? "Editar Compra" : "Nueva Compra"}</h1>
            <p>
              {estaEditando
                ? "Actualiza la información de la compra seleccionada."
                : "Completa el formulario para registrar una nueva compra."}
            </p>
          </div>

          <button
            type="button"
            className="boton-base boton-secundario"
            onClick={manejarCancelar}
          >
            Volver al listado
          </button>
        </div>

        <div className="card-modulo">
          {cargando ? (
            <Loader texto="Cargando información de la compra..." alto="260px" />
          ) : (
            <FormularioCompra
              onCompraGuardada={manejarCompraGuardada}
              compraEditar={compraEditar}
              onCancelarEdicion={manejarCancelar}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default CompraFormulario;