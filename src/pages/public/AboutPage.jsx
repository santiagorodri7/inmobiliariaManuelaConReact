import { Link } from "react-router-dom";
import {
  ArrowRight,
  Compass,
  HeartHandshake,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import PageHeader from "../../components/layout/PageHeader.jsx";
import { usePageTitle } from "../../hooks/usePageTitle.js";
import { useI18n } from "../../i18n/I18nContext.jsx";
import { site, whatsappUrl } from "../../config/site.js";

const valueIcons = {
  transparency: ShieldCheck,
  criteria: Compass,
  closeness: HeartHandshake,
  care: Sparkles,
};

export default function AboutPage() {
  const { t } = useI18n();
  usePageTitle(t("about.pageTitle"), t("about.pageDescription"));
  const cities = [
    "Medellín",
    "Envigado",
    "Itagüí",
    "Sabaneta",
    "La Estrella",
    "Bello",
    "Copacabana",
    "Rionegro",
  ];

  return (
    <>
      <PageHeader
        eyebrow={t("about.header.eyebrow")}
        title={t("about.header.title")}
        description={t("about.header.description")}
        breadcrumb={[{ label: t("about.header.breadcrumb") }]}
      />

      <section className="section">
        <div className="shell about-page__intro">
          <div className="about-page__copy">
            <p className="eyebrow">{t("about.intro.eyebrow")}</p>
            <h2>{t("about.intro.title")}</h2>
            <p>{t("about.intro.p1")}</p>
            <p>{t("about.intro.p2")}</p>
            <Link to="/contacto" className="btn btn-primary">
              {t("about.intro.cta")}
              <ArrowRight size={17} aria-hidden="true" />
            </Link>
          </div>
          <div className="about-page__media">
            <img
              src="/img/about.png"
              alt={t("about.intro.imageAlt")}
              loading="lazy"
            />
            <div className="about-page__quote">
              <p>{t("about.intro.quote")}</p>
              <span>{t("about.intro.author")}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section section--sand">
        <div className="shell">
          <div className="section-heading">
            <p className="eyebrow">{t("about.values.eyebrow")}</p>
            <h2>{t("about.values.title")}</h2>
          </div>
          <div className="values-grid">
            {Object.entries(valueIcons).map(([key, Icon]) => (
              <article className="value-card" key={key}>
                <span className="value-card__icon" aria-hidden="true">
                  <Icon size={22} />
                </span>
                <h3>{t(`about.values.${key}.title`)}</h3>
                <p>{t(`about.values.${key}.text`)}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell coverage-panel">
          <div>
            <p className="eyebrow">{t("about.coverage.eyebrow")}</p>
            <h2>{t("about.coverage.title")}</h2>
            <p>{t("about.coverage.text")}</p>
          </div>
          <ul className="coverage-list">
            {cities.map((city) => (
              <li key={city}>{city}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="cta-band cta-band--compact">
        <div className="shell cta-band__inner">
          <div>
            <p className="eyebrow eyebrow--light">{t("about.cta.eyebrow")}</p>
            <h2>{t("about.cta.title")}</h2>
            <p>{t("about.cta.text")}</p>
          </div>
          <div className="cta-band__actions">
            <Link to="/contacto" className="btn btn-primary btn-lg">
              {t("about.cta.write", { name: site.name.split(" ")[0] })}
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
            <a
              href={whatsappUrl(t("about.whatsappMessage", { name: site.name }))}
              target="_blank"
              rel="noreferrer"
              className="btn btn-ghost btn-lg"
            >
              {t("about.cta.whatsapp")}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
