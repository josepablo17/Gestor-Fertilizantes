import { useState } from "react";
import { HiOutlineBars3, HiOutlineChevronRight, HiOutlineXMark } from "react-icons/hi2";
import { Link, Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar.jsx";
import { gruposNavegacion, seccionNavegacion } from "./navegacion.js";

export default function LayoutPrivado() {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const { pathname } = useLocation();
  const seccion = seccionNavegacion(pathname);
  const nombre = gruposNavegacion.flatMap(({ enlaces }) => enlaces).find(({ ruta }) => ruta === seccion)?.texto;

  return (
    <div className="app-layout" data-menu-abierto={menuAbierto}>
      <header className="app-layout__topbar">
        <button type="button" className="btn btn--ghost btn--icon btn--sm app-layout__menu"
          aria-controls="menu-principal" aria-expanded={menuAbierto}
          aria-label={menuAbierto ? "Cerrar menú" : "Abrir menú"}
          onClick={() => setMenuAbierto((abierto) => !abierto)}>
          {menuAbierto ? <HiOutlineXMark aria-hidden="true" /> : <HiOutlineBars3 aria-hidden="true" />}
        </button>
        <nav aria-label="Ubicación actual" className="app-layout__ruta">
          <Link to="/solicitudes" onClick={() => setMenuAbierto(false)}>FertiControl</Link>
          {nombre && <><HiOutlineChevronRight aria-hidden="true" /><span>{nombre}</span></>}
        </nav>
      </header>
      <Sidebar seccion={seccion} onNavegar={() => setMenuAbierto(false)} />
      <main className="app-layout__main">
        <div className="app-layout__content"><Outlet /></div>
      </main>
    </div>
  );
}
