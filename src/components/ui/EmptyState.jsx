import { Home } from "lucide-react";

export default function EmptyState({
  icon: Icon = Home,
  title,
  description,
  action = null,
  compact = false,
}) {
  return (
    <div className={`empty-state${compact ? " empty-state--compact" : ""}`}>
      <span className="empty-state__icon" aria-hidden="true">
        <Icon size={26} />
      </span>
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      {action && <div className="empty-state__action">{action}</div>}
    </div>
  );
}
