import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { obtenerUsuarioActual } from "../services/auth.js";

export default function ReporteventasPage() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    desde: "",
    hasta: "",
    producto: "",
    vendedor: "",
    cliente: "",
  });
  const [hasGeneratedReport, setHasGeneratedReport] = useState(false);
  const [accessChecked, setAccessChecked] = useState(false);

  useEffect(() => {
    let active = true;
    obtenerUsuarioActual()
      .then((user) => {
        if (!active) return;
        if (!user) {
          navigate("/login.html", { replace: true });
          return;
        }
        if (!["admin", "administrador"].includes(String(user.rol || "").trim().toLowerCase())) {
          navigate("/home.html", { replace: true });
          return;
        }
        setAccessChecked(true);
      })
      .catch((error) => {
        console.error("No se pudo verificar el acceso al reporte:", error);
        if (active) navigate("/login.html", { replace: true });
      });
    return () => {
      active = false;
    };
  }, [navigate]);

  const updateFilter = (key) => (event) => {
    setFilters((current) => ({ ...current, [key]: event.target.value }));
  };

  const clearFilters = () => {
    setFilters({ desde: "", hasta: "", producto: "", vendedor: "", cliente: "" });
    setHasGeneratedReport(false);
  };

  if (!accessChecked) return <main role="status">Verificando acceso...</main>;

  return (
    <>
      <div className="dashboard-container container-fluid p-4">
        <div
          className={
            "header d-flex justify-content-between align-items-center mb-4"
          }
        >
          <h2>
            <i
              className="fas fa-chart-line"
              style={{ color: "#22c55e", marginRight: "12px" }}
            />
            Módulo de Reportes de Ventas
          </h2>

          <Link to="/admin.html" className="btn-home text-decoration-none">
            <i className="fas fa-arrow-left" />
            Volver al Panel
          </Link>
        </div>

        <div className="card border-0 shadow-sm p-4 mb-4">
          <h5 className="fw-bold mb-3 text-secondary">
            <i className="fas fa-sliders-h me-2" />
            Selectores de Filtros Avanzados
          </h5>

          <form
            id="ventas-filter-form"
            className="row g-3 align-items-end"
            onSubmit={(event) => {
              event.preventDefault();
              setHasGeneratedReport(true);
            }}
          >
            <div className="col-12 col-sm-6 col-md-3">
              <label
                htmlFor="venta-desde"
                className="form-label small text-muted fw-semibold"
              >
                Fecha Desde:
              </label>

              <input type="date" id="venta-desde" className="form-control" value={filters.desde} onChange={updateFilter("desde")} />
            </div>

            <div className="col-12 col-sm-6 col-md-3">
              <label
                htmlFor="venta-hasta"
                className="form-label small text-muted fw-semibold"
              >
                Fecha Hasta:
              </label>

              <input type="date" id="venta-hasta" className="form-control" value={filters.hasta} onChange={updateFilter("hasta")} />
            </div>

            <div className="col-12 col-sm-6 col-md-2">
              <label
                htmlFor="filtro-producto"
                className="form-label small text-muted fw-semibold"
              >
                Producto (Inmueble):
              </label>

              <select id="filtro-producto" className="form-select" value={filters.producto} onChange={updateFilter("producto")}>
                <option value="">Todos</option>

                <option value="apartamento">Apartamento</option>

                <option value="casa">Casa</option>

                <option value="lote">Lote / Terreno</option>

                <option value="local">Local Comercial</option>
              </select>
            </div>

            <div className="col-12 col-sm-6 col-md-2">
              <label
                htmlFor="filtro-vendedor"
                className="form-label small text-muted fw-semibold"
              >
                Vendedor:
              </label>

              <select id="filtro-vendedor" className="form-select" value={filters.vendedor} onChange={updateFilter("vendedor")}>
                <option value="">Todos</option>

                <option value="vendedor-1">Andres Guerra</option>

                <option value="vendedor-2">Sergio Ochoa</option>
              </select>
            </div>

            <div className="col-12 col-sm-6 col-md-2">
              <label
                htmlFor="filtro-cliente"
                className="form-label small text-muted fw-semibold"
              >
                Cliente:
              </label>

              <select id="filtro-cliente" className="form-select" value={filters.cliente} onChange={updateFilter("cliente")}>
                <option value="">Todos</option>

                <option value="cliente-1">Samuel Jaramillo</option>
              </select>
            </div>

            <div className="col-12 d-flex gap-2 justify-content-end mt-4">
              <button
                type="button"
                id="btn-limpiar-ventas"
                className="btn btn-outline-secondary px-4 fw-semibold"
                onClick={clearFilters}
              >
                {
                  "\n                        Limpiar Filtros\n                    "
                }
              </button>

              <button
                type="submit"
                id="btn-filtrar-ventas"
                className="btn btn-success px-5 fw-bold"
              >
                <i className="fas fa-search me-2" />
                Generar Reporte
              </button>
            </div>
          </form>
        </div>

        <div className="card border-0 shadow-sm p-4">
          <h5 className="fw-bold mb-3 text-secondary">
            <i className="fas fa-file-invoice-dollar me-2" />
            Historial de Transacciones
          </h5>

          <div className="table-responsive" style={{ overflowX: "auto" }}>
            <table className="table align-middle">
              <thead>
                <tr>
                  <th>ID Código</th>

                  <th>Fecha</th>

                  <th>Inmueble (Producto)</th>

                  <th>Vendedor</th>

                  <th>Cliente</th>

                  <th>Valor de Cierre</th>

                  <th style={{ textAlign: "center" }}>Estado</th>
                </tr>
              </thead>

              <tbody id="ventas-table-body">
                <tr>
                  <td colSpan="7" className="text-center text-muted py-4">
                    <i className="fas fa-info-circle me-2" />
                    {hasGeneratedReport
                      ? "No hay transacciones registradas que coincidan con los filtros seleccionados."
                      : "Aún no hay transacciones registradas para mostrar."}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
