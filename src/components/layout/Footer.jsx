import { Link } from "react-router-dom";
import { ArrowUpRight, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import Logo from "../ui/Logo.jsx";
import { navigation, site, whatsappUrl } from "../../config/site.js";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="site-footer__top shell">
        <div className="site-footer__brand">
          <Logo variant="light" />
          <p>
            Acompañamiento inmobiliario cercano para encontrar, vender o
            arrendar un lugar que se sienta tuyo.
          </p>
          <span className="site-footer__coverage">
            <MapPin size={15} aria-hidden="true" />
            {site.coverage}
          </span>
        </div>

        <div className="site-footer__column">
          <h2>Explorar</h2>
          {navigation.map((item) => (
            <Link key={item.label} to={item.to}>
              {item.label}
            </Link>
          ))}
        </div>

        <div className="site-footer__column">
          <h2>Cuenta</h2>
          <Link to="/login">Ingresar</Link>
          <Link to="/registro?rol=Comprador">Crear cuenta</Link>
          <Link to="/registro?rol=Vendedor">Publicar propiedad</Link>
          <Link to="/comprador">Panel comprador</Link>
        </div>

        <div className="site-footer__column site-footer__contact">
          <h2>Hablemos</h2>
          <a href={`mailto:${site.email}`}>
            <Mail size={16} aria-hidden="true" />
            {site.email}
          </a>
          <a href={`tel:${site.phoneRaw}`}>
            <Phone size={16} aria-hidden="true" />
            {site.phone}
          </a>
          <a
            href={whatsappUrl(`Hola ${site.name}, quiero recibir asesoría inmobiliaria.`)}
            target="_blank"
            rel="noreferrer"
          >
            <MessageCircle size={16} aria-hidden="true" />
            WhatsApp
            <ArrowUpRight size={14} aria-hidden="true" />
          </a>
          <span className="site-footer__hours">{site.hours}</span>
        </div>
      </div>

      <div className="site-footer__bottom shell">
        <p>
          © {year} {site.fullName}. Todos los derechos reservados.
        </p>
        <div className="site-footer__legal">
          <Link to="/contacto">Contacto</Link>
          <span>Hecho en Medellín</span>
        </div>
      </div>

      {site.pendingOfficialData && import.meta.env.DEV && (
        <p className="site-footer__dev-note shell">
          Vista previa local · Los datos de contacto y el logo definitivo deben
          confirmarse antes de publicar.
        </p>
      )}
    </footer>
  );
}
