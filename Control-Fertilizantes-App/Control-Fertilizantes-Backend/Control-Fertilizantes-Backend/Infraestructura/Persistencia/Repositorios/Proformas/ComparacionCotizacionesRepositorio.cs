using System.Data;
using Control_Fertilizantes_Backend.Modulos.ComparacionCotizaciones.Contratos;
using Control_Fertilizantes_Backend.Modulos.ComparacionCotizaciones.Modelos;
using Dapper;

namespace Control_Fertilizantes_Backend.Infraestructura.Persistencia.Repositorios.Proformas;

public sealed class ComparacionCotizacionesRepositorio(IConexionBD conexionBD) : IComparacionCotizacionesRepositorio
{
    public async Task<(IReadOnlyList<ComparacionFila> Ofertas, IReadOnlyList<ReferenciaCompraFila> Referencias)> CompararAsync(
        CriterioComparacion criterio, CancellationToken cancelacion)
    {
        var parametros = new DynamicParameters();
        parametros.Add("@IdSolicitudCotizacion", criterio.IdSolicitudCotizacion, DbType.Int64);
        parametros.Add("@Moneda", criterio.Moneda, DbType.AnsiString, size: 10);
        parametros.Add("@BaseTotalLinea", criterio.BaseTotalLinea, DbType.AnsiString, size: 30);
        parametros.Add("@FechaReferencia", criterio.FechaReferencia.ToDateTime(TimeOnly.MinValue), DbType.Date);
        parametros.Add("@IncluirAlternativas", criterio.IncluirAlternativas, DbType.Boolean);
        parametros.Add("@IdSolicitudCotizacionDetalle", criterio.IdSolicitudCotizacionDetalle, DbType.Int64);
        parametros.Add("@TipoBase", criterio.TipoBase, DbType.String, size: 20);
        parametros.Add("@IncluirReferenciaCompra", true, DbType.Boolean);

        using var conexion = conexionBD.ObtenerConexion();
        var comando = new CommandDefinition("dbo.usp_Cotizaciones_CompararSolicitud", parametros,
            commandType: CommandType.StoredProcedure, cancellationToken: cancelacion);
        using var resultados = await conexion.QueryMultipleAsync(comando);
        var ofertas = (await resultados.ReadAsync<ComparacionFila>()).AsList();
        var referencias = (await resultados.ReadAsync<ReferenciaCompraFila>()).AsList();
        return (ofertas, referencias);
    }
}
