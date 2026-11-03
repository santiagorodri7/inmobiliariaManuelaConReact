import { useEffect, useMemo, useState } from "react";
import { Check, Info, Plus, Save, X } from "lucide-react";
import Field from "../ui/Field.jsx";
import ImageUploader from "./ImageUploader.jsx";
import { useToast } from "../ui/Toast.jsx";
import {
  amenitiesCatalog,
  propertyTypes,
} from "../../config/site.js";
import { hasErrors, validateProperty } from "../../utils/validation.js";
import { normalizeRole } from "../../utils/roles.js";
import { allowBase64Fallback } from "../../services/firebase.js";
import { useI18n } from "../../i18n/I18nContext.jsx";

const emptyValues = {
  title: "",
  location: "",
  price: "",
  type: "Casa",
  operation: "venta",
  status: "disponible",
  description: "",
  bedrooms: "",
  bathrooms: "",
  parking: "",
  area: "",
  stratum: "",
  amenities: [],
};

const mapType = (type) => {
  if (type === "Departamento") return "Apartamento";
  if (type === "Oficina Comercial") return "Oficina";
  return type || "Casa";
};

const valuesFromProperty = (property) => {
  if (!property) return { ...emptyValues };
  return {
    title: property.title || "",
    location: property.location || "",
    price: property.price || "",
    type: mapType(property.type),
    operation: property.operation || "venta",
    status: property.status === "inactiva" ? "inactiva" : "disponible",
    description: property.description || "",
    bedrooms: property.bedrooms || "",
    bathrooms: property.bathrooms || "",
    parking: property.parking || "",
    area: property.area || "",
    stratum: property.stratum || "",
    amenities: property.amenities || [],
  };
};

