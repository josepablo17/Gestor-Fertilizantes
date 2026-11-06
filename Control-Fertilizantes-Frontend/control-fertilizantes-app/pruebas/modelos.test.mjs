import assert from "node:assert/strict";
import test from "node:test";
import { decimalOpcional, enteroOpcional, idRuta, leerJson } from "../src/utils/datosApi.js";
import { formatearCantidadComprada, formatearNumero, numeroEditable } from "../src/utils/numeros.js";
import { cuerpoCatalogo, valoresCatalogo } from "../src/utils/formulariosCatalogo.js";
import { cuerpoSolicitud, valoresSolicitud } from "../src/modulos/cotizaciones/utils/formularioSolicitud.js";
import { cuerpoCabecera, cuerpoLinea, valoresCabecera, valoresLinea } from "../src/modulos/cotizaciones/utils/formularioRespuesta.js";

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
