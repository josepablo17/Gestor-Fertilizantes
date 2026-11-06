import { solicitar } from "./cliente.js";

export const obtenerUnidadesMedida = async (signal) =>
  (await solicitar("/UnidadMedida/ListarUnidadMedida", { decimalesExactos: false, signal })) ?? [];

export const desactivarUnidadMedida = (idUnidadMedida) =>
  solicitar(`/UnidadMedida/Desactivar/${idUnidadMedida}`, { metodo: "DELETE" });
