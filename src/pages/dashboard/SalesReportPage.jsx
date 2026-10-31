import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Ban,
  CalendarDays,
  Handshake,
  TrendingUp,
  Wallet,
} from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout.jsx";
import StatCard from "../../components/admin/StatCard.jsx";
import SalesFilters from "../../components/admin/SalesFilters.jsx";
import SalesTable from "../../components/admin/SalesTable.jsx";
import ExportButton from "../../components/admin/ExportButton.jsx";
import Pagination, { paginate } from "../../components/ui/Pagination.jsx";
import EmptyState from "../../components/ui/EmptyState.jsx";
import ErrorState from "../../components/ui/ErrorState.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { usePageTitle } from "../../hooks/usePageTitle.js";
import { adminNav } from "../../config/dashboardNav.js";
import { filterSales, listSales, salesStats } from "../../services/salesService.js";
import { exportSales } from "../../services/excelService.js";
import { getErrorMessage } from "../../utils/errors.js";
import { formatCOP } from "../../utils/format.js";
import { toDate } from "../../utils/dates.js";

const PAGE_SIZE = 10;

const initialFilters = {
  search: "",
  from: "",
  to: "",
  operation: "",
  status: "",
};

const monthLabel = new Intl.DateTimeFormat("es-CO", {
  month: "short",
  year: "numeric",
});

const reportNav = adminNav.map((item) =>
  item.key === "reportes" || item.key === "cuenta"
    ? item
    : { ...item, to: "/admin" },
);

export default function SalesReportPage() {
  usePageTitle(
    "Reporte de ventas",
    "Consulta y exporta los cierres registrados por rango de fechas.",
  );
  const { profile } = useAuth();
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState(initialFilters);
  const [page, setPage] = useState(1);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      setSales(await listSales());
    } catch (loadError) {
      setError(
        getErrorMessage(loadError, "No se pudo cargar el reporte de ventas."),
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => filterSales(sales, filters), [sales, filters]);
  const stats = useMemo(() => salesStats(filtered), [filtered]);
  const pageData = paginate(filtered, page, PAGE_SIZE);

  const monthly = useMemo(() => {
    const groups = new Map();
    filtered
      .filter((sale) => sale.status === "cerrada")
      .forEach((sale) => {
        const date = toDate(sale.closingDate);
        if (!date) return;
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        const current = groups.get(key) || {
          key,
          label: monthLabel.format(date),
          total: 0,
          count: 0,
        };
        current.total += Number(sale.closingValue || 0);
        current.count += 1;
        groups.set(key, current);
      });
    return [...groups.values()]
      .sort((a, b) => a.key.localeCompare(b.key))
      .slice(-6);
  }, [filtered]);

  const maxMonthly = Math.max(1, ...monthly.map((month) => month.total));

  const changeFilter = (field, value) => {
    setFilters((current) => ({ ...current, [field]: value }));
    setPage(1);
  };

  const hasFilters = Object.values(filters).some(Boolean);

  return (
    <DashboardLayout
      role={profile?.rol}
      navItems={reportNav}
      activeKey="reportes"
      title="Reporte de ventas"
      subtitle="Cierres vigentes y anulados, filtrados por fecha, operación y estado."
      actions={
        <>
          <Link to="/admin" className="btn btn-outline-secondary btn-sm dashboard-action">
            <ArrowLeft size={15} aria-hidden="true" />
            Volver al panel
          </Link>
          <ExportButton
            onExport={() => exportSales(filtered)}
            label="Exportar reporte"
            variant="primary"
            size="sm"
            disabled={!filtered.length}
          />
        </>
      }
    >
      <div className="stat-grid">
        <StatCard
          icon={Handshake}
          label="Cierres vigentes"
          value={stats.closed}
          hint={`${stats.annulled} anulados en el filtro`}
          tone="blue"
        />
        <StatCard
          icon={Wallet}
          label="Valor total"
          value={formatCOP(stats.totalValue)}
          hint="Solo cierres vigentes"
          tone="green"
        />
        <StatCard
          icon={TrendingUp}
          label="Ticket promedio"
          value={formatCOP(stats.averageValue)}
          hint="Promedio por cierre vigente"
          tone="sand"
        />
        <StatCard
          icon={CalendarDays}
          label="Ventas / arriendos"
          value={`${stats.salesCount} / ${stats.rentalCount}`}
          hint="Distribución por operación"
          tone="slate"
        />
      </div>

      <section className="surface panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Filtros del reporte</p>
            <h2>Consulta los cierres registrados</h2>
            <p>
              Usa el rango de fechas para revisar un período específico. La
              exportación incluye exactamente los cierres filtrados.
            </p>
          </div>
          {hasFilters && (
            <span className="filter-count">{filtered.length} resultados</span>
          )}
        </div>

        <SalesFilters
          values={filters}
          onChange={changeFilter}
          onReset={() => {
            setFilters(initialFilters);
            setPage(1);
          }}
        />
      </section>

      {error ? (
        <ErrorState
          title="No pudimos cargar el reporte"
          description={error}
          onRetry={load}
        />
      ) : (
        <section className="surface panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Detalle</p>
              <h2>Cierres del período</h2>
              <p>
                {loading
                  ? "Cargando cierres…"
                  : `${filtered.length} cierres coinciden con los filtros actuales.`}
              </p>
            </div>
            {filtered.length > 0 && (
              <Link to="/admin" className="text-link">
                Ir al panel de administración
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            )}
          </div>

          <SalesTable
            sales={pageData.items}
            loading={loading}
            error={error}
            onRetry={load}
            onAnnul={() => undefined}
            compact
            emptyState={
              <EmptyState
                icon={Ban}
                title={
                  sales.length
                    ? "No hay cierres con estos filtros"
                    : "Aún no hay cierres registrados"
                }
                description={
                  sales.length
                    ? "Prueba con otro rango de fechas o limpia los filtros para ver todos los cierres."
                    : "Cuando registres la primera venta o arriendo, el reporte se actualizará automáticamente."
                }
                action={
                  <Link to="/admin" className="btn btn-primary">
                    Ir a registrar un cierre
                    <ArrowRight size={16} aria-hidden="true" />
                  </Link>
                }
                compact
              />
            }
          />
          <Pagination
            page={pageData.page}
            totalPages={pageData.totalPages}
            totalItems={pageData.totalItems}
            pageSize={PAGE_SIZE}
            onChange={setPage}
          />
        </section>
      )}

      {monthly.length > 0 && (
        <section className="surface panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Tendencia</p>
              <h2>Valor cerrado por mes</h2>
              <p>
                Últimos meses con cierres dentro del filtro actual. Solo se
                incluyen cierres vigentes.
              </p>
            </div>
          </div>
          <div className="month-bars">
            {monthly.map((month) => (
              <div className="month-bar" key={month.key}>
                <div className="month-bar__head">
                  <span>{month.label}</span>
                  <strong>{formatCOP(month.total)}</strong>
                </div>
                <div className="month-bar__track">
                  <span
                    style={{
                      width: `${Math.max(4, (month.total / maxMonthly) * 100)}%`,
                    }}
                  />
                </div>
                <small>
                  {month.count} {month.count === 1 ? "cierre" : "cierres"}
                </small>
              </div>
            ))}
          </div>
        </section>
      )}

      <p className="dashboard-note">
        Los valores del reporte corresponden a los cierres vigentes (no
        anulados) y a los filtros aplicados. La exportación en Excel respeta la
        misma selección.
      </p>
    </DashboardLayout>
  );
}
