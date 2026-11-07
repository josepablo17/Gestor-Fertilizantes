CREATE TABLE dbo.CompromisosCompra
(
    IdCompromisoCompra bigint IDENTITY(1,1) NOT NULL CONSTRAINT PK_CompromisosCompra PRIMARY KEY,
    IdSolicitudCotizacion bigint NULL,
    FechaCompromiso date NOT NULL,
    Moneda char(3) NOT NULL,
    Estado varchar(12) NOT NULL CONSTRAINT DF_CompromisosCompra_Estado DEFAULT ('Abierto'),
    IdOperacionCreacion uniqueidentifier NOT NULL,
    IdOperacionCierre uniqueidentifier NULL,
    CONSTRAINT CK_CompromisosCompra_Moneda CHECK (Moneda = 'CRC' OR Moneda = 'USD'),
    CONSTRAINT CK_CompromisosCompra_Estado CHECK
        ((Estado = 'Abierto' AND IdOperacionCierre IS NULL) OR ((Estado = 'Cerrado' OR Estado = 'Cancelado') AND IdOperacionCierre IS NOT NULL)),
    CONSTRAINT FK_CompromisosCompra_Solicitud FOREIGN KEY (IdSolicitudCotizacion) REFERENCES dbo.SolicitudesCotizacion(IdSolicitudCotizacion),
    CONSTRAINT FK_CompromisosCompra_Creacion FOREIGN KEY (IdOperacionCreacion) REFERENCES dbo.OperacionesPresupuesto(IdOperacion),
    CONSTRAINT FK_CompromisosCompra_Cierre FOREIGN KEY (IdOperacionCierre) REFERENCES dbo.OperacionesPresupuesto(IdOperacion)
);
GO

CREATE INDEX IX_CompromisosCompra_Solicitud ON dbo.CompromisosCompra(IdSolicitudCotizacion) WHERE IdSolicitudCotizacion IS NOT NULL;
