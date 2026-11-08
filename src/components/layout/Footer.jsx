import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  Mail,
  MessageCircle,
  Phone,
} from "lucide-react";
import Logo from "../ui/Logo.jsx";
import MediaImage from "../ui/MediaImage.jsx";
import { navigation, site } from "../../config/site.js";
import { buildWhatsappUrl, isWhatsappConfigured } from "../../utils/whatsapp.js";
import { useI18n } from "../../i18n/I18nContext.jsx";

const navKeys = {
  "/": "nav.home",
  "/#propiedades": "nav.properties",
  "/servicios": "nav.services",
  "/nosotros": "nav.about",
  "/contacto": "nav.contact",
};

export default function Footer() {
  const { t } = useI18n();
  const year = new Date().getFullYear();
  const whatsappMessage = t("home.whatsappMessage", { name: site.name });

  return (
    <footer className="site-footer">
      <div className="site-footer__skyline">
        <MediaImage
          src="/img/medellin-footer.jpg"
          alt={t("footer.skylineAlt")}
          loading="lazy"
          decoding="async"
        />
        <div className="site-footer__skyline-overlay">
          <div className="shell">
            <p>{t("footer.skylineCaption")}</p>
          </div>
        </div>
      </div>

      <div className="site-footer__top shell">
        <div className="site-footer__brand">
          <Logo variant="light" />
          <p>{t("footer.about")}</p>
        </div>

        <div className="site-footer__column">
          <h2>{t("nav.explore")}</h2>
          {navigation.map((item) => (
            <Link key={item.to} to={item.to}>
              {t(navKeys[item.to] || "nav.home")}
            </Link>
          ))}
        </div>

        <div className="site-footer__column">
          <h2>{t("nav.account")}</h2>
          <Link to="/login">{t("nav.login")}</Link>
          <Link to="/registro?rol=Comprador">{t("nav.register")}</Link>
          <Link to="/registro?rol=Vendedor">{t("nav.publish")}</Link>
          <Link to="/comprador">{t("nav.buyerPanel")}</Link>
        </div>

        <div className="site-footer__column site-footer__contact">
          <h2>{t("nav.talk")}</h2>
          <a href={`mailto:${site.email}`}>
            <Mail size={16} aria-hidden="true" />
            {site.email}
          </a>
          <a href={`tel:${site.phoneRaw}`}>
            <Phone size={16} aria-hidden="true" />
            {site.phone}
          </a>
          {isWhatsappConfigured && (
            <a
              href={buildWhatsappUrl(whatsappMessage)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle size={16} aria-hidden="true" />
              WhatsApp
              <ArrowUpRight size={14} aria-hidden="true" />
            </a>
          )}
          {site.instagram && (
            <a
              href={site.instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t("nav.instagram")}
            >
              <i className="fab fa-instagram" aria-hidden="true" />
              {site.instagramHandle}
            </a>
          )}
          {isWhatsappConfigured && (
            <span className="site-footer__hours">
              {t("site.whatsappAnytime")}
            </span>
          )}
        </div>
      </div>

      <div className="site-footer__bottom shell">
        <p>{t("footer.rights", { year, name: site.fullName })}</p>
        <div className="site-footer__legal">
          <Link to="/privacidad">{t("footer.privacy")}</Link>
          <Link to="/contacto">{t("nav.contact")}</Link>
        </div>
      </div>
    </footer>
  );
}
