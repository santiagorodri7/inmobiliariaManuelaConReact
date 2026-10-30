import { Search, SlidersHorizontal, X } from "lucide-react";
import {
  bedroomOptions,
  propertyTypes,
} from "../../config/site.js";

const operationTabs = [
  { value: "", label: "Todas" },
  { value: "venta", label: "Venta" },
  { value: "renta", label: "Renta" },
];

export default function PropertyFilters({
  values,
  onChange,
  onSubmit,
  onReset,
  showReset = false,
  compact = false,
}) {
  const update = (field) => (event) =>
    onChange(field, event.target.value);

  return (
    <form
      className={`property-filters${compact ? " property-filters--compact" : ""}`}
      onSubmit={onSubmit}
      role="search"
    >
      <div className="property-filters__tabs" role="group" aria-label="Operación">
        {operationTabs.map((tab) => (
          <button
            key={tab.value || "todas"}
            type="button"
            className={`filter-tab${values.operation === tab.value ? " is-active" : ""}`}
            onClick={() => onChange("operation", tab.value)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="property-filters__fields">
        <label className="filter-field filter-field--search">
          <span className="filter-field__label">Ubicación</span>
          <span className="filter-field__control">
            <Search size={17} aria-hidden="true" />
            <input
              type="search"
              value={values.location || ""}
              onChange={update("location")}
              placeholder="Sector, ciudad o palabra clave"
              aria-label="Buscar por ubicación o palabra clave"
            />
          </span>
        </label>

        <label className="filter-field">
          <span className="filter-field__label">Tipo</span>
          <select
            value={values.type || ""}
            onChange={update("type")}
            aria-label="Tipo de inmueble"
          >
            <option value="">Todos</option>
            {propertyTypes.map((type) => (
              <option key={type.value} value={type.value.toLowerCase()}>
                {type.label}
              </option>
            ))}
          </select>
        </label>

        <label className="filter-field">
          <span className="filter-field__label">Habitaciones</span>
          <select
            value={values.bedrooms || ""}
            onChange={update("bedrooms")}
            aria-label="Habitaciones mínimas"
          >
            {bedroomOptions.map((option) => (
              <option key={option.value || "any"} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="filter-field">
          <span className="filter-field__label">Presupuesto máx.</span>
          <span className="filter-field__control">
            <span className="filter-field__prefix">$</span>
            <input
              type="number"
              min="0"
              step="1000000"
              value={values.maxPrice || ""}
              onChange={update("maxPrice")}
              placeholder="Sin límite"
              aria-label="Presupuesto máximo en pesos"
            />
          </span>
        </label>

        <button type="submit" className="btn btn-primary filter-submit">
          <SlidersHorizontal size={17} aria-hidden="true" />
          Buscar
        </button>

        {showReset && (
          <button
            type="button"
            className="filter-reset"
            onClick={onReset}
            aria-label="Limpiar filtros"
          >
            <X size={15} aria-hidden="true" />
            Limpiar
          </button>
        )}
      </div>
    </form>
  );
}
