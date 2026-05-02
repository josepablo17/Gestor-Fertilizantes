import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import "../../estilos/layout/app-layout.css";

function LayoutPrivado() {
  return (
    <div className="app-layout">
      <Sidebar />

      <main className="app-layout__main">
        <div className="app-layout__content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default LayoutPrivado;