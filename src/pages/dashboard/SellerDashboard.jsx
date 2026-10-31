import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  EyeOff,
  Handshake,
  Plus,
  Sparkles,
  Wallet,
} from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout.jsx";
import PropertyForm from "../../components/property/PropertyForm.jsx";
import OwnerPropertiesTable from "../../components/property/OwnerPropertiesTable.jsx";
import StatCard from "../../components/admin/StatCard.jsx";
import ExportButton from "../../components/admin/ExportButton.jsx";
import EmptyState from "../../components/ui/EmptyState.jsx";
import ConfirmDialog from "../../components/ui/ConfirmDialog.jsx";
import { useToast } from "../../components/ui/Toast.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { useProperties } from "../../hooks/useProperties.js";
import { usePageTitle } from "../../hooks/usePageTitle.js";
import { sellerNav } from "../../config/dashboardNav.js";
import {
  saveProperty,
  setPropertyStatus,
  softDeleteProperty,
  propertyStats,
} from "../../services/propertiesService.js";
import { exportProperties } from "../../services/excelService.js";
import { getErrorMessage } from "../../utils/errors.js";
import { formatCOP } from "../../utils/format.js";

const sectionTitles = {
  resumen: "Mi resumen",
  publicar: "Publicar propiedad",
  propiedades: "Mis propiedades",
};

