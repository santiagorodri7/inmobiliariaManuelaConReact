import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  Bath,
  BedDouble,
  Car,
  Check,
  House,
  MapPin,
  Maximize,
} from "lucide-react";
import { useState } from "react";
import { OperationBadge } from "../ui/StatusBadge.jsx";
import { useI18n } from "../../i18n/I18nContext.jsx";
import { truncate } from "../../utils/format.js";
import { coverImage } from "../../utils/property.js";

export default function PropertyCard({
  property,
  selectable = false,
  selected = false,
  onToggleSelect,
}) {
  const { t, formatArea, formatCOP, propertyTypeLabel } = useI18n();
  const [imageFailed, setImageFailed] = useState(false);
  const image = coverImage(property);
  const specs = [
    property.bedrooms > 0 && {
      icon: BedDouble,
      label: t("property.card.bedrooms", { count: property.bedrooms }),
    },
    property.bathrooms > 0 && {
      icon: Bath,
      label: t("property.card.bathrooms", { count: property.bathrooms }),
    },
    property.parking > 0 && {
      icon: Car,
      label: t("property.card.parking", { count: property.parking }),
    },
    property.area > 0 && {
      icon: Maximize,
      label: formatArea(property.area),
    },
  ].filter(Boolean);

  return (
    <article className={`property-card${selected ? " is-selected" : ""}`}>
      {selectable && (
        <label
          className={`property-card__select${selected ? " is-selected" : ""}`}
        >
          <input
            type="checkbox"
            checked={selected}
            onChange={() => onToggleSelect?.(property.id)}
            aria-label={t("property.selection.selectAria", {
              title: property.title,
            })}
          />
          <span className="property-card__select-mark" aria-hidden="true">
            {selected && <Check size={14} />}
          </span>
        </label>
      )}

      <Link
        to={`/propiedad/${encodeURIComponent(property.id)}`}
        className="property-card__media"
        aria-label={t("property.card.ariaView", { title: property.title })}
      >
        {image && !imageFailed ? (
          <img
            src={image}
            alt={property.title}
            loading="lazy"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <span className="property-card__placeholder">
            <House size={32} aria-hidden="true" />
            <span>{t("property.card.imageUnavailable")}</span>
          </span>
        )}
        <OperationBadge operation={property.operation} />
      </Link>

      <div className="property-card__body">
        <div className="property-card__price">
          <strong>{formatCOP(property.price)}</strong>
          <span>
            {property.operation === "renta"
              ? t("property.card.perMonth")
              : t("property.card.currency")}
          </span>
        </div>
        <h3>
          <Link to={`/propiedad/${encodeURIComponent(property.id)}`}>
            {property.title}
          </Link>
        </h3>
        <p className="property-card__location">
          <MapPin size={15} aria-hidden="true" />
          {property.location || t("property.card.locationPending")}
        </p>
        {property.description && (
          <p className="property-card__description">
            {truncate(property.description, 105)}
          </p>
        )}
        {specs.length > 0 && (
          <ul className="property-card__specs" aria-label={t("property.card.features")}>
            {specs.map(({ icon: Icon, label }) => (
              <li key={label}>
                <Icon size={15} aria-hidden="true" />
                {label}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="property-card__footer">
        <span>{propertyTypeLabel(property.type)}</span>
        <Link
          to={`/propiedad/${encodeURIComponent(property.id)}`}
          className="property-card__link"
        >
          {t("property.card.view")}
          <ArrowUpRight size={16} aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
