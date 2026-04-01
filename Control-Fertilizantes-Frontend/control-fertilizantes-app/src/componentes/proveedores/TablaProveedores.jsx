function TablaProveedores({ proveedores, onEditar, onDesactivar }) {
    return (
        <div className="tabla-responsive">
            <table className="tabla-modulo">
                <thead>
                    <tr>
                        <th>Proveedor</th>
                        <th>Contacto</th>
                        <th>Telefono</th>
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
                                <div className="celda-principal">
                                    <span className="texto-principal">
                                        {proveedor.nombre || "Sin nombre"}
                                    </span>
                                </div>
                            </td>

                            <td>
                                <span className="texto-secundario">
                                    {proveedor.contacto || "Sin contacto"}
                                </span>
                            </td>

                            <td>
                                <span className="texto-secundario">
                                    {proveedor.telefono || "Sin teléfono"}
                                </span>
                            </td>

                            <td>
                                <span className="texto-secundario">
                                    {proveedor.correo || "Sin correo"}
                                </span>
                            </td>

                            <td>
                                <span
                                    className={
                                        proveedor.activo
                                            ? "estado-badge estado-activo"
                                            : "estado-badge estado-inactivo"
                                    }
                                >
                                    <span className="punto-estado"></span>
                                    {proveedor.activo ? "Activo" : "Inactivo"}
                                </span>
                            </td>

                            <td>
                                <span
                                    className={
                                        proveedor.esProveedorAutorizado
                                            ? "estado-badge estado-activo"
                                            : "estado-badge estado-inactivo"
                                    }
                                >
                                    <span className="punto-estado"></span>
                                    {proveedor.esProveedorAutorizado ? "Sí" : "No"}
                                </span>
                            </td>

                            <td>
                                <div className="acciones-tabla">
                                    <button
                                        className="boton-base boton-tabla boton-editar"
                                        onClick={() => onEditar(proveedor)}
                                        type="button"
                                    >
                                        Editar
                                    </button>

                                    {proveedor.activo && (
                                        <button
                                            className="boton-base boton-tabla boton-eliminar"
                                            onClick={() => onDesactivar(proveedor)}
                                            type="button"
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