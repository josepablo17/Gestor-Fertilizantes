import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { env } from "node:process";
import { chromium } from "playwright";

const origen = new URL(env.GF_FRONTEND_TEST_URL ?? "http://127.0.0.1:0");
assert.equal(origen.hostname, "127.0.0.1");
assert.match(env.GF_FRONTEND_TEST_DATABASE ?? "", /^GF_DB_COMPOSE_[a-f0-9]{32}$/);

const navegador = await chromium.launch({ executablePath: env.GF_BROWSER_EXECUTABLE || undefined });
const pagina = await navegador.newPage({ viewport: { width: 1440, height: 960 } });
pagina.setDefaultTimeout(15000);
const errores = [];
pagina.on("pageerror", (error) => errores.push(error.message));
const clave = Date.now().toString(36);
const base = `Base ${clave}`;
const marca = `Marca ${clave}`;
const producto = `Producto ${clave}`;
const proveedor = `Proveedor ${clave}`;
const otroProveedor = `Proveedor externo ${clave}`;
const numero = `SOL-FRONT-${clave}`;

const abrir = (ruta) => pagina.goto(new URL(ruta, origen).href);
const boton = (name) => pagina.getByRole("button", { name, exact: true });
const enlace = (name) => pagina.getByRole("link", { name, exact: true });
const campo = (name) => pagina.getByLabel(name, { exact: true });
const visible = (texto) => pagina.getByText(texto, { exact: true }).first().waitFor();
const rutaActual = () => new URL(pagina.url()).pathname;

async function seleccionar(nombre, texto) {
  const control = campo(nombre);
  await control.getByRole("option", { name: texto }).first().waitFor({ state: "attached" });
  const valor = await control.getByRole("option", { name: texto }).first().getAttribute("value");
  assert.ok(valor);
  await control.selectOption(valor);
}

async function alta(ruta, destino, valores, selectores = []) {
  await abrir(ruta);
  for (const [nombre, valor] of Object.entries(valores)) await campo(nombre).fill(valor);
  for (const [nombre, texto] of selectores) await seleccionar(nombre, texto);
  await boton("Guardar").click();
  await pagina.waitForURL((url) => url.pathname === destino);
}

async function confirmar(accion, confirmar) {
  await boton(accion).click();
  await pagina.getByRole("dialog").getByRole("button", { name: confirmar, exact: true }).click();
}

async function json(ruta) {
  const respuesta = await pagina.request.get(new URL(`/api${ruta}`, origen).href);
  assert.ok(respuesta.ok(), `${ruta}: HTTP ${respuesta.status()}`);
  return (await respuesta.json()).data;
}

