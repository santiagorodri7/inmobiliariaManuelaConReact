import Field from "./Field.jsx";
import { useI18n } from "../../i18n/I18nContext.jsx";
import { normalizeLanguage } from "../../i18n/languages.js";

export default function LanguageSelect({
  id = "language",
  value,
  onChange,
  label,
  hint,
  error = "",
  disabled = false,
  className = "",
}) {
  const { t } = useI18n();

  return (
    <Field
      label={label === undefined ? t("language.label") : label}
      htmlFor={id}
      hint={hint === undefined ? t("language.hint") : hint}
      error={error}
      className={className}
    >
      <select
        id={id}
        className="form-select"
        value={normalizeLanguage(value)}
        onChange={onChange}
        disabled={disabled}
        aria-invalid={Boolean(error)}
      >
        <option value="es">{t("language.spanish")}</option>
        <option value="en">{t("language.english")}</option>
      </select>
    </Field>
  );
}
