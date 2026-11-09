import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  BarChart3,
  Database,
  Handshake,
  RefreshCw,
  ShieldCheck,
  Users,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import DashboardLayout from "../../components/layout/DashboardLayout.jsx";
import StatCard from "../../components/admin/StatCard.jsx";
import SimulationChartCard from "../../components/admin/SimulationChartCard.jsx";
import EmptyState from "../../components/ui/EmptyState.jsx";
import ErrorState from "../../components/ui/ErrorState.jsx";
import { PageLoader } from "../../components/ui/Spinner.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { useI18n } from "../../i18n/I18nContext.jsx";
import { usePageTitle } from "../../hooks/usePageTitle.js";
import { adminNav } from "../../config/dashboardNav.js";
import { fetchSimulationOverview } from "../../services/simulationService.js";
import { getErrorMessage } from "../../utils/errors.js";

const PALETTE = ["#1b639e", "#2f6d5a", "#a5523d", "#c9a227", "#7d8fa1"];

const SERIES_COLORS = {
  active: "#2f6d5a",
  inactive: "#a5523d",
  unknown: "#7d8fa1",
  admin: "#1b639e",
  superadmin: "#c9a227",
  invalid: "#a5523d",
};

const simulationNav = adminNav.map((item) =>
  item.key === "simulacion" || item.key === "cuenta"
    ? item
    : { ...item, to: "/admin" },
);

const tooltipStyle = {
  border: "1px solid rgba(60, 70, 79, 0.13)",
  borderRadius: 12,
  boxShadow: "0 6px 20px rgba(28, 42, 51, 0.06)",
  fontSize: 12,
};

const axisTick = { fontSize: 11, fill: "#6f787e" };

const translateLabel = (t, key) => {
  const path = `dashboard.simulation.labels.${key}`;
  const value = t(path);
  return value === path ? key : value;
};

const colorFor = (key, index) =>
  SERIES_COLORS[key] || PALETTE[index % PALETTE.length];

function BalanceBarChart({ summary }) {
  const { t, formatNumber } = useI18n();
  const data = (summary?.bins || []).map((bin) => ({
    range: t("dashboard.simulation.labels.range", {
      from: formatNumber(bin.from),
      to: formatNumber(bin.to),
    }),
    count: bin.count,
  }));

  return (
    <BarChart
      data={data}
      layout="vertical"
      margin={{ top: 4, right: 20, bottom: 4, left: 0 }}
    >
      <CartesianGrid
        strokeDasharray="3 3"
        horizontal={false}
        stroke="rgba(60, 70, 79, 0.12)"
      />
      <XAxis
        type="number"
        allowDecimals={false}
        tickFormatter={formatNumber}
        tick={axisTick}
      />
      <YAxis
        type="category"
        dataKey="range"
        width={96}
        tick={axisTick}
      />
      <Tooltip
        cursor={{ fill: "rgba(27, 99, 158, 0.06)" }}
        contentStyle={tooltipStyle}
        formatter={(value, name) => [formatNumber(value), name]}
      />
      <Bar
        dataKey="count"
        name={t("dashboard.simulation.axes.count")}
        fill="#1b639e"
        radius={[0, 6, 6, 0]}
        maxBarSize={22}
        isAnimationActive={false}
      />
    </BarChart>
  );
}

function CategoryBarChart({ items = [], color = "#1b639e", categoryWidth = 112 }) {
  const { t, formatNumber } = useI18n();
  const data = items.map((item) => ({
    ...item,
    label: translateLabel(t, item.key),
  }));

  return (
    <BarChart
      data={data}
      layout="vertical"
      margin={{ top: 4, right: 20, bottom: 4, left: 0 }}
    >
      <CartesianGrid
        strokeDasharray="3 3"
        horizontal={false}
        stroke="rgba(60, 70, 79, 0.12)"
      />
      <XAxis
        type="number"
        allowDecimals={false}
        tickFormatter={formatNumber}
        tick={axisTick}
      />
      <YAxis
        type="category"
        dataKey="label"
        width={categoryWidth}
        tick={axisTick}
      />
      <Tooltip
        cursor={{ fill: "rgba(27, 99, 158, 0.06)" }}
        contentStyle={tooltipStyle}
        formatter={(value, name) => [formatNumber(value), name]}
      />
      <Bar
        dataKey="value"
        name={t("dashboard.simulation.axes.count")}
        fill={color}
        radius={[0, 6, 6, 0]}
        maxBarSize={24}
        isAnimationActive={false}
      />
    </BarChart>
  );
}

