import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, LoaderCircle, MailCheck, Send } from "lucide-react";
import AuthLayout from "../../components/auth/AuthLayout.jsx";
import Field from "../../components/ui/Field.jsx";
import { useToast } from "../../components/ui/Toast.jsx";
import { usePageTitle } from "../../hooks/usePageTitle.js";
import { requestPasswordReset } from "../../services/authService.js";
import { getErrorMessage } from "../../utils/errors.js";
import { isValidEmail } from "../../utils/validation.js";

export default function ForgotPasswordPage() {
  usePageTitle(
    "Recuperar contraseña",
    "Solicita un enlace para restablecer la contraseña de tu cuenta.",
  );
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!isValidEmail(email)) {
      setError("Escribe el correo con el que creaste tu cuenta.");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      await requestPasswordReset(email);
      setSent(true);
      toast.success("Te enviamos un enlace para restablecer tu contraseña.");
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError,
          "No pudimos enviar el enlace. Revisa el correo e inténtalo de nuevo.",
        ),
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="Recuperar acceso"
      title="Volver a tu cuenta es parte del proceso."
      description="Te enviaremos un enlace seguro al correo registrado para que puedas crear una nueva contraseña."
      points={[
        "El enlace se envía solo al correo de tu cuenta.",
        "Revisa también la carpeta de spam o promociones.",
        "Si no llega, escríbenos y lo revisamos contigo.",
      ]}
    >
      <div className="auth-card__head">
        <p className="eyebrow">Seguridad</p>
        <h1>Recuperar contraseña</h1>
        <p>
          Escribe el correo asociado a tu cuenta. Por seguridad, no mostraremos
          si el correo está registrado o no.
        </p>
      </div>

      {sent ? (
        <div className="auth-success">
          <span className="auth-success__icon" aria-hidden="true">
            <MailCheck size={30} />
          </span>
          <h2>Revisa tu correo</h2>
          <p>
            Si <strong>{email.trim()}</strong> tiene una cuenta, recibirás un
            enlace para restablecer tu contraseña. El enlace vence después de
            un tiempo por seguridad.
          </p>
          <Link to="/login" className="btn btn-primary w-100">
            <ArrowLeft size={17} aria-hidden="true" />
            Volver a iniciar sesión
          </Link>
          <button
            type="button"
            className="btn btn-outline-secondary w-100"
            onClick={() => {
              setSent(false);
              setEmail("");
            }}
          >
            Usar otro correo
          </button>
        </div>
      ) : (
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <Field
            label="Correo electrónico"
            htmlFor="forgot-email"
            required
            error={error}
            hint="Usa el mismo correo con el que ingresas a tu cuenta."
          >
            <input
              id="forgot-email"
              type="email"
              autoComplete="email"
              className="form-control"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                if (error) setError("");
              }}
              placeholder="tu@correo.com"
              aria-invalid={Boolean(error)}
            />
          </Field>

          <button type="submit" className="btn btn-primary btn-lg w-100" disabled={submitting}>
            {submitting ? (
              <LoaderCircle size={18} className="spin" aria-hidden="true" />
            ) : (
              <Send size={18} aria-hidden="true" />
            )}
            {submitting ? "Enviando…" : "Enviar enlace de recuperación"}
          </button>
        </form>
      )}

      {!sent && (
        <>
          <div className="auth-divider">
            <span>¿Recordaste tu contraseña?</span>
          </div>
          <Link to="/login" className="btn btn-outline-secondary w-100">
            <ArrowLeft size={17} aria-hidden="true" />
            Volver a iniciar sesión
          </Link>
        </>
      )}

      <p className="auth-note">
        Nunca compartimos tu contraseña ni pedimos datos sensibles por correo.
      </p>
    </AuthLayout>
  );
}
