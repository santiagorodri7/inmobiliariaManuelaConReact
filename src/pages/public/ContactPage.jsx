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
import { useI18n } from "../../i18n/I18nContext.jsx";
import { site, whatsappUrl } from "../../config/site.js";

export default function ContactPage() {
  const { t } = useI18n();
  usePageTitle(t("contact.pageTitle"), t("contact.pageDescription"));

  return (
    <>
      <PageHeader
        eyebrow={t("contact.header.eyebrow")}
        title={t("contact.header.title")}
        description={t("contact.header.description")}
        breadcrumb={[{ label: t("contact.header.breadcrumb") }]}
      />

      <section className="section">
        <div className="shell contact-page">
          <div className="contact-page__info">
            <p className="eyebrow">{t("contact.info.eyebrow")}</p>
            <h2>{t("contact.info.title")}</h2>
            <p className="contact-page__intro">{t("contact.info.intro")}</p>

            <div className="contact-channels">
              <a href={`mailto:${site.email}`} className="contact-channel">
                <span className="contact-channel__icon" aria-hidden="true">
                  <Mail size={19} />
                </span>
                <div>
                  <span>{t("contact.info.email")}</span>
                  <strong>{site.email}</strong>
                </div>
                <ExternalLink size={15} aria-hidden="true" />
              </a>

              <a href={`tel:${site.phoneRaw}`} className="contact-channel">
                <span className="contact-channel__icon" aria-hidden="true">
                  <Phone size={19} />
                </span>
                <div>
                  <span>{t("contact.info.phone")}</span>
                  <strong>{site.phone}</strong>
                </div>
                <ExternalLink size={15} aria-hidden="true" />
              </a>

              <a
                href={whatsappUrl(t("contact.whatsappMessage", { name: site.name }))}
                target="_blank"
                rel="noreferrer"
                className="contact-channel"
              >
                <span className="contact-channel__icon" aria-hidden="true">
                  <MessageCircle size={19} />
                </span>
                <div>
                  <span>{t("contact.info.whatsapp")}</span>
                  <strong>{t("contact.info.writeNow")}</strong>
                </div>
                <ExternalLink size={15} aria-hidden="true" />
              </a>

              <div className="contact-channel contact-channel--static">
                <span className="contact-channel__icon" aria-hidden="true">
                  <MapPin size={19} />
                </span>
                <div>
                  <span>{t("contact.info.area")}</span>
                  <strong>{t("site.location")}</strong>
                </div>
              </div>

              <div className="contact-channel contact-channel--static">
                <span className="contact-channel__icon" aria-hidden="true">
                  <Clock3 size={19} />
                </span>
                <div>
                  <span>{t("contact.info.hours")}</span>
                  <strong>{t("site.hours")}</strong>
                </div>
              </div>
            </div>

            <div className="contact-page__image">
              <img
                src="/img/img contacto.jpg"
                alt={t("contact.info.imageAlt")}
                loading="lazy"
              />
              <p>{t("contact.info.imageCaption")}</p>
            </div>

            {site.pendingOfficialData && import.meta.env.DEV && (
              <p className="inline-note">{t("contact.devNote")}</p>
            )}
          </div>

          <div className="contact-page__form surface">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">{t("contact.form.eyebrow")}</p>
                <h2>{t("contact.form.title")}</h2>
                <p>{t("contact.form.text")}</p>
              </div>
            </div>
            <ContactForm />
          </div>
        </div>
      </section>
    </>
  );
}
