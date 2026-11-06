import Swal from "sweetalert2";

const configuracionBase = {
  background: "var(--color-bg-elevated)",
  color: "var(--color-text-primary)",
  customClass: {
    popup: "swal-popup-personalizado",
    title: "swal-titulo-personalizado",
    htmlContainer: "swal-texto-personalizado",
    actions: "swal-acciones-personalizadas",
    confirmButton: "btn btn--primary",
    cancelButton: "btn btn--secondary"
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

export const mostrarConfirmacion = (titulo, texto, confirmar = "Sí, desactivar") => {
  return Swal.fire({
    ...configuracionBase,
    icon: "warning",
    title: titulo,
    text: texto,
    showCancelButton: true,
    confirmButtonText: confirmar,
    cancelButtonText: "Cancelar",
    reverseButtons: false
  });
};
