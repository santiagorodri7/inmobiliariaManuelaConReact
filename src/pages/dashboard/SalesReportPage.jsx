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
import { useI18n } from "../../i18n/I18nContext.jsx";
import { adminNav } from "../../config/dashboardNav.js";
import { filterSales, listSales, salesStats } from "../../services/salesService.js";
import { exportSales } from "../../services/excelService.js";
import { getErrorMessage } from "../../utils/errors.js";
import { toDate } from "../../utils/dates.js";

const PAGE_SIZE = 10;

const initialFilters = {
  search: "",
  from: "",
  to: "",
  operation: "",
  status: "",
};

const reportNav = adminNav.map((item) =>
  item.key === "reportes" || item.key === "cuenta"
    ? item
    : { ...item, to: "/admin" },
);

export default function SalesReportPage() {
  const { t, locale, formatCOP } = useI18n();
  usePageTitle(t("dashboard.salesReport.pageTitle"), t("dashboard.salesReport.pageDescription"));
  const { profile } = useAuth();
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState(initialFilters);
  const [page, setPage] = useState(1);

  const monthLabel = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        month: "short",
        year: "numeric",
      }),
    [locale],
  );

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      setSales(await listSales());
    } catch (loadError) {
      setError(
        getErrorMessage(loadError, "dashboard.salesReport.loadError"),
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
  }, [filtered, monthLabel]);

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
      title={t("dashboard.salesReport.title")}
      subtitle={t("dashboard.salesReport.subtitle")}
      actions={
        <>
          <Link to="/admin" className="btn btn-outline-secondary btn-sm dashboard-action">
            <ArrowLeft size={15} aria-hidden="true" />
            {t("dashboard.salesReport.back")}
          </Link>
          <ExportButton
            onExport={() => exportSales(filtered)}
            label={t("dashboard.salesReport.export")}
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
          label={t("dashboard.salesReport.stats.closed")}
          value={stats.closed}
          hint={t("dashboard.salesReport.stats.closedHint", {
            count: stats.annulled,
          })}
          tone="blue"
        />
        <StatCard
          icon={Wallet}
          label={t("dashboard.salesReport.stats.total")}
          value={formatCOP(stats.totalValue)}
          hint={t("dashboard.salesReport.stats.totalHint")}
          tone="green"
        />
        <StatCard
          icon={TrendingUp}
          label={t("dashboard.salesReport.stats.average")}
          value={formatCOP(stats.averageValue)}
          hint={t("dashboard.salesReport.stats.averageHint")}
          tone="sand"
        />
        <StatCard
          icon={CalendarDays}
          label={t("dashboard.salesReport.stats.split")}
          value={`${stats.salesCount} / ${stats.rentalCount}`}
          hint={t("dashboard.salesReport.stats.splitHint")}
          tone="slate"
        />
      </div>

      <section className="surface panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">{t("dashboard.salesReport.filters.eyebrow")}</p>
            <h2>{t("dashboard.salesReport.filters.title")}</h2>
            <p>{t("dashboard.salesReport.filters.text")}</p>
          </div>
          {hasFilters && (
            <span className="filter-count">
              {t("dashboard.salesReport.filters.results", {
                count: filtered.length,
              })}
            </span>
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
          title={t("dashboard.salesReport.errorTitle")}
          description={error}
          onRetry={load}
        />
      ) : (
        <section className="surface panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">{t("dashboard.salesReport.detail.eyebrow")}</p>
              <h2>{t("dashboard.salesReport.detail.title")}</h2>
              <p>
                {loading
                  ? t("dashboard.salesReport.detail.loading")
                  : t("dashboard.salesReport.detail.count", {
                      count: filtered.length,
                    })}
              </p>
            </div>
            {filtered.length > 0 && (
              <Link to="/admin" className="text-link">
                {t("dashboard.salesReport.detail.adminPanel")}
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
                    ? t("dashboard.salesReport.emptyFilteredTitle")
                    : t("dashboard.salesReport.emptyTitle")
                }
                description={
                  sales.length
                    ? t("dashboard.salesReport.emptyFilteredDescription")
                    : t("dashboard.salesReport.emptyDescription")
                }
                action={
                  <Link to="/admin" className="btn btn-primary">
                    {t("dashboard.salesReport.emptyAction")}
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
              <p className="eyebrow">{t("dashboard.salesReport.trend.eyebrow")}</p>
              <h2>{t("dashboard.salesReport.trend.title")}</h2>
              <p>{t("dashboard.salesReport.trend.text")}</p>
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
                  {month.count === 1
                    ? t("dashboard.salesReport.trend.one", {
                        count: month.count,
                      })
                    : t("dashboard.salesReport.trend.other", {
                        count: month.count,
                      })}
                </small>
              </div>
            ))}
          </div>
        </section>
      )}

      <p className="dashboard-note">{t("dashboard.salesReport.note")}</p>
    </DashboardLayout>
  );
}
