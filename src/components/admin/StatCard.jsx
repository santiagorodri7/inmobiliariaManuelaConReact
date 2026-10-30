export default function StatCard({
  icon: Icon,
  label,
  value,
  hint = "",
  tone = "blue",
}) {
  return (
    <article className={`stat-card stat-card--${tone}`}>
      <span className="stat-card__icon" aria-hidden="true">
        {Icon && <Icon size={21} />}
      </span>
      <div className="stat-card__body">
        <span className="stat-card__label">{label}</span>
        <strong className="stat-card__value">{value}</strong>
        {hint && <span className="stat-card__hint">{hint}</span>}
      </div>
    </article>
  );
}
