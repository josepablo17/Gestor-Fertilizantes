import assert from "node:assert/strict";
import test from "node:test";
import { decimalOpcional, enteroOpcional, idRuta, leerJson } from "../src/utils/datosApi.js";
import { formatearCantidadComprada, formatearNumero, numeroEditable } from "../src/utils/numeros.js";
import { cuerpoCatalogo, valoresCatalogo } from "../src/utils/formulariosCatalogo.js";
import { cuerpoSolicitud, valoresSolicitud } from "../src/modulos/cotizaciones/utils/formularioSolicitud.js";
import { camposPendientesCabecera, confirmarNombresCabecera, cuerpoCabecera, cuerpoLinea, requiereMotivoCabecera, valoresCabecera, valoresLinea } from "../src/modulos/cotizaciones/utils/formularioRespuesta.js";
import { etiquetaConciliacion, etiquetaCotizacion } from "../src/modulos/cotizaciones/utils/etiquetasCotizacion.js";
import { criteriosImputacionCompra, prepararDocumentoCompra, totalDocumentoCompra, valoresRenglon } from "../src/modulos/compras/utils/documentoCompra.js";
import { prepararBorradorPresupuesto, vistaPreviaMonto } from "../src/modulos/presupuestos/utils/edicionPresupuesto.js";

test("conserva identificadores bigint e importes exactos al leer JSON", () => {
  const dato = leerJson('{"idSolicitudCotizacion":9007199254740993,"precio":999999999999.123456,"unidad":3}');
  assert.equal(idRuta(dato.idSolicitudCotizacion), "9007199254740993");
  assert.equal(dato.precio, "999999999999.123456");
  assert.equal(dato.unidad, 3);
  assert.throws(() => idRuta("../solicitudes"));
  assert.equal(decimalOpcional("25,0500", 4, true), "25.0500");
  assert.equal(decimalOpcional("", 4), null);
  assert.throws(() => decimalOpcional("1.00001", 4));
});

test("envía únicamente los campos aceptados por catálogos y conserva datos fiscales", () => {
  const presentacion = valoresCatalogo("presentaciones", {
    idProducto: 7, idUnidadMedida: 4, cantidad: "25.0000", cantidadNormalizada: 25, descripcion: "Saco", activo: true,
  });
  assert.deepEqual(cuerpoCatalogo("presentaciones", presentacion), {
    idProducto: 7, idUnidadMedida: 4, cantidad: "25", descripcion: "Saco",
  });
  const proveedor = valoresCatalogo("proveedores", {
    nombre: "Proveedor", tipoIdentificacion: "Juridica", identificacionFiscal: "001", paisIdentificacion: "CR",
    fechaUltimaSincronizacion: "2026-04-01T01:02:03.1234567Z",
  });
  const guardado = cuerpoCatalogo("proveedores", { ...proveedor, nombre: "Proveedor nuevo" });
  assert.equal(guardado.identificacionFiscal, "001");
  assert.equal(guardado.fechaUltimaSincronizacion, "2026-04-01T01:02:03.1234567Z");
});

test("edita un borrador sin devolver las copias históricas ni los IDs de destinatario", () => {
  const borrador = valoresSolicitud({
    numeroSolicitud: "SOL", fechaSolicitud: "2026-04-01", destinatarios: [{ idSolicitudCotizacionProveedor: 50, idProveedor: 7 }],
    lineas: [{ idSolicitudCotizacionDetalle: 44, idProducto: 1, idPresentacionProducto: 2, cantidadEmpaquesSolicitada: "2.50",
      permiteAlternativas: false, nombreProductoOriginal: "Nombre histórico" }],
  });
  const datos = cuerpoSolicitud(borrador);
  assert.equal("numeroSolicitud" in datos, false);
  assert.deepEqual(datos.proveedores, [7]);
  assert.deepEqual(datos.lineas[0], {
    numeroLinea: 1, idProducto: 1, idPresentacionProducto: 2, cantidadEmpaques: "2.5", permiteAlternativas: false, observaciones: null,
  });
});

test("presenta como máximo un decimal y mantiene los datos exactos al editar", () => {
  assert.equal(formatearNumero("24.567800"), "24,6");
  assert.equal(formatearNumero("25.0000"), "25");
  assert.equal(formatearNumero("0.001000"), "< 0,1");
  assert.equal(formatearCantidadComprada("2.0000"), "2");
  assert.equal(formatearCantidadComprada("2.5000"), "Cantidad fraccionaria");
  assert.equal(numeroEditable("24.567800"), "24.5678");
  assert.throws(() => enteroOpcional("2e3"));
  assert.throws(() => enteroOpcional("0x10"));
});

