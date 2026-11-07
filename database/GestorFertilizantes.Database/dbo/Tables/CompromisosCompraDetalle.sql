CREATE TABLE dbo.CompromisosCompraDetalle
(
    IdCompromisoDetalle bigint IDENTITY(1,1) NOT NULL CONSTRAINT PK_CompromisosCompraDetalle PRIMARY KEY,
    IdCompromisoCompra bigint NOT NULL,
    IdPartidaPresupuesto bigint NOT NULL,
    IdProformaProveedorDetalle int NULL,
    MontoReservado decimal(18,4) NOT NULL,
    CONSTRAINT UQ_CompromisosCompraDetalle_Partida UNIQUE (IdCompromisoDetalle, IdPartidaPresupuesto),
    CONSTRAINT CK_CompromisosCompraDetalle_Monto CHECK (MontoReservado > 0),
    CONSTRAINT FK_CompromisosCompraDetalle_Compromiso FOREIGN KEY (IdCompromisoCompra) REFERENCES dbo.CompromisosCompra(IdCompromisoCompra),
    CONSTRAINT FK_CompromisosCompraDetalle_Partida FOREIGN KEY (IdPartidaPresupuesto) REFERENCES dbo.PartidasPresupuesto(IdPartidaPresupuesto),
    CONSTRAINT FK_CompromisosCompraDetalle_Oferta FOREIGN KEY (IdProformaProveedorDetalle) REFERENCES dbo.ProformasProveedorDetalle(IdProformaProveedorDetalle)
);
GO

CREATE INDEX IX_CompromisosCompraDetalle_Compromiso ON dbo.CompromisosCompraDetalle(IdCompromisoCompra);
