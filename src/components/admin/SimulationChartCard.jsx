import { ResponsiveContainer } from "recharts";

export default function SimulationChartCard({
  testId,
  eyebrow,
  title,
  description,
  children,
  footnote = "",
  empty = false,
  emptyLabel = "",
}) {
  return (
    <section
      className="surface panel simulation-chart"
      data-testid={testId}
      aria-label={title}
    >
      <div className="panel-heading simulation-chart__heading">
        <div>
          {eyebrow && <p className="eyebrow">{eyebrow}</p>}
          <h2>{title}</h2>
          {description && <p>{description}</p>}
        </div>
      </div>
      {empty ? (
        <p className="simulation-chart__empty">{emptyLabel}</p>
      ) : (
        <div className="simulation-chart__body">
          <ResponsiveContainer width="100%" height={280}>
            {children}
          </ResponsiveContainer>
        </div>
      )}
      {footnote && <p className="simulation-chart__footnote">{footnote}</p>}
    </section>
  );
}
