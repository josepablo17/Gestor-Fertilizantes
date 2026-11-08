using System.Text.Json;
using Control_Fertilizantes_Backend.Comun.Errores;
using Control_Fertilizantes_Backend.Comun.Validacion;
using Control_Fertilizantes_Backend.Modulos.Presupuestos.DTOs.Entradas;

namespace GestorFertilizantes.Backend.Tests;

public class PresupuestosEdicionPruebas
{
    [Theory]
    [InlineData("0", true)]
    [InlineData("525.0001", true)]
    [InlineData("-1", false)]
    [InlineData("525.00001", false)]
    [InlineData("100000000000000", false)]
    public void Nuevo_monto_admite_cero_y_conserva_la_precision_del_presupuesto(string valor, bool valido)
    {
        var datos = JsonSerializer.Deserialize<EstablecerMontoPartidaDTO>(
            "{\"motivo\":\"Plan revisado\",\"nuevoMonto\":\"" + valor + "\",\"montoAprobadoEsperado\":500}", new JsonSerializerOptions(JsonSerializerDefaults.Web));
        Assert.NotNull(datos);
        if (valido) ValidacionCatalogo.Validar(datos);
        else Assert.Throws<ReglaNegocio>(() => ValidacionCatalogo.Validar(datos));
    }

    [Theory]
    [InlineData("{\"motivo\":\"Plan revisado\",\"montoAprobadoEsperado\":500}")]
    [InlineData("{\"motivo\":\"Plan revisado\",\"nuevoMonto\":0}")]
    public void Monto_omitido_no_se_interpreta_como_reducir_a_cero(string json)
    {
        var datos = JsonSerializer.Deserialize<EstablecerMontoPartidaDTO>(json, new JsonSerializerOptions(JsonSerializerDefaults.Web));
        Assert.Throws<ReglaNegocio>(() => ValidacionCatalogo.Validar(datos));
    }

    [Fact]
    public void Edicion_no_redondea_el_importe_json_antes_de_validarlo()
    {
        Assert.Throws<JsonException>(() => JsonSerializer.Deserialize<PartidaBorradorDTO>(
            "{\"idRubroPresupuesto\":1,\"monto\":1.00000000000000000000000000001}", new JsonSerializerOptions(JsonSerializerDefaults.Web)));
    }
}
