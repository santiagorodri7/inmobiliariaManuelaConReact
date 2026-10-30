import { useEffect, useState } from "react";
import { CheckCircle2, LoaderCircle, Mail, MessageCircle, Send } from "lucide-react";
import Field from "../ui/Field.jsx";
import { useToast } from "../ui/Toast.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { buildContactMailto, sendContactMessage } from "../../services/contactService.js";
import { getErrorMessage } from "../../utils/errors.js";
import { hasErrors, validateContact } from "../../utils/validation.js";
import { contactSubjects, site, whatsappUrl } from "../../config/site.js";

export default function ContactForm({
  propertyId = "",
  defaultSubject = "",
  compact = false,
  onSent,
}) {
  const { profile } = useAuth();
  const toast = useToast();
  const [values, setValues] = useState({
    name: "",
    email: "",
    phone: "",
    subject: defaultSubject || contactSubjects[0],
    message: "",
    honeypot: "",
  });
  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [failure, setFailure] = useState("");

  useEffect(() => {
    if (!profile) return;
    setValues((current) => ({
      ...current,
      name: current.name || profile.nombre || "",
      email: current.email || profile.email || "",
      phone: current.phone || profile.telefono || "",
    }));
  }, [profile]);

  const update = (field) => (event) => {
    setValues((current) => ({ ...current, [field]: event.target.value }));
    if (errors[field]) setErrors((current) => ({ ...current, [field]: "" }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFailure("");
    const nextErrors = validateContact(values);
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) {
      toast.error("Revisa los campos del formulario.");
      return;
    }

    setSending(true);
    try {
      await sendContactMessage({ ...values, propertyId });
      setSent(true);
      toast.success("Mensaje enviado. Te responderemos pronto.");
      onSent?.();
    } catch (error) {
      const message = getErrorMessage(
        error,
        "No se pudo enviar el mensaje. Escríbenos directamente.",
      );
      setFailure(message);
      toast.error(message);
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <div className="contact-success">
        <span className="contact-success__icon" aria-hidden="true">
          <CheckCircle2 size={30} />
        </span>
        <p className="eyebrow">Mensaje enviado</p>
        <h3>Gracias por escribirnos</h3>
        <p>
          Recibimos tu mensaje y te responderemos al correo que indicaste. Si
          prefieres, también puedes escribirnos por WhatsApp.
        </p>
        <div className="contact-success__actions">
          <a
            href={whatsappUrl(`Hola ${site.name}, acabo de enviar un mensaje desde el sitio web.`)}
            target="_blank"
            rel="noreferrer"
            className="btn btn-primary"
          >
            <MessageCircle size={17} aria-hidden="true" />
            Abrir WhatsApp
          </a>
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={() => {
              setSent(false);
              setValues((current) => ({ ...current, message: "" }));
            }}
          >
            Enviar otro mensaje
          </button>
        </div>
      </div>
    );
  }

  return (
    <form className={`contact-form${compact ? " contact-form--compact" : ""}`} onSubmit={handleSubmit} noValidate>
      <div className="form-grid form-grid--two">
        <Field label="Nombre completo" htmlFor="contact-name" required error={errors.name}>
          <input
            id="contact-name"
            className="form-control"
            value={values.name}
            onChange={update("name")}
            autoComplete="name"
            aria-invalid={Boolean(errors.name)}
          />
        </Field>
        <Field label="Correo electrónico" htmlFor="contact-email" required error={errors.email}>
          <input
            id="contact-email"
            type="email"
            className="form-control"
            value={values.email}
            onChange={update("email")}
            autoComplete="email"
            aria-invalid={Boolean(errors.email)}
          />
        </Field>
        <Field label="Teléfono" htmlFor="contact-phone" error={errors.phone} hint="Opcional">
          <input
            id="contact-phone"
            type="tel"
            className="form-control"
            value={values.phone}
            onChange={update("phone")}
            autoComplete="tel"
            aria-invalid={Boolean(errors.phone)}
          />
        </Field>
        <Field label="Asunto" htmlFor="contact-subject" required error={errors.subject}>
          <select
            id="contact-subject"
            className="form-select"
            value={values.subject}
            onChange={update("subject")}
            aria-invalid={Boolean(errors.subject)}
          >
            {contactSubjects.map((subject) => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field
        label="Mensaje"
        htmlFor="contact-message"
        required
        error={errors.message}
        hint="Cuéntanos qué buscas, en qué zona y con qué presupuesto. Así podemos ayudarte mejor."
      >
        <textarea
          id="contact-message"
          className="form-control"
          rows={compact ? 4 : 5}
          value={values.message}
          onChange={update("message")}
          placeholder="Hola, estoy buscando…"
          aria-invalid={Boolean(errors.message)}
        />
      </Field>

      <div className="honeypot" aria-hidden="true">
        <label htmlFor="contact-website">No completar</label>
        <input
          id="contact-website"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={values.honeypot}
          onChange={update("honeypot")}
        />
      </div>

      {failure && (
        <div className="alert alert-warning" role="alert">
          <strong>No pudimos enviar el correo.</strong>
          <p>{failure}</p>
          <div className="alert-actions">
            <a href={buildContactMailto(values)} className="btn btn-outline-secondary btn-sm">
              <Mail size={15} aria-hidden="true" />
              Abrir mi correo
            </a>
            <a
              href={whatsappUrl(`Hola ${site.name}, quiero hacer una consulta desde el sitio web.`)}
              target="_blank"
              rel="noreferrer"
              className="btn btn-outline-secondary btn-sm"
            >
              <MessageCircle size={15} aria-hidden="true" />
              WhatsApp
            </a>
          </div>
        </div>
      )}

      <div className="contact-form__footer">
        <p>
          Tus datos se usan únicamente para responder tu consulta. No compartimos
          tu información con terceros.
        </p>
        <button type="submit" className="btn btn-primary" disabled={sending}>
          {sending ? (
            <LoaderCircle size={17} className="spin" aria-hidden="true" />
          ) : (
            <Send size={17} aria-hidden="true" />
          )}
          {sending ? "Enviando…" : "Enviar mensaje"}
        </button>
      </div>
    </form>
  );
}
