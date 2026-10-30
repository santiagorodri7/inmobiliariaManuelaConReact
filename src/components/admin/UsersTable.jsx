import { Users, UserX, UserCheck } from "lucide-react";
import Avatar from "../ui/Avatar.jsx";
import { RolePill, UserStatusPill } from "../ui/StatusBadge.jsx";
import { formatDate } from "../../utils/dates.js";
import EmptyState from "../ui/EmptyState.jsx";
import ErrorState from "../ui/ErrorState.jsx";
import { TableSkeleton } from "../ui/Skeleton.jsx";

export default function UsersTable({
  users = [],
  loading = false,
  error = "",
  onRetry,
  onToggle,
  busyId = "",
  currentUserId = "",
}) {
  if (loading) return <TableSkeleton rows={6} columns={5} />;
  if (error) return <ErrorState title="No pudimos cargar los usuarios" description={error} onRetry={onRetry} compact />;

  if (!users.length) {
    return (
      <EmptyState
        icon={Users}
        title="No hay usuarios con estos filtros"
        description="Prueba con otro término de búsqueda o limpia los filtros."
        compact
      />
    );
  }

  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>Usuario</th>
            <th>Cédula</th>
            <th>Rol</th>
            <th>Registro</th>
            <th>Estado</th>
            <th className="text-end">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => {
            const isSelf = user.id === currentUserId;
            const active = user.activo !== false;
            return (
              <tr key={user.id}>
                <td>
                  <div className="table-user">
                    <Avatar profile={user} size="sm" />
                    <div>
                      <strong>{user.nombre}</strong>
                      <span>{user.email}</span>
                    </div>
                  </div>
                </td>
                <td>{user.cedula || "—"}</td>
                <td><RolePill role={user.rol} /></td>
                <td>{formatDate(user.fechaRegistro)}</td>
                <td><UserStatusPill active={active} /></td>
                <td>
                  <div className="table-actions">
                    <button
                      type="button"
                      className={`icon-button ${active ? "icon-button--danger" : "icon-button--success"}`}
                      onClick={() => onToggle(user)}
                      disabled={busyId === user.id || isSelf}
                      title={
                        isSelf
                          ? "No puedes desactivar tu propia cuenta"
                          : active
                            ? "Desactivar cuenta"
                            : "Reactivar cuenta"
                      }
                      aria-label={
                        isSelf
                          ? "No puedes desactivar tu propia cuenta"
                          : active
                            ? `Desactivar a ${user.nombre}`
                            : `Reactivar a ${user.nombre}`
                      }
                    >
                      {active ? <UserX size={17} /> : <UserCheck size={17} />}
                    </button>
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
