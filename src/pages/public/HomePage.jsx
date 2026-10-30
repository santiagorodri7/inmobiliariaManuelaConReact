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
  MapPin,
  MessageCircle,
  Search,
  Sparkles,
} from "lucide-react";
import PropertyFilters from "../../components/property/PropertyFilters.jsx";
import PropertyGrid from "../../components/property/PropertyGrid.jsx";
import TestimonialGrid from "../../components/testimonials/TestimonialGrid.jsx";
import { usePageTitle } from "../../hooks/usePageTitle.js";
import { useProperties } from "../../hooks/useProperties.js";
import { useTestimonials } from "../../hooks/useTestimonials.js";
import { filterProperties, propertySearchSummary } from "../../utils/property.js";
import { site, whatsappUrl } from "../../config/site.js";

const initialFilters = {
  operation: "",
  location: "",
  type: "",
  bedrooms: "",
  maxPrice: "",
};

const services = [
  {
    icon: Search,
    title: "Encontrar tu próximo lugar",
    text: "Filtramos opciones según tu forma de vivir, tu presupuesto y la zona que tienes en mente.",
    link: "/servicios",
  },
  {
    icon: Handshake,
    title: "Vender con claridad",
    text: "Organizamos la publicación, las visitas y la negociación para que el proceso sea predecible.",
    link: "/servicios",
  },
  {
    icon: KeyRound,
    title: "Arrendar sin ruido",
    text: "Te acompañamos en la selección, la revisión de condiciones y la entrega del inmueble.",
    link: "/servicios",
  },
];

const steps = [
  {
    number: "01",
    title: "Conversamos",
    text: "Escuchamos qué necesitas, qué te importa del lugar y cuál es tu presupuesto real.",
  },
  {
    number: "02",
    title: "Seleccionamos",
    text: "Filtramos propiedades que encajan y coordinamos visitas sin hacerte perder tiempo.",
  },
  {
    number: "03",
    title: "Acompañamos",
    text: "Revisamos condiciones, negociación y cierre contigo, con comunicación constante.",
  },
];

