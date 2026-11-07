CREATE TABLE dbo.RubrosPresupuesto
(
    IdRubroPresupuesto int IDENTITY(1,1) NOT NULL CONSTRAINT PK_RubrosPresupuesto PRIMARY KEY,
    Codigo nvarchar(30) NOT NULL CONSTRAINT UQ_RubrosPresupuesto_Codigo UNIQUE,
    Nombre nvarchar(150) NOT NULL,
    Activo bit NOT NULL CONSTRAINT DF_RubrosPresupuesto_Activo DEFAULT (1),
    CONSTRAINT CK_RubrosPresupuesto_Datos CHECK (LEN(TRIM(Codigo)) > 0 AND LEN(TRIM(Nombre)) > 0)
);
