namespace Control_Fertilizantes_Backend.Comun.Paginacion;
public record PaginaRespuesta<T>(IReadOnlyList<T> Elementos, long TotalRegistros, int Pagina, int TamanoPagina);
