import { Outlet } from "react-router-dom";
import Navbar from "./Navbar.jsx";
import Footer from "./Footer.jsx";
import BackToTop from "./BackToTop.jsx";
import ScrollToTop from "./ScrollToTop.jsx";

export default function PublicLayout() {
  return (
    <>
      <a href="#contenido" className="skip-link">
        Saltar al contenido
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
