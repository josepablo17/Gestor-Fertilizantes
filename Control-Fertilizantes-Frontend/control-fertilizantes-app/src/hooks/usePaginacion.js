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

  return {
    paginaActual: paginaAjustada,
    totalPaginas,
    indiceInicial,
    indiceFinal,
    itemsPaginados,
    irAPagina,
    irAnterior,
    irSiguiente,
    setPaginaActual
  };
}

export default usePaginacion;