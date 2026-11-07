CREATE TABLE dbo.Fincas
(
    IdFinca int IDENTITY(1,1) NOT NULL CONSTRAINT PK_Fincas PRIMARY KEY,
    Codigo nvarchar(30) NOT NULL CONSTRAINT UQ_Fincas_Codigo UNIQUE,
    Nombre nvarchar(150) NOT NULL,
    Activa bit NOT NULL CONSTRAINT DF_Fincas_Activa DEFAULT (1),
    CONSTRAINT CK_Fincas_Datos CHECK (LEN(TRIM(Codigo)) > 0 AND LEN(TRIM(Nombre)) > 0)
);