function BreakdownPieChart({ items = [], innerRadius = 55 }) {
  const { t, formatNumber } = useI18n();
  const data = items.map((item) => ({
    ...item,
    label: translateLabel(t, item.key),
  }));

  return (
    <PieChart>
      <Pie
        data={data}
        dataKey="value"
        nameKey="label"
        innerRadius={innerRadius}
        outerRadius={95}
        paddingAngle={2}
        isAnimationActive={false}
      >
        {data.map((entry, index) => (
          <Cell key={entry.key} fill={colorFor(entry.key, index)} />
        ))}
      </Pie>
      <Tooltip
        contentStyle={tooltipStyle}
        formatter={(value, name) => [formatNumber(value), name]}
      />
      <Legend
        verticalAlign="bottom"
        iconType="circle"
        wrapperStyle={{ fontSize: 12 }}
      />
    </PieChart>
  );
}

export default function SimulationPage() {
  const { t, formatNumber, formatDateTime } = useI18n();
  const { profile } = useAuth();
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  usePageTitle(
    t("dashboard.simulation.pageTitle"),
    t("dashboard.simulation.pageDescription"),
  );

  const load = useCallback(async ({ silent = false } = {}) => {
    if (silent) setRefreshing(true);
    else setLoading(true);
    setError("");
    try {
      setOverview(await fetchSimulationOverview());
    } catch (loadError) {
      setError(getErrorMessage(loadError, "dashboard.simulation.loadError"));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const totals = overview?.totals || {};
  const charts = overview?.charts || {};
  const buyerBalances = charts.buyerBalances || { bins: [], excluded: 0 };
  const sellerBalances = charts.sellerBalances || { bins: [], excluded: 0 };
  const isEmpty =
    Boolean(overview) &&
    Object.values(totals).every((value) => !Number(value));

  const chartHeading = (key) => ({
    eyebrow: t(`dashboard.simulation.charts.${key}.eyebrow`),
    title: t(`dashboard.simulation.charts.${key}.title`),
    description: t(`dashboard.simulation.charts.${key}.description`),
  });

  const excludedNote = (summary) =>
    summary.excluded
      ? t("dashboard.simulation.labels.excluded", { count: summary.excluded })
      : "";

  return (
    <DashboardLayout
      role={profile?.rol}
      navItems={simulationNav}
      activeKey="simulacion"
      title={t("dashboard.simulation.title")}
      subtitle={t("dashboard.simulation.subtitle")}
      actions={
        <>
          <Link
            to="/admin"
            className="btn btn-outline-secondary btn-sm dashboard-action"
          >
            <ArrowLeft size={15} aria-hidden="true" />
            {t("dashboard.simulation.back")}
          </Link>
          <button
            type="button"
            className="btn btn-primary btn-sm dashboard-action"
            onClick={() => load({ silent: true })}
            disabled={loading || refreshing}
          >
            <RefreshCw
              size={15}
              className={refreshing ? "spin" : undefined}
              aria-hidden="true"
            />
            {refreshing
              ? t("dashboard.simulation.refreshing")
              : t("dashboard.simulation.refresh")}
          </button>
        </>
      }
    >
      {loading && !overview ? (
        <PageLoader message={t("dashboard.simulation.loading")} />
      ) : error ? (
        <ErrorState
          title={t("dashboard.simulation.errorTitle")}
          description={error}
          onRetry={() => load()}
          retryLabel={t("dashboard.simulation.retry")}
        />
      ) : isEmpty ? (
        <EmptyState
          icon={BarChart3}
          title={t("dashboard.simulation.emptyTitle")}
          description={t("dashboard.simulation.emptyDescription")}
        />
      ) : overview ? (
        <>
          <div className="simulation-summary">
            <div className="stat-grid">
              <StatCard
                icon={Users}
                label={t("dashboard.simulation.stats.buyers")}
                value={formatNumber(totals.buyers)}
                hint={t("dashboard.simulation.stats.buyersHint")}
                tone="blue"
              />
              <StatCard
                icon={Handshake}
                label={t("dashboard.simulation.stats.sellers")}
                value={formatNumber(totals.sellers)}
                hint={t("dashboard.simulation.stats.sellersHint")}
                tone="green"
              />
              <StatCard
                icon={ShieldCheck}
                label={t("dashboard.simulation.stats.admins")}
                value={formatNumber(totals.admins)}
                hint={t("dashboard.simulation.stats.adminsHint")}
                tone="sand"
              />
              <StatCard
                icon={Database}
                label={t("dashboard.simulation.stats.rawAdminRows")}
                value={formatNumber(totals.rawAdminRows)}
                hint={t("dashboard.simulation.stats.rawAdminRowsHint")}
                tone="slate"
              />
            </div>
            <p className="dashboard-note simulation-note">
              {t("dashboard.simulation.sourceNote")}
              <span className="simulation-note__stamp">
                {t("dashboard.simulation.generatedAt", {
                  date: formatDateTime(overview.generatedAt),
                })}
              </span>
            </p>
          </div>

          <section className="simulation-section">
            <div className="simulation-section__heading">
              <p className="eyebrow">
                {t("dashboard.simulation.sections.buyers.eyebrow")}
              </p>
              <h2>{t("dashboard.simulation.sections.buyers.title")}</h2>
              <p>{t("dashboard.simulation.sections.buyers.text")}</p>
            </div>
            <div className="simulation-chart-grid">
              <SimulationChartCard
                testId="chart-buyer-balances"
                {...chartHeading("buyerBalances")}
                empty={!buyerBalances.bins?.length}
                emptyLabel={t("dashboard.simulation.noData")}
                footnote={excludedNote(buyerBalances)}
              >
                <BalanceBarChart summary={buyerBalances} />
              </SimulationChartCard>
              <SimulationChartCard
                testId="chart-buyer-status"
                {...chartHeading("buyerStatus")}
                empty={!charts.buyerStatus?.length}
                emptyLabel={t("dashboard.simulation.noData")}
              >
                <BreakdownPieChart items={charts.buyerStatus || []} />
              </SimulationChartCard>
              <SimulationChartCard
                testId="chart-buyer-interests"
                {...chartHeading("buyerInterests")}
                empty={!charts.buyerInterests?.length}
                emptyLabel={t("dashboard.simulation.noData")}
              >
                <CategoryBarChart
                  items={charts.buyerInterests || []}
                  color="#a5523d"
                />
              </SimulationChartCard>
            </div>
          </section>

          <section className="simulation-section">
            <div className="simulation-section__heading">
              <p className="eyebrow">
                {t("dashboard.simulation.sections.sellers.eyebrow")}
              </p>
              <h2>{t("dashboard.simulation.sections.sellers.title")}</h2>
              <p>{t("dashboard.simulation.sections.sellers.text")}</p>
            </div>
            <div className="simulation-chart-grid">
              <SimulationChartCard
                testId="chart-seller-balances"
                {...chartHeading("sellerBalances")}
                empty={!sellerBalances.bins?.length}
                emptyLabel={t("dashboard.simulation.noData")}
                footnote={excludedNote(sellerBalances)}
              >
                <BalanceBarChart summary={sellerBalances} />
              </SimulationChartCard>
              <SimulationChartCard
                testId="chart-seller-status"
                {...chartHeading("sellerStatus")}
                empty={!charts.sellerStatus?.length}
                emptyLabel={t("dashboard.simulation.noData")}
              >
                <BreakdownPieChart items={charts.sellerStatus || []} />
              </SimulationChartCard>
              <SimulationChartCard
                testId="chart-seller-sold"
                {...chartHeading("sellerSoldProperties")}
                empty={!charts.sellerSoldProperties?.length}
                emptyLabel={t("dashboard.simulation.noData")}
              >
                <CategoryBarChart
                  items={charts.sellerSoldProperties || []}
                  color="#2f6d5a"
                  categoryWidth={96}
                />
              </SimulationChartCard>
            </div>
          </section>

          <section className="simulation-section">
            <div className="simulation-section__heading">
              <p className="eyebrow">
                {t("dashboard.simulation.sections.admins.eyebrow")}
              </p>
              <h2>{t("dashboard.simulation.sections.admins.title")}</h2>
              <p>{t("dashboard.simulation.sections.admins.text")}</p>
            </div>
            <div className="simulation-chart-grid">
              <SimulationChartCard
                testId="chart-admin-types"
                {...chartHeading("adminTypes")}
                empty={!charts.adminTypes?.length}
                emptyLabel={t("dashboard.simulation.noData")}
              >
                <BreakdownPieChart items={charts.adminTypes || []} />
              </SimulationChartCard>
              <SimulationChartCard
                testId="chart-admin-share"
                {...chartHeading("adminTypeShare")}
                empty={!charts.adminTypeShare?.length}
                emptyLabel={t("dashboard.simulation.noData")}
              >
                <BreakdownPieChart
                  items={charts.adminTypeShare || []}
                  innerRadius={68}
                />
              </SimulationChartCard>
              <SimulationChartCard
                testId="chart-admin-quality"
                {...chartHeading("adminQuality")}
                empty={!charts.adminQuality?.length}
                emptyLabel={t("dashboard.simulation.noData")}
              >
                <CategoryBarChart
                  items={charts.adminQuality || []}
                  color="#c9a227"
                  categoryWidth={120}
                />
              </SimulationChartCard>
            </div>
          </section>
        </>
      ) : null}
    </DashboardLayout>
  );
}
