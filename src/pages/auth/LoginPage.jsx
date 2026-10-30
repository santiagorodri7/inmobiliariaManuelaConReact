import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Eye, EyeOff, LoaderCircle, LogIn, Mail } from "lucide-react";
import AuthLayout from "../../components/auth/AuthLayout.jsx";
import Field from "../../components/ui/Field.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { usePageTitle } from "../../hooks/usePageTitle.js";
import { getErrorMessage } from "../../utils/errors.js";
import { roleHome } from "../../utils/roles.js";
import { hasErrors, validateLogin } from "../../utils/validation.js";

export default function LoginPage() {
  usePageTitle("Iniciar sesión", "Accede a tu cuenta de Manuela Bermúdez Realtor.");
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [values, setValues] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(location.state?.error || "");
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const update = (field) => (event) => {
    setValues((current) => ({ ...current, [field]: event.target.value }));
    if (errors[field]) setErrors((current) => ({ ...current, [field]: "" }));
    if (formError) setFormError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validateLogin(values);
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) return;

    setSubmitting(true);
    setFormError("");
    try {
      const profile = await login(values.email, values.password);
      const target = location.state?.from || roleHome(profile);
      navigate(target, { replace: true });
    } catch (error) {
      setFormError(getErrorMessage(error, "No pudimos iniciar sesión."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="Bienvenida de nuevo"
      title="Tu próximo lugar empieza con una conversación."
      description="Ingresa para gestionar tus propiedades, revisar tus preferencias o continuar el proceso que empezamos juntos."
      points={[
        "Tu panel personal según tu rol.",
        "Preferencias y publicaciones en un solo lugar.",
        "Acompañamiento directo, también en línea.",
      ]}
    >
      <div className="auth-card__head">
        <p className="eyebrow">Mi cuenta</p>
        <h1>Iniciar sesión</h1>
        <p>
          Ingresa con el correo y la contraseña que registraste. Si es tu primera
          vez, puedes crear una cuenta en un minuto.
        </p>
      </div>

      {formError && (
        <div className="alert alert-danger auth-alert" role="alert">
          <strong>No pudimos ingresar.</strong>
          <p>{formError}</p>
        </div>
      )}

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <Field label="Correo electrónico" htmlFor="login-email" required error={errors.email}>
          <div className="input-with-icon">
            <Mail size={17} aria-hidden="true" />
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              className="form-control"
              value={values.email}
              onChange={update("email")}
              placeholder="tu@correo.com"
              aria-invalid={Boolean(errors.email)}
            />
          </div>
        </Field>

        <Field label="Contraseña" htmlFor="login-password" required error={errors.password}>
          <div className="password-control">
            <input
              id="login-password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              className="form-control"
              value={values.password}
              onChange={update("password")}
              placeholder="Tu contraseña"
              aria-invalid={Boolean(errors.password)}
            />
            <button
              type="button"
              className="password-control__toggle"
              onClick={() => setShowPassword((visible) => !visible)}
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
        </Field>

        <div className="auth-form__meta">
          <span className="auth-form__secure">Conexión segura con Firebase</span>
          <Link to="/recuperar-contrasena">¿Olvidaste tu contraseña?</Link>
        </div>

        <button type="submit" className="btn btn-primary btn-lg w-100" disabled={submitting}>
          {submitting ? (
            <LoaderCircle size={18} className="spin" aria-hidden="true" />
          ) : (
            <LogIn size={18} aria-hidden="true" />
          )}
          {submitting ? "Ingresando…" : "Ingresar a mi cuenta"}
        </button>
      </form>

      <div className="auth-divider">
        <span>¿Aún no tienes cuenta?</span>
      </div>

      <Link to="/registro" className="btn btn-outline-secondary w-100">
        Crear una cuenta
      </Link>

      <p className="auth-note">
        Las cuentas de administración se asignan manualmente. Si tu cuenta no
        funciona, escríbenos y la revisamos contigo.
      </p>
    </AuthLayout>
  );
}
