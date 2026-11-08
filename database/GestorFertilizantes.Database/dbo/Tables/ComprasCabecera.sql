CREATE TABLE dbo.ComprasCabecera
(
    IdCompraCabecera bigint IDENTITY(1,1) NOT NULL CONSTRAINT PK_ComprasCabecera PRIMARY KEY,
    IdProveedor int NOT NULL,
    FechaCompra date NOT NULL,
    Moneda nvarchar(10) NOT NULL,
    NumeroFactura nvarchar(100) NULL,
    Observaciones nvarchar(500) NULL,
    IdCompraMigrada bigint NULL,
    IdOperacion uniqueidentifier NULL,
    HuellaSolicitud binary(32) NULL,
    FechaCreacion datetime2(7) NOT NULL CONSTRAINT DF_ComprasCabecera_Creacion DEFAULT SYSUTCDATETIME(),
    FechaModificacion datetime2(7) NULL,
    Version rowversion NOT NULL,
    CONSTRAINT FK_ComprasCabecera_Proveedor FOREIGN KEY(IdProveedor) REFERENCES dbo.Proveedores(IdProveedor),
    CONSTRAINT CK_ComprasCabecera_Moneda CHECK([Moneda]=N'USD' OR [Moneda]=N'CRC'),
    CONSTRAINT CK_ComprasCabecera_Factura CHECK(NumeroFactura IS NULL OR LEN(TRIM(NumeroFactura))>0),
    CONSTRAINT CK_ComprasCabecera_Operacion CHECK
      ((IdOperacion IS NULL AND HuellaSolicitud IS NULL) OR (IdOperacion IS NOT NULL AND HuellaSolicitud IS NOT NULL))
);
GO
CREATE UNIQUE INDEX UX_ComprasCabecera_Migrada ON dbo.ComprasCabecera(IdCompraMigrada) WHERE IdCompraMigrada IS NOT NULL;
GO
CREATE UNIQUE INDEX UX_ComprasCabecera_Operacion ON dbo.ComprasCabecera(IdOperacion) WHERE IdOperacion IS NOT NULL;
GO
CREATE INDEX IX_ComprasCabecera_Fecha ON dbo.ComprasCabecera(FechaCompra DESC,IdCompraCabecera DESC)
    INCLUDE(IdProveedor,Moneda,NumeroFactura);
GO
