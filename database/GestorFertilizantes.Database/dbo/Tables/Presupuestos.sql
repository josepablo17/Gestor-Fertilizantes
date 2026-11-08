CREATE TABLE dbo.Presupuestos
(
    IdPresupuesto bigint IDENTITY(1,1) NOT NULL CONSTRAINT PK_Presupuestos PRIMARY KEY,
    Nombre nvarchar(150) NOT NULL,
    IdFinca int NULL,
    FechaInicio date NOT NULL,
    FechaFin date NOT NULL,
    Moneda char(3) NOT NULL,
    Estado varchar(12) NOT NULL CONSTRAINT DF_Presupuestos_Estado DEFAULT ('Borrador'),
    IdOperacionCreacion uniqueidentifier NOT NULL,
    IdOperacionEdicion uniqueidentifier NULL,
    IdOperacionAprobacion uniqueidentifier NULL,
    IdOperacionCierre uniqueidentifier NULL,
    CONSTRAINT CK_Presupuestos_Datos CHECK (LEN(TRIM(Nombre)) > 0 AND FechaFin >= FechaInicio
        AND (Moneda = 'CRC' OR Moneda = 'USD')),
    CONSTRAINT CK_Presupuestos_Estado CHECK
        ((Estado = 'Borrador' AND IdOperacionAprobacion IS NULL AND IdOperacionCierre IS NULL)
        OR (Estado = 'Aprobado' AND IdOperacionAprobacion IS NOT NULL AND IdOperacionCierre IS NULL)
        OR (Estado = 'Cerrado' AND IdOperacionAprobacion IS NOT NULL AND IdOperacionCierre IS NOT NULL)),
    CONSTRAINT FK_Presupuestos_Finca FOREIGN KEY (IdFinca) REFERENCES dbo.Fincas(IdFinca),
    CONSTRAINT FK_Presupuestos_Creacion FOREIGN KEY (IdOperacionCreacion) REFERENCES dbo.OperacionesPresupuesto(IdOperacion),
    CONSTRAINT FK_Presupuestos_Edicion FOREIGN KEY (IdOperacionEdicion) REFERENCES dbo.OperacionesPresupuesto(IdOperacion),
    CONSTRAINT FK_Presupuestos_Aprobacion FOREIGN KEY (IdOperacionAprobacion) REFERENCES dbo.OperacionesPresupuesto(IdOperacion),
    CONSTRAINT FK_Presupuestos_Cierre FOREIGN KEY (IdOperacionCierre) REFERENCES dbo.OperacionesPresupuesto(IdOperacion)
);
GO

CREATE INDEX IX_Presupuestos_AlcancePeriodo ON dbo.Presupuestos(IdFinca, Moneda, Estado, FechaInicio, FechaFin);
