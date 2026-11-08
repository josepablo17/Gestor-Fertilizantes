export default function PendientesCabecera({ campos }) {
  if (campos.length === 0) return null;

  return <section aria-label="Datos de cabecera pendientes">
    <p><strong>Para validar, completa estos datos de la cabecera:</strong></p>
    <ul>{campos.map(({ campo, etiqueta }) => <li key={campo}>{etiqueta}</li>)}</ul>
    {campos.some(({ campo }) => ["descuento", "iva", "otrosCargos"].includes(campo)) &&
      <p className="text-muted">Si no hay descuentos, IVA u otros cargos, confirma sus importes en cero al editar la cabecera.</p>}
  </section>;
}
