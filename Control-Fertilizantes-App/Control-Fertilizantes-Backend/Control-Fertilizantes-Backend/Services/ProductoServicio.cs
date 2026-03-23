using Control_Fertilizantes_Backend.DTOs;
using Control_Fertilizantes_Backend.Entities;
using Control_Fertilizantes_Backend.Interfaces;

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

            var resultado = productos.Select(p => new ProductoListarDTO
            {
                IdProducto = p.IdProducto,
                Nombre = p.Nombre,
                Categoria = p.Categoria,
                Marca = p.Marca,
                Descripcion = p.Descripcion,
                Activo = p.Activo,
                FechaCreacion = p.FechaCreacion,
                FechaModificacion = p.FechaModificacion
            });

            return resultado;
        }

        public async Task<ProductoListarDTO?> ObtenerPorIdAsync(int idProducto)
        {
            var producto = await _productoRepositorio.ObtenerPorIdAsync(idProducto);

            if (producto == null)
            {
                return null;
            }

            var resultado = new ProductoListarDTO
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

            return resultado;
        }

        public async Task<int> InsertarAsync(ProductoCrearDTO productoCrearDTO)
        {
            var producto = new Producto
            {
                Nombre = productoCrearDTO.Nombre,
                Categoria = productoCrearDTO.Categoria,
                Marca = productoCrearDTO.Marca,
                Descripcion = productoCrearDTO.Descripcion
            };

            var idProducto = await _productoRepositorio.InsertarAsync(producto);

            return idProducto;
        }

        public async Task<bool> ActualizarAsync(ProductoActualizarDTO productoActualizarDTO)
        {
            var producto = new Producto
            {
                IdProducto = productoActualizarDTO.IdProducto,
                Nombre = productoActualizarDTO.Nombre,
                Categoria = productoActualizarDTO.Categoria,
                Marca = productoActualizarDTO.Marca,
                Descripcion = productoActualizarDTO.Descripcion
            };

            var actualizado = await _productoRepositorio.ActualizarAsync(producto);

            return actualizado;
        }

        public async Task<bool> DesactivarAsync(int idProducto)
        {
            var desactivado = await _productoRepositorio.DesactivarAsync(idProducto);

            return desactivado;
        }
    }
}
