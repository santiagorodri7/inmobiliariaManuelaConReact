import { useState } from "react";
import { Star } from "lucide-react";
import { useI18n } from "../../i18n/I18nContext.jsx";

export default function StarRating({
  value = 0,
  onChange,
  readOnly = false,
  size = 16,
  label,
}) {
  const { t } = useI18n();
  const [hovered, setHovered] = useState(0);
  const display = hovered || value;
  const ratingLabel = label || t("testimonials.stars.label");

  return (
    <span
      className={`star-rating${readOnly ? " star-rating--readonly" : ""}`}
      role={readOnly ? "img" : "radiogroup"}
      aria-label={t("testimonials.stars.value", { label: ratingLabel, value })}
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
            aria-label={t("testimonials.stars.star", { star })}
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
