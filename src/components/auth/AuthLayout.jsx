import { Link } from "react-router-dom";
import { ArrowLeft, Check, ShieldCheck } from "lucide-react";
import Logo from "../ui/Logo.jsx";
import { site } from "../../config/site.js";
import { useI18n } from "../../i18n/I18nContext.jsx";

export default function AuthLayout({ children, eyebrow, title, description, points }) {
  const { t } = useI18n();
  const heading = title || t("auth.layout.title");
  const lead = description || t("auth.layout.description");
  const items =
    points ||
    [
      t("auth.layout.point1"),
      t("auth.layout.point2"),
      t("auth.layout.point3"),
    ];
  return (
    <div className="auth-shell">
      <aside className="auth-aside">
        <div className="auth-aside__overlay" aria-hidden="true" />
        <div className="auth-aside__content">
          <Logo variant="light" />
          <div className="auth-aside__copy">
            <p className="eyebrow eyebrow--light">
              {eyebrow || t("auth.layout.eyebrow")}
            </p>
            <h2>{heading}</h2>
            <p>{lead}</p>
          </div>
          <ul className="auth-aside__points">
            {items.map((point) => (
              <li key={point}>
                <span aria-hidden="true">
                  <Check size={14} />
                </span>
                {point}
              </li>
            ))}
          </ul>
          <div className="auth-aside__footer">
            <span>
              <ShieldCheck size={16} aria-hidden="true" />
              {t("auth.layout.secure")}
            </span>
            <small>{t("site.role")}</small>
          </div>
        </div>
      </aside>

      <main className="auth-main">
        <div className="auth-main__top">
          <div className="auth-main__mobile-brand">
            <Logo />
          </div>
          <Link to="/" className="auth-back">
            <ArrowLeft size={16} aria-hidden="true" />
            {t("auth.layout.back")}
          </Link>
        </div>

        <div className="auth-card">{children}</div>

        <p className="auth-main__legal">
          {t("auth.layout.rights", {
            year: new Date().getFullYear(),
            name: site.fullName,
          })}
        </p>
      </main>
    </div>
  );
}
