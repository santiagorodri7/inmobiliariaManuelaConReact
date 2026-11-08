import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  Building2,
  Eye,
  EyeOff,
  LoaderCircle,
  Search,
  UserPlus,
} from "lucide-react";
import AuthLayout from "../../components/auth/AuthLayout.jsx";
import Field from "../../components/ui/Field.jsx";
import { useToast } from "../../components/ui/Toast.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { useI18n } from "../../i18n/I18nContext.jsx";
import { usePageTitle } from "../../hooks/usePageTitle.js";
import { getErrorMessage } from "../../utils/errors.js";
import { roleHome } from "../../utils/roles.js";
import { birthDateBounds } from "../../utils/dates.js";
import { formatCopInput } from "../../utils/format.js";
import { hasErrors, validateRegister } from "../../utils/validation.js";
import {
  CONTRACT_TYPE_VALUES,
  MARITAL_STATUS_VALUES,
  amountDigits,
  onlyDigits,
} from "../../config/profileOptions.js";

const roleOptions = [
  { value: "Comprador", key: "buyer", icon: Search },
  { value: "Vendedor", key: "seller", icon: Building2 },
];

const maritalStatusOptions = MARITAL_STATUS_VALUES.map((value) => ({
  value,
  labelKey: `auth.register.marital.${value}`,
}));

const contractTypeOptions = CONTRACT_TYPE_VALUES.map((value) => ({
  value,
  labelKey: `auth.register.contract.${value}`,
}));

const initialValues = (role) => ({
  nombre: "",
  cedula: "",
  fechaNacimiento: "",
  email: "",
  telefono: "",
  rol: role === "Vendedor" ? "Vendedor" : "Comprador",
  estadoCivil: "",
  tipoContrato: "",
  ingresosMensuales: "",
  ingresosExtras: "",
  password: "",
  confirmPassword: "",
  aceptaTratamiento: false,
});

