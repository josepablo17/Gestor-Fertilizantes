using System.ComponentModel.DataAnnotations;
using System.Net;
using System.Text.Json;
using Control_Fertilizantes_Backend.Comun.Errores;
using Control_Fertilizantes_Backend.Comun.Validacion;
using Control_Fertilizantes_Backend.Modulos.Catalogos.Productos.DTOs.Entradas;
using Control_Fertilizantes_Backend.Modulos.Catalogos.Presentaciones.DTOs.Entradas;
using Control_Fertilizantes_Backend.Modulos.Catalogos.Proveedores.DTOs.Entradas;
using Control_Fertilizantes_Backend.Modulos.Catalogos.UnidadesMedida.DTOs.Entradas;

namespace GestorFertilizantes.Backend.Tests;

public class CatalogosValidacionPruebas
{
    [Theory]
    [InlineData("1.00000000000000000000000000001")]
    [InlineData("0.00000000000000000000000000001")]
    [InlineData("1e100")]
    [InlineData("1e-100")]
    public void Token_json_no_se_redondea_antes_de_validar(string numero)
    {
        var json = "{\"idProducto\":1,\"descripcion\":\"Saco\",\"idUnidadMedida\":1,\"cantidad\":" + numero + "}";
        Assert.Throws<JsonException>(() => JsonSerializer.Deserialize<PresentacionProductoCrearDTO>(json, new JsonSerializerOptions(JsonSerializerDefaults.Web)));
    }

    [Theory]
    [InlineData("2.5e1", "25")]
    [InlineData("25000e-3", "25")]
    [InlineData("25.0000000000000000000000000000000000000", "25")]
    [InlineData("99999999999999.9999", "99999999999999.9999")]
    public void Token_json_exacto_conserva_exponente_y_ceros_finales(string numero, string esperado)
    {
        var json = "{\"idProducto\":1,\"descripcion\":\"Saco\",\"idUnidadMedida\":1,\"cantidad\":" + numero + "}";
        var entrada = JsonSerializer.Deserialize<PresentacionProductoCrearDTO>(json, new JsonSerializerOptions(JsonSerializerDefaults.Web));
        Assert.NotNull(entrada);
        Assert.Equal(decimal.Parse(esperado, System.Globalization.CultureInfo.InvariantCulture), entrada.Cantidad);
        ValidacionCatalogo.Validar(entrada);
    }

    [Theory]
    [InlineData(4, "0.0001", true)]
    [InlineData(4, "99999999999999.9999", true)]
    [InlineData(4, "100000000000000", false)]
    [InlineData(4, "1.00001", false)]
    [InlineData(4, "0", false)]
    [InlineData(4, "-1", false)]
    [InlineData(6, "0.000001", true)]
    [InlineData(6, "0.0000001", false)]
    [InlineData(6, "999999999999.999999", true)]
    [InlineData(6, "1000000000000", false)]
    [InlineData(6, "1.0000000", true)]
    [InlineData(6, "79228162514264337593543950335", false)]
    public void Cantidades_no_pierden_precision_al_enviarse_a_sql(int escala, string texto, bool valido)
    {
        var numero = decimal.Parse(texto, System.Globalization.CultureInfo.InvariantCulture);
        Assert.Equal(valido, new DecimalSqlAttribute(18, escala).IsValid(numero));
    }

    [Fact]
    public void Producto_requiere_base_y_no_exige_marca_ni_categoria()
    {
        Assert.Throws<ReglaNegocio>(() => ValidacionCatalogo.Validar(new ProductoCrearDTO { Nombre = "MAP" }));
        ValidacionCatalogo.Validar(new ProductoCrearDTO { Nombre = "MAP", IdProductoBase = 1 });
    }

    [Fact]
    public void Descripcion_de_producto_no_se_trunca_al_tamano_sql()
    {
        var entrada = new ProductoCrearDTO { Nombre = "MAP", IdProductoBase = 1, Descripcion = new string('x', 251) };
        var error = Assert.Throws<ReglaNegocio>(() => ValidacionCatalogo.Validar(entrada));
        Assert.Equal(HttpStatusCode.BadRequest, error.StatusCode);
    }

    [Theory]
    [InlineData("{\"nombre\":\"MAP\",\"idProductoBase\":1,\"marca\":\"Texto antiguo\"}")]
    [InlineData("{\"nombre\":\"MAP\",\"idProductoBase\":1,\"comparabilidadRevisada\":true}")]
    public void Producto_rechaza_propiedades_que_no_pertenecen_a_la_operacion(string json) =>
        Assert.Throws<JsonException>(() => JsonSerializer.Deserialize<ProductoCrearDTO>(json, new JsonSerializerOptions(JsonSerializerDefaults.Web)));

    [Fact]
    public void Cantidad_normalizada_solo_es_salida()
    {
        const string json = "{\"idProducto\":1,\"descripcion\":\"Saco\",\"cantidad\":25,\"idUnidadMedida\":1,\"cantidadNormalizada\":500}";
        Assert.Throws<JsonException>(() => JsonSerializer.Deserialize<PresentacionProductoCrearDTO>(json, new JsonSerializerOptions(JsonSerializerDefaults.Web)));
        ValidacionCatalogo.Validar(new PresentacionProductoCrearDTO { IdProducto = 1, Descripcion = "Saco", Cantidad = 25m, IdUnidadMedida = 1 });
    }

    [Theory]
    [InlineData("PESO", "1", true, true)]
    [InlineData("volumen", "1", true, true)]
    [InlineData("UNIDAD", "0.001", false, true)]
    [InlineData("OTRA", "1", false, false)]
    [InlineData("PESO", "0.001", true, false)]
    public void Dimension_y_factor_base_se_validan_juntos(string dimension, string factor, bool esBase, bool valido)
    {
        var entrada = new UnidadMedidaCrearDTO
        {
            Codigo = "PR", Nombre = "Prueba", TipoBase = dimension, EsUnidadBase = esBase,
            FactorConversion = decimal.Parse(factor, System.Globalization.CultureInfo.InvariantCulture)
        };
        Assert.Equal(valido, Validator.TryValidateObject(entrada, new ValidationContext(entrada), [], true));
    }

    [Theory]
    [InlineData(null, null, null, true)]
    [InlineData("Juridica", "123", "CR", true)]
    [InlineData(null, "123", "CR", false)]
    [InlineData("Juridica", null, "CR", false)]
    [InlineData("Juridica", "123", null, false)]
    [InlineData("Juridica", "123", "cr", false)]
    [InlineData("Juridica", "123", "CRI", false)]
    public void Identidad_fiscal_es_opcional_o_completa(string? tipo, string? numero, string? pais, bool valido)
    {
        var entrada = new ProveedorCrearDTO { Nombre = "Proveedor", TipoIdentificacion = tipo, IdentificacionFiscal = numero, PaisIdentificacion = pais };
        Assert.Equal(valido, Validator.TryValidateObject(entrada, new ValidationContext(entrada), [], true));
    }
}
