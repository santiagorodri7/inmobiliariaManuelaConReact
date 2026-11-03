import { Quote } from "lucide-react";
import StarRating from "./StarRating.jsx";
import { initials } from "../../utils/format.js";
import { useI18n } from "../../i18n/I18nContext.jsx";

export default function TestimonialCard({ testimonial }) {
  const { t, formatDate } = useI18n();
  return (
    <article className="testimonial-card">
      <Quote size={28} className="testimonial-card__quote" aria-hidden="true" />
      <StarRating value={testimonial.rating} readOnly size={15} label={t("testimonials.card.ratingAria")} />
      <blockquote>{testimonial.texto}</blockquote>
      <footer>
        <span className="testimonial-card__avatar" aria-hidden="true">
          {initials(testimonial.nombre)}
        </span>
        <div>
          <strong>{testimonial.nombre}</strong>
          <span>
            {testimonial.profesion || t("testimonials.card.client")} · {formatDate(testimonial.fecha)}
          </span>
        </div>
      </footer>
    </article>
  );
}
