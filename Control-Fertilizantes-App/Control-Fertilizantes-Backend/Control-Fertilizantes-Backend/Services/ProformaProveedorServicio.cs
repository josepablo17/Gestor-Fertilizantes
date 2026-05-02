using System.Net;
using Control_Fertilizantes_Backend.DTOs;
using Control_Fertilizantes_Backend.Exceptions;
using Control_Fertilizantes_Backend.Interfaces;

namespace Control_Fertilizantes_Backend.Services
{
    public class ProformaProveedorServicio : IProformaProveedorServicio
    {
        private readonly IProformaProveedorRepositorio _proformaProveedorRepositorio;

        public ProformaProveedorServicio(IProformaProveedorRepositorio proformaProveedorRepositorio)
        {
            _proformaProveedorRepositorio = proformaProveedorRepositorio;
        }

        public async Task<IEnumerable<ProformaProveedorRespuestaDTO>> ListarAsync()
        {
            return await _proformaProveedorRepositorio.ListarAsync();
        }

        public async Task<ProformaProveedorRespuestaDTO?> ObtenerPorIdAsync(int idProformaProveedor)
        {
            ValidarId(idProformaProveedor, "El id de la proforma no es válido.");

            var proforma = await _proformaProveedorRepositorio.ObtenerPorIdAsync(idProformaProveedor);

            if (proforma == null)
                return null;

            var detalles = await _proformaProveedorRepositorio.ListarDetallesAsync(idProformaProveedor);

            proforma.Detalles = detalles.ToList();

            return proforma;
        }

        public async Task<ProformaProveedorRespuestaDTO> GuardarAsync(GuardarProformaProveedorDTO dto)
        {
            if (dto == null)
                throw new ReglaNegocio("Los datos de la proforma son obligatorios.", HttpStatusCode.BadRequest);

            ValidarProforma(dto);

            if (dto.Detalles == null || !dto.Detalles.Any())
                throw new ReglaNegocio("La proforma debe contener al menos una línea de detalle.", HttpStatusCode.BadRequest);

            foreach (var detalle in dto.Detalles)
            {
                ValidarDetalle(detalle);
            }

            var proforma = ConstruirProforma(dto);

            var idProformaProveedor = await _proformaProveedorRepositorio.InsertarAsync(proforma);

            foreach (var detalleDto in dto.Detalles)
            {
                var detalle = ConstruirDetalle(detalleDto, idProformaProveedor);

                await _proformaProveedorRepositorio.InsertarDetalleAsync(detalle);
            }

            var proformaGuardada = await ObtenerPorIdAsync(idProformaProveedor);

            if (proformaGuardada == null)
                throw new ReglaNegocio("No se pudo obtener la proforma registrada.", HttpStatusCode.InternalServerError);

            return proformaGuardada;
        }

        private GuardarProformaProveedorDTO ConstruirProforma(GuardarProformaProveedorDTO dto)
        {
            return new GuardarProformaProveedorDTO
            {
                NumeroProforma = LimpiarTextoObligatorio(dto.NumeroProforma),
                IdProveedor = dto.IdProveedor,
                FechaProforma = dto.FechaProforma,
                FechaVencimiento = dto.FechaVencimiento,
                DiasCredito = dto.DiasCredito,
                TipoDocumento = LimpiarTextoOpcional(dto.TipoDocumento),

                NombreProveedorPdf = LimpiarTextoOpcional(dto.NombreProveedorPdf),
                NombreNegocio = LimpiarTextoOpcional(dto.NombreNegocio),
                RazonSocial = LimpiarTextoOpcional(dto.RazonSocial),
                Cedula = LimpiarTextoOpcional(dto.Cedula),
                Telefono = LimpiarTextoOpcional(dto.Telefono),
                Vendedor = LimpiarTextoOpcional(dto.Vendedor),

                Subtotal = dto.Subtotal,
                Descuento = dto.Descuento,
                IVA = dto.IVA,
                Total = dto.Total,

                Observaciones = LimpiarTextoOpcional(dto.Observaciones)
            };
        }

        private GuardarProformaProveedorDetalleDTO ConstruirDetalle(
            GuardarProformaProveedorDetalleDTO dto,
            int idProformaProveedor)
        {
            return new GuardarProformaProveedorDetalleDTO
            {
                IdProformaProveedor = idProformaProveedor,
                CodigoProveedor = LimpiarTextoOpcional(dto.CodigoProveedor),
                DescripcionProveedor = LimpiarTextoObligatorio(dto.DescripcionProveedor),

                IdProducto = dto.IdProducto,
                IdPresentacionProducto = dto.IdPresentacionProducto,

                Cantidad = dto.Cantidad,
                PrecioUnitario = dto.PrecioUnitario,
                DescuentoPorcentaje = dto.DescuentoPorcentaje,
                TotalLinea = dto.TotalLinea,

                ProductoEncontrado = dto.ProductoEncontrado,
                PresentacionEncontrada = dto.PresentacionEncontrada,
                SePuedeRegistrar = dto.SePuedeRegistrar,

                ObservacionValidacion = LimpiarTextoOpcional(dto.ObservacionValidacion)
            };
        }

