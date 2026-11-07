CREATE PROCEDURE dbo.usp_Presupuesto_ValidarLineas
    @LineasJson nvarchar(max), @ClaveId nvarchar(40), @ClaveOpcional nvarchar(40) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    IF @LineasJson IS NULL OR DATALENGTH(@LineasJson) > 100000 OR ISJSON(@LineasJson, ARRAY) <> 1
        THROW 52000, N'La distribución debe ser un arreglo JSON.', 1;
    IF (SELECT COUNT(*) FROM OPENJSON(@LineasJson)) NOT BETWEEN 1 AND 100
        OR EXISTS (SELECT 1 FROM OPENJSON(@LineasJson) WHERE [type] <> 5)
        THROW 52000, N'La distribución admite de 1 a 100 renglones.', 1;

    DECLARE @Propiedades table (Linea int, Clave nvarchar(4000) COLLATE Latin1_General_100_BIN2, Valor nvarchar(max), Tipo int);
    INSERT @Propiedades
    SELECT CONVERT(int,j.[key]), p.[key], p.[value], p.[type]
    FROM OPENJSON(@LineasJson) AS j CROSS APPLY OPENJSON(j.[value]) AS p;

    IF EXISTS (SELECT 1 FROM @Propiedades WHERE Clave <> @ClaveId AND Clave <> N'monto'
        AND (@ClaveOpcional IS NULL OR Clave <> @ClaveOpcional))
        OR EXISTS (SELECT 1 FROM @Propiedades GROUP BY Linea, Clave HAVING COUNT(*) > 1)
        OR EXISTS
        (
            SELECT 1 FROM OPENJSON(@LineasJson) AS j
            WHERE NOT EXISTS (SELECT 1 FROM @Propiedades AS p WHERE p.Linea = CONVERT(int,j.[key]) AND p.Clave = @ClaveId)
               OR NOT EXISTS (SELECT 1 FROM @Propiedades AS p WHERE p.Linea = CONVERT(int,j.[key]) AND p.Clave = N'monto')
        )
        THROW 52000, N'Hay campos faltantes, desconocidos o duplicados en la distribución.', 1;

    IF EXISTS
    (
        SELECT 1 FROM @Propiedades
        WHERE (Clave = @ClaveId OR (Clave = @ClaveOpcional AND Tipo <> 0))
        AND (Tipo NOT IN (1,2) OR LEN(Valor) > 19 OR Valor COLLATE Latin1_General_100_BIN2 LIKE N'%[^0-9]%'
            OR TRY_CONVERT(bigint,LEFT(Valor,19)) IS NULL OR TRY_CONVERT(bigint,LEFT(Valor,19)) <= 0)
    )
        THROW 52000, N'Los identificadores de la distribución deben ser enteros positivos.', 1;

    IF EXISTS
    (
        SELECT 1 FROM @Propiedades WHERE Clave = N'monto'
        AND (Tipo NOT IN (1,2) OR LEN(Valor) > 64 OR Valor COLLATE Latin1_General_100_BIN2 LIKE N'%[^0-9.]%'
            OR TRY_CONVERT(decimal(18,4),LEFT(Valor,64)) IS NULL OR TRY_CONVERT(decimal(18,4),LEFT(Valor,64)) <= 0
            OR (CHARINDEX(N'.',Valor) > 0 AND SUBSTRING(Valor,CHARINDEX(N'.',Valor) + 5,2147483647) LIKE N'%[^0]%'))
    )
        THROW 52000, N'Los importes deben ser positivos y ajustarse a decimal(18,4).', 1;
END;
