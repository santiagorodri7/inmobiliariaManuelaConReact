import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, LoaderCircle, Mail, MessageCircle, Send } from "lucide-react";
import Field from "../ui/Field.jsx";
import { useToast } from "../ui/Toast.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { useI18n } from "../../i18n/I18nContext.jsx";
import { buildContactMailto, sendContactMessage } from "../../services/contactService.js";
import { getErrorMessage } from "../../utils/errors.js";
import { hasErrors, validateContact } from "../../utils/validation.js";
import { contactSubjects, site } from "../../config/site.js";
import { buildWhatsappUrl, isWhatsappConfigured } from "../../utils/whatsapp.js";

export default function ContactForm({
  propertyId = "",
  defaultSubject = "",
  compact = false,
  onSent,
}) {
  const { profile } = useAuth();
  const { t, contactSubjectLabel } = useI18n();
  const toast = useToast();
  const [values, setValues] = useState({
    name: "",
    email: "",
    phone: "",
    subject: defaultSubject || contactSubjects[0],
    message: "",
    honeypot: "",
    acepta: false,
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
    const value =
      event.target.type === "checkbox" ? event.target.checked : event.target.value;
    setValues((current) => ({ ...current, [field]: value }));
    if (errors[field]) setErrors((current) => ({ ...current, [field]: "" }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFailure("");
    const nextErrors = validateContact(values);
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) {
      toast.error(t("contactForm.validationToast"));
      return;
    }

    setSending(true);
    try {
      await sendContactMessage({ ...values, propertyId });
      setSent(true);
      toast.success(t("contactForm.successToast"));
      onSent?.();
    } catch (error) {
      const message = getErrorMessage(error, "contactForm.errorFallback");
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
        <p className="eyebrow">{t("contactForm.sentEyebrow")}</p>
        <h3>{t("contactForm.sentTitle")}</h3>
        <p>{t("contactForm.sentText")}</p>
        <div className="contact-success__actions">
          {isWhatsappConfigured && (
            <a
              href={buildWhatsappUrl(
                t("contactForm.whatsappSent", { name: site.name }),
              )}
              target="_blank"
              rel="noreferrer"
              className="btn btn-primary"
            >
              <MessageCircle size={17} aria-hidden="true" />
              {t("contactForm.openWhatsapp")}
            </a>
          )}
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={() => {
              setSent(false);
              setValues((current) => ({
                ...current,
                message: "",
                acepta: false,
              }));
            }}
          >
            {t("contactForm.sendAnother")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <form className={`contact-form${compact ? " contact-form--compact" : ""}`} onSubmit={handleSubmit} noValidate>
      <div className="form-grid form-grid--two">
        <Field label={t("contactForm.name")} htmlFor="contact-name" required error={errors.name}>
          <input
            id="contact-name"
            className="form-control"
            value={values.name}
            onChange={update("name")}
            autoComplete="name"
            aria-invalid={Boolean(errors.name)}
          />
        </Field>
        <Field label={t("contactForm.email")} htmlFor="contact-email" required error={errors.email}>
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
        <Field label={t("contactForm.phone")} htmlFor="contact-phone" error={errors.phone} hint={t("common.optional")}>
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
        <Field label={t("contactForm.subject")} htmlFor="contact-subject" required error={errors.subject}>
          <select
            id="contact-subject"
            className="form-select"
            value={values.subject}
            onChange={update("subject")}
            aria-invalid={Boolean(errors.subject)}
          >
            {contactSubjects.map((subject) => (
              <option key={subject} value={subject}>
                {contactSubjectLabel(subject)}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field
        label={t("contactForm.message")}
        htmlFor="contact-message"
        required
        error={errors.message}
        hint={t("contactForm.messageHint")}
      >
        <textarea
          id="contact-message"
          className="form-control"
          rows={compact ? 4 : 5}
          value={values.message}
          onChange={update("message")}
          placeholder={t("contactForm.messagePlaceholder")}
          aria-invalid={Boolean(errors.message)}
        />
      </Field>

      <div className="honeypot" aria-hidden="true">
        <label htmlFor="contact-website">{t("contactForm.honeypot")}</label>
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
          <strong>{t("contactForm.failureTitle")}</strong>
          <p>{failure}</p>
          <div className="alert-actions">
            <a href={buildContactMailto(values)} className="btn btn-outline-secondary btn-sm">
              <Mail size={15} aria-hidden="true" />
              {t("contactForm.openMail")}
            </a>
            {isWhatsappConfigured && (
              <a
                href={buildWhatsappUrl(
                  t("contactForm.whatsappFallback", { name: site.name }),
                )}
                target="_blank"
                rel="noreferrer"
                className="btn btn-outline-secondary btn-sm"
              >
                <MessageCircle size={15} aria-hidden="true" />
                WhatsApp
              </a>
            )}
          </div>
        </div>
      )}

      <label className={`terms-check${errors.acepta ? " is-invalid" : ""}`}>
        <input
          type="checkbox"
          checked={values.acepta}
          onChange={update("acepta")}
          aria-invalid={Boolean(errors.acepta)}
        />
        <span>{t("contactForm.consent")}</span>
      </label>
      {errors.acepta && (
        <p className="form-error" role="alert">
          {errors.acepta}
        </p>
      )}

      <div className="contact-form__footer">
        <p>
          {t("contactForm.privacy")}{" "}
          <Link to="/privacidad">{t("contactForm.privacyLink")}</Link>
        </p>
        <button type="submit" className="btn btn-primary" disabled={sending}>
          {sending ? (
            <LoaderCircle size={17} className="spin" aria-hidden="true" />
          ) : (
            <Send size={17} aria-hidden="true" />
          )}
          {sending ? t("contactForm.sending") : t("contactForm.submit")}
        </button>
      </div>
    </form>
  );
}
