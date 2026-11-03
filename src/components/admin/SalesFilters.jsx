import { RotateCcw, SlidersHorizontal } from "lucide-react";
import { useI18n } from "../../i18n/I18nContext.jsx";

export default function SalesFilters({ values, onChange, onReset }) {
  const { t } = useI18n();
  const update = (field) => (event) => onChange(field, event.target.value);

  return (
    <form className="sales-filters" onSubmit={(event) => event.preventDefault()}>
      <div className="sales-filters__head">
        <span>
          <SlidersHorizontal size={16} aria-hidden="true" />
          {t("admin.salesFilters.title")}
        </span>
        <button type="button" className="filter-reset" onClick={onReset}>
          <RotateCcw size={14} aria-hidden="true" />
          {t("admin.salesFilters.clear")}
        </button>
      </div>
      <div className="sales-filters__grid">
        <label className="filter-field filter-field--search">
          <span className="filter-field__label">
            {t("admin.salesFilters.search")}
          </span>
          <input
            type="search"
            className="form-control"
            value={values.search || ""}
            onChange={update("search")}
            placeholder={t("admin.salesFilters.searchPlaceholder")}
          />
        </label>
        <label className="filter-field">
          <span className="filter-field__label">{t("admin.salesFilters.from")}</span>
          <input
            type="date"
            className="form-control"
            value={values.from || ""}
            onChange={update("from")}
          />
        </label>
        <label className="filter-field">
          <span className="filter-field__label">{t("admin.salesFilters.to")}</span>
          <input
            type="date"
            className="form-control"
            value={values.to || ""}
            onChange={update("to")}
          />
        </label>
        <label className="filter-field">
          <span className="filter-field__label">
            {t("admin.salesFilters.operation")}
          </span>
          <select className="form-select" value={values.operation || ""} onChange={update("operation")}>
            <option value="">{t("admin.salesFilters.allOperations")}</option>
            <option value="venta">{t("admin.salesFilters.sale")}</option>
            <option value="renta">{t("admin.salesFilters.rent")}</option>
          </select>
        </label>
        <label className="filter-field">
          <span className="filter-field__label">
            {t("admin.salesFilters.status")}
          </span>
          <select className="form-select" value={values.status || ""} onChange={update("status")}>
            <option value="">{t("admin.salesFilters.allStatuses")}</option>
            <option value="cerrada">{t("admin.salesFilters.closed")}</option>
            <option value="anulada">{t("admin.salesFilters.annulled")}</option>
          </select>
        </label>
      </div>
    </form>
  );
}
