import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  BadgeCheck,
  CalendarDays,
  LayoutDashboard,
  Mail,
  MapPin,
  ShieldCheck,
} from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout.jsx";
import Avatar from "../../components/ui/Avatar.jsx";
import { RolePill } from "../../components/ui/StatusBadge.jsx";
import PersonalInfoForm from "../../components/account/PersonalInfoForm.jsx";
import PasswordForm from "../../components/account/PasswordForm.jsx";
import DangerZone from "../../components/account/DangerZone.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { useI18n } from "../../i18n/I18nContext.jsx";
import { usePageTitle } from "../../hooks/usePageTitle.js";
import { accountNav } from "../../config/dashboardNav.js";
import { roleHome } from "../../utils/roles.js";
import { profileCompletion } from "../../utils/users.js";

export default function AccountPage() {
  const { t, roleLabel, formatDate } = useI18n();
  usePageTitle(t("account.pageTitle"), t("account.pageDescription"));
  const { profile } = useAuth();
  const [section, setSection] = useState("perfil");
  const completion = profileCompletion(profile);
  const panelPath = roleHome(profile);
  const sectionTitles = {
    perfil: t("account.titles.profile"),
    seguridad: t("account.titles.security"),
  };

  const navItems = [
    ...accountNav,
    {
      key: "panel",
      label: "nav.myPanel",
      icon: LayoutDashboard,
      to: panelPath,
    },
  ];

  return (
    <DashboardLayout
      role={profile?.rol}
      navItems={navItems}
      activeKey={section}
      onNavigate={setSection}
      title={sectionTitles[section]}
      subtitle={t("account.subtitle")}
      actions={
        <Link to={panelPath} className="btn btn-outline-secondary btn-sm dashboard-action">
          {t("account.goPanel")}
          <ArrowUpRight size={15} aria-hidden="true" />
        </Link>
      }
    >
      <section className="profile-overview surface">
        <div className="profile-overview__identity">
          <Avatar profile={profile} size="lg" />
          <div>
            <div className="profile-overview__name">
              <h2>{profile?.nombre || t("account.userFallback")}</h2>
              <RolePill role={profile?.rol} />
            </div>
            <ul className="profile-overview__meta">
              <li>
                <Mail size={15} aria-hidden="true" />
                {profile?.email}
              </li>
              <li>
                <MapPin size={15} aria-hidden="true" />
                {profile?.direccion || t("account.addressFallback")}
              </li>
              <li>
                <CalendarDays size={15} aria-hidden="true" />
                {t("account.memberSince", {
                  date: formatDate(profile?.fechaRegistro, "—"),
                })}
              </li>
            </ul>
          </div>
        </div>

        <div className="profile-overview__completion">
          <div className="profile-overview__completion-head">
            <span>
              <BadgeCheck size={16} aria-hidden="true" />
              {t("account.completion")}
            </span>
            <strong>{completion}%</strong>
          </div>
          <div
            className="progress-track"
            role="progressbar"
            aria-valuenow={completion}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={t("account.completion")}
          >
            <span style={{ width: `${completion}%` }} />
          </div>
          <p>{t("account.completionHint")}</p>
        </div>

        <div className="profile-overview__role">
          <span className="profile-overview__role-icon" aria-hidden="true">
            <ShieldCheck size={21} />
          </span>
          <div>
            <span>{t("account.role")}</span>
            <strong>{roleLabel(profile?.rol)}</strong>
          </div>
        </div>
      </section>

      {section === "perfil" ? (
        <PersonalInfoForm profile={profile} />
      ) : (
        <div className="stack">
          <PasswordForm />
          <DangerZone profile={profile} />
        </div>
      )}
    </DashboardLayout>
  );
}
