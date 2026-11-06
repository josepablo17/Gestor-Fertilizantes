import { useCallback } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { obtenerCompraPorId } from "../api/compraApi.js";
import FormularioCompra from "../componentes/compras/FormularioCompras.jsx";
import Pagina, { EstadoConsulta, Tarjeta } from "../componentes/comunes/Pagina.jsx";
import useConsulta from "../hooks/useConsulta.js";

export default function CompraFormulario() {
  const navigate = useNavigate();
  const { id } = useParams();
  const cargar = useCallback(async (signal) => {
    if (!id) return null;
    const compra = await obtenerCompraPorId(id, signal);
    if (!compra) throw new Error("No se encontró la compra.");
    return compra;
  }, [id]);
  const estado = useConsulta(cargar);
  const volver = () => navigate("/compras");

  return (
    <Pagina titulo={id ? "Editar compra" : "Nueva compra"}
      descripcion={id ? "Actualiza la información de la compra seleccionada." : "Completa el formulario para registrar una nueva compra."}
      acciones={<Link className="btn btn--secondary" to="/compras">Volver al listado</Link>}>
      <Tarjeta>
        <EstadoConsulta estado={estado}>
          <FormularioCompra compraEditar={estado.datos} onCompraGuardada={volver} onCancelarEdicion={volver} />
        </EstadoConsulta>
      </Tarjeta>
    </Pagina>
  );
}
