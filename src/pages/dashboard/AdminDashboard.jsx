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
import { adminNav } from "../../config/dashboardNav.js";
import { listUsers, setUserActive } from "../../services/usersService.js";
import {
  listProperties,
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
import {
  exportAll,
  exportProperties,
  exportSales,
  exportUsers,
} from "../../services/excelService.js";
import { getErrorMessage } from "../../utils/errors.js";
import { formatCOP, normalizeText } from "../../utils/format.js";
import { normalizeRole, ROLES } from "../../utils/roles.js";

const PAGE_SIZE = 8;

const sectionTitles = {
  resumen: "Panel de administración",
  propiedades: "Propiedades",
  usuarios: "Usuarios",
  ventas: "Cierres registrados",
};

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
  usePageTitle(
    "Panel de administración",
    "Gestiona usuarios, propiedades y cierres de la plataforma.",
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

  const [userFilters, setUserFilters] = useState(initialUserFilters);
  const [propertyFilters, setPropertyFilters] = useState(initialPropertyFilters);
  const [salesFilters, setSalesFilters] = useState(initialSalesFilters);
  const [userPage, setUserPage] = useState(1);
  const [propertyPage, setPropertyPage] = useState(1);
  const [salesPage, setSalesPage] = useState(1);

  const loadAll = useCallback(async () => {
    setLoading(true);
    const [usersResult, propertiesResult, salesResult] = await Promise.allSettled([
      listUsers(),
      listProperties(),
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
          ? getErrorMessage(usersResult.reason, "No se pudieron cargar los usuarios.")
          : "",
      properties:
        propertiesResult.status === "rejected"
          ? getErrorMessage(
              propertiesResult.reason,
              "No se pudieron cargar las propiedades.",
            )
          : "",
      sales:
        salesResult.status === "rejected"
          ? getErrorMessage(salesResult.reason, "No se pudieron cargar los cierres.")
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
          ? "La cuenta se reactivó correctamente."
          : "La cuenta quedó desactivada y no podrá ingresar.",
      );
    } catch (toggleError) {
      toast.error(
        getErrorMessage(toggleError, "No se pudo actualizar la cuenta."),
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
          ? "La propiedad volvió a publicarse."
          : "La propiedad se ocultó del catálogo.",
      );
    } catch (toggleError) {
      toast.error(
        getErrorMessage(toggleError, "No se pudo actualizar la propiedad."),
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
      toast.success("El cierre quedó anulado y la propiedad volvió a publicarse.");
      setAnnulTarget(null);
      await loadAll();
    } catch (annulError) {
      toast.error(
        getErrorMessage(annulError, "No se pudo anular el cierre."),
      );
    } finally {
      setBusyId("");
    }
  };

  const summaryActions = (
    <>
      <ExportButton
        onExport={() => exportAll({ users, properties, sales })}
        label="Exportar libro completo"
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
        Registrar cierre
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
      subtitle="Datos reales de la plataforma: usuarios, inventario y cierres registrados."
      actions={
        section === "resumen" ? (
          summaryActions
        ) : section === "propiedades" ? (
          <>
            <ExportButton
              onExport={() => exportProperties(filteredProperties)}
              label="Exportar propiedades"
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
              Registrar cierre
            </button>
          </>
        ) : section === "usuarios" ? (
          <ExportButton
            onExport={() => exportUsers(filteredUsers)}
            label="Exportar usuarios"
            variant="outline-secondary"
            size="sm"
            disabled={!filteredUsers.length}
          />
        ) : (
          <ExportButton
            onExport={() => exportSales(filteredSales)}
            label="Exportar cierres"
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
                Hola, {profile?.nombre?.split(" ")[0] || "administradora"}
              </p>
              <h2>La operación completa, con datos reales.</h2>
              <p>
                Revisa el estado de las cuentas y el inventario, registra cierres
                y descarga reportes en Excel. Las acciones sensibles quedan
                registradas para mantener la trazabilidad.
              </p>
            </div>
            <div className="dash-welcome__actions">
              <button type="button" className="btn btn-primary" onClick={() => openSaleForm()}>
                <Handshake size={16} aria-hidden="true" />
                Registrar cierre
              </button>
              <Link to="/admin/reportes-ventas" className="btn btn-outline-secondary">
                Ver reporte de ventas
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>
          </section>

          <div className="stat-grid">
            <StatCard
              icon={Users}
              label="Usuarios registrados"
              value={users.length}
              hint={`${users.filter((user) => user.activo !== false).length} cuentas activas`}
              tone="blue"
            />
            <StatCard
              icon={Building2}
              label="Propiedades publicadas"
              value={propertySummary.available}
              hint={`${propertySummary.total} en total · ${propertySummary.closed} con cierre`}
              tone="sand"
            />
            <StatCard
              icon={Handshake}
              label="Cierres registrados"
              value={salesSummary.closed}
              hint={`${salesSummary.annulled} anulados`}
              tone="green"
            />
            <StatCard
              icon={Wallet}
              label="Valor de cierres"
              value={formatCOP(salesSummary.totalValue)}
              hint="Solo cierres vigentes"
              tone="slate"
            />
          </div>

          <div className="dashboard-grid dashboard-grid--main">
            <section className="surface panel">
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">Movimiento reciente</p>
                  <h2>Últimos cierres</h2>
                  <p>
                    Ventas y arriendos registrados, con su valor y su estado.
                  </p>
                </div>
                <button
                  type="button"
                  className="text-link text-link--button"
                  onClick={() => setSection("ventas")}
                >
                  Ver todos
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
                  <p className="eyebrow">Inventario</p>
                  <h2>Estado del catálogo</h2>
                </div>
              </div>
              <div className="breakdown-list">
                <div>
                  <span>Publicadas</span>
                  <strong>{propertySummary.available}</strong>
                </div>
                <div>
                  <span>Ocultas</span>
                  <strong>{propertySummary.hidden}</strong>
                </div>
                <div>
                  <span>Con cierre</span>
                  <strong>{propertySummary.closed}</strong>
                </div>
                <div>
                  <span>Valor publicado</span>
                  <strong>{formatCOP(propertySummary.portfolioValue)}</strong>
                </div>
              </div>
              <div className="quick-actions">
                <button type="button" onClick={() => setSection("propiedades")}>
                  <Building2 size={17} aria-hidden="true" />
                  Revisar propiedades
                  <ArrowRight size={15} aria-hidden="true" />
                </button>
                <button type="button" onClick={() => setSection("usuarios")}>
                  <Users size={17} aria-hidden="true" />
                  Revisar usuarios
                  <ArrowRight size={15} aria-hidden="true" />
                </button>
                <Link to="/admin/reportes-ventas">
                  <FileSpreadsheet size={17} aria-hidden="true" />
                  Abrir reporte de ventas
                  <ArrowRight size={15} aria-hidden="true" />
                </Link>
              </div>
            </section>
          </div>

          {!loading && !properties.length && !sales.length && (
            <EmptyState
              icon={TrendingUp}
              title="La plataforma está lista para empezar"
              description="Aún no hay propiedades ni cierres. Publica el primer inmueble o registra un cierre cuando la operación esté cerrada."
              action={
                <Link to="/vendedor" className="btn btn-primary">
                  Ir a publicar una propiedad
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
              <p className="eyebrow">Cuentas</p>
              <h2>Usuarios registrados</h2>
              <p>
                {filteredUsers.length} de {users.length} cuentas según los
                filtros. Puedes desactivar una cuenta sin eliminar sus datos.
              </p>
            </div>
          </div>

          <div className="admin-toolbar">
            <label className="admin-search">
              <span className="visually-hidden">Buscar usuarios</span>
              <Search size={17} aria-hidden="true" />
              <input
                type="search"
                className="form-control"
                value={userFilters.search}
                onChange={(event) => changeUserFilter("search", event.target.value)}
                placeholder="Buscar por nombre, correo, cédula o teléfono"
              />
            </label>
            <select
              className="form-select"
              value={userFilters.role}
              onChange={(event) => changeUserFilter("role", event.target.value)}
              aria-label="Filtrar por rol"
            >
              <option value="">Todos los roles</option>
              <option value={ROLES.ADMIN}>Administración</option>
              <option value={ROLES.SELLER}>Vendedor</option>
              <option value={ROLES.BUYER}>Comprador</option>
            </select>
            <select
              className="form-select"
              value={userFilters.status}
              onChange={(event) => changeUserFilter("status", event.target.value)}
              aria-label="Filtrar por estado"
            >
              <option value="">Todos los estados</option>
              <option value="activo">Activos</option>
              <option value="inactivo">Inactivos</option>
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
              <p className="eyebrow">Inventario</p>
              <h2>Todas las propiedades</h2>
              <p>
                {filteredProperties.length} de {properties.length} propiedades
                según los filtros. “Registrar cierre” actualiza la propiedad en
                una sola transacción.
              </p>
            </div>
          </div>

          <div className="admin-toolbar">
            <label className="admin-search">
              <span className="visually-hidden">Buscar propiedades</span>
              <Search size={17} aria-hidden="true" />
              <input
                type="search"
                className="form-control"
                value={propertyFilters.search}
                onChange={(event) =>
                  changePropertyFilter("search", event.target.value)
                }
                placeholder="Buscar por título, ubicación, tipo o propietario"
              />
            </label>
            <select
              className="form-select"
              value={propertyFilters.operation}
              onChange={(event) =>
                changePropertyFilter("operation", event.target.value)
              }
              aria-label="Filtrar por operación"
            >
              <option value="">Venta y renta</option>
              <option value="venta">Venta</option>
              <option value="renta">Renta</option>
            </select>
            <select
              className="form-select"
              value={propertyFilters.status}
              onChange={(event) =>
                changePropertyFilter("status", event.target.value)
              }
              aria-label="Filtrar por estado"
            >
              <option value="">Todos los estados</option>
              <option value="disponible">Publicadas</option>
              <option value="inactiva">Ocultas</option>
              <option value="vendida">Vendidas</option>
              <option value="rentada">Rentadas</option>
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
              <p className="eyebrow">Cierres</p>
              <h2>Ventas y arriendos registrados</h2>
              <p>
                {filteredSales.length} de {sales.length} cierres según los
                filtros. Anular un cierre vuelve a publicar la propiedad.
              </p>
            </div>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => openSaleForm()}
            >
              <Plus size={15} aria-hidden="true" />
              Registrar cierre
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
        title="Anular cierre"
        description={`El cierre de “${annulTarget?.propertyTitle || "esta propiedad"}” quedará marcado como anulado y la propiedad volverá a estar publicada. Esta acción queda registrada en la auditoría.`}
        confirmLabel="Anular cierre"
        cancelLabel="Conservar cierre"
        tone="danger"
        busy={busyId === `sale-${annulTarget?.id}`}
        onConfirm={handleAnnul}
        onCancel={() => setAnnulTarget(null)}
      />
    </DashboardLayout>
  );
}
