using Control_Fertilizantes_Backend.DTOs;
using Control_Fertilizantes_Backend.Interfaces;

namespace Control_Fertilizantes_Backend.Services
{
    public class CompraAutomaticaServicio : ICompraAutomaticaServicio
    {
        private readonly ICompraAutomaticaRepositorio _compraAutomaticaRepositorio;

        public CompraAutomaticaServicio(ICompraAutomaticaRepositorio compraAutomaticaRepositorio)
        {
            _compraAutomaticaRepositorio = compraAutomaticaRepositorio;
        }

        public async Task<VistaPreviaProformaValidadaDTO> ValidarVistaPreviaAsync(VistaPreviaProformaPdfDTO vistaPreviaPdf)
        {
            var resultado = new VistaPreviaProformaValidadaDTO
            {
                NumeroProforma = vistaPreviaPdf.NumeroProforma,
                Fecha = vistaPreviaPdf.Fecha,
                NombreProveedorPdf = vistaPreviaPdf.NombreProveedorPdf,
                NombreNegocio = vistaPreviaPdf.NombreNegocio,
                RazonSocial = vistaPreviaPdf.RazonSocial,
                Cedula = vistaPreviaPdf.Cedula,
                Telefono = vistaPreviaPdf.Telefono,
                Vendedor = vistaPreviaPdf.Vendedor,
                TipoDocumento = vistaPreviaPdf.TipoDocumento,
                DiasCredito = vistaPreviaPdf.DiasCredito,
                FechaVencimiento = vistaPreviaPdf.FechaVencimiento,
                Subtotal = vistaPreviaPdf.Subtotal,
                Descuento = vistaPreviaPdf.Descuento,
                Iva = vistaPreviaPdf.Iva,
                Total = vistaPreviaPdf.Total
            };

            await ValidarProveedorAsync(resultado);

            foreach (var linea in vistaPreviaPdf.Lineas)
            {
                var lineaValidada = await ValidarLineaAsync(linea);
                resultado.Lineas.Add(lineaValidada);
            }

            resultado.CantidadLineasValidas = resultado.Lineas.Count(x => x.SePuedeRegistrar);
            resultado.CantidadLineasPendientes = resultado.Lineas.Count(x => !x.SePuedeRegistrar);
            resultado.TieneLineasPendientesMapeo = resultado.CantidadLineasPendientes > 0;

            return resultado;
        }

        public async Task<List<int>> ConfirmarComprasAutomaticasAsync(ConfirmarComprasAutomaticasDTO dto)
        {
            if (dto.IdProveedor <= 0)
            {
                throw new Exception("El proveedor es obligatorio para confirmar la compra.");
            }

            var fechaCompra = dto.Fecha ?? DateTime.Now;
            var moneda = "CRC";
            var comprasGeneradas = new List<int>();

            var lineasValidas = dto.Lineas
                .Where(x => x.SePuedeRegistrar && x.IdProducto.HasValue && x.IdPresentacionProducto.HasValue)
                .ToList();

            if (!lineasValidas.Any())
            {
                throw new Exception("No hay líneas válidas para registrar.");
            }

            foreach (var linea in lineasValidas)
            {
                var observacion = $"Compra automática desde proforma {dto.NumeroProforma}";

                var idCompra = await _compraAutomaticaRepositorio.InsertarCompraDesdeProformaAsync(
                    linea.IdProducto!.Value,
                    dto.IdProveedor,
                    linea.IdPresentacionProducto!.Value,
                    fechaCompra,
                    linea.Cantidad,
                    linea.TotalLinea,
                    moneda,
                    observacion
                );

                comprasGeneradas.Add(idCompra);
            }

            return comprasGeneradas;
        }

        private async Task ValidarProveedorAsync(VistaPreviaProformaValidadaDTO resultado)
        {
            var proveedor = await _compraAutomaticaRepositorio.BuscarProveedorParaCompraAutomaticaAsync(
                resultado.NombreProveedorPdf,
                resultado.NombreProveedorPdf
            );

            if (proveedor == null)
            {
                resultado.ProveedorEncontrado = false;
                resultado.ObservacionProveedor = "No se encontró el proveedor del PDF en el sistema.";
                return;
            }

            resultado.IdProveedor = proveedor.IdProveedor;
            resultado.NombreProveedorSistema = proveedor.NombreProveedor;
            resultado.ProveedorEncontrado = true;
            resultado.ObservacionProveedor = "Proveedor validado correctamente.";
        }

        private async Task<ProformaPdfLineaValidadaDTO> ValidarLineaAsync(ProformaPdfLineaDTO linea)
        {
            var resultado = new ProformaPdfLineaValidadaDTO
            {
                Codigo = linea.Codigo,
                Descripcion = linea.Descripcion,
                Cantidad = linea.Cantidad,
                Precio = linea.Precio,
                DescuentoPorcentaje = linea.DescuentoPorcentaje,
                Sugerido = linea.Sugerido,
                TotalLinea = linea.TotalLinea
            };

            var equivalencia = await _compraAutomaticaRepositorio.BuscarEquivalenciaCompraAutomaticaAsync(
                linea.Codigo,
                linea.Descripcion
            );

            if (equivalencia != null)
            {
                resultado.IdProducto = equivalencia.IdProducto;
                resultado.IdPresentacionProducto = equivalencia.IdPresentacionProducto;
                resultado.NombreProductoSistema = equivalencia.NombreProducto;
                resultado.NombrePresentacionSistema = equivalencia.NombrePresentacion ?? string.Empty;
                resultado.ProductoEncontrado = true;
                resultado.PresentacionEncontrada = equivalencia.IdPresentacionProducto.HasValue;
                resultado.SePuedeRegistrar = equivalencia.IdPresentacionProducto.HasValue;

                resultado.ObservacionValidacion = equivalencia.IdPresentacionProducto.HasValue
                    ? "Línea validada por equivalencia previamente registrada."
                    : "Se encontró una equivalencia para el producto, pero la presentación aún no está definida.";

                return resultado;
            }

            var producto = await _compraAutomaticaRepositorio.BuscarProductoParaCompraAutomaticaAsync(
                linea.Descripcion
            );

            if (producto == null)
            {
                resultado.ProductoEncontrado = false;
                resultado.PresentacionEncontrada = false;
                resultado.SePuedeRegistrar = false;
                resultado.ObservacionValidacion = "No se encontró el producto en el sistema.";
                return resultado;
            }

            resultado.IdProducto = producto.IdProducto;
            resultado.NombreProductoSistema = producto.NombreProducto;
            resultado.ProductoEncontrado = true;

            var presentacion = await _compraAutomaticaRepositorio.BuscarPresentacionParaCompraAutomaticaAsync(
                producto.IdProducto,
                linea.Descripcion
            );

            if (presentacion == null)
            {
                resultado.PresentacionEncontrada = false;
                resultado.SePuedeRegistrar = false;
                resultado.ObservacionValidacion = "Producto encontrado, pero la presentación no coincide o no está registrada.";
                return resultado;
            }

            resultado.IdPresentacionProducto = presentacion.IdPresentacionProducto;
            resultado.NombrePresentacionSistema = presentacion.NombrePresentacion;
            resultado.PresentacionEncontrada = true;
            resultado.SePuedeRegistrar = true;
            resultado.ObservacionValidacion = "Línea validada correctamente y lista para registrarse.";

            return resultado;
        }
    }
}