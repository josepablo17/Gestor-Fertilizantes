const decimalParcial = /^[0-9]*(?:[.,][0-9]*)?$/;

const formatos = {
  // Conserva el separador mientras se escribe para evitar que 2.5 termine como 25.
  entero: { inputMode: "numeric", parcial: decimalParcial, patron: "[0-9]+" },
  decimal: { inputMode: "decimal", parcial: decimalParcial, patron: "[0-9]+([.,][0-9]+)?" },
  telefono: { inputMode: "tel", parcial: /^[0-9+ ()-]*$/, patron: "[0-9+ \\(\\)\\-]*" },
};

export default function EntradaNumerica({ formato, onChange, ...atributos }) {
  const { inputMode, parcial, patron } = formatos[formato];

  return <input {...atributos} type={formato === "telefono" ? "tel" : "text"} inputMode={inputMode}
    pattern={patron} onChange={(evento) => {
      if (parcial.test(evento.target.value)) onChange(evento);
    }} />;
}
