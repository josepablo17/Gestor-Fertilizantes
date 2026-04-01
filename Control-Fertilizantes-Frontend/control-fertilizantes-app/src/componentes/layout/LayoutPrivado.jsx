import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import "../../estilos/sidebar.css";

function LayoutPrivado() {
  return (
    <div className="layout">
      <Sidebar />

      <main className="layout__contenido">
        <Outlet />
      </main>
    </div>
  );
}

export default LayoutPrivado;