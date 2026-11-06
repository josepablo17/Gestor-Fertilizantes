import { decimalOpcional, enteroOpcional, textoOpcional } from "./datosApi.js";
import { numeroEditable } from "./numeros.js";

const campo = (nombre, etiqueta, maxLength, otros) => ({ nombre, etiqueta, maxLength, ...otros });
const nombre = campo("nombre", "Nombre", 150, { required: true });
const check = (nombre, etiqueta) => ({ nombre, etiqueta, casilla: true });
const seleccion = (nombre, etiqueta, catalogo, required = false) => ({ nombre, etiqueta, catalogo, required });
const dec = (nombre, etiqueta, escala) => ({ nombre, etiqueta, escala, required: true });

export const formulariosCatalogo = {
  productos: { titulo: "Producto", ruta: "/productos", campos: [
    nombre, seleccion("idProductoBase", "Producto base", "productosBase", true), seleccion("idMarca", "Marca", "marcas"),
    campo("codigoInterno", "Código interno (opcional)", 40), campo("categoria", "Categoría", 100),
    campo("descripcion", "Descripción", 250, { textoLargo: true }),
  ] },
  productosBase: { titulo: "Producto base", ruta: "/productos-base", campos: [
    campo("codigo", "Código", 40, { required: true }), nombre, campo("formulaDeclarada", "Fórmula declarada", 100),
    campo("descripcion", "Descripción", 500, { textoLargo: true }),
    check("comparabilidadRevisada", "Confirmo que se revisó la comparabilidad de este grupo"),
  ] },
  marcas: { titulo: "Marca", ruta: "/marcas", campos: [nombre] },
  proveedores: { titulo: "Proveedor", ruta: "/proveedores", campos: [
    nombre, campo("contacto", "Contacto", 150), campo("telefono", "Teléfono", 50, { type: "tel" }),
    campo("correo", "Correo", 150, { type: "email" }), campo("direccion", "Dirección", 250), campo("provincia", "Provincia", 100),
    campo("canton", "Cantón", 100), campo("distrito", "Distrito", 100), campo("tipoIdentificacion", "Tipo de identificación", 30),
    campo("identificacionFiscal", "Identificación fiscal", 50), campo("paisIdentificacion", "País de identificación (ej. CR)", 2),
    campo("fuenteExterna", "Fuente externa", 100), campo("idExterno", "Identificador externo", 100),
    campo("fechaUltimaSincronizacion", "Última sincronización (fecha y hora ISO)", 40),
    check("esProveedorAutorizado", "Proveedor autorizado"),
  ] },
  presentaciones: { titulo: "Presentación", ruta: "/presentacionProductos", campos: [
    seleccion("idProducto", "Producto", "productos", true),
    campo("descripcion", "Descripción de la presentación", 150, { required: true }),
    dec("cantidad", "Contenido por empaque", 4),
    seleccion("idUnidadMedida", "Unidad de medida", "unidades", true),
  ] },
  unidades: { titulo: "Unidad de medida", ruta: "/unidadesMedida", campos: [
    campo("codigo", "Código", 20, { required: true }), campo("nombre", "Nombre", 50, { required: true }),
    { nombre: "tipoBase", etiqueta: "Dimensión", opciones: ["PESO", "VOLUMEN", "UNIDAD"], required: true },
    dec("factorConversion", "Factor de conversión", 6), check("esUnidadBase", "Unidad base"),
  ] },
};

export function valoresCatalogo(tipo, original) {
  return Object.fromEntries(formulariosCatalogo[tipo].campos.map(({ nombre, casilla, escala }) =>
    [nombre, casilla ? Boolean(original?.[nombre]) : escala ? numeroEditable(original?.[nombre]) : original?.[nombre] ?? ""]));
}

export function cuerpoCatalogo(tipo, valores) {
  return Object.fromEntries(formulariosCatalogo[tipo].campos.map(({ nombre, casilla, catalogo, escala }) => {
    const valor = valores[nombre];
    return [nombre, casilla ? Boolean(valor)
      : catalogo ? enteroOpcional(valor)
      : escala ? decimalOpcional(valor, escala, true)
      : textoOpcional(nombre === "paisIdentificacion" ? valor.toUpperCase() : valor)];
  }));
}
