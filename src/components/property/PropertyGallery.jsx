import { useState } from "react";
import { House, ImageOff } from "lucide-react";
import { coverImage } from "../../utils/property.js";
import { useI18n } from "../../i18n/I18nContext.jsx";

export default function PropertyGallery({ property }) {
  const { t } = useI18n();
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
            alt={property?.title || t("property.card.imageUnavailable")}
            onError={() => setFailed((current) => ({ ...current, [mainImage]: true }))}
          />
        ) : (
          <div className="property-gallery__placeholder">
            <ImageOff size={34} aria-hidden="true" />
            <span>{t("property.gallery.noPhotos")}</span>
          </div>
        )}
      </div>

      {images.length > 1 && (
        <div className="property-gallery__thumbs" role="list" aria-label={t("property.gallery.aria")}>
          {images.map((image, index) => (
            <button
              key={`${image.url}-${index}`}
              type="button"
              className={`property-gallery__thumb${active === index ? " is-active" : ""}`}
              onClick={() => setActive(index)}
              aria-label={t("property.gallery.viewImage", {
                index: index + 1,
                total: images.length,
              })}
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
