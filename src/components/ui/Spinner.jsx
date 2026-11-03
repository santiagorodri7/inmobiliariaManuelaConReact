import { LoaderCircle } from "lucide-react";
import Logo from "./Logo.jsx";
import { useI18n } from "../../i18n/I18nContext.jsx";

export function Spinner({ size = 20, label }) {
  const { t } = useI18n();
  const text = label || t("common.loading");
  return (
    <span className="spinner" role="status" aria-label={text}>
      <LoaderCircle size={size} className="spin" aria-hidden="true" />
    </span>
  );
}

export function PageLoader({ message }) {
  const { t } = useI18n();
  return (
    <div className="page-loader" role="status" aria-live="polite">
      <Logo compact />
      <LoaderCircle size={28} className="spin" aria-hidden="true" />
      <p>{message || t("common.loadingSpace")}</p>
    </div>
  );
}
