import { operationLabel, statusLabel } from "../../utils/property.js";
import { roleLabel } from "../../utils/roles.js";

export function OperationBadge({ operation, light = false }) {
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
  const tone = {
    disponible: "success",
    vendida: "sold",
    rentada: "rented",
    inactiva: "muted",
  }[status] || "muted";
  return <span className={`status-pill status-pill--${tone}`}>{statusLabel(status)}</span>;
}

export function UserStatusPill({ active }) {
  return (
    <span
      className={`status-pill ${active ? "status-pill--success" : "status-pill--muted"}`}
    >
      {active ? "Activo" : "Inactivo"}
    </span>
  );
}

export function RolePill({ role }) {
  const normalized = roleLabel(role);
  const tone = normalized === "Admin" ? "admin" : normalized === "Vendedor" ? "seller" : "buyer";
  return <span className={`role-pill role-pill--${tone}`}>{normalized}</span>;
}

export function SaleStatusPill({ status }) {
  return (
    <span
      className={`status-pill ${
        status === "anulada" ? "status-pill--danger" : "status-pill--success"
      }`}
    >
      {status === "anulada" ? "Anulada" : "Cerrada"}
    </span>
  );
}
