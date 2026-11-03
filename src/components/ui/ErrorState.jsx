import { CircleAlert, RefreshCw } from "lucide-react";
import { useI18n } from "../../i18n/I18nContext.jsx";

export default function ErrorState({
  title,
  description,
  onRetry,
  retryLabel,
  compact = false,
}) {
  const { t } = useI18n();
  const heading = title || t("common.errorTitle");
  const text = description || t("common.errorDescription");
  return (
    <div className={`error-state${compact ? " error-state--compact" : ""}`} role="alert">
      <span className="error-state__icon" aria-hidden="true">
        <CircleAlert size={26} />
      </span>
      <div>
        <h3>{heading}</h3>
        <p>{text}</p>
        {onRetry && (
          <button type="button" className="btn btn-outline-secondary btn-sm" onClick={onRetry}>
            <RefreshCw size={15} aria-hidden="true" />
            {retryLabel || t("common.retry")}
          </button>
        )}
      </div>
    </div>
  );
}
