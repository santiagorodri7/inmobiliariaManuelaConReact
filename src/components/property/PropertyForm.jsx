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
  saving = false,
  uploadProgress = 0,
}) {
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

  const fallbackEnabled =
    String(import.meta.env.VITE_ALLOW_BASE64_FALLBACK || "false").toLowerCase() ===
    "true";

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
      toast.error("Revisa los campos marcados antes de guardar.");
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
            <p className="eyebrow">Lo esencial</p>
            <h3>Cuéntanos qué estás publicando</h3>
          </div>
          <span className="form-section__step">01</span>
        </div>

        <div className="segmented" role="group" aria-label="Operación">
          {[
            { value: "venta", label: "Venta" },
            { value: "renta", label: "Renta" },
          ].map((operation) => (
            <button
              key={operation.value}
              type="button"
              className={`segmented__item${values.operation === operation.value ? " is-active" : ""}`}
              onClick={() => setValues((current) => ({ ...current, operation: operation.value }))}
              aria-pressed={values.operation === operation.value}
            >
              {operation.label}
            </button>
          ))}
        </div>

        <div className="form-grid form-grid--two">
          <Field
            label="Título de la publicación"
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
              placeholder="Ej. Casa con jardín y vista a la ciudad"
              aria-invalid={Boolean(errors.title)}
            />
          </Field>

          <Field label="Tipo de inmueble" htmlFor="property-type" required error={errors.type}>
            <select
              id="property-type"
              className="form-select"
              value={values.type}
              onChange={update("type")}
              aria-invalid={Boolean(errors.type)}
            >
              {typeOptions.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </Field>

          <Field
            label={values.operation === "renta" ? "Canon mensual (COP)" : "Precio de venta (COP)"}
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
                placeholder="Ej. 650000000"
                aria-invalid={Boolean(errors.price)}
              />
            </div>
          </Field>

          <Field
            label="Ubicación"
            htmlFor="property-location"
            required
            hint="Ciudad, barrio o sector. Evita direcciones exactas si prefieres privacidad."
            error={errors.location}
            className="form-field--full"
          >
            <input
              id="property-location"
              className="form-control"
              value={values.location}
              onChange={update("location")}
              placeholder="Ej. Medellín, El Poblado"
              aria-invalid={Boolean(errors.location)}
            />
          </Field>
        </div>
      </section>

      <section className="surface form-section">
        <div className="form-section__head">
          <div>
            <p className="eyebrow">Características</p>
            <h3>Los detalles que hacen la diferencia</h3>
          </div>
          <span className="form-section__step">02</span>
        </div>

        <div className="form-grid form-grid--five">
          <Field label="Habitaciones" htmlFor="property-bedrooms" error={errors.bedrooms}>
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
          <Field label="Baños" htmlFor="property-bathrooms" error={errors.bathrooms}>
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
          <Field label="Parqueaderos" htmlFor="property-parking">
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
          <Field label="Área (m²)" htmlFor="property-area" error={errors.area}>
            <input
              id="property-area"
              type="number"
              min="0"
              className="form-control"
              value={values.area}
              onChange={update("area")}
              placeholder="Ej. 120"
              aria-invalid={Boolean(errors.area)}
            />
          </Field>
          <Field label="Estrato" htmlFor="property-stratum" error={errors.stratum}>
            <select
              id="property-stratum"
              className="form-select"
              value={values.stratum}
              onChange={update("stratum")}
              aria-invalid={Boolean(errors.stratum)}
            >
              <option value="">No aplica</option>
              {[1, 2, 3, 4, 5, 6].map((stratum) => (
                <option key={stratum} value={stratum}>
                  {stratum}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field
          label="Descripción"
          htmlFor="property-description"
          required
          error={errors.description}
          hint={`${values.description.length} caracteres · describe el estado, los espacios y lo que hace especial al inmueble.`}
        >
          <textarea
            id="property-description"
            className="form-control"
            rows={5}
            value={values.description}
            onChange={update("description")}
            placeholder="Ej. Casa remodelada con iluminación natural, cocina integral, patio interior y parqueadero cubierto."
            aria-invalid={Boolean(errors.description)}
          />
        </Field>

        <fieldset className="amenities-field">
          <legend>Amenidades y espacios comunes</legend>
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
                  {amenity}
                </span>
              </label>
            ))}
          </div>
          <div className="amenity-custom">
            <input
              className="form-control"
              value={customAmenity}
              onChange={(event) => setCustomAmenity(event.target.value)}
              placeholder="Agregar otra amenidad"
              aria-label="Agregar otra amenidad"
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  addCustomAmenity();
                }
              }}
            />
            <button type="button" className="btn btn-outline-secondary" onClick={addCustomAmenity}>
              <Plus size={16} aria-hidden="true" />
              Agregar
            </button>
          </div>
        </fieldset>
      </section>

      <section className="surface form-section">
        <div className="form-section__head">
          <div>
            <p className="eyebrow">Fotografías</p>
            <h3>Muéstrala en su mejor luz</h3>
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
              <p className="eyebrow">Visibilidad</p>
              <h3>Estado de la publicación</h3>
            </div>
          </div>
          <Field label="Estado" htmlFor="property-status">
            <select
              id="property-status"
              className="form-select"
              value={values.status}
              onChange={update("status")}
            >
              <option value="disponible">Publicada</option>
              <option value="inactiva">Oculta</option>
            </select>
          </Field>
        </section>
      )}

      {!property && (
        <p className="inline-note">
          <Info size={16} aria-hidden="true" />
          Al guardar, la propiedad aparecerá en el catálogo público. Podrás
          ocultarla o editarla desde tu panel.
        </p>
      )}

      <div className="form-actions">
        <button type="button" className="btn btn-outline-secondary" onClick={onCancel} disabled={saving}>
          <X size={17} aria-hidden="true" />
          Cancelar
        </button>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          <Save size={17} aria-hidden="true" />
          {saving ? "Guardando…" : property ? "Guardar cambios" : "Publicar propiedad"}
        </button>
      </div>
    </form>
  );
}
