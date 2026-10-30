import { useState } from "react";
import { Star } from "lucide-react";

export default function StarRating({
  value = 0,
  onChange,
  readOnly = false,
  size = 16,
  label = "Calificación",
}) {
  const [hovered, setHovered] = useState(0);
  const display = hovered || value;

  return (
    <span
      className={`star-rating${readOnly ? " star-rating--readonly" : ""}`}
      role={readOnly ? "img" : "radiogroup"}
      aria-label={`${label}: ${value} de 5`}
      onMouseLeave={() => setHovered(0)}
    >
      {[1, 2, 3, 4, 5].map((star) =>
        readOnly ? (
          <Star
            key={star}
            size={size}
            className={star <= value ? "is-filled" : ""}
            aria-hidden="true"
          />
        ) : (
          <button
            key={star}
            type="button"
            className={star <= display ? "is-filled" : ""}
            onMouseEnter={() => setHovered(star)}
            onClick={() => onChange?.(star)}
            aria-label={`${star} de 5 estrellas`}
            aria-checked={star === value}
            role="radio"
          >
            <Star size={size} aria-hidden="true" />
          </button>
        ),
      )}
    </span>
  );
}
