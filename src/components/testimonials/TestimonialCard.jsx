import { Quote } from "lucide-react";
import StarRating from "./StarRating.jsx";
import { formatDate } from "../../utils/dates.js";
import { initials } from "../../utils/format.js";

export default function TestimonialCard({ testimonial }) {
  return (
    <article className="testimonial-card">
      <Quote size={28} className="testimonial-card__quote" aria-hidden="true" />
      <StarRating value={testimonial.rating} readOnly size={15} label="Calificación del cliente" />
      <blockquote>{testimonial.texto}</blockquote>
      <footer>
        <span className="testimonial-card__avatar" aria-hidden="true">
          {initials(testimonial.nombre)}
        </span>
        <div>
          <strong>{testimonial.nombre}</strong>
          <span>
            {testimonial.profesion || "Cliente"} · {formatDate(testimonial.fecha)}
          </span>
        </div>
      </footer>
    </article>
  );
}
