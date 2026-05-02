function AccionesCompraAutomatica({
  puedeConfirmar,
  cargandoConfirmacion,
  onConfirmar
}) {
  return (
    <section className="card">
      <div className="card__body">
        <div className="form__actions">
          <button
            type="button"
            className="btn btn--primary"
            onClick={onConfirmar}
            disabled={!puedeConfirmar || cargandoConfirmacion}
          >
            {cargandoConfirmacion ? "Registrando..." : "Guardar proforma"}
          </button>

          {!puedeConfirmar && (
            <p className="text-muted">
              Para confirmar, el proveedor debe estar validado y no deben existir líneas pendientes.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

export default AccionesCompraAutomatica;