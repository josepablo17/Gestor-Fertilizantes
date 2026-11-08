using Control_Fertilizantes_Backend.Modulos.Compras.DTOs.Entradas;
using Control_Fertilizantes_Backend.Modulos.Compras.DTOs.Salidas;

namespace Control_Fertilizantes_Backend.Modulos.Compras.Contratos;

public interface ICompraDocumentoRepositorio
{
    Task<ComprasDocumentoPaginaDTO> Listar(string? busqueda, string? moneda, DateOnly? fecha, int pagina, int tamanoPagina, CancellationToken ct);
    Task<CompraDocumentoDTO> Obtener(long id, CancellationToken ct);
    Task<long> Registrar(CompraDocumentoCrearDTO datos, CancellationToken ct);
    Task ActualizarCabecera(long id, CompraCabeceraActualizarDTO datos, CancellationToken ct);
    Task ActualizarRenglon(long id, long idCompra, CompraRenglonActualizarDTO datos, CancellationToken ct);
}
