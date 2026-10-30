import { Link } from "react-router-dom";
import { ArrowUpRight, Bath, BedDouble, Car, House, MapPin, Maximize } from "lucide-react";
import { useState } from "react";
import { OperationBadge } from "../ui/StatusBadge.jsx";
import { formatArea, formatCOP, truncate } from "../../utils/format.js";
import { coverImage } from "../../utils/property.js";

export default function PropertyCard({ property }) {
  const [imageFailed, setImageFailed] = useState(false);
  const image = coverImage(property);
  const specs = [
    property.bedrooms > 0 && {
      icon: BedDouble,
      label: `${property.bedrooms} hab.`,
    },
    property.bathrooms > 0 && {
      icon: Bath,
      label: `${property.bathrooms} baños`,
    },
    property.parking > 0 && {
      icon: Car,
      label: `${property.parking} parq.`,
    },
    property.area > 0 && {
      icon: Maximize,
      label: formatArea(property.area),
    },
  ].filter(Boolean);

  return (
    <article className="property-card">
      <Link
        to={`/propiedad/${encodeURIComponent(property.id)}`}
        className="property-card__media"
        aria-label={`Ver ${property.title}`}
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
            <span>Imagen no disponible</span>
          </span>
        )}
        <OperationBadge operation={property.operation} />
      </Link>

      <div className="property-card__body">
        <div className="property-card__price">
          <strong>{formatCOP(property.price)}</strong>
          <span>{property.operation === "renta" ? " / mes" : " COP"}</span>
        </div>
        <h3>
          <Link to={`/propiedad/${encodeURIComponent(property.id)}`}>
            {property.title}
          </Link>
        </h3>
        <p className="property-card__location">
          <MapPin size={15} aria-hidden="true" />
          {property.location || "Ubicación por confirmar"}
        </p>
        {property.description && (
          <p className="property-card__description">
            {truncate(property.description, 105)}
          </p>
        )}
        {specs.length > 0 && (
          <ul className="property-card__specs" aria-label="Características">
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
        <span>{property.type}</span>
        <Link
          to={`/propiedad/${encodeURIComponent(property.id)}`}
          className="property-card__link"
        >
          Ver propiedad
          <ArrowUpRight size={16} aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
