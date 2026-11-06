import Loader from "../Loader.jsx";

export default function Pagina({ titulo, descripcion, acciones, children }) {
  return <section className="page">
    <header className="page__header">
      <div className="page__header-content">
        <h1 className="page__title">{titulo}</h1>
        {descripcion && <p className="page__subtitle">{descripcion}</p>}
      </div>
      {acciones && <div className="page__actions">{acciones}</div>}
    </header>
    <div className="page__body">{children}</div>
  </section>;
}

export function Tarjeta({ titulo, children }) {
  return <section className="card">
    {titulo && <div className="card__header"><h2 className="card__title">{titulo}</h2></div>}
    <div className="card__body">{children}</div>
  </section>;
}

export function EstadoConsulta({ estado, children }) {
  if (estado.cargando) return <Loader texto="Cargando información…" alto="120px" />;
  if (estado.error) return <div role="alert">
    <p>{estado.error}</p>
    <button className="btn btn--secondary" onClick={estado.recargar}>Reintentar</button>
  </div>;
  return children;
}

export function Mensajes({ error, aviso }) {
  return <>
    {error && <p role="alert">{error}</p>}
    {aviso && <p role="status">{aviso}</p>}
  </>;
}
