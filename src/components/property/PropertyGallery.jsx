import { useState } from "react";
import { House, ImageOff } from "lucide-react";
import { coverImage } from "../../utils/property.js";

export default function PropertyGallery({ property }) {
  const images = property?.images || [];
  const [active, setActive] = useState(0);
  const [failed, setFailed] = useState({});
  const selected = images[active];
  const selectedFailed = selected ? failed[selected.url] : true;
  const mainImage = selected && !selectedFailed ? selected.url : coverImage(property);

  return (
    <div className="property-gallery">
      <div className="property-gallery__main">
        {mainImage && !selectedFailed ? (
          <img
            src={mainImage}
            alt={property?.title || "Propiedad"}
            onError={() => setFailed((current) => ({ ...current, [mainImage]: true }))}
          />
        ) : (
          <div className="property-gallery__placeholder">
            <ImageOff size={34} aria-hidden="true" />
            <span>Este inmueble aún no tiene fotografías</span>
          </div>
        )}
      </div>

      {images.length > 1 && (
        <div className="property-gallery__thumbs" role="list" aria-label="Galería de imágenes">
          {images.map((image, index) => (
            <button
              key={`${image.url}-${index}`}
              type="button"
              className={`property-gallery__thumb${active === index ? " is-active" : ""}`}
              onClick={() => setActive(index)}
              aria-label={`Ver imagen ${index + 1} de ${images.length}`}
              aria-current={active === index}
            >
              {failed[image.url] ? (
                <House size={18} aria-hidden="true" />
              ) : (
                <img
                  src={image.url}
                  alt=""
                  loading="lazy"
                  onError={() =>
                    setFailed((current) => ({ ...current, [image.url]: true }))
                  }
                />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
