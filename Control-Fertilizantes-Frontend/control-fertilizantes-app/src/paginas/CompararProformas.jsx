import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { obtenerProformaProveedorPorId } from "../api/proformaProveedorApi";
import ResumenProformasComparadas from "../componentes/compararProformas/ResumenProformasComparadas";
import TablaComparativaProformas from "../componentes/compararProformas/TablaComparativaProformas";
import {
  normalizarProforma,
  obtenerFilasComparativas
} from "../componentes/compararProformas/compararProformasUtils";

function CompararProformas() {
  const [searchParams] = useSearchParams();

  const ids = useMemo(() => {
    const idsQuery = searchParams.get("ids");

    if (!idsQuery) return [];

    return idsQuery
      .split(",")
      .map((id) => Number(id.trim()))
      .filter((id) => !Number.isNaN(id) && id > 0);
  }, [searchParams]);

  const [proformas, setProformas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [criterioComparacion, setCriterioComparacion] =
    useState("precioUnitario");

  useEffect(() => {
    async function cargarProformas() {
      try {
        setCargando(true);
        setError("");

        if (ids.length < 2) {
          setProformas([]);
          setError("Debe seleccionar al menos dos proformas para comparar.");
          return;
        }

        const respuestas = await Promise.all(
          ids.map((id) => obtenerProformaProveedorPorId(id))
        );

        const proformasNormalizadas = respuestas
          .map(normalizarProforma)
          .filter((proforma) => proforma?.idProformaProveedor);

        setProformas(proformasNormalizadas);
      } catch (error) {
        console.error(error);
        setError("No se pudieron cargar las proformas seleccionadas.");
      } finally {
        setCargando(false);
      }
    }

    cargarProformas();
  }, [ids]);

  const filasComparativas = useMemo(
    () => obtenerFilasComparativas(proformas),
    [proformas]
  );

  const monedaPrincipal = proformas[0]?.moneda || "CRC";

  if (cargando) {
    return (
      <section className="page">
        <div className="page__header">
          <div>
            <h1 className="page__title">Comparar proformas</h1>
            <p className="page__subtitle">
              Cargando información de las proformas seleccionadas.
            </p>
          </div>
        </div>

        <div className="card">
          <div className="card__body">
            <p className="text-muted">Cargando comparación...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="page">
        <div className="page__header">
          <div>
            <h1 className="page__title">Comparar proformas</h1>
            <p className="page__subtitle">
              No fue posible generar la comparación.
            </p>
          </div>

          <div className="page__actions">
            <Link to="/proformas-proveedor" className="btn btn--secondary">
              Volver
            </Link>
          </div>
        </div>

        <div className="card">
          <div className="card__body">
            <p className="text-danger">{error}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="page">
      <div className="page__header">
        <div>
          <h1 className="page__title">Comparar proformas</h1>
          <p className="page__subtitle">
            Revise precios, totales, condiciones de crédito y productos no
            cotizados por proveedor.
          </p>
        </div>

        <div className="page__actions">
          <Link to="/proformas-proveedor" className="btn btn--secondary">
            Volver
          </Link>
        </div>
      </div>

      <div className="page__body">
        <ResumenProformasComparadas proformas={proformas} />

        <TablaComparativaProformas
          proformas={proformas}
          filasComparativas={filasComparativas}
          criterioComparacion={criterioComparacion}
          setCriterioComparacion={setCriterioComparacion}
          monedaPrincipal={monedaPrincipal}
        />
      </div>
    </section>
  );
}

export default CompararProformas;
