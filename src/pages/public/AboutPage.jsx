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
import { site, whatsappUrl } from "../../config/site.js";

const values = [
  {
    icon: ShieldCheck,
    title: "Transparencia",
    text: "Información clara sobre precios, condiciones y documentación. Sin sorpresas de último momento.",
  },
  {
    icon: Compass,
    title: "Criterio",
    text: "Cada recomendación parte de tus prioridades y del contexto real del mercado, no de la prisa.",
  },
  {
    icon: HeartHandshake,
    title: "Cercanía",
    text: "Una conversación directa, con disponibilidad para resolver dudas antes y después de la operación.",
  },
  {
    icon: Sparkles,
    title: "Cuidado",
    text: "Revisamos los detalles que suelen pasar desapercibidos para que puedas decidir con tranquilidad.",
  },
];

export default function AboutPage() {
  usePageTitle(
    "Nosotros",
    "Conoce el enfoque de Manuela Bermúdez Realtor: asesoría inmobiliaria cercana, transparente y con criterio en Medellín.",
  );

  return (
    <>
      <PageHeader
        eyebrow="Sobre Manuela Bermúdez Realtor"
        title="Una forma más humana de moverte por el mercado inmobiliario."
        description="Acompañamiento cercano para comprar, vender o arrendar en Medellín y el Valle de Aburrá. Sin presión, con información clara y decisiones que se sienten propias."
        breadcrumb={[{ label: "Nosotros" }]}
      />

      <section className="section">
        <div className="shell about-page__intro">
          <div className="about-page__copy">
            <p className="eyebrow">El enfoque</p>
            <h2>El lugar correcto no es solo una dirección.</h2>
            <p>
              Es la luz de la mañana, el trayecto al trabajo, el espacio para
              recibir a quien quieres y la tranquilidad de saber que la decisión
              está bien sustentada. Por eso, antes de mostrarte propiedades,
              conversamos sobre lo que realmente necesitas.
            </p>
            <p>
              Manuela Bermúdez Realtor nace para acompañar ese proceso con
              cercanía y criterio: escuchar, filtrar, visitar, revisar y
              acompañar el cierre. La tecnología ayuda a ordenar la información;
              las decisiones siguen siendo humanas.
            </p>
            <Link to="/contacto" className="btn btn-primary">
              Conversemos
              <ArrowRight size={17} aria-hidden="true" />
            </Link>
          </div>
          <div className="about-page__media">
            <img
              src="/img/about.png"
              alt="Espacio de trabajo con vista a la ciudad de Medellín"
              loading="lazy"
            />
            <div className="about-page__quote">
              <p>
                “Un buen acompañamiento no te dice qué comprar; te ayuda a
                entender qué necesitas.”
              </p>
              <span>Manuela Bermúdez</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section section--sand">
        <div className="shell">
          <div className="section-heading">
            <p className="eyebrow">Lo que guía el trabajo</p>
            <h2>Cuatro principios, una misma conversación</h2>
          </div>
          <div className="values-grid">
            {values.map(({ icon: Icon, title, text }) => (
              <article className="value-card" key={title}>
                <span className="value-card__icon" aria-hidden="true">
                  <Icon size={22} />
                </span>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell coverage-panel">
          <div>
            <p className="eyebrow">Dónde trabajamos</p>
            <h2>Medellín y el Valle de Aburrá</h2>
            <p>
              Acompañamos operaciones en Medellín, Envigado, Itagüí, Sabaneta,
              La Estrella, Bello, Copacabana y municipios cercanos. Si tu
              propiedad o tu búsqueda está por fuera de esta zona, escríbenos:
              evaluamos cada caso.
            </p>
          </div>
          <ul className="coverage-list">
            {["Medellín", "Envigado", "Itagüí", "Sabaneta", "La Estrella", "Bello", "Copacabana", "Rionegro"].map(
              (city) => (
                <li key={city}>{city}</li>
              ),
            )}
          </ul>
        </div>
      </section>

      <section className="cta-band cta-band--compact">
        <div className="shell cta-band__inner">
          <div>
            <p className="eyebrow eyebrow--light">Siguiente paso</p>
            <h2>Conversemos sobre lo que necesitas.</h2>
            <p>
              Una llamada o un mensaje es suficiente para empezar a ordenar las
              opciones.
            </p>
          </div>
          <div className="cta-band__actions">
            <Link to="/contacto" className="btn btn-primary btn-lg">
              Escribir a {site.name.split(" ")[0]}
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
            <a
              href={whatsappUrl(`Hola ${site.name}, quiero conocer más sobre tu acompañamiento.`)}
              target="_blank"
              rel="noreferrer"
              className="btn btn-ghost btn-lg"
            >
              WhatsApp
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
