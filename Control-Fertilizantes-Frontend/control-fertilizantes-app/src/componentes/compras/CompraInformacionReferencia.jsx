import { useCallback } from "react";
import { obtenerUltimoPrecioCompra } from "../../api/compraApi.js";
import useConsulta from "../../hooks/useConsulta.js";
import { decimalOpcional } from "../../utils/datosApi.js";
import { formatearMoneda } from "../../utils/moneda.js";
import { EstadoConsulta, Tarjeta } from "../comunes/Pagina.jsx";

function precioPorEmpaque(cantidad, precio) {
  const empaques = Number(cantidad);
  if (!Number.isSafeInteger(empaques) || empaques <= 0) return null;
  try {
    const total = decimalOpcional(precio, 4, true);
    return total === null ? null : Number(total) / empaques;
  } catch {
    return null;
  }
}

export default function CompraInformacionReferencia({ compra }) {
  const { idProducto, idPresentacionProducto, moneda, fechaCompra, idCompra } = compra;
  const consultar = Boolean(idProducto && idPresentacionProducto && moneda && fechaCompra);
  const cargar = useCallback((signal) => consultar ? obtenerUltimoPrecioCompra({
    idProducto, idPresentacionProducto, moneda, fechaLimite: fechaCompra, idCompraLimite: idCompra || undefined,
  }, signal) : null, [consultar, idProducto, idPresentacionProducto, moneda, fechaCompra, idCompra]);
  const estado = useConsulta(cargar);
  const ultimo = estado.datos;
  const actual = moneda ? precioPorEmpaque(compra.cantidadComprada, compra.precioTotal) : null;

  return <Tarjeta titulo="Referencia de compras">
    {actual !== null && <p>Esta compra por empaque <strong>{formatearMoneda(actual, moneda)}</strong></p>}
    {!consultar ? <p className="text-muted">Selecciona el producto, la presentación, la moneda y la fecha para consultar el historial.</p>
      : <EstadoConsulta estado={estado}>
        {ultimo ? <>
          <p>Último precio pagado por empaque <strong>{formatearMoneda(ultimo.precioUnitarioCalculado, moneda)}</strong></p>
          <p className="text-muted">
            {ultimo.fechaCompra.split("T")[0]}{ultimo.nombreProveedor && ` · ${ultimo.nombreProveedor}`}
          </p>
        </> : <p className="text-muted">Sin compras previas para esta presentación en {moneda} hasta la fecha seleccionada.</p>}
      </EstadoConsulta>}
  </Tarjeta>;
}
