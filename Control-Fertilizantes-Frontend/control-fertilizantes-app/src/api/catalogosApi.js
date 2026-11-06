import { formatearNumero } from "../utils/numeros.js";
import { consulta, solicitar } from "./cliente.js";

const rutas = {
  productos: ["Producto", "ListarProducto", "idProducto"],
  productosBase: ["ProductoBase", "ListarProductoBase", "idProductoBase"],
  marcas: ["Marca", "ListarMarca", "idMarca"],
  proveedores: ["Proveedor", "ListarProveedor", "idProveedor"],
  presentaciones: ["PresentacionProducto", "ListarPresentacionesProducto", "idPresentacionProducto"],
  unidades: ["UnidadMedida", "ListarUnidadMedida", "idUnidadMedida"],
};

export const campoIdCatalogo = (tipo) => rutas[tipo][2];
export function listarCatalogo(tipo, filtros, signal) {
  const [modulo, listar] = rutas[tipo];
  return solicitar(`/${modulo}/${listar}${consulta(filtros)}`, { signal });
}

export function obtenerCatalogo(tipo, id, signal) {
  const [modulo] = rutas[tipo];
  return solicitar(`/${modulo}/Obtener${modulo}/${id}`, { signal });
}

export function guardarCatalogo(tipo, id, datos) {
  const [modulo, , campoId] = rutas[tipo];
  return id
    ? solicitar(`/${modulo}/Actualizar${modulo}`, { metodo: "PUT", datos: { ...datos, [campoId]: Number(id) } })
    : solicitar(`/${modulo}/Insertar${modulo}`, { metodo: "POST", datos });
}

export function cambiarActivoCatalogo(tipo, id, activo) {
  const [modulo] = rutas[tipo];
  return solicitar(`/${modulo}/CambiarActivo/${id}`, { metodo: "PUT", datos: { activo } });
}

export const productosElegibles = (signal) => solicitar("/PresentacionProducto/ListarProductosDropdown", { signal });
export const unidadesElegibles = (signal) => solicitar("/PresentacionProducto/ListarUnidadesMedidaDropdown", { signal });

export function etiquetaPresentacion(presentacion) {
  return `${presentacion.descripcion} · ${formatearNumero(presentacion.cantidad)} ${presentacion.codigoUnidadMedida ?? ""}`;
}
