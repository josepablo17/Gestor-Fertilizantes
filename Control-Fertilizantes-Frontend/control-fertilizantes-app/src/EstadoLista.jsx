import { EstadoVacio } from "./componentes/comunes/Pagina.jsx";

function EstadoLista({ tipo, mensaje, subtitulo }) {
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

  return <EstadoVacio mensaje={mensaje} detalle={subtitulo} />;
}

export default EstadoLista;
