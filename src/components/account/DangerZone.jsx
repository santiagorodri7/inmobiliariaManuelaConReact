import { Mail, ShieldAlert } from "lucide-react";
import { mailtoUrl, site } from "../../config/site.js";
import { useI18n } from "../../i18n/I18nContext.jsx";

const EMAIL_TOKEN = "__EMAIL__";

export default function DangerZone({ profile }) {
  const { t } = useI18n();
  const email = profile?.email || "";
  const [beforeEmail, afterEmail] = t("account.danger.deleteText", {
    email: EMAIL_TOKEN,
  }).split(EMAIL_TOKEN);
  const subject = t("account.danger.mailSubject");
  const body = t("account.danger.mailBody", {
    name: site.name,
    email,
    profileName: profile?.nombre || "",
  });

  return (
    <section className="surface danger-zone">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">{t("account.danger.eyebrow")}</p>
          <h2>{t("account.danger.title")}</h2>
        </div>
      </div>
      <div className="danger-zone__body">
        <span className="danger-zone__icon" aria-hidden="true">
          <ShieldAlert size={22} />
        </span>
        <div>
          <h3>{t("account.danger.deleteTitle")}</h3>
          <p>
            {beforeEmail}
            <strong>{email}</strong>
            {afterEmail}
          </p>
          <a
            className="btn btn-outline-secondary btn-sm"
            href={mailtoUrl(subject, body)}
          >
            <Mail size={15} aria-hidden="true" />
            {t("account.danger.request")}
          </a>
        </div>
      </div>
      <p className="danger-zone__note">{t("account.danger.note")}</p>
    </section>
  );
}
