function Loader({
  texto = "Cargando información...",
  alto = "220px",
  compacto = false
}) {
  return (
    <div
      className={`loader-contenedor ${compacto ? "loader-compacto" : ""}`}
      style={{ minHeight: alto }}
    >
      <div className="loader-spinner"></div>
      <h3 className="loader-titulo">Espere un momento</h3>
      <p className="loader-texto">{texto}</p>
    </div>
  );
}

export default Loader;