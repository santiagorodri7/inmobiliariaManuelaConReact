import { Link } from "react-router-dom";
import {
  Building2,
  Eye,
  EyeOff,
  LockKeyhole,
  Pencil,
} from "lucide-react";
import { OperationBadge, PropertyStatusPill } from "../ui/StatusBadge.jsx";
import { formatCOP } from "../../utils/format.js";
import { formatDate } from "../../utils/dates.js";
import { isAvailable } from "../../utils/property.js";
import EmptyState from "../ui/EmptyState.jsx";
import ErrorState from "../ui/ErrorState.jsx";
import { TableSkeleton } from "../ui/Skeleton.jsx";

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
  if (loading) return <TableSkeleton rows={5} columns={5} />;
  if (error) {
    return (
      <ErrorState
        title="No pudimos cargar tus propiedades"
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
        title="Aún no has publicado propiedades"
        description="Publica tu primer inmueble y aparecerá en el catálogo público. Podrás editarlo u ocultarlo cuando quieras."
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
            <th>Precio</th>
            <th>Estado</th>
            <th>Publicada</th>
            <th className="text-end">Acciones</th>
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
                      <span>{property.location || "Sin ubicación"}</span>
                      <small>{property.type}</small>
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
                      title="Ver publicación"
                      aria-label={`Ver ${property.title}`}
                    >
                      <Eye size={17} />
                    </Link>

                    {!closed && (
                      <button
                        type="button"
                        className="icon-button"
                        onClick={() => onEdit(property)}
                        title="Editar propiedad"
                        aria-label={`Editar ${property.title}`}
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
                        title="Ocultar del catálogo"
                        aria-label={`Ocultar ${property.title}`}
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
                        title="Volver a publicar"
                        aria-label={`Publicar ${property.title}`}
                      >
                        <Eye size={17} />
                      </button>
                    )}

                    {closed && (
                      <span className="table-lock" title="Propiedad con cierre registrado">
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
