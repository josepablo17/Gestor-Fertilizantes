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
  const idProducto = (await json("/Producto/ListarProducto")).find((item) => item.nombre === producto).idProducto;
  const presentacion = (await json("/PresentacionProducto/ListarPresentacionesProducto"))
    .find((item) => item.idProducto === idProducto);
  const { idPresentacionProducto } = presentacion;
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

  async function crearPresupuesto(finca) {
    await abrir("/presupuestos");
    await boton("Nuevo presupuesto").click();
    await campo("Nombre del presupuesto").fill(`Ciclo ${finca}`);
    await seleccionar("Finca (opcional, vacío para presupuesto general)", finca);
    await campo("Fecha de inicio").fill("2026-04-01");
    await campo("Fecha de fin").fill("2026-04-30");
    await campo("Motivo de creación").fill("Ciclo de pruebas");
    await seleccionar("Rubro 1", rubro);
    await campo("Monto inicial 1").fill("500");
    await boton("Crear borrador").click();
    await pagina.waitForURL((url) => /^\/presupuestos\/\d+$/.test(url.pathname));
    const ruta = rutaActual();
    await boton("Aprobar presupuesto").click();
    await campo("Motivo de la operación").fill("Presupuesto revisado");
    await boton("Confirmar").click();
    await boton("Cerrar presupuesto").waitFor();
    const detalle = await json(ruta);
    assert.equal(detalle.presupuesto.estado, "Aprobado");
    assert.equal(detalle.partidas[0].disponible, 500);
    return { ruta, id: detalle.partidas[0].idPartidaPresupuesto };
  }

  const norte = await crearPresupuesto(fincaNorte);
  const sur = await crearPresupuesto(fincaSur);
  await boton("Ajustar").click();
  await campo("Importe del ajuste").fill("25,0001");
  await campo("Motivo de la operación").fill("Ajuste planificado");
  await boton("Confirmar").click();
  await pagina.getByRole("cell", { name: "Ajuste planificado", exact: true }).waitFor();
  assert.equal((await json(sur.ruta)).partidas[0].disponible, 525.0001);

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
  await seleccionar("Producto", producto);
  await seleccionar("Proveedor", proveedor);
  await seleccionar("Presentación", /Saco de prueba/);
  await campo("Fecha de compra").fill(fechaCompraPresupuesto);
  await campo("Cantidad comprada").fill("2");
  await campo("Precio total").fill("180");
  await campo("Moneda").selectOption("CRC");
  await campo("Observaciones").fill(`Presupuesto ${clave}`);
  await campo("Imputar esta compra a presupuesto").check();
  await seleccionar("Partida 1", new RegExp(fincaNorte));
  await seleccionar("Compromiso 1 (opcional)", new RegExp(`#${compromiso}`));
  await campo("Importe 1").fill("100");
  await boton("Agregar distribución").click();
  await seleccionar("Partida 2", new RegExp(fincaSur));
  await seleccionar("Compromiso 2 (opcional)", new RegExp(`#${compromiso}`));
  await campo("Importe 2").fill("80");
  await campo("Motivo de la imputación").fill("Compra entregada a las fincas");
  const guardarCompra = pagina.waitForRequest((peticion) => peticion.url() === urlCompra && peticion.method() === "POST");
  await confirmar("Guardar compra", "Aceptar");
  await pagina.waitForURL((url) => url.pathname === "/compras");
  const repeticion = await pagina.request.post(urlCompra, { data: (await guardarCompra).postDataJSON() });
  assert.equal(repeticion.status(), 409, await repeticion.text());
  const comprasCoincidentes = (await json("/Compra/ListarCompra")).filter((c) => c.observaciones === `Presupuesto ${clave}`);
  assert.equal(comprasCoincidentes.length, 1);
  const [nuevaCompra] = comprasCoincidentes;
  assert.ok(nuevaCompra);
  assert.equal((await json(`/presupuestos/compras/${nuevaCompra.idCompra}`)).length, 2);
  assert.equal((await json(sur.ruta)).partidas[0].ejecutado, 80);
  assert.equal((await json(sur.ruta)).partidas[0].comprometido, 15);

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
  await pagina.getByPlaceholder("Buscar producto...").fill(producto);
  await pagina.locator(`a[href="/compras/editar/${idCompra}"]`).click();
  await pagina.waitForURL((url) => url.pathname === `/compras/editar/${idCompra}`);
  await campo("Precio total").waitFor();
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