export default function PropertyForm({
  property = null,
  profile,
  onSave,
  onCancel,
  onCancelUpload,
  saving = false,
  uploadProgress = 0,
}) {
  const { t, operationLabel, propertyTypeLabel, amenityLabel, statusLabel } = useI18n();
  const toast = useToast();
  const [values, setValues] = useState(() => valuesFromProperty(property));
  const [errors, setErrors] = useState({});
  const [newFiles, setNewFiles] = useState([]);
  const [existingImages, setExistingImages] = useState(property?.images || []);
  const [imagesChanged, setImagesChanged] = useState(false);
  const [customAmenity, setCustomAmenity] = useState("");

  useEffect(() => {
    setValues(valuesFromProperty(property));
    setErrors({});
    setNewFiles([]);
    setExistingImages(property?.images || []);
    setImagesChanged(false);
    setCustomAmenity("");
  }, [property]);

  const fallbackEnabled = allowBase64Fallback;

  const typeOptions = useMemo(() => {
    const options = [...propertyTypes];
    if (values.type && !options.some((option) => option.value === values.type)) {
      options.push({ value: values.type, label: values.type });
    }
    return options;
  }, [values.type]);

  const customAmenities = values.amenities.filter(
    (amenity) => !amenitiesCatalog.includes(amenity),
  );
  const allAmenities = [...amenitiesCatalog, ...customAmenities];

  const update = (field) => (event) => {
    const value = event.target.value;
    setValues((current) => ({ ...current, [field]: value }));
    if (errors[field]) {
      setErrors((current) => ({ ...current, [field]: "" }));
    }
  };

  const toggleAmenity = (amenity) => {
    setValues((current) => {
      const exists = current.amenities.includes(amenity);
      return {
        ...current,
        amenities: exists
          ? current.amenities.filter((item) => item !== amenity)
          : [...current.amenities, amenity],
      };
    });
  };

  const addCustomAmenity = () => {
    const amenity = customAmenity.trim();
    if (!amenity) return;
    if (!values.amenities.includes(amenity)) {
      setValues((current) => ({
        ...current,
        amenities: [...current.amenities, amenity],
      }));
    }
    setCustomAmenity("");
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const nextErrors = validateProperty(values);
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) {
      toast.error(t("property.form.validationToast"));
      window.requestAnimationFrame(() => {
        document
          .querySelector('.property-form [aria-invalid="true"]')
          ?.focus?.();
      });
      return;
    }
    onSave({
      values,
      newFiles,
      keptImages: existingImages,
      imagesChanged,
    });
  };

  const role = normalizeRole(profile?.rol);
  const isAdmin = role === "Admin";

  return (
    <form className="property-form" onSubmit={handleSubmit} noValidate>
      <section className="surface form-section">
        <div className="form-section__head">
          <div>
            <p className="eyebrow">{t("property.form.eyebrow")}</p>
            <h3>{t("property.form.title")}</h3>
          </div>
          <span className="form-section__step">01</span>
        </div>

        <div className="segmented" role="group" aria-label={t("property.form.operationAria")}>
          {["venta", "renta"].map((operation) => (
            <button
              key={operation}
              type="button"
              className={`segmented__item${values.operation === operation ? " is-active" : ""}`}
              onClick={() => setValues((current) => ({ ...current, operation }))}
              aria-pressed={values.operation === operation}
            >
              {operationLabel(operation)}
            </button>
          ))}
        </div>

        <div className="form-grid form-grid--two">
          <Field
            label={t("property.form.titleLabel")}
            htmlFor="property-title"
            required
            error={errors.title}
            className="form-field--full"
          >
            <input
              id="property-title"
              className="form-control"
              value={values.title}
              onChange={update("title")}
              placeholder={t("property.form.titlePlaceholder")}
              aria-invalid={Boolean(errors.title)}
            />
          </Field>

          <Field label={t("property.form.type")} htmlFor="property-type" required error={errors.type}>
            <select
              id="property-type"
              className="form-select"
              value={values.type}
              onChange={update("type")}
              aria-invalid={Boolean(errors.type)}
            >
              {typeOptions.map((type) => (
                <option key={type.value} value={type.value}>
                  {propertyTypeLabel(type.value)}
                </option>
              ))}
            </select>
          </Field>

          <Field
            label={values.operation === "renta" ? t("property.form.priceRent") : t("property.form.priceSale")}
            htmlFor="property-price"
            required
            error={errors.price}
          >
            <div className="input-prefix">
              <span>$</span>
              <input
                id="property-price"
                type="number"
                min="0"
                step="100000"
                className="form-control"
                value={values.price}
                onChange={update("price")}
                placeholder={t("property.form.pricePlaceholder")}
                aria-invalid={Boolean(errors.price)}
              />
            </div>
          </Field>

          <Field
            label={t("property.form.location")}
            htmlFor="property-location"
            required
            hint={t("property.form.locationHint")}
            error={errors.location}
            className="form-field--full"
          >
            <input
              id="property-location"
              className="form-control"
              value={values.location}
              onChange={update("location")}
              placeholder={t("property.form.locationPlaceholder")}
              aria-invalid={Boolean(errors.location)}
            />
          </Field>
        </div>
      </section>

      <section className="surface form-section">
        <div className="form-section__head">
          <div>
            <p className="eyebrow">{t("property.form.featuresEyebrow")}</p>
            <h3>{t("property.form.featuresTitle")}</h3>
          </div>
          <span className="form-section__step">02</span>
        </div>

        <div className="form-grid form-grid--five">
          <Field label={t("property.form.bedrooms")} htmlFor="property-bedrooms" error={errors.bedrooms}>
            <input
              id="property-bedrooms"
              type="number"
              min="0"
              max="30"
              className="form-control"
              value={values.bedrooms}
              onChange={update("bedrooms")}
              placeholder="0"
              aria-invalid={Boolean(errors.bedrooms)}
            />
          </Field>
          <Field label={t("property.form.bathrooms")} htmlFor="property-bathrooms" error={errors.bathrooms}>
            <input
              id="property-bathrooms"
              type="number"
              min="0"
              max="30"
              className="form-control"
              value={values.bathrooms}
              onChange={update("bathrooms")}
              placeholder="0"
              aria-invalid={Boolean(errors.bathrooms)}
            />
          </Field>
          <Field label={t("property.form.parking")} htmlFor="property-parking">
            <input
              id="property-parking"
              type="number"
              min="0"
              max="30"
              className="form-control"
              value={values.parking}
              onChange={update("parking")}
              placeholder="0"
            />
          </Field>
          <Field label={t("property.form.area")} htmlFor="property-area" error={errors.area}>
            <input
              id="property-area"
              type="number"
              min="0"
              className="form-control"
              value={values.area}
              onChange={update("area")}
              placeholder={t("property.form.areaPlaceholder")}
              aria-invalid={Boolean(errors.area)}
            />
          </Field>
          <Field label={t("property.form.stratum")} htmlFor="property-stratum" error={errors.stratum}>
            <select
              id="property-stratum"
              className="form-select"
              value={values.stratum}
              onChange={update("stratum")}
              aria-invalid={Boolean(errors.stratum)}
            >
              <option value="">{t("property.form.stratumNone")}</option>
              {[1, 2, 3, 4, 5, 6].map((stratum) => (
                <option key={stratum} value={stratum}>
                  {stratum}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field
          label={t("property.form.description")}
          htmlFor="property-description"
          required
          error={errors.description}
          hint={t("property.form.descriptionHint", { count: values.description.length })}
        >
          <textarea
            id="property-description"
            className="form-control"
            rows={5}
            value={values.description}
            onChange={update("description")}
            placeholder={t("property.form.descriptionPlaceholder")}
            aria-invalid={Boolean(errors.description)}
          />
        </Field>

        <fieldset className="amenities-field">
          <legend>{t("property.form.amenities")}</legend>
          <div className="amenities-grid">
            {allAmenities.map((amenity) => (
              <label key={amenity} className="check-chip">
                <input
                  type="checkbox"
                  checked={values.amenities.includes(amenity)}
                  onChange={() => toggleAmenity(amenity)}
                />
                <span>
                  <Check size={13} aria-hidden="true" />
                  {amenityLabel(amenity)}
                </span>
              </label>
            ))}
          </div>
          <div className="amenity-custom">
            <input
              className="form-control"
              value={customAmenity}
              onChange={(event) => setCustomAmenity(event.target.value)}
              placeholder={t("property.form.amenityPlaceholder")}
              aria-label={t("property.form.amenityAria")}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  addCustomAmenity();
                }
              }}
            />
            <button type="button" className="btn btn-outline-secondary" onClick={addCustomAmenity}>
              <Plus size={16} aria-hidden="true" />
              {t("property.form.add")}
            </button>
          </div>
        </fieldset>
      </section>

      <section className="surface form-section">
        <div className="form-section__head">
          <div>
            <p className="eyebrow">{t("property.form.photosEyebrow")}</p>
            <h3>{t("property.form.photosTitle")}</h3>
          </div>
          <span className="form-section__step">03</span>
        </div>
        <ImageUploader
          newFiles={newFiles}
          existingImages={existingImages}
          onFilesChange={setNewFiles}
          onRemoveExisting={(_, index) => {
            setExistingImages((current) => current.filter((__, item) => item !== index));
            setImagesChanged(true);
          }}
          disabled={saving}
          progress={uploadProgress}
          fallbackEnabled={fallbackEnabled}
        />
      </section>

      {isAdmin && property && (
        <section className="surface form-section">
          <div className="form-section__head">
            <div>
              <p className="eyebrow">{t("property.form.visibilityEyebrow")}</p>
              <h3>{t("property.form.visibilityTitle")}</h3>
            </div>
          </div>
          <Field label={t("property.form.status")} htmlFor="property-status">
            <select
              id="property-status"
              className="form-select"
              value={values.status}
              onChange={update("status")}
            >
              <option value="disponible">{statusLabel("disponible")}</option>
              <option value="inactiva">{statusLabel("inactiva")}</option>
            </select>
          </Field>
        </section>
      )}

      {!property && (
        <p className="inline-note">
          <Info size={16} aria-hidden="true" />
          {t("property.form.publishNote")}
        </p>
      )}

      <div className="form-actions">
        {saving && newFiles.length > 0 && uploadProgress < 100 && onCancelUpload && (
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={onCancelUpload}
          >
            <X size={17} aria-hidden="true" />
            {t("property.form.cancelUpload")}
          </button>
        )}
        <button type="button" className="btn btn-outline-secondary" onClick={onCancel} disabled={saving}>
          <X size={17} aria-hidden="true" />
          {t("common.cancel")}
        </button>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          <Save size={17} aria-hidden="true" />
          {saving
            ? t("property.form.publishing")
            : property
              ? t("property.form.submitEdit")
              : t("property.form.submitNew")}
        </button>
      </div>
    </form>
  );
}
