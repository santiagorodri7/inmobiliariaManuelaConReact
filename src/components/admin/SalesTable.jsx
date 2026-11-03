import { Banknote, Ban } from "lucide-react";
import { OperationBadge, SaleStatusPill } from "../ui/StatusBadge.jsx";
import { useI18n } from "../../i18n/I18nContext.jsx";
import EmptyState from "../ui/EmptyState.jsx";
import ErrorState from "../ui/ErrorState.jsx";
import { TableSkeleton } from "../ui/Skeleton.jsx";

export default function SalesTable({
  sales = [],
  loading = false,
  error = "",
  onRetry,
  onAnnul,
  busyId = "",
  compact = false,
  emptyState = null,
}) {
  const { t, formatCOP, formatDate } = useI18n();

  if (loading) return <TableSkeleton rows={5} columns={6} />;
  if (error)
    return (
      <ErrorState
        title={t("admin.salesTable.errorTitle")}
        description={error}
        onRetry={onRetry}
        compact
      />
    );

  if (!sales.length) {
    if (emptyState) return emptyState;
    return (
      <EmptyState
        icon={Banknote}
        title={t("admin.salesTable.emptyTitle")}
        description={t("admin.salesTable.emptyDescription")}
        compact
      />
    );
  }

  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>{t("admin.salesTable.property")}</th>
            <th>{t("admin.salesTable.operation")}</th>
            {!compact && <th>{t("admin.salesTable.buyer")}</th>}
            <th>{t("admin.salesTable.value")}</th>
            <th>{t("admin.salesTable.date")}</th>
            <th>{t("admin.salesTable.status")}</th>
            {!compact && (
              <th className="text-end">{t("admin.salesTable.actions")}</th>
            )}
          </tr>
        </thead>
        <tbody>
          {sales.map((sale) => (
            <tr key={sale.id}>
              <td>
                <div className="table-property">
                  <div>
                    <strong>{sale.propertyTitle || "—"}</strong>
                    <span>
                      {sale.sellerName || t("admin.salesTable.sellerMissing")}
                    </span>
                  </div>
                </div>
              </td>
              <td><OperationBadge operation={sale.operation} /></td>
              {!compact && <td>{sale.buyerName || "—"}</td>}
              <td className="table-price">{formatCOP(sale.closingValue)}</td>
              <td>{formatDate(sale.closingDate)}</td>
              <td><SaleStatusPill status={sale.status} /></td>
              {!compact && (
                <td>
                  <div className="table-actions">
                    {sale.status !== "anulada" && (
                      <button
                        type="button"
                        className="btn btn-outline-danger btn-xs"
                        onClick={() => onAnnul(sale)}
                        disabled={busyId === sale.id}
                      >
                        <Ban size={14} aria-hidden="true" />
                        {t("admin.salesTable.annul")}
                      </button>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
