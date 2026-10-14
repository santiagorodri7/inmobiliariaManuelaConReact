import React from "react";
import { Link } from "react-router-dom";

export default function WelcomePage() {
  return (
    <>
      <main className="d-flex flex-column justify-content-center align-items-center vh-100 bg-dark text-white text-center">
        <div className="container">
          <img
            src="img/LOGOV2.png"
            alt="Inmobiliaria Manuela Logo"
            className="img-fluid mx-auto d-block mb-4"
            style={{ maxHeight: 150, width: "auto" }}
          />
          <h1 className="display-3 fw-bold mb-4">
            Bienvenido a Inmobiliaria Manuela Bermudez
          </h1>
          <p className="lead mb-5">Encuentra el hogar de tus sueños.</p>
          <Link
            className="btn btn-primary btn-lg px-5 py-3 shadow"
            to="/home.html"
          >
            Explorar Propiedades
          </Link>
          <Link
            className="btn btn-light btn-lg px-5 py-3 shadow ml-3"
            to="/profiles.html"
          >
            Iniciar Sesión
          </Link>
        </div>
      </main>

      <section
        className="container mt-5"
        aria-label="Información de la inmobiliaria"
      >
        <div className="row">
          <article className="col-md-4">
            <div className="card">
              <div className="card-body">
                <h2 className="card-title h5">Sobre Nosotros</h2>
                <p className="card-text">
                  Conoce más sobre nuestra historia y misión en el sector
                  inmobiliario.
                </p>
                <Link to="/about.html" className="btn btn-primary">
                  Leer Más
                </Link>
              </div>
            </div>
          </article>
          <article className="col-md-4">
            <div className="card">
              <div className="card-body">
                <h2 className="card-title h5">Nuestros Servicios</h2>
                <p className="card-text">
                  Descubre los servicios que ofrecemos para ayudarte a encontrar
                  tu hogar ideal.
                </p>
                <Link to="/service.html" className="btn btn-primary">
                  Ver Servicios
                </Link>
              </div>
            </div>
          </article>
          <article className="col-md-4">
            <div className="card">
              <div className="card-body">
                <h2 className="card-title h5">Contacto</h2>
                <p className="card-text">
                  Ponte en contacto con nosotros para cualquier consulta o
                  asistencia.
                </p>
                <Link to="/contact.html" className="btn btn-primary">
                  Contactar
                </Link>
              </div>
            </div>
          </article>
        </div>
      </section>
    </>
  );
}
