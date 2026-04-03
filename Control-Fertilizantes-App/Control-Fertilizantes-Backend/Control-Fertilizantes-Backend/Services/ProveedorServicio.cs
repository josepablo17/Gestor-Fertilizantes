using System.Net;
using Control_Fertilizantes_Backend.DTOs;
using Control_Fertilizantes_Backend.Entities;
using Control_Fertilizantes_Backend.Exceptions;
using Control_Fertilizantes_Backend.Interfaces;

namespace Control_Fertilizantes_Backend.Services
{
    public class ProveedorServicio : IProveedorServicio
    {
        private readonly IProveedorRepositorio _proveedorRepositorio;

        public ProveedorServicio(IProveedorRepositorio proveedorRepositorio)
        {
            _proveedorRepositorio = proveedorRepositorio;
        }

        public async Task<IEnumerable<ProveedorListarDTO>> ListarAsync()
        {
            var proveedores = await _proveedorRepositorio.ListarAsync();

            return proveedores.Select(MapearProveedorListarDTO);
        }

        public async Task<ProveedorListarDTO> ObtenerPorIdAsync(int idProveedor)
        {
            ValidarId(idProveedor, "El id del proveedor no es válido.");

            var proveedor = await _proveedorRepositorio.ObtenerPorIdAsync(idProveedor);

            if (proveedor == null)
                return null;

            return MapearProveedorListarDTO(proveedor);
        }

        public async Task<int> InsertarAsync(ProveedorCrearDTO dto)
        {
            if (dto == null)
                throw new ReglaNegocio("Los datos del proveedor son obligatorios.", HttpStatusCode.BadRequest);

            var proveedor = ConstruirProveedorParaGuardar(
                dto.Nombre,
                dto.Contacto,
                dto.Telefono,
                dto.Correo,
                dto.EsProveedorAutorizado
            );

            return await _proveedorRepositorio.InsertarAsync(proveedor);
        }

        public async Task<bool> ActualizarAsync(ProveedorActualizarDTO dto)
        {
            if (dto == null)
                throw new ReglaNegocio("Los datos del proveedor son obligatorios.", HttpStatusCode.BadRequest);

            ValidarId(dto.IdProveedor, "El id del proveedor no es válido.");

            var proveedorExistente = await _proveedorRepositorio.ObtenerPorIdAsync(dto.IdProveedor);

            if (proveedorExistente == null)
                throw new ReglaNegocio("El proveedor que intenta actualizar no existe.", HttpStatusCode.NotFound);

            if (!proveedorExistente.Activo)
                throw new ReglaNegocio("No se puede actualizar un proveedor inactivo.", HttpStatusCode.Conflict);

            var proveedor = ConstruirProveedorParaGuardar(
                dto.Nombre,
                dto.Contacto,
                dto.Telefono,
                dto.Correo,
                dto.EsProveedorAutorizado
            );

            proveedor.IdProveedor = dto.IdProveedor;

            return await _proveedorRepositorio.ActualizarAsync(proveedor);
        }

        public async Task<bool> DesactivarAsync(int idProveedor)
        {
            ValidarId(idProveedor, "El id del proveedor no es válido.");

            var proveedorExistente = await _proveedorRepositorio.ObtenerPorIdAsync(idProveedor);

            if (proveedorExistente == null)
                throw new ReglaNegocio("El proveedor que intenta desactivar no existe.", HttpStatusCode.NotFound);

            if (!proveedorExistente.Activo)
                throw new ReglaNegocio("El proveedor ya se encuentra inactivo.", HttpStatusCode.Conflict);

            return await _proveedorRepositorio.DesactivarAsync(idProveedor);
        }

        // =========================
        // MÉTODOS PRIVADOS
        // =========================