test("una oferta no cotizada no conserva importes y una cabecera no inventa ceros", () => {
  const entrada = valoresLinea({ idSolicitudDetalle: "9007199254740993", tipoOferta: "Solicitada", estadoOferta: "NoDisponible",
    precioUnitario: "98.25", baseTotalLinea: "Bruto" });
  const guardada = cuerpoLinea(entrada);
  assert.equal(guardada.idSolicitudDetalle, "9007199254740993");
  assert.equal(guardada.precioUnitario, null);
  assert.equal(guardada.baseTotalLinea, "SinDefinir");
  const cabecera = cuerpoCabecera(valoresCabecera({ iva: 0, datosProveedorOriginal: { nombre: "Proveedor", referencia: "original" } }));
  assert.equal(cabecera.iva, "0");
  assert.equal(cabecera.total, null);
  assert.equal(cabecera.datosProveedorOriginal.referencia, "original");
  assert.equal(cabecera.datosClienteOriginal, null);
});

test("la cabecera distingue una corrección monetaria y conserva identidades y datos originales", () => {
  const original = { moneda: "CRC", subtotal: "200.0000", total: "195.0000", descuento: "10.0000", iva: "0.0000",
    otrosCargos: "5.0000", nombreNegocio: "Texto del PDF", datosClienteOriginal: { referencia: "literal" },
    datosProveedorOriginal: { nombre: "Razón social del PDF", identificacion: "001" } };
  const valores = valoresCabecera(original);
  assert.equal(requiereMotivoCabecera(original, { ...valores, vendedor: "Contacto" }, "Conciliada"), false);
  assert.equal(requiereMotivoCabecera(original, { ...valores, total: "196" }, "Conciliada"), true);
  assert.equal(requiereMotivoCabecera(original, { ...valores, moneda: "USD" }, "ConDiferencias"), true);
  assert.equal(requiereMotivoCabecera(original, { ...valores, total: "196" }, "Pendiente"), false);
  assert.equal(valores.datosClienteOriginal.nombre, undefined);
  const confirmados = confirmarNombresCabecera(valores, "Cliente confirmado", "Nombre de catálogo");
  assert.equal(confirmados.datosClienteOriginal.nombre, "Cliente confirmado");
  assert.equal(confirmados.datosClienteOriginal.referencia, "literal");
  assert.equal(confirmados.datosProveedorOriginal.nombre, "Razón social del PDF");
  const guardados = cuerpoCabecera(confirmados);
  assert.equal(guardados.nombreNegocio, "Texto del PDF");
  assert.equal(guardados.datosProveedorOriginal.identificacion, "001");
});

test("indica los datos de cabecera pendientes sin exigir opcionales ni confundir cero con vacío", () => {
  const completa = {
    fechaProforma: "2026-04-02", moneda: "CRC", subtotal: "100.0000", total: "100",
    descuento: 0, iva: "0.0000", otrosCargos: "0",
    datosClienteOriginal: { nombre: "Cliente" }, datosProveedorOriginal: { nombre: "Proveedor" },
  };
  assert.deepEqual(camposPendientesCabecera(completa), []);
  assert.deepEqual(camposPendientesCabecera(valoresCabecera(completa)), []);
  const incompleta = {
    ...completa, fechaProforma: " ", moneda: "", descuento: null, iva: undefined,
    otrosCargos: "", datosClienteOriginal: {}, datosProveedorOriginal: { nombre: "   " },
  };
  const pendientes = camposPendientesCabecera(incompleta);
  assert.deepEqual(pendientes.map(({ etiqueta }) => etiqueta), [
    "Fecha de proforma", "Moneda", "Descuento global", "IVA global", "Otros cargos o transporte",
    "Cliente según el documento", "Proveedor según el documento",
  ]);
  assert.deepEqual(camposPendientesCabecera(cuerpoCabecera(valoresCabecera(incompleta))), pendientes);
  assert.equal(camposPendientesCabecera({ ...completa, datosClienteOriginal: { identificacion: "001" } }).length, 0);
  assert.equal(completa.descuento, 0);
  assert.equal(incompleta.datosProveedorOriginal.nombre, "   ");
});

test("muestra etiquetas de negocio en estados y bases de precio, con contexto en la conciliación", () => {
  assert.equal(etiquetaCotizacion("PendienteEnvio"), "Pendiente de envío");
  assert.equal(etiquetaCotizacion("EnRevision"), "En revisión");
  assert.equal(etiquetaCotizacion("NoDisponible"), "No disponible");
  assert.equal(etiquetaCotizacion("SinCotizar"), "Sin cotizar");
  assert.equal(etiquetaCotizacion("NetoSinImpuestos"), "Neto sin impuestos");
  assert.equal(etiquetaCotizacion("ConImpuestos"), "Con impuestos");
  assert.equal(etiquetaCotizacion("Enviada"), "Enviada");
  assert.equal(etiquetaCotizacion(null), "—");
  assert.equal(etiquetaCotizacion("Pendiente"), "Pendiente");
  assert.equal(etiquetaConciliacion("Pendiente"), "Pendiente de comprobar");
  assert.equal(etiquetaConciliacion("Conciliada"), "Importes comprobados");
  assert.equal(etiquetaConciliacion("ConDiferencias"), "Con diferencias justificadas");
});

