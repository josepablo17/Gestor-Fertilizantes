import { NavLink } from "react-router-dom";
import {
  HiCube,
  HiBuildingStorefront,
  HiArchiveBox,
  HiSquares2X2,
  HiShoppingCart,
  HiChartBar,
  HiScale,
  HiDocumentArrowUp,
  HiClipboardDocumentList
} from "react-icons/hi2";
import "../../estilos/layout/sidebar.css";

const modulosNavegacion = [
  {
    to: "/productos",
    label: "Productos",
    icon: HiCube
  },
  {
    to: "/proveedores",
    label: "Proveedores",
    icon: HiBuildingStorefront
  },
  {
    to: "/unidadesMedida",
    label: "Unidades de medida",
    icon: HiArchiveBox
  },
  {
    to: "/presentacionProductos",
    label: "Presentaciones producto",
    icon: HiSquares2X2
  },
  {
    to: "/compras",
    label: "Compras",
    icon: HiShoppingCart
  },
  {
    to: "/compras-inteligencia",
    label: "Compras inteligentes",
    icon: HiChartBar
  },
  {
    to: "/comparador-proveedores",
    label: "Comparador proveedores",
    icon: HiScale
  },
  {
  to: "/compra-automatica",
  label: "Compra automática",
  icon: HiDocumentArrowUp
  },
  {
  to: "/proformas-proveedor",
  label: "Proformas proveedor",
  icon: HiClipboardDocumentList
}
];

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <div className="sidebar__brand-mark">
          <span>FC</span>
        </div>

        <div className="sidebar__brand-text">
          <h1 className="sidebar__brand-title">FertiControl</h1>
          <p className="sidebar__brand-subtitle">Sistema de gestión</p>
        </div>
      </div>

      <div className="sidebar__section">
        <span className="sidebar__section-title">Módulos</span>

        <nav className="sidebar__nav" aria-label="Navegación principal">
          {modulosNavegacion.map(({ to, label, icon: Icono }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                isActive ? "sidebar__link activo" : "sidebar__link"
              }
            >
              <span className="sidebar__icon" aria-hidden="true">
                <Icono />
              </span>

              <span className="sidebar__label">{label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="sidebar__footer">
        <div className="sidebar__footer-card">
          <span className="sidebar__footer-title">Panel administrativo</span>
          <p className="sidebar__footer-text">
            Gestiona productos, proveedores, unidades de medida, presentaciones
            y compras desde una sola plataforma.
          </p>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;