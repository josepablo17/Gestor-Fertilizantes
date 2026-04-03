using System.Net;
using Control_Fertilizantes_Backend.DTOs;
using Control_Fertilizantes_Backend.Entities;
using Control_Fertilizantes_Backend.Interfaces;
using Control_Fertilizantes_Backend.Exceptions;

namespace Control_Fertilizantes_Backend.Services
{
    public class ProductoServicio : IProductoServicio
    {
        private readonly IProductoRepositorio _productoRepositorio;

        public ProductoServicio(IProductoRepositorio productoRepositorio)
        {
            _productoRepositorio = productoRepositorio;
        }

        public async Task<IEnumerable<ProductoListarDTO>> ListarAsync()
        {
            var productos = await _productoRepositorio.ListarAsync();

            return productos.Select(MapearProductoListarDTO);
        }

        public async Task<ProductoListarDTO?> ObtenerPorIdAsync(int idProducto)
        {
            ValidarId(idProducto, "El id del producto no es válido.");

            var producto = await _productoRepositorio.ObtenerPorIdAsync(idProducto);

            if (producto == null)
                return null;

            return MapearProductoListarDTO(producto);
        }

        public async Task<int> InsertarAsync(ProductoCrearDTO dto)
        {
            if (dto == null)
                throw new ReglaNegocio("Los datos del producto son obligatorios.", HttpStatusCode.BadRequest);

            var producto = ConstruirProductoParaGuardar(dto.Nombre, dto.Categoria, dto.Marca, dto.Descripcion);

            return await _productoRepositorio.InsertarAsync(producto);
        }

        public async Task<bool> ActualizarAsync(ProductoActualizarDTO dto)
        {
            if (dto == null)
                throw new ReglaNegocio("Los datos del producto son obligatorios.", HttpStatusCode.BadRequest);

            ValidarId(dto.IdProducto, "El id del producto no es válido.");

            var productoExistente = await _productoRepositorio.ObtenerPorIdAsync(dto.IdProducto);

            if (productoExistente == null)
                throw new ReglaNegocio("El producto que intenta actualizar no existe.", HttpStatusCode.NotFound);

            if (!productoExistente.Activo)
                throw new ReglaNegocio("No se puede actualizar un producto inactivo.", HttpStatusCode.Conflict);

            var producto = ConstruirProductoParaGuardar(dto.Nombre, dto.Categoria, dto.Marca, dto.Descripcion);
            producto.IdProducto = dto.IdProducto;

            return await _productoRepositorio.ActualizarAsync(producto);
        }

        public async Task<bool> DesactivarAsync(int idProducto)
        {
            ValidarId(idProducto, "El id del producto no es válido.");

            var productoExistente = await _productoRepositorio.ObtenerPorIdAsync(idProducto);

            if (productoExistente == null)
                throw new ReglaNegocio("El producto que intenta desactivar no existe.", HttpStatusCode.NotFound);

            if (!productoExistente.Activo)
                throw new ReglaNegocio("El producto ya se encuentra inactivo.", HttpStatusCode.Conflict);

            return await _productoRepositorio.DesactivarAsync(idProducto);
        }

        // =========================
        // MÉTODOS PRIVADOS
        // =========================

        private Producto ConstruirProductoParaGuardar(
            string? nombreOriginal,
            string? categoriaOriginal,
            string? marcaOriginal,
            string? descripcionOriginal)
        {
            var nombre = LimpiarTexto(nombreOriginal);
            var categoria = LimpiarTexto(categoriaOriginal);
            var marca = LimpiarTexto(marcaOriginal);
            var descripcion = LimpiarDescripcion(descripcionOriginal);

            ValidarCamposObligatorios(nombre, categoria, marca);
            ValidarLongitudes(nombre, categoria, marca, descripcion);
            ValidarContenidoSemantico(nombre, categoria, marca);

            return new Producto
            {
                Nombre = nombre,
                Categoria = categoria,
                Marca = marca,
                Descripcion = descripcion
            };
        }

        private ProductoListarDTO MapearProductoListarDTO(Producto producto)
        {
            return new ProductoListarDTO
            {
                IdProducto = producto.IdProducto,
                Nombre = producto.Nombre,
                Categoria = producto.Categoria,
                Marca = producto.Marca,
                Descripcion = producto.Descripcion,
                Activo = producto.Activo,
                FechaCreacion = producto.FechaCreacion,
                FechaModificacion = producto.FechaModificacion
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

        private string? LimpiarDescripcion(string? descripcion)
        {
            if (string.IsNullOrWhiteSpace(descripcion))
                return null;

            return descripcion.Trim();
        }

        private void ValidarCamposObligatorios(string nombre, string categoria, string marca)
        {
            if (string.IsNullOrWhiteSpace(nombre))
                throw new ReglaNegocio("El nombre del producto es obligatorio.", HttpStatusCode.BadRequest);

            if (string.IsNullOrWhiteSpace(categoria))
                throw new ReglaNegocio("La categoría del producto es obligatoria.", HttpStatusCode.BadRequest);

            if (string.IsNullOrWhiteSpace(marca))
                throw new ReglaNegocio("La marca del producto es obligatoria.", HttpStatusCode.BadRequest);
        }

        private void ValidarLongitudes(string nombre, string categoria, string marca, string? descripcion)
        {
            if (nombre.Length < 3 || nombre.Length > 150)
                throw new ReglaNegocio("El nombre del producto debe tener entre 3 y 150 caracteres.", HttpStatusCode.BadRequest);

            if (categoria.Length < 3 || categoria.Length > 100)
                throw new ReglaNegocio("La categoría del producto debe tener entre 3 y 100 caracteres.", HttpStatusCode.BadRequest);

            if (marca.Length < 2 || marca.Length > 100)
                throw new ReglaNegocio("La marca del producto debe tener entre 2 y 100 caracteres.", HttpStatusCode.BadRequest);

            if (!string.IsNullOrWhiteSpace(descripcion) && descripcion.Length > 300)
                throw new ReglaNegocio("La descripción no puede superar los 300 caracteres.", HttpStatusCode.BadRequest);
        }

        private void ValidarContenidoSemantico(string nombre, string categoria, string marca)
        {
            if (EsSoloNumeros(nombre))
                throw new ReglaNegocio("El nombre del producto no puede contener solo números.", HttpStatusCode.BadRequest);

            if (EsSoloNumeros(categoria))
                throw new ReglaNegocio("La categoría del producto no puede contener solo números.", HttpStatusCode.BadRequest);

            if (EsSoloNumeros(marca))
                throw new ReglaNegocio("La marca del producto no puede contener solo números.", HttpStatusCode.BadRequest);
        }

        private bool EsSoloNumeros(string valor)
        {
            return valor.All(char.IsDigit);
        }
    }
}