import { Outlet } from "react-router-dom";
import Navbar from "./Navbar.jsx";
import Footer from "./Footer.jsx";
import BackToTop from "./BackToTop.jsx";
import ScrollToTop from "./ScrollToTop.jsx";
import { useI18n } from "../../i18n/I18nContext.jsx";

export default function PublicLayout() {
  const { t } = useI18n();
  return (
    <>
      <a href="#contenido" className="skip-link">
        {t("accessibility.skip")}
      </a>
      <ScrollToTop />
      <Navbar />
      <main id="contenido" className="site-main">
        <Outlet />
      </main>
      <BackToTop />
      <Footer />
    </>
  );
}
