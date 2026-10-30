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
import { usePageTitle } from "../../hooks/usePageTitle.js";
import { getErrorMessage } from "../../utils/errors.js";
import { roleHome } from "../../utils/roles.js";
import { todayInputValue } from "../../utils/dates.js";
import { hasErrors, validateRegister } from "../../utils/validation.js";

const roleOptions = [
  {
    value: "Comprador",
    icon: Search,
    title: "Quiero comprar o arrendar",
    description: "Explora propiedades y guarda tus preferencias.",
  },
  {
    value: "Vendedor",
    icon: Building2,
    title: "Quiero publicar un inmueble",
    description: "Publica y administra tus propiedades.",
  },
];

const initialValues = (role) => ({
  nombre: "",
  cedula: "",
  fechaNacimiento: "",
  email: "",
  telefono: "",
  rol: role === "Vendedor" ? "Vendedor" : "Comprador",
  password: "",
  confirmPassword: "",
  terms: false,
});

export default function RegisterPage() {
  usePageTitle("Crear cuenta", "Crea tu cuenta en Manuela Bermúdez Realtor.");
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

  const update = (field) => (event) => {
    const value =
      event.target.type === "checkbox" ? event.target.checked : event.target.value;
    setValues((current) => ({ ...current, [field]: value }));
    if (errors[field]) setErrors((current) => ({ ...current, [field]: "" }));
    if (formError) setFormError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validateRegister(values);
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) {
      toast.error("Revisa los campos marcados antes de continuar.");
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
      });
      toast.success("Tu cuenta está lista. Bienvenido a Manuela Bermúdez Realtor.");
      navigate(roleHome(created), { replace: true });
    } catch (error) {
      setFormError(getErrorMessage(error, "No pudimos crear tu cuenta."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="Crea tu cuenta"
      title="Empieza a buscar, publicar y decidir con claridad."
      description="Una cuenta te permite guardar tus preferencias, publicar tu inmueble y mantener toda la conversación en un solo lugar."
      points={[
        "Compradores: recomendaciones según sus intereses.",
        "Vendedores: publicaciones y seguimiento del inventario.",
        "Datos protegidos y acceso con tu propio correo.",
      ]}
    >
      <div className="auth-card__head">
        <p className="eyebrow">Registro</p>
        <h1>Crea tu cuenta</h1>
        <p>
          Completa tus datos. El registro público permite cuentas de Comprador y
          Vendedor; las cuentas de administración se asignan por separado.
        </p>
      </div>

      {formError && (
        <div className="alert alert-danger auth-alert" role="alert">
          <strong>No pudimos crear tu cuenta.</strong>
          <p>{formError}</p>
        </div>
      )}

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <fieldset className="role-picker">
          <legend>¿Cómo quieres usar la plataforma?</legend>
          <div className="role-picker__grid">
            {roleOptions.map(({ value, icon: Icon, title, description }) => (
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
                  <strong>{title}</strong>
                  <span>{description}</span>
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

        <div className="form-grid form-grid--two">
          <Field label="Nombre completo" htmlFor="register-name" required error={errors.nombre}>
            <input
              id="register-name"
              className="form-control"
              autoComplete="name"
              value={values.nombre}
              onChange={update("nombre")}
              placeholder="Ej. Laura Restrepo"
              aria-invalid={Boolean(errors.nombre)}
            />
          </Field>

          <Field label="Cédula" htmlFor="register-id" required error={errors.cedula}>
            <input
              id="register-id"
              className="form-control"
              inputMode="numeric"
              value={values.cedula}
              onChange={update("cedula")}
              placeholder="Número de documento"
              aria-invalid={Boolean(errors.cedula)}
            />
          </Field>

          <Field label="Fecha de nacimiento" htmlFor="register-birth" required error={errors.fechaNacimiento}>
            <input
              id="register-birth"
              type="date"
              max={todayInputValue()}
              className="form-control"
              value={values.fechaNacimiento}
              onChange={update("fechaNacimiento")}
              aria-invalid={Boolean(errors.fechaNacimiento)}
            />
          </Field>

          <Field label="Teléfono" htmlFor="register-phone" hint="Opcional">
            <input
              id="register-phone"
              type="tel"
              autoComplete="tel"
              className="form-control"
              value={values.telefono}
              onChange={update("telefono")}
              placeholder="+57 300 000 0000"
            />
          </Field>

          <Field label="Correo electrónico" htmlFor="register-email" required error={errors.email} className="form-field--full">
            <input
              id="register-email"
              type="email"
              autoComplete="email"
              className="form-control"
              value={values.email}
              onChange={update("email")}
              placeholder="tu@correo.com"
              aria-invalid={Boolean(errors.email)}
            />
          </Field>

          <Field label="Contraseña" htmlFor="register-password" required error={errors.password} hint="Mínimo 8 caracteres.">
            <div className="password-control">
              <input
                id="register-password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                className="form-control"
                value={values.password}
                onChange={update("password")}
                aria-invalid={Boolean(errors.password)}
              />
              <button
                type="button"
                className="password-control__toggle"
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label={showPassword ? "Ocultar contraseñas" : "Mostrar contraseñas"}
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </Field>

          <Field label="Confirmar contraseña" htmlFor="register-confirm" required error={errors.confirmPassword}>
            <input
              id="register-confirm"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              className="form-control"
              value={values.confirmPassword}
              onChange={update("confirmPassword")}
              aria-invalid={Boolean(errors.confirmPassword)}
            />
          </Field>
        </div>

        <label className={`terms-check${errors.terms ? " is-invalid" : ""}`}>
          <input
            type="checkbox"
            checked={values.terms}
            onChange={update("terms")}
            aria-invalid={Boolean(errors.terms)}
          />
          <span>
            Acepto el tratamiento de mis datos personales para gestionar mi
            cuenta, recibir respuestas a mis consultas y usar los servicios de la
            plataforma.
          </span>
        </label>
        {errors.terms && (
          <p className="form-error" role="alert">
            {errors.terms}
          </p>
        )}

        <button type="submit" className="btn btn-primary btn-lg w-100" disabled={submitting}>
          {submitting ? (
            <LoaderCircle size={18} className="spin" aria-hidden="true" />
          ) : (
            <UserPlus size={18} aria-hidden="true" />
          )}
          {submitting ? "Creando tu cuenta…" : "Crear mi cuenta"}
        </button>
      </form>

      <div className="auth-divider">
        <span>¿Ya tienes una cuenta?</span>
      </div>

      <Link to="/login" className="btn btn-outline-secondary w-100">
        Iniciar sesión
      </Link>
    </AuthLayout>
  );
}
