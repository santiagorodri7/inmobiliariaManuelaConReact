import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function VandedorrPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <>
      <div className="container py-5">
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
              alt="Inmobiliaria Manuela Logo"
              style={{ maxHeight: "55px" }}
              className="mr-2"
            />

            <h1 className="m-0 text-primary font-weight-bold">
              Inmobiliaria Manuela
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

              <Link
                to="/about.html"
                className="nav-item nav-link animated-link"
              >
                Nosotros
              </Link>

              <Link
                to="/contact.html"
                className="nav-item nav-link animated-link"
              >
                Contacto
              </Link>
            </div>

            <a
              href="#contacto"
              className={
                "btn btn-primary btn-cta rounded-pill py-2 px-4 d-none d-lg-block ml-3 font-weight-bold text-white smooth-scroll"
              }
            >
              Cuenta
            </a>
          </div>
        </nav>

        <div
          id="inicio"
          className={
            "hero-section position-relative vh-100 d-flex align-items-center"
          }
        >
          <div className="hero-overlay" />

          <div
            className="container position-relative text-center"
            style={{ zIndex: "2", marginTop: "50px" }}
          >
            <h1
              className={
                "display-3 text-white font-weight-bold mb-4 shadow-text"
              }
            >
              Encuentra tu hogar ideal
            </h1>

            <p
              className="text-white mb-5 shadow-text lead w-75 mx-auto"
              style={{ fontSize: "1.25rem" }}
            >
              Conectamos tus sueños con las mejores ubicaciones
            </p>
          </div>
        </div>

        <div className="row">
          <div className="col-lg-4 mb-4">
            <div className="card p-4 shadow-sm">
              <h5 className="card-title mb-3">Publicar Nueva Casa</h5>

              <form id="formCasa">
                <div className="mb-3">
                  <label className="form-label">Dirección</label>

                  <input
                    type="text"
                    id="direccion"
                    className="form-control"
                    placeholder="Ej: Calle 10 #45-20"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">
                    Ubicación (Ciudad/Sector)
                  </label>

                  <input
                    type="text"
                    id="ubicacion"
                    className="form-control"
                    placeholder="Ej: Medellín, Poblado"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Precio ($)</label>

                  <input
                    type="number"
                    id="precio"
                    className="form-control"
                    placeholder="0.00"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Descripción</label>

                  <textarea
                    id="descripcion"
                    className="form-control"
                    rows="3"
                    placeholder="Detalles de la casa..."
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Foto de la Propiedad</label>

                  <input
                    type="file"
                    id="foto"
                    className="form-control"
                    accept="image/*"
                    required
                  />
                </div>

                <button type="submit" className="btn btn-dark w-100">
                  Publicar Propiedad
                </button>
              </form>
            </div>
          </div>

          <div className="col-lg-8">
            <div id="listaCasas" className="row"></div>
          </div>
        </div>
      </div>

      <footer className="real-estate-footer pt-5" id="contacto">
        <div className="container pt-4 pb-3">
          <div className="row">
            <div className="col-lg-3 col-md-6 mb-5 pe-lg-4">
              <img
                src="img/LOGOV2.png"
                alt="Inmobiliaria Manuela Logo"
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

                <a className="btn btn-outline-light btn-social mr-2" href="#">
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
                ©<span className="text-white">Inmobiliaria Manuela</span>. Todos
                los derechos reservados.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
