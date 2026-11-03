import { useState } from "react";
import { Link } from "react-router-dom";
import { Send } from "lucide-react";
import StarRating from "./StarRating.jsx";
import Field from "../ui/Field.jsx";
import { useToast } from "../ui/Toast.jsx";
import { createTestimonial } from "../../services/testimonialsService.js";
import { getErrorMessage } from "../../utils/errors.js";
import { hasErrors, validateTestimonial } from "../../utils/validation.js";
import { useI18n } from "../../i18n/I18nContext.jsx";

export default function TestimonialForm({ profile, onCreated }) {
  const { t } = useI18n();
  const toast = useToast();
  const [values, setValues] = useState({
    nombre: profile?.nombre || "",
    profesion: "",
    texto: "",
    rating: 0,
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  if (!profile) {
    return (
      <div className="testimonial-form testimonial-form--guest">
        <h3>{t("testimonials.form.guestTitle")}</h3>
        <p>{t("testimonials.form.guestText")}</p>
        <Link to="/login" className="btn btn-primary">
          {t("testimonials.form.guestLogin")}
        </Link>
      </div>
    );
  }

  const update = (field) => (event) =>
    setValues((current) => ({ ...current, [field]: event.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validateTestimonial(values);
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) {
      toast.error(t("testimonials.form.validationToast"));
      return;
    }

    setSaving(true);
    try {
      const created = await createTestimonial(values);
      toast.success(t("testimonials.form.successToast"));
      setValues({
        nombre: profile.nombre || "",
        profesion: "",
        texto: "",
        rating: 0,
      });
      onCreated?.(created);
    } catch (error) {
      toast.error(getErrorMessage(error, "testimonials.form.errorFallback"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="testimonial-form" onSubmit={handleSubmit}>
      <p className="eyebrow">{t("testimonials.form.eyebrow")}</p>
      <h3>{t("testimonials.form.title")}</h3>
      <p className="testimonial-form__intro">
        {t("testimonials.form.intro")}
      </p>

      <StarRating
        value={values.rating}
        onChange={(rating) => setValues((current) => ({ ...current, rating }))}
        size={24}
        label={t("testimonials.form.rating")}
      />
      {errors.rating && <p className="form-error">{errors.rating}</p>}

      <div className="form-grid form-grid--two">
        <Field label={t("testimonials.form.name")} htmlFor="testimonial-name" error={errors.nombre} required>
          <input
            id="testimonial-name"
            className="form-control"
            value={values.nombre}
            onChange={update("nombre")}
            aria-invalid={Boolean(errors.nombre)}
          />
        </Field>
        <Field label={t("testimonials.form.profession")} htmlFor="testimonial-profession" hint={t("common.optional")}>
          <input
            id="testimonial-profession"
            className="form-control"
            value={values.profesion}
            onChange={update("profesion")}
            placeholder={t("testimonials.form.professionPlaceholder")}
          />
        </Field>
      </div>

      <Field
        label={t("testimonials.form.text")}
        htmlFor="testimonial-text"
        error={errors.texto}
        hint={t("testimonials.form.textHint", { count: values.texto.length })}
        required
      >
        <textarea
          id="testimonial-text"
          className="form-control"
          rows={4}
          value={values.texto}
          onChange={update("texto")}
          placeholder={t("testimonials.form.textPlaceholder")}
          aria-invalid={Boolean(errors.texto)}
        />
      </Field>

      <button type="submit" className="btn btn-primary" disabled={saving}>
        <Send size={16} aria-hidden="true" />
        {saving ? t("testimonials.form.publishing") : t("testimonials.form.submit")}
      </button>
    </form>
  );
}
