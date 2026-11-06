import AccionesRegistro from "../comunes/AccionesRegistro.jsx";

function TablaProveedores({ proveedores, onDesactivar, ocupado }) {
    return (
        <div className="table-wrapper">
            <table className="table">
                <thead>
                    <tr>
                        <th>Proveedor</th>
                        <th>Contacto</th>
                        <th>Teléfono</th>
                        <th>Correo</th>
                        <th>Estado</th>
                        <th>Autorizado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>

                <tbody>
                    {proveedores.map((proveedor) => (
                        <tr key={proveedor.idProveedor}>
                            <td>
                                <span className="table__cell-strong">
                                    {proveedor.nombre || "Sin nombre"}
                                </span>
                            </td>

                            <td>
                                <span className="table__cell-muted">
                                    {proveedor.contacto || "Sin contacto"}
                                </span>
                            </td>

                            <td>
                                <span className="table__cell-muted">
                                    {proveedor.telefono || "Sin teléfono"}
                                </span>
                            </td>

                            <td>
                                <span className="table__cell-muted">
                                    {proveedor.correo || "Sin correo"}
                                </span>
                            </td>

                            <td>
                                <span
                                    className={
                                        proveedor.activo
                                            ? "badge badge--success"
                                            : "badge badge--neutral"
                                    }
                                >
                                    {proveedor.activo ? "Activo" : "Inactivo"}
                                </span>
                            </td>

                            <td>
                                <span
                                    className={
                                        proveedor.esProveedorAutorizado
                                            ? "badge badge--success"
                                            : "badge badge--neutral"
                                    }
                                >
                                    {proveedor.esProveedorAutorizado ? "Sí" : "No"}
                                </span>
                            </td>

                            <td>
                                <AccionesRegistro rutaEdicion={`/proveedores/editar/${proveedor.idProveedor}`}
                                  onCambiarEstado={proveedor.activo ? () => onDesactivar(proveedor) : undefined}
                                  ocupado={ocupado} />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default TablaProveedores;