import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  Building2,
  Check,
  Compass,
  Handshake,
  KeyRound,
  MessageCircle,
  Search,
  Sparkles,
} from "lucide-react";
import PropertyFilters from "../../components/property/PropertyFilters.jsx";
import PropertyGrid from "../../components/property/PropertyGrid.jsx";
import TestimonialGrid from "../../components/testimonials/TestimonialGrid.jsx";
import MediaImage from "../../components/ui/MediaImage.jsx";
import { usePageTitle } from "../../hooks/usePageTitle.js";
import { useProperties } from "../../hooks/useProperties.js";
import { useTestimonials } from "../../hooks/useTestimonials.js";
import { useI18n } from "../../i18n/I18nContext.jsx";
import { filterProperties, propertySearchSummary } from "../../utils/property.js";
import { buildWhatsappUrl, isWhatsappConfigured } from "../../utils/whatsapp.js";
import { site } from "../../config/site.js";

const initialFilters = {
  operation: "",
  location: "",
  type: "",
  bedrooms: "",
  maxPrice: "",
};

const services = [
  { icon: Search, key: "find", link: "/servicios" },
  { icon: Handshake, key: "sell", link: "/servicios" },
  { icon: KeyRound, key: "rent", link: "/servicios" },
];

const steps = ["talk", "select", "support"];

export default function HomePage() {
  const { t } = useI18n();
  usePageTitle(t("home.pageTitle"), t("home.pageDescription"));

  const { properties, loading, error, reload } = useProperties({ publicOnly: true });
  const { testimonials, loading: testimonialsLoading } = useTestimonials();
  const [filters, setFilters] = useState(initialFilters);
  const [showAll, setShowAll] = useState(false);

  const filtered = useMemo(
    () => filterProperties(properties, filters),
    [properties, filters],
  );
  const visible = showAll ? filtered : filtered.slice(0, 6);
  const hasFilters = Object.values(filters).some(Boolean);
  const summary = propertySearchSummary(filters);

  const updateFilter = (field, value) => {
    setFilters((current) => ({ ...current, [field]: value }));
    setShowAll(false);
  };

  const resetFilters = () => {
    setFilters(initialFilters);
    setShowAll(false);
  };

  const handleSearch = (event) => {
    event.preventDefault();
    document.getElementById("propiedades")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <section className="hero">
        <div className="hero__content">
          <div className="hero__copy">
            <p className="eyebrow eyebrow--light">{t("home.hero.eyebrow")}</p>
            <h1>
              {t("home.hero.titleLine1")}
              <br />
              {t("home.hero.titleLine2")} <em>{t("home.hero.titleEm")}</em>
            </h1>
            <p className="hero__lead">{t("home.hero.lead")}</p>
            <div className="hero__actions">
              <button
                type="button"
                className="btn btn-primary btn-lg"
                onClick={() => document.getElementById("propiedades")?.scrollIntoView({ behavior: "smooth" })}
              >
                {t("home.hero.explore")}
                <ArrowRight size={18} aria-hidden="true" />
              </button>
              <Link to="/contacto" className="btn btn-ghost btn-lg">
                {t("home.hero.talk")}
                <ArrowUpRight size={18} aria-hidden="true" />
              </Link>
            </div>
            <ul className="hero__trust">
              <li>
                <Compass size={17} aria-hidden="true" />
                {t("home.hero.saleRent")}
              </li>
              <li>
                <MessageCircle size={17} aria-hidden="true" />
                {t("home.hero.whatsappSupport")}
              </li>
              <li>
                <Sparkles size={17} aria-hidden="true" />
                {t("home.hero.personalSupport")}
              </li>
            </ul>
          </div>

          <div className="hero__media" aria-hidden="true">
            <div className="hero__image-main">
              <MediaImage src="/img/about-1.png" alt="" />
            </div>
            <div className="hero__image-inset">
              <MediaImage src="/img/balcon%20de%20laureles.png" alt="" />
            </div>
            <div className="hero__note">
              <span className="hero__note-icon">
                <Building2 size={19} />
              </span>
              <div>
                <strong>{t("home.hero.noteTitle")}</strong>
                <span>{t("home.hero.noteText")}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="hero-search-wrap">
        <div className="shell">
          <div className="hero-search-card">
            <div className="hero-search-card__head">
              <div>
                <p className="eyebrow">{t("home.search.eyebrow")}</p>
                <h2>{t("home.search.title")}</h2>
              </div>
              <span className="hero-search-card__hint">
                {loading
                  ? t("home.search.loading")
                  : t("home.search.published", { count: properties.length })}
              </span>
            </div>
            <PropertyFilters
              values={filters}
              onChange={updateFilter}
              onSubmit={handleSearch}
              onReset={resetFilters}
              showReset={hasFilters}
              compact
            />
          </div>
        </div>
      </div>

      <section className="section section--properties" id="propiedades">
        <div className="shell">
          <div className="section-heading section-heading--split">
            <div>
              <p className="eyebrow">{t("home.inventory.eyebrow")}</p>
              <h2>{t("home.inventory.title")}</h2>
              <p>{t("home.inventory.description")}</p>
            </div>
            <div className="section-heading__aside">
              <span>{t("home.inventory.results", { count: filtered.length })}</span>
              {summary && <small>{summary}</small>}
            </div>
          </div>

          {hasFilters && (
            <div className="active-filters">
              <span>{summary || t("home.inventory.activeFilters")}</span>
              <button type="button" onClick={resetFilters}>
                {t("common.clearFilters")}
              </button>
            </div>
          )}

          <PropertyGrid
            properties={visible}
            loading={loading}
            error={error}
            onRetry={reload}
            emptyTitle={
              hasFilters
                ? t("home.inventory.emptyFilteredTitle")
                : t("home.inventory.emptyTitle")
            }
            emptyDescription={
              hasFilters
                ? t("home.inventory.emptyFilteredDescription")
                : t("home.inventory.emptyDescription")
            }
            emptyAction={
              <Link to="/contacto" className="btn btn-primary">
                {t("home.inventory.tellWhatISeek")}
                <ArrowRight size={17} aria-hidden="true" />
              </Link>
            }
          />

          {!showAll && filtered.length > 6 && (
            <div className="section-more">
              <button type="button" className="btn btn-outline-secondary" onClick={() => setShowAll(true)}>
                {t("home.inventory.seeAll", { count: filtered.length })}
                <ArrowRight size={16} aria-hidden="true" />
              </button>
            </div>
          )}
        </div>
      </section>

      <section className="section section--sand" id="servicios">
        <div className="shell">
          <div className="section-heading">
            <p className="eyebrow">{t("home.help.eyebrow")}</p>
            <h2>{t("home.help.title")}</h2>
            <p>{t("home.help.description")}</p>
          </div>
          <div className="service-preview-grid">
            {services.map(({ icon: Icon, key, link }) => (
              <article className="service-preview" key={key}>
                <span className="service-preview__icon" aria-hidden="true">
                  <Icon size={22} />
                </span>
                <h3>{t(`home.services.${key}.title`)}</h3>
                <p>{t(`home.services.${key}.text`)}</p>
                <Link to={link}>
                  {t("home.help.link")}
                  <ArrowUpRight size={15} aria-hidden="true" />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell about-teaser">
          <div className="about-teaser__media" aria-hidden="true">
            <MediaImage src="/img/about-2.png" alt="" />
          </div>
          <div className="about-teaser__copy">
            <p className="eyebrow">{t("home.about.eyebrow")}</p>
            <h2>{t("home.about.title")}</h2>
            <p>{t("home.about.description")}</p>
            <ul className="check-list">
              {["check1", "check2", "check3"].map((key) => (
                <li key={key}>
                  <Check size={17} aria-hidden="true" />
                  {t(`home.about.${key}`)}
                </li>
              ))}
            </ul>
            <Link to="/nosotros" className="text-link">
              {t("home.about.link")}
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <section className="section section--process">
        <div className="shell">
          <div className="section-heading section-heading--split">
            <div>
              <p className="eyebrow">{t("home.process.eyebrow")}</p>
              <h2>{t("home.process.title")}</h2>
            </div>
            <p className="section-heading__note">{t("home.process.note")}</p>
          </div>
          <div className="process-grid">
            {steps.map((key, index) => (
              <article className="process-step" key={key}>
                <span className="process-step__number">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3>{t(`home.process.steps.${key}.title`)}</h3>
                <p>{t(`home.process.steps.${key}.text`)}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {(testimonialsLoading || testimonials.length > 0) && (
        <section className="section section--sand">
          <div className="shell">
            <div className="section-heading section-heading--split">
              <div>
                <p className="eyebrow">{t("home.testimonials.eyebrow")}</p>
                <h2>{t("home.testimonials.title")}</h2>
              </div>
              <Link to="/servicios#testimonios" className="text-link">
                {t("home.testimonials.link")}
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>
            <TestimonialGrid
              testimonials={testimonials}
              loading={testimonialsLoading}
              limit={3}
            />
          </div>
        </section>
      )}

      <section className="cta-band">
        <div className="shell cta-band__inner">
          <div>
            <p className="eyebrow eyebrow--light">{t("home.cta.eyebrow")}</p>
            <h2>{t("home.cta.title")}</h2>
            <p>{t("home.cta.text")}</p>
          </div>
          <div className="cta-band__actions">
            <Link to="/contacto" className="btn btn-primary btn-lg">
              {t("home.cta.schedule")}
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
            {isWhatsappConfigured && (
              <a
                href={buildWhatsappUrl(
                  t("home.whatsappMessage", { name: site.name }),
                )}
                target="_blank"
                rel="noreferrer"
                className="btn btn-ghost btn-lg"
              >
                <MessageCircle size={18} aria-hidden="true" />
                {t("home.cta.whatsapp")}
              </a>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
