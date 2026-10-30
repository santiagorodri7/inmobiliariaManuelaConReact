import { Building2, Eye, EyeOff, Handshake } from "lucide-react";
import { Link } from "react-router-dom";
import { OperationBadge, PropertyStatusPill } from "../ui/StatusBadge.jsx";
import { formatCOP } from "../../utils/format.js";
import { formatDate } from "../../utils/dates.js";
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
  if (loading) return <TableSkeleton rows={6} columns={6} />;
  if (error) return <ErrorState title="No pudimos cargar las propiedades" description={error} onRetry={onRetry} compact />;

  if (!properties.length) {
    return (
      <EmptyState
        icon={Building2}
        title="No hay propiedades con estos filtros"
        description="Ajusta la búsqueda o limpia los filtros para ver todo el inventario."
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
            <th>Registro</th>
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
                <td><OperationBadge operation={property.operation} /></td>
                <td className="table-price">{formatCOP(property.price)}</td>
                <td><PropertyStatusPill status={property.status} /></td>
                <td>{formatDate(property.createdAt || property.fechaRegistro)}</td>
                <td>
                  <div className="table-actions">
                    <Link
                      to={`/propiedad/${encodeURIComponent(property.id)}`}
                      className="icon-button"
                      title="Ver propiedad"
                      aria-label={`Ver ${property.title}`}
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
                        Registrar cierre
                      </button>
                    )}
                    {!closed && (
                      <button
                        type="button"
                        className="icon-button"
                        onClick={() => onToggleStatus(property)}
                        disabled={busyId === property.id}
                        title={available ? "Ocultar publicación" : "Publicar"}
                        aria-label={available ? `Ocultar ${property.title}` : `Publicar ${property.title}`}
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
