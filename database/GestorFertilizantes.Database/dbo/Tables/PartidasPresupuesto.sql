CREATE TABLE dbo.PartidasPresupuesto
(
    IdPartidaPresupuesto bigint IDENTITY(1,1) NOT NULL CONSTRAINT PK_PartidasPresupuesto PRIMARY KEY,
    IdPresupuesto bigint NOT NULL,
    IdRubroPresupuesto int NOT NULL,
    MontoInicial decimal(18,4) NOT NULL,
    CONSTRAINT UQ_PartidasPresupuesto_Rubro UNIQUE (IdPresupuesto, IdRubroPresupuesto),
    CONSTRAINT CK_PartidasPresupuesto_Monto CHECK (MontoInicial > 0),
    CONSTRAINT FK_PartidasPresupuesto_Presupuesto FOREIGN KEY (IdPresupuesto) REFERENCES dbo.Presupuestos(IdPresupuesto),
    CONSTRAINT FK_PartidasPresupuesto_Rubro FOREIGN KEY (IdRubroPresupuesto) REFERENCES dbo.RubrosPresupuesto(IdRubroPresupuesto)
);
