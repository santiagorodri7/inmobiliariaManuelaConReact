import { CircleAlert, RefreshCw } from "lucide-react";

export default function ErrorState({
  title = "No pudimos cargar esta información",
  description = "Revisa tu conexión e inténtalo de nuevo.",
  onRetry,
  retryLabel = "Reintentar",
  compact = false,
}) {
  return (
    <div className={`error-state${compact ? " error-state--compact" : ""}`} role="alert">
      <span className="error-state__icon" aria-hidden="true">
        <CircleAlert size={26} />
      </span>
      <div>
        <h3>{title}</h3>
        <p>{description}</p>
        {onRetry && (
          <button type="button" className="btn btn-outline-secondary btn-sm" onClick={onRetry}>
            <RefreshCw size={15} aria-hidden="true" />
            {retryLabel}
          </button>
        )}
      </div>
    </div>
  );
}
