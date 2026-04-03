using System.Net;
using Control_Fertilizantes_Backend.DTOs;
using Control_Fertilizantes_Backend.Entities;
using Control_Fertilizantes_Backend.Exceptions;
using Control_Fertilizantes_Backend.Interfaces;

namespace Control_Fertilizantes_Backend.Services
{
    public class PresentacionProductoServicio : IPresentacionProductoServicio
    {
        private readonly IPresentacionProductoRepositorio _presentacionProductoRepositorio;

        public PresentacionProductoServicio(IPresentacionProductoRepositorio presentacionProductoRepositorio)
        {
            _presentacionProductoRepositorio = presentacionProductoRepositorio;
        }

        public async Task<IEnumerable<PresentacionProductoListarDTO>> ListarAsync()
        {
            var presentaciones = await _presentacionProductoRepositorio.ListarAsync();

            return presentaciones.Select(MapearPresentacionProductoListarDTO);
        }

        public async Task<PresentacionProductoListarDTO?> ObtenerPorIdAsync(int idPresentacionProducto)
        {
            ValidarId(idPresentacionProducto, "El id de la presentación del producto no es válido.");

            var presentacion = await _presentacionProductoRepositorio.ObtenerPorIdAsync(idPresentacionProducto);

            if (presentacion == null)
                return null;

            return MapearPresentacionProductoListarDTO(presentacion);
        }

        public async Task<int> InsertarAsync(PresentacionProductoCrearDTO dto)
        {
            if (dto == null)
                throw new ReglaNegocio("Los datos de la presentación del producto son obligatorios.", HttpStatusCode.BadRequest);

            var presentacionProducto = ConstruirPresentacionProductoParaGuardar(
                dto.IdProducto,
                dto.Descripcion,
                dto.Cantidad,
                dto.IdUnidadMedida,
                dto.CantidadNormalizada);

            return await _presentacionProductoRepositorio.InsertarAsync(presentacionProducto);
        }

        public async Task<bool> ActualizarAsync(PresentacionProductoActualizarDTO dto)
        {
            if (dto == null)
                throw new ReglaNegocio("Los datos de la presentación del producto son obligatorios.", HttpStatusCode.BadRequest);

            ValidarId(dto.IdPresentacionProducto, "El id de la presentación del producto no es válido.");

            var presentacionExistente = await _presentacionProductoRepositorio.ObtenerPorIdAsync(dto.IdPresentacionProducto);

            if (presentacionExistente == null)
                throw new ReglaNegocio("La presentación del producto que intenta actualizar no existe.", HttpStatusCode.NotFound);

            if (!presentacionExistente.Activo)
                throw new ReglaNegocio("No se puede actualizar una presentación del producto inactiva.", HttpStatusCode.Conflict);

            var presentacionProducto = ConstruirPresentacionProductoParaGuardar(
                dto.IdProducto,
                dto.Descripcion,
                dto.Cantidad,
                dto.IdUnidadMedida,
                dto.CantidadNormalizada);

            presentacionProducto.IdPresentacionProducto = dto.IdPresentacionProducto;

            return await _presentacionProductoRepositorio.ActualizarAsync(presentacionProducto);
        }

        public async Task<bool> DesactivarAsync(int idPresentacionProducto)
        {
            ValidarId(idPresentacionProducto, "El id de la presentación del producto no es válido.");

            var presentacionExistente = await _presentacionProductoRepositorio.ObtenerPorIdAsync(idPresentacionProducto);

            if (presentacionExistente == null)
                throw new ReglaNegocio("La presentación del producto que intenta desactivar no existe.", HttpStatusCode.NotFound);

            if (!presentacionExistente.Activo)
                throw new ReglaNegocio("La presentación del producto ya se encuentra inactiva.", HttpStatusCode.Conflict);

            return await _presentacionProductoRepositorio.DesactivarAsync(idPresentacionProducto);
        }

        public async Task<IEnumerable<ProductoDropdownDTO>> ListarProductosParaDropdownAsync()
        {
            return await _presentacionProductoRepositorio.ListarProductosParaDropdownAsync();
        }

        public async Task<IEnumerable<UnidadMedidaDropdownDTO>> ListarUnidadesMedidaParaDropdownAsync()
        {
            return await _presentacionProductoRepositorio.ListarUnidadesMedidaParaDropdownAsync();
        }

        // =========================
        // MÉTODOS PRIVADOS
        // =========================

        private PresentacionProducto ConstruirPresentacionProductoParaGuardar(
            int idProducto,
            string? descripcionOriginal,
            decimal cantidad,
            int idUnidadMedida,
            decimal cantidadNormalizada)
        {
            ValidarId(idProducto, "El id del producto no es válido.");
            ValidarId(idUnidadMedida, "El id de la unidad de medida no es válido.");

            var descripcion = LimpiarTexto(descripcionOriginal);

            ValidarDescripcion(descripcion);
            ValidarValoresNumericos(cantidad, cantidadNormalizada);

            return new PresentacionProducto
            {
                IdProducto = idProducto,
                Descripcion = descripcion,
                Cantidad = cantidad,
                IdUnidadMedida = idUnidadMedida,
                CantidadNormalizada = cantidadNormalizada
            };
        }

        private PresentacionProductoListarDTO MapearPresentacionProductoListarDTO(PresentacionProducto presentacion)
        {
            return new PresentacionProductoListarDTO
            {
                IdPresentacionProducto = presentacion.IdPresentacionProducto,
                IdProducto = presentacion.IdProducto,
                NombreProducto = presentacion.NombreProducto ?? string.Empty,
                Descripcion = presentacion.Descripcion,
                Cantidad = presentacion.Cantidad,
                IdUnidadMedida = presentacion.IdUnidadMedida,
                NombreUnidadMedida = presentacion.NombreUnidadMedida ?? string.Empty,
                CantidadNormalizada = presentacion.CantidadNormalizada,
                Activo = presentacion.Activo,
                FechaCreacion = presentacion.FechaCreacion,
                FechaModificacion = presentacion.FechaModificacion
            };
        }

        private void ValidarId(int id, string mensaje)
        {
            if (id <= 0)
                throw new ReglaNegocio(mensaje, HttpStatusCode.BadRequest);
        }

        private string LimpiarTexto(string? valor)
        {
            return string.IsNullOrWhiteSpace(valor) ? string.Empty : valor.Trim();
        }

        private void ValidarDescripcion(string descripcion)
        {
            if (string.IsNullOrWhiteSpace(descripcion))
                throw new ReglaNegocio("La descripción de la presentación es obligatoria.", HttpStatusCode.BadRequest);

            if (descripcion.Length > 150)
                throw new ReglaNegocio("La descripción no puede superar los 150 caracteres.", HttpStatusCode.BadRequest);
        }

        private void ValidarValoresNumericos(decimal cantidad, decimal cantidadNormalizada)
        {
            if (cantidad <= 0)
                throw new ReglaNegocio("La cantidad debe ser mayor que cero.", HttpStatusCode.BadRequest);

            if (cantidadNormalizada <= 0)
                throw new ReglaNegocio("La cantidad normalizada debe ser mayor que cero.", HttpStatusCode.BadRequest);
        }
    }
}