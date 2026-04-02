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
    if (totalPaginas <= 7) {
      return Array.from({ length: totalPaginas }, (_, index) => index + 1);
    }

    const paginas = [];
    const primeraPagina = 1;
    const ultimaPagina = totalPaginas;

    paginas.push(primeraPagina);

    if (paginaActual <= 4) {
      paginas.push(2, 3, 4, 5);

      if (totalPaginas > 6) {
        paginas.push("...");
      }

      paginas.push(ultimaPagina);
      return paginas;
    }

    if (paginaActual >= totalPaginas - 3) {
      paginas.push("...");

      for (let i = totalPaginas - 4; i < totalPaginas; i++) {
        paginas.push(i);
      }

      paginas.push(ultimaPagina);
      return paginas;
    }

    paginas.push("...");
    paginas.push(paginaActual - 1);
    paginas.push(paginaActual);
    paginas.push(paginaActual + 1);
    paginas.push("...");
    paginas.push(ultimaPagina);

    return paginas;
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