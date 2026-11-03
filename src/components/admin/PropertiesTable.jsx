import { Building2, Eye, EyeOff, Handshake } from "lucide-react";
import { Link } from "react-router-dom";
import { OperationBadge, PropertyStatusPill } from "../ui/StatusBadge.jsx";
import { useI18n } from "../../i18n/I18nContext.jsx";
import EmptyState from "../ui/EmptyState.jsx";
import ErrorState from "../ui/ErrorState.jsx";
import { TableSkeleton } from "../ui/Skeleton.jsx";
import { isAvailable } from "../../utils/property.js";

export default function PropertiesTable({
  properties = [],
  loading = false,
  error = "",
  onRetry,
  onRegisterSale,
  onToggleStatus,
  busyId = "",
}) {
  const { t, formatCOP, formatDate, propertyTypeLabel } = useI18n();

  if (loading) return <TableSkeleton rows={6} columns={6} />;
  if (error)
    return (
      <ErrorState
        title={t("admin.propertiesTable.errorTitle")}
        description={error}
        onRetry={onRetry}
        compact
      />
    );

  if (!properties.length) {
    return (
      <EmptyState
        icon={Building2}
        title={t("admin.propertiesTable.emptyTitle")}
        description={t("admin.propertiesTable.emptyDescription")}
        compact
      />
    );
  }

  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>{t("admin.propertiesTable.property")}</th>
            <th>{t("admin.propertiesTable.operation")}</th>
            <th>{t("admin.propertiesTable.price")}</th>
            <th>{t("admin.propertiesTable.status")}</th>
            <th>{t("admin.propertiesTable.registered")}</th>
            <th className="text-end">{t("admin.propertiesTable.actions")}</th>
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
                      <span>
                        {property.location || t("admin.propertiesTable.noLocation")}
                      </span>
                      <small>{propertyTypeLabel(property.type)}</small>
                    </div>
                  </div>
                </td>
                <td><OperationBadge operation={property.operation} /></td>
                <td className="table-price">{formatCOP(property.price)}</td>
                <td><PropertyStatusPill status={property.status} /></td>
                <td>{formatDate(property.createdAt || property.fechaRegistro)}</td>
                <td>
                  <div className="table-actions">
                    <Link
                      to={`/propiedad/${encodeURIComponent(property.id)}`}
                      className="icon-button"
                      title={t("admin.propertiesTable.view")}
                      aria-label={t("admin.propertiesTable.viewAria", {
                        title: property.title,
                      })}
                    >
                      <Eye size={17} />
                    </Link>
                    {available && (
                      <button
                        type="button"
                        className="btn btn-primary btn-xs"
                        onClick={() => onRegisterSale(property)}
                      >
                        <Handshake size={15} aria-hidden="true" />
                        {t("admin.propertiesTable.registerSale")}
                      </button>
                    )}
                    {!closed && (
                      <button
                        type="button"
                        className="icon-button"
                        onClick={() => onToggleStatus(property)}
                        disabled={busyId === property.id}
                        title={
                          available
                            ? t("admin.propertiesTable.hide")
                            : t("admin.propertiesTable.publish")
                        }
                        aria-label={
                          available
                            ? t("admin.propertiesTable.hideAria", {
                                title: property.title,
                              })
                            : t("admin.propertiesTable.publishAria", {
                                title: property.title,
                              })
                        }
                      >
                        {available ? <EyeOff size={17} /> : <Eye size={17} />}
                      </button>
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
