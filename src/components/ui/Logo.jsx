import { Link } from "react-router-dom";

export default function Logo({ variant = "dark", compact = false }) {
  return (
    <Link
      to="/"
      className={`brand brand--${variant}${compact ? " brand--compact" : ""}`}
      aria-label="Manuela Bermúdez Realtor, ir al inicio"
    >
      <span className="brand-mark" aria-hidden="true">
        <svg viewBox="0 0 40 40" role="presentation" focusable="false">
          <path d="M9 27.5V17l11-6.5L31 17v10.5" />
          <path d="M15.5 27.5v-8h9v8" />
          <path d="M7 30.5h26" />
        </svg>
      </span>
      <span className="brand-copy">
        <span className="brand-name">Manuela Bermúdez</span>
        <span className="brand-sub">Realtor · Medellín</span>
      </span>
    </Link>
  );
}
