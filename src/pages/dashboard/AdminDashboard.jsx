import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Building2,
  FileSpreadsheet,
  Handshake,
  Plus,
  Search,
  TrendingUp,
  Users,
  Wallet,
  Wrench,
} from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout.jsx";
import StatCard from "../../components/admin/StatCard.jsx";
import UsersTable from "../../components/admin/UsersTable.jsx";
import PropertiesTable from "../../components/admin/PropertiesTable.jsx";
import SalesTable from "../../components/admin/SalesTable.jsx";
import SalesFilters from "../../components/admin/SalesFilters.jsx";
import SaleForm from "../../components/admin/SaleForm.jsx";
import ExportButton from "../../components/admin/ExportButton.jsx";
import Pagination, { paginate } from "../../components/ui/Pagination.jsx";
import ConfirmDialog from "../../components/ui/ConfirmDialog.jsx";
import EmptyState from "../../components/ui/EmptyState.jsx";
import { useToast } from "../../components/ui/Toast.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { usePageTitle } from "../../hooks/usePageTitle.js";
import { useI18n } from "../../i18n/I18nContext.jsx";
import { adminNav } from "../../config/dashboardNav.js";
import { listUsers, setUserActive } from "../../services/usersService.js";
import {
  listAllProperties,
  setPropertyStatus,
  propertyStats,
} from "../../services/propertiesService.js";
import {
  annulSale,
  filterSales,
  listSales,
  salesStats,
} from "../../services/salesService.js";
import { writeAudit } from "../../services/auditService.js";
import { backfillLegacyData } from "../../services/maintenanceService.js";
import {
  exportAll,
  exportProperties,
  exportSales,
  exportUsers,
} from "../../services/excelService.js";
import { getErrorMessage } from "../../utils/errors.js";
import { normalizeText } from "../../utils/format.js";
import { normalizeRole, ROLES } from "../../utils/roles.js";

const PAGE_SIZE = 8;

const initialUserFilters = { search: "", role: "", status: "" };
const initialPropertyFilters = { search: "", operation: "", status: "" };
const initialSalesFilters = {
  search: "",
  from: "",
  to: "",
  operation: "",
  status: "",
};

