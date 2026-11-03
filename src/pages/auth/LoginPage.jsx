import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Eye, EyeOff, LoaderCircle, LogIn, Mail } from "lucide-react";
import AuthLayout from "../../components/auth/AuthLayout.jsx";
import Field from "../../components/ui/Field.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { useI18n } from "../../i18n/I18nContext.jsx";
import { usePageTitle } from "../../hooks/usePageTitle.js";
import { getErrorMessage } from "../../utils/errors.js";
import { roleHome } from "../../utils/roles.js";
import { hasErrors, validateLogin } from "../../utils/validation.js";

export default function LoginPage() {
  const { t } = useI18n();
  usePageTitle(t("auth.login.pageTitle"), t("auth.login.pageDescription"));
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
      setFormError(getErrorMessage(error, "auth.login.errorFallback"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      eyebrow={t("auth.login.eyebrow")}
      title={t("auth.login.title")}
      description={t("auth.login.description")}
      points={[
        t("auth.login.point1"),
        t("auth.login.point2"),
        t("auth.login.point3"),
      ]}
    >
      <div className="auth-card__head">
        <p className="eyebrow">{t("auth.login.headEyebrow")}</p>
        <h1>{t("auth.login.headTitle")}</h1>
        <p>{t("auth.login.headText")}</p>
      </div>

      {formError && (
        <div className="alert alert-danger auth-alert" role="alert">
          <strong>{t("auth.login.errorTitle")}</strong>
          <p>{formError}</p>
        </div>
      )}

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <Field
          label={t("auth.login.email")}
          htmlFor="login-email"
          required
          error={errors.email}
        >
          <div className="input-with-icon">
            <Mail size={17} aria-hidden="true" />
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              className="form-control"
              value={values.email}
              onChange={update("email")}
              placeholder={t("auth.login.emailPlaceholder")}
              aria-invalid={Boolean(errors.email)}
            />
          </div>
        </Field>

        <Field
          label={t("auth.login.password")}
          htmlFor="login-password"
          required
          error={errors.password}
        >
          <div className="password-control">
            <input
              id="login-password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              className="form-control"
              value={values.password}
              onChange={update("password")}
              placeholder={t("auth.login.passwordPlaceholder")}
              aria-invalid={Boolean(errors.password)}
            />
            <button
              type="button"
              className="password-control__toggle"
              onClick={() => setShowPassword((visible) => !visible)}
              aria-label={
                showPassword
                  ? t("auth.login.hidePassword")
                  : t("auth.login.showPassword")
              }
            >
              {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
        </Field>

        <div className="auth-form__meta">
          <span className="auth-form__secure">{t("auth.login.secure")}</span>
          <Link to="/recuperar-contrasena">{t("auth.login.forgot")}</Link>
        </div>

        <button type="submit" className="btn btn-primary btn-lg w-100" disabled={submitting}>
          {submitting ? (
            <LoaderCircle size={18} className="spin" aria-hidden="true" />
          ) : (
            <LogIn size={18} aria-hidden="true" />
          )}
          {submitting ? t("auth.login.submitting") : t("auth.login.submit")}
        </button>
      </form>

      <div className="auth-divider">
        <span>{t("auth.login.divider")}</span>
      </div>

      <Link to="/registro" className="btn btn-outline-secondary w-100">
        {t("auth.login.create")}
      </Link>

      <p className="auth-note">{t("auth.login.note")}</p>
    </AuthLayout>
  );
}
