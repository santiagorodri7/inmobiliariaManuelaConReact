import { Banknote, Ban } from "lucide-react";
import { OperationBadge, SaleStatusPill } from "../ui/StatusBadge.jsx";
import { formatCOP } from "../../utils/format.js";
import { formatDate } from "../../utils/dates.js";
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
}) {
  if (loading) return <TableSkeleton rows={5} columns={6} />;
  if (error) return <ErrorState title="No pudimos cargar los cierres" description={error} onRetry={onRetry} compact />;

  if (!sales.length) {
    return (
      <EmptyState
        icon={Banknote}
        title="Aún no hay cierres registrados"
        description="Cuando registres una venta o un arriendo, aparecerá aquí con su valor y su fecha."
        compact
      />
    );
  }

  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>Propiedad</th>
            <th>Operación</th>
            {!compact && <th>Comprador</th>}
            <th>Valor</th>
            <th>Fecha</th>
            <th>Estado</th>
            {!compact && <th className="text-end">Acciones</th>}
          </tr>
        </thead>
        <tbody>
          {sales.map((sale) => (
            <tr key={sale.id}>
              <td>
                <div className="table-property">
                  <div>
                    <strong>{sale.propertyTitle}</strong>
                    <span>{sale.sellerName || "Vendedor sin nombre"}</span>
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
                        Anular
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
