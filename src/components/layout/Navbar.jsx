import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageCircle,
  Plus,
  UserRound,
  X,
} from "lucide-react";
import Logo from "../ui/Logo.jsx";
import Avatar from "../ui/Avatar.jsx";
import { navigation, site, whatsappUrl } from "../../config/site.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { roleHome, roleLabel } from "../../utils/roles.js";

export default function Navbar() {
  const { profile, loading, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const accountRef = useRef(null);

  useEffect(() => {
    setMobileOpen(false);
    setAccountOpen(false);
  }, [location.pathname, location.hash]);

  useEffect(() => {
    const onDocumentClick = (event) => {
      if (accountRef.current && !accountRef.current.contains(event.target)) {
        setAccountOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocumentClick);
    return () => document.removeEventListener("mousedown", onDocumentClick);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const panelPath = roleHome(profile);

  return (
    <header className="site-header">
      <div className="nav-shell">
        <Logo />

        <nav className="nav-links" aria-label="Navegación principal">
          {navigation.map((item) =>
            item.to.startsWith("/#") ? (
              <Link key={item.label} to={item.to} className="nav-link">
                {item.label}
              </Link>
            ) : (
              <NavLink
                key={item.label}
                to={item.to}
                className={({ isActive }) =>
                  `nav-link${isActive ? " is-active" : ""}`
                }
              >
                {item.label}
              </NavLink>
            ),
          )}
        </nav>

        <div className="nav-actions">
          {!loading && profile ? (
            <div className="account-menu" ref={accountRef}>
              <button
                type="button"
                className="account-trigger"
                onClick={() => setAccountOpen((open) => !open)}
                aria-expanded={accountOpen}
                aria-haspopup="true"
              >
                <Avatar profile={profile} size="sm" />
                <span className="account-trigger__copy">
                  <strong>{profile.nombre?.split(" ")[0] || "Mi cuenta"}</strong>
                  <small>{roleLabel(profile.rol)}</small>
                </span>
                <ChevronDown size={15} aria-hidden="true" />
              </button>
              {accountOpen && (
                <div className="account-dropdown" role="menu">
                  <div className="account-dropdown__head">
                    <span>{profile.email}</span>
                  </div>
                  <Link to={panelPath} className="account-dropdown__item" role="menuitem">
                    <LayoutDashboard size={17} aria-hidden="true" />
                    Mi panel
                  </Link>
                  <Link to="/cuenta" className="account-dropdown__item" role="menuitem">
                    <UserRound size={17} aria-hidden="true" />
                    Mi perfil
                  </Link>
                  <button
                    type="button"
                    className="account-dropdown__item account-dropdown__item--danger"
                    onClick={handleLogout}
                    role="menuitem"
                  >
                    <LogOut size={17} aria-hidden="true" />
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="nav-login">
              Ingresar
            </Link>
          )}

          <Link to="/registro?rol=Vendedor" className="btn btn-primary btn-sm nav-cta">
            <Plus size={16} aria-hidden="true" />
            Publicar propiedad
          </Link>

          <button
            type="button"
            className="mobile-toggle"
            onClick={() => setMobileOpen((open) => !open)}
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
            aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="mobile-menu" id="mobile-menu">
          <nav aria-label="Navegación móvil">
            {navigation.map((item) => (
              <Link key={item.label} to={item.to} className="mobile-menu__link">
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mobile-menu__divider" />
          {profile ? (
            <>
              <Link to={panelPath} className="mobile-menu__link">
                <LayoutDashboard size={18} aria-hidden="true" />
                Mi panel
              </Link>
              <Link to="/cuenta" className="mobile-menu__link">
                <UserRound size={18} aria-hidden="true" />
                Mi perfil
              </Link>
              <button type="button" className="mobile-menu__link" onClick={handleLogout}>
                <LogOut size={18} aria-hidden="true" />
                Cerrar sesión
              </button>
            </>
          ) : (
            <Link to="/login" className="mobile-menu__link">
              <UserRound size={18} aria-hidden="true" />
              Ingresar a mi cuenta
            </Link>
          )}
          <a
            href={whatsappUrl(`Hola ${site.name}, quiero recibir asesoría inmobiliaria.`)}
            target="_blank"
            rel="noreferrer"
            className="mobile-menu__link"
          >
            <MessageCircle size={18} aria-hidden="true" />
            Escribir por WhatsApp
          </a>
          <Link to="/registro?rol=Vendedor" className="btn btn-primary w-100 mt-2">
            Publicar propiedad
          </Link>
        </div>
      )}
    </header>
  );
}
