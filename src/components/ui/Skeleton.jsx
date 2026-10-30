export function Skeleton({ className = "", style }) {
  return (
    <span
      className={`skeleton ${className}`.trim()}
      style={style}
      aria-hidden="true"
    />
  );
}

export function PropertyCardSkeleton() {
  return (
    <div className="property-card skeleton-card" aria-hidden="true">
      <Skeleton className="skeleton-card__image" />
      <div className="skeleton-card__body">
        <Skeleton className="skeleton-line skeleton-line--short" />
        <Skeleton className="skeleton-line skeleton-line--title" />
        <Skeleton className="skeleton-line" />
        <Skeleton className="skeleton-line skeleton-line--medium" />
      </div>
    </div>
  );
}

export function PropertyGridSkeleton({ count = 3 }) {
  return (
    <div className="property-grid" aria-label="Cargando propiedades">
      {Array.from({ length: count }).map((_, index) => (
        <PropertyCardSkeleton key={index} />
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 5, columns = 5 }) {
  return (
    <div className="table-skeleton" aria-label="Cargando datos">
      {Array.from({ length: rows }).map((_, row) => (
        <div className="table-skeleton__row" key={row}>
          {Array.from({ length: columns }).map((__, column) => (
            <Skeleton key={column} className="skeleton-line" />
          ))}
        </div>
      ))}
    </div>
  );
}
