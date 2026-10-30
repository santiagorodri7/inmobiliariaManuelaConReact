import { Link, Navigate, useLocation } from "react-router-dom";
import { ArrowLeft, ShieldAlert } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { PageLoader } from "../components/ui/Spinner.jsx";
import { isAdmin, roleHome, roleLabel } from "../utils/roles.js";

function ConfigurationMissing() {
  return (
    <main className="fatal-error">
      <div className="fatal-error__card">
        <span className="fatal-error__icon" aria-hidden="true">
          <ShieldAlert size={30} />
        </span>
        <p className="eyebrow">Configuración pendiente</p>
        <h1>Firebase aún no está configurado</h1>
        <p>
          Copia <code>.env.example</code> como <code>.env.local</code> y completa
          las variables del proyecto. Después reinicia el servidor de desarrollo.
        </p>
        <Link to="/" className="btn btn-primary">
          <ArrowLeft size={17} aria-hidden="true" />
          Volver al inicio
        </Link>
      </div>
    </main>
  );
}

export function ProtectedRoute({ roles = [], children }) {
  const { profile, loading, isConfigured, configurationError, authError } = useAuth();
  const location = useLocation();

  if (!isConfigured) return <ConfigurationMissing />;
  if (loading) return <PageLoader message="Verificando tu cuenta…" />;

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
          <p className="eyebrow">Acceso restringido</p>
          <h1>Este panel no corresponde a tu rol</h1>
          <p>
            Tu cuenta está registrada como <strong>{roleLabel(profile.rol)}</strong>.
            Puedes continuar desde tu panel asignado.
          </p>
          <div className="access-denied__actions">
            <Link to={roleHome(profile)} className="btn btn-primary">
              Ir a mi panel
            </Link>
            <Link to="/" className="btn btn-outline-secondary">
              Volver al inicio
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

  if (!isConfigured) return <ConfigurationMissing />;
  if (loading) return <PageLoader message="Verificando tu sesión…" />;
  if (profile) return <Navigate to={roleHome(profile)} replace />;
  return children;
}

export function AdminOnly({ children }) {
  const { profile, loading, isConfigured } = useAuth();
  if (!isConfigured) return <ConfigurationMissing />;
  if (loading) return <PageLoader message="Verificando permisos…" />;
  if (!profile) return <Navigate to="/login" replace />;
  if (!isAdmin(profile)) return <Navigate to={roleHome(profile)} replace />;
  return children;
}
