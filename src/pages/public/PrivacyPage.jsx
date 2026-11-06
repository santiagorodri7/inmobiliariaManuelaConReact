import { Link } from "react-router-dom";
import { ShieldAlert } from "lucide-react";
import PageHeader from "../../components/layout/PageHeader.jsx";
import { usePageTitle } from "../../hooks/usePageTitle.js";
import { useI18n } from "../../i18n/I18nContext.jsx";
import { site } from "../../config/site.js";

const sectionKeys = [
  "responsible",
  "data",
  "purpose",
  "testimonials",
  "storage",
  "rights",
  "retention",
];

export default function PrivacyPage() {
  const { t } = useI18n();
  usePageTitle(t("privacy.pageTitle"), t("privacy.pageDescription"));

  const variables = { email: site.email, phone: site.phone };

  return (
    <>
      <PageHeader
        eyebrow={t("privacy.header.eyebrow")}
        title={t("privacy.header.title")}
        description={t("privacy.header.description")}
        breadcrumb={[{ label: t("privacy.header.breadcrumb") }]}
      />

      <section className="section">
        <div className="shell privacy-page">
          <aside className="privacy-notice" role="note">
            <ShieldAlert size={22} aria-hidden="true" />
            <div>
              <strong>{t("privacy.draft.title")}</strong>
              <p>{t("privacy.draft.text")}</p>
            </div>
          </aside>

          <div className="privacy-content">
            {sectionKeys.map((key) => (
              <section key={key}>
                <h2>{t(`privacy.sections.${key}.title`)}</h2>
                <p>{t(`privacy.sections.${key}.text`, variables)}</p>
              </section>
            ))}

            <section className="privacy-contact">
              <h2>{t("privacy.contact.title")}</h2>
              <p>{t("privacy.contact.text", variables)}</p>
              <a
                href={`mailto:${site.email}`}
                className="btn btn-outline-secondary btn-sm"
              >
                {site.email}
              </a>
            </section>

            <Link to="/" className="btn btn-primary btn-sm privacy-back">
              {t("privacy.backHome")}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
