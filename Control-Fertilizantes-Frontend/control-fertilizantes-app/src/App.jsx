import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import LayoutPrivado from "./componentes/layout/LayoutPrivado";
import Productos from "./paginas/Productos";
import Proveedores from "./paginas/Proveedores";
import UnidadesMedida from "./paginas/UnidadesMedida";
import PresentacionesProducto from "./paginas/PresentacionProducto";
import Compras from "./paginas/Compras";
import ComprasFormulario from "./paginas/ComprasFormulario"
import CatalogoFormulario from "./paginas/CatalogoFormulario";
import CatalogoIdentidades from "./paginas/CatalogoIdentidades";
import Solicitudes from "./modulos/cotizaciones/paginas/Solicitudes";
import SolicitudFormulario from "./modulos/cotizaciones/paginas/SolicitudFormulario";
import SolicitudDetalle from "./modulos/cotizaciones/paginas/SolicitudDetalle";
import RespuestaCotizacion from "./modulos/cotizaciones/paginas/RespuestaCotizacion";
import ComparacionSolicitud from "./modulos/cotizaciones/paginas/ComparacionSolicitud";

const CompraInteligencia = lazy(() => import("./paginas/CompraInteligencia"));
const ComparadorProveedor = lazy(() => import("./paginas/ComparadorProveedor"));

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LayoutPrivado />}>
          <Route index element={<Navigate to="/solicitudes" replace />} />
          <Route path="solicitudes" element={<Solicitudes />} />
          <Route path="solicitudes/nueva" element={<SolicitudFormulario />} />
          <Route path="solicitudes/:id" element={<SolicitudDetalle />} />
          <Route path="solicitudes/:id/editar" element={<SolicitudFormulario />} />
          <Route path="solicitudes/:id/comparacion" element={<ComparacionSolicitud />} />
          <Route path="respuestas/:id" element={<RespuestaCotizacion />} />
          <Route path="productos-base" element={<CatalogoIdentidades tipo="productosBase" />} />
          <Route path="productos-base/nuevo" element={<CatalogoFormulario tipo="productosBase" />} />
          <Route path="productos-base/editar/:id" element={<CatalogoFormulario tipo="productosBase" />} />
          <Route path="marcas" element={<CatalogoIdentidades tipo="marcas" />} />
          <Route path="marcas/nuevo" element={<CatalogoFormulario tipo="marcas" />} />
          <Route path="marcas/editar/:id" element={<CatalogoFormulario tipo="marcas" />} />
          <Route path="productos" element={<Productos />} />
          <Route path="productos/nuevo" element={<CatalogoFormulario tipo="productos" />} />
          <Route path="productos/editar/:id" element={<CatalogoFormulario tipo="productos" />} />
          <Route path="proveedores" element={<Proveedores />} />
          <Route path="proveedores/nuevo" element={<CatalogoFormulario tipo="proveedores" />} />
          <Route path="proveedores/editar/:id" element={<CatalogoFormulario tipo="proveedores" />} />
          <Route path="unidadesMedida" element={<UnidadesMedida/>}/>
          <Route path="unidadesMedida/nuevo" element={<CatalogoFormulario tipo="unidades" />} />
          <Route path="unidadesMedida/editar/:id" element={<CatalogoFormulario tipo="unidades" />} />
          <Route path="presentacionProductos" element={<PresentacionesProducto/>}/>
          <Route path="presentacionProductos/nuevo" element={<CatalogoFormulario tipo="presentaciones" />} />
          <Route path="presentacionProductos/editar/:id" element={<CatalogoFormulario tipo="presentaciones" />} />
          <Route path="compras" element={<Compras/>}/>
          <Route path="compras/nuevo" element={<ComprasFormulario/>}/>
          <Route path="compras/editar/:id" element={<ComprasFormulario/>}/>
          <Route path="/compras-inteligencia" element={<Suspense fallback={<p>Cargando…</p>}><CompraInteligencia /></Suspense>} />
          <Route path="/comparador-proveedores" element={<Suspense fallback={<p>Cargando…</p>}><ComparadorProveedor /></Suspense>} />
          <Route path="compra-automatica" element={<Navigate to="/solicitudes" replace />} />
          <Route path="proformas-proveedor" element={<Navigate to="/solicitudes" replace />} />
          <Route path="proformas-proveedor/:idProformaProveedor" element={<RespuestaCotizacion />} />
          <Route path="comparar-proformas" element={<Navigate to="/solicitudes" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
