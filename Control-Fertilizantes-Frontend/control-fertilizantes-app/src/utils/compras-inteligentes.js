export function obtenerComprasClave(historial) {
  if (!historial || historial.length === 0) return [];

  const compras = [...historial];

  const primeraCompra = compras[0];
  const ultimaCompra = compras[compras.length - 1];

  const compraMasCara = compras.reduce((max, actual) =>
    Number(actual.precioUnitarioCalculado) > Number(max.precioUnitarioCalculado)
      ? actual
      : max
  );

  const compraMasBarata = compras.reduce((min, actual) =>
    Number(actual.precioUnitarioCalculado) < Number(min.precioUnitarioCalculado)
      ? actual
      : min
  );

  const comprasConVariacion = compras.filter(
    (item) =>
      item.diferenciaPrecio !== null &&
      item.diferenciaPrecio !== undefined &&
      !isNaN(Number(item.diferenciaPrecio))
  );

  const compraMayorVariacion =
    comprasConVariacion.length > 0
      ? comprasConVariacion.reduce((max, actual) =>
          Math.abs(Number(actual.diferenciaPrecio)) >
          Math.abs(Number(max.diferenciaPrecio))
            ? actual
            : max
        )
      : null;

  const comprasClave = [
    primeraCompra
      ? { ...primeraCompra, insight: "Primer registro histórico" }
      : null,
    ultimaCompra
      ? { ...ultimaCompra, insight: "Compra más reciente evaluada" }
      : null,
    compraMasCara
      ? { ...compraMasCara, insight: "Precio unitario más alto detectado" }
      : null,
    compraMasBarata
      ? { ...compraMasBarata, insight: "Precio unitario más bajo detectado" }
      : null,
    compraMayorVariacion
      ? {
          ...compraMayorVariacion,
          insight: "Mayor variación frente al precio anterior"
        }
      : null
  ].filter(Boolean);

  const resultado = [];
  const ids = new Set();

  for (const compra of comprasClave) {
    const clave = compra.idCompra ?? `${compra.fechaCompra}-${compra.precioUnitarioCalculado}`;

    if (!ids.has(clave)) {
      ids.add(clave);
      resultado.push(compra);
    }
  }

  return resultado;
}