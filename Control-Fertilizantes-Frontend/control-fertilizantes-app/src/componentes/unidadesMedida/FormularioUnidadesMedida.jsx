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
        <form className="form" onSubmit={manejarSubmit}>
            <div className="form__grid">
                <div className="form__group">
                    <label className="label" htmlFor="codigo">Código</label>
                    <input
                        id="codigo"
                        type="text"
                        name="codigo"
                        placeholder="Ejemplo: KG"
                        value={unidadMedida.codigo}
                        onChange={manejarCambio}
                        className="input"
                        required
                    />
                </div>

                <div className="form__group">
                    <label className="label" htmlFor="nombre">Nombre</label>
                    <input
                        id="nombre"
                        type="text"
                        name="nombre"
                        placeholder="Ejemplo: Kilogramo"
                        value={unidadMedida.nombre}
                        onChange={manejarCambio}
                        className="input"
                        required
                    />
                </div>

                <div className="form__group">
                    <label className="label" htmlFor="tipoBase">Tipo base</label>
                    <input
                        id="tipoBase"
                        type="text"
                        name="tipoBase"
                        placeholder="Ejemplo: Peso"
                        value={unidadMedida.tipoBase}
                        onChange={manejarCambio}
                        className="input"
                        required
                    />
                </div>

                <div className="form__group">
                    <label className="label" htmlFor="factorConversion">Factor de conversión</label>
                    <input
                        id="factorConversion"
                        type="number"
                        name="factorConversion"
                        placeholder="Ejemplo: 1"
                        value={unidadMedida.factorConversion}
                        onChange={manejarCambio}
                        className="input"
                        step="0.0001"
                        min="0"
                        required
                    />
                </div>

                <div className="form__group">
                    <label className="label">
                        <input
                            type="checkbox"
                            name="esUnidadBase"
                            checked={unidadMedida.esUnidadBase}
                            onChange={manejarCambio}
                        />
                        {" "}Es unidad base
                    </label>
                </div>
            </div>

            <div className="form__actions">
                {estaEditando && (
                    <button
                        type="button"
                        className="btn btn--secondary btn--md"
                        onClick={manejarCancelar}
                    >
                        Cancelar
                    </button>
                )}

                <button type="submit" className="btn btn--primary btn--md">
                    {estaEditando
                        ? "Actualizar unidad de medida"
                        : "Guardar unidad de medida"}
                </button>
            </div>
        </form>
    );
}

export default FormularioUnidadMedida;