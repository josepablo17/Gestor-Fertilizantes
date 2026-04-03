using System.Net;
using Control_Fertilizantes_Backend.DTOs;
using Control_Fertilizantes_Backend.Entities;
using Control_Fertilizantes_Backend.Interfaces;
using Control_Fertilizantes_Backend.Exceptions;

namespace Control_Fertilizantes_Backend.Services
{
    public class CompraServicio : ICompraServicio
    {
        private readonly ICompraRepositorio _compraRepositorio;

        public CompraServicio(ICompraRepositorio compraRepositorio)
        {
            _compraRepositorio = compraRepositorio;
        }

        public async Task<IEnumerable<CompraListarDTO>> ListarAsync()
        {
            var compras = await _compraRepositorio.ListarAsync();
            return compras.Select(MapearCompraListarDTO);
        }

        public async Task<CompraDetalleDTO?> ObtenerPorIdAsync(int idCompra)
        {
            ValidarId(idCompra, "El id de la compra no es válido.");

            var compra = await _compraRepositorio.ObtenerPorIdAsync(idCompra);

            if (compra == null)
                return null;

            return MapearCompraDetalleDTO(compra);
        }

        public async Task<int> InsertarAsync(CompraCrearDTO dto)
        {
            if (dto == null)
                throw new ReglaNegocio("Los datos de la compra son obligatorios.", HttpStatusCode.BadRequest);

            var compra = ConstruirCompra(
                dto.IdProducto,
                dto.IdProveedor,
                dto.IdPresentacionProducto,
                dto.FechaCompra,
                dto.CantidadComprada,
                dto.PrecioTotal,
                dto.Moneda,
                dto.Observaciones
            );

            return await _compraRepositorio.InsertarAsync(compra);
        }

        public async Task<bool> ActualizarAsync(CompraActualizarDTO dto)
        {
            if (dto == null)
                throw new ReglaNegocio("Los datos de la compra son obligatorios.", HttpStatusCode.BadRequest);

            ValidarId(dto.IdCompra, "El id de la compra no es válido.");

            var compraExistente = await _compraRepositorio.ObtenerPorIdAsync(dto.IdCompra);

            if (compraExistente == null)
                throw new ReglaNegocio("La compra que intenta actualizar no existe.", HttpStatusCode.NotFound);

            var compra = ConstruirCompra(
                dto.IdProducto,
                dto.IdProveedor,
                dto.IdPresentacionProducto,
                dto.FechaCompra,
                dto.CantidadComprada,
                dto.PrecioTotal,
                dto.Moneda,
                dto.Observaciones
            );

            compra.IdCompra = dto.IdCompra;

            return await _compraRepositorio.ActualizarAsync(compra);
        }

        public async Task<IEnumerable<CompraListarDTO>> HistorialPorProductoAsync(int idProducto)
        {
            ValidarId(idProducto, "El id del producto no es válido.");

            var historial = await _compraRepositorio.HistorialPorProductoAsync(idProducto);
            return historial.Select(MapearCompraListarDTO);
        }

        public async Task<UltimoPrecioCompraDTO?> ObtenerUltimoPrecioAsync(int idProducto, int idPresentacionProducto)
        {
            ValidarId(idProducto, "El id del producto no es válido.");
            ValidarId(idPresentacionProducto, "El id de la presentación no es válido.");

            var compra = await _compraRepositorio.ObtenerUltimoPrecioAsync(idProducto, idPresentacionProducto);

            if (compra == null)
                return null;

            return new UltimoPrecioCompraDTO
            {
                IdCompra = compra.IdCompra,
                FechaCompra = compra.FechaCompra,
                PrecioTotal = compra.PrecioTotal,
                PrecioUnitarioCalculado = compra.PrecioUnitarioCalculado,
                Moneda = compra.Moneda,
                NombreProveedor = compra.NombreProveedor
            };
        }

        private Compra ConstruirCompra(
            int idProducto,
            int idProveedor,
            int idPresentacionProducto,
            DateTime fechaCompra,
            decimal cantidadComprada,
            decimal precioTotal,
            string? monedaOriginal,
            string? observacionesOriginal)
        {
            ValidarId(idProducto, "El id del producto no es válido.");
            ValidarId(idProveedor, "El id del proveedor no es válido.");
            ValidarId(idPresentacionProducto, "El id de la presentación no es válido.");

            var moneda = LimpiarMoneda(monedaOriginal);
            var observaciones = LimpiarObservaciones(observacionesOriginal);

            ValidarCampos(fechaCompra, cantidadComprada, precioTotal, moneda, observaciones);

            return new Compra
            {
                IdProducto = idProducto,
                IdProveedor = idProveedor,
                IdPresentacionProducto = idPresentacionProducto,
                FechaCompra = fechaCompra,
                CantidadComprada = cantidadComprada,
                PrecioTotal = precioTotal,
                Moneda = moneda,
                Observaciones = observaciones
            };
        }

        private CompraListarDTO MapearCompraListarDTO(Compra c)
        {
            return new CompraListarDTO
            {
                IdCompra = c.IdCompra,
                IdProducto = c.IdProducto,
                NombreProducto = c.NombreProducto,
                Categoria = c.Categoria,
                Marca = c.Marca,
                IdProveedor = c.IdProveedor,
                NombreProveedor = c.NombreProveedor,
                IdPresentacionProducto = c.IdPresentacionProducto,
                Presentacion = c.Presentacion,
                CantidadPresentacion = c.CantidadPresentacion,
                UnidadMedida = c.UnidadMedida,
                FechaCompra = c.FechaCompra,
                CantidadComprada = c.CantidadComprada,
                PrecioTotal = c.PrecioTotal,
                Moneda = c.Moneda,
                PrecioUnitarioCalculado = c.PrecioUnitarioCalculado,
                PrecioUnitarioAnterior = c.PrecioUnitarioAnterior,
                DiferenciaPrecio = c.DiferenciaPrecio,
                PorcentajeCambioPrecio = c.PorcentajeCambioPrecio,
                TendenciaPrecio = c.TendenciaPrecio,
                Observaciones = c.Observaciones,
                FechaCreacion = c.FechaCreacion,
                FechaModificacion = c.FechaModificacion
            };
        }

        private CompraDetalleDTO MapearCompraDetalleDTO(Compra c)
        {
            return new CompraDetalleDTO
            {
                IdCompra = c.IdCompra,
                IdProducto = c.IdProducto,
                NombreProducto = c.NombreProducto,
                Categoria = c.Categoria,
                Marca = c.Marca,
                IdProveedor = c.IdProveedor,
                NombreProveedor = c.NombreProveedor,
                IdPresentacionProducto = c.IdPresentacionProducto,
                Presentacion = c.Presentacion,
                CantidadPresentacion = c.CantidadPresentacion,
                UnidadMedida = c.UnidadMedida,
                FechaCompra = c.FechaCompra,
                CantidadComprada = c.CantidadComprada,
                PrecioTotal = c.PrecioTotal,
                Moneda = c.Moneda,
                PrecioUnitarioCalculado = c.PrecioUnitarioCalculado,
                IdCompraAnterior = c.IdCompraAnterior,
                PrecioUnitarioAnterior = c.PrecioUnitarioAnterior,
                DiferenciaPrecio = c.DiferenciaPrecio,
                PorcentajeCambioPrecio = c.PorcentajeCambioPrecio,
                TendenciaPrecio = c.TendenciaPrecio,
                Observaciones = c.Observaciones,
                FechaCreacion = c.FechaCreacion,
                FechaModificacion = c.FechaModificacion
            };
        }

        private void ValidarId(int id, string mensaje)
        {
            if (id <= 0)
                throw new ReglaNegocio(mensaje, HttpStatusCode.BadRequest);
        }

        private string LimpiarMoneda(string? valor)
        {
            return string.IsNullOrWhiteSpace(valor) ? string.Empty : valor.Trim().ToUpper();
        }

        private string? LimpiarObservaciones(string? observaciones)
        {
            if (string.IsNullOrWhiteSpace(observaciones))
                return null;

            return observaciones.Trim();
        }

        private void ValidarCampos(
            DateTime fechaCompra,
            decimal cantidadComprada,
            decimal precioTotal,
            string moneda,
            string? observaciones)
        {
            if (fechaCompra == default)
                throw new ReglaNegocio("La fecha de compra es obligatoria.", HttpStatusCode.BadRequest);

            if (fechaCompra.Date > DateTime.Today)
                throw new ReglaNegocio("La fecha de compra no puede ser futura.", HttpStatusCode.BadRequest);

            if (cantidadComprada <= 0)
                throw new ReglaNegocio("La cantidad comprada debe ser mayor a cero.", HttpStatusCode.BadRequest);

            if (precioTotal <= 0)
                throw new ReglaNegocio("El precio total debe ser mayor a cero.", HttpStatusCode.BadRequest);

            if (string.IsNullOrWhiteSpace(moneda))
                throw new ReglaNegocio("La moneda es obligatoria.", HttpStatusCode.BadRequest);

            if (moneda.Length > 10)
                throw new ReglaNegocio("La moneda no puede superar los 10 caracteres.", HttpStatusCode.BadRequest);

            if (moneda != "CRC" && moneda != "USD")
                throw new ReglaNegocio("La moneda debe ser CRC o USD.", HttpStatusCode.BadRequest);

            if (!string.IsNullOrWhiteSpace(observaciones) && observaciones.Length > 500)
                throw new ReglaNegocio("Las observaciones no pueden superar los 500 caracteres.", HttpStatusCode.BadRequest);
        }
    }
}