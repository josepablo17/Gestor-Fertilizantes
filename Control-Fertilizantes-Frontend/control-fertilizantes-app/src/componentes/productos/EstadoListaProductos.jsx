function EstadoListaProductos({ tipo, mensaje, subtitulo }) {
  if (tipo === "cargando") {
    return (
      <div className="estado-lista">
        <div className="spinner-tabla"></div>
        <p>{mensaje}</p>
      </div>
    );
  }

  if (tipo === "error") {
    return (
      <div className="estado-lista estado-error">
        <p>{mensaje}</p>
      </div>
    );
  }

  return (
    <div className="estado-lista estado-vacio">
      <h3>{mensaje}</h3>
      {subtitulo && <p>{subtitulo}</p>}
    </div>
  );
}

export default EstadoListaProductos;