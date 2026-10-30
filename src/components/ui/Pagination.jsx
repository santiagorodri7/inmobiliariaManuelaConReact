import { ChevronLeft, ChevronRight } from "lucide-react";

export const paginate = (items = [], page = 1, pageSize = 8) => {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;
  return {
    items: items.slice(start, start + pageSize),
    page: safePage,
    totalPages,
    totalItems: items.length,
  };
};

export default function Pagination({
  page,
  totalPages,
  totalItems,
  pageSize = 8,
  onChange,
}) {
  if (totalItems <= pageSize) return null;
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalItems);

  return (
    <nav className="pagination-bar" aria-label="Paginación">
      <span className="pagination-bar__summary">
        {from}–{to} de {totalItems}
      </span>
      <div className="pagination-bar__controls">
        <button
          type="button"
          className="icon-button"
          onClick={() => onChange(page - 1)}
          disabled={page <= 1}
          aria-label="Página anterior"
        >
          <ChevronLeft size={18} aria-hidden="true" />
        </button>
        <span className="pagination-bar__page">
          Página {page} de {totalPages}
        </span>
        <button
          type="button"
          className="icon-button"
          onClick={() => onChange(page + 1)}
          disabled={page >= totalPages}
          aria-label="Página siguiente"
        >
          <ChevronRight size={18} aria-hidden="true" />
        </button>
      </div>
    </nav>
  );
}
