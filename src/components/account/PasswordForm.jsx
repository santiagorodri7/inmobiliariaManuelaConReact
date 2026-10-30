import { useState } from "react";
import { KeyRound, LoaderCircle } from "lucide-react";
import Field from "../ui/Field.jsx";
import { useToast } from "../ui/Toast.jsx";
import { changePassword } from "../../services/authService.js";
import { getErrorMessage } from "../../utils/errors.js";
import { hasErrors, validatePasswordChange } from "../../utils/validation.js";

export default function PasswordForm() {
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
      toast.success("Contraseña actualizada. Guárdala en un lugar seguro.");
      setValues({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setErrors({});
    } catch (error) {
      const message =
        error?.code === "auth/invalid-credential" ||
        error?.code === "auth/wrong-password"
          ? "La contraseña actual no es correcta."
          : getErrorMessage(error, "No se pudo cambiar la contraseña.");
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="surface profile-form" onSubmit={handleSubmit}>
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Seguridad</p>
          <h2>Cambiar contraseña</h2>
          <p>
            Usa una contraseña de al menos 8 caracteres. Te pediremos la actual
            para confirmar el cambio.
          </p>
        </div>
      </div>

      <div className="form-grid form-grid--two">
        <Field label="Contraseña actual" htmlFor="password-current" error={errors.currentPassword} className="form-field--full" required>
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
        <Field label="Nueva contraseña" htmlFor="password-new" error={errors.newPassword} required>
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
        <Field label="Confirmar nueva contraseña" htmlFor="password-confirm" error={errors.confirmPassword} required>
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
          {saving ? "Actualizando…" : "Actualizar contraseña"}
        </button>
      </div>
    </form>
  );
}
