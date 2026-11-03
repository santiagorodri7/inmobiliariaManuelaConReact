import { useI18n } from "../../i18n/I18nContext.jsx";
import { normalizeRole, ROLES } from "../../utils/roles.js";

export function OperationBadge({ operation, light = false }) {
  const { operationLabel } = useI18n();
  const isRent = operation === "renta";
  return (
    <span
      className={`op-badge ${isRent ? "op-badge--rent" : "op-badge--sale"}${
        light ? " op-badge--light" : ""
      }`}
    >
      {operationLabel(operation)}
    </span>
  );
}

export function PropertyStatusPill({ status }) {
  const { statusLabel } = useI18n();
  const tone = {
    disponible: "success",
    vendida: "sold",
    rentada: "rented",
    inactiva: "muted",
  }[status] || "muted";
  return <span className={`status-pill status-pill--${tone}`}>{statusLabel(status)}</span>;
}

export function UserStatusPill({ active }) {
  const { userStatusLabel } = useI18n();
  return (
    <span
      className={`status-pill ${active ? "status-pill--success" : "status-pill--muted"}`}
    >
      {userStatusLabel(active)}
    </span>
  );
}

export function RolePill({ role }) {
  const { roleLabel } = useI18n();
  const normalized = normalizeRole(role);
  const tone =
    normalized === ROLES.ADMIN
      ? "admin"
      : normalized === ROLES.SELLER
        ? "seller"
        : "buyer";
  return <span className={`role-pill role-pill--${tone}`}>{roleLabel(role)}</span>;
}

export function SaleStatusPill({ status }) {
  const { saleStatusLabel } = useI18n();
  return (
    <span
      className={`status-pill ${
        status === "anulada" ? "status-pill--danger" : "status-pill--success"
      }`}
    >
      {saleStatusLabel(status)}
    </span>
  );
}
