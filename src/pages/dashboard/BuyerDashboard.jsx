import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Building2,
  Compass,
  Home,
  KeyRound,
  Save,
  SlidersHorizontal,
  Sparkles,
  Wallet,
} from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout.jsx";
import StatCard from "../../components/admin/StatCard.jsx";
import PropertyGrid from "../../components/property/PropertyGrid.jsx";
import Field from "../../components/ui/Field.jsx";
import EmptyState from "../../components/ui/EmptyState.jsx";
import { useToast } from "../../components/ui/Toast.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { useProperties } from "../../hooks/useProperties.js";
import { usePageTitle } from "../../hooks/usePageTitle.js";
import { useI18n } from "../../i18n/I18nContext.jsx";
import { updateOwnProfile } from "../../services/usersService.js";
import { buyerNav } from "../../config/dashboardNav.js";
import {
  budgetOptions,
  operations,
  propertyTypes,
} from "../../config/site.js";
import { getErrorMessage } from "../../utils/errors.js";
import { filterProperties, normalizeTypeKey } from "../../utils/property.js";
import { roleHome } from "../../utils/roles.js";

export default function BuyerDashboard() {
  const {
    t,
    formatCOP,
    operationLabel,
    propertyTypeLabel,
  } = useI18n();
  usePageTitle(
    t("dashboard.buyer.pageTitle"),
    t("dashboard.buyer.pageDescription"),
  );
  const { profile, updateProfileState } = useAuth();
  const toast = useToast();
  const [section, setSection] = useState("resumen");
  const [saving, setSaving] = useState(false);
  const { properties, loading, error, reload } = useProperties({ publicOnly: true });

  const [preferences, setPreferences] = useState({
    operation: profile?.preferences?.operation || "",
    zone: profile?.preferences?.zone || "",
    propertyType: profile?.preferences?.propertyType || "",
    maxBudget: profile?.preferences?.maxBudget || "",
  });

  const available = properties.length;
  const forSale = properties.filter((item) => item.operation === "venta").length;
  const forRent = properties.filter((item) => item.operation === "renta").length;
  const hasPreferences = Boolean(
    preferences.operation ||
      preferences.zone ||
      preferences.propertyType ||
      preferences.maxBudget,
  );

  const sectionTitles = {
    resumen: t("dashboard.buyer.sectionTitles.summary"),
    recomendaciones: t("dashboard.buyer.sectionTitles.recommendations"),
    preferencias: t("dashboard.buyer.sectionTitles.preferences"),
  };

  const preferenceSummary = (current) => {
    const parts = [];
    if (current.operation) {
      parts.push(
        current.operation === "renta"
          ? t("dashboard.buyer.preference.summaryRent")
          : t("dashboard.buyer.preference.summaryBuy"),
      );
    }
    if (current.propertyType) parts.push(propertyTypeLabel(current.propertyType));
    if (current.zone) {
      parts.push(
        t("dashboard.buyer.preference.summaryIn", { zone: current.zone }),
      );
    }
    if (current.maxBudget) {
      parts.push(
        t("dashboard.buyer.preference.summaryUpTo", {
          amount: formatCOP(current.maxBudget),
        }),
      );
    }
    return parts.join(" · ");
  };

  const summary = preferenceSummary(preferences);

  const recommendations = useMemo(() => {
    if (!hasPreferences) return properties.slice(0, 6);
    const matched = filterProperties(properties, {
      operation: preferences.operation,
      type: preferences.propertyType
        ? normalizeTypeKey(preferences.propertyType)
        : "",
      search: preferences.zone,
      maxPrice: Number(preferences.maxBudget) || 0,
    });
    return matched.length ? matched : properties.slice(0, 6);
  }, [hasPreferences, preferences, properties]);

  const update = (field) => (event) =>
    setPreferences((current) => ({ ...current, [field]: event.target.value }));

  const handleSave = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const updated = await updateOwnProfile(profile.id, {
        preferences: {
          ...preferences,
          maxBudget: Number(preferences.maxBudget) || 0,
        },
      });
      updateProfileState(updated);
      toast.success(t("dashboard.buyer.preferencesForm.saveSuccess"));
      setSection("recomendaciones");
    } catch (saveError) {
      toast.error(
        getErrorMessage(saveError, "dashboard.buyer.preferencesForm.saveError"),
      );
    } finally {
      setSaving(false);
    }
  };

  const preferenceCard = (
    <section className="surface panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">{t("dashboard.buyer.preference.eyebrow")}</p>
          <h2>{t("dashboard.buyer.preference.title")}</h2>
          <p>
            {hasPreferences
              ? summary
              : t("dashboard.buyer.preference.empty")}
          </p>
        </div>
        <button
          type="button"
          className="btn btn-outline-secondary btn-sm"
          onClick={() => setSection("preferencias")}
        >
          <SlidersHorizontal size={15} aria-hidden="true" />
          {hasPreferences
            ? t("dashboard.buyer.preference.edit")
            : t("dashboard.buyer.preference.configure")}
        </button>
      </div>
      <div className="preference-pills">
        <span>
          <Home size={15} aria-hidden="true" />
          {preferences.operation === "renta"
            ? t("dashboard.buyer.preference.rent")
            : preferences.operation === "venta"
              ? t("dashboard.buyer.preference.buy")
              : t("dashboard.buyer.preference.buyOrRent")}
        </span>
        <span>
          <Building2 size={15} aria-hidden="true" />
          {preferences.propertyType
            ? propertyTypeLabel(preferences.propertyType)
            : t("dashboard.buyer.preference.anyType")}
        </span>
        <span>
          <Compass size={15} aria-hidden="true" />
          {preferences.zone || t("dashboard.buyer.preference.anyZone")}
        </span>
        <span>
          <Wallet size={15} aria-hidden="true" />
          {preferences.maxBudget
            ? t("dashboard.buyer.preference.upTo", {
                amount: formatCOP(preferences.maxBudget),
              })
            : t("dashboard.buyer.preference.noLimit")}
        </span>
      </div>
    </section>
  );

  return (
    <DashboardLayout
      role={profile?.rol}
      navItems={buyerNav}
      activeKey={section}
      onNavigate={setSection}
      title={sectionTitles[section]}
      subtitle={t("dashboard.buyer.subtitle")}
      actions={
        <Link to="/#propiedades" className="btn btn-primary btn-sm dashboard-action">
          {t("dashboard.buyer.exploreCatalog")}
          <ArrowRight size={15} aria-hidden="true" />
        </Link>
      }
    >
      <section className="dash-welcome">
        <div>
          <p className="eyebrow">
            {t("dashboard.buyer.welcomeHello", {
              name: profile?.nombre?.split(" ")[0] || t("dashboard.buyer.welcomeDefault"),
            })}
          </p>
          <h2>{t("dashboard.buyer.welcomeTitle")}</h2>
          <p>{t("dashboard.buyer.welcomeText")}</p>
        </div>
        <div className="dash-welcome__actions">
          <Link to="/contacto" className="btn btn-primary">
            {t("dashboard.buyer.talk")}
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
          <Link to={roleHome(profile)} className="btn btn-outline-secondary">
            {t("dashboard.buyer.myPanel")}
          </Link>
        </div>
      </section>

      {(section === "resumen" || section === "recomendaciones") && (
        <div className="stat-grid">
          <StatCard
            icon={Building2}
            label={t("dashboard.buyer.stats.published")}
            value={available}
            hint={t("dashboard.buyer.stats.publishedHint")}
            tone="blue"
          />
          <StatCard
            icon={KeyRound}
            label={t("dashboard.buyer.stats.sale")}
            value={forSale}
            hint={t("dashboard.buyer.stats.saleHint")}
            tone="sand"
          />
          <StatCard
            icon={Home}
            label={t("dashboard.buyer.stats.rent")}
            value={forRent}
            hint={t("dashboard.buyer.stats.rentHint")}
            tone="green"
          />
          <StatCard
            icon={Sparkles}
            label={t("dashboard.buyer.stats.recommendations")}
            value={recommendations.length}
            hint={
              hasPreferences
                ? t("dashboard.buyer.stats.recommendationsHintPreferences")
                : t("dashboard.buyer.stats.recommendationsHintRecent")
            }
            tone="slate"
          />
        </div>
      )}

      {section === "resumen" && (
        <>
          <div className="dashboard-grid dashboard-grid--main">
            {preferenceCard}
            <section className="surface panel panel--accent">
              <span className="panel__accent-icon" aria-hidden="true">
                <Sparkles size={22} />
              </span>
              <p className="eyebrow">{t("dashboard.buyer.support.eyebrow")}</p>
              <h2>{t("dashboard.buyer.support.title")}</h2>
              <p>{t("dashboard.buyer.support.text")}</p>
              <Link to="/contacto" className="text-link">
                {t("dashboard.buyer.support.link")}
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </section>
          </div>

          <section className="dashboard-section">
            <div className="section-heading section-heading--split">
              <div>
                <p className="eyebrow">{t("dashboard.buyer.start.eyebrow")}</p>
                <h2>{t("dashboard.buyer.start.title")}</h2>
              </div>
              <button
                type="button"
                className="text-link text-link--button"
                onClick={() => setSection("recomendaciones")}
              >
                {t("dashboard.buyer.start.viewAll")}
                <ArrowRight size={16} aria-hidden="true" />
              </button>
            </div>
            <PropertyGrid
              properties={recommendations.slice(0, 3)}
              loading={loading}
              error={error}
              onRetry={reload}
              skeletonCount={3}
              emptyTitle={t("dashboard.buyer.emptyInventoryTitle")}
              emptyDescription={t("dashboard.buyer.emptyInventoryDescription")}
              emptyAction={
                <Link to="/contacto" className="btn btn-primary">
                  {t("home.inventory.tellWhatISeek")}
                </Link>
              }
            />
          </section>
        </>
      )}

      {section === "recomendaciones" && (
        <section className="dashboard-section">
          {preferenceCard}
          <div className="section-heading section-heading--split dashboard-section__heading">
            <div>
              <p className="eyebrow">{t("dashboard.buyer.recommendations.eyebrow")}</p>
              <h2>
                {hasPreferences
                  ? t("dashboard.buyer.recommendations.withPreferences", {
                      count: recommendations.length,
                    })
                  : t("dashboard.buyer.recommendations.withoutPreferences")}
              </h2>
              <p>
                {hasPreferences
                  ? t("dashboard.buyer.recommendations.withPreferencesText")
                  : t("dashboard.buyer.recommendations.withoutPreferencesText")}
              </p>
            </div>
          </div>
          <PropertyGrid
            properties={recommendations}
            loading={loading}
            error={error}
            onRetry={reload}
            emptyTitle={t("dashboard.buyer.recommendations.emptyTitle")}
            emptyDescription={t("dashboard.buyer.recommendations.emptyDescription")}
            emptyAction={
              <Link to="/contacto" className="btn btn-primary">
                {t("dashboard.buyer.talk")}
              </Link>
            }
          />
        </section>
      )}

      {section === "preferencias" && (
        <section className="surface panel preference-form">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">{t("dashboard.buyer.preferencesForm.eyebrow")}</p>
              <h2>{t("dashboard.buyer.preferencesForm.title")}</h2>
              <p>{t("dashboard.buyer.preferencesForm.text")}</p>
            </div>
          </div>

          <form onSubmit={handleSave} className="form-grid form-grid--two">
            <Field
              label={t("dashboard.buyer.preferencesForm.operation")}
              htmlFor="buyer-operation"
            >
              <select
                id="buyer-operation"
                className="form-select"
                value={preferences.operation}
                onChange={update("operation")}
              >
                <option value="">
                  {t("dashboard.buyer.preferencesForm.operationAny")}
                </option>
                {operations.map((operation) => (
                  <option key={operation.value} value={operation.value}>
                    {operationLabel(operation.value)}
                  </option>
                ))}
              </select>
            </Field>

            <Field
              label={t("dashboard.buyer.preferencesForm.type")}
              htmlFor="buyer-type"
            >
              <select
                id="buyer-type"
                className="form-select"
                value={preferences.propertyType}
                onChange={update("propertyType")}
              >
                <option value="">
                  {t("dashboard.buyer.preferencesForm.typeAny")}
                </option>
                {propertyTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {propertyTypeLabel(type.value)}
                  </option>
                ))}
              </select>
            </Field>

            <Field
              label={t("dashboard.buyer.preferencesForm.zone")}
              htmlFor="buyer-zone"
              hint={t("dashboard.buyer.preferencesForm.zoneHint")}
            >
              <input
                id="buyer-zone"
                className="form-control"
                value={preferences.zone}
                onChange={update("zone")}
                placeholder={t("dashboard.buyer.preferencesForm.zonePlaceholder")}
              />
            </Field>

            <Field
              label={t("dashboard.buyer.preferencesForm.budget")}
              htmlFor="buyer-budget"
            >
              <select
                id="buyer-budget"
                className="form-select"
                value={preferences.maxBudget}
                onChange={update("maxBudget")}
              >
                {budgetOptions.map((budget) => (
                  <option key={budget.value || "any"} value={budget.value}>
                    {budget.value
                      ? t("dashboard.buyer.preference.upTo", {
                          amount: formatCOP(budget.value),
                        })
                      : t("dashboard.buyer.preference.noLimit")}
                  </option>
                ))}
              </select>
            </Field>

            <div className="form-actions form-field--full">
              <button type="submit" className="btn btn-primary" disabled={saving}>
                <Save size={16} aria-hidden="true" />
                {saving
                  ? t("common.saving")
                  : t("dashboard.buyer.preferencesForm.save")}
              </button>
            </div>
          </form>
        </section>
      )}

      {section === "resumen" && !hasPreferences && (
        <EmptyState
          icon={SlidersHorizontal}
          title={t("dashboard.buyer.personalizeTitle")}
          description={t("dashboard.buyer.personalizeText")}
          action={
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setSection("preferencias")}
            >
              {t("dashboard.buyer.personalizeAction")}
            </button>
          }
          compact
        />
      )}
    </DashboardLayout>
  );
}
