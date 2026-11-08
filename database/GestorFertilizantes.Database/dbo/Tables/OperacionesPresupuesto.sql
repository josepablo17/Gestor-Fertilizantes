CREATE TABLE dbo.OperacionesPresupuesto
(
    IdOperacion uniqueidentifier NOT NULL CONSTRAINT PK_OperacionesPresupuesto PRIMARY KEY,
    Tipo varchar(24) NOT NULL,
    Motivo nvarchar(500) NOT NULL,
    UsuarioSql sysname NOT NULL CONSTRAINT DF_OperacionesPresupuesto_Usuario DEFAULT (ORIGINAL_LOGIN()),
    FechaRegistro datetime2(3) NOT NULL CONSTRAINT DF_OperacionesPresupuesto_Fecha DEFAULT (SYSUTCDATETIME()),
    CONSTRAINT CK_OperacionesPresupuesto_Tipo CHECK
        (Tipo = 'CrearPresupuesto' OR Tipo = 'Aprobar' OR Tipo = 'Ajustar' OR Tipo = 'CerrarPresupuesto'
        OR Tipo = 'Reservar' OR Tipo = 'FinalizarCompromiso' OR Tipo = 'ImputarCompra' OR Tipo = 'RevertirCompra'
        OR Tipo = 'EditarBorrador'),
    CONSTRAINT CK_OperacionesPresupuesto_Motivo CHECK (LEN(TRIM(Motivo)) > 0)
);
GO

CREATE TRIGGER dbo.TR_OperacionesPresupuesto_Inmutable ON dbo.OperacionesPresupuesto
AFTER UPDATE, DELETE
AS
BEGIN
    SET NOCOUNT ON;
    IF EXISTS (SELECT 1 FROM deleted)
        THROW 52010, N'La operación presupuestaria es inmutable.', 1;
END;
