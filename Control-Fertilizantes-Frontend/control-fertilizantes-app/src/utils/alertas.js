import Swal from "sweetalert2";

const configuracionBase = {
  background: "#ffffff",
  color: "#1f2937",
  customClass: {
    popup: "swal-popup-personalizado",
    title: "swal-titulo-personalizado",
    confirmButton: "swal-boton-confirmar",
    cancelButton: "swal-boton-cancelar"
  },
  buttonsStyling: false
};

export const mostrarExito = (titulo, texto) => {
  return Swal.fire({
    ...configuracionBase,
    icon: "success",
    title: titulo,
    text: texto,
    confirmButtonText: "Aceptar"
  });
};

export const mostrarError = (titulo, texto) => {
  return Swal.fire({
    ...configuracionBase,
    icon: "error",
    title: titulo,
    text: texto,
    confirmButtonText: "Aceptar"
  });
};

export const mostrarConfirmacion = (titulo, texto) => {
  return Swal.fire({
    ...configuracionBase,
    icon: "warning",
    title: titulo,
    text: texto,
    showCancelButton: true,
    confirmButtonText: "Sí, continuar",
    cancelButtonText: "Cancelar",
    reverseButtons: true
  });
};