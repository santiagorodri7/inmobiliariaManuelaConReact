import { useEffect, useMemo, useState } from "react";
import { Handshake, Info, LoaderCircle } from "lucide-react";
import Modal from "../ui/Modal.jsx";
import Field from "../ui/Field.jsx";
import { useToast } from "../ui/Toast.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { registerSale } from "../../services/salesService.js";
import { getErrorMessage } from "../../utils/errors.js";
import { hasErrors, validateSale } from "../../utils/validation.js";
import { formatCOP } from "../../utils/format.js";
import { isAvailable, operationLabel } from "../../utils/property.js";
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
      toast.success(
        "Cierre registrado. La propiedad cambió de estado automáticamente.",
      );
      onSaved?.(sale);
      onClose?.();
    } catch (error) {
      toast.error(getErrorMessage(error, "No se pudo registrar el cierre."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={saving ? undefined : onClose}
      title="Registrar cierre"
      eyebrow="Operación cerrada"
      size="lg"
      closeOnBackdrop={!saving}
      footer={
        <>
          <button type="button" className="btn btn-outline-secondary" onClick={onClose} disabled={saving}>
            Cancelar
          </button>
          <button type="submit" form="sale-form" className="btn btn-primary" disabled={saving || !available.length}>
            {saving ? (
              <LoaderCircle size={17} className="spin" aria-hidden="true" />
            ) : (
              <Handshake size={17} aria-hidden="true" />
            )}
            {saving ? "Registrando…" : "Registrar cierre"}
          </button>
        </>
      }
    >
      {!available.length ? (
        <div className="inline-empty">
          <Info size={20} aria-hidden="true" />
          <p>
            No hay propiedades publicadas disponibles. Publica una propiedad
            antes de registrar un cierre.
          </p>
        </div>
      ) : (
        <form id="sale-form" className="sale-form" onSubmit={handleSubmit} noValidate>
          <p className="sale-form__intro">
            El cierre se guarda en <strong>ventas</strong> y actualiza la
            propiedad en una sola transacción. No se generan datos de prueba.
          </p>

          <Field label="Propiedad" htmlFor="sale-property" required error={errors.propertyId}>
            <select
              id="sale-property"
              className="form-select"
              value={values.propertyId}
              onChange={selectProperty}
              aria-invalid={Boolean(errors.propertyId)}
            >
              <option value="">Selecciona una propiedad publicada</option>
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
                <span>Operación</span>
                <strong>{operationLabel(selected.operation)}</strong>
              </div>
              <div>
                <span>Propietario</span>
                <strong>{selected.ownerName || "Sin nombre"}</strong>
              </div>
              <div>
                <span>Precio publicado</span>
                <strong>{formatCOP(selected.price)}</strong>
              </div>
            </div>
          )}

          <div className="form-grid form-grid--two">
            <Field label="Nombre del comprador o arrendatario" htmlFor="sale-buyer" required error={errors.buyerName}>
              <input
                id="sale-buyer"
                className="form-control"
                value={values.buyerName}
                onChange={update("buyerName")}
                aria-invalid={Boolean(errors.buyerName)}
              />
            </Field>
            <Field label="Correo del comprador" htmlFor="sale-email" error={errors.buyerEmail} hint="Opcional">
              <input
                id="sale-email"
                type="email"
                className="form-control"
                value={values.buyerEmail}
                onChange={update("buyerEmail")}
                aria-invalid={Boolean(errors.buyerEmail)}
              />
            </Field>
            <Field label="Teléfono del comprador" htmlFor="sale-phone" hint="Opcional">
              <input
                id="sale-phone"
                type="tel"
                className="form-control"
                value={values.buyerPhone}
                onChange={update("buyerPhone")}
              />
            </Field>
            <Field label="Valor del cierre (COP)" htmlFor="sale-value" required error={errors.closingValue}>
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
            <Field label="Fecha del cierre" htmlFor="sale-date" required error={errors.closingDate}>
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
            <Field label="Operación" htmlFor="sale-operation" hint="Se toma de la propiedad; puedes ajustarla si el cierre lo requiere.">
              <select
                id="sale-operation"
                className="form-select"
                value={values.operation}
                onChange={update("operation")}
              >
                <option value="venta">Venta</option>
                <option value="renta">Renta</option>
              </select>
            </Field>
          </div>

          <Field label="Notas internas" htmlFor="sale-notes" hint="Opcional. No se muestran en el sitio público.">
            <textarea
              id="sale-notes"
              className="form-control"
              rows={3}
              value={values.notes}
              onChange={update("notes")}
              placeholder="Ej. Cierre coordinado con el abogado, pagado por transferencia."
            />
          </Field>
        </form>
      )}
    </Modal>
  );
}
