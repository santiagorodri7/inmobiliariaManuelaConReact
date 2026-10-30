import { Link } from "react-router-dom";
import { ArrowLeft, Check, ShieldCheck } from "lucide-react";
import Logo from "../ui/Logo.jsx";
import { site } from "../../config/site.js";

export default function AuthLayout({
  children,
  eyebrow = "Manuela Bermúdez · Realtor",
  title = "Un lugar que se sienta tuyo.",
  description = "Acompañamiento inmobiliario cercano para comprar, vender o arrendar en Medellín y el Valle de Aburrá.",
  points = [
    "Acompañamiento directo en cada etapa.",
    "Información clara, sin letra pequeña.",
    "Propiedades seleccionadas con criterio.",
  ],
}) {
  return (
    <div className="auth-shell">
      <aside className="auth-aside">
        <div className="auth-aside__media" aria-hidden="true">
          <img src="/img/about-1.png" alt="" />
        </div>
        <div className="auth-aside__overlay" aria-hidden="true" />
        <div className="auth-aside__content">
          <Logo variant="light" />
          <div className="auth-aside__copy">
            <p className="eyebrow eyebrow--light">{eyebrow}</p>
            <h2>{title}</h2>
            <p>{description}</p>
          </div>
          <ul className="auth-aside__points">
            {points.map((point) => (
              <li key={point}>
                <span aria-hidden="true">
                  <Check size={14} />
                </span>
                {point}
              </li>
            ))}
          </ul>
          <div className="auth-aside__footer">
            <span>
              <ShieldCheck size={16} aria-hidden="true" />
              Espacio privado y seguro
            </span>
            <small>{site.location}</small>
          </div>
        </div>
      </aside>

      <main className="auth-main">
        <div className="auth-main__top">
          <div className="auth-main__mobile-brand">
            <Logo />
          </div>
          <Link to="/" className="auth-back">
            <ArrowLeft size={16} aria-hidden="true" />
            Volver al sitio
          </Link>
        </div>

        <div className="auth-card">{children}</div>

        <p className="auth-main__legal">
          © {new Date().getFullYear()} {site.fullName}. Todos los derechos
          reservados.
        </p>
      </main>
    </div>
  );
}
