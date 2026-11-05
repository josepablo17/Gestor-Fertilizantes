using System.Globalization;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Text.RegularExpressions;

namespace Control_Fertilizantes_Backend.Comun.Validacion;

// Comprueba el token antes de que decimal pueda redondearlo. Los atributos de
// cada entrada aplican despues el rango/escala concreto (18,4 o 18,6).
public sealed class DecimalCatalogoJsonConverter : JsonConverter<decimal>
{
    public override decimal Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        if (reader.TokenType is not (JsonTokenType.Number or JsonTokenType.String))
            throw new JsonException("La cantidad o factor debe ser un número decimal.");
        using var documento = JsonDocument.ParseValue(ref reader);
        var texto = (documento.RootElement.ValueKind == JsonValueKind.String
            ? documento.RootElement.GetString() : documento.RootElement.GetRawText())?.Trim();
        if (texto is null || texto.Length > 128) throw new JsonException("Número fuera de rango.");
        var partes = Regex.Match(texto, @"^[+-]?([0-9]+)(?:\.([0-9]+))?(?:[eE]([+-]?[0-9]+))?$");
        var exponente = 0;
        if (!partes.Success || (partes.Groups[3].Success &&
            !int.TryParse(partes.Groups[3].Value, NumberStyles.AllowLeadingSign, CultureInfo.InvariantCulture, out exponente)))
            throw new JsonException("Número decimal inválido.");
        var digitos = (partes.Groups[1].Value + partes.Groups[2].Value).TrimStart('0');
        var significativos = digitos.TrimEnd('0');
        var escala = (long)partes.Groups[2].Length - exponente - (digitos.Length - significativos.Length);
        if (significativos.Length > 18 || escala > 6 || significativos.Length - escala > 18 ||
            !decimal.TryParse(texto, NumberStyles.Float, CultureInfo.InvariantCulture, out var numero))
            throw new JsonException("El número excede la precisión o el rango admitidos.");
        return numero;
    }

    public override void Write(Utf8JsonWriter writer, decimal value, JsonSerializerOptions options) => writer.WriteNumberValue(value);
}
