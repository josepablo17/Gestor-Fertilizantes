function TablaProveedores({ proveedores, onEditar, onDesactivar }) {
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
                                <div className="table__actions">
                                    <button
                                        type="button"
                                        className="btn btn--secondary btn--sm"
                                        onClick={() => onEditar(proveedor)}
                                    >
                                        Editar
                                    </button>

                                    {proveedor.activo && (
                                        <button
                                            type="button"
                                            className="btn btn--danger btn--sm"
                                            onClick={() => onDesactivar(proveedor)}
                                        >
                                            Desactivar
                                        </button>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default TablaProveedores;