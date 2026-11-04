import { Link } from "react-router-dom";
import {
  ArrowRight,
  Building2,
  ClipboardCheck,
  Compass,
  Handshake,
  KeyRound,
  LineChart,
  Search,
  Sparkles,
} from "lucide-react";
import PageHeader from "../../components/layout/PageHeader.jsx";
import TestimonialGrid from "../../components/testimonials/TestimonialGrid.jsx";
import TestimonialForm from "../../components/testimonials/TestimonialForm.jsx";
import { usePageTitle } from "../../hooks/usePageTitle.js";
import { useTestimonials } from "../../hooks/useTestimonials.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { useI18n } from "../../i18n/I18nContext.jsx";
import { site } from "../../config/site.js";

const serviceIcons = {
  buy: Search,
  sell: Handshake,
  rent: KeyRound,
  invest: LineChart,
  documents: ClipboardCheck,
  closing: Building2,
};

const processIcons = ["step1", "step2", "step3", "step4"];

export default function ServicesPage() {
  const { t } = useI18n();
  usePageTitle(t("services.pageTitle"), t("services.pageDescription"));
  const { testimonials, loading, error } = useTestimonials();
  const { profile } = useAuth();

  return (
    <>
      <PageHeader
        eyebrow={t("services.header.eyebrow")}
        title={t("services.header.title")}
        description={t("services.header.description")}
        breadcrumb={[{ label: t("services.header.breadcrumb") }]}
      />

      <section className="section">
        <div className="shell">
          <div className="section-heading">
            <p className="eyebrow">{t("services.intro.eyebrow")}</p>
            <h2>{t("services.intro.title")}</h2>
            <p>{t("services.intro.description")}</p>
          </div>
          <div className="services-grid">
            {Object.entries(serviceIcons).map(([key, Icon]) => (
              <article className="service-card" key={key}>
                <span className="service-card__icon" aria-hidden="true">
                  <Icon size={23} />
                </span>
                <h3>{t(`services.items.${key}.title`)}</h3>
                <p>{t(`services.items.${key}.text`)}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--sand">
        <div className="shell">
          <div className="section-heading section-heading--split">
            <div>
              <p className="eyebrow">{t("services.process.eyebrow")}</p>
              <h2>{t("services.process.title")}</h2>
            </div>
            <Link to="/contacto" className="text-link">
              {t("services.process.link")}
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
          <div className="process-grid process-grid--four">
            {processIcons.map((key, index) => (
              <article className="process-step" key={key}>
                <span className="process-step__number">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3>{t(`services.process.${key}.title`)}</h3>
                <p>{t(`services.process.${key}.text`)}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="testimonios">
        <div className="shell">
          <div className="section-heading">
            <p className="eyebrow">{t("services.testimonials.eyebrow")}</p>
            <h2>{t("services.testimonials.title")}</h2>
            <p>{t("services.testimonials.description")}</p>
          </div>
          <TestimonialGrid testimonials={testimonials} loading={loading} error={error} />
          <div className="testimonial-form-wrap">
            <TestimonialForm profile={profile} />
          </div>
        </div>
      </section>

      <section className="cta-band cta-band--compact">
        <div className="shell cta-band__inner">
          <div>
            <p className="eyebrow eyebrow--light">{t("services.cta.eyebrow")}</p>
            <h2>{t("services.cta.title")}</h2>
            <p>{t("services.cta.text")}</p>
          </div>
          <div className="cta-band__actions">
            <Link to="/contacto" className="btn btn-primary btn-lg">
              {t("services.cta.schedule")}
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
            <a href={`mailto:${site.email}`} className="btn btn-ghost btn-lg">
              {t("services.cta.email")}
            </a>
          </div>
        </div>
      </section>

      <div className="shell services-note">
        <Compass size={18} aria-hidden="true" />
        <p>{t("services.note")}</p>
      </div>
    </>
  );
}
