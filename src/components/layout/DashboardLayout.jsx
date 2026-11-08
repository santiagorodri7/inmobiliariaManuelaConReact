import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowUpRight,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import Logo from "../ui/Logo.jsx";
import Avatar from "../ui/Avatar.jsx";
import LanguageSwitcher from "../ui/LanguageSwitcher.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { useI18n } from "../../i18n/I18nContext.jsx";

export default function DashboardLayout({
  role,
  navItems = [],
  activeKey,
  onNavigate,
  title,
  subtitle = "",
  actions = null,
  children,
}) {
  const { profile, logout } = useAuth();
  const { t, roleLabel } = useI18n();
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const roleName = roleLabel(role);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const handleItem = (item) => {
    setOpen(false);
    if (item.to) return;
    onNavigate?.(item.key);
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className="dashboard-shell">
      <aside className={`dashboard-sidebar${open ? " is-open" : ""}`}>
        <div className="dashboard-sidebar__brand">
          <Logo variant="light" />
          <button
            type="button"
            className="icon-button dashboard-sidebar__close"
            onClick={() => setOpen(false)}
            aria-label={t("nav.closeMenu")}
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        <div className="dashboard-sidebar__role">
          <span>{roleName}</span>
          <p>{t("nav.panelOf", { role: roleName })}</p>
        </div>

        <nav className="dashboard-nav" aria-label={t("nav.menuOf", { role: roleName })}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = activeKey === item.key;
            const classes = `dashboard-nav__item${active ? " is-active" : ""}${
              item.tone === "danger" ? " is-danger" : ""
            }`;
            return item.to ? (
              <Link
                key={item.key}
                to={item.to}
                className={classes}
                aria-current={active ? "page" : undefined}
                onClick={() => setOpen(false)}
              >
                {Icon && <Icon size={19} aria-hidden="true" />}
                <span>{t(item.label)}</span>
              </Link>
            ) : (
              <button
                key={item.key}
                type="button"
                className={classes}
                aria-current={active ? "page" : undefined}
                onClick={() => handleItem(item)}
              >
                {Icon && <Icon size={19} aria-hidden="true" />}
                <span>{t(item.label)}</span>
              </button>
            );
          })}
        </nav>

        <div className="dashboard-sidebar__footer">
          <Link to="/" className="dashboard-sidebar__site">
            {t("nav.viewSite")}
            <ArrowUpRight size={15} aria-hidden="true" />
          </Link>
          <div className="dashboard-user">
            <Avatar profile={profile} size="sm" />
            <div>
              <strong>{profile?.nombre || t("common.user")}</strong>
              <span>{profile?.email}</span>
            </div>
          </div>
          <button
            type="button"
            className="dashboard-logout"
            onClick={handleLogout}
          >
            <LogOut size={17} aria-hidden="true" />
            {t("nav.logout")}
          </button>
        </div>
      </aside>

      {open && (
        <button
          type="button"
          className="dashboard-backdrop"
          onClick={() => setOpen(false)}
          aria-label={t("nav.closeMenu")}
        />
      )}

      <div className="dashboard-main">
        <header className="dashboard-topbar">
          <div className="dashboard-topbar__left">
            <button
              type="button"
              className="icon-button dashboard-topbar__menu"
              onClick={() => setOpen(true)}
              aria-label={t("nav.openMenu")}
            >
              <Menu size={21} aria-hidden="true" />
            </button>
            <div>
              <p className="dashboard-topbar__eyebrow">
                {t("nav.panelEyebrow", { role: roleName })}
              </p>
              <h1>{title}</h1>
            </div>
          </div>
          <div className="dashboard-topbar__right">
            {actions}
            <LanguageSwitcher className="dashboard-language" />
            <Avatar profile={profile} size="sm" />
          </div>
        </header>

        {subtitle && <p className="dashboard-subtitle">{subtitle}</p>}

        <div className="dashboard-content">{children}</div>
      </div>
    </div>
  );
}
