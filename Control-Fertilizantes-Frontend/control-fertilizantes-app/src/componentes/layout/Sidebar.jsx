import { NavLink } from "react-router-dom";
import {
  HiCube,
  HiBuildingStorefront,
  HiArchiveBox,
  HiSquares2X2,
  HiShoppingCart,
  HiChartBar,
  HiScale
} from "react-icons/hi2";
import "../../estilos/sidebar.css";

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar__superior">
        <div className="sidebar__marca">
          <div className="sidebar__logo">
            <span>FC</span>
          </div>

          <div className="sidebar__marca-texto">
            <h2>FertiControl</h2>
            <span>Sistema de gestión</span>
          </div>
        </div>

        <div className="sidebar__seccion">
          <span className="sidebar__seccion-titulo">Módulos</span>

          <nav className="sidebar__nav">
            <NavLink
              to="/productos"
              className={({ isActive }) =>
                isActive ? "sidebar__link activo" : "sidebar__link"
              }
            >
              <span className="sidebar__icono">
                <HiCube />
              </span>
              <span className="sidebar__texto-link">Productos</span>
            </NavLink>

            <NavLink
              to="/proveedores"
              className={({ isActive }) =>
                isActive ? "sidebar__link activo" : "sidebar__link"
              }
            >
              <span className="sidebar__icono">
                <HiBuildingStorefront />
              </span>
              <span className="sidebar__texto-link">Proveedores</span>
            </NavLink>

            <NavLink
              to="/unidadesMedida"
              className={({ isActive }) =>
                isActive ? "sidebar__link activo" : "sidebar__link"
              }
            >
              <span className="sidebar__icono">
                <HiArchiveBox />
              </span>
              <span className="sidebar__texto-link">Unidades de medida</span>
            </NavLink>

            <NavLink
              to="/presentacionProductos"
              className={({ isActive }) =>
                isActive ? "sidebar__link activo" : "sidebar__link"
              }
            >
              <span className="sidebar__icono">
                <HiSquares2X2 />
              </span>
              <span className="sidebar__texto-link">Presentaciones producto</span>
            </NavLink>

            <NavLink
              to="/compras"
              className={({ isActive }) =>
                isActive ? "sidebar__link activo" : "sidebar__link"
              }
            >
              <span className="sidebar__icono">
                <HiShoppingCart />
              </span>
              <span className="sidebar__texto-link">Compras</span>
            </NavLink>

            <NavLink
              to="/compras-inteligencia"
              className={({ isActive }) =>
                isActive ? "sidebar__link activo" : "sidebar__link"
              }
            >
              <span className="sidebar__icono">
                <HiChartBar />
              </span>
              <span className="sidebar__texto-link">Compras inteligentes</span>
            </NavLink>

            <NavLink
              to="/comparador-proveedores"
              className={({ isActive }) =>
                isActive ? "sidebar__link activo" : "sidebar__link"
              }
            >
              <span className="sidebar__icono">
                <HiScale />
              </span>
              <span className="sidebar__texto-link">Comparador proveedores</span>
            </NavLink>
          </nav>
        </div>
      </div>

      <div className="sidebar__inferior">
        <div className="sidebar__resumen">
          <span className="sidebar__resumen-label">Panel administrativo</span>
          <p>
            Gestiona productos, proveedores, unidades de medida, presentaciones y compras de forma centralizada.
          </p>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;