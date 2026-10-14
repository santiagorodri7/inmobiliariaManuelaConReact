import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function AboutPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <>
      <div className="container-fluid bg-light pt-3 d-none d-lg-block">
        <div className="container">
          <div className="row">
            <div className="col-lg-6 text-center text-lg-left mb-2 mb-lg-0">
              <div className="d-inline-flex align-items-center">
                <p>
                  <i className="fa fa-envelope mr-2" />
                  manuelabermudezrealestate@gmail.com
                </p>

                <p className="text-body px-3">|</p>

                <p>
                  <i className="fa fa-phone-alt mr-2" />
                  +57 304 2548683
                </p>
              </div>
            </div>

            <div className="col-lg-6 text-center text-lg-right">
              <div className="d-inline-flex align-items-center">
                <a className="text-primary px-3" href="">
                  <i className="fab fa-facebook-f" />
                </a>

                <a className="text-primary px-3" href="">
                  <i className="fab fa-twitter" />
                </a>

                <a className="text-primary px-3" href="">
                  <i className="fab fa-linkedin-in" />
                </a>

                <a className="text-primary px-3" href="">
                  <i className="fab fa-instagram" />
                </a>

                <a className="text-primary pl-3" href="">
                  <i className="fab fa-youtube" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <nav
        className={
          "navbar navbar-expand-lg bg-white navbar-light shadow-sm fixed-top py-3 py-lg-0 px-3 px-lg-5 transition-navbar"
        }
      >
        <Link
          to="/home.html"
          className="navbar-brand d-flex align-items-center"
        >
          <img
            src="img/LOGOV2.png"
            alt="Manuela Bermudez Logo"
            style={{ maxHeight: "55px" }}
            className="mr-2"
          />

          <h1 className="m-0 text-primary font-weight-bold">
            Manuela Bermudez
          </h1>
        </Link>

        <button
          type="button"
          className="navbar-toggler"
          aria-expanded={menuOpen}
          aria-controls="navbarCollapse"
          aria-label="Abrir o cerrar navegación"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div
          className={`collapse navbar-collapse justify-content-between ${menuOpen ? "show" : ""}`}
          id="navbarCollapse"
        >
          <div className="navbar-nav ml-auto py-0">
            <Link to="/home.html" className="nav-item nav-link animated-link">
              Inicio
            </Link>

            <Link
              to="/service.html"
              className="nav-item nav-link animated-link"
            >
              Servicios
            </Link>

            <Link to="/about.html" className="nav-item nav-link animated-link">
              Nosotros
            </Link>

            <Link
              to="/contact.html"
              className="nav-item nav-link animated-link"
            >
              Contacto
            </Link>
          </div>

          <Link
            to="/login.html"
            className={
              "btn btn-primary btn-cta rounded-pill py-2 px-4 d-none d-lg-block ml-3 font-weight-bold text-white smooth-scroll"
            }
          >
            Inicia sesión
          </Link>
        </div>
      </nav>

      <div
        className={
          "container-fluid page-header about-header d-flex align-items-center"
        }
      >
        <div className="container text-center">
          <span
            className={
              "badge badge-light px-4 py-2 mb-3 rounded-pill d-inline-block"
            }
            style={{
              fontSize: "0.85rem",
              letterSpacing: "2px",
              background: "rgba(255,255,255,0.15)",
              color: "#fff",
              backdropFilter: "blur(6px)",
            }}
          >
            CONÓCENOS
          </span>

          <h1
            className="display-3 text-white font-weight-bold"
            style={{ textShadow: "0 4px 20px rgba(0,0,0,0.15)" }}
          >
            Sobre Nosotros
          </h1>

          <p
            className="lead text-white mt-3"
            style={{ maxWidth: "550px", margin: "0 auto", opacity: "0.85" }}
          >
            {
              "Transparencia, experiencia y compromiso en cada operación inmobiliaria."
            }
          </p>
        </div>
      </div>

      <section className="container-fluid py-5 bg-white">
        <div className="container py-4">
          <div className="row align-items-stretch g-4">
            <div className="col-lg-6 mb-4 mb-lg-0">
              <div className="about-card about-card-mision h-100 p-5">
                <div className="about-card-icon mb-4">
                  <i className="fa fa-bullseye fa-2x text-primary" />
                </div>

                <h3 className="font-weight-bold mb-3">Nuestra Misión</h3>

                <p
                  className="text-muted mb-0"
                  style={{ lineHeight: "1.8", fontSize: "1.05rem" }}
                >
                  {
                    "Brindar asesoría inmobiliaria integral con altos estándares de transparencia, respaldo jurídico y atención personalizada, facilitando a cada cliente la mejor experiencia en la compra, venta o alquiler de su patrimonio."
                  }
                </p>
              </div>
            </div>

            <div className="col-lg-6 mb-4 mb-lg-0">
              <div className="about-card about-card-vision h-100 p-5">
                <div className="about-card-icon mb-4">
                  <i className="fa fa-eye fa-2x text-primary" />
                </div>

                <h3 className="font-weight-bold mb-3">Nuestra Visión</h3>

                <p
                  className="text-muted mb-0"
                  style={{ lineHeight: "1.8", fontSize: "1.05rem" }}
                >
                  {
                    "Ser la inmobiliaria de referencia en Colombia por nuestra ética profesional, innovación en procesos y capacidad de generar valor real para cada persona que confía en nosotros."
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        className="container-fluid py-5"
        style={{ background: "#f8fafc" }}
      >
        <div className="container py-4">
          <div className="row align-items-center">
            <div className="col-lg-6 mb-4 mb-lg-0 pr-lg-5">
              <span
                className="text-primary text-uppercase font-weight-bold small"
                style={{ letterSpacing: "3px" }}
              >
                Quiénes Somos
              </span>

              <h2
                className="display-4 font-weight-bold mt-3"
                style={{ lineHeight: "1.1", color: "#0f172a" }}
              >
                Asesoría premium con claridad,
                <br />
                respaldo y resultados.
              </h2>

              <p className="lead text-muted mt-4" style={{ lineHeight: "1.8" }}>
                {
                  "Acompañamos a compradores, vendedores e inversionistas con procesos transparentes, análisis de mercado preciso y atención dedicada en cada etapa. Nuestro equipo combina experiencia jurídica, comercial y financiera para ofrecerte un servicio 360°."
                }
              </p>

              <div className="d-flex align-items-center mt-4 pt-2">
                <div className="d-flex align-items-center mr-4">
                  <i className="fa fa-check-circle text-primary fa-lg mr-2" />

                  <span className="text-dark font-weight-medium">
                    Procesos transparentes
                  </span>
                </div>

                <div className="d-flex align-items-center">
                  <i className="fa fa-check-circle text-primary fa-lg mr-2" />

                  <span className="text-dark font-weight-medium">
                    Acompañamiento total
                  </span>
                </div>
              </div>
            </div>

            <div className="col-lg-6">
              <img
                src="img/LOGOV2.png"
                alt="Manuela Bermudez"
                className="img-fluid rounded-lg shadow-lg"
                style={{
                  maxHeight: "380px",
                  display: "block",
                  margin: "0 auto",
                  opacity: "0.85",
                }}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="container-fluid py-5 bg-white">
        <div className="container py-4">
          <div className="text-center mb-5">
            <span
              className="text-primary text-uppercase font-weight-bold small"
              style={{ letterSpacing: "3px" }}
            >
              Nuestros Pilares
            </span>

            <h2
              className="display-4 font-weight-bold mt-2"
              style={{ color: "#0f172a" }}
            >
              ¿Por qué elegirnos?
            </h2>

            <p
              className="text-muted mt-3"
              style={{ maxWidth: "600px", margin: "0 auto" }}
            >
              {
                "Cuatro valores que nos diferencian y nos impulsan a dar lo mejor en cada operación."
              }
            </p>
          </div>

          <div className="row g-4">
            <div className="col-lg-3 col-md-6">
              <div className="about-value-card p-4 h-100 text-center">
                <div className="value-icon-wrap mx-auto mb-4">
                  <i className="fa fa-file-contract fa-2x" />
                </div>

                <h5 className="font-weight-bold mb-3">Transparencia</h5>

                <p className="text-muted mb-0">
                  {
                    "Documentación clara, comunicación constante y cero sorpresas en cada etapa del proceso."
                  }
                </p>
              </div>
            </div>

            <div className="col-lg-3 col-md-6">
              <div className="about-value-card p-4 h-100 text-center">
                <div className="value-icon-wrap mx-auto mb-4">
                  <i className="fa fa-chart-line fa-2x" />
                </div>

                <h5 className="font-weight-bold mb-3">Precisión</h5>

                <p className="text-muted mb-0">
                  {
                    "Valoraciones fundamentadas en datos reales y propuestas competitivas alineadas al mercado."
                  }
                </p>
              </div>
            </div>

            <div className="col-lg-3 col-md-6">
              <div className="about-value-card p-4 h-100 text-center">
                <div className="value-icon-wrap mx-auto mb-4">
                  <i className="fa fa-rocket fa-2x" />
                </div>

                <h5 className="font-weight-bold mb-3">Agilidad</h5>

                <p className="text-muted mb-0">
                  {
                    "Procesos optimizados con tecnología y metodologías modernas para evitar demoras."
                  }
                </p>
              </div>
            </div>

            <div className="col-lg-3 col-md-6">
              <div className="about-value-card p-4 h-100 text-center">
                <div className="value-icon-wrap mx-auto mb-4">
                  <i className="fa fa-gavel fa-2x" />
                </div>

                <h5 className="font-weight-bold mb-3">Respaldo</h5>

                <p className="text-muted mb-0">
                  {
                    "Acompañamiento jurídico y comercial permanente antes, durante y después de cada transacción."
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div
        className="container-fluid py-5"
        style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
        }}
      >
        <div className="container py-4 text-center">
          <h2 className="text-white font-weight-bold mb-3">
            ¿Listo para dar el siguiente paso?
          </h2>

          <p
            className="text-white-50 mb-4"
            style={{ maxWidth: "550px", margin: "0 auto" }}
          >
            {
              "Conversemos sobre cómo podemos ayudarte a encontrar la propiedad ideal o vender tu inmueble al mejor precio."
            }
          </p>

          <Link
            to="/contact.html"
            className={
              "btn btn-primary btn-lg rounded-pill py-3 px-5 font-weight-bold shadow-lg"
            }
            style={{ fontSize: "1.05rem" }}
          >
            Contáctanos ahora
            <i className="fa fa-arrow-right ml-2" />
          </Link>
        </div>
      </div>

      <footer className="real-estate-footer pt-5" id="contacto">
        <div className="container pt-4 pb-3">
          <div className="row">
            <div className="col-lg-3 col-md-6 mb-5 pe-lg-4">
              <img
                src="img/LOGOV2.png"
                alt="Manuela Bermudez Logo"
                style={{ maxHeight: "55px" }}
                className="mr-2"
              />
              Inm. Manuela
              <p
                className="text-white-50"
                style={{ lineHeight: "1.8", fontSize: "0.95rem" }}
              >
                {
                  "Tu aliado estratégico en bienes raíces. Brindamos certeza jurídica y oportunidades únicas de inversión con un enfoque profesional y humano."
                }
              </p>
            </div>

            <div className="col-lg-2 col-md-6 mb-5">
              <h5
                className="text-white text-uppercase mb-4"
                style={{
                  letterSpacing: "1px",
                  fontWeight: "600",
                  fontSize: "1rem",
                }}
              >
                Links Rápidos
              </h5>

              <div
                className={
                  "d-flex flex-column justify-content-start footer-links list-unstyled"
                }
              >
                <a className="text-white-50 mb-3" href="#inicio">
                  Inicio
                </a>

                <a className="text-white-50 mb-3" href="#destacadas">
                  Ventas
                </a>

                <a className="text-white-50 mb-3" href="#destacadas">
                  Alquiler
                </a>

                <a className="text-white-50 mb-3" href="#servicios">
                  Servicios
                </a>
              </div>
            </div>

            <div className="col-lg-2 col-md-6 mb-5">
              <h5
                className="text-white text-uppercase mb-4"
                style={{
                  letterSpacing: "1px",
                  fontWeight: "600",
                  fontSize: "1rem",
                }}
              >
                Propiedades
              </h5>

              <div
                className={
                  "d-flex flex-column justify-content-start footer-links list-unstyled"
                }
              >
                <a className="text-white-50 mb-3" href="#">
                  Casas
                </a>

                <a className="text-white-50 mb-3" href="#">
                  Departamentos
                </a>

                <a className="text-white-50 mb-3" href="#">
                  Comercial
                </a>

                <a className="text-white-50" href="#">
                  Terrenos
                </a>
              </div>
            </div>

            <div className="col-lg-2 col-md-6 mb-5">
              <h5
                className="text-white text-uppercase mb-4"
                style={{
                  letterSpacing: "1px",
                  fontWeight: "600",
                  fontSize: "1rem",
                }}
              >
                Legal
              </h5>

              <div
                className={
                  "d-flex flex-column justify-content-start footer-links list-unstyled"
                }
              >
                <a className="text-white-50 mb-3" href="#contacto">
                  Contactos
                </a>

                <a className="text-white-50 mb-3" href="#servicios">
                  Servicios
                </a>

                <a className="text-white-50 mb-3" href="#">
                  Privacidad
                </a>

                <a className="text-white-50" href="#">
                  Términos Uso
                </a>
              </div>
            </div>

            <div className="col-lg-3 col-md-6 mb-5">
              <h5
                className="text-white text-uppercase mb-4"
                style={{
                  letterSpacing: "1px",
                  fontWeight: "600",
                  fontSize: "1rem",
                }}
              >
                Contactanos
              </h5>

              <p className="text-white-50 mb-3 d-flex align-items-center">
                <i className="fa fa-phone-alt text-primary mr-3" />
                {
                  "\n                        +57 304 2548683\n                    "
                }
              </p>

              <p className="text-white-50 mb-4 d-flex align-items-center">
                <i className="fa fa-envelope text-primary mr-3" />
                {
                  "\n                        manuelabermudezrealestate@gmail.com\n                    "
                }
              </p>
              {
                "\n                    \n                   \n                    "
              }
              <div className="d-flex w-100 footer-social">
                <a className="btn btn-outline-light btn-social mr-2" href="#">
                  <i className="fab fa-facebook-f" />
                </a>

                <a
                  className="btn btn-outline-light btn-social mr-2"
                  href={
                    "https://www.instagram.com/manubermu_realtor?igsh=dXUxcTJ4bXZua2w0"
                  }
                >
                  <i className="fab fa-instagram" />
                </a>

                <a className="btn btn-outline-light btn-social mr-2" href="#">
                  <i className="fab fa-linkedin-in" />
                </a>

                <a className="btn btn-outline-light btn-social" href="#">
                  <i className="fab fa-twitter" />
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="container-fluid" style={{ backgroundColor: "#111111" }}>
          <div className="row pt-4 pb-4">
            <div className="col-12 text-center">
              <p className="m-0 text-white-50" style={{ fontSize: "0.9rem" }}>
                ©<span className="text-white">Manuela Bermudez</span>. Todos los
                derechos reservados.
              </p>
            </div>
          </div>
        </div>
      </footer>

      <a href="#" className="btn btn-lg btn-primary btn-lg-square back-to-top">
        <i className="fa fa-angle-double-up" />
      </a>
    </>
  );
}
