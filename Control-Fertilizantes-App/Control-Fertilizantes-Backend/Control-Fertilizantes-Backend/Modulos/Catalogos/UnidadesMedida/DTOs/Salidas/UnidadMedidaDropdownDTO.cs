namespace Control_Fertilizantes_Backend.Modulos.Catalogos.UnidadesMedida.DTOs.Salidas
{
    public class UnidadMedidaDropdownDTO
    {
        public int IdUnidadMedida { get; set; }
        public string? Nombre { get; set; }
        public required string Codigo { get; set; }
        public required string TipoBase { get; set; }
        public decimal FactorConversion { get; set; }
        public bool EsUnidadBase { get; set; }
    }
}
