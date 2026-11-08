import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
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
  await campo("Buscar módulo").fill("catalogo inexistente");
  await visible("No se encontraron módulos.");
  await campo("Buscar módulo").fill("");
  await pagina.setViewportSize({ width: 390, height: 844 });
  await boton("Abrir menú").click();
  await pagina.getByRole("navigation", { name: "Navegación principal" })
    .getByRole("link", { name: "Proveedores", exact: true }).click();
  await pagina.waitForURL((url) => url.pathname === "/proveedores");
  assert.equal(await boton("Abrir menú").getAttribute("aria-expanded"), "false");
  await pagina.setViewportSize({ width: 1440, height: 960 });
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

  const grupoPaginacion = `Paginacion ${clave}`;
  for (let indice = 1; indice <= 6; indice++) {
    const altaProveedor = await pagina.request.post(new URL("/api/Proveedor/InsertarProveedor", origen).href, {
      data: { nombre: `${grupoPaginacion} ${indice}` },
    });
    assert.ok(altaProveedor.ok(), `Alta de proveedor para paginación: HTTP ${altaProveedor.status()}`);
  }
  await pagina.route("**/api/Proveedor/ListarProveedor", (route) => route.fulfill({ status: 503 }), { times: 1 });
  await abrir("/proveedores");
  await boton("Reintentar").click();
  const buscarProveedor = pagina.getByPlaceholder("Nombre, contacto o teléfono...");
  await buscarProveedor.fill(grupoPaginacion);
  const paginador = pagina.getByRole("navigation", { name: "Paginación" });
  await paginador.getByRole("button", { name: "Siguiente" }).click();
  assert.equal(await paginador.getByRole("button", { name: "Página 2" }).getAttribute("aria-current"), "page");
  assert.equal(await pagina.locator("tbody tr").count(), 1);
  await buscarProveedor.fill(`Sin coincidencias ${clave}`);
  await visible("No se encontraron resultados");
  await boton("Limpiar").click();
  await buscarProveedor.fill(grupoPaginacion);
  await paginador.getByRole("button", { name: "Página 1", exact: true }).waitFor();

  const filaProveedor = pagina.getByRole("row").filter({ hasText: `${grupoPaginacion} 1` });
  const contarRecarga = (solicitud) => {
    if (new URL(solicitud.url()).pathname === "/api/Proveedor/ListarProveedor") recargas++;
  };
  let recargas = 0;
  pagina.on("request", contarRecarga);
  await filaProveedor.getByRole("button", { name: "Desactivar" }).click();
  await pagina.getByRole("dialog").getByRole("button", { name: "Sí, desactivar" }).click();
  await visible("Registro desactivado.");
  await filaProveedor.getByText("Inactivo", { exact: true }).waitFor();
  pagina.off("request", contarRecarga);
  assert.equal(recargas, 1);
  console.log("OK: reintento, paginación, filtros sin coincidencias y una sola recarga al desactivar.");

  await abrir("/solicitudes/nueva");
  await visible("El número de solicitud se asignará automáticamente al guardar el borrador.");
  assert.equal(await campo("Número de solicitud").count(), 0);
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
  const numero = (await json(`/solicitudes-cotizacion/${idSolicitud}`)).numeroSolicitud;
  assert.match(numero, /^SOL-[0-9]{6,}$/);
  await abrir("/solicitudes");
  const abrirSolicitud = enlace(`Abrir solicitud ${numero} versión 1`);
  await abrirSolicitud.waitFor();
  assert.notEqual(await abrirSolicitud.evaluate((elemento) => getComputedStyle(elemento).backgroundColor), "rgba(0, 0, 0, 0)");
  await abrirSolicitud.click();
  await pagina.waitForURL((url) => url.pathname === solicitud);
  await enlace("Editar borrador").click();
  await visible(`Solicitud ${numero} · versión 1`);
  assert.equal(await campo("Número de solicitud").count(), 0);
  await campo("Observaciones de la solicitud").fill("Prueba de edición antes de emitir.");
  await boton("Guardar borrador").click();
  await pagina.waitForURL((url) => url.pathname === solicitud);
  assert.equal((await json(`/solicitudes-cotizacion/${idSolicitud}`)).numeroSolicitud, numero);
  await confirmar("Emitir solicitud", "Emitir");
  await pagina.getByText(/^Estado: Emitida/).waitFor();

  const tarjeta = (nombre) => pagina.locator("section.card").filter({ has: pagina.getByRole("heading", { name: nombre, exact: true }) });
  const primera = tarjeta(proveedor);
  await primera.getByText(/^Estado: Pendiente de envío ·/).waitFor();
  await tarjeta(otroProveedor).getByText(/^Estado: Pendiente de envío ·/).waitFor();
  assert.equal(await pagina.getByText(/PendienteEnvio/).count(), 0);
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
  const visor = pagina.getByTitle("PDF original de la proforma");
  await visor.waitFor();
  await pagina.locator('iframe[title="PDF original de la proforma"][src^="blob:"]').waitFor();
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
  const respuestaManual = rutaActual().split("/").pop();
  const pendientesCabecera = pagina.getByRole("region", { name: "Datos de cabecera pendientes", exact: true });
  await pendientesCabecera.waitFor();
  assert.deepEqual(await pendientesCabecera.getByRole("listitem").allTextContents(), [
    "Fecha de proforma", "Moneda", "Subtotal", "Descuento global", "IVA global",
    "Otros cargos o transporte", "Total del documento", "Cliente según el documento", "Proveedor según el documento",
  ]);
  assert.equal(await boton("Validar respuesta").isDisabled(), true);
  await boton("Editar cabecera").click();
  await campo("Fecha de proforma").fill("2026-04-02");
  await boton("Guardar cabecera").click();
  await visible("Cabecera guardada.");
  const cabeceraParcial = (await json("/respuestas-cotizacion/" + respuestaManual)).cabecera;
  assert.equal(cabeceraParcial.fechaProforma, "2026-04-02");
  assert.equal(cabeceraParcial.moneda, null);
  assert.equal(cabeceraParcial.iva, null);
  await pagina.reload();
  await pendientesCabecera.waitFor();
  assert.equal(await pendientesCabecera.getByRole("listitem").count(), 8);
  assert.equal(await pendientesCabecera.getByText("Fecha de proforma", { exact: true }).count(), 0);
  assert.equal(await boton("Validar respuesta").isDisabled(), true);
  await boton("Editar cabecera").click();
  await campo("Moneda").selectOption("CRC");
  await campo("Subtotal").fill("100");
  await campo("Total del documento").fill("100");
  assert.equal(await pendientesCabecera.getByRole("listitem").count(), 5);
  await boton("Confirmar que no hay descuentos, IVA ni otros cargos").click();
  assert.deepEqual(await pendientesCabecera.getByRole("listitem").allTextContents(), [
    "Cliente según el documento", "Proveedor según el documento",
  ]);
  await boton("Confirmar que estos nombres coinciden con el PDF").click();
  assert.equal(await pendientesCabecera.count(), 0);
  await boton("Guardar cabecera").click();
  await visible("Cabecera guardada.");
  const manualGuardada = await json("/respuestas-cotizacion/" + respuestaManual);
  assert.equal(manualGuardada.cabecera.datosClienteOriginal.nombre, "Finca E2E");
  assert.equal(manualGuardada.cabecera.datosProveedorOriginal.nombre, otroProveedor);
  assert.equal(manualGuardada.cabecera.numeroProforma, null);
  assert.equal(manualGuardada.cabecera.fechaVencimiento, null);
  assert.equal(manualGuardada.cabecera.iva, 0);
  assert.equal(manualGuardada.respuesta.estadoConciliacion, "Conciliada");
  assert.equal(await pendientesCabecera.count(), 0);
  assert.equal(await boton("Validar respuesta").isDisabled(), true);
  await visible("Confirma la revisión de 1 renglón pendiente.");
  console.log("OK: estados legibles y campos pendientes de cabecera; ceros confirmados y datos opcionales.");
  console.log("OK: borrador, emisión, descarga, envío explícito y recepción de ambos formatos.");

  await abrir(respuesta);
  await boton("Editar cabecera").click();
  const cabecera = {
    "Número de proforma": `PRO-${clave}`, "Fecha de proforma": "2026-04-02", "Fecha de vencimiento": "2026-04-30",
    "Subtotal": "200", "Descuento global": "10", "IVA global": "0",
    "Otros cargos o transporte": "5", "Total del documento": "195",
  };
  assert.equal(await campo("Nombre del negocio").count(), 0);
  assert.equal(await campo("Tipo de documento").count(), 0);
  await campo("Moneda").selectOption("CRC");
  if (!(await campo("Descuento global").isVisible())) await boton("Ver descuentos, impuestos y cargos").click();
  for (const [nombre, valor] of Object.entries(cabecera)) await campo(nombre).fill(valor);
  const confirmarNombres = boton("Confirmar que estos nombres coinciden con el PDF");
  if (await confirmarNombres.isVisible()) await confirmarNombres.click();
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
  await visible("Renglón revisado.");
  await boton("Justificar diferencias").click();
  assert.equal(await campo("Justificación de las diferencias").getAttribute("required"), "");
  assert.equal(await boton("Aceptar diferencias").isDisabled(), true);
  await boton("Ocultar justificación").click();
  await boton("Comprobar importes").click();
  await visible("Conciliación registrada.");
  const respuestaUrl = "/respuestas-cotizacion/" + respuesta.split("/").pop();
  const comprobada = await json(respuestaUrl);
  assert.equal(comprobada.respuesta.estadoConciliacion, "Conciliada");
  assert.ok(comprobada.historial.some((cambio) => cambio.motivo === "Renglón marcado como revisado."));

  await enlace("Comparar ofertas").click();
  await enlace("Volver a la solicitud").click();
  await tarjeta(proveedor).getByRole("button", { name: "Ver respuestas", exact: true }).click();
  await tarjeta(proveedor).getByRole("link").filter({ hasText: "PRO-" + clave }).click();
  await pagina.waitForURL((url) => url.pathname === respuesta);
  await visible("Importes comprobados");
  await pagina.reload();
  await visible("Importes comprobados");
  const consultaGuardada = await pagina.request.get(new URL("/api" + respuestaUrl, origen).href);
  assert.match(consultaGuardada.headers()["cache-control"], /no-store/);
  assert.equal((await consultaGuardada.json()).data.respuesta.justificacionConciliacion, comprobada.respuesta.justificacionConciliacion);

  await boton("Editar cabecera").click();
  await pagina.getByText("Información adicional (opcional)", { exact: true }).click();
  await campo("Vendedor").fill("Contacto actualizado");
  const actualizacion = pagina.waitForResponse((r) => r.request().method() === "PUT" && new URL(r.url()).pathname.endsWith("/cabecera"));
  await boton("Guardar cabecera").click();
  assert.ok((await actualizacion).ok());
  await visible("Cabecera guardada.");
  const contacto = await json(respuestaUrl);
  assert.equal(contacto.respuesta.estadoConciliacion, "Conciliada");
  assert.equal(contacto.respuesta.justificacionConciliacion, comprobada.respuesta.justificacionConciliacion);
  await pagina.reload();
  await visible("Importes comprobados");
  await confirmar("Validar respuesta", "Validar");
  await visible("Respuesta validada.");
  const idProducto = (await json("/Producto/ListarProducto")).find((item) => item.nombre === producto).idProducto;
  const presentacion = (await json("/PresentacionProducto/ListarPresentacionesProducto"))
    .find((item) => item.idProducto === idProducto);
  const { idPresentacionProducto } = presentacion;
  const productoOriginal = (await json("/Producto/ListarProducto")).find((item) => item.idProducto === idProducto);
  const segundoProducto = `Producto secundario ${clave}`;
  const altaSegundo = await pagina.request.post(new URL("/api/Producto/InsertarProducto", origen).href,
    { data: { nombre: segundoProducto, idProductoBase: productoOriginal.idProductoBase } });
  assert.ok(altaSegundo.ok(), await altaSegundo.text());
  const idSegundo = (await json("/Producto/ListarProducto")).find((item) => item.nombre === segundoProducto).idProducto;
  const altaPresentacionSegunda = await pagina.request.post(new URL("/api/PresentacionProducto/InsertarPresentacionProducto", origen).href,
    { data: { idProducto: idSegundo, idUnidadMedida: presentacion.idUnidadMedida, descripcion: "Bolsa secundaria", cantidad: 5 } });
  assert.ok(altaPresentacionSegunda.ok(), await altaPresentacionSegunda.text());
  const urlCompra = new URL("/api/Compra/InsertarCompra", origen).href;
  const datosCompra = { idProducto, idPresentacionProducto, idProveedor: anterior.idProveedor,
    fechaCompra: new Date(Date.now() - 86400000).toISOString().slice(0, 10),
    cantidadComprada: 2, precioTotal: 250, moneda: "USD" };
  async function registrarCompra(datos) {
    const respuesta = await pagina.request.post(urlCompra, { data: { ...datosCompra, ...datos } });
    assert.ok(respuesta.ok(), `Alta de compra: HTTP ${respuesta.status()} ${await respuesta.text()}`);
    return (await respuesta.json()).data.idCompra;
  }
  const historica = await registrarCompra({ fechaCompra: "2026-04-14", moneda: "CRC", precioTotal: 300 });
  await registrarCompra({ fechaCompra: "2026-04-16", moneda: "CRC", precioTotal: 900 });
  const otraPresentacion = await pagina.request.post(new URL("/api/PresentacionProducto/InsertarPresentacionProducto", origen).href,
    { data: { idProducto, idUnidadMedida: presentacion.idUnidadMedida, descripcion: "Saco alternativo de 50 kg", cantidad: 50 } });
  assert.ok(otraPresentacion.ok(), `Alta de presentación alternativa: HTTP ${otraPresentacion.status()}`);
  await registrarCompra({ idPresentacionProducto: (await otraPresentacion.json()).data.idPresentacionProducto,
    fechaCompra: "2026-04-15", moneda: "CRC", precioTotal: 100 });

  await enlace("Comparar ofertas").click();
  await campo("Base de precio").selectOption("Bruto");
  await campo("Fecha para comprobar vigencia").fill("2026-04-15");
  await boton("Comparar").click();
  const matriz = pagina.getByRole("table", { name: "Ofertas por producto y proveedor" });
  await matriz.getByRole("columnheader", { name: proveedor }).waitFor();
  await matriz.getByRole("columnheader", { name: otroProveedor }).waitFor();
  await matriz.locator("td").getByText(/^CRC 4(?:\.0+)?\/KG$/).first().waitFor();
  await matriz.getByText(/Último precio pagado CRC 6\/KG/).waitFor();
  assert.equal(await matriz.getByRole("link", { name: "Ver compra del 2026-04-14" }).getAttribute("href"), `/compras/editar/${historica}`);
  await visible("Sin respuesta validada");
  const tablaAjustes = tarjeta("Ajustes globales por proforma");
  assert.equal(await tablaAjustes.locator("tbody tr").count(), 1);
  await campo("Moneda de comparación").fill("USD");
  await boton("Comparar").click();
  await visible("Moneda distinta");
  await visible("Sin compras previas en USD");

  const rubro = `Agroquímicos ${clave}`;
  const fincaNorte = `Norte ${clave}`;
  const fincaSur = `Sur ${clave}`;
  await enlace("Presupuestos").click();
  await pagina.getByText("Registrar rubro", { exact: true }).click();
  await campo("Código de rubro").fill(`F-${clave}`);
  await campo("Nombre de rubro").fill(rubro);
  await boton("Guardar rubro").click();
  await visible("Catálogo actualizado.");
  await pagina.getByText("Registrar finca", { exact: true }).click();
  for (const [codigo, nombre] of [[`N-${clave}`, fincaNorte], [`S-${clave}`, fincaSur]]) {
    await campo("Código de finca").fill(codigo);
    await campo("Nombre de finca").fill(nombre);
    await boton("Guardar finca").click();
    await pagina.getByLabel("Filtrar por finca").getByRole("option", { name: nombre }).waitFor({ state: "attached" });
  }
  const rubroExtra = `Otros insumos ${clave}`;
  const altaRubroExtra = await pagina.request.post(new URL("/api/presupuestos/rubros", origen).href,
    { data: { codigo: `E-${clave}`, nombre: rubroExtra } });
  assert.ok(altaRubroExtra.ok(), await altaRubroExtra.text());

  async function guardarBorradorPresupuesto(ruta) {
    const respuesta = pagina.waitForResponse((r) => r.request().method() === "PUT" && new URL(r.url()).pathname === `/api${ruta}/borrador`);
    await boton("Guardar borrador").click();
    const guardada = await respuesta;
    assert.equal(guardada.status(), 200, await guardada.text());
    await boton("Guardar borrador").waitFor({ state: "detached" });
  }

  async function crearPresupuesto(finca) {
    await abrir("/presupuestos");
    await boton("Nuevo presupuesto").click();
    await campo("Nombre del presupuesto").fill(`Ciclo ${finca}`);
    await seleccionar("Finca (opcional, vacío para presupuesto general)", finca);
    await campo("Fecha de inicio").fill("2026-04-01");
    await campo("Fecha de fin").fill("2026-04-30");
    await campo("Motivo de creación").fill("Ciclo de pruebas");
    await seleccionar("Rubro 1", rubro);
    await campo("Monto inicial 1").fill("400");
    await boton("Crear borrador").click();
    await pagina.waitForURL((url) => /^\/presupuestos\/\d+$/.test(url.pathname));
    const ruta = rutaActual();
    const original = await json(ruta);
    await boton("Editar borrador").click();
    assert.equal(await campo("Motivo de creación").count(), 0);
    await campo("Nombre del presupuesto").fill(`Ciclo revisado ${finca}`);
    await campo("Monto inicial 1").fill("500");
    await boton("Agregar partida").click();
    await seleccionar("Rubro 2", rubroExtra);
    await campo("Monto inicial 2").fill("100");
    await guardarBorradorPresupuesto(ruta);
    const editado = await json(ruta);
    assert.equal(editado.presupuesto.estado, "Borrador");
    assert.equal(editado.presupuesto.nombre, `Ciclo revisado ${finca}`);
    assert.notEqual(editado.presupuesto.version, original.presupuesto.version);
    assert.equal(editado.partidas[0].montoInicial, 500);
    assert.equal(editado.partidas.length, 2);
    assert.equal(editado.partidas[0].idPartidaPresupuesto, original.partidas[0].idPartidaPresupuesto);
    assert.equal(editado.partidas[0].aprobado, 0);
    assert.equal(editado.movimientos.length, 0);
    const desactualizada = await pagina.request.put(new URL(`/api${ruta}/borrador`, origen).href, { data: {
      idOperacion: randomUUID(), version: original.presupuesto.version, nombre: "No debe sobrescribirse",
      idFinca: editado.presupuesto.idFinca, fechaInicio: "2026-04-01", fechaFin: "2026-04-30", moneda: "CRC",
      partidas: editado.partidas.map((p) => ({ idRubroPresupuesto: p.idRubroPresupuesto, monto: 999 })),
    } });
    assert.equal(desactualizada.status(), 409, await desactualizada.text());
    await pagina.reload();
    await boton("Editar borrador").click();
    assert.equal(await campo("Monto inicial 1").inputValue(), "500");
    await boton("Quitar partida 2").click();
    await guardarBorradorPresupuesto(ruta);
    assert.equal((await json(ruta)).partidas.length, 1);
    await boton("Editar borrador").click();
    await campo("Monto inicial 1").fill("999");
    await boton("Cancelar edición").click();
    assert.equal((await json(ruta)).partidas[0].montoInicial, 500);
    await boton("Aprobar presupuesto").click();
    await campo("Motivo de la operación").fill("Presupuesto revisado");
    await boton("Confirmar").click();
    await boton("Cerrar presupuesto").waitFor();
    const detalle = await json(ruta);
    assert.equal(detalle.presupuesto.estado, "Aprobado");
    assert.equal(detalle.partidas[0].disponible, 500);
    assert.equal(await boton("Editar borrador").count(), 0);
    return { ruta, id: detalle.partidas[0].idPartidaPresupuesto };
  }

  const norte = await crearPresupuesto(fincaNorte);
  const sur = await crearPresupuesto(fincaSur);
  await boton("Cambiar monto").click();
  await campo("Motivo del ajuste").fill("Ajuste planificado");
  assert.equal(await boton("Confirmar").isDisabled(), true);
  await campo("Nuevo monto aprobado").fill("525,0001");
  await pagina.getByRole("region", { name: "Vista previa del ajuste" }).getByText("Aumento: CRC 25", { exact: true }).waitFor();
  const envioMonto = pagina.waitForRequest((r) => new URL(r.url()).pathname.endsWith(`/partidas/${sur.id}/monto`) && r.method() === "POST");
  await boton("Confirmar").click();
  await pagina.getByRole("cell", { name: "Ajuste planificado", exact: true }).waitFor();
  const ampliado = await json(sur.ruta);
  assert.equal(ampliado.partidas[0].disponible, 525.0001);
  assert.equal(ampliado.partidas[0].montoInicial, 500);
  assert.equal(ampliado.movimientos.find((m) => m.motivo === "Ajuste planificado").cambioAprobado, 25.0001);
  const repetidoMonto = await pagina.request.post(new URL(`/api/presupuestos/partidas/${sur.id}/monto`, origen).href,
    { data: (await envioMonto).postDataJSON() });
  assert.equal(repetidoMonto.status(), 409, await repetidoMonto.text());
  assert.equal((await json(sur.ruta)).partidas[0].aprobado, 525.0001);

  await abrir(`${solicitud}/comparacion`);
  await campo("Base de precio").selectOption("Bruto");
  await campo("Fecha para comprobar vigencia").fill("2026-04-15");
  await boton("Comparar").click();
  await boton("Preparar compromiso").click();
  await campo("Motivo de la reserva").fill("Pedido para las dos fincas");
  await seleccionar("Partida 1", new RegExp(fincaNorte));
  await seleccionar("Oferta 1", new RegExp(proveedor));
  await campo("Importe 1").fill("100");
  await boton("Agregar distribución").click();
  await seleccionar("Partida 2", new RegExp(fincaSur));
  await seleccionar("Oferta 2", new RegExp(proveedor));
  await campo("Importe 2").fill("95");
  await boton("Registrar compromiso").click();
  await pagina.getByRole("status").filter({ hasText: /Compromiso #\d+ registrado/ }).waitFor();
  const detalleNorte = await json(norte.ruta);
  const detalleSur = await json(sur.ruta);
  const compromiso = detalleNorte.compromisos[0].idCompromisoCompra;
  assert.equal(detalleSur.compromisos[0].idCompromisoCompra, compromiso);
  assert.equal(detalleNorte.partidas[0].comprometido, 100);
  assert.equal(detalleSur.partidas[0].comprometido, 95);

  await abrir(sur.ruta);
  await boton("Cambiar monto").click();
  await campo("Nuevo monto aprobado").fill("94,9999");
  await campo("Motivo del ajuste").fill("No debe consumir la reserva");
  await visible("La reducción no puede consumir dinero ya reservado o gastado.");
  assert.equal(await boton("Confirmar").isDisabled(), true);
  const montoImposible = await pagina.request.post(new URL(`/api/presupuestos/partidas/${sur.id}/monto`, origen).href,
    { data: { idOperacion: randomUUID(), motivo: "Comprobar protección de reserva", nuevoMonto: "94.9999", montoAprobadoEsperado: "525.0001" } });
  assert.equal(montoImposible.status(), 409, await montoImposible.text());
  await campo("Nuevo monto aprobado").fill("500");
  await campo("Motivo del ajuste").fill("Reducción revisada");
  await pagina.getByRole("region", { name: "Vista previa del ajuste" }).getByText("Reducción: CRC 25", { exact: true }).waitFor();
  await boton("Confirmar").click();
  await pagina.getByRole("cell", { name: "Reducción revisada", exact: true }).waitFor();
  assert.equal((await json(sur.ruta)).partidas[0].disponible, 405);
  await boton("Cambiar monto").click();
  await campo("Nuevo monto aprobado").fill("525,0001");
  await campo("Motivo del ajuste").fill("Restaurar monto planificado");
  await boton("Confirmar").click();
  await pagina.getByRole("cell", { name: "Restaurar monto planificado", exact: true }).waitFor();
  console.log("OK: edición de borrador, cancelación, conflicto de versión, nuevo monto con vista previa y protección de reservas.");

  const fechaCompraPresupuesto = "2026-04-17";
  const compraInvalida = await pagina.request.post(urlCompra, { data: { ...datosCompra, moneda: "CRC",
    fechaCompra: fechaCompraPresupuesto, precioTotal: 180, observaciones: `Fallida ${clave}`,
    imputacionPresupuesto: { idOperacion: randomUUID(), motivo: "Verificar reversión automática",
      distribucion: [{ idPartidaPresupuesto: norte.id, monto: 1 }] },
  } });
  assert.equal(compraInvalida.status(), 400, await compraInvalida.text());
  assert.match((await compraInvalida.json()).mensaje, /coincidir exactamente/);
  assert.ok(!(await json("/Compra/ListarCompra")).some((c) => c.observaciones === `Fallida ${clave}`));
  assert.equal((await json(norte.ruta)).partidas[0].comprometido, 100);

  await abrir("/compras/nuevo");
  await seleccionar("Proveedor", proveedor);
  await campo("Fecha de compra").fill(fechaCompraPresupuesto);
  await campo("Moneda").selectOption("CRC");
  await campo("Número de factura (opcional)").fill(`FAC-${clave}`);
  await campo("Observaciones de la compra (opcional)").fill(`Presupuesto ${clave}`);
  await seleccionar("Producto del renglón 1", producto);
  await seleccionar("Presentación del renglón 1", /Saco de prueba/);
  await campo("Empaques del renglón 1").fill("2");
  await campo("Importe del renglón 1").fill("180");
  await boton("Agregar producto").click();
  await seleccionar("Producto del renglón 2", segundoProducto);
  await seleccionar("Presentación del renglón 2", /Bolsa secundaria/);
  await campo("Empaques del renglón 2").fill("3");
  await campo("Importe del renglón 2").fill("60");
  await boton("Agregar producto").click();
  await boton("Quitar renglón 3").click();
  assert.equal(await campo("Producto del renglón 3").count(), 0);
  await campo("Imputar el renglón 1 a presupuesto").check();
  await seleccionar("Partida 1", new RegExp(fincaNorte));
  await seleccionar("Compromiso 1 (opcional)", new RegExp(`#${compromiso}`));
  await campo("Importe 1").fill("100");
  await boton("Agregar distribución").click();
  await seleccionar("Partida 2", new RegExp(fincaSur));
  await seleccionar("Compromiso 2 (opcional)", new RegExp(`#${compromiso}`));
  await campo("Importe 2").fill("80");
  await campo("Motivo de la imputación").fill("Compra entregada a las fincas");
  const urlDocumento = new URL("/api/compras-documento", origen).href;
  const guardarCompra = pagina.waitForRequest((peticion) => peticion.url() === urlDocumento && peticion.method() === "POST");
  await boton("Guardar compra").click();
  await pagina.waitForURL((url) => /^\/compras\/\d+$/.test(url.pathname));
  const rutaDocumento = rutaActual();
  const compraDocumento = await json("/compras-documento/" + rutaDocumento.split("/").pop());
  assert.equal(compraDocumento.lineas.length, 2);
  assert.equal(compraDocumento.total, 240);
  assert.equal(compraDocumento.lineas[0].presentacion, "Saco de prueba");
  assert.equal(compraDocumento.lineas[0].cantidadPresentacion, 25);
  assert.equal(compraDocumento.lineas[0].unidadMedida, "KG");
  assert.equal(compraDocumento.lineas[1].presentacion, "Bolsa secundaria");
  assert.equal(compraDocumento.lineas[1].cantidadPresentacion, 5);
  assert.equal(compraDocumento.lineas[1].unidadMedida, "KG");
  await visible(compraDocumento.numeroCompra);
  await visible("Saco de prueba · 25 KG");
  await visible("Bolsa secundaria · 5 KG");
  const cuerpoDocumento = (await guardarCompra).postDataJSON();
  const repeticion = await pagina.request.post(urlDocumento, { data: cuerpoDocumento });
  assert.equal(repeticion.status(), 201, await repeticion.text());
  assert.equal((await repeticion.json()).data.idCompraCabecera, compraDocumento.idCompraCabecera);
  const [nuevaCompra] = compraDocumento.lineas;
  assert.ok(nuevaCompra);
  assert.equal((await json(`/presupuestos/compras/${nuevaCompra.idCompra}`)).length, 2);
  assert.equal((await json(sur.ruta)).partidas[0].ejecutado, 80);
  assert.equal((await json(sur.ruta)).partidas[0].comprometido, 15);

  const fallidaMultiple = structuredClone(cuerpoDocumento);
  fallidaMultiple.idOperacion = randomUUID();
  fallidaMultiple.numeroFactura = `FALLIDA-${clave}`;
  fallidaMultiple.lineas[0].imputacionPresupuesto = { motivo: "Probar rollback conjunto", distribucion: [{ idPartidaPresupuesto: norte.id, monto: 180 }] };
  fallidaMultiple.lineas[1].idPresentacionProducto = idPresentacionProducto;
  const falloMultiple = await pagina.request.post(urlDocumento, { data: fallidaMultiple });
  assert.equal(falloMultiple.status(), 400, await falloMultiple.text());
  assert.equal((await json(`/compras-documento?busqueda=FALLIDA-${clave}`)).totalRegistros, 0);
  assert.equal((await json(norte.ruta)).partidas[0].ejecutado, 100);
  assert.equal((await json(sur.ruta)).partidas[0].ejecutado, 80);
  await boton("Editar renglón 2").click();
  await campo("Importe del renglón 2").fill("75");
  await boton("Guardar renglón").click();
  await boton("Editar renglón 2").waitFor();
  const corregida = await json("/compras-documento/" + compraDocumento.idCompraCabecera);
  assert.equal(corregida.total, 255);
  assert.equal(corregida.lineas[0].precioTotal, 180);
  assert.equal(corregida.lineas[0].idCompra, nuevaCompra.idCompra);
  const conflicto = await pagina.request.put(new URL(`/api/compras-documento/${compraDocumento.idCompraCabecera}/cabecera`, origen).href,
    { data: { ...cuerpoDocumento, lineas: undefined, idOperacion: undefined, version: compraDocumento.version } });
  assert.equal(conflicto.status(), 409, await conflicto.text());
  console.log("OK: compra con dos productos, reintento sin duplicación, rollback presupuestario y edición con control de versión.");

  await abrir(`/compras/editar/${nuevaCompra.idCompra}`);
  await boton("Revertir distribución").click();
  await campo("Motivo de la reversión").fill("Verificación del retorno de la reserva");
  await boton("Confirmar reversión").click();
  await visible("Distribución revertida.");
  assert.equal((await json(sur.ruta)).partidas[0].ejecutado, 0);
  assert.equal((await json(sur.ruta)).partidas[0].comprometido, 95);
  await abrir(sur.ruta);
  await boton(`Finalizar #${compromiso}`).click();
  await campo("Motivo de la operación").fill("Liberar el saldo pendiente");
  await boton("Confirmar").click();
  await pagina.getByRole("cell", { name: "Liberar el saldo pendiente", exact: true }).waitFor();
  assert.equal((await json(norte.ruta)).partidas[0].comprometido, 0);
  assert.equal((await json(sur.ruta)).partidas[0].disponible, 525.0001);
  await boton("Cerrar presupuesto").click();
  await campo("Motivo de la operación").fill("Ciclo finalizado");
  await boton("Confirmar").click();
  await pagina.getByText(/CRC · Cerrado/).waitFor();
  assert.equal(await boton("Editar borrador").count(), 0);
  assert.equal(await boton("Cambiar monto").count(), 0);
  const cerradoMonto = await pagina.request.post(new URL(`/api/presupuestos/partidas/${sur.id}/monto`, origen).href,
    { data: { idOperacion: randomUUID(), motivo: "No debe modificar un presupuesto cerrado", nuevoMonto: 700, montoAprobadoEsperado: "525.0001" } });
  assert.equal(cerradoMonto.status(), 409, await cerradoMonto.text());
  console.log("OK: presupuesto, reserva de oferta para dos fincas, compra atómica, reversión y cierre.");

  const compraFraccionaria = await pagina.request.post(urlCompra, { data: { ...datosCompra, cantidadComprada: 2.5 } });
  assert.equal(compraFraccionaria.status(), 400);
  assert.match((await compraFraccionaria.json()).mensaje, /número entero/);
  await registrarCompra({ precioTotal: 190 });
  const idCompra = await registrarCompra({});
  const ultimaCompra = await registrarCompra({ precioTotal: 320 });
  const fechaPosterior = new Date().toISOString().slice(0, 10);
  const consulta = new URLSearchParams({ idProducto, idPresentacionProducto, moneda: "USD",
    fechaLimite: fechaPosterior, idCompraLimite: ultimaCompra });
  assert.equal((await json(`/Compra/ObtenerUltimoPrecio?${consulta}`)).idCompra, idCompra);
  await abrir("/compras");
  await campo("Buscar compras").fill(producto);
  await boton("Buscar").click();
  const compraHistorica = await json(`/Compra/ObtenerCompra/${idCompra}`);
  const compraListado = (await json("/Compra/ListarCompra")).find((c) => c.idCompra === idCompra);
  const compraHistorial = (await json(`/Compra/HistorialPorProducto/${idProducto}`)).find((c) => c.idCompra === idCompra);
  for (const c of [compraHistorica, compraListado, compraHistorial]) {
    assert.ok(c, "La compra debe aparecer en detalle, listado e historial.");
    assert.equal(c.presentacion, "Saco de prueba");
    assert.equal(c.cantidadPresentacion, 25);
    assert.equal(c.unidadMedida, "KG");
  }
  await pagina.locator(`a[href="/compras/${compraHistorica.idCompraCabecera}"]`).click();
  await pagina.waitForURL((url) => url.pathname === `/compras/${compraHistorica.idCompraCabecera}`);
  await boton("Editar renglón 1").waitFor();
  await abrir(`/compras/editar/${idCompra}`);
  await campo("Precio total").waitFor();
  assert.equal(await campo("Presentación").locator("option:checked").textContent(), "Saco de prueba · 25 KG");
  console.log("OK: presentación, contenido y unidad completos en compras anteriores, documentos nuevos y selector.");
  const referencia = tarjeta("Referencia de compras");
  const formato = (currency, precio) => new Intl.NumberFormat("es-CR", { style: "currency", currency,
    minimumFractionDigits: 0, maximumFractionDigits: 1 }).format(precio);
  await referencia.getByText(formato("USD", 95), { exact: true }).waitFor();
  await referencia.getByText(formato("USD", 125), { exact: true }).waitFor();
  assert.equal(await campo("Precio total").inputValue(), "250");
  await campo("Precio total").fill("2e3");
  assert.equal(await campo("Precio total").inputValue(), "250");
  await campo("Precio total").fill("250,35");
  assert.equal(await campo("Precio total").inputValue(), "250,35");
  await referencia.getByText(formato("USD", 125.2), { exact: true }).waitFor();
  await campo("Cantidad comprada").fill("dos");
  assert.equal(await campo("Cantidad comprada").inputValue(), "2");
  await campo("Cantidad comprada").clear();
  await campo("Cantidad comprada").pressSequentially("2.5");
  assert.equal(await campo("Cantidad comprada").inputValue(), "2.5");
  assert.equal(await campo("Cantidad comprada").evaluate((input) => input.checkValidity()), false);

  await campo("Moneda").selectOption("CRC");
  await campo("Fecha de compra").fill("2026-04-15");
  await referencia.getByText(formato("CRC", 150), { exact: true }).waitFor();
  await campo("Fecha de compra").fill("2026-04-13");
  await visible("Sin compras previas para esta presentación en CRC hasta la fecha seleccionada.");
  await abrir("/compras-inteligencia");
  await pagina.waitForURL((url) => url.pathname === "/compras");
  await abrir("/comparador-proveedores");
  await pagina.waitForURL((url) => url.pathname === "/solicitudes");
  console.log("OK: referencias de compra por presentación, moneda y fecha en cotizaciones y compras.");
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