test("agrupa varios productos con importes exactos y distribuciones por renglón", () => {
  const cabecera = { idProveedor: 7, fechaCompra: "2026-04-02", moneda: "CRC", numeroFactura: " FAC-1 " };
  const primera = { ...valoresRenglon(), idProducto: 1, idPresentacionProducto: 2, cantidadComprada: "2", precioTotal: "0,1001" };
  const segunda = { ...valoresRenglon(), idProducto: 3, idPresentacionProducto: 4, cantidadComprada: "3", precioTotal: "0,2002" };
  primera.imputacion = { criterios: criteriosImputacionCompra(cabecera, primera),
    datos: { motivo: "Entrega a finca", motivoExceso: "", filas: [{ idPartidaPresupuesto: "9007199254740993", monto: "0,1001" }] } };
  const datos = prepararDocumentoCompra(cabecera, [primera, segunda]);
  assert.equal(datos.numeroFactura, "FAC-1");
  assert.equal(datos.lineas.length, 2);
  assert.equal(datos.lineas[0].imputacionPresupuesto.distribucion[0].idPartidaPresupuesto, "9007199254740993");
  assert.equal(datos.lineas[1].imputacionPresupuesto, null);
  assert.equal(totalDocumentoCompra([primera, segunda]), "0.3003");
  assert.equal(totalDocumentoCompra([{ precioTotal: "" }]), null);
  assert.throws(() => prepararDocumentoCompra(cabecera, []), /entre 1 y 100/);
  assert.throws(() => prepararDocumentoCompra(cabecera, [{ ...segunda, cantidadComprada: "2.5" }]), /Renglón 1/);
  assert.throws(() => prepararDocumentoCompra({ ...cabecera, moneda: "USD" }, [primera, segunda]), /distribución presupuestaria/);
});

test("el nuevo monto aprobado calcula una diferencia exacta y protege reservas y gastos", () => {
  const partida = { aprobado: "500.0000", comprometido: "100", ejecutado: "80" };
  const aumento = vistaPreviaMonto(partida, "525,0001");
  assert.equal(aumento.ajuste, "25.0001");
  assert.equal(aumento.disponible, "345.0001");
  assert.equal(aumento.montoAprobadoEsperado, "500.0000");
  assert.equal(aumento.puedeGuardar, true);
  const reduccion = vistaPreviaMonto(partida, "200");
  assert.equal(reduccion.ajuste, "-300.0000");
  assert.equal(reduccion.disponible, "20.0000");
  assert.equal(reduccion.puedeGuardar, true);
  assert.equal(vistaPreviaMonto(partida, "179.9999").puedeGuardar, false);
  assert.equal(vistaPreviaMonto(partida, "500").puedeGuardar, false);
  assert.equal(vistaPreviaMonto({ aprobado: "500", comprometido: 0, ejecutado: 0 }, "0").puedeGuardar, true);
  assert.equal(vistaPreviaMonto({ aprobado: "50", comprometido: 0, ejecutado: "100" }, "60").mantieneExceso, true);
  assert.equal(vistaPreviaMonto({ aprobado: "50", comprometido: 0, ejecutado: "100" }, "60").puedeGuardar, true);
  assert.equal(vistaPreviaMonto({ aprobado: "99999999999999.9999", comprometido: 0, ejecutado: 0 }, "99999999999999.9998").ajuste, "-0.0001");
  assert.throws(() => vistaPreviaMonto(partida, "-1"));
  assert.throws(() => vistaPreviaMonto(partida, "500.00001"));
});

test("prepara datos y partidas de un borrador sin exigir otro motivo ni aceptar rubros repetidos", () => {
  const datos = { nombre: " Ciclo ", fechaInicio: "2026-04-01", fechaFin: "2026-04-30", moneda: "CRC", idFinca: "" };
  const partidas = [{ idRubroPresupuesto: "1", monto: "500,0001" }];
  const cuerpo = prepararBorradorPresupuesto(datos, partidas);
  assert.equal(cuerpo.nombre, "Ciclo");
  assert.equal(cuerpo.idFinca, null);
  assert.equal(cuerpo.partidas[0].monto, "500.0001");
  assert.equal(Object.hasOwn(cuerpo, "motivo"), false);
  assert.throws(() => prepararBorradorPresupuesto(datos, [...partidas, { idRubroPresupuesto: 1, monto: "100" }]), /una sola partida/);
  assert.throws(() => prepararBorradorPresupuesto({ ...datos, fechaFin: "2026-03-01" }, partidas), /período/);
  assert.throws(() => prepararBorradorPresupuesto(datos, []), /partidas/);
  assert.throws(() => prepararBorradorPresupuesto(datos, [{ idRubroPresupuesto: 1, monto: "0" }]));
});
