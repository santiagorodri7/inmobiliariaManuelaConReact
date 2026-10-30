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
import { usePageTitle } from "../../hooks/usePageTitle.js";
import { accountNav } from "../../config/dashboardNav.js";
import { roleHome, roleLabel } from "../../utils/roles.js";
import { profileCompletion } from "../../utils/users.js";
import { formatDate } from "../../utils/dates.js";

const titles = {
  perfil: "Mi perfil",
  seguridad: "Seguridad de la cuenta",
};

export default function AccountPage() {
  usePageTitle("Mi cuenta", "Gestiona tu perfil y la seguridad de tu cuenta.");
  const { profile } = useAuth();
  const [section, setSection] = useState("perfil");
  const completion = profileCompletion(profile);
  const panelPath = roleHome(profile);

  const navItems = [
    ...accountNav,
    { key: "panel", label: "Mi panel", icon: LayoutDashboard, to: panelPath },
  ];

  return (
    <DashboardLayout
      role={profile?.rol}
      navItems={navItems}
      activeKey={section}
      onNavigate={setSection}
      title={titles[section]}
      subtitle="Tus datos personales y la seguridad de tu cuenta, en un solo lugar."
      actions={
        <Link to={panelPath} className="btn btn-outline-secondary btn-sm dashboard-action">
          Ir a mi panel
          <ArrowUpRight size={15} aria-hidden="true" />
        </Link>
      }
    >
      <section className="profile-overview surface">
        <div className="profile-overview__identity">
          <Avatar profile={profile} size="lg" />
          <div>
            <div className="profile-overview__name">
              <h2>{profile?.nombre || "Usuario"}</h2>
              <RolePill role={profile?.rol} />
            </div>
            <ul className="profile-overview__meta">
              <li>
                <Mail size={15} aria-hidden="true" />
                {profile?.email}
              </li>
              <li>
                <MapPin size={15} aria-hidden="true" />
                {profile?.direccion || "Dirección por completar"}
              </li>
              <li>
                <CalendarDays size={15} aria-hidden="true" />
                Miembro desde {formatDate(profile?.fechaRegistro, "—")}
              </li>
            </ul>
          </div>
        </div>

        <div className="profile-overview__completion">
          <div className="profile-overview__completion-head">
            <span>
              <BadgeCheck size={16} aria-hidden="true" />
              Perfil completado
            </span>
            <strong>{completion}%</strong>
          </div>
          <div
            className="progress-track"
            role="progressbar"
            aria-valuenow={completion}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Perfil completado"
          >
            <span style={{ width: `${completion}%` }} />
          </div>
          <p>
            Completar tu teléfono y dirección nos ayuda a acompañarte mejor
            durante el proceso.
          </p>
        </div>

        <div className="profile-overview__role">
          <span className="profile-overview__role-icon" aria-hidden="true">
            <ShieldCheck size={21} />
          </span>
          <div>
            <span>Rol asignado</span>
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
