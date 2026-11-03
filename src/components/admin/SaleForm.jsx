import { useEffect, useMemo, useState } from "react";
import { Handshake, Info, LoaderCircle } from "lucide-react";
import Modal from "../ui/Modal.jsx";
import Field from "../ui/Field.jsx";
import { useToast } from "../ui/Toast.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { useI18n } from "../../i18n/I18nContext.jsx";
import { registerSale } from "../../services/salesService.js";
import { getErrorMessage } from "../../utils/errors.js";
import { hasErrors, validateSale } from "../../utils/validation.js";
import { isAvailable } from "../../utils/property.js";
import { todayInputValue } from "../../utils/dates.js";

const emptyValues = {
  propertyId: "",
  buyerName: "",
  buyerEmail: "",
  buyerPhone: "",
  closingValue: "",
  closingDate: todayInputValue(),
  operation: "venta",
  notes: "",
};

export default function SaleForm({
  open,
  properties = [],
  initialPropertyId = "",
  onClose,
  onSaved,
}) {
  const { profile } = useAuth();
  const { t, formatCOP, operationLabel } = useI18n();
  const toast = useToast();
  const [values, setValues] = useState({ ...emptyValues });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const available = useMemo(
    () => properties.filter(isAvailable),
    [properties],
  );

  const selected = available.find((property) => property.id === values.propertyId);

  useEffect(() => {
    if (!open) return;
    const initial = available.find((property) => property.id === initialPropertyId);
    setValues({
      ...emptyValues,
      propertyId: initial?.id || "",
      operation: initial?.operation || "venta",
      closingValue: initial?.price || "",
      closingDate: todayInputValue(),
    });
    setErrors({});
  }, [open, initialPropertyId, available]);

  const update = (field) => (event) => {
    const value = event.target.value;
    setValues((current) => ({ ...current, [field]: value }));
    if (errors[field]) setErrors((current) => ({ ...current, [field]: "" }));
  };

  const selectProperty = (event) => {
    const propertyId = event.target.value;
    const property = available.find((item) => item.id === propertyId);
    setValues((current) => ({
      ...current,
      propertyId,
      operation: property?.operation || "venta",
      closingValue: property?.price || "",
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validateSale(values);
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) return;

    setSaving(true);
    try {
      const sale = await registerSale({ ...values, admin: profile });
      toast.success(t("admin.saleForm.success"));
      onSaved?.(sale);
      onClose?.();
    } catch (error) {
      toast.error(getErrorMessage(error, "admin.saleForm.errorFallback"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={saving ? undefined : onClose}
      title={t("admin.saleForm.title")}
      eyebrow={t("admin.saleForm.eyebrow")}
      size="lg"
      closeOnBackdrop={!saving}
      footer={
        <>
          <button type="button" className="btn btn-outline-secondary" onClick={onClose} disabled={saving}>
            {t("admin.saleForm.cancel")}
          </button>
          <button type="submit" form="sale-form" className="btn btn-primary" disabled={saving || !available.length}>
            {saving ? (
              <LoaderCircle size={17} className="spin" aria-hidden="true" />
            ) : (
              <Handshake size={17} aria-hidden="true" />
            )}
            {saving
              ? t("admin.saleForm.submitting")
              : t("admin.saleForm.submit")}
          </button>
        </>
      }
    >
      {!available.length ? (
        <div className="inline-empty">
          <Info size={20} aria-hidden="true" />
          <p>{t("admin.saleForm.noProperties")}</p>
        </div>
      ) : (
        <form id="sale-form" className="sale-form" onSubmit={handleSubmit} noValidate>
          <p className="sale-form__intro">{t("admin.saleForm.intro")}</p>

          <Field
            label={t("admin.saleForm.property")}
            htmlFor="sale-property"
            required
            error={errors.propertyId}
          >
            <select
              id="sale-property"
              className="form-select"
              value={values.propertyId}
              onChange={selectProperty}
              aria-invalid={Boolean(errors.propertyId)}
            >
              <option value="">{t("admin.saleForm.selectProperty")}</option>
              {available.map((property) => (
                <option key={property.id} value={property.id}>
                  {property.title} · {property.location} · {formatCOP(property.price)}
                </option>
              ))}
            </select>
          </Field>

          {selected && (
            <div className="sale-property-summary">
              <div>
                <span>{t("admin.saleForm.operation")}</span>
                <strong>{operationLabel(selected.operation)}</strong>
              </div>
              <div>
                <span>{t("admin.saleForm.owner")}</span>
                <strong>
                  {selected.ownerName || t("admin.saleForm.ownerMissing")}
                </strong>
              </div>
              <div>
                <span>{t("admin.saleForm.publishedPrice")}</span>
                <strong>{formatCOP(selected.price)}</strong>
              </div>
            </div>
          )}

          <div className="form-grid form-grid--two">
            <Field
              label={t("admin.saleForm.buyerName")}
              htmlFor="sale-buyer"
              required
              error={errors.buyerName}
            >
              <input
                id="sale-buyer"
                className="form-control"
                value={values.buyerName}
                onChange={update("buyerName")}
                aria-invalid={Boolean(errors.buyerName)}
              />
            </Field>
            <Field
              label={t("admin.saleForm.buyerEmail")}
              htmlFor="sale-email"
              error={errors.buyerEmail}
              hint={t("common.optional")}
            >
              <input
                id="sale-email"
                type="email"
                className="form-control"
                value={values.buyerEmail}
                onChange={update("buyerEmail")}
                aria-invalid={Boolean(errors.buyerEmail)}
              />
            </Field>
            <Field
              label={t("admin.saleForm.buyerPhone")}
              htmlFor="sale-phone"
              hint={t("common.optional")}
            >
              <input
                id="sale-phone"
                type="tel"
                className="form-control"
                value={values.buyerPhone}
                onChange={update("buyerPhone")}
              />
            </Field>
            <Field
              label={t("admin.saleForm.closingValue")}
              htmlFor="sale-value"
              required
              error={errors.closingValue}
            >
              <div className="input-prefix">
                <span>$</span>
                <input
                  id="sale-value"
                  type="number"
                  min="1"
                  step="100000"
                  className="form-control"
                  value={values.closingValue}
                  onChange={update("closingValue")}
                  aria-invalid={Boolean(errors.closingValue)}
                />
              </div>
            </Field>
            <Field
              label={t("admin.saleForm.closingDate")}
              htmlFor="sale-date"
              required
              error={errors.closingDate}
            >
              <input
                id="sale-date"
                type="date"
                max={todayInputValue()}
                className="form-control"
                value={values.closingDate}
                onChange={update("closingDate")}
                aria-invalid={Boolean(errors.closingDate)}
              />
            </Field>
            <Field
              label={t("admin.saleForm.operation")}
              htmlFor="sale-operation"
              hint={t("admin.saleForm.operationHint")}
            >
              <select
                id="sale-operation"
                className="form-select"
                value={values.operation}
                onChange={update("operation")}
              >
                <option value="venta">{t("admin.saleForm.sale")}</option>
                <option value="renta">{t("admin.saleForm.rent")}</option>
              </select>
            </Field>
          </div>

          <Field
            label={t("admin.saleForm.notes")}
            htmlFor="sale-notes"
            hint={t("admin.saleForm.notesHint")}
          >
            <textarea
              id="sale-notes"
              className="form-control"
              rows={3}
              value={values.notes}
              onChange={update("notes")}
              placeholder={t("admin.saleForm.notesPlaceholder")}
            />
          </Field>
        </form>
      )}
    </Modal>
  );
}
