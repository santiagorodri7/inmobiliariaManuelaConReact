import { useState } from "react";
import { KeyRound, LoaderCircle } from "lucide-react";
import Field from "../ui/Field.jsx";
import { useToast } from "../ui/Toast.jsx";
import { useI18n } from "../../i18n/I18nContext.jsx";
import { changePassword } from "../../services/authService.js";
import { getErrorMessage } from "../../utils/errors.js";
import { hasErrors, validatePasswordChange } from "../../utils/validation.js";

export default function PasswordForm() {
  const { t } = useI18n();
  const toast = useToast();
  const [values, setValues] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const update = (field) => (event) => {
    setValues((current) => ({ ...current, [field]: event.target.value }));
    if (errors[field]) setErrors((current) => ({ ...current, [field]: "" }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validatePasswordChange(values);
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) return;

    setSaving(true);
    try {
      await changePassword(values.currentPassword, values.newPassword);
      toast.success(t("account.password.success"));
      setValues({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setErrors({});
    } catch (error) {
      const message =
        error?.code === "auth/invalid-credential" ||
        error?.code === "auth/wrong-password"
          ? t("account.password.wrong")
          : getErrorMessage(error, "account.password.errorFallback");
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="surface profile-form" onSubmit={handleSubmit}>
      <div className="panel-heading">
        <div>
          <p className="eyebrow">{t("account.password.eyebrow")}</p>
          <h2>{t("account.password.title")}</h2>
          <p>{t("account.password.text")}</p>
        </div>
      </div>

      <div className="form-grid form-grid--two">
        <Field
          label={t("account.password.current")}
          htmlFor="password-current"
          error={errors.currentPassword}
          className="form-field--full"
          required
        >
          <input
            id="password-current"
            type="password"
            autoComplete="current-password"
            className="form-control"
            value={values.currentPassword}
            onChange={update("currentPassword")}
            aria-invalid={Boolean(errors.currentPassword)}
          />
        </Field>
        <Field
          label={t("account.password.new")}
          htmlFor="password-new"
          error={errors.newPassword}
          required
        >
          <input
            id="password-new"
            type="password"
            autoComplete="new-password"
            className="form-control"
            value={values.newPassword}
            onChange={update("newPassword")}
            aria-invalid={Boolean(errors.newPassword)}
          />
        </Field>
        <Field
          label={t("account.password.confirm")}
          htmlFor="password-confirm"
          error={errors.confirmPassword}
          required
        >
          <input
            id="password-confirm"
            type="password"
            autoComplete="new-password"
            className="form-control"
            value={values.confirmPassword}
            onChange={update("confirmPassword")}
            aria-invalid={Boolean(errors.confirmPassword)}
          />
        </Field>
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? (
            <LoaderCircle size={16} className="spin" aria-hidden="true" />
          ) : (
            <KeyRound size={16} aria-hidden="true" />
          )}
          {saving
            ? t("account.password.updating")
            : t("account.password.submit")}
        </button>
      </div>
    </form>
  );
}
