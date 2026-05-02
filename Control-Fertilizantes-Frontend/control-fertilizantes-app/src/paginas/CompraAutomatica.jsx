import { useMemo, useState, useEffect } from "react";
import EstadoLista from "../EstadoLista";

import {
  obtenerVistaPreviaValidada,
  confirmarComprasAutomaticas,
} from "../api/compraAutomaticaApi";
import { obtenerProductos } from "../api/productosApi";
import { obtenerPresentacionesProducto } from "../api/presentacionProductoApi";
import { guardarProformaProveedor } from "../api/proformaProveedorApi";

import CargarProformaPDF from "../componentes/compraAutomatica/CargarProformaPDF";
import ResumenProformaValidada from "../componentes/compraAutomatica/ResumenProformaValidada";
import DetalleProformaValidada from "../componentes/compraAutomatica/DetalleProformaValidada";
import TablaProforma from "../componentes/compraAutomatica/TablaProforma";
import AccionesCompraAutomatica from "../componentes/compraAutomatica/AccionesCompraAutomatica";

function CompraAutomatica() {
  const [archivoPdf, setArchivoPdf] = useState(null);
  const [vistaPrevia, setVistaPrevia] = useState(null);
  const [cargandoVistaPrevia, setCargandoVistaPrevia] = useState(false);
  const [cargandoConfirmacion, setCargandoConfirmacion] = useState(false);
  const [error, setError] = useState(null);
  const [mensajeExito, setMensajeExito] = useState(null);
  const [productos, setProductos] = useState([]);
  const [presentaciones, setPresentaciones] = useState([]);
  const [cargandoCatalogos, setCargandoCatalogos] = useState(false);

  const lineas = useMemo(() => vistaPrevia?.lineas ?? [], [vistaPrevia]);

  const resumen = useMemo(() => {
    const cantidadLineas = lineas.length;

    const cantidadLineasValidas =
      vistaPrevia?.cantidadLineasValidas ??
      lineas.filter((linea) => linea.sePuedeRegistrar).length;

    const cantidadLineasPendientes =
      vistaPrevia?.cantidadLineasPendientes ??
      lineas.filter((linea) => !linea.sePuedeRegistrar).length;

    return {
      cantidadLineas,
      cantidadLineasValidas,
      cantidadLineasPendientes,
      puedeConfirmar:
        vistaPrevia?.proveedorEncontrado === true &&
        cantidadLineasValidas > 0 &&
        cantidadLineasPendientes === 0,
    };
  }, [vistaPrevia, lineas]);

  const formatearMoneda = (valor) => {
    const numero = Number(valor ?? 0);

    return new Intl.NumberFormat("es-CR", {
      style: "currency",
      currency: "CRC",
      minimumFractionDigits: 2,
    }).format(numero);
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return "Sin fecha";

    return new Date(fecha).toLocaleDateString("es-CR");
  };

  const manejarCambioArchivo = (e) => {
    const archivo = e.target.files?.[0];

    setArchivoPdf(archivo ?? null);
    setVistaPrevia(null);
    setError(null);
    setMensajeExito(null);
  };

  useEffect(() => {
    const cargarCatalogos = async () => {
      try {
        setCargandoCatalogos(true);

        const [productosData, presentacionesData] = await Promise.all([
          obtenerProductos(),
          obtenerPresentacionesProducto(),
        ]);

        setProductos(productosData);
        setPresentaciones(presentacionesData);
      } catch (error) {
        console.error(error);
        setError("No se pudieron cargar los productos y presentaciones.");
      } finally {
        setCargandoCatalogos(false);
      }
    };

    cargarCatalogos();
  }, []);

  const mapearLineaPendiente = (
    indiceLinea,
    idProducto,
    idPresentacionProducto,
  ) => {
    setVistaPrevia((prev) => {
      if (!prev) return prev;

      const productoSeleccionado = productos.find(
        (producto) => Number(producto.idProducto) === Number(idProducto),
      );

      const presentacionSeleccionada = presentaciones.find(
        (presentacion) =>
          Number(presentacion.idPresentacionProducto) ===
          Number(idPresentacionProducto),
      );

      const nuevasLineas = prev.lineas.map((linea, index) => {
        if (index !== indiceLinea) return linea;

        const tieneProducto = Boolean(productoSeleccionado);
        const tienePresentacion = Boolean(presentacionSeleccionada);

        return {
          ...linea,
          idProducto: tieneProducto ? Number(idProducto) : null,
          idPresentacionProducto: tienePresentacion
            ? Number(idPresentacionProducto)
            : null,
          nombreProductoSistema: productoSeleccionado?.nombre ?? "",
          nombrePresentacionSistema: presentacionSeleccionada?.descripcion ?? "",
          productoEncontrado: tieneProducto,
          presentacionEncontrada: tienePresentacion,
          sePuedeRegistrar: tieneProducto && tienePresentacion,
          observacionValidacion:
            tieneProducto && tienePresentacion
              ? "Línea mapeada manualmente y lista para registrarse."
              : "Debe seleccionar producto y presentación.",
        };
      });

      const cantidadLineasValidas = nuevasLineas.filter(
        (linea) => linea.sePuedeRegistrar,
      ).length;

      const cantidadLineasPendientes = nuevasLineas.filter(
        (linea) => !linea.sePuedeRegistrar,
      ).length;

      return {
        ...prev,
        lineas: nuevasLineas,
        cantidadLineasValidas,
        cantidadLineasPendientes,
        tieneLineasPendientesMapeo: cantidadLineasPendientes > 0,
      };
    });
  };

  const generarVistaPrevia = async () => {
    if (!archivoPdf) {
      setError(
        "Debe seleccionar un archivo PDF antes de generar la vista previa.",
      );
      return;
    }

    try {
      setCargandoVistaPrevia(true);
      setError(null);
      setMensajeExito(null);

      const data = await obtenerVistaPreviaValidada(archivoPdf);
      setVistaPrevia(data);
    } catch (err) {
      console.error(err);
      setError(err.message || "No se pudo generar la vista previa validada.");
    } finally {
      setCargandoVistaPrevia(false);
    }
  };

const guardarProforma = async () => {
  console.log("Click en guardar proforma");
  console.log("Vista previa actual:", vistaPrevia);

  if (!vistaPrevia) return;

  if (!vistaPrevia.idProveedor) {
    setError("No se puede guardar la proforma sin un proveedor válido.");
    return;
  }

  if (vistaPrevia.lineas.some((linea) => !linea.sePuedeRegistrar)) {
    setError("Existen líneas pendientes de mapeo.");
    return;
  }

  try {
    setCargandoConfirmacion(true);
    setError(null);
    setMensajeExito(null);

    const dto = {
      numeroProforma: vistaPrevia.numeroProforma,
      idProveedor: vistaPrevia.idProveedor,
      fechaProforma: vistaPrevia.fecha,
      fechaVencimiento: vistaPrevia.fechaVencimiento,
      diasCredito: vistaPrevia.diasCredito,
      tipoDocumento: vistaPrevia.tipoDocumento,

      nombreProveedorPdf: vistaPrevia.nombreProveedorPdf,
      nombreNegocio: vistaPrevia.nombreNegocio,
      razonSocial: vistaPrevia.razonSocial,
      cedula: vistaPrevia.cedula,
      telefono: vistaPrevia.telefono,
      vendedor: vistaPrevia.vendedor,

      subtotal: vistaPrevia.subtotal,
      descuento: vistaPrevia.descuento,
      iva: vistaPrevia.iva,
      total: vistaPrevia.total,

      observaciones: "Proforma registrada desde lectura automática de PDF.",

      detalles: vistaPrevia.lineas.map((linea) => ({
        codigoProveedor: linea.codigoProveedor ?? linea.codigo,
        descripcionProveedor: linea.descripcionProveedor ?? linea.descripcion,

        idProducto: linea.idProducto,
        idPresentacionProducto: linea.idPresentacionProducto,

        cantidad: linea.cantidad,
        precioUnitario: linea.precioUnitario ?? linea.precio,
        descuentoPorcentaje: linea.descuentoPorcentaje ?? 0,
        totalLinea: linea.totalLinea ?? linea.total,

        productoEncontrado: linea.productoEncontrado,
        presentacionEncontrada: linea.presentacionEncontrada,
        sePuedeRegistrar: linea.sePuedeRegistrar,

        observacionValidacion: linea.observacionValidacion
      }))
    };

    console.log("DTO completo JSON:", JSON.stringify(dto, null, 2));
    console.table(dto.detalles);
    console.log("DTO enviado a GuardarProformaProveedor:", dto);

    const resultado = await guardarProformaProveedor(dto);

    setMensajeExito(
      resultado?.mensaje ||
        "La proforma se guardó correctamente y ya está disponible para comparar."
    );

    setVistaPrevia(null);
    setArchivoPdf(null);
  } catch (err) {
    console.error(err);
    setError(err.message || "No se pudo guardar la proforma.");
  } finally {
    setCargandoConfirmacion(false);
  }
};

  const limpiarProceso = () => {
    setArchivoPdf(null);
    setVistaPrevia(null);
    setError(null);
    setMensajeExito(null);
  };

  return (
    <section className="page">
      <div className="page__header">
        <div>
          <h1 className="page__title">Compra Automática</h1>
          <p className="page__subtitle">
            Cargue una proforma PDF, valide proveedor y productos, y guárdela para
            compararla con otras proformas.
          </p>
        </div>
      </div>

      <div className="compra-automatica">
        <CargarProformaPDF
          archivoPdf={archivoPdf}
          cargando={cargandoVistaPrevia}
          onCambioArchivo={manejarCambioArchivo}
          onGenerarVistaPrevia={generarVistaPrevia}
          onLimpiar={limpiarProceso}
        />

        {cargandoVistaPrevia && (
          <EstadoLista tipo="cargando" mensaje="Procesando proforma PDF..." />
        )}

        {error && <EstadoLista tipo="error" mensaje={error} />}

        {mensajeExito && <EstadoLista tipo="exito" mensaje={mensajeExito} />}

        {vistaPrevia && (
          <>
            <ResumenProformaValidada
              vistaPrevia={vistaPrevia}
              resumen={resumen}
              formatearMoneda={formatearMoneda}
            />

            <DetalleProformaValidada
              vistaPrevia={vistaPrevia}
              formatearMoneda={formatearMoneda}
              formatearFecha={formatearFecha}
            />

            <TablaProforma
              lineas={lineas}
              productos={productos}
              presentaciones={presentaciones}
              cargandoCatalogos={cargandoCatalogos}
              formatearMoneda={formatearMoneda}
              onMapearLinea={mapearLineaPendiente}
            />

            <AccionesCompraAutomatica
              puedeConfirmar={resumen.puedeConfirmar}
              cargandoConfirmacion={cargandoConfirmacion}
              onConfirmar={guardarProforma}
            />
          </>
        )}
      </div>
    </section>
  );
}

export default CompraAutomatica;
