import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Building2, Compass, Home, Mail } from "lucide-react";
import { usePageTitle } from "../../hooks/usePageTitle.js";
import { useI18n } from "../../i18n/I18nContext.jsx";

export default function NotFoundPage() {
  const { t } = useI18n();
  usePageTitle(t("notFound.pageTitle"), t("notFound.pageDescription"));

  return (
    <section className="not-found-page">
      <div className="shell not-found-page__inner">
        <span className="not-found-page__code" aria-hidden="true">
          404
        </span>
        <p className="eyebrow">{t("notFound.eyebrow")}</p>
        <h1>{t("notFound.title")}</h1>
        <p>{t("notFound.text")}</p>

        <div className="not-found-page__actions">
          <Link to="/" className="btn btn-primary btn-lg">
            <Home size={18} aria-hidden="true" />
            {t("notFound.home")}
          </Link>
          <Link to="/#propiedades" className="btn btn-outline-secondary btn-lg">
            <Building2 size={18} aria-hidden="true" />
            {t("notFound.properties")}
          </Link>
        </div>

        <div className="not-found-page__links">
          <Link to="/servicios">
            <Compass size={16} aria-hidden="true" />
            {t("notFound.services")}
            <ArrowRight size={14} aria-hidden="true" />
          </Link>
          <Link to="/contacto">
            <Mail size={16} aria-hidden="true" />
            {t("notFound.contact")}
            <ArrowRight size={14} aria-hidden="true" />
          </Link>
          <Link to="/login">
            <ArrowLeft size={16} aria-hidden="true" />
            {t("notFound.login")}
          </Link>
        </div>
      </div>
    </section>
  );
}
