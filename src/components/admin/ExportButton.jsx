import { useState } from "react";
import { Download, LoaderCircle } from "lucide-react";
import { useToast } from "../ui/Toast.jsx";
import { useI18n } from "../../i18n/I18nContext.jsx";
import { getErrorMessage } from "../../utils/errors.js";

export default function ExportButton({
  onExport,
  label,
  successMessage,
  variant = "outline",
  size = "",
  disabled = false,
}) {
  const { t } = useI18n();
  const toast = useToast();
  const [busy, setBusy] = useState(false);

  const handleClick = async () => {
    setBusy(true);
    try {
      await onExport();
      toast.success(successMessage || t("admin.export.success"));
    } catch (error) {
      toast.error(getErrorMessage(error, "admin.export.error"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      className={`btn btn-${variant}${size ? ` btn-${size}` : ""}`}
      onClick={handleClick}
      disabled={busy || disabled}
    >
      {busy ? (
        <LoaderCircle size={16} className="spin" aria-hidden="true" />
      ) : (
        <Download size={16} aria-hidden="true" />
      )}
      {busy ? t("admin.export.busy") : label || t("admin.export.defaultLabel")}
    </button>
  );
}
