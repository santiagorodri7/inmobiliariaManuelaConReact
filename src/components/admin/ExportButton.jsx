import { useState } from "react";
import { Download, LoaderCircle } from "lucide-react";
import { useToast } from "../ui/Toast.jsx";
import { getErrorMessage } from "../../utils/errors.js";

export default function ExportButton({
  onExport,
  label = "Exportar Excel",
  successMessage = "Archivo exportado.",
  variant = "outline",
  size = "",
  disabled = false,
}) {
  const toast = useToast();
  const [busy, setBusy] = useState(false);

  const handleClick = async () => {
    setBusy(true);
    try {
      await onExport();
      toast.success(successMessage);
    } catch (error) {
      toast.error(getErrorMessage(error, "No se pudo exportar el archivo."));
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
      {busy ? "Generando…" : label}
    </button>
  );
}
