namespace Control_Fertilizantes_Backend.Modulos.Documentos.DTOs.Salidas;
public record DocumentoRespuestaDTO(long IdDocumento, string Nombre, long TamanoBytes, string Sha256, string? VersionPlantilla, DateTimeOffset FechaRegistro);
