CREATE TABLE dbo.MovimientosPresupuesto
(
    IdMovimientoPresupuesto bigint IDENTITY(1,1) NOT NULL CONSTRAINT PK_MovimientosPresupuesto PRIMARY KEY,
    IdOperacion uniqueidentifier NOT NULL,
    IdPartidaPresupuesto bigint NOT NULL,
    Tipo varchar(16) NOT NULL,
    CambioAprobado decimal(18,4) NOT NULL,
    CambioComprometido decimal(18,4) NOT NULL,
    CambioEjecutado decimal(18,4) NOT NULL,
    IdCompromisoDetalle bigint NULL,
    IdCompra bigint NULL,
    IdMovimientoRevertido bigint NULL,
    MotivoExceso nvarchar(500) NULL,
    CONSTRAINT CK_MovimientosPresupuesto_Importes CHECK
    (
        (Tipo = 'Aprobacion' AND CambioAprobado > 0 AND CambioComprometido = 0 AND CambioEjecutado = 0
            AND IdCompromisoDetalle IS NULL AND IdCompra IS NULL AND IdMovimientoRevertido IS NULL)
        OR (Tipo = 'Ajuste' AND CambioAprobado <> 0 AND CambioComprometido = 0 AND CambioEjecutado = 0
            AND IdCompromisoDetalle IS NULL AND IdCompra IS NULL AND IdMovimientoRevertido IS NULL)
        OR (Tipo = 'Reserva' AND CambioAprobado = 0 AND CambioComprometido > 0 AND CambioEjecutado = 0
            AND IdCompromisoDetalle IS NOT NULL AND IdCompra IS NULL AND IdMovimientoRevertido IS NULL)
        OR (Tipo = 'Liberacion' AND CambioAprobado = 0 AND CambioComprometido < 0 AND CambioEjecutado = 0
            AND IdCompromisoDetalle IS NOT NULL AND IdCompra IS NULL AND IdMovimientoRevertido IS NULL)
        OR (Tipo = 'Compra' AND CambioAprobado = 0 AND CambioEjecutado > 0
            AND CambioComprometido >= -CambioEjecutado AND CambioComprometido <= 0 AND (IdCompromisoDetalle IS NOT NULL OR CambioComprometido = 0)
            AND IdCompra IS NOT NULL AND IdMovimientoRevertido IS NULL)
        OR (Tipo = 'ReversionCompra' AND CambioAprobado = 0 AND CambioEjecutado < 0
            AND CambioComprometido >= 0 AND CambioComprometido <= -CambioEjecutado AND (IdCompromisoDetalle IS NOT NULL OR CambioComprometido = 0)
            AND IdCompra IS NOT NULL AND IdMovimientoRevertido IS NOT NULL)
    ),
    CONSTRAINT CK_MovimientosPresupuesto_MotivoExceso CHECK (MotivoExceso IS NULL OR (Tipo = 'Compra' AND LEN(TRIM(MotivoExceso)) > 0)),
    CONSTRAINT FK_MovimientosPresupuesto_Operacion FOREIGN KEY (IdOperacion) REFERENCES dbo.OperacionesPresupuesto(IdOperacion),
    CONSTRAINT FK_MovimientosPresupuesto_Partida FOREIGN KEY (IdPartidaPresupuesto) REFERENCES dbo.PartidasPresupuesto(IdPartidaPresupuesto),
    CONSTRAINT FK_MovimientosPresupuesto_Compromiso FOREIGN KEY (IdCompromisoDetalle, IdPartidaPresupuesto)
        REFERENCES dbo.CompromisosCompraDetalle(IdCompromisoDetalle, IdPartidaPresupuesto),
    CONSTRAINT FK_MovimientosPresupuesto_Compra FOREIGN KEY (IdCompra) REFERENCES dbo.Compras(IdCompra),
    CONSTRAINT FK_MovimientosPresupuesto_Reversion FOREIGN KEY (IdMovimientoRevertido) REFERENCES dbo.MovimientosPresupuesto(IdMovimientoPresupuesto)
);
GO

CREATE INDEX IX_MovimientosPresupuesto_Partida ON dbo.MovimientosPresupuesto(IdPartidaPresupuesto, IdMovimientoPresupuesto)
    INCLUDE (CambioAprobado, CambioComprometido, CambioEjecutado);
GO
CREATE INDEX IX_MovimientosPresupuesto_Compromiso ON dbo.MovimientosPresupuesto(IdCompromisoDetalle)
    INCLUDE (CambioComprometido, CambioEjecutado) WHERE IdCompromisoDetalle IS NOT NULL;
GO
CREATE INDEX IX_MovimientosPresupuesto_Compra ON dbo.MovimientosPresupuesto(IdCompra, Tipo) WHERE IdCompra IS NOT NULL;
GO
CREATE UNIQUE INDEX UX_MovimientosPresupuesto_Reversion ON dbo.MovimientosPresupuesto(IdMovimientoRevertido)
    WHERE IdMovimientoRevertido IS NOT NULL;
GO

CREATE TRIGGER dbo.TR_MovimientosPresupuesto_Inmutable ON dbo.MovimientosPresupuesto
AFTER UPDATE, DELETE
AS
BEGIN
    SET NOCOUNT ON;
    IF EXISTS (SELECT 1 FROM deleted)
        THROW 52010, N'El movimiento presupuestario es inmutable. Registre una reversión.', 1;
END;
