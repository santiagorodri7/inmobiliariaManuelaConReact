import React, { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

export default function ContactPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchParams] = useSearchParams();
  const [isSending, setIsSending] = useState(false);
  const [submission, setSubmission] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    setIsSending(true);
    setSubmission(null);
    try {
      const response = await fetch(`${import.meta.env.BASE_URL}mail/contact.php`, {
        method: "POST",
        body: new FormData(form),
      });
      if (!response.ok) throw new Error("El servidor no pudo enviar el mensaje.");
      form.reset();
      setSubmission({ success: true, message: "Tu mensaje fue enviado. Gracias por contactarnos." });
    } catch (error) {
      console.error("No se pudo enviar el mensaje de contacto:", error);
      setSubmission({
        success: false,
        message: "No se pudo enviar el mensaje. Inténtalo nuevamente más tarde.",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      <div className="container-fluid bg-light pt-3 d-none d-lg-block">
        <div className="container">
          <div className="row">
            <div className="col-lg-6 text-center text-lg-left mb-2 mb-lg-0">
              <div className="d-inline-flex align-items-center">
                <p>
                  <i className="fa fa-envelope mr-2" />
                  contacto@inmomanuela.com
                </p>

                <p className="text-body px-3">|</p>

                <p>
                  <i className="fa fa-phone-alt mr-2" />
                  +57 300 123 4567
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

      <div className="container-fluid page-header">
        <div className="container">
          <div
            className={
              "d-flex flex-column align-items-center justify-content-center"
            }
            style={{ minHeight: "400px" }}
          >
            <h3 className="display-4 text-white text-uppercase">Contacto</h3>

            <div className="d-inline-flex text-white">
              {
                "\n                   \n                  \n                    \n                "
              }
            </div>
          </div>
        </div>
      </div>

      <div className="container-fluid py-5">
        <div className="container py-5">
          <div className="text-center mb-5 pb-3">
            <h6
              className="text-primary text-uppercase"
              style={{ letterSpacing: "5px" }}
            >
              Contacto
            </h6>

            <h1
              className="display-4 font-weight-bold"
              style={{ color: "#0f172a" }}
            >
              ¿Tienes alguna consulta?
            </h1>

            <p className="text-muted col-md-8 mx-auto">
              {
                "Completa el formulario o contáctanos directamente a través de nuestros canales oficiales. Estamos aquí para guiarte en tu inversión."
              }
            </p>
          </div>

          <div className="row">
            <div className="col-lg-5 mb-5 mb-lg-0">
              <div className="d-flex flex-column h-100 justify-content-between">
                <div
                  className={
                    "contact-info-card p-4 mb-3 d-flex align-items-center"
                  }
                >
                  <div className="contact-icon-wrap mr-4">
                    <i className="fa fa-phone-alt" />
                  </div>

                  <div>
                    <h6
                      className="font-weight-bold mb-1"
                      style={{ color: "#0f172a" }}
                    >
                      Llámanos
                    </h6>

                    <p className="mb-0 text-muted">+57 300 123 4567</p>

                    <small className="text-primary">
                      Atención telefónica y WhatsApp
                    </small>
                  </div>
                </div>

                <div
                  className={
                    "contact-info-card p-4 mb-3 d-flex align-items-center"
                  }
                >
                  <div className="contact-icon-wrap mr-4">
                    <i className="fa fa-envelope" />
                  </div>

                  <div>
                    <h6
                      className="font-weight-bold mb-1"
                      style={{ color: "#0f172a" }}
                    >
                      Escríbenos
                    </h6>

                    <p className="mb-0 text-muted">manuela@inmomanuela.com</p>

                    <small className="text-primary">
                      Respuesta en menos de 2 horas
                    </small>
                  </div>
                </div>

                <div
                  className={
                    "contact-info-card p-4 mb-3 d-flex align-items-center"
                  }
                >
                  <div className="contact-icon-wrap mr-4">
                    <i className="fa fa-map-marker-alt" />
                  </div>

                  <div>
                    <h6
                      className="font-weight-bold mb-1"
                      style={{ color: "#0f172a" }}
                    >
                      Visítanos
                    </h6>

                    <p className="mb-0 text-muted">Sabaneta..?</p>

                    <small className="text-primary">casa de manuela?</small>
                  </div>
                </div>

                <div
                  className={
                    "contact-info-card p-4 mb-3 d-flex align-items-center"
                  }
                >
                  <div className="contact-icon-wrap mr-4">
                    <i className="fa fa-clock" />
                  </div>

                  <div>
                    <h6
                      className="font-weight-bold mb-1"
                      style={{ color: "#0f172a" }}
                    >
                      Horarios de Atención
                    </h6>

                    <p className="mb-0 text-muted">24/7 via WhatsApp</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-7">
              <div className="contact-form-card">
                <form id="contactForm" onSubmit={handleSubmit}>
                  <div className="form-row">
                    <div className="form-group col-sm-6 mb-4">
                      <label
                        className="font-weight-bold text-dark mb-2"
                        htmlFor="name"
                      >
                        Nombre Completo
                      </label>

                      <input
                        type="text"
                        className="form-control premium-input"
                        id="name"
                        name="name"
                        placeholder="Tu Nombre"
                        required
                      />
                    </div>

                    <div className="form-group col-sm-6 mb-4">
                      <label
                        className="font-weight-bold text-dark mb-2"
                        htmlFor="email"
                      >
                        Correo Electrónico
                      </label>

                      <input
                        type="email"
                        className="form-control premium-input"
                        id="email"
                        name="email"
                        placeholder="ejemplo@correo.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group mb-4">
                    <label
                      className="font-weight-bold text-dark mb-2"
                      htmlFor="subject"
                    >
                      Asunto de la Consulta
                    </label>

                    <input
                      type="text"
                      className="form-control premium-input"
                      id="subject"
                      name="subject"
                      placeholder="¿En qué podemos ayudarte?"
                      required
                      defaultValue={searchParams.get("subject") || ""}
                    />
                  </div>

                  <div className="form-group mb-4">
                    <label
                      className="font-weight-bold text-dark mb-2"
                      htmlFor="message"
                    >
                      Mensaje
                    </label>

                    <textarea
                      className="form-control premium-input"
                      rows="5"
                      id="message"
                      name="message"
                      placeholder="Escribe tu mensaje aquí..."
                      required
                    />
                  </div>

                  <div className="text-right">
                    <button
                      className={
                        "btn btn-primary rounded-pill py-3 px-5 font-weight-bold text-white shadow-sm"
                      }
                      type="submit"
                      id="sendMessageButton"
                      disabled={isSending}
                      style={{ transition: "all 0.3s ease" }}
                    >
                      {isSending ? "Enviando..." : "Enviar Mensaje"}
                      <i className="fas fa-paper-plane ml-2" />
                    </button>
                  </div>
                  {submission && (
                    <p
                      className={`alert ${submission.success ? "alert-success" : "alert-danger"} mt-3`}
                      role="status"
                    >
                      {submission.message}
                    </p>
                  )}
                </form>
              </div>
            </div>
          </div>
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
                  "\n                        +57 300 123 4567\n                    "
                }
              </p>

              <p className="text-white-50 mb-4 d-flex align-items-center">
                <i className="fa fa-envelope text-primary mr-3" />
                {
                  "\n                        info@inmomanuela.com\n                    "
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