export default function HomePage() {
  usePageTitle(
    "Propiedades en venta y arriendo en Medellín",
    "Encuentra propiedades en Medellín y el Valle de Aburrá con asesoría inmobiliaria cercana y transparente.",
  );

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
            <p className="eyebrow eyebrow--light">
              Manuela Bermúdez · Realtor
            </p>
            <h1>
              Un lugar que
              <br />
              se sienta <em>tuyo.</em>
            </h1>
            <p className="hero__lead">
              Propiedades en venta y arriendo en Medellín y el Valle de Aburrá,
              con una asesoría cercana para decidir con calma y con claridad.
            </p>
            <div className="hero__actions">
              <button
                type="button"
                className="btn btn-primary btn-lg"
                onClick={() => document.getElementById("propiedades")?.scrollIntoView({ behavior: "smooth" })}
              >
                Explorar propiedades
                <ArrowRight size={18} aria-hidden="true" />
              </button>
              <Link to="/contacto" className="btn btn-ghost btn-lg">
                Hablar con Manuela
                <ArrowUpRight size={18} aria-hidden="true" />
              </Link>
            </div>
            <ul className="hero__trust">
              <li>
                <Compass size={17} aria-hidden="true" />
                Venta y arriendo
              </li>
              <li>
                <MapPin size={17} aria-hidden="true" />
                {site.coverage}
              </li>
              <li>
                <Sparkles size={17} aria-hidden="true" />
                Acompañamiento personal
              </li>
            </ul>
          </div>

          <div className="hero__media" aria-hidden="true">
            <div className="hero__image-main">
              <img src="/img/about-1.png" alt="" />
            </div>
            <div className="hero__image-inset">
              <img src="/img/balcon de laureles.png" alt="" />
            </div>
            <div className="hero__note">
              <span className="hero__note-icon">
                <Building2 size={19} />
              </span>
              <div>
                <strong>Selección cuidada</strong>
                <span>Cada propiedad se revisa antes de publicarse.</span>
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
                <p className="eyebrow">Encuentra tu próximo lugar</p>
                <h2>¿Qué estás buscando?</h2>
              </div>
              <span className="hero-search-card__hint">
                {loading ? "Cargando inventario…" : `${properties.length} propiedades publicadas`}
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
              <p className="eyebrow">Inventario disponible</p>
              <h2>Propiedades para empezar a imaginar</h2>
              <p>
                Una selección de inmuebles publicados. Si algo te gusta, podemos
                coordinar una visita y revisar cada detalle contigo.
              </p>
            </div>
            <div className="section-heading__aside">
              <span>{filtered.length} resultados</span>
              {summary && <small>{summary}</small>}
            </div>
          </div>

          {hasFilters && (
            <div className="active-filters">
              <span>{summary || "Filtros activos"}</span>
              <button type="button" onClick={resetFilters}>
                Limpiar filtros
              </button>
            </div>
          )}

          <PropertyGrid
            properties={visible}
            loading={loading}
            error={error}
            onRetry={reload}
            emptyTitle={hasFilters ? "No encontramos propiedades con esos filtros" : "Aún no hay propiedades publicadas"}
            emptyDescription={
              hasFilters
                ? "Prueba con otra zona, un presupuesto mayor o menos requisitos. También podemos buscar contigo."
                : "Estamos preparando el inventario. Cuéntanos qué buscas y te avisamos cuando llegue algo que encaje."
            }
            emptyAction={
              <Link to="/contacto" className="btn btn-primary">
                Contar qué busco
                <ArrowRight size={17} aria-hidden="true" />
              </Link>
            }
          />

          {!showAll && filtered.length > 6 && (
            <div className="section-more">
              <button type="button" className="btn btn-outline-secondary" onClick={() => setShowAll(true)}>
                Ver las {filtered.length} propiedades
                <ArrowRight size={16} aria-hidden="true" />
              </button>
            </div>
          )}
        </div>
      </section>

      <section className="section section--sand" id="servicios">
        <div className="shell">
          <div className="section-heading">
            <p className="eyebrow">Cómo puedo ayudarte</p>
            <h2>Menos ruido, más decisiones claras</h2>
            <p>
              No se trata de mostrarte todas las propiedades del mercado, sino
              de encontrar las que tienen sentido para ti.
            </p>
          </div>
          <div className="service-preview-grid">
            {services.map(({ icon: Icon, title, text, link }) => (
              <article className="service-preview" key={title}>
                <span className="service-preview__icon" aria-hidden="true">
                  <Icon size={22} />
                </span>
                <h3>{title}</h3>
                <p>{text}</p>
                <Link to={link}>
                  Conocer el servicio
                  <ArrowUpRight size={15} aria-hidden="true" />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell about-teaser">
          <div className="about-teaser__media">
            <img src="/img/about-2.png" alt="Terraza con piscina y vista a la ciudad de Medellín" loading="lazy" />
            <div className="about-teaser__badge">
              <span>Medellín</span>
              <strong>Valle de Aburrá</strong>
            </div>
          </div>
          <div className="about-teaser__copy">
            <p className="eyebrow">Una forma más humana</p>
            <h2>Moverte por el mercado inmobiliario no tiene por qué ser confuso.</h2>
            <p>
              Mi trabajo es traducir el proceso a decisiones simples: qué mirar,
              qué preguntar y cuándo avanzar. Con información clara y sin
              presión, para que elijas un lugar que realmente se sienta tuyo.
            </p>
            <ul className="check-list">
              <li>
                <Check size={17} aria-hidden="true" />
                Comunicación directa durante todo el proceso.
              </li>
              <li>
                <Check size={17} aria-hidden="true" />
                Acompañamiento en visitas, negociación y cierre.
              </li>
              <li>
                <Check size={17} aria-hidden="true" />
                Enfoque en tus prioridades, no en la prisa.
              </li>
            </ul>
            <Link to="/nosotros" className="text-link">
              Conocer más sobre Manuela
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <section className="section section--process">
        <div className="shell">
          <div className="section-heading section-heading--split">
            <div>
              <p className="eyebrow">El proceso</p>
              <h2>Tres pasos, una conversación constante</h2>
            </div>
            <p className="section-heading__note">
              Cada operación es distinta. Estos son los momentos que siempre
              cuidamos contigo.
            </p>
          </div>
          <div className="process-grid">
            {steps.map((step) => (
              <article className="process-step" key={step.number}>
                <span className="process-step__number">{step.number}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
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
                <p className="eyebrow">Experiencias reales</p>
                <h2>Lo que dicen quienes ya pasaron por aquí</h2>
              </div>
              <Link to="/servicios#testimonios" className="text-link">
                Ver todos los testimonios
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
        <div className="cta-band__image" aria-hidden="true">
          <img src="/img/img contacto.jpg" alt="" loading="lazy" />
        </div>
        <div className="shell cta-band__inner">
          <div>
            <p className="eyebrow eyebrow--light">Hablemos</p>
            <h2>Cuéntame qué estás buscando.</h2>
            <p>
              Ya sea que estés empezando a mirar o listo para dar el siguiente
              paso, podemos ordenar las opciones juntos.
            </p>
          </div>
          <div className="cta-band__actions">
            <Link to="/contacto" className="btn btn-primary btn-lg">
              Agendar una conversación
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
            <a
              href={whatsappUrl(`Hola ${site.name}, quiero recibir asesoría inmobiliaria.`)}
              target="_blank"
              rel="noreferrer"
              className="btn btn-ghost btn-lg"
            >
              <MessageCircle size={18} aria-hidden="true" />
              Escribir por WhatsApp
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
