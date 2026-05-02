function CargarProformaPDF({
  archivoPdf,
  cargando,
  onCambioArchivo,
  onGenerarVistaPrevia,
  onLimpiar
}) {
  return (
    <section className="card">
      <div className="card__header">
        <div>
          <h2 className="card__title">Cargar proforma</h2>
          <p className="card__subtitle">
            Seleccione el PDF de la proforma para generar una vista previa validada.
          </p>
        </div>
      </div>

      <div className="card__body form">
        <div className="form__group">
          <label className="label">Archivo PDF</label>

          <input
            type="file"
            accept="application/pdf"
            className="input"
            onChange={onCambioArchivo}
          />

          {archivoPdf && (
            <p className="text-muted">
              Archivo seleccionado: {archivoPdf.name}
            </p>
          )}
        </div>

        <div className="form__actions">
          <button
            type="button"
            className="btn btn--primary"
            onClick={onGenerarVistaPrevia}
            disabled={cargando || !archivoPdf}
          >
            {cargando ? "Validando..." : "Generar vista previa"}
          </button>

          <button
            type="button"
            className="btn btn--secondary"
            onClick={onLimpiar}
            disabled={cargando}
          >
            Limpiar
          </button>
        </div>
      </div>
    </section>
  );
}

export default CargarProformaPDF;