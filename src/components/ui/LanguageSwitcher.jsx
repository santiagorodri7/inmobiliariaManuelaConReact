import { Globe2 } from "lucide-react";
import { useI18n } from "../../i18n/I18nContext.jsx";

const options = [
  { code: "es", short: "ES", labelKey: "language.spanish" },
  { code: "en", short: "EN", labelKey: "language.english" },
];

export default function LanguageSwitcher({ className = "" }) {
  const { language, setLanguage, t } = useI18n();

  return (
    <div
      className={`language-switcher ${className}`.trim()}
      role="group"
      aria-label={t("language.label")}
    >
      <Globe2 size={15} aria-hidden="true" />
      {options.map(({ code, short, labelKey }) => (
        <button
          key={code}
          type="button"
          className={`language-switcher__option${
            language === code ? " is-active" : ""
          }`}
          onClick={() => setLanguage(code)}
          aria-pressed={language === code}
          aria-label={t(labelKey)}
          lang={code}
        >
          {short}
        </button>
      ))}
    </div>
  );
}
