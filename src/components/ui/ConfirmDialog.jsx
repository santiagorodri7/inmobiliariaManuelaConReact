import { LoaderCircle } from "lucide-react";
import Modal from "./Modal.jsx";
import { useI18n } from "../../i18n/I18nContext.jsx";

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel,
  tone = "primary",
  busy = false,
  onConfirm,
  onCancel,
}) {
  const { t } = useI18n();
  return (
    <Modal
      open={open}
      onClose={busy ? undefined : onCancel}
      title={title}
      eyebrow={t("common.confirmation")}
      size="sm"
      closeOnBackdrop={!busy}
      footer={
        <>
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={onCancel}
            disabled={busy}
          >
            {cancelLabel || t("common.cancel")}
          </button>
          <button
            type="button"
            className={`btn ${tone === "danger" ? "btn-danger" : "btn-primary"}`}
            onClick={onConfirm}
            disabled={busy}
          >
            {busy && <LoaderCircle className="spin" size={17} aria-hidden="true" />}
            {confirmLabel || t("common.confirm")}
          </button>
        </>
      }
    >
      <p className="mb-0 text-secondary">{description}</p>
    </Modal>
  );
}
