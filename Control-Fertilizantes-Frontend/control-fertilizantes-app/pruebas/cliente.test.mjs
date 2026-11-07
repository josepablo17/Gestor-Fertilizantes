import assert from "node:assert/strict";
import test from "node:test";
import { ErrorApi, solicitar } from "../src/api/cliente.js";
import { obtenerCompras, obtenerUltimoPrecioCompra } from "../src/api/compraApi.js";

test("conserva el estado HTTP en errores de sesión y permisos, también para PDF", async (t) => {
  t.mock.method(globalThis, "fetch", async () => new Response(null, { status: 401 }));
  await assert.rejects(solicitar("/protegido", { pdf: true }), {
    name: "ErrorApi", estadoHttp: 401,
  });

  fetch.mock.mockImplementation(async () => Response.json({ mensaje: "Permiso insuficiente." }, { status: 403 }));
  await assert.rejects(solicitar("/protegido"), {
    name: "ErrorApi", estadoHttp: 403, message: "Permiso insuficiente.",
  });
});

test("respeta el contrato numérico de compras y conserva la precisión en cotizaciones", async (t) => {
  t.mock.method(globalThis, "fetch", async () =>
    new Response('{"exito":true,"data":[{"precio":123.4500}]}'));

  assert.deepEqual(await obtenerCompras(), [{ precio: 123.45 }]);
  assert.deepEqual(await solicitar("/solicitudes-cotizacion"), [{ precio: "123.4500" }]);
});

test("una referencia sin historial conserva el resultado nulo y otros fallos se propagan", async (t) => {
  const filtros = { idProducto: 1, idPresentacionProducto: 2, moneda: "CRC" };
  t.mock.method(globalThis, "fetch", async () => new Response(null, { status: 404 }));
  assert.equal(await obtenerUltimoPrecioCompra(filtros), null);

  fetch.mock.mockImplementation(async () => new Response(null, { status: 500 }));
  await assert.rejects(obtenerUltimoPrecioCompra(filtros), (error) => error instanceof ErrorApi && error.estadoHttp === 500);
});
