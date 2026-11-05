using System.ComponentModel.DataAnnotations;

namespace Control_Fertilizantes_Backend.Comun.Validacion;

// Evita conversiones o redondeos silenciosos antes de entrar al procedimiento.
[AttributeUsage(AttributeTargets.Property | AttributeTargets.Parameter)]
public sealed class DecimalSqlAttribute : ValidationAttribute
{
    public int Precision { get; }
    public int Escala { get; }
    private readonly decimal limite;

    public DecimalSqlAttribute(int precision, int escala)
    {
        if (precision is < 1 or > 28 || escala < 0 || escala >= precision)
            throw new ArgumentOutOfRangeException(nameof(precision));
        Precision = precision;
        Escala = escala;
        limite = 1m;
        for (var i = 0; i < precision - escala; i++) limite *= 10m;
    }

    public override bool IsValid(object? value) => value is decimal numero &&
        numero > 0m && numero < limite && decimal.Round(numero, Escala) == numero;

    public override string FormatErrorMessage(string name) =>
        $"{name} debe ser mayor que cero, menor que {limite} y tener como máximo {Escala} decimales.";
}
