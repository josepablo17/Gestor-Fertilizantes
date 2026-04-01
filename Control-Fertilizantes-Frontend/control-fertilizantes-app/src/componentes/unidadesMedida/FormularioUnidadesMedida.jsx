import { useEffect, useState } from "react";
import { actualizarUnidadMedida, insertarUnidadMedida } from "../../api/unidadMedidaApi";
import { mostrarError, mostrarExito } from "../../utils/alertas";

const unidadMedidaInicial = {
    idUnidadMedida: 0,
    codigo: "",
    nombre: "",
    tipoBase: "",
    factorConversion: 1,
    esUnidadBase: true
};

function FormularioUnidadMedida({ onUnidadMedidaGuardada, unidadMedidaEditar, onCancelarEdicion }) {
    const [unidadMedida, setUnidadMedida] = useState(unidadMedidaInicial);
    const estaEditando = unidadMedidaEditar !== null;

    useEffect(() => {
        if (unidadMedidaEditar) {
            setUnidadMedida({
                idUnidadMedida: unidadMedidaEditar.idUnidadMedida || 0,
                codigo: unidadMedidaEditar.codigo || "",
                nombre: unidadMedidaEditar.nombre || "",
                tipoBase: unidadMedidaEditar.tipoBase || "",
                factorConversion: unidadMedidaEditar.factorConversion ?? 1,
                esUnidadBase: unidadMedidaEditar.esUnidadBase ?? true
            });
        } else {
            setUnidadMedida(unidadMedidaInicial);
        }
    }, [unidadMedidaEditar]);

    const manejarCambio = (e) => {
        const { name, value, type, checked } = e.target;

        setUnidadMedida((prev) => ({
            ...prev,
            [name]: type === "checkbox"
                ? checked
                : name === "factorConversion"
                    ? value === ""
                        ? ""
                        : Number(value)
                    : value
        }));
    };

    const manejarSubmit = async (e) => {
        e.preventDefault();

        try {
            if (estaEditando) {
                await actualizarUnidadMedida(unidadMedida);
                await mostrarExito(
                    "Unidad de medida actualizada",
                    "La unidad de medida se actualizó correctamente."
                );
            } else {
                await insertarUnidadMedida(unidadMedida);
                await mostrarExito(
                    "Unidad de medida guardada",
                    "La unidad de medida se registró correctamente."
                );
            }

            setUnidadMedida(unidadMedidaInicial);

            if (onUnidadMedidaGuardada) {
                onUnidadMedidaGuardada();
            }
        } catch (error) {
            await mostrarError(
                "Ocurrió un error",
                estaEditando
                    ? "No se pudo actualizar la unidad de medida."
                    : "No se pudo registrar la unidad de medida."
            );
            console.error(error);
        }
    };

    const manejarCancelar = () => {
        setUnidadMedida(unidadMedidaInicial);

        if (onCancelarEdicion) {
            onCancelarEdicion();
        }
    };

    return (
        <div className="card-modulo">
            <div className="titulo-seccion">
                <h2>{estaEditando ? "Editar Unidad de Medida" : "Agregar Unidad de Medida"}</h2>
                <p>
                    {estaEditando
                        ? "Modifica la información de la unidad de medida seleccionada."
                        : "Completa los campos para registrar una nueva unidad de medida."}
                </p>
            </div>

            <form className="formulario-modulo" onSubmit={manejarSubmit}>
                <div className="campo-formulario">
                    <label htmlFor="codigo">Código</label>
                    <input
                        id="codigo"
                        type="text"
                        name="codigo"
                        placeholder="Ejemplo: KG"
                        value={unidadMedida.codigo}
                        onChange={manejarCambio}
                        required
                    />
                </div>

                <div className="campo-formulario">
                    <label htmlFor="nombre">Nombre</label>
                    <input
                        id="nombre"
                        type="text"
                        name="nombre"
                        placeholder="Ejemplo: Kilogramo"
                        value={unidadMedida.nombre}
                        onChange={manejarCambio}
                        required
                    />
                </div>

                <div className="campo-formulario">
                    <label htmlFor="tipoBase">Tipo base</label>
                    <input
                        id="tipoBase"
                        type="text"
                        name="tipoBase"
                        placeholder="Ejemplo: Peso"
                        value={unidadMedida.tipoBase}
                        onChange={manejarCambio}
                        required
                    />
                </div>

                <div className="campo-formulario">
                    <label htmlFor="factorConversion">Factor de conversión</label>
                    <input
                        id="factorConversion"
                        type="number"
                        name="factorConversion"
                        placeholder="Ejemplo: 1"
                        value={unidadMedida.factorConversion}
                        onChange={manejarCambio}
                        step="0.0001"
                        min="0"
                        required
                    />
                </div>

                <div className="campo-formulario campo-formulario-completo">
                    <div className="campo-checkbox">
                        <label htmlFor="esUnidadBase" className="label-checkbox">
                            <input
                                id="esUnidadBase"
                                type="checkbox"
                                name="esUnidadBase"
                                checked={unidadMedida.esUnidadBase}
                                onChange={manejarCambio}
                            />
                            Es unidad base
                        </label>
                    </div>
                </div>

                <div className="acciones-formulario">
                    {estaEditando && (
                        <button
                            type="button"
                            className="boton-base boton-secundario"
                            onClick={manejarCancelar}
                        >
                            Cancelar
                        </button>
                    )}

                    <button type="submit" className="boton-base boton-primario">
                        {estaEditando ? "Actualizar unidad de medida" : "Guardar unidad de medida"}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default FormularioUnidadMedida;