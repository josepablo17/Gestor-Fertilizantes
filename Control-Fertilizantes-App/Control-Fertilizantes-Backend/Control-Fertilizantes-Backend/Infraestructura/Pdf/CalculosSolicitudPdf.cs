using System.Text.Json;

namespace Control_Fertilizantes_Backend.Infraestructura.Pdf;

internal static class CalculosSolicitudPdf
{
    public static string Inicializar(IEnumerable<string> partidas) =>
        $"var GFPartidas = {JsonSerializer.Serialize(partidas)};\n" + """
        function GFTexto(doc, nombre) {
            var campo = doc.getField(nombre);
            return campo ? String(campo.valueAsString).replace(/^\s+|\s+$/g, "") : "";
        }
        function GFNumero(texto, enteros, escala, minimo, maximo, opcional) {
            if (texto === "") return opcional ? 0 : null;
            var partes = /^([0-9]+)(?:[.,]([0-9]+))?$/.exec(texto);
            if (!partes || partes[1].replace(/^0+/, "").length > enteros ||
                (partes[2] || "").replace(/0+$/, "").length > escala) return null;
            var n = Number(texto.replace(",", "."));
            return n < minimo || n > maximo ? null : n;
        }
        function GFValidar(evento, etiqueta, enteros, escala, minimo, maximo) {
            var texto = String(evento.value).replace(/^\s+|\s+$/g, "");
            if (texto !== "" && GFNumero(texto, enteros, escala, minimo, maximo, false) === null) {
                evento.rc = false;
                app.alert(etiqueta + (maximo === 100 ? ": ingrese un porcentaje entre 0 y 100." :
                    ": ingrese un número válido, sin separador de miles."));
            }
        }
        function GFRedondear(n) {
            var escalado = n * 10000;
            return Math.round(escalado + Math.abs(escalado) * 2.220446049250313e-16) / 10000;
        }
        function GFMostrar(n) {
            if (n === null) return "";
            var importe = GFRedondear(n);
            if (!isFinite(importe) || importe < 0 || importe >= 100000000000000) return "";
            return importe.toFixed(4).replace(/\.?0+$/, "");
        }
        function GFLinea(doc, prefijo) {
            if (GFTexto(doc, prefijo + "estadoOferta") !== "Cotizada") return null;
            var base = GFTexto(doc, prefijo + "baseTotalLinea");
            var cantidad = GFNumero(GFTexto(doc, prefijo + "cantidadEmpaques"), 14, 4, 0.0001, Infinity, false);
            var precio = GFNumero(GFTexto(doc, prefijo + "precioUnitario"), 12, 6, 0, Infinity, false);
            var descuento = GFNumero(GFTexto(doc, prefijo + "descuentoPorcentaje"), 3, 2, 0, 100, true);
            var iva = GFNumero(GFTexto(doc, prefijo + "impuestoMonto"), 14, 4, 0, Infinity, true);
            if (cantidad === null || precio === null || descuento === null || iva === null ||
                !/^(Bruto|NetoSinImpuestos|ConImpuestos)$/.test(base)) return null;
            var bruto = cantidad * precio;
            var neto = GFRedondear(bruto * (1 - descuento / 100));
            var total = base === "Bruto" ? GFRedondear(bruto) : base === "ConImpuestos" ? neto + iva : neto;
            return GFMostrar(total) === "" ? null : { neto: neto, iva: iva, total: total };
        }
        function GFResumen(doc, campo) {
            var subtotal = 0, iva = 0, hayOferta = false;
            for (var i = 0; i < GFPartidas.length; i++) {
                var prefijo = GFPartidas[i];
                var estado = GFTexto(doc, prefijo + "estadoOferta");
                if (estado === "SinCotizar" || estado === "NoDisponible") continue;
                var partida = GFLinea(doc, prefijo);
                if (partida === null) return "";
                hayOferta = true;
                subtotal += partida.neto;
                iva += partida.iva;
            }
            if (!hayOferta) return "";
            if (campo === "subtotal") return GFMostrar(subtotal);
            var adicional = GFNumero(GFTexto(doc, "cabecera_ivaAdicional"), 14, 4, 0, Infinity, true);
            if (adicional === null) return "";
            iva += adicional;
            if (campo === "iva") return GFMostrar(iva);
            var descuento = GFNumero(GFTexto(doc, "cabecera_descuento"), 14, 4, 0, Infinity, true);
            var cargos = GFNumero(GFTexto(doc, "cabecera_otrosCargos"), 14, 4, 0, Infinity, true);
            if (descuento === null || cargos === null || GFMostrar(subtotal) === "" || GFMostrar(iva) === "") return "";
            return GFMostrar(subtotal - descuento + iva + cargos);
        }
        """;
}
