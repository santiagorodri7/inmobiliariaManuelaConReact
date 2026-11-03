import { Search, SlidersHorizontal, X } from "lucide-react";
import {
  bedroomOptions,
  propertyTypes,
} from "../../config/site.js";
import { useI18n } from "../../i18n/I18nContext.jsx";

export default function PropertyFilters({
  values,
  onChange,
  onSubmit,
  onReset,
  showReset = false,
  compact = false,
}) {
  const { t, operationLabel, propertyTypeLabel } = useI18n();
  const operationTabs = [
    { value: "", label: t("property.filters.all") },
    { value: "venta", label: operationLabel("venta") },
    { value: "renta", label: operationLabel("renta") },
  ];
  const update = (field) => (event) =>
    onChange(field, event.target.value);

  return (
    <form
      className={`property-filters${compact ? " property-filters--compact" : ""}`}
      onSubmit={onSubmit}
      role="search"
    >
      <div className="property-filters__tabs" role="group" aria-label={t("property.filters.operation")}>
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
          <span className="filter-field__label">{t("property.filters.location")}</span>
          <span className="filter-field__control">
            <Search size={17} aria-hidden="true" />
            <input
              type="search"
              value={values.location || ""}
              onChange={update("location")}
              placeholder={t("property.filters.locationPlaceholder")}
              aria-label={t("property.filters.locationAria")}
            />
          </span>
        </label>

        <label className="filter-field">
          <span className="filter-field__label">{t("property.filters.type")}</span>
          <select
            value={values.type || ""}
            onChange={update("type")}
            aria-label={t("property.filters.typeAria")}
          >
            <option value="">{t("property.filters.typeAll")}</option>
            {propertyTypes.map((type) => (
              <option key={type.value} value={type.value.toLowerCase()}>
                {propertyTypeLabel(type.value)}
              </option>
            ))}
          </select>
        </label>

        <label className="filter-field">
          <span className="filter-field__label">{t("property.filters.bedrooms")}</span>
          <select
            value={values.bedrooms || ""}
            onChange={update("bedrooms")}
            aria-label={t("property.filters.bedroomsAria")}
          >
            {bedroomOptions.map((option) => (
              <option key={option.value || "any"} value={option.value}>
                {option.value
                  ? t("property.filters.bedroomsPlus", { count: option.value })
                  : t("property.filters.anyBedrooms")}
              </option>
            ))}
          </select>
        </label>

        <label className="filter-field">
          <span className="filter-field__label">{t("property.filters.budget")}</span>
          <span className="filter-field__control">
            <span className="filter-field__prefix">$</span>
            <input
              type="number"
              min="0"
              step="1000000"
              value={values.maxPrice || ""}
              onChange={update("maxPrice")}
              placeholder={t("property.filters.budgetPlaceholder")}
              aria-label={t("property.filters.budgetAria")}
            />
          </span>
        </label>

        <button type="submit" className="btn btn-primary filter-submit">
          <SlidersHorizontal size={17} aria-hidden="true" />
          {t("property.filters.submit")}
        </button>

        {showReset && (
          <button
            type="button"
            className="filter-reset"
            onClick={onReset}
            aria-label={t("property.filters.clearAria")}
          >
            <X size={15} aria-hidden="true" />
            {t("common.clear")}
          </button>
        )}
      </div>
    </form>
  );
}
