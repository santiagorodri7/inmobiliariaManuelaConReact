import { Link } from "react-router-dom";
import {
  Building2,
  Eye,
  EyeOff,
  LockKeyhole,
  Pencil,
} from "lucide-react";
import { OperationBadge, PropertyStatusPill } from "../ui/StatusBadge.jsx";
import { isAvailable } from "../../utils/property.js";
import EmptyState from "../ui/EmptyState.jsx";
import ErrorState from "../ui/ErrorState.jsx";
import { TableSkeleton } from "../ui/Skeleton.jsx";
import { useI18n } from "../../i18n/I18nContext.jsx";

export default function OwnerPropertiesTable({
  properties = [],
  loading = false,
  error = "",
  onRetry,
  onEdit,
  onToggle,
  onHide,
  busyId = "",
}) {
  const { t, formatCOP, formatDate, propertyTypeLabel } = useI18n();
  if (loading) return <TableSkeleton rows={5} columns={5} />;
  if (error) {
    return (
      <ErrorState
        title={t("property.ownerTable.errorTitle")}
        description={error}
        onRetry={onRetry}
        compact
      />
    );
  }

  if (!properties.length) {
    return (
      <EmptyState
        icon={Building2}
        title={t("property.ownerTable.emptyTitle")}
        description={t("property.ownerTable.emptyDescription")}
        compact
      />
    );
  }

  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>{t("property.ownerTable.property")}</th>
            <th>{t("property.ownerTable.operation")}</th>
            <th>{t("property.ownerTable.price")}</th>
            <th>{t("property.ownerTable.status")}</th>
            <th>{t("property.ownerTable.published")}</th>
            <th className="text-end">{t("property.ownerTable.actions")}</th>
          </tr>
        </thead>
        <tbody>
          {properties.map((property) => {
            const available = isAvailable(property);
            const closed = ["vendida", "rentada"].includes(property.status);
            return (
              <tr key={property.id}>
                <td>
                  <div className="table-property">
                    <div>
                      <strong>{property.title}</strong>
                      <span>{property.location || t("property.ownerTable.noLocation")}</span>
                      <small>{propertyTypeLabel(property.type)}</small>
                    </div>
                  </div>
                </td>
                <td>
                  <OperationBadge operation={property.operation} />
                </td>
                <td className="table-price">{formatCOP(property.price)}</td>
                <td>
                  <PropertyStatusPill status={property.status} />
                </td>
                <td>{formatDate(property.createdAt || property.fechaRegistro)}</td>
                <td>
                  <div className="table-actions">
                    <Link
                      to={`/propiedad/${encodeURIComponent(property.id)}`}
                      className="icon-button"
                      title={t("property.ownerTable.view")}
                      aria-label={t("property.ownerTable.viewAria", { title: property.title })}
                    >
                      <Eye size={17} />
                    </Link>

                    {!closed && (
                      <button
                        type="button"
                        className="icon-button"
                        onClick={() => onEdit(property)}
                        title={t("property.ownerTable.edit")}
                        aria-label={t("property.ownerTable.editAria", { title: property.title })}
                      >
                        <Pencil size={16} />
                      </button>
                    )}

                    {available && (
                      <button
                        type="button"
                        className="icon-button icon-button--danger"
                        onClick={() => onHide(property)}
                        disabled={busyId === property.id}
                        title={t("property.ownerTable.hide")}
                        aria-label={t("property.ownerTable.hideAria", { title: property.title })}
                      >
                        <EyeOff size={17} />
                      </button>
                    )}

                    {property.status === "inactiva" && (
                      <button
                        type="button"
                        className="icon-button icon-button--success"
                        onClick={() => onToggle(property)}
                        disabled={busyId === property.id}
                        title={t("property.ownerTable.publish")}
                        aria-label={t("property.ownerTable.publishAria", { title: property.title })}
                      >
                        <Eye size={17} />
                      </button>
                    )}

                    {closed && (
                      <span className="table-lock" title={t("property.ownerTable.closed")}>
                        <LockKeyhole size={16} aria-hidden="true" />
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