        private void ValidarProforma(GuardarProformaProveedorDTO dto)
        {
            if (string.IsNullOrWhiteSpace(dto.NumeroProforma))
                throw new ReglaNegocio("El número de proforma es obligatorio.", HttpStatusCode.BadRequest);

            ValidarId(dto.IdProveedor, "El proveedor es obligatorio.");

            if (dto.DiasCredito.HasValue && dto.DiasCredito.Value < 0)
                throw new ReglaNegocio("Los días de crédito no pueden ser negativos.", HttpStatusCode.BadRequest);

            if (dto.FechaProforma.HasValue &&
                dto.FechaVencimiento.HasValue &&
                dto.FechaVencimiento.Value.Date < dto.FechaProforma.Value.Date)
            {
                throw new ReglaNegocio("La fecha de vencimiento no puede ser menor que la fecha de la proforma.", HttpStatusCode.BadRequest);
            }

            ValidarMontoOpcional(dto.Subtotal, "El subtotal no puede ser negativo.");
            ValidarMontoOpcional(dto.Descuento, "El descuento no puede ser negativo.");
            ValidarMontoOpcional(dto.IVA, "El IVA no puede ser negativo.");
            ValidarMontoOpcional(dto.Total, "El total no puede ser negativo.");

            ValidarLongitud(dto.NumeroProforma, 50, "El número de proforma no puede superar los 50 caracteres.");
            ValidarLongitud(dto.TipoDocumento, 50, "El tipo de documento no puede superar los 50 caracteres.");
            ValidarLongitud(dto.NombreProveedorPdf, 200, "El nombre del proveedor del PDF no puede superar los 200 caracteres.");
            ValidarLongitud(dto.NombreNegocio, 250, "El nombre del negocio no puede superar los 250 caracteres.");
            ValidarLongitud(dto.RazonSocial, 250, "La razón social no puede superar los 250 caracteres.");
            ValidarLongitud(dto.Cedula, 50, "La cédula no puede superar los 50 caracteres.");
            ValidarLongitud(dto.Telefono, 50, "El teléfono no puede superar los 50 caracteres.");
            ValidarLongitud(dto.Vendedor, 150, "El vendedor no puede superar los 150 caracteres.");
            ValidarLongitud(dto.Observaciones, 500, "Las observaciones no pueden superar los 500 caracteres.");
        }

        private void ValidarDetalle(GuardarProformaProveedorDetalleDTO dto)
        {
            if (dto == null)
                throw new ReglaNegocio("Los datos del detalle son obligatorios.", HttpStatusCode.BadRequest);

            if (string.IsNullOrWhiteSpace(dto.DescripcionProveedor))
                throw new ReglaNegocio("La descripción del producto en la proforma es obligatoria.", HttpStatusCode.BadRequest);

            if (dto.Cantidad <= 0)
                throw new ReglaNegocio("La cantidad debe ser mayor a cero.", HttpStatusCode.BadRequest);

            if (dto.PrecioUnitario < 0)
                throw new ReglaNegocio("El precio unitario no puede ser negativo.", HttpStatusCode.BadRequest);

            if (dto.TotalLinea < 0)
                throw new ReglaNegocio("El total de la línea no puede ser negativo.", HttpStatusCode.BadRequest);

            if (dto.DescuentoPorcentaje < 0 || dto.DescuentoPorcentaje > 100)
                throw new ReglaNegocio("El porcentaje de descuento debe estar entre 0 y 100.", HttpStatusCode.BadRequest);

            if (dto.SePuedeRegistrar &&
                (dto.IdProducto == null ||
                 dto.IdProducto <= 0 ||
                 dto.IdPresentacionProducto == null ||
                 dto.IdPresentacionProducto <= 0 ||
                 !dto.ProductoEncontrado ||
                 !dto.PresentacionEncontrada))
            {
                throw new ReglaNegocio("Una línea solo puede registrarse si tiene producto y presentación válidos.", HttpStatusCode.BadRequest);
            }

            ValidarLongitud(dto.CodigoProveedor, 50, "El código del proveedor no puede superar los 50 caracteres.");
            ValidarLongitud(dto.DescripcionProveedor, 300, "La descripción del proveedor no puede superar los 300 caracteres.");
            ValidarLongitud(dto.ObservacionValidacion, 500, "La observación de validación no puede superar los 500 caracteres.");
        }

        private void ValidarId(int id, string mensaje)
        {
            if (id <= 0)
                throw new ReglaNegocio(mensaje, HttpStatusCode.BadRequest);
        }

        private void ValidarMontoOpcional(decimal? valor, string mensaje)
        {
            if (valor.HasValue && valor.Value < 0)
                throw new ReglaNegocio(mensaje, HttpStatusCode.BadRequest);
        }

        private void ValidarLongitud(string? valor, int longitudMaxima, string mensaje)
        {
            if (!string.IsNullOrWhiteSpace(valor) && valor.Trim().Length > longitudMaxima)
                throw new ReglaNegocio(mensaje, HttpStatusCode.BadRequest);
        }

        private string LimpiarTextoObligatorio(string valor)
        {
            return valor.Trim();
        }

        private string? LimpiarTextoOpcional(string? valor)
        {
            if (string.IsNullOrWhiteSpace(valor))
                return null;

            return valor.Trim();
        }
    }
}