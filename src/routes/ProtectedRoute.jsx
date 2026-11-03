import { Link, Navigate, useLocation } from "react-router-dom";
import { ArrowLeft, ShieldAlert } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { PageLoader } from "../components/ui/Spinner.jsx";
import { useI18n } from "../i18n/I18nContext.jsx";
import { isAdmin, roleHome } from "../utils/roles.js";

function ConfigurationMissing() {
  const { t } = useI18n();
  return (
    <main className="fatal-error">
      <div className="fatal-error__card">
        <span className="fatal-error__icon" aria-hidden="true">
          <ShieldAlert size={30} />
        </span>
        <p className="eyebrow">{t("route.configurationEyebrow")}</p>
        <h1>{t("route.configurationTitle")}</h1>
        <p>
          {t("route.configurationText", {
            file: ".env.example",
          })}
        </p>
        <Link to="/" className="btn btn-primary">
          <ArrowLeft size={17} aria-hidden="true" />
          {t("common.backHome")}
        </Link>
      </div>
    </main>
  );
}

export function ProtectedRoute({ roles = [], children }) {
  const { profile, loading, isConfigured, configurationError, authError } = useAuth();
  const { t, roleLabel } = useI18n();
  const location = useLocation();

  if (!isConfigured) return <ConfigurationMissing />;
  if (loading) return <PageLoader message={t("route.loadingAccount")} />;

  if (!profile) {
    return (
      <Navigate
        to="/login"
        state={{
          from: `${location.pathname}${location.search}`,
          error: authError || configurationError || "",
        }}
        replace
      />
    );
  }

  if (roles.length && !roles.includes(profile.rol)) {
    return (
      <main className="access-denied">
        <div className="access-denied__card">
          <span className="access-denied__icon" aria-hidden="true">
            <ShieldAlert size={28} />
          </span>
          <p className="eyebrow">{t("route.accessEyebrow")}</p>
          <h1>{t("route.accessTitle")}</h1>
          <p>
            {t("route.accessText", { role: roleLabel(profile.rol) })}
          </p>
          <div className="access-denied__actions">
            <Link to={roleHome(profile)} className="btn btn-primary">
              {t("route.goPanel")}
            </Link>
            <Link to="/" className="btn btn-outline-secondary">
              {t("common.backHome")}
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return children;
}

export function PublicOnlyRoute({ children }) {
  const { profile, loading, isConfigured } = useAuth();
  const { t } = useI18n();

  if (!isConfigured) return <ConfigurationMissing />;
  if (loading) return <PageLoader message={t("route.loadingSession")} />;
  if (profile) return <Navigate to={roleHome(profile)} replace />;
  return children;
}

export function AdminOnly({ children }) {
  const { profile, loading, isConfigured } = useAuth();
  const { t } = useI18n();
  if (!isConfigured) return <ConfigurationMissing />;
  if (loading) return <PageLoader message={t("route.loadingPermissions")} />;
  if (!profile) return <Navigate to="/login" replace />;
  if (!isAdmin(profile)) return <Navigate to={roleHome(profile)} replace />;
  return children;
}