export default function AdminDashboard() {
  const { t, formatCOP } = useI18n();
  usePageTitle(
    t("dashboard.admin.pageTitle"),
    t("dashboard.admin.pageDescription"),
  );
  const { profile } = useAuth();
  const toast = useToast();
  const [section, setSection] = useState("resumen");
  const [users, setUsers] = useState([]);
  const [properties, setProperties] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({ users: "", properties: "", sales: "" });
  const [busyId, setBusyId] = useState("");
  const [saleFormOpen, setSaleFormOpen] = useState(false);
  const [saleInitialProperty, setSaleInitialProperty] = useState("");
  const [annulTarget, setAnnulTarget] = useState(null);
  const [maintenanceOpen, setMaintenanceOpen] = useState(false);
  const [maintenanceBusy, setMaintenanceBusy] = useState(false);

  const [userFilters, setUserFilters] = useState(initialUserFilters);
  const [propertyFilters, setPropertyFilters] = useState(initialPropertyFilters);
  const [salesFilters, setSalesFilters] = useState(initialSalesFilters);
  const [userPage, setUserPage] = useState(1);
  const [propertyPage, setPropertyPage] = useState(1);
  const [salesPage, setSalesPage] = useState(1);

  const sectionTitles = {
    resumen: t("dashboard.admin.sectionTitles.summary"),
    propiedades: t("dashboard.admin.sectionTitles.properties"),
    usuarios: t("dashboard.admin.sectionTitles.users"),
    ventas: t("dashboard.admin.sectionTitles.sales"),
  };

  const loadAll = useCallback(async () => {
    setLoading(true);
    const [usersResult, propertiesResult, salesResult] = await Promise.allSettled([
      listUsers(),
      listAllProperties(),
      listSales(),
    ]);

    setUsers(usersResult.status === "fulfilled" ? usersResult.value : []);
    setProperties(
      propertiesResult.status === "fulfilled" ? propertiesResult.value : [],
    );
    setSales(salesResult.status === "fulfilled" ? salesResult.value : []);
    setErrors({
      users:
        usersResult.status === "rejected"
          ? getErrorMessage(usersResult.reason, "dashboard.admin.load.usersError")
          : "",
      properties:
        propertiesResult.status === "rejected"
          ? getErrorMessage(
              propertiesResult.reason,
              "dashboard.admin.load.propertiesError",
            )
          : "",
      sales:
        salesResult.status === "rejected"
          ? getErrorMessage(salesResult.reason, "dashboard.admin.load.salesError")
          : "",
    });
    setLoading(false);
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const propertySummary = useMemo(() => propertyStats(properties), [properties]);
  const salesSummary = useMemo(() => salesStats(sales), [sales]);

  const filteredUsers = useMemo(() => {
    const search = normalizeText(userFilters.search);
    return users.filter((user) => {
      if (userFilters.role && normalizeRole(user.rol) !== userFilters.role) {
        return false;
      }
      if (userFilters.status === "activo" && user.activo === false) return false;
      if (userFilters.status === "inactivo" && user.activo !== false) return false;
      if (!search) return true;
      return normalizeText(
        [user.nombre, user.email, user.cedula, user.telefono].join(" "),
      ).includes(search);
    });
  }, [userFilters, users]);

  const filteredProperties = useMemo(() => {
    const search = normalizeText(propertyFilters.search);
    return properties.filter((property) => {
      if (
        propertyFilters.operation &&
        property.operation !== propertyFilters.operation
      ) {
        return false;
      }
      if (propertyFilters.status && property.status !== propertyFilters.status) {
        return false;
      }
      if (!search) return true;
      return normalizeText(
        [property.title, property.location, property.type, property.ownerName].join(
          " ",
        ),
      ).includes(search);
    });
  }, [propertyFilters, properties]);

  const filteredSales = useMemo(
    () => filterSales(sales, salesFilters),
    [sales, salesFilters],
  );

  const usersPageData = paginate(filteredUsers, userPage, PAGE_SIZE);
  const propertiesPageData = paginate(
    filteredProperties,
    propertyPage,
    PAGE_SIZE,
  );
  const salesPageData = paginate(filteredSales, salesPage, PAGE_SIZE);

  const changeUserFilter = (field, value) => {
    setUserFilters((current) => ({ ...current, [field]: value }));
    setUserPage(1);
  };

  const changePropertyFilter = (field, value) => {
    setPropertyFilters((current) => ({ ...current, [field]: value }));
    setPropertyPage(1);
  };

  const changeSalesFilter = (field, value) => {
    setSalesFilters((current) => ({ ...current, [field]: value }));
    setSalesPage(1);
  };

  const toggleUser = async (user) => {
    const nextActive = user.activo === false;
    setBusyId(`user-${user.id}`);
    try {
      await setUserActive(user.id, nextActive, profile.id);
      await writeAudit({
        action: nextActive ? "reactivateUser" : "deactivateUser",
        actorId: profile.id,
        actorEmail: profile.email,
        targetType: "usuario",
        targetId: user.id,
        details: { nombre: user.nombre, email: user.email },
      });
      setUsers((current) =>
        current.map((item) =>
          item.id === user.id ? { ...item, activo: nextActive } : item,
        ),
      );
      toast.success(
        nextActive
          ? t("dashboard.admin.userToggle.reactivated")
          : t("dashboard.admin.userToggle.deactivated"),
      );
    } catch (toggleError) {
      toast.error(
        getErrorMessage(toggleError, "dashboard.admin.userToggle.error"),
      );
    } finally {
      setBusyId("");
    }
  };

  const toggleProperty = async (property) => {
    const nextStatus =
      property.status === "disponible" ? "inactiva" : "disponible";
    setBusyId(`property-${property.id}`);
    try {
      const updated = await setPropertyStatus(property, nextStatus, profile);
      setProperties((current) =>
        current.map((item) => (item.id === property.id ? updated : item)),
      );
      toast.success(
        nextStatus === "disponible"
          ? t("dashboard.admin.propertyToggle.published")
          : t("dashboard.admin.propertyToggle.hidden"),
      );
    } catch (toggleError) {
      toast.error(
        getErrorMessage(toggleError, "dashboard.admin.propertyToggle.error"),
      );
    } finally {
      setBusyId("");
    }
  };

  const openSaleForm = (property = null) => {
    setSaleInitialProperty(property?.id || "");
    setSaleFormOpen(true);
  };

  const handleAnnul = async () => {
    if (!annulTarget) return;
    setBusyId(`sale-${annulTarget.id}`);
    try {
      await annulSale(annulTarget.id, { admin: profile });
      toast.success(t("dashboard.admin.annul.success"));
      setAnnulTarget(null);
      await loadAll();
    } catch (annulError) {
      toast.error(
        getErrorMessage(annulError, "dashboard.admin.annul.error"),
      );
    } finally {
      setBusyId("");
    }
  };

  const handleBackfill = async () => {
    setMaintenanceBusy(true);
    try {
      const result = await backfillLegacyData(profile);
      const removed = result.ownerEmailsRemoved || 0;
      toast.success(
        t("dashboard.admin.backfill.success", {
          properties: result.propertiesUpdated || 0,
          testimonials: result.testimonialsUpdated || 0,
          removed: removed
            ? t("dashboard.admin.backfill.removed", { count: removed })
            : "",
        }),
      );
      setMaintenanceOpen(false);
      await loadAll();
    } catch (backfillError) {
      toast.error(
        getErrorMessage(
          backfillError,
          "dashboard.admin.backfill.error",
        ),
      );
    } finally {
      setMaintenanceBusy(false);
    }
  };

  const summaryActions = (
    <>
      <ExportButton
        onExport={() => exportAll({ users, properties, sales })}
        label={t("dashboard.admin.exportAll")}
        variant="outline-secondary"
        size="sm"
        disabled={!users.length && !properties.length && !sales.length}
      />
      <button
        type="button"
        className="btn btn-primary btn-sm dashboard-action"
        onClick={() => openSaleForm()}
      >
        <Plus size={15} aria-hidden="true" />
        {t("dashboard.admin.registerSale")}
      </button>
    </>
  );

  return (
    <DashboardLayout
      role={profile?.rol}
      navItems={adminNav}
      activeKey={section}
      onNavigate={setSection}
      title={sectionTitles[section]}
      subtitle={t("dashboard.admin.subtitle")}
      actions={
        section === "resumen" ? (
          summaryActions
        ) : section === "propiedades" ? (
          <>
            <ExportButton
              onExport={() => exportProperties(filteredProperties)}
              label={t("dashboard.admin.exportProperties")}
              variant="outline-secondary"
              size="sm"
              disabled={!filteredProperties.length}
            />
            <button
              type="button"
              className="btn btn-primary btn-sm dashboard-action"
              onClick={() => openSaleForm()}
            >
              <Plus size={15} aria-hidden="true" />
              {t("dashboard.admin.registerSale")}
            </button>
          </>
        ) : section === "usuarios" ? (
          <ExportButton
            onExport={() => exportUsers(filteredUsers)}
            label={t("dashboard.admin.exportUsers")}
            variant="outline-secondary"
            size="sm"
            disabled={!filteredUsers.length}
          />
        ) : (
          <ExportButton
            onExport={() => exportSales(filteredSales)}
            label={t("dashboard.admin.exportSales")}
            variant="outline-secondary"
            size="sm"
            disabled={!filteredSales.length}
          />
        )
      }
    >
      {section === "resumen" && (
        <>
          <section className="dash-welcome">
            <div>
              <p className="eyebrow">
                {t("dashboard.admin.welcomeHello", {
                  name:
                    profile?.nombre?.split(" ")[0] ||
                    t("dashboard.admin.welcomeDefault"),
                })}
              </p>
              <h2>{t("dashboard.admin.welcomeTitle")}</h2>
              <p>{t("dashboard.admin.welcomeText")}</p>
            </div>
            <div className="dash-welcome__actions">
              <button type="button" className="btn btn-primary" onClick={() => openSaleForm()}>
                <Handshake size={16} aria-hidden="true" />
                {t("dashboard.admin.registerSale")}
              </button>
              <Link to="/admin/reportes-ventas" className="btn btn-outline-secondary">
                {t("dashboard.admin.salesReport")}
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>
          </section>

          <div className="stat-grid">
            <StatCard
              icon={Users}
              label={t("dashboard.admin.stats.users")}
              value={users.length}
              hint={t("dashboard.admin.stats.usersHint", {
                count: users.filter((user) => user.activo !== false).length,
              })}
              tone="blue"
            />
            <StatCard
              icon={Building2}
              label={t("dashboard.admin.stats.published")}
              value={propertySummary.available}
              hint={t("dashboard.admin.stats.publishedHint", {
                total: propertySummary.total,
                closed: propertySummary.closed,
              })}
              tone="sand"
            />
            <StatCard
              icon={Handshake}
              label={t("dashboard.admin.stats.sales")}
              value={salesSummary.closed}
              hint={t("dashboard.admin.stats.salesHint", {
                count: salesSummary.annulled,
              })}
              tone="green"
            />
            <StatCard
              icon={Wallet}
              label={t("dashboard.admin.stats.salesValue")}
              value={formatCOP(salesSummary.totalValue)}
              hint={t("dashboard.admin.stats.salesValueHint")}
              tone="slate"
            />
          </div>

          <div className="dashboard-grid dashboard-grid--main">
            <section className="surface panel">
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">{t("dashboard.admin.recent.eyebrow")}</p>
                  <h2>{t("dashboard.admin.recent.title")}</h2>
                  <p>{t("dashboard.admin.recent.text")}</p>
                </div>
                <button
                  type="button"
                  className="text-link text-link--button"
                  onClick={() => setSection("ventas")}
                >
                  {t("dashboard.admin.recent.viewAll")}
                  <ArrowRight size={16} aria-hidden="true" />
                </button>
              </div>
              <SalesTable
                sales={sales.slice(0, 4)}
                loading={loading}
                error={errors.sales}
                onRetry={loadAll}
                onAnnul={setAnnulTarget}
                busyId={busyId.replace("sale-", "")}
                compact
              />
            </section>

            <section className="surface panel">
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">{t("dashboard.admin.catalog.eyebrow")}</p>
                  <h2>{t("dashboard.admin.catalog.title")}</h2>
                </div>
              </div>
              <div className="breakdown-list">
                <div>
                  <span>{t("dashboard.admin.catalog.published")}</span>
                  <strong>{propertySummary.available}</strong>
                </div>
                <div>
                  <span>{t("dashboard.admin.catalog.hidden")}</span>
                  <strong>{propertySummary.hidden}</strong>
                </div>
                <div>
                  <span>{t("dashboard.admin.catalog.closed")}</span>
                  <strong>{propertySummary.closed}</strong>
                </div>
                <div>
                  <span>{t("dashboard.admin.catalog.value")}</span>
                  <strong>{formatCOP(propertySummary.portfolioValue)}</strong>
                </div>
              </div>
              <div className="quick-actions">
                <button type="button" onClick={() => setSection("propiedades")}>
                  <Building2 size={17} aria-hidden="true" />
                  {t("dashboard.admin.catalog.reviewProperties")}
                  <ArrowRight size={15} aria-hidden="true" />
                </button>
                <button type="button" onClick={() => setSection("usuarios")}>
                  <Users size={17} aria-hidden="true" />
                  {t("dashboard.admin.catalog.reviewUsers")}
                  <ArrowRight size={15} aria-hidden="true" />
                </button>
                <Link to="/admin/reportes-ventas">
                  <FileSpreadsheet size={17} aria-hidden="true" />
                  {t("dashboard.admin.catalog.openReport")}
                  <ArrowRight size={15} aria-hidden="true" />
                </Link>
              </div>
            </section>
          </div>

          <section className="surface panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">{t("dashboard.admin.maintenance.eyebrow")}</p>
                <h2>{t("dashboard.admin.maintenance.title")}</h2>
                <p>{t("dashboard.admin.maintenance.text")}</p>
              </div>
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm"
                onClick={() => setMaintenanceOpen(true)}
                disabled={maintenanceBusy}
              >
                <Wrench size={15} aria-hidden="true" />
                {t("dashboard.admin.maintenance.action")}
              </button>
            </div>
          </section>

          {!loading && !properties.length && !sales.length && (
            <EmptyState
              icon={TrendingUp}
              title={t("dashboard.admin.emptyTitle")}
              description={t("dashboard.admin.emptyDescription")}
              action={
                <Link to="/vendedor" className="btn btn-primary">
                  {t("dashboard.admin.emptyAction")}
                </Link>
              }
              compact
            />
          )}
        </>
      )}

      {section === "usuarios" && (
        <section className="surface panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">{t("dashboard.admin.users.eyebrow")}</p>
              <h2>{t("dashboard.admin.users.title")}</h2>
              <p>
                {t("dashboard.admin.users.summary", {
                  filtered: filteredUsers.length,
                  total: users.length,
                })}
              </p>
            </div>
          </div>

          <div className="admin-toolbar">
            <label className="admin-search">
              <span className="visually-hidden">
                {t("dashboard.admin.users.searchAria")}
              </span>
              <Search size={17} aria-hidden="true" />
              <input
                type="search"
                className="form-control"
                value={userFilters.search}
                onChange={(event) => changeUserFilter("search", event.target.value)}
                placeholder={t("dashboard.admin.users.searchPlaceholder")}
              />
            </label>
            <select
              className="form-select"
              value={userFilters.role}
              onChange={(event) => changeUserFilter("role", event.target.value)}
              aria-label={t("dashboard.admin.users.roleAria")}
            >
              <option value="">{t("dashboard.admin.users.allRoles")}</option>
              <option value={ROLES.ADMIN}>{t("dashboard.admin.users.adminRole")}</option>
              <option value={ROLES.SELLER}>{t("dashboard.admin.users.sellerRole")}</option>
              <option value={ROLES.BUYER}>{t("dashboard.admin.users.buyerRole")}</option>
            </select>
            <select
              className="form-select"
              value={userFilters.status}
              onChange={(event) => changeUserFilter("status", event.target.value)}
              aria-label={t("dashboard.admin.users.statusAria")}
            >
              <option value="">{t("dashboard.admin.users.allStatuses")}</option>
              <option value="activo">{t("dashboard.admin.users.active")}</option>
              <option value="inactivo">{t("dashboard.admin.users.inactive")}</option>
            </select>
          </div>

          <UsersTable
            users={usersPageData.items}
            loading={loading}
            error={errors.users}
            onRetry={loadAll}
            onToggle={toggleUser}
            busyId={busyId.replace("user-", "")}
            currentUserId={profile?.id}
          />
          <Pagination
            page={usersPageData.page}
            totalPages={usersPageData.totalPages}
            totalItems={usersPageData.totalItems}
            pageSize={PAGE_SIZE}
            onChange={setUserPage}
          />
        </section>
      )}

      {section === "propiedades" && (
        <section className="surface panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">{t("dashboard.admin.properties.eyebrow")}</p>
              <h2>{t("dashboard.admin.properties.title")}</h2>
              <p>
                {t("dashboard.admin.properties.summary", {
                  filtered: filteredProperties.length,
                  total: properties.length,
                })}
              </p>
            </div>
          </div>

          <div className="admin-toolbar">
            <label className="admin-search">
              <span className="visually-hidden">
                {t("dashboard.admin.properties.searchAria")}
              </span>
              <Search size={17} aria-hidden="true" />
              <input
                type="search"
                className="form-control"
                value={propertyFilters.search}
                onChange={(event) =>
                  changePropertyFilter("search", event.target.value)
                }
                placeholder={t("dashboard.admin.properties.searchPlaceholder")}
              />
            </label>
            <select
              className="form-select"
              value={propertyFilters.operation}
              onChange={(event) =>
                changePropertyFilter("operation", event.target.value)
              }
              aria-label={t("dashboard.admin.properties.operationAria")}
            >
              <option value="">{t("dashboard.admin.properties.allOperations")}</option>
              <option value="venta">{t("dashboard.admin.properties.sale")}</option>
              <option value="renta">{t("dashboard.admin.properties.rent")}</option>
            </select>
            <select
              className="form-select"
              value={propertyFilters.status}
              onChange={(event) =>
                changePropertyFilter("status", event.target.value)
              }
              aria-label={t("dashboard.admin.properties.statusAria")}
            >
              <option value="">{t("dashboard.admin.properties.allStatuses")}</option>
              <option value="disponible">
                {t("dashboard.admin.properties.published")}
              </option>
              <option value="inactiva">
                {t("dashboard.admin.properties.hidden")}
              </option>
              <option value="vendida">
                {t("dashboard.admin.properties.sold")}
              </option>
              <option value="rentada">
                {t("dashboard.admin.properties.rented")}
              </option>
            </select>
          </div>

          <PropertiesTable
            properties={propertiesPageData.items}
            loading={loading}
            error={errors.properties}
            onRetry={loadAll}
            onRegisterSale={openSaleForm}
            onToggleStatus={toggleProperty}
            busyId={busyId.replace("property-", "")}
          />
          <Pagination
            page={propertiesPageData.page}
            totalPages={propertiesPageData.totalPages}
            totalItems={propertiesPageData.totalItems}
            pageSize={PAGE_SIZE}
            onChange={setPropertyPage}
          />
        </section>
      )}

      {section === "ventas" && (
        <section className="surface panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">{t("dashboard.admin.sales.eyebrow")}</p>
              <h2>{t("dashboard.admin.sales.title")}</h2>
              <p>
                {t("dashboard.admin.sales.summary", {
                  filtered: filteredSales.length,
                  total: sales.length,
                })}
              </p>
            </div>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => openSaleForm()}
            >
              <Plus size={15} aria-hidden="true" />
              {t("dashboard.admin.registerSale")}
            </button>
          </div>

          <SalesFilters
            values={salesFilters}
            onChange={changeSalesFilter}
            onReset={() => {
              setSalesFilters(initialSalesFilters);
              setSalesPage(1);
            }}
          />

          <SalesTable
            sales={salesPageData.items}
            loading={loading}
            error={errors.sales}
            onRetry={loadAll}
            onAnnul={setAnnulTarget}
            busyId={busyId.replace("sale-", "")}
          />
          <Pagination
            page={salesPageData.page}
            totalPages={salesPageData.totalPages}
            totalItems={salesPageData.totalItems}
            pageSize={PAGE_SIZE}
            onChange={setSalesPage}
          />
        </section>
      )}

      <SaleForm
        open={saleFormOpen}
        properties={properties}
        initialPropertyId={saleInitialProperty}
        onClose={() => setSaleFormOpen(false)}
        onSaved={async () => {
          setSaleFormOpen(false);
          await loadAll();
        }}
      />

      <ConfirmDialog
        open={Boolean(annulTarget)}
        title={t("dashboard.admin.sales.annulTitle")}
        description={t("dashboard.admin.sales.annulText", {
          title: annulTarget?.propertyTitle || "",
        })}
        confirmLabel={t("dashboard.admin.sales.annulConfirm")}
        cancelLabel={t("dashboard.admin.sales.annulCancel")}
        tone="danger"
        busy={busyId === `sale-${annulTarget?.id}`}
        onConfirm={handleAnnul}
        onCancel={() => setAnnulTarget(null)}
      />

      <ConfirmDialog
        open={maintenanceOpen}
        title={t("dashboard.admin.maintenance.dialogTitle")}
        description={t("dashboard.admin.maintenance.dialogText")}
        confirmLabel={t("dashboard.admin.maintenance.action")}
        cancelLabel={t("common.cancel")}
        busy={maintenanceBusy}
        onConfirm={handleBackfill}
        onCancel={() => setMaintenanceOpen(false)}
      />
    </DashboardLayout>
  );
}