        private Proveedor ConstruirProveedorParaGuardar(
            string? nombreOriginal,
            string? contactoOriginal,
            string? telefonoOriginal,
            string? correoOriginal,
            bool esProveedorAutorizado)
        {
            var nombre = LimpiarTexto(nombreOriginal);
            var contacto = LimpiarNullable(contactoOriginal);
            var telefono = LimpiarNullable(telefonoOriginal);
            var correo = LimpiarNullable(correoOriginal);

            ValidarCamposObligatorios(nombre);
            ValidarLongitudes(nombre, contacto, telefono, correo);
            ValidarContenidoSemantico(nombre);
            ValidarFormatoCorreo(correo);
            ValidarFormatoTelefono(telefono);

            return new Proveedor
            {
                Nombre = nombre,
                Contacto = contacto,
                Telefono = telefono,
                Correo = correo,
                EsProveedorAutorizado = esProveedorAutorizado
            };
        }

        private ProveedorListarDTO MapearProveedorListarDTO(Proveedor proveedor)
        {
            return new ProveedorListarDTO
            {
                IdProveedor = proveedor.IdProveedor,
                Nombre = proveedor.Nombre,
                Contacto = proveedor.Contacto,
                Telefono = proveedor.Telefono,
                Correo = proveedor.Correo,
                EsProveedorAutorizado = proveedor.EsProveedorAutorizado,
                Activo = proveedor.Activo,
                FechaCreacion = proveedor.FechaCreacion,
                FechaModificacion = proveedor.FechaModificacion
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

        private string? LimpiarNullable(string? valor)
        {
            if (string.IsNullOrWhiteSpace(valor))
                return null;

            return valor.Trim();
        }

        private void ValidarCamposObligatorios(string nombre)
        {
            if (string.IsNullOrWhiteSpace(nombre))
                throw new ReglaNegocio("El nombre del proveedor es obligatorio.", HttpStatusCode.BadRequest);
        }

        private void ValidarLongitudes(string nombre, string? contacto, string? telefono, string? correo)
        {
            if (nombre.Length < 3 || nombre.Length > 150)
                throw new ReglaNegocio("El nombre del proveedor debe tener entre 3 y 150 caracteres.", HttpStatusCode.BadRequest);

            if (!string.IsNullOrWhiteSpace(contacto) && contacto.Length > 150)
                throw new ReglaNegocio("El contacto no puede superar los 150 caracteres.", HttpStatusCode.BadRequest);

            if (!string.IsNullOrWhiteSpace(telefono) && telefono.Length > 50)
                throw new ReglaNegocio("El teléfono no puede superar los 50 caracteres.", HttpStatusCode.BadRequest);

            if (!string.IsNullOrWhiteSpace(correo) && correo.Length > 150)
                throw new ReglaNegocio("El correo no puede superar los 150 caracteres.", HttpStatusCode.BadRequest);
        }

        private void ValidarContenidoSemantico(string nombre)
        {
            if (EsSoloNumeros(nombre))
                throw new ReglaNegocio("El nombre del proveedor no puede contener solo números.", HttpStatusCode.BadRequest);
        }

        private void ValidarFormatoCorreo(string? correo)
        {
            if (string.IsNullOrWhiteSpace(correo))
                return;

            if (correo.Contains(' ') || !correo.Contains('@') || !correo.Contains('.'))
                throw new ReglaNegocio("El correo del proveedor no tiene un formato válido.", HttpStatusCode.BadRequest);
        }

        private void ValidarFormatoTelefono(string? telefono)
        {
            if (string.IsNullOrWhiteSpace(telefono))
                return;

            var caracteresPermitidos = telefono.All(c =>
                char.IsDigit(c) || c == '+' || c == '-' || c == ' ' || c == '(' || c == ')');

            if (!caracteresPermitidos)
                throw new ReglaNegocio("El teléfono del proveedor contiene caracteres no válidos.", HttpStatusCode.BadRequest);
        }

        private bool EsSoloNumeros(string valor)
        {
            return valor.All(char.IsDigit);
        }
    }
}