using System.Net;
using Control_Fertilizantes_Backend.DTOs;
using Control_Fertilizantes_Backend.Entities;
using Control_Fertilizantes_Backend.Exceptions;
using Control_Fertilizantes_Backend.Interfaces;

namespace Control_Fertilizantes_Backend.Services
{
    public class UnidadMedidaServicio : IUnidadMedidaServicio
    {
        private readonly IUnidadMedidaRepositorio _unidadMedidaRepositorio;

        public UnidadMedidaServicio(IUnidadMedidaRepositorio unidadMedidaRepositorio)
        {
            _unidadMedidaRepositorio = unidadMedidaRepositorio;
        }

        public async Task<IEnumerable<UnidadMedidaListarDTO>> ListarAsync()
        {
            var unidadesMedida = await _unidadMedidaRepositorio.ListarAsync();

            return unidadesMedida.Select(MapearUnidadMedidaListarDTO);
        }

        public async Task<UnidadMedidaListarDTO?> ObtenerPorIdAsync(int idUnidadMedida)
        {
            ValidarId(idUnidadMedida, "El id de la unidad de medida no es válido.");

            var unidadMedida = await _unidadMedidaRepositorio.ObtenerPorIdAsync(idUnidadMedida);

            if (unidadMedida == null)
                return null;

            return MapearUnidadMedidaListarDTO(unidadMedida);
        }

        public async Task<int> InsertarAsync(UnidadMedidaCrearDTO dto)
        {
            if (dto == null)
                throw new ReglaNegocio("Los datos de la unidad de medida son obligatorios.", HttpStatusCode.BadRequest);

            var unidadMedida = ConstruirUnidadMedidaParaGuardar(
                dto.Codigo,
                dto.Nombre,
                dto.TipoBase,
                dto.FactorConversion,
                dto.EsUnidadBase
            );

            return await _unidadMedidaRepositorio.InsertarAsync(unidadMedida);
        }

        public async Task<bool> ActualizarAsync(UnidadMedidaActualizarDTO dto)
        {
            if (dto == null)
                throw new ReglaNegocio("Los datos de la unidad de medida son obligatorios.", HttpStatusCode.BadRequest);

            ValidarId(dto.IdUnidadMedida, "El id de la unidad de medida no es válido.");

            var unidadMedidaExistente = await _unidadMedidaRepositorio.ObtenerPorIdAsync(dto.IdUnidadMedida);

            if (unidadMedidaExistente == null)
                throw new ReglaNegocio("La unidad de medida que intenta actualizar no existe.", HttpStatusCode.NotFound);

            if (!unidadMedidaExistente.Activo)
                throw new ReglaNegocio("No se puede actualizar una unidad de medida inactiva.", HttpStatusCode.Conflict);

            var unidadMedida = ConstruirUnidadMedidaParaGuardar(
                dto.Codigo,
                dto.Nombre,
                dto.TipoBase,
                dto.FactorConversion,
                dto.EsUnidadBase
            );

            unidadMedida.IdUnidadMedida = dto.IdUnidadMedida;

            return await _unidadMedidaRepositorio.ActualizarAsync(unidadMedida);
        }

        public async Task<bool> DesactivarAsync(int idUnidadMedida)
        {
            ValidarId(idUnidadMedida, "El id de la unidad de medida no es válido.");

            var unidadMedidaExistente = await _unidadMedidaRepositorio.ObtenerPorIdAsync(idUnidadMedida);

            if (unidadMedidaExistente == null)
                throw new ReglaNegocio("La unidad de medida que intenta desactivar no existe.", HttpStatusCode.NotFound);

            if (!unidadMedidaExistente.Activo)
                throw new ReglaNegocio("La unidad de medida ya se encuentra inactiva.", HttpStatusCode.Conflict);

            return await _unidadMedidaRepositorio.DesactivarAsync(idUnidadMedida);
        }

        // =========================
        // MÉTODOS PRIVADOS
        // =========================

        private UnidadMedida ConstruirUnidadMedidaParaGuardar(
            string? codigoOriginal,
            string? nombreOriginal,
            string? tipoBaseOriginal,
            decimal factorConversion,
            bool esUnidadBase)
        {
            var codigo = LimpiarCodigo(codigoOriginal);
            var nombre = LimpiarTexto(nombreOriginal);
            var tipoBase = LimpiarTipoBase(tipoBaseOriginal);

            ValidarCamposObligatorios(codigo, nombre, tipoBase);
            ValidarLongitudes(codigo, nombre, tipoBase);
            ValidarFactorConversion(factorConversion, esUnidadBase);
            ValidarContenidoSemantico(codigo, nombre);

            return new UnidadMedida
            {
                Codigo = codigo,
                Nombre = nombre,
                TipoBase = tipoBase,
                FactorConversion = factorConversion,
                EsUnidadBase = esUnidadBase
            };
        }

        private UnidadMedidaListarDTO MapearUnidadMedidaListarDTO(UnidadMedida unidadMedida)
        {
            return new UnidadMedidaListarDTO
            {
                IdUnidadMedida = unidadMedida.IdUnidadMedida,
                Codigo = unidadMedida.Codigo,
                Nombre = unidadMedida.Nombre,
                TipoBase = unidadMedida.TipoBase,
                FactorConversion = unidadMedida.FactorConversion,
                EsUnidadBase = unidadMedida.EsUnidadBase,
                Activo = unidadMedida.Activo
            };
        }

        private void ValidarId(int id, string mensaje)
        {
            if (id <= 0)
                throw new ReglaNegocio(mensaje, HttpStatusCode.BadRequest);
        }

        private string LimpiarCodigo(string? valor)
        {
            return string.IsNullOrWhiteSpace(valor) ? string.Empty : valor.Trim().ToUpper();
        }

        private string LimpiarTexto(string? valor)
        {
            return string.IsNullOrWhiteSpace(valor) ? string.Empty : valor.Trim();
        }

        private string LimpiarTipoBase(string? valor)
        {
            return string.IsNullOrWhiteSpace(valor) ? string.Empty : valor.Trim().ToUpper();
        }

        private void ValidarCamposObligatorios(string codigo, string nombre, string tipoBase)
        {
            if (string.IsNullOrWhiteSpace(codigo))
                throw new ReglaNegocio("El código de la unidad de medida es obligatorio.", HttpStatusCode.BadRequest);

            if (string.IsNullOrWhiteSpace(nombre))
                throw new ReglaNegocio("El nombre de la unidad de medida es obligatorio.", HttpStatusCode.BadRequest);

            if (string.IsNullOrWhiteSpace(tipoBase))
                throw new ReglaNegocio("El tipo base de la unidad de medida es obligatorio.", HttpStatusCode.BadRequest);
        }

        private void ValidarLongitudes(string codigo, string nombre, string tipoBase)
        {
            if (codigo.Length < 1 || codigo.Length > 20)
                throw new ReglaNegocio("El código de la unidad de medida debe tener entre 1 y 20 caracteres.", HttpStatusCode.BadRequest);

            if (nombre.Length < 2 || nombre.Length > 50)
                throw new ReglaNegocio("El nombre de la unidad de medida debe tener entre 2 y 50 caracteres.", HttpStatusCode.BadRequest);

            if (tipoBase.Length < 3 || tipoBase.Length > 20)
                throw new ReglaNegocio("El tipo base debe tener entre 3 y 20 caracteres.", HttpStatusCode.BadRequest);
        }

        private void ValidarFactorConversion(decimal factorConversion, bool esUnidadBase)
        {
            if (factorConversion <= 0)
                throw new ReglaNegocio("El factor de conversión debe ser mayor que cero.", HttpStatusCode.BadRequest);

            if (esUnidadBase && factorConversion != 1)
                throw new ReglaNegocio("Una unidad base debe tener factor de conversión igual a 1.", HttpStatusCode.BadRequest);
        }

        private void ValidarContenidoSemantico(string codigo, string nombre)
        {
            if (EsSoloNumeros(codigo))
                throw new ReglaNegocio("El código de la unidad de medida no puede contener solo números.", HttpStatusCode.BadRequest);

            if (EsSoloNumeros(nombre))
                throw new ReglaNegocio("El nombre de la unidad de medida no puede contener solo números.", HttpStatusCode.BadRequest);
        }

        private bool EsSoloNumeros(string valor)
        {
            return valor.All(char.IsDigit);
        }
    }
}