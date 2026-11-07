import {
  HiOutlineArchiveBox, HiOutlineBuildingStorefront, HiOutlineClipboardDocumentList,
  HiOutlineCube, HiOutlineScale, HiOutlineShoppingCart, HiOutlineSquares2X2, HiOutlineTag, HiOutlineWallet
} from "react-icons/hi2";

export const gruposNavegacion = [
  { titulo: "Operación", enlaces: [
    { ruta: "/solicitudes", texto: "Solicitudes de cotización", icono: HiOutlineClipboardDocumentList },
    { ruta: "/compras", texto: "Compras", icono: HiOutlineShoppingCart },
    { ruta: "/presupuestos", texto: "Presupuestos", icono: HiOutlineWallet },
  ] },
  { titulo: "Catálogos", enlaces: [
    { ruta: "/productos", texto: "Productos", icono: HiOutlineCube },
    { ruta: "/productos-base", texto: "Productos base", icono: HiOutlineSquares2X2 },
    { ruta: "/marcas", texto: "Marcas", icono: HiOutlineTag },
    { ruta: "/presentacionProductos", texto: "Presentaciones producto", icono: HiOutlineArchiveBox },
    { ruta: "/unidadesMedida", texto: "Unidades de medida", icono: HiOutlineScale },
    { ruta: "/proveedores", texto: "Proveedores", icono: HiOutlineBuildingStorefront },
  ] },
];

export function seccionNavegacion(ruta) {
  if (ruta.startsWith("/respuestas/") || ruta.startsWith("/proformas-proveedor/")) return "/solicitudes";
  return gruposNavegacion.flatMap(({ enlaces }) => enlaces)
    .find((enlace) => ruta === enlace.ruta || ruta.startsWith(`${enlace.ruta}/`))?.ruta;
}
