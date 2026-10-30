import {
  Clock3,
  ExternalLink,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
} from "lucide-react";
import PageHeader from "../../components/layout/PageHeader.jsx";
import ContactForm from "../../components/contact/ContactForm.jsx";
import { usePageTitle } from "../../hooks/usePageTitle.js";
import { site, whatsappUrl } from "../../config/site.js";

export default function ContactPage() {
  usePageTitle(
    "Contacto",
    "Habla con Manuela Bermúdez Realtor. Asesoría inmobiliaria en Medellín por correo, teléfono o WhatsApp.",
  );

  return (
    <>
      <PageHeader
        eyebrow="Contacto"
        title="Conversemos sobre el lugar que tienes en mente."
        description="Cuéntanos qué buscas, qué quieres vender o qué necesitas resolver. Te responderemos con claridad y sin compromiso."
        breadcrumb={[{ label: "Contacto" }]}
      />

      <section className="section">
        <div className="shell contact-page">
          <div className="contact-page__info">
            <p className="eyebrow">Canales directos</p>
            <h2>Estamos para escucharte</h2>
            <p className="contact-page__intro">
              Si prefieres una conversación rápida, escríbenos por WhatsApp. Si
              tu caso tiene más detalle, el formulario nos ayuda a preparar una
              respuesta mejor.
            </p>

            <div className="contact-channels">
              <a href={`mailto:${site.email}`} className="contact-channel">
                <span className="contact-channel__icon" aria-hidden="true">
                  <Mail size={19} />
                </span>
                <div>
                  <span>Correo</span>
                  <strong>{site.email}</strong>
                </div>
                <ExternalLink size={15} aria-hidden="true" />
              </a>

              <a href={`tel:${site.phoneRaw}`} className="contact-channel">
                <span className="contact-channel__icon" aria-hidden="true">
                  <Phone size={19} />
                </span>
                <div>
                  <span>Teléfono</span>
                  <strong>{site.phone}</strong>
                </div>
                <ExternalLink size={15} aria-hidden="true" />
              </a>

              <a
                href={whatsappUrl(`Hola ${site.name}, quiero hacer una consulta inmobiliaria.`)}
                target="_blank"
                rel="noreferrer"
                className="contact-channel"
              >
                <span className="contact-channel__icon" aria-hidden="true">
                  <MessageCircle size={19} />
                </span>
                <div>
                  <span>WhatsApp</span>
                  <strong>Escribir ahora</strong>
                </div>
                <ExternalLink size={15} aria-hidden="true" />
              </a>

              <div className="contact-channel contact-channel--static">
                <span className="contact-channel__icon" aria-hidden="true">
                  <MapPin size={19} />
                </span>
                <div>
                  <span>Zona de atención</span>
                  <strong>{site.location}</strong>
                </div>
              </div>

              <div className="contact-channel contact-channel--static">
                <span className="contact-channel__icon" aria-hidden="true">
                  <Clock3 size={19} />
                </span>
                <div>
                  <span>Horario</span>
                  <strong>{site.hours}</strong>
                </div>
              </div>
            </div>

            <div className="contact-page__image">
              <img src="/img/img contacto.jpg" alt="Vista de Medellín al atardecer" loading="lazy" />
              <p>Medellín y el Valle de Aburrá</p>
            </div>

            {site.pendingOfficialData && import.meta.env.DEV && (
              <p className="inline-note">
                Vista previa local: el correo, teléfono y dirección definitivos
                deben confirmarse antes de publicar.
              </p>
            )}
          </div>

          <div className="contact-page__form surface">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Escríbenos</p>
                <h2>Cuéntanos tu caso</h2>
                <p>
                  Completa el formulario y te responderemos al correo que
                  indiques.
                </p>
              </div>
            </div>
            <ContactForm />
          </div>
        </div>
      </section>
    </>
  );
}
