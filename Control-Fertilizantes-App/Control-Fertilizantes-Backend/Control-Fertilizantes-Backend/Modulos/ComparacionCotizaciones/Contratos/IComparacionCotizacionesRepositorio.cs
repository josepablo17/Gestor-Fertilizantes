using Control_Fertilizantes_Backend.Modulos.ComparacionCotizaciones.Modelos;

namespace Control_Fertilizantes_Backend.Modulos.ComparacionCotizaciones.Contratos;

public interface IComparacionCotizacionesRepositorio
{
    Task<(IReadOnlyList<ComparacionFila> Ofertas, IReadOnlyList<ReferenciaCompraFila> Referencias)> CompararAsync(
        CriterioComparacion criterio, CancellationToken cancelacion);
}
