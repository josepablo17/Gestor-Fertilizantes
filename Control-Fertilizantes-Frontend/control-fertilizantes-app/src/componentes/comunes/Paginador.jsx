export default function Paginador({
  paginaActual, totalPaginas, irAPagina, paginasVisibles, etiqueta = "Paginación"
}) {
  if (totalPaginas <= 1 && paginaActual <= 1) return null;

  return (
    <nav className="toolbar" aria-label={etiqueta}>
      <button type="button" className="btn btn--ghost" disabled={paginaActual <= 1}
        onClick={() => irAPagina(paginaActual - 1)}>
        Anterior
      </button>

      {paginasVisibles ? (
        <div className="toolbar__group">
          {paginasVisibles.map((pagina) => (
            <button key={pagina} type="button"
              className={pagina === paginaActual ? "btn btn--primary" : "btn btn--ghost"}
              aria-label={`Página ${pagina}`} aria-current={pagina === paginaActual ? "page" : undefined}
              onClick={() => irAPagina(pagina)}>
              {pagina}
            </button>
          ))}
        </div>
      ) : <span aria-current="page">Página {paginaActual}</span>}

      <button type="button" className="btn btn--ghost" disabled={paginaActual >= totalPaginas}
        onClick={() => irAPagina(paginaActual + 1)}>
        Siguiente
      </button>
    </nav>
  );
}
