import { Users, UserX, UserCheck } from "lucide-react";
import Avatar from "../ui/Avatar.jsx";
import { RolePill, UserStatusPill } from "../ui/StatusBadge.jsx";
import { useI18n } from "../../i18n/I18nContext.jsx";
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
  const { t, formatDate } = useI18n();

  if (loading) return <TableSkeleton rows={6} columns={5} />;
  if (error)
    return (
      <ErrorState
        title={t("admin.usersTable.errorTitle")}
        description={error}
        onRetry={onRetry}
        compact
      />
    );

  if (!users.length) {
    return (
      <EmptyState
        icon={Users}
        title={t("admin.usersTable.emptyTitle")}
        description={t("admin.usersTable.emptyDescription")}
        compact
      />
    );
  }

  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>{t("admin.usersTable.user")}</th>
            <th>{t("admin.usersTable.id")}</th>
            <th>{t("admin.usersTable.role")}</th>
            <th>{t("admin.usersTable.registered")}</th>
            <th>{t("admin.usersTable.status")}</th>
            <th className="text-end">{t("admin.usersTable.actions")}</th>
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
                          ? t("admin.usersTable.selfWarning")
                          : active
                            ? t("admin.usersTable.deactivate")
                            : t("admin.usersTable.reactivate")
                      }
                      aria-label={
                        isSelf
                          ? t("admin.usersTable.selfWarning")
                          : active
                            ? t("admin.usersTable.deactivateAria", {
                                name: user.nombre,
                              })
                            : t("admin.usersTable.reactivateAria", {
                                name: user.nombre,
                              })
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
