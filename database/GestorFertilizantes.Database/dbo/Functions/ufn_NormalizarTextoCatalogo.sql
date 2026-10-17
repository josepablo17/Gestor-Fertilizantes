
/* Se conservan los numeros de las formulas. Esta funcion solo normaliza texto;
   no declara equivalencia comercial ni interpreta unidades o importes. */
CREATE   FUNCTION dbo.ufn_NormalizarTextoCatalogo(@Texto nvarchar(1000)) RETURNS nvarchar(1000) AS
BEGIN
 DECLARE @Resultado nvarchar(1000)=UPPER(LTRIM(RTRIM(COALESCE(@Texto,N''))));
 SET @Resultado=TRANSLATE(@Resultado,N'-/(),',N'     ');
 WHILE CHARINDEX(N'  ',@Resultado)>0 SET @Resultado=REPLACE(@Resultado,N'  ',N' ');
 RETURN LTRIM(RTRIM(@Resultado));
END;

GO
