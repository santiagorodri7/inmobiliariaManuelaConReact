import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Building2, Compass, Home, Mail } from "lucide-react";
import { usePageTitle } from "../../hooks/usePageTitle.js";

export default function NotFoundPage() {
  usePageTitle(
    "Página no encontrada",
    "La página que buscas no existe o cambió de dirección.",
  );

  return (
    <section className="not-found-page">
      <div className="shell not-found-page__inner">
        <span className="not-found-page__code" aria-hidden="true">
          404
        </span>
        <p className="eyebrow">Página no encontrada</p>
        <h1>Este lugar todavía no existe.</h1>
        <p>
          Puede que el enlace haya cambiado o que la página ya no esté
          disponible. Desde aquí puedes volver al inicio, revisar las propiedades
          o escribirnos para ayudarte a encontrar lo que buscas.
        </p>

        <div className="not-found-page__actions">
          <Link to="/" className="btn btn-primary btn-lg">
            <Home size={18} aria-hidden="true" />
            Volver al inicio
          </Link>
          <Link to="/#propiedades" className="btn btn-outline-secondary btn-lg">
            <Building2 size={18} aria-hidden="true" />
            Ver propiedades
          </Link>
        </div>

        <div className="not-found-page__links">
          <Link to="/servicios">
            <Compass size={16} aria-hidden="true" />
            Servicios
            <ArrowRight size={14} aria-hidden="true" />
          </Link>
          <Link to="/contacto">
            <Mail size={16} aria-hidden="true" />
            Contacto
            <ArrowRight size={14} aria-hidden="true" />
          </Link>
          <Link to="/login">
            <ArrowLeft size={16} aria-hidden="true" />
            Iniciar sesión
          </Link>
        </div>
      </div>
    </section>
  );
}