export default function RegisterPage() {
  const { t } = useI18n();
  usePageTitle(t("auth.register.pageTitle"), t("auth.register.pageDescription"));
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { register } = useAuth();
  const [values, setValues] = useState(() =>
    initialValues(searchParams.get("rol")),
  );
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const birthBounds = birthDateBounds();

  const clearError = (field) => {
    if (errors[field]) setErrors((current) => ({ ...current, [field]: "" }));
    if (formError) setFormError("");
  };

  const update = (field) => (event) => {
    const value =
      event.target.type === "checkbox" ? event.target.checked : event.target.value;
    setValues((current) => ({ ...current, [field]: value }));
    clearError(field);
  };

  const updateDigits = (field, maxLength = 12) => (event) => {
    const value = onlyDigits(event.target.value).slice(0, maxLength);
    setValues((current) => ({ ...current, [field]: value }));
    clearError(field);
  };

  const updateAmount = (field) => (event) => {
    const value = amountDigits(event.target.value);
    setValues((current) => ({ ...current, [field]: value }));
    clearError(field);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validateRegister(values);
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) {
      toast.error(t("auth.register.validationToast"));
      return;
    }

    setSubmitting(true);
    setFormError("");
    try {
      const created = await register({
        nombre: values.nombre,
        cedula: values.cedula,
        fechaNacimiento: values.fechaNacimiento,
        email: values.email,
        telefono: values.telefono,
        password: values.password,
        rol: values.rol,
        estadoCivil: values.estadoCivil,
        tipoContrato: values.tipoContrato,
        ingresosMensuales: values.ingresosMensuales,
        ingresosExtras: values.ingresosExtras,
        aceptaTratamiento: values.aceptaTratamiento,
      });
      toast.success(t("auth.register.successToast"));
      navigate(roleHome(created), { replace: true });
    } catch (error) {
      setFormError(getErrorMessage(error, "auth.register.errorFallback"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      eyebrow={t("auth.register.eyebrow")}
      title={t("auth.register.title")}
      description={t("auth.register.description")}
      points={[
        t("auth.register.point1"),
        t("auth.register.point2"),
        t("auth.register.point3"),
      ]}
    >
      <div className="auth-card__head">
        <p className="eyebrow">{t("auth.register.headEyebrow")}</p>
        <h1>{t("auth.register.headTitle")}</h1>
        <p>{t("auth.register.headText")}</p>
      </div>

      {formError && (
        <div className="alert alert-danger auth-alert" role="alert">
          <strong>{t("auth.register.errorTitle")}</strong>
          <p>{formError}</p>
        </div>
      )}

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <fieldset className="role-picker">
          <legend>{t("auth.register.roleLegend")}</legend>
          <div className="role-picker__grid">
            {roleOptions.map(({ value, key, icon: Icon }) => (
              <label
                key={value}
                className={`role-option${values.rol === value ? " is-selected" : ""}`}
              >
                <input
                  type="radio"
                  name="rol"
                  value={value}
                  checked={values.rol === value}
                  onChange={update("rol")}
                />
                <span className="role-option__icon" aria-hidden="true">
                  <Icon size={20} />
                </span>
                <span className="role-option__copy">
                  <strong>{t(`auth.register.role${key === "buyer" ? "Buyer" : "Seller"}Title`)}</strong>
                  <span>{t(`auth.register.role${key === "buyer" ? "Buyer" : "Seller"}Text`)}</span>
                </span>
              </label>
            ))}
          </div>
          {errors.rol && (
            <p className="form-error" role="alert">
              {errors.rol}
            </p>
          )}
        </fieldset>

        <fieldset className="form-section">
          <legend>{t("auth.register.personalLegend")}</legend>
          <div className="form-grid form-grid--two">
            <Field
              label={t("auth.register.name")}
              htmlFor="register-name"
              required
              error={errors.nombre}
            >
              <input
                id="register-name"
                className="form-control"
                autoComplete="name"
                value={values.nombre}
                onChange={update("nombre")}
                placeholder={t("auth.register.namePlaceholder")}
                aria-invalid={Boolean(errors.nombre)}
                required
              />
            </Field>

            <Field
              label={t("auth.register.id")}
              htmlFor="register-id"
              required
              error={errors.cedula}
              hint={t("auth.register.idHint")}
            >
              <input
                id="register-id"
                className="form-control"
                inputMode="numeric"
                autoComplete="off"
                value={values.cedula}
                onChange={updateDigits("cedula")}
                placeholder={t("auth.register.idPlaceholder")}
                aria-invalid={Boolean(errors.cedula)}
                required
              />
            </Field>

            <Field
              label={t("auth.register.birth")}
              htmlFor="register-birth"
              required
              error={errors.fechaNacimiento}
              hint={t("auth.register.birthHint", {
                year: birthBounds.max.slice(0, 4),
              })}
            >
              <input
                id="register-birth"
                type="date"
                min={birthBounds.min}
                max={birthBounds.max}
                className="form-control"
                value={values.fechaNacimiento}
                onChange={update("fechaNacimiento")}
                aria-invalid={Boolean(errors.fechaNacimiento)}
                required
              />
            </Field>

            <Field
              label={t("auth.register.phone")}
              htmlFor="register-phone"
              hint={t("common.optional")}
            >
              <input
                id="register-phone"
                type="tel"
                autoComplete="tel"
                className="form-control"
                value={values.telefono}
                onChange={update("telefono")}
                placeholder={t("auth.register.phonePlaceholder")}
              />
            </Field>

            <Field
              label={t("auth.register.email")}
              htmlFor="register-email"
              required
              error={errors.email}
              className="form-field--full"
            >
              <input
                id="register-email"
                type="email"
                autoComplete="email"
                className="form-control"
                value={values.email}
                onChange={update("email")}
                placeholder={t("auth.register.emailPlaceholder")}
                aria-invalid={Boolean(errors.email)}
                required
              />
            </Field>
          </div>
        </fieldset>

        <fieldset className="form-section">
          <legend>{t("auth.register.securityLegend")}</legend>
          <div className="form-grid form-grid--two">
            <Field
              label={t("auth.register.password")}
              htmlFor="register-password"
              required
              error={errors.password}
              hint={t("auth.register.passwordHint")}
            >
              <div className="password-control">
                <input
                  id="register-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  className="form-control"
                  value={values.password}
                  onChange={update("password")}
                  aria-invalid={Boolean(errors.password)}
                  required
                />
                <button
                  type="button"
                  className="password-control__toggle"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={
                    showPassword
                      ? t("auth.register.hidePasswords")
                      : t("auth.register.showPasswords")
                  }
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </Field>

            <Field
              label={t("auth.register.confirmPassword")}
              htmlFor="register-confirm"
              required
              error={errors.confirmPassword}
            >
              <input
                id="register-confirm"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                className="form-control"
                value={values.confirmPassword}
                onChange={update("confirmPassword")}
                aria-invalid={Boolean(errors.confirmPassword)}
                required
              />
            </Field>
          </div>
        </fieldset>

        <fieldset className="form-section form-section--financial">
          <legend>{t("auth.register.financialLegend")}</legend>
          <p className="form-section__hint">{t("auth.register.financialHint")}</p>
          <div className="form-grid form-grid--two">
            <Field
              label={t("auth.register.maritalStatus")}
              htmlFor="register-marital"
              required
              error={errors.estadoCivil}
            >
              <select
                id="register-marital"
                className="form-select"
                value={values.estadoCivil}
                onChange={update("estadoCivil")}
                aria-invalid={Boolean(errors.estadoCivil)}
                required
              >
                <option value="">{t("auth.register.selectPlaceholder")}</option>
                {maritalStatusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {t(option.labelKey)}
                  </option>
                ))}
              </select>
            </Field>

            <Field
              label={t("auth.register.contractType")}
              htmlFor="register-contract"
              required
              error={errors.tipoContrato}
            >
              <select
                id="register-contract"
                className="form-select"
                value={values.tipoContrato}
                onChange={update("tipoContrato")}
                aria-invalid={Boolean(errors.tipoContrato)}
                required
              >
                <option value="">{t("auth.register.selectPlaceholder")}</option>
                {contractTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {t(option.labelKey)}
                  </option>
                ))}
              </select>
            </Field>

            <Field
              label={t("auth.register.monthlyIncome")}
              htmlFor="register-monthly-income"
              required
              error={errors.ingresosMensuales}
              hint={t("auth.register.monthlyIncomeHint")}
            >
              <input
                id="register-monthly-income"
                className="form-control"
                inputMode="numeric"
                autoComplete="off"
                value={formatCopInput(values.ingresosMensuales)}
                onChange={updateAmount("ingresosMensuales")}
                placeholder={t("auth.register.monthlyIncomePlaceholder")}
                aria-invalid={Boolean(errors.ingresosMensuales)}
                required
              />
            </Field>

            <Field
              label={t("auth.register.extraIncome")}
              htmlFor="register-extra-income"
              required
              error={errors.ingresosExtras}
              hint={t("auth.register.extraIncomeHint")}
            >
              <input
                id="register-extra-income"
                className="form-control"
                inputMode="numeric"
                autoComplete="off"
                value={formatCopInput(values.ingresosExtras)}
                onChange={updateAmount("ingresosExtras")}
                placeholder={t("auth.register.extraIncomePlaceholder")}
                aria-invalid={Boolean(errors.ingresosExtras)}
                required
              />
            </Field>
          </div>
        </fieldset>

        <label className={`terms-check${errors.aceptaTratamiento ? " is-invalid" : ""}`}>
          <input
            type="checkbox"
            checked={values.aceptaTratamiento}
            onChange={update("aceptaTratamiento")}
            aria-invalid={Boolean(errors.aceptaTratamiento)}
            required
          />
          <span>
            {t("auth.register.consentPrefix")}{" "}
            <Link
              to="/privacidad"
              target="_blank"
              rel="noopener noreferrer"
              onClick={(event) => event.stopPropagation()}
            >
              {t("auth.register.consentLink")}
            </Link>{" "}
            {t("auth.register.consentSuffix")}
          </span>
        </label>
        {errors.aceptaTratamiento && (
          <p className="form-error" role="alert">
            {errors.aceptaTratamiento}
          </p>
        )}

        <button type="submit" className="btn btn-primary btn-lg w-100" disabled={submitting}>
          {submitting ? (
            <LoaderCircle size={18} className="spin" aria-hidden="true" />
          ) : (
            <UserPlus size={18} aria-hidden="true" />
          )}
          {submitting ? t("auth.register.submitting") : t("auth.register.submit")}
        </button>
      </form>

      <div className="auth-divider">
        <span>{t("auth.register.divider")}</span>
      </div>

      <Link to="/login" className="btn btn-outline-secondary w-100">
        {t("auth.register.login")}
      </Link>
    </AuthLayout>
  );
}
