import { useMemo, useRef, useState } from "react";
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
import { useI18n } from "../../i18n/I18nContext.jsx";
import { sellerNav } from "../../config/dashboardNav.js";
import {
  saveProperty,
  setPropertyStatus,
  softDeleteProperty,
  propertyStats,
} from "../../services/propertiesService.js";
import { exportProperties } from "../../services/excelService.js";
import { getErrorMessage } from "../../utils/errors.js";

export default function SellerDashboard() {
  const { t, formatCOP } = useI18n();
  usePageTitle(
    t("dashboard.seller.pageTitle"),
    t("dashboard.seller.pageDescription"),
  );
  const { profile } = useAuth();
  const toast = useToast();
  const [section, setSection] = useState("resumen");
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const uploadController = useRef(null);
  const [busyId, setBusyId] = useState("");
  const [pendingHide, setPendingHide] = useState(null);
  const { properties, loading, error, reload, setProperties } = useProperties({
    ownerId: profile?.id,
  });

  const stats = useMemo(() => propertyStats(properties), [properties]);
  const recent = properties.slice(0, 4);

  const sectionTitles = {
    resumen: t("dashboard.seller.sectionTitles.summary"),
    publicar: t("dashboard.seller.sectionTitles.publish"),
    propiedades: t("dashboard.seller.sectionTitles.properties"),
  };

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
    const controller = new AbortController();
    uploadController.current = controller;
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
        signal: controller.signal,
      });
      toast.success(
        editing
          ? t("dashboard.seller.saveEditSuccess")
          : t("dashboard.seller.saveNewSuccess"),
      );
      setEditing(null);
      setSection("propiedades");
      reload();
    } catch (saveError) {
      if (saveError?.code === "storage/canceled") {
        toast.info(t("dashboard.seller.uploadCanceled"));
      } else {
        console.error("No se pudo guardar la propiedad:", saveError);
        toast.error(
          getErrorMessage(saveError, "dashboard.seller.saveError"),
        );
      }
    } finally {
      if (uploadController.current === controller) {
        uploadController.current = null;
      }
      setSaving(false);
      setUploadProgress(0);
    }
  };

  const cancelUpload = () => {
    uploadController.current?.abort();
  };

  const handlePublish = async (property) => {
    setBusyId(property.id);
    try {
      const updated = await setPropertyStatus(property, "disponible", profile);
      setProperties((current) =>
        current.map((item) => (item.id === property.id ? updated : item)),
      );
      toast.success(t("dashboard.seller.publishSuccess"));
    } catch (publishError) {
      toast.error(
        getErrorMessage(publishError, "dashboard.seller.publishError"),
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
      toast.success(t("dashboard.seller.hideSuccess"));
      setPendingHide(null);
    } catch (hideError) {
      toast.error(
        getErrorMessage(hideError, "dashboard.seller.hideError"),
      );
    } finally {
      setBusyId("");
    }
  };

  const statsCards = (
    <div className="stat-grid">
      <StatCard
        icon={Building2}
        label={t("dashboard.seller.stats.published")}
        value={stats.available}
        hint={t("dashboard.seller.stats.publishedHint")}
        tone="blue"
      />
      <StatCard
        icon={EyeOff}
        label={t("dashboard.seller.stats.hidden")}
        value={stats.hidden}
        hint={t("dashboard.seller.stats.hiddenHint")}
        tone="sand"
      />
      <StatCard
        icon={Handshake}
        label={t("dashboard.seller.stats.closed")}
        value={stats.closed}
        hint={t("dashboard.seller.stats.closedHint")}
        tone="green"
      />
      <StatCard
        icon={Wallet}
        label={t("dashboard.seller.stats.value")}
        value={formatCOP(stats.portfolioValue)}
        hint={t("dashboard.seller.stats.valueHint")}
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
      subtitle={t("dashboard.seller.subtitle")}
      actions={
        <>
          <ExportButton
            onExport={() => exportProperties(properties)}
            label={t("dashboard.seller.export")}
            variant="outline-secondary"
            size="sm"
            disabled={!properties.length}
          />
          <button type="button" className="btn btn-primary btn-sm dashboard-action" onClick={startNew}>
            <Plus size={15} aria-hidden="true" />
            {t("dashboard.seller.publish")}
          </button>
        </>
      }
    >
      {section === "resumen" && (
        <>
          <section className="dash-welcome">
            <div>
              <p className="eyebrow">
                {t("dashboard.seller.welcomeHello", {
                  name: profile?.nombre?.split(" ")[0] || t("dashboard.seller.welcomeDefault"),
                })}
              </p>
              <h2>{t("dashboard.seller.welcomeTitle")}</h2>
              <p>{t("dashboard.seller.welcomeText")}</p>
            </div>
            <div className="dash-welcome__actions">
              <button type="button" className="btn btn-primary" onClick={startNew}>
                <Plus size={16} aria-hidden="true" />
                {t("dashboard.seller.publishProperty")}
              </button>
              <Link to="/contacto" className="btn btn-outline-secondary">
                {t("dashboard.seller.talk")}
              </Link>
            </div>
          </section>

          {statsCards}

          <div className="dashboard-grid dashboard-grid--main">
            <section className="surface panel">
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">{t("dashboard.seller.activity.eyebrow")}</p>
                  <h2>{t("dashboard.seller.activity.title")}</h2>
                  <p>{t("dashboard.seller.activity.text")}</p>
                </div>
                <button
                  type="button"
                  className="text-link text-link--button"
                  onClick={() => setSection("propiedades")}
                >
                  {t("dashboard.seller.activity.viewAll")}
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
              <p className="eyebrow">{t("dashboard.seller.tips.eyebrow")}</p>
              <h2>{t("dashboard.seller.tips.title")}</h2>
              <ul className="check-list check-list--compact">
                {["tip1", "tip2", "tip3"].map((key) => (
                  <li key={key}>
                    <CheckCircle2 size={16} aria-hidden="true" />
                    {t(`dashboard.seller.tips.${key}`)}
                  </li>
                ))}
              </ul>
              <Link to="/servicios" className="text-link">
                {t("dashboard.seller.tips.link")}
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
              <p className="eyebrow">
                {editing
                  ? t("dashboard.seller.editEyebrow")
                  : t("dashboard.seller.newEyebrow")}
              </p>
              <h2>
                {editing
                  ? t("dashboard.seller.editTitle")
                  : t("dashboard.seller.newTitle")}
              </h2>
              <p>{t("dashboard.seller.formHint")}</p>
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
                {t("dashboard.seller.cancelEdit")}
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
            onCancelUpload={cancelUpload}
          />
        </section>
      )}

      {section === "propiedades" && (
        <section className="dashboard-section">
          {statsCards}

          <section className="surface panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">{t("dashboard.seller.inventoryEyebrow")}</p>
                <h2>{t("dashboard.seller.inventoryTitle")}</h2>
                <p>
                  {properties.length
                    ? t("dashboard.seller.inventoryCount", {
                        count: properties.length,
                      })
                    : t("dashboard.seller.inventoryEmpty")}
                </p>
              </div>
              <button type="button" className="btn btn-primary btn-sm" onClick={startNew}>
                <Plus size={15} aria-hidden="true" />
                {t("dashboard.seller.publish")}
              </button>
            </div>

            {!loading && !error && !properties.length ? (
              <EmptyState
                icon={Building2}
                title={t("dashboard.seller.inventoryEmptyTitle")}
                description={t("dashboard.seller.inventoryEmptyDescription")}
                action={
                  <button type="button" className="btn btn-primary" onClick={startNew}>
                    <Plus size={16} aria-hidden="true" />
                    {t("dashboard.seller.publishFirst")}
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
        title={t("dashboard.seller.hideDialogTitle")}
        description={t("dashboard.seller.hideDialogText", {
          title: pendingHide?.title || "",
        })}
        confirmLabel={t("dashboard.seller.hideConfirm")}
        cancelLabel={t("common.cancel")}
        tone="danger"
        busy={busyId === pendingHide?.id}
        onConfirm={handleHide}
        onCancel={() => setPendingHide(null)}
      />
    </DashboardLayout>
  );
}
