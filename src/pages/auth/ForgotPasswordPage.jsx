import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, LoaderCircle, MailCheck, Send } from "lucide-react";
import AuthLayout from "../../components/auth/AuthLayout.jsx";
import Field from "../../components/ui/Field.jsx";
import { useToast } from "../../components/ui/Toast.jsx";
import { useI18n } from "../../i18n/I18nContext.jsx";
import { usePageTitle } from "../../hooks/usePageTitle.js";
import { requestPasswordReset } from "../../services/authService.js";
import { getErrorMessage } from "../../utils/errors.js";
import { isValidEmail } from "../../utils/validation.js";

const EMAIL_TOKEN = "__EMAIL__";

export default function ForgotPasswordPage() {
  const { t } = useI18n();
  usePageTitle(t("auth.forgot.pageTitle"), t("auth.forgot.pageDescription"));
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!isValidEmail(email)) {
      setError(t("auth.forgot.invalidEmail"));
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      await requestPasswordReset(email);
      setSent(true);
      toast.success(t("auth.forgot.successToast"));
    } catch (requestError) {
      setError(
        getErrorMessage(requestError, "auth.forgot.errorFallback"),
      );
    } finally {
      setSubmitting(false);
    }
  };

  const [beforeEmail, afterEmail] = t("auth.forgot.sentText", {
    email: EMAIL_TOKEN,
  }).split(EMAIL_TOKEN);

  return (
    <AuthLayout
      eyebrow={t("auth.forgot.eyebrow")}
      title={t("auth.forgot.title")}
      description={t("auth.forgot.description")}
      points={[
        t("auth.forgot.point1"),
        t("auth.forgot.point2"),
        t("auth.forgot.point3"),
      ]}
    >
      <div className="auth-card__head">
        <p className="eyebrow">{t("auth.forgot.headEyebrow")}</p>
        <h1>{t("auth.forgot.headTitle")}</h1>
        <p>{t("auth.forgot.headText")}</p>
      </div>

      {sent ? (
        <div className="auth-success">
          <span className="auth-success__icon" aria-hidden="true">
            <MailCheck size={30} />
          </span>
          <h2>{t("auth.forgot.sentTitle")}</h2>
          <p>
            {beforeEmail}
            <strong>{email.trim()}</strong>
            {afterEmail}
          </p>
          <Link to="/login" className="btn btn-primary w-100">
            <ArrowLeft size={17} aria-hidden="true" />
            {t("auth.forgot.backToLogin")}
          </Link>
          <button
            type="button"
            className="btn btn-outline-secondary w-100"
            onClick={() => {
              setSent(false);
              setEmail("");
            }}
          >
            {t("auth.forgot.useAnother")}
          </button>
        </div>
      ) : (
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <Field
            label={t("auth.forgot.email")}
            htmlFor="forgot-email"
            required
            error={error}
            hint={t("auth.forgot.emailHint")}
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
              placeholder={t("auth.forgot.emailPlaceholder")}
              aria-invalid={Boolean(error)}
            />
          </Field>

          <button type="submit" className="btn btn-primary btn-lg w-100" disabled={submitting}>
            {submitting ? (
              <LoaderCircle size={18} className="spin" aria-hidden="true" />
            ) : (
              <Send size={18} aria-hidden="true" />
            )}
            {submitting ? t("auth.forgot.submitting") : t("auth.forgot.submit")}
          </button>
        </form>
      )}

      {!sent && (
        <>
          <div className="auth-divider">
            <span>{t("auth.forgot.divider")}</span>
          </div>
          <Link to="/login" className="btn btn-outline-secondary w-100">
            <ArrowLeft size={17} aria-hidden="true" />
            {t("auth.forgot.backToLogin")}
          </Link>
        </>
      )}

      <p className="auth-note">{t("auth.forgot.note")}</p>
    </AuthLayout>
  );
}
