using System.ComponentModel.DataAnnotations;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace Control_Fertilizantes_Backend.Comun.Validacion;

[AttributeUsage(AttributeTargets.Property)]
public sealed class DecimalOfertaAttribute(int precision, int escala) : ValidationAttribute
{
    public bool Positivo { get; init; }

    public override bool IsValid(object? value)
    {
        if (value is null) return true;
        var limite = 1m;
        for (var i = 0; i < precision - escala; i++) limite *= 10m;
        return value is decimal numero && (Positivo ? numero > 0 : numero >= 0)
            && numero < limite && decimal.Round(numero, escala) == numero;
    }

    public override string FormatErrorMessage(string name) =>
        $"{name} está fuera del rango permitido o excede {escala} decimales.";
}

public sealed class DecimalOfertaJsonConverter : JsonConverter<decimal?>
{
    private static readonly DecimalCatalogoJsonConverter Conversor = new();

    public override decimal? Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options) =>
        reader.TokenType == JsonTokenType.Null ? null : Conversor.Read(ref reader, typeof(decimal), options);

    public override void Write(Utf8JsonWriter writer, decimal? value, JsonSerializerOptions options)
    {
        if (value is decimal numero) writer.WriteNumberValue(numero);
        else writer.WriteNullValue();
    }
}
