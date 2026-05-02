import { useEffect, useMemo, useState } from "react";

function usePaginacion(items, itemsPorPagina, dependencias = []) {
  const [paginaActual, setPaginaActual] = useState(1);

  useEffect(() => {
    setPaginaActual(1);
  }, dependencias);

  const totalPaginas = Math.ceil(items.length / itemsPorPagina);

  const paginaAjustada =
    totalPaginas === 0 ? 1 : Math.min(paginaActual, totalPaginas);

  const indiceInicial = (paginaAjustada - 1) * itemsPorPagina;
  const indiceFinal = indiceInicial + itemsPorPagina;

  const itemsPaginados = useMemo(() => {
    return items.slice(indiceInicial, indiceFinal);
  }, [items, indiceInicial, indiceFinal]);

  const irAPagina = (pagina) => {
    setPaginaActual(Math.max(1, Math.min(pagina, totalPaginas || 1)));
  };

  const irAnterior = () => {
    setPaginaActual((prev) => Math.max(prev - 1, 1));
  };

  const irSiguiente = () => {
    setPaginaActual((prev) => Math.min(prev + 1, totalPaginas || 1));
  };

  const obtenerPaginasVisibles = () => {
    const PAGINAS_INICIALES_VISIBLES = 4;
    const PAGINAS_CONTEXTO_VISIBLES = 5;

    if (totalPaginas <= 7) {
      return Array.from({ length: totalPaginas }, (_, index) => index + 1);
    }

    const primeraPagina = 1;
    const ultimaPagina = totalPaginas;
    let paginas;

    if (paginaAjustada <= PAGINAS_INICIALES_VISIBLES) {
      paginas = Array.from(
        { length: PAGINAS_INICIALES_VISIBLES },
        (_, index) => index + 1
      );
    } else if (paginaAjustada >= totalPaginas - PAGINAS_CONTEXTO_VISIBLES + 1) {
      paginas = Array.from(
        { length: PAGINAS_CONTEXTO_VISIBLES },
        (_, index) => totalPaginas - PAGINAS_CONTEXTO_VISIBLES + index + 1
      );
    } else {
      paginas = Array.from(
        { length: PAGINAS_CONTEXTO_VISIBLES },
        (_, index) => paginaAjustada + index
      );
    }

    return [...new Set([primeraPagina, ...paginas, ultimaPagina])];
  };

  return {
    paginaActual: paginaAjustada,
    totalPaginas,
    indiceInicial,
    indiceFinal,
    itemsPaginados,
    irAPagina,
    irAnterior,
    irSiguiente,
    setPaginaActual,
    paginasVisibles: obtenerPaginasVisibles()
  };
}

export default usePaginacion;
