namespace Control_Fertilizantes_Backend.Modulos.Catalogos.UnidadesMedida.DTOs.Salidas
{
    public class UnidadMedidaListarDTO
    {
        public int IdUnidadMedida { get; set; }
        public required string Codigo { get; set; }
        public required string Nombre { get; set; }
        public required string TipoBase { get; set; }
        public decimal FactorConversion { get; set; }
        public bool EsUnidadBase { get; set; }
        public bool Activo { get; set; }
        public DateTime FechaCreacion { get; set; }
        public DateTime? FechaModificacion { get; set; }
    }
}
