import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { useI18n } from "../../i18n/I18nContext.jsx";

export default function BackToTop() {
  const { t } = useI18n();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 700);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      className="back-to-top"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label={t("accessibility.backToTop")}
    >
      <ArrowUp size={19} aria-hidden="true" />
    </button>
  );
}
