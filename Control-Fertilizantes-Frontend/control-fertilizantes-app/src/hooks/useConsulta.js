import { useEffect, useState } from "react";

export default function useConsulta(cargar) {
  const [revision, setRevision] = useState(0);
  const [resultado, setResultado] = useState(null);

  useEffect(() => {
    const controlador = new AbortController();
    Promise.resolve().then(() => cargar(controlador.signal)).then(
      (datos) => { if (!controlador.signal.aborted) setResultado({ cargar, revision, datos, error: "" }); },
      (error) => { if (!controlador.signal.aborted) setResultado({ cargar, revision, datos: null, error: error.message }); },
    );
    return () => controlador.abort();
  }, [cargar, revision]);

  const vigente = resultado?.cargar === cargar && resultado.revision === revision;
  return {
    datos: vigente ? resultado.datos : null,
    error: vigente ? resultado.error : "",
    cargando: !vigente,
    recargar: () => setRevision((anterior) => anterior + 1),
    actualizar: (datos) => setResultado({ cargar, revision, datos, error: "" }),
  };
}
