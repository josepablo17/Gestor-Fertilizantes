import { useCallback, useEffect, useRef, useState } from "react";
import { descargarArchivo } from "../../../api/cliente.js";
import { EstadoConsulta, Tarjeta } from "../../../componentes/comunes/Pagina.jsx";
import useConsulta from "../../../hooks/useConsulta.js";
import { descargarRespuestaPdf } from "../api/cotizacionesApi.js";

export default function PanelPdfRespuesta({ id, documento }) {
  const [visible, setVisible] = useState(true);
  const cargar = useCallback((signal) => descargarRespuestaPdf(id, signal), [id]);
  const estado = useConsulta(cargar);

  return (
    <Tarjeta titulo="PDF original">
      <p className="revision-proforma__archivo">{documento.nombre}</p>
      <div className="btn-group">
        <button type="button" className="btn btn--secondary btn--sm"
          aria-expanded={visible} onClick={() => setVisible((actual) => !actual)}>
          {visible ? "Ocultar PDF original" : "Ver PDF original"}
        </button>
        <button type="button" className="btn btn--secondary btn--sm"
          disabled={!estado.datos} onClick={() => descargarArchivo(estado.datos, documento.nombre)}>
          Descargar PDF original
        </button>
      </div>
      {visible && <EstadoConsulta estado={estado}>
        {estado.datos && <VisorPdf archivo={estado.datos} />}
      </EstadoConsulta>}
    </Tarjeta>
  );
}

function VisorPdf({ archivo }) {
  const marco = useRef(null);

  useEffect(() => {
    const iframe = marco.current;
    const url = URL.createObjectURL(archivo);
    iframe.src = url + "#view=FitH";
    return () => {
      iframe.removeAttribute("src");
      URL.revokeObjectURL(url);
    };
  }, [archivo]);

  return <iframe className="revision-proforma__visor" ref={marco} title="PDF original de la proforma" />;
}