function pdfSinFormulario() {
  const objetos = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << >> >>",
  ];
  let texto = "%PDF-1.4\n";
  const offsets = objetos.map((objeto, indice) => {
    const offset = texto.length;
    texto += `${indice + 1} 0 obj\n${objeto}\nendobj\n`;
    return offset;
  });
  const xref = texto.length;
  texto += "xref\n0 4\n0000000000 65535 f \n";
  texto += offsets.map((offset) => `${String(offset).padStart(10, "0")} 00000 n \n`).join("");
  texto += `trailer\n<< /Size 4 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return Buffer.from(texto);
}

try {
  await abrir("/");
  await pagina.getByRole("heading", { name: "Solicitudes de cotización", exact: true }).waitFor();
  await alta("/productos-base/nuevo", "/productos-base", { "Código": `B-${clave}`, "Nombre": base, "Fórmula declarada": "12-60-0" });
  await alta("/marcas/nuevo", "/marcas", { "Nombre": marca });
  await alta("/productos/nuevo", "/productos", { "Nombre": producto }, [["Producto base", base], ["Marca", marca]]);
  await alta("/presentacionProductos/nuevo", "/presentacionProductos",
    { "Descripción de la presentación": "Saco de prueba", "Contenido por empaque": "25,0000" },
    [["Producto", producto], ["Unidad de medida", /KG/]]);
  await alta("/proveedores/nuevo", "/proveedores", {
    "Nombre": proveedor, "Tipo de identificación": "Juridica", "Identificación fiscal": clave, "País de identificación (ej. CR)": "CR",
  });
  await alta("/proveedores/nuevo", "/proveedores", { "Nombre": otroProveedor });
  const anterior = (await json("/Proveedor/ListarProveedor")).find((p) => p.nombre === proveedor);
  assert.ok(anterior);
  await alta(`/proveedores/editar/${anterior.idProveedor}`, "/proveedores", { "Contacto": "Contacto E2E" });
  assert.equal((await json(`/Proveedor/ObtenerProveedor/${anterior.idProveedor}`)).identificacionFiscal, clave);
  console.log("OK: catálogos, cantidad de empaque decimal y conservación de datos fiscales.");

  await abrir("/solicitudes/nueva");
  await campo("Número de solicitud").fill(numero);
  await campo("Fecha de solicitud").fill("2026-04-01");
  await campo("Nombre del cliente").fill("Finca E2E");
  await boton("Agregar renglón").click();
  await seleccionar("Producto del renglón 1", producto);
  await seleccionar("Presentación del renglón 1", "Saco de prueba");
  await campo("Empaques solicitados del renglón 1").fill("2");
  await campo(proveedor).check();
  await campo(otroProveedor).check();
  await boton("Guardar borrador").click();
  await pagina.waitForURL((url) => /^\/solicitudes\/\d+$/.test(url.pathname));
  const solicitud = rutaActual();
  const idSolicitud = solicitud.split("/").pop();
  await enlace("Editar borrador").click();
  await campo("Observaciones de la solicitud").fill("Prueba de edición antes de emitir.");
  await boton("Guardar borrador").click();
  await pagina.waitForURL((url) => url.pathname === solicitud);
  await confirmar("Emitir solicitud", "Emitir");
  await pagina.getByText(/^Estado: Emitida/).waitFor();

  const tarjeta = (nombre) => pagina.locator("section.card").filter({ has: pagina.getByRole("heading", { name: nombre, exact: true }) });
  const primera = tarjeta(proveedor);
  const descarga = pagina.waitForEvent("download");
  await primera.getByRole("button", { name: "Generar y descargar PDF", exact: true }).click();
  const archivo = await descarga;
  const bytes = await readFile(await archivo.path());
  assert.equal(bytes.subarray(0, 5).toString(), "%PDF-");
  const antes = (await json(`/solicitudes-cotizacion/${idSolicitud}`)).destinatarios.find((d) => d.nombreProveedor === proveedor);
  assert.equal(antes.fechaEnvio, null);
  await primera.getByRole("button", { name: "Registrar envío", exact: true }).click();
  await pagina.getByRole("dialog").getByRole("button", { name: "Registrar envío", exact: true }).click();
  await primera.getByText("Envío registrado.", { exact: true }).waitFor();
  await primera.getByLabel("PDF devuelto por el proveedor").setInputFiles({ name: archivo.suggestedFilename(), mimeType: "application/pdf", buffer: bytes });
  await primera.getByRole("button", { name: "Cargar proforma", exact: true }).click();
  await pagina.waitForURL((url) => /^\/respuestas\/\d+$/.test(url.pathname));
  const respuesta = rutaActual();
  await pagina.getByText(/^Formulario reconocido/).waitFor();
  const descargaOriginal = pagina.waitForEvent("download");
  await boton("Descargar PDF original").click();
  assert.deepEqual(await readFile(await (await descargaOriginal).path()), bytes);

  await enlace("Volver a la solicitud").click();
  await pagina.waitForURL((url) => url.pathname === solicitud);
  const externa = tarjeta(otroProveedor);
  await externa.getByLabel("PDF devuelto por el proveedor").setInputFiles({
    name: "Proforma-externa.pdf", mimeType: "application/pdf", buffer: pdfSinFormulario(),
  });
  await externa.getByRole("button", { name: "Cargar proforma", exact: true }).click();
  await pagina.waitForURL((url) => /^\/respuestas\/\d+$/.test(url.pathname));
  await pagina.getByText(/^Captura manual/).waitFor();
  console.log("OK: borrador, emisión, descarga, envío explícito y recepción de ambos formatos.");

  await abrir(respuesta);
  await boton("Editar cabecera").click();
  const cabecera = {
    "Número de proforma": `PRO-${clave}`, "Fecha de proforma": "2026-04-02", "Fecha de vencimiento": "2026-04-30",
    "Moneda (ej. CRC)": "CRC", "Subtotal": "200", "Descuento global": "10", "IVA global": "0",
    "Otros cargos o transporte": "5", "Total del documento": "195",
    "Cliente según el documento: Nombre": "Finca E2E", "Proveedor según el documento: Nombre": proveedor,
    "Motivo del ajuste de cabecera": "Transcripción verificada.",
  };
  for (const [nombre, valor] of Object.entries(cabecera)) await campo(nombre).fill(valor);
  await boton("Guardar cabecera").click();
  await boton("Editar renglón 1").click();
  await campo("Estado de la oferta").selectOption("Cotizada");
  await campo("Base del total de línea").selectOption("Bruto");
  await campo("Empaques ofrecidos").fill("2");
  await campo("Precio por empaque").fill("100");
  await campo("Total de línea").fill("200");
  await campo("Motivo del ajuste de renglón").fill("Precio y cantidad confirmados.");
  await boton("Guardar renglón").click();
  await boton("Revisar renglón 1").click();
  await campo("Motivo de revisión del renglón").fill("Contrastado con el PDF.");
  await boton("Confirmar revisión").click();
  await visible("Renglón revisado.");
  await boton("Conciliar importes").click();
  await campo("Motivo de la conciliación").fill("200 menos 10 más 5 son 195.");
  await boton("Guardar conciliación").click();
  await visible("Conciliación registrada.");
  await confirmar("Validar respuesta", "Validar");
  await visible("Respuesta validada.");
  await enlace("Comparar ofertas").click();
  await campo("Base de precio").selectOption("Bruto");
  await campo("Fecha para comprobar vigencia").fill("2026-04-15");
  await boton("Comparar").click();
  await pagina.getByRole("cell", { name: /^CRC 4(?:\.0+)?\/KG$/ }).first().waitFor();
  await visible("Sin respuesta validada");
  const tablaAjustes = tarjeta("Ajustes globales por proforma");
  assert.equal(await tablaAjustes.locator("tbody tr").count(), 1);
  await campo("Moneda de comparación").fill("USD");
  await boton("Comparar").click();
  await visible("Moneda distinta");
  assert.deepEqual(errores, []);
  console.log("OK: corrección, revisión, conciliación, validación y comparación con cargos globales separados.");
} catch (error) {
  if (env.GF_FRONTEND_E2E_ERROR) {
    await pagina.screenshot({ path: env.GF_FRONTEND_E2E_ERROR, fullPage: true }).catch(() => {});
  }
  throw error;
} finally {
  await navegador.close();
}
