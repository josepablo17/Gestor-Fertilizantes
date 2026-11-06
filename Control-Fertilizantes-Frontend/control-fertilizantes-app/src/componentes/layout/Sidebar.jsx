import { createElement, useState } from "react";
import { HiOutlineMagnifyingGlass } from "react-icons/hi2";
import { Link } from "react-router-dom";
import { gruposNavegacion } from "./navegacion.js";

const sinAcentos = (texto) => texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

export default function Sidebar({ seccion, onNavegar }) {
  const [busqueda, setBusqueda] = useState("");
  const termino = sinAcentos(busqueda.trim());
  const grupos = gruposNavegacion.map(({ titulo, enlaces }) => ({
    titulo,
    enlaces: enlaces.filter(({ texto }) => sinAcentos(texto).includes(termino)),
  })).filter(({ enlaces }) => enlaces.length > 0);

  return (
    <aside className="sidebar" id="menu-principal">
      <Link className="sidebar__brand" to="/solicitudes" onClick={onNavegar}>
        <span className="sidebar__brand-mark" aria-hidden="true">FC</span>
        <span>FertiControl</span>
      </Link>
      <label className="sidebar__search">
        <HiOutlineMagnifyingGlass aria-hidden="true" />
        <input type="search" aria-label="Buscar módulo" placeholder="Buscar módulo…"
          value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
      </label>
      <nav className="sidebar__nav" aria-label="Navegación principal">
        {grupos.map(({ titulo, enlaces }) => (
          <div className="sidebar__section" key={titulo}>
            <div className="sidebar__section-title">{titulo}</div>
            {enlaces.map(({ ruta, texto, icono }) => (
              <Link key={ruta} to={ruta} className="sidebar__link"
                aria-current={seccion === ruta ? "page" : undefined} onClick={onNavegar}>
                {createElement(icono, { className: "sidebar__icon", "aria-hidden": true })}
                <span>{texto}</span>
              </Link>
            ))}
          </div>
        ))}
        {grupos.length === 0 && <p className="sidebar__empty" role="status">No se encontraron módulos.</p>}
      </nav>
    </aside>
  );
}
