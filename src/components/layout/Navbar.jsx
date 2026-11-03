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
import { useI18n } from "../../i18n/I18nContext.jsx";
import { roleHome } from "../../utils/roles.js";

const navKeys = {
  "/": "nav.home",
  "/#propiedades": "nav.properties",
  "/servicios": "nav.services",
  "/nosotros": "nav.about",
  "/contacto": "nav.contact",
};

export default function Navbar() {
  const { profile, loading, logout } = useAuth();
  const { t, roleLabel } = useI18n();
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
  const whatsappMessage = t("home.whatsappMessage", { name: site.name });

  return (
    <header className="site-header">
      <div className="nav-shell">
        <Logo />

        <nav className="nav-links" aria-label={t("nav.mainNav")}>
          {navigation.map((item) => {
            const label = t(navKeys[item.to] || "nav.home");
            return item.to.startsWith("/#") ? (
              <Link key={item.to} to={item.to} className="nav-link">
                {label}
              </Link>
            ) : (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `nav-link${isActive ? " is-active" : ""}`
                }
              >
                {label}
              </NavLink>
            );
          })}
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
                  <strong>{profile.nombre?.split(" ")[0] || t("nav.account")}</strong>
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
                    {t("nav.myPanel")}
                  </Link>
                  <Link to="/cuenta" className="account-dropdown__item" role="menuitem">
                    <UserRound size={17} aria-hidden="true" />
                    {t("nav.myProfile")}
                  </Link>
                  <button
                    type="button"
                    className="account-dropdown__item account-dropdown__item--danger"
                    onClick={handleLogout}
                    role="menuitem"
                  >
                    <LogOut size={17} aria-hidden="true" />
                    {t("nav.logout")}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="nav-login">
              {t("nav.login")}
            </Link>
          )}

          <Link to="/registro?rol=Vendedor" className="btn btn-primary btn-sm nav-cta">
            <Plus size={16} aria-hidden="true" />
            {t("nav.publish")}
          </Link>

          <button
            type="button"
            className="mobile-toggle"
            onClick={() => setMobileOpen((open) => !open)}
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
            aria-label={mobileOpen ? t("nav.closeMenu") : t("nav.openMenu")}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="mobile-menu" id="mobile-menu">
          <nav aria-label={t("nav.mobileNav")}>
            {navigation.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="mobile-menu__link"
              >
                {t(navKeys[item.to] || "nav.home")}
              </Link>
            ))}
          </nav>
          <div className="mobile-menu__divider" />
          {profile ? (
            <>
              <Link to={panelPath} className="mobile-menu__link">
                <LayoutDashboard size={18} aria-hidden="true" />
                {t("nav.myPanel")}
              </Link>
              <Link to="/cuenta" className="mobile-menu__link">
                <UserRound size={18} aria-hidden="true" />
                {t("nav.myProfile")}
              </Link>
              <button type="button" className="mobile-menu__link" onClick={handleLogout}>
                <LogOut size={18} aria-hidden="true" />
                {t("nav.logout")}
              </button>
            </>
          ) : (
            <Link to="/login" className="mobile-menu__link">
              <UserRound size={18} aria-hidden="true" />
              {t("nav.loginAccount")}
            </Link>
          )}
          <a
            href={whatsappUrl(whatsappMessage)}
            target="_blank"
            rel="noreferrer"
            className="mobile-menu__link"
          >
            <MessageCircle size={18} aria-hidden="true" />
            {t("nav.whatsapp")}
          </a>
          <Link to="/registro?rol=Vendedor" className="btn btn-primary w-100 mt-2">
            {t("nav.publish")}
          </Link>
        </div>
      )}
    </header>
  );
}
