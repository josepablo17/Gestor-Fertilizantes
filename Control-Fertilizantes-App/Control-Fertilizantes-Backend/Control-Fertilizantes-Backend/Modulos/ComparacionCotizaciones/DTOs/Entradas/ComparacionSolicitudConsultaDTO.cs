using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Mvc;

namespace Control_Fertilizantes_Backend.Modulos.ComparacionCotizaciones.DTOs.Entradas;

public sealed class ComparacionSolicitudConsultaDTO
{
    [FromQuery(Name = "moneda")]
    [Required(ErrorMessage = "Indique la moneda.")]
    [RegularExpression("^[A-Z]{3}$", ErrorMessage = "Use un código de moneda de tres letras mayúsculas.")]
    public string Moneda { get; init; } = "";

    [FromQuery(Name = "baseTotalLinea")]
    [Required(ErrorMessage = "Indique la base del importe de línea.")]
    [RegularExpression("^(Bruto|NetoSinImpuestos|ConImpuestos)$", ErrorMessage = "Use Bruto, NetoSinImpuestos o ConImpuestos.")]
    public string BaseTotalLinea { get; init; } = "";

    [FromQuery(Name = "fechaReferencia")]
    [Required(ErrorMessage = "Indique la fecha de referencia.")]
    [RegularExpression("^[0-9]{4}-[0-9]{2}-[0-9]{2}$", ErrorMessage = "Use una fecha con formato AAAA-MM-DD.")]
    public string FechaReferencia { get; init; } = "";

    [FromQuery(Name = "incluirAlternativas")]
    public bool IncluirAlternativas { get; init; } = true;

    [FromQuery(Name = "idSolicitudCotizacionDetalle")]
    public long? IdSolicitudCotizacionDetalle { get; init; }

    [FromQuery(Name = "tipoBase")]
    [RegularExpression("^(PESO|VOLUMEN|UNIDAD)$", ErrorMessage = "Use PESO, VOLUMEN o UNIDAD.")]
    public string? TipoBase { get; init; }
}
