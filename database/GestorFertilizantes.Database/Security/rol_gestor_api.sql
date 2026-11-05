CREATE ROLE [rol_gestor_api] AUTHORIZATION [dbo];
GO
-- Solo contratos publicos; sin permisos de tablas, esquema o administracion.
GRANT EXECUTE ON OBJECT::[dbo].[SP_ComparadorProveedor_ObtenerComparativa] TO [rol_gestor_api];
GO
GRANT EXECUTE ON OBJECT::[dbo].[SP_ComparadorProveedor_ObtenerDetalleHistoricoProveedor] TO [rol_gestor_api];
GO
GRANT EXECUTE ON OBJECT::[dbo].[SP_Compra_Actualizar] TO [rol_gestor_api];
GO
GRANT EXECUTE ON OBJECT::[dbo].[SP_Compra_AlertasPorProducto] TO [rol_gestor_api];
GO
GRANT EXECUTE ON OBJECT::[dbo].[SP_Compra_EvaluarCompra] TO [rol_gestor_api];
GO
GRANT EXECUTE ON OBJECT::[dbo].[SP_Compra_HistorialPorProducto] TO [rol_gestor_api];
GO
GRANT EXECUTE ON OBJECT::[dbo].[SP_Compra_HistorialPreciosPorProducto] TO [rol_gestor_api];
GO
GRANT EXECUTE ON OBJECT::[dbo].[SP_Compra_Insertar] TO [rol_gestor_api];
GO
GRANT EXECUTE ON OBJECT::[dbo].[SP_Compra_Listar] TO [rol_gestor_api];
GO
GRANT EXECUTE ON OBJECT::[dbo].[SP_Compra_ObtenerPorId] TO [rol_gestor_api];
GO
GRANT EXECUTE ON OBJECT::[dbo].[SP_Compra_ResumenInteligentePrecios] TO [rol_gestor_api];
GO
GRANT EXECUTE ON OBJECT::[dbo].[SP_Compra_UltimoPrecio] TO [rol_gestor_api];
GO
GRANT EXECUTE ON OBJECT::[dbo].[SP_CompraAutomatica_BuscarEquivalencia] TO [rol_gestor_api];
GO
GRANT EXECUTE ON OBJECT::[dbo].[SP_CompraAutomatica_BuscarPresentacion] TO [rol_gestor_api];
GO
GRANT EXECUTE ON OBJECT::[dbo].[SP_CompraAutomatica_BuscarProducto] TO [rol_gestor_api];
GO
GRANT EXECUTE ON OBJECT::[dbo].[SP_CompraAutomatica_BuscarProveedor] TO [rol_gestor_api];
GO
GRANT EXECUTE ON OBJECT::[dbo].[SP_CompraAutomatica_InsertarCompraDesdeProforma] TO [rol_gestor_api];
GO
GRANT EXECUTE ON OBJECT::[dbo].[SP_CompraAutomatica_InsertarEquivalencia] TO [rol_gestor_api];
GO
GRANT EXECUTE ON OBJECT::[dbo].[SP_PresentacionesProducto_Actualizar] TO [rol_gestor_api];
GO
GRANT EXECUTE ON OBJECT::[dbo].[SP_PresentacionesProducto_Desactivar] TO [rol_gestor_api];
GO
GRANT EXECUTE ON OBJECT::[dbo].[SP_PresentacionesProducto_Insertar] TO [rol_gestor_api];
GO
GRANT EXECUTE ON OBJECT::[dbo].[SP_PresentacionesProducto_Listar] TO [rol_gestor_api];
GO
GRANT EXECUTE ON OBJECT::[dbo].[SP_PresentacionesProducto_ObtenerPorId] TO [rol_gestor_api];
GO
GRANT EXECUTE ON OBJECT::[dbo].[SP_Producto_Actualizar] TO [rol_gestor_api];
GO
GRANT EXECUTE ON OBJECT::[dbo].[SP_Producto_Desactivar] TO [rol_gestor_api];
GO
GRANT EXECUTE ON OBJECT::[dbo].[SP_Producto_Insertar] TO [rol_gestor_api];
GO
GRANT EXECUTE ON OBJECT::[dbo].[SP_Producto_Listar] TO [rol_gestor_api];
GO
GRANT EXECUTE ON OBJECT::[dbo].[SP_Producto_ObtenerPorId] TO [rol_gestor_api];
GO
GRANT EXECUTE ON OBJECT::[dbo].[SP_Productos_ListarParaDropdown] TO [rol_gestor_api];
GO
GRANT EXECUTE ON OBJECT::[dbo].[SP_ProformaProveedor_Insertar] TO [rol_gestor_api];
GO
GRANT EXECUTE ON OBJECT::[dbo].[SP_ProformaProveedor_Listar] TO [rol_gestor_api];
GO
GRANT EXECUTE ON OBJECT::[dbo].[SP_ProformaProveedor_ObtenerPorId] TO [rol_gestor_api];
GO
GRANT EXECUTE ON OBJECT::[dbo].[SP_ProformaProveedorDetalle_Insertar] TO [rol_gestor_api];
GO
GRANT EXECUTE ON OBJECT::[dbo].[SP_ProformaProveedorDetalle_ListarPorProforma] TO [rol_gestor_api];
GO
GRANT EXECUTE ON OBJECT::[dbo].[SP_Proveedor_Actualizar] TO [rol_gestor_api];
GO
GRANT EXECUTE ON OBJECT::[dbo].[SP_Proveedor_Desactivar] TO [rol_gestor_api];
GO
GRANT EXECUTE ON OBJECT::[dbo].[SP_Proveedor_Insertar] TO [rol_gestor_api];
GO
GRANT EXECUTE ON OBJECT::[dbo].[SP_Proveedor_Listar] TO [rol_gestor_api];
GO
GRANT EXECUTE ON OBJECT::[dbo].[SP_Proveedor_ObtenerPorId] TO [rol_gestor_api];
GO
GRANT EXECUTE ON OBJECT::[dbo].[SP_UnidadesMedida_ListarParaDropdown] TO [rol_gestor_api];
GO
GRANT EXECUTE ON OBJECT::[dbo].[SP_UnidadMedida_Actualizar] TO [rol_gestor_api];
GO
GRANT EXECUTE ON OBJECT::[dbo].[SP_UnidadMedida_Desactivar] TO [rol_gestor_api];
GO
GRANT EXECUTE ON OBJECT::[dbo].[SP_UnidadMedida_Insertar] TO [rol_gestor_api];
GO
GRANT EXECUTE ON OBJECT::[dbo].[SP_UnidadMedida_Listar] TO [rol_gestor_api];
GO
GRANT EXECUTE ON OBJECT::[dbo].[SP_UnidadMedida_ObtenerPorId] TO [rol_gestor_api];
GO
GRANT EXECUTE ON OBJECT::[dbo].[usp_Cotizaciones_CompararSolicitud] TO [rol_gestor_api];
GO
GRANT EXECUTE ON OBJECT::[dbo].[usp_Documento_ObtenerPorId] TO [rol_gestor_api];
GO
GRANT EXECUTE ON OBJECT::[dbo].[usp_Documento_Registrar] TO [rol_gestor_api];
GO
GRANT EXECUTE ON OBJECT::[dbo].[usp_Equivalencia_Actualizar] TO [rol_gestor_api];
GO
GRANT EXECUTE ON OBJECT::[dbo].[usp_Equivalencia_CambiarActivo] TO [rol_gestor_api];
GO
GRANT EXECUTE ON OBJECT::[dbo].[usp_Equivalencia_Listar] TO [rol_gestor_api];
GO
GRANT EXECUTE ON OBJECT::[dbo].[usp_Importacion_ListarPorDocumento] TO [rol_gestor_api];
GO
GRANT EXECUTE ON OBJECT::[dbo].[usp_Importacion_Registrar] TO [rol_gestor_api];
GO
GRANT EXECUTE ON OBJECT::[dbo].[usp_Marca_Actualizar] TO [rol_gestor_api];
GO
GRANT EXECUTE ON OBJECT::[dbo].[usp_Marca_CambiarActivo] TO [rol_gestor_api];
GO
GRANT EXECUTE ON OBJECT::[dbo].[usp_Marca_Insertar] TO [rol_gestor_api];
GO
GRANT EXECUTE ON OBJECT::[dbo].[usp_Marca_Listar] TO [rol_gestor_api];
GO
GRANT EXECUTE ON OBJECT::[dbo].[usp_Marca_ObtenerPorId] TO [rol_gestor_api];
GO
GRANT EXECUTE ON OBJECT::[dbo].[usp_Producto_BuscarCandidatos] TO [rol_gestor_api];
GO
GRANT EXECUTE ON OBJECT::[dbo].[usp_ProductoBase_Actualizar] TO [rol_gestor_api];
GO
GRANT EXECUTE ON OBJECT::[dbo].[usp_ProductoBase_CambiarActivo] TO [rol_gestor_api];
GO
GRANT EXECUTE ON OBJECT::[dbo].[usp_ProductoBase_Insertar] TO [rol_gestor_api];
GO
GRANT EXECUTE ON OBJECT::[dbo].[usp_ProductoBase_Listar] TO [rol_gestor_api];
GO
GRANT EXECUTE ON OBJECT::[dbo].[usp_ProductoBase_ObtenerPorId] TO [rol_gestor_api];
GO
GRANT EXECUTE ON OBJECT::[dbo].[usp_Proforma_ActualizarCabecera] TO [rol_gestor_api];
GO
GRANT EXECUTE ON OBJECT::[dbo].[usp_Proforma_ActualizarLinea] TO [rol_gestor_api];
GO
GRANT EXECUTE ON OBJECT::[dbo].[usp_Proforma_AgregarLinea] TO [rol_gestor_api];
GO
GRANT EXECUTE ON OBJECT::[dbo].[usp_Proforma_CancelarBorrador] TO [rol_gestor_api];
GO
GRANT EXECUTE ON OBJECT::[dbo].[usp_Proforma_Conciliar] TO [rol_gestor_api];
GO
GRANT EXECUTE ON OBJECT::[dbo].[usp_Proforma_CrearRevision] TO [rol_gestor_api];
GO
GRANT EXECUTE ON OBJECT::[dbo].[usp_Proforma_GuardarBorrador] TO [rol_gestor_api];
GO
GRANT EXECUTE ON OBJECT::[dbo].[usp_Proforma_HistorialCambios] TO [rol_gestor_api];
GO
GRANT EXECUTE ON OBJECT::[dbo].[usp_Proforma_ObtenerCompleta] TO [rol_gestor_api];
GO
GRANT EXECUTE ON OBJECT::[dbo].[usp_Proforma_RevisarLinea] TO [rol_gestor_api];
GO
GRANT EXECUTE ON OBJECT::[dbo].[usp_Proforma_Validar] TO [rol_gestor_api];
GO
GRANT EXECUTE ON OBJECT::[dbo].[usp_Solicitud_CambiarEstado] TO [rol_gestor_api];
GO
GRANT EXECUTE ON OBJECT::[dbo].[usp_Solicitud_CrearRevision] TO [rol_gestor_api];
GO
GRANT EXECUTE ON OBJECT::[dbo].[usp_Solicitud_Emitir] TO [rol_gestor_api];
GO
GRANT EXECUTE ON OBJECT::[dbo].[usp_Solicitud_GuardarBorrador] TO [rol_gestor_api];
GO
GRANT EXECUTE ON OBJECT::[dbo].[usp_Solicitud_Listar] TO [rol_gestor_api];
GO
GRANT EXECUTE ON OBJECT::[dbo].[usp_Solicitud_ObtenerPorId] TO [rol_gestor_api];
GO
GRANT EXECUTE ON OBJECT::[dbo].[usp_Solicitud_RegistrarEnvio] TO [rol_gestor_api];
GO

GRANT EXECUTE ON OBJECT::dbo.usp_Solicitud_AsignarDocumento TO rol_gestor_api;
GO
