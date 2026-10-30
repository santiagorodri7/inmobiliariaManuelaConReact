import { useState } from "react";
import { Link } from "react-router-dom";
import { Send } from "lucide-react";
import StarRating from "./StarRating.jsx";
import Field from "../ui/Field.jsx";
import { useToast } from "../ui/Toast.jsx";
import { createTestimonial } from "../../services/testimonialsService.js";
import { getErrorMessage } from "../../utils/errors.js";
import { hasErrors, validateTestimonial } from "../../utils/validation.js";

export default function TestimonialForm({ profile, onCreated }) {
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
        <h3>¿Ya trabajaste con nosotros?</h3>
        <p>
          Inicia sesión para compartir tu experiencia. Los testimonios se
          publican con tu nombre y quedan asociados a tu cuenta.
        </p>
        <Link to="/login" className="btn btn-primary">
          Iniciar sesión
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
      toast.error("Revisa los campos del testimonio.");
      return;
    }

    setSaving(true);
    try {
      const created = await createTestimonial(values);
      toast.success("Gracias por compartir tu experiencia.");
      setValues({
        nombre: profile.nombre || "",
        profesion: "",
        texto: "",
        rating: 0,
      });
      onCreated?.(created);
    } catch (error) {
      toast.error(getErrorMessage(error, "No se pudo publicar el testimonio."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="testimonial-form" onSubmit={handleSubmit}>
      <p className="eyebrow">Tu experiencia</p>
      <h3>Comparte lo que viviste</h3>
      <p className="testimonial-form__intro">
        Tu opinión ayuda a otras personas a dar el siguiente paso con confianza.
      </p>

      <StarRating
        value={values.rating}
        onChange={(rating) => setValues((current) => ({ ...current, rating }))}
        size={24}
        label="Tu calificación"
      />
      {errors.rating && <p className="form-error">{errors.rating}</p>}

      <div className="form-grid form-grid--two">
        <Field label="Nombre" htmlFor="testimonial-name" error={errors.nombre} required>
          <input
            id="testimonial-name"
            className="form-control"
            value={values.nombre}
            onChange={update("nombre")}
            aria-invalid={Boolean(errors.nombre)}
          />
        </Field>
        <Field label="Profesión u ocupación" htmlFor="testimonial-profession" hint="Opcional">
          <input
            id="testimonial-profession"
            className="form-control"
            value={values.profesion}
            onChange={update("profesion")}
            placeholder="Ej. Diseñadora"
          />
        </Field>
      </div>

      <Field
        label="Tu experiencia"
        htmlFor="testimonial-text"
        error={errors.texto}
        hint={`${values.texto.length} caracteres · mínimo 20`}
        required
      >
        <textarea
          id="testimonial-text"
          className="form-control"
          rows={4}
          value={values.texto}
          onChange={update("texto")}
          placeholder="Cuéntanos cómo fue el proceso de compra, venta o arriendo."
          aria-invalid={Boolean(errors.texto)}
        />
      </Field>

      <button type="submit" className="btn btn-primary" disabled={saving}>
        <Send size={16} aria-hidden="true" />
        {saving ? "Publicando…" : "Publicar testimonio"}
      </button>
    </form>
  );
}
