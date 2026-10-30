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
import { updateOwnProfile } from "../../services/usersService.js";
import { buyerNav } from "../../config/dashboardNav.js";
import {
  budgetOptions,
  operations,
  propertyTypes,
} from "../../config/site.js";
import { getErrorMessage } from "../../utils/errors.js";
import { formatCOP } from "../../utils/format.js";
import { filterProperties, normalizeTypeKey } from "../../utils/property.js";
import { roleHome } from "../../utils/roles.js";

const sectionTitles = {
  resumen: "Mi resumen",
  recomendaciones: "Recomendaciones para ti",
  preferencias: "Mis preferencias",
};

const preferenceSummary = (preferences) => {
  const parts = [];
  if (preferences.operation) {
    parts.push(preferences.operation === "renta" ? "Arriendo" : "Compra");
  }
  if (preferences.propertyType) parts.push(preferences.propertyType);
  if (preferences.zone) parts.push(`en ${preferences.zone}`);
  if (preferences.maxBudget) {
    parts.push(`hasta ${formatCOP(preferences.maxBudget)}`);
  }
  return parts.join(" · ");
};

export default function BuyerDashboard() {
  usePageTitle("Panel de comprador", "Tus recomendaciones y preferencias de búsqueda.");
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
  const summary = preferenceSummary(preferences);
  const hasPreferences = Boolean(
    preferences.operation ||
      preferences.zone ||
      preferences.propertyType ||
      preferences.maxBudget,
  );

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
      toast.success("Tus preferencias se guardaron.");
      setSection("recomendaciones");
    } catch (saveError) {
      toast.error(
        getErrorMessage(saveError, "No se pudieron guardar tus preferencias."),
      );
    } finally {
      setSaving(false);
    }
  };

  const preferenceCard = (
    <section className="surface panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Tu búsqueda</p>
          <h2>Lo que estás buscando</h2>
          <p>
            {hasPreferences
              ? summary
              : "Aún no has guardado preferencias. Cuéntanos qué buscas para filtrar mejor el inventario."}
          </p>
        </div>
        <button
          type="button"
          className="btn btn-outline-secondary btn-sm"
          onClick={() => setSection("preferencias")}
        >
          <SlidersHorizontal size={15} aria-hidden="true" />
          {hasPreferences ? "Editar" : "Configurar"}
        </button>
      </div>
      <div className="preference-pills">
        <span>
          <Home size={15} aria-hidden="true" />
          {preferences.operation === "renta"
            ? "Arriendo"
            : preferences.operation === "venta"
              ? "Compra"
              : "Compra o arriendo"}
        </span>
        <span>
          <Building2 size={15} aria-hidden="true" />
          {preferences.propertyType || "Cualquier tipo"}
        </span>
        <span>
          <Compass size={15} aria-hidden="true" />
          {preferences.zone || "Cualquier zona"}
        </span>
        <span>
          <Wallet size={15} aria-hidden="true" />
          {preferences.maxBudget
            ? `Hasta ${formatCOP(preferences.maxBudget)}`
            : "Sin límite de presupuesto"}
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
      subtitle="Explora opciones que se ajustan a lo que necesitas y mantén tus preferencias al día."
      actions={
        <Link to="/#propiedades" className="btn btn-primary btn-sm dashboard-action">
          Explorar catálogo
          <ArrowRight size={15} aria-hidden="true" />
        </Link>
      }
    >
      <section className="dash-welcome">
        <div>
          <p className="eyebrow">Hola, {profile?.nombre?.split(" ")[0] || "bienvenido"}</p>
          <h2>Encontrar un lugar también es una conversación.</h2>
          <p>
            Revisa las propiedades que coinciden con tus intereses y ajusta tus
            preferencias cuando quieras. Si algo te llama la atención, podemos
            coordinar una visita.
          </p>
        </div>
        <div className="dash-welcome__actions">
          <Link to="/contacto" className="btn btn-primary">
            Hablar con Manuela
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
          <Link to={roleHome(profile)} className="btn btn-outline-secondary">
            Mi panel
          </Link>
        </div>
      </section>

      {(section === "resumen" || section === "recomendaciones") && (
        <div className="stat-grid">
          <StatCard
            icon={Building2}
            label="Propiedades publicadas"
            value={available}
            hint="Inventario disponible hoy"
            tone="blue"
          />
          <StatCard
            icon={KeyRound}
            label="En venta"
            value={forSale}
            hint="Opciones para comprar"
            tone="sand"
          />
          <StatCard
            icon={Home}
            label="En arriendo"
            value={forRent}
            hint="Opciones para arrendar"
            tone="green"
          />
          <StatCard
            icon={Sparkles}
            label="Recomendaciones"
            value={recommendations.length}
            hint={hasPreferences ? "Según tus preferencias" : "Selección reciente"}
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
              <p className="eyebrow">Acompañamiento</p>
              <h2>¿Quieres que busquemos contigo?</h2>
              <p>
                Cuéntanos qué espacios necesitas, en qué zona y con qué
                presupuesto. Filtramos opciones y coordinamos visitas sin
                hacerte perder tiempo.
              </p>
              <Link to="/contacto" className="text-link">
                Contar qué busco
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </section>
          </div>

          <section className="dashboard-section">
            <div className="section-heading section-heading--split">
              <div>
                <p className="eyebrow">Para empezar</p>
                <h2>Opciones que podrían interesarte</h2>
              </div>
              <button
                type="button"
                className="text-link text-link--button"
                onClick={() => setSection("recomendaciones")}
              >
                Ver todas
                <ArrowRight size={16} aria-hidden="true" />
              </button>
            </div>
            <PropertyGrid
              properties={recommendations.slice(0, 3)}
              loading={loading}
              error={error}
              onRetry={reload}
              skeletonCount={3}
              emptyTitle="Aún no hay propiedades publicadas"
              emptyDescription="Estamos preparando el inventario. Cuéntanos qué buscas y te avisamos cuando llegue algo que encaje."
              emptyAction={
                <Link to="/contacto" className="btn btn-primary">
                  Contar qué busco
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
              <p className="eyebrow">Selección personalizada</p>
              <h2>
                {hasPreferences
                  ? `${recommendations.length} propiedades según tus preferencias`
                  : "Propiedades publicadas"}
              </h2>
              <p>
                {hasPreferences
                  ? "Si no hay coincidencias exactas, mostramos una selección reciente para que sigas explorando."
                  : "Configura tus preferencias para recibir una selección más precisa."}
              </p>
            </div>
          </div>
          <PropertyGrid
            properties={recommendations}
            loading={loading}
            error={error}
            onRetry={reload}
            emptyTitle="No encontramos coincidencias todavía"
            emptyDescription="Prueba ampliando el presupuesto o la zona, o cuéntanos qué buscas para ayudarte."
            emptyAction={
              <Link to="/contacto" className="btn btn-primary">
                Hablar con Manuela
              </Link>
            }
          />
        </section>
      )}

      {section === "preferencias" && (
        <section className="surface panel preference-form">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Búsqueda personalizada</p>
              <h2>Cuéntanos qué necesitas</h2>
              <p>
                Usamos estos datos para ordenar las recomendaciones dentro de tu
                cuenta. Puedes cambiarlos cuando quieras.
              </p>
            </div>
          </div>

          <form onSubmit={handleSave} className="form-grid form-grid--two">
            <Field label="Quiero" htmlFor="buyer-operation">
              <select
                id="buyer-operation"
                className="form-select"
                value={preferences.operation}
                onChange={update("operation")}
              >
                <option value="">Comprar o arrendar</option>
                {operations.map((operation) => (
                  <option key={operation.value} value={operation.value}>
                    {operation.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Tipo de inmueble" htmlFor="buyer-type">
              <select
                id="buyer-type"
                className="form-select"
                value={preferences.propertyType}
                onChange={update("propertyType")}
              >
                <option value="">Cualquier tipo</option>
                {propertyTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field
              label="Zona de interés"
              htmlFor="buyer-zone"
              hint="Ciudad, barrio o sector."
            >
              <input
                id="buyer-zone"
                className="form-control"
                value={preferences.zone}
                onChange={update("zone")}
                placeholder="Ej. Laureles, Medellín"
              />
            </Field>

            <Field label="Presupuesto máximo" htmlFor="buyer-budget">
              <select
                id="buyer-budget"
                className="form-select"
                value={preferences.maxBudget}
                onChange={update("maxBudget")}
              >
                {budgetOptions.map((budget) => (
                  <option key={budget.value || "any"} value={budget.value}>
                    {budget.label}
                  </option>
                ))}
              </select>
            </Field>

            <div className="form-actions form-field--full">
              <button type="submit" className="btn btn-primary" disabled={saving}>
                <Save size={16} aria-hidden="true" />
                {saving ? "Guardando…" : "Guardar preferencias"}
              </button>
            </div>
          </form>
        </section>
      )}

      {section === "resumen" && !hasPreferences && (
        <EmptyState
          icon={SlidersHorizontal}
          title="Personaliza tus recomendaciones"
          description="Cuéntanos qué tipo de propiedad buscas, en qué zona y con qué presupuesto para mostrar opciones más relevantes."
          action={
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setSection("preferencias")}
            >
              Configurar preferencias
            </button>
          }
          compact
        />
      )}
    </DashboardLayout>
  );
}
