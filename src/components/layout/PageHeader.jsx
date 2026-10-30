import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

export default function PageHeader({
  eyebrow,
  title,
  description,
  breadcrumb = [],
  actions = null,
  tone = "dark",
}) {
  return (
    <header className={`page-header page-header--${tone}`}>
      <div className="page-header__pattern" aria-hidden="true" />
      <div className="shell page-header__inner">
        <div className="page-header__copy">
          {breadcrumb.length > 0 && (
            <nav className="breadcrumb-line" aria-label="Ruta de navegación">
              <Link to="/">Inicio</Link>
              {breadcrumb.map((item) => (
                <span key={item.label}>
                  <ChevronRight size={13} aria-hidden="true" />
                  {item.to ? <Link to={item.to}>{item.label}</Link> : item.label}
                </span>
              ))}
            </nav>
          )}
          {eyebrow && <p className="eyebrow eyebrow--light">{eyebrow}</p>}
          <h1>{title}</h1>
          {description && <p className="page-header__description">{description}</p>}
        </div>
        {actions && <div className="page-header__actions">{actions}</div>}
      </div>
    </header>
  );
}