export default function SellerDashboard() {
  usePageTitle("Panel de vendedor", "Publica y administra tus propiedades.");
  const { profile } = useAuth();
  const toast = useToast();
  const [section, setSection] = useState("resumen");
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [busyId, setBusyId] = useState("");
  const [pendingHide, setPendingHide] = useState(null);
  const { properties, loading, error, reload, setProperties } = useProperties({
    ownerId: profile?.id,
  });

  const stats = useMemo(() => propertyStats(properties), [properties]);
  const recent = properties.slice(0, 4);

  const navigateSection = (key) => {
    if (key === "publicar") setEditing(null);
    setSection(key);
  };

  const startNew = () => {
    setEditing(null);
    setSection("publicar");
  };

  const startEdit = (property) => {
    setEditing(property);
    setSection("publicar");
  };

  const handleSave = async (payload) => {
    setSaving(true);
    setUploadProgress(0);
    try {
      await saveProperty({
        id: editing?.id || "",
        ownerId: profile.id,
        ownerName: profile.nombre,
        values: payload.values,
        newFiles: payload.newFiles,
        keptImages: payload.keptImages,
        imagesChanged: payload.imagesChanged,
        onProgress: setUploadProgress,
      });
      toast.success(
        editing
          ? "Los cambios se guardaron correctamente."
          : "Tu propiedad ya está publicada en el catálogo.",
      );
      setEditing(null);
      setUploadProgress(0);
      setSection("propiedades");
      reload();
    } catch (saveError) {
      console.error("No se pudo guardar la propiedad:", saveError);
      toast.error(
        getErrorMessage(saveError, "No se pudo guardar la propiedad."),
      );
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async (property) => {
    setBusyId(property.id);
    try {
      const updated = await setPropertyStatus(property, "disponible", profile);
      setProperties((current) =>
        current.map((item) => (item.id === property.id ? updated : item)),
      );
      toast.success("La propiedad volvió a estar publicada.");
    } catch (publishError) {
      toast.error(
        getErrorMessage(publishError, "No se pudo publicar la propiedad."),
      );
    } finally {
      setBusyId("");
    }
  };

  const handleHide = async () => {
    if (!pendingHide) return;
    setBusyId(pendingHide.id);
    try {
      await softDeleteProperty(pendingHide, profile);
      setProperties((current) =>
        current.map((item) =>
          item.id === pendingHide.id ? { ...item, status: "inactiva" } : item,
        ),
      );
      toast.success("La propiedad se ocultó del catálogo público.");
      setPendingHide(null);
    } catch (hideError) {
      toast.error(
        getErrorMessage(hideError, "No se pudo ocultar la propiedad."),
      );
    } finally {
      setBusyId("");
    }
  };

  const statsCards = (
    <div className="stat-grid">
      <StatCard
        icon={Building2}
        label="Propiedades publicadas"
        value={stats.available}
        hint="Visibles en el catálogo"
        tone="blue"
      />
      <StatCard
        icon={EyeOff}
        label="Ocultas"
        value={stats.hidden}
        hint="No visibles al público"
        tone="sand"
      />
      <StatCard
        icon={Handshake}
        label="Cierres registrados"
        value={stats.closed}
        hint="Vendidas o rentadas"
        tone="green"
      />
      <StatCard
        icon={Wallet}
        label="Valor publicado"
        value={formatCOP(stats.portfolioValue)}
        hint="Suma de propiedades activas"
        tone="slate"
      />
    </div>
  );

  return (
    <DashboardLayout
      role={profile?.rol}
      navItems={sellerNav}
      activeKey={section}
      onNavigate={navigateSection}
      title={sectionTitles[section]}
      subtitle="Publica tus inmuebles, revisa su estado y mantén tu inventario al día."
      actions={
        <>
          <ExportButton
            onExport={() => exportProperties(properties)}
            label="Exportar"
            variant="outline-secondary"
            size="sm"
            disabled={!properties.length}
          />
          <button type="button" className="btn btn-primary btn-sm dashboard-action" onClick={startNew}>
            <Plus size={15} aria-hidden="true" />
            Publicar
          </button>
        </>
      }
    >
      {section === "resumen" && (
        <>
          <section className="dash-welcome">
            <div>
              <p className="eyebrow">Hola, {profile?.nombre?.split(" ")[0] || "bienvenido"}</p>
              <h2>Tu inventario, en un solo lugar.</h2>
              <p>
                Publica propiedades, revisa su estado y decide cuándo mostrarlas
                al público. Si necesitas ajustar algo, puedes editarlas sin
                perder el historial.
              </p>
            </div>
            <div className="dash-welcome__actions">
              <button type="button" className="btn btn-primary" onClick={startNew}>
                <Plus size={16} aria-hidden="true" />
                Publicar propiedad
              </button>
              <Link to="/contacto" className="btn btn-outline-secondary">
                Hablar con Manuela
              </Link>
            </div>
          </section>

          {statsCards}

          <div className="dashboard-grid dashboard-grid--main">
            <section className="surface panel">
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">Actividad</p>
                  <h2>Mis propiedades recientes</h2>
                  <p>
                    Un vistazo rápido a las últimas publicaciones de tu cuenta.
                  </p>
                </div>
                <button
                  type="button"
                  className="text-link text-link--button"
                  onClick={() => setSection("propiedades")}
                >
                  Ver todas
                  <ArrowRight size={16} aria-hidden="true" />
                </button>
              </div>
              <OwnerPropertiesTable
                properties={recent}
                loading={loading}
                error={error}
                onRetry={reload}
                onEdit={startEdit}
                onToggle={handlePublish}
                onHide={setPendingHide}
                busyId={busyId}
              />
            </section>

            <section className="surface panel panel--accent">
              <span className="panel__accent-icon" aria-hidden="true">
                <Sparkles size={22} />
              </span>
              <p className="eyebrow">Buenas prácticas</p>
              <h2>Una publicación clara vende mejor</h2>
              <ul className="check-list check-list--compact">
                <li>
                  <CheckCircle2 size={16} aria-hidden="true" />
                  Usa fotos con luz natural y al menos una del espacio principal.
                </li>
                <li>
                  <CheckCircle2 size={16} aria-hidden="true" />
                  Describe el estado real, el área y lo que hace especial al inmueble.
                </li>
                <li>
                  <CheckCircle2 size={16} aria-hidden="true" />
                  Indica una zona aproximada; la dirección exacta se comparte en la visita.
                </li>
              </ul>
              <Link to="/servicios" className="text-link">
                Ver servicios de acompañamiento
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </section>
          </div>
        </>
      )}

      {section === "publicar" && (
        <section className="dashboard-section">
          <div className="section-heading section-heading--split">
            <div>
              <p className="eyebrow">{editing ? "Editar publicación" : "Nueva publicación"}</p>
              <h2>
                {editing
                  ? "Actualiza la información de tu propiedad"
                  : "Cuéntanos sobre el inmueble que quieres publicar"}
              </h2>
              <p>
                Los campos marcados son obligatorios. La primera imagen será la
                portada en el catálogo.
              </p>
            </div>
            {editing && (
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm"
                onClick={() => {
                  setEditing(null);
                  setSection("propiedades");
                }}
              >
                Cancelar edición
              </button>
            )}
          </div>

          <PropertyForm
            key={editing?.id || "new-property"}
            property={editing}
            profile={profile}
            onSave={handleSave}
            onCancel={() => {
              setEditing(null);
              setSection("propiedades");
            }}
            saving={saving}
            uploadProgress={uploadProgress}
          />
        </section>
      )}

      {section === "propiedades" && (
        <section className="dashboard-section">
          {statsCards}

          <section className="surface panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Inventario</p>
                <h2>Todas mis propiedades</h2>
                <p>
                  {properties.length
                    ? `${properties.length} propiedades asociadas a tu cuenta.`
                    : "Aún no tienes propiedades asociadas a tu cuenta."}
                </p>
              </div>
              <button type="button" className="btn btn-primary btn-sm" onClick={startNew}>
                <Plus size={15} aria-hidden="true" />
                Publicar
              </button>
            </div>

            {!loading && !error && !properties.length ? (
              <EmptyState
                icon={Building2}
                title="Tu inventario está vacío"
                description="Publica tu primera propiedad para que aparezca en el catálogo y puedas gestionarla desde este panel."
                action={
                  <button type="button" className="btn btn-primary" onClick={startNew}>
                    <Plus size={16} aria-hidden="true" />
                    Publicar mi primera propiedad
                  </button>
                }
              />
            ) : (
              <OwnerPropertiesTable
                properties={properties}
                loading={loading}
                error={error}
                onRetry={reload}
                onEdit={startEdit}
                onToggle={handlePublish}
                onHide={setPendingHide}
                busyId={busyId}
              />
            )}
          </section>
        </section>
      )}

      <ConfirmDialog
        open={Boolean(pendingHide)}
        title="Ocultar propiedad"
        description={`“${pendingHide?.title || "Esta propiedad"}” dejará de aparecer en el catálogo público. Podrás volver a publicarla cuando quieras; no se elimina de tu cuenta.`}
        confirmLabel="Ocultar propiedad"
        cancelLabel="Cancelar"
        tone="danger"
        busy={busyId === pendingHide?.id}
        onConfirm={handleHide}
        onCancel={() => setPendingHide(null)}
      />
    </DashboardLayout>
  );
}
