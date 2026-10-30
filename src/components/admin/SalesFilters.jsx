import { RotateCcw, SlidersHorizontal } from "lucide-react";

export default function SalesFilters({ values, onChange, onReset }) {
  const update = (field) => (event) => onChange(field, event.target.value);

  return (
    <form className="sales-filters" onSubmit={(event) => event.preventDefault()}>
      <div className="sales-filters__head">
        <span>
          <SlidersHorizontal size={16} aria-hidden="true" />
          Filtrar cierres
        </span>
        <button type="button" className="filter-reset" onClick={onReset}>
          <RotateCcw size={14} aria-hidden="true" />
          Limpiar
        </button>
      </div>
      <div className="sales-filters__grid">
        <label className="filter-field filter-field--search">
          <span className="filter-field__label">Buscar</span>
          <input
            type="search"
            className="form-control"
            value={values.search || ""}
            onChange={update("search")}
            placeholder="Propiedad, comprador o vendedor"
          />
        </label>
        <label className="filter-field">
          <span className="filter-field__label">Desde</span>
          <input
            type="date"
            className="form-control"
            value={values.from || ""}
            onChange={update("from")}
          />
        </label>
        <label className="filter-field">
          <span className="filter-field__label">Hasta</span>
          <input
            type="date"
            className="form-control"
            value={values.to || ""}
            onChange={update("to")}
          />
        </label>
        <label className="filter-field">
          <span className="filter-field__label">Operación</span>
          <select className="form-select" value={values.operation || ""} onChange={update("operation")}>
            <option value="">Todas</option>
            <option value="venta">Venta</option>
            <option value="renta">Renta</option>
          </select>
        </label>
        <label className="filter-field">
          <span className="filter-field__label">Estado</span>
          <select className="form-select" value={values.status || ""} onChange={update("status")}>
            <option value="">Todos</option>
            <option value="cerrada">Cerrada</option>
            <option value="anulada">Anulada</option>
          </select>
        </label>
      </div>
    </form>
  );
}
