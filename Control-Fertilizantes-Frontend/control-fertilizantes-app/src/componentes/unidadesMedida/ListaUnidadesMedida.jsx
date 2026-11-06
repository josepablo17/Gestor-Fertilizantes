import { obtenerUnidadesMedida, desactivarUnidadMedida } from "../../api/unidadMedidaApi.js";
import ContenidoListado from "../comunes/ContenidoListado.jsx";
import { Mensajes } from "../comunes/Pagina.jsx";
import useConsulta from "../../hooks/useConsulta.js";
import useDesactivarRegistro from "../../hooks/useDesactivarRegistro.js";
import { obtenerTextoResumen } from "../../utils/unidadesMedida.js";
import TablaUnidadesMedida from "./TablaUnidadesMedida.jsx";

const sinRegistros = [];

export default function ListaUnidadesMedida() {
  const estado = useConsulta(obtenerUnidadesMedida);
  const unidades = estado.datos ?? sinRegistros;
  const operacion = useDesactivarRegistro(desactivarUnidadMedida, estado.recargar);
  const resumen = obtenerTextoResumen(unidades.length);

  return (
    <>
      <Mensajes {...operacion} />
      <ContenidoListado estado={estado}
        mensajeVacio="No hay unidades de medida registradas"
        detalleVacio="Cuando agregues unidades de medida, aparecerán aquí para administrarlas."
        resumen={resumen}>
        <TablaUnidadesMedida unidadesMedida={unidades}
          ocupado={operacion.ocupado}
          onDesactivar={(item) => operacion.desactivar(item.idUnidadMedida, item.nombre)} />
      </ContenidoListado>
    </>
  );
}
