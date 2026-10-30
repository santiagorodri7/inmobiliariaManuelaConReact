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
import { site } from "../../config/site.js";

const services = [
  {
    icon: Search,
    title: "Compra",
    text: "Definimos criterios, filtramos opciones y visitamos juntos. Revisamos precio, estado, documentos y condiciones antes de que tomes una decisión.",
  },
  {
    icon: Handshake,
    title: "Venta",
    text: "Preparamos la publicación, ordenamos la información y acompañamos las visitas y la negociación para cuidar el valor de tu inmueble.",
  },
  {
    icon: KeyRound,
    title: "Arriendo",
    text: "Acompañamos la búsqueda o la entrega del inmueble, revisando condiciones, tiempos y responsabilidades de cada parte.",
  },
  {
    icon: LineChart,
    title: "Inversión",
    text: "Comparamos ubicación, precio, potencial de renta y contexto del sector para que evalúes la inversión con más elementos.",
  },
  {
    icon: ClipboardCheck,
    title: "Revisión de documentos",
    text: "Organizamos la documentación base y te indicamos cuándo conviene apoyarte en un abogado o en un experto técnico.",
  },
  {
    icon: Building2,
    title: "Acompañamiento de cierre",
    text: "Seguimos el proceso hasta la entrega: compromisos, fechas, pagos y detalles finales, con comunicación constante.",
  },
];

const process = [
  ["01", "Primera conversación", "Escuchamos tu caso, tus tiempos y tu presupuesto."],
  ["02", "Selección", "Filtramos propiedades o preparamos tu inmueble para salir al mercado."],
  ["03", "Visitas y revisión", "Coordinamos visitas y revisamos los detalles relevantes."],
  ["04", "Cierre y entrega", "Acompañamos la negociación, los documentos y la entrega."],
];

export default function ServicesPage() {
  usePageTitle(
    "Servicios inmobiliarios",
    "Compra, venta, arriendo e inversión inmobiliaria en Medellín con acompañamiento cercano y transparente.",
  );
  const { testimonials, loading, error, setTestimonials } = useTestimonials();
  const { profile } = useAuth();

  return (
    <>
      <PageHeader
        eyebrow="Servicios"
        title="Acompañamiento para cada momento de la operación."
        description="Desde la primera conversación hasta la entrega, ordenamos el proceso para que puedas decidir con información clara y sin presión."
        breadcrumb={[{ label: "Servicios" }]}
      />

      <section className="section">
        <div className="shell">
          <div className="section-heading">
            <p className="eyebrow">Qué hacemos</p>
            <h2>Un servicio, distintas necesidades</h2>
            <p>
              No todos los procesos son iguales. Elegimos el acompañamiento que
              corresponde a tu momento y a tu tipo de operación.
            </p>
          </div>
          <div className="services-grid">
            {services.map(({ icon: Icon, title, text }) => (
              <article className="service-card" key={title}>
                <span className="service-card__icon" aria-hidden="true">
                  <Icon size={23} />
                </span>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--sand">
        <div className="shell">
          <div className="section-heading section-heading--split">
            <div>
              <p className="eyebrow">El proceso</p>
              <h2>Así se ve el acompañamiento</h2>
            </div>
            <Link to="/contacto" className="text-link">
              Empezar una conversación
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
          <div className="process-grid process-grid--four">
            {process.map(([number, title, text]) => (
              <article className="process-step" key={number}>
                <span className="process-step__number">{number}</span>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="testimonios">
        <div className="shell">
          <div className="section-heading">
            <p className="eyebrow">Testimonios</p>
            <h2>Experiencias de quienes ya confiaron</h2>
            <p>
              Cada proceso deja una historia. Estas son algunas de las que
              nuestros clientes han querido compartir.
            </p>
          </div>
          <TestimonialGrid testimonials={testimonials} loading={loading} error={error} />
          <div className="testimonial-form-wrap">
            <TestimonialForm
              profile={profile}
              onCreated={(created) => setTestimonials((current) => [created, ...current])}
            />
          </div>
        </div>
      </section>

      <section className="cta-band cta-band--compact">
        <div className="shell cta-band__inner">
          <div>
            <p className="eyebrow eyebrow--light">Hablemos</p>
            <h2>¿Empezamos por tu caso?</h2>
            <p>
              Cuéntanos si quieres comprar, vender o arrendar. Te respondemos con
              los siguientes pasos concretos.
            </p>
          </div>
          <div className="cta-band__actions">
            <Link to="/contacto" className="btn btn-primary btn-lg">
              Agendar conversación
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
            <a href={`mailto:${site.email}`} className="btn btn-ghost btn-lg">
              Escribir por correo
            </a>
          </div>
        </div>
      </section>

      <div className="shell services-note">
        <Compass size={18} aria-hidden="true" />
        <p>
          La asesoría inmobiliaria no reemplaza la revisión jurídica o técnica de
          un profesional independiente cuando el caso lo requiere. Si necesitas
          ese apoyo, te lo indicamos con claridad.
        </p>
      </div>
    </>
  );
}
