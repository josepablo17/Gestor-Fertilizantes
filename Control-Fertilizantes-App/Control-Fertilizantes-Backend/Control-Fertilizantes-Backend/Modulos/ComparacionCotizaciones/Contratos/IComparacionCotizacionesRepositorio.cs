using Control_Fertilizantes_Backend.Modulos.ComparacionCotizaciones.Modelos;

namespace Control_Fertilizantes_Backend.Modulos.ComparacionCotizaciones.Contratos;

public interface IComparacionCotizacionesRepositorio
{
    Task<IReadOnlyList<ComparacionFila>> CompararAsync(CriterioComparacion criterio, CancellationToken cancelacion);
}
