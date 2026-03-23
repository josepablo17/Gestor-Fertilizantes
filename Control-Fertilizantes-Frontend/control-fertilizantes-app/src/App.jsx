import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Productos from "./paginas/Productos";
import ProductoFormulario from "./paginas/ProductoFormulario";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/productos" />} />
        <Route path="/productos" element={<Productos />} />
        <Route path="/productos/nuevo" element={<ProductoFormulario />} />
        <Route path="/productos/editar/:id" element={<ProductoFormulario />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;