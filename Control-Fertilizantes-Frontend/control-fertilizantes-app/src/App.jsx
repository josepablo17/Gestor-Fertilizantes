import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LayoutPrivado from "./componentes/layout/LayoutPrivado";
import Productos from "./paginas/Productos";
import ProductoFormulario from "./paginas/ProductoFormulario";
import Proveedores from "./paginas/Proveedores";
import ProveedorFormulario from "./paginas/ProveedorFormulario";
import UnidadesMedida from "./paginas/UnidadesMedida";
import UnidadMedidaFormulario from "./paginas/UnidadesMedidaFormulario";
import PresentacionesProducto from "./paginas/PresentacionProducto";
import PresentacionesProductoFormulario from "./paginas/PresentacionProductoFormulario";
import Compras from "./paginas/Compras";
import ComprasFormulario from "./paginas/ComprasFormulario"
import CompraInteligencia from "./paginas/CompraInteligencia";
import ComparadorProveedor from "./paginas/ComparadorProveedor";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LayoutPrivado />}>
          <Route index element={<Navigate to="/productos" />} />
          <Route path="productos" element={<Productos />} />
          <Route path="productos/nuevo" element={<ProductoFormulario />} />
          <Route path="productos/editar/:id" element={<ProductoFormulario />} />
          <Route path="proveedores" element={<Proveedores />} />
          <Route path="proveedores/nuevo" element={<ProveedorFormulario/>}/>
          <Route path="proveedores/editar/:id" element={<ProveedorFormulario/>}/>
          <Route path="unidadesMedida" element={<UnidadesMedida/>}/>
          <Route path="unidadesMedida/nuevo" element={<UnidadMedidaFormulario/>}/>
          <Route path="unidadesMedida/editar/:id" element={<UnidadMedidaFormulario/>}/>
          <Route path="presentacionProductos" element={<PresentacionesProducto/>}/>
          <Route path="presentacionProductos/nuevo" element={<PresentacionesProductoFormulario/>}/>
          <Route path="presentacionProductos/editar/:id" element={<PresentacionesProductoFormulario/>}/>
          <Route path="compras" element={<Compras/>}/>
          <Route path="compras/nuevo" element={<ComprasFormulario/>}/>
          <Route path="compras/editar/:id" element={<ComprasFormulario/>}/>
          <Route path="/compras-inteligencia" element={<CompraInteligencia/>} />
          <Route path="/comparador-proveedores" element={<ComparadorProveedor/>}/>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;