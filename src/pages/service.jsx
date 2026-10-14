import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  guardarTestimonio,
  obtenerTestimonios,
} from "../services/testimonials.js";

function testimonialInitials(name) {
  const parts = name.trim().split(/\s+/);
  return parts.length > 1
    ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    : name.slice(0, 2).toUpperCase();
}

function testimonialColor(name) {
  let hash = 0;
  for (const character of name) {
    hash = character.charCodeAt(0) + ((hash << 5) - hash);
  }
  return `hsl(${Math.abs(hash) % 360}, 55%, 45%)`;
}

export default function ServicePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [testimonials, setTestimonials] = useState([]);
  const [isLoadingTestimonials, setIsLoadingTestimonials] = useState(true);
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notice, setNotice] = useState("");
  const [loadError, setLoadError] = useState("");
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

  useEffect(() => {
    let active = true;
    obtenerTestimonios()
      .then((items) => {
        if (active) setTestimonials(items);
      })
      .catch((error) => {
        console.error("No se pudieron cargar los testimonios:", error);
        if (active) setLoadError("No se pudieron cargar los testimonios.");
      })
      .finally(() => {
        if (active) setIsLoadingTestimonials(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const handlePublishTestimonial = async () => {
    setHasAttemptedSubmit(true);
    const cleanName = name.trim();
    const cleanText = text.trim();
    if (cleanName.length < 2 || cleanText.length < 20 || !rating) {
      setNotice("Completa tu nombre, escribe al menos 20 caracteres y selecciona una calificación.");
      return;
    }

    setIsSubmitting(true);
    setNotice("");
    try {
      const id = await guardarTestimonio({
        nombre: cleanName,
        texto: cleanText,
        rating,
      });
      const fecha = new Date().toISOString().split("T")[0];
      setTestimonials((current) => [
        { id, nombre: cleanName, texto: cleanText, rating, fecha },
        ...current,
      ]);
      setName("");
      setText("");
      setRating(0);
      setHasAttemptedSubmit(false);
      setNotice("¡Testimonio publicado! Gracias por tu opinión.");
    } catch (error) {
      console.error("No se pudo publicar el testimonio:", error);
      setNotice(error.message || "No se pudo publicar el testimonio.");
    } finally {
      setIsSubmitting(false);
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

      <div className="container-fluid page-header service-header">
        <div className="container">
          <div
            className={
              "d-flex flex-column align-items-center justify-content-center"
            }
            style={{ minHeight: "400px" }}
          >
            <h3 className="display-4 text-white text-uppercase">Servicios</h3>

            <div className="d-inline-flex text-white"></div>
          </div>
        </div>
      </div>

      <div className="container-fluid py-5">
        <div className="container pt-5 pb-3">
          <div className="text-center mb-5 pb-3">
            <h6
              className="text-primary text-uppercase"
              style={{ letterSpacing: "5px" }}
            >
              Servicios
            </h6>

            <h1
              className="display-4 font-weight-bold"
              style={{ color: "#0f172a" }}
            >
              Servicios Inmobiliarios Premium
            </h1>

            <p className="text-muted col-md-8 mx-auto">
              {
                "Ofrecemos soluciones integrales y profesionales en el sector de bienes raíces con un enfoque transparente, moderno y orientado al cliente."
              }
            </p>
          </div>

          <div className="row">
            <div className="col-lg-4 col-md-6 mb-4">
              <div className="service-card p-5 text-center">
                <div className="service-icon-wrap">
                  <i className="fa fa-2x fa-home" />
                </div>

                <h5 className="mb-3">Compra y Venta de Propiedades</h5>

                <p className="m-0">
                  {
                    "Te ayudamos a encontrar la propiedad de tus sueños o vender tu inmueble al mejor precio del mercado. Contamos con una amplia cartera de clientes y propiedades exclusivas."
                  }
                </p>
              </div>
            </div>

            <div className="col-lg-4 col-md-6 mb-4">
              <div className="service-card p-5 text-center">
                <div className="service-icon-wrap">
                  <i className="fa fa-2x fa-file-contract" />
                </div>

                <h5 className="mb-3">Tramitología y Legalizaciones</h5>

                <p className="m-0">
                  {
                    "Nos encargamos de toda la documentación, contratos, escrituración y legalización de transacciones inmobiliarias con absoluta rigurosidad y transparencia legal."
                  }
                </p>
              </div>
            </div>

            <div className="col-lg-4 col-md-6 mb-4">
              <div className="service-card p-5 text-center">
                <div className="service-icon-wrap">
                  <i className="fa fa-2x fa-building" />
                </div>

                <h5 className="mb-3">Valoración de Inmuebles</h5>

                <p className="m-0">
                  {
                    "Realizamos avalúos técnicos y profesionales para obtener el valor real comercial de tu propiedad, asegurando decisiones de negocio altamente rentables."
                  }
                </p>
              </div>
            </div>

            <div className="col-lg-4 col-md-6 mb-4">
              <div className="service-card p-5 text-center">
                <div className="service-icon-wrap">
                  <i className="fa fa-2x fa-handshake" />
                </div>

                <h5 className="mb-3">Asesoría Inmobiliaria</h5>

                <p className="m-0">
                  {
                    "Nuestros consultores expertos te brindan guía personalizada en inversiones, financiación y estructuración de proyectos residenciales o comerciales."
                  }
                </p>
              </div>
            </div>

            <div className="col-lg-4 col-md-6 mb-4">
              <div className="service-card p-5 text-center">
                <div className="service-icon-wrap">
                  <i className="fa fa-2x fa-list-alt" />
                </div>

                <h5 className="mb-3">Gestión de Propiedades</h5>

                <p className="m-0">
                  {
                    "Administramos tus inmuebles en alquiler, gestionando la relación con inquilinos, mantenimiento correctivo y cobro de rentas para tu tranquilidad."
                  }
                </p>
              </div>
            </div>

            <div className="col-lg-4 col-md-6 mb-4">
              <div className="service-card p-5 text-center">
                <div className="service-icon-wrap">
                  <i className="fa fa-2x fa-search" />
                </div>

                <h5 className="mb-3">Búsqueda Personalizada</h5>

                <p className="m-0">
                  {
                    "Analizamos tus necesidades específicas y presupuesto para buscar de forma exclusiva y dedicada el inmueble ideal, optimizando al máximo tu tiempo."
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section id="testimonios">
        <div className="container">
          <h2 className="testimonios-titulo">Lo que dicen nuestros clientes</h2>

          <p className="testimonios-subtitulo">
            Experiencias reales de personas que confiaron en nosotros
          </p>

          <div id="testimonios-grid" className="testimonios-grid">
            {isLoadingTestimonials ? (
              <p role="status">Cargando testimonios...</p>
            ) : loadError ? (
              <p className="testimonios-vacio" role="alert">{loadError}</p>
            ) : testimonials.length === 0 ? (
              <p className="testimonios-vacio">
                Aún no hay testimonios. ¡Sé el primero!
              </p>
            ) : (
              testimonials.map((item) => {
                const displayName = item.nombre || "Anónimo";
                const stars = Number(item.rating) || 0;
                return (
                  <article className="testimonio-card" key={item.id}>
                    <header className="testimonio-header">
                      <div
                        className="testimonio-avatar"
                        style={{ background: testimonialColor(displayName) }}
                      >
                        {testimonialInitials(displayName)}
                      </div>
                      <div>
                        <p className="testimonio-nombre">{displayName}</p>
                        <p className="testimonio-fecha">{item.fecha || ""}</p>
                      </div>
                    </header>
                    <div className="testimonio-estrellas" aria-label={`${stars} de 5 estrellas`}>
                      {"★".repeat(stars)}
                      <span>{"★".repeat(Math.max(0, 5 - stars))}</span>
                    </div>
                    <p className="testimonio-texto">
                      <span className="testimonio-comilla">“</span>
                      {item.texto || ""}
                    </p>
                  </article>
                );
              })
            )}
          </div>

          <div className="testimonio-form-container">
            <p className="testimonio-form-titulo">Comparte tu experiencia</p>

            <div style={{ marginBottom: "20px" }}>
              <label className="form-field-label" htmlFor="input-nombre-test">
                Tu nombre
              </label>

              <input
                type="text"
                id="input-nombre-test"
                className="form-input-styled"
                placeholder="Ej: María González"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />

              <span
                className={`form-error ${hasAttemptedSubmit && name.trim().length < 2 ? "visible" : ""}`}
                id="error-nombre-test"
              >
                El nombre debe tener mínimo 2 caracteres.
              </span>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label className="form-field-label" htmlFor="input-texto-test">
                Tu experiencia
              </label>

              <textarea
                id="input-texto-test"
                className="form-input-styled"
                placeholder="Cuéntanos cómo fue trabajar con nosotros..."
                value={text}
                onChange={(event) => setText(event.target.value)}
              />

              <span
                className={`form-error ${hasAttemptedSubmit && text.trim().length < 20 ? "visible" : ""}`}
                id="error-texto-test"
              >
                El testimonio debe tener mínimo 20 caracteres.
              </span>
            </div>

            <div style={{ marginBottom: "24px" }}>
              <label className="form-field-label">Tu calificación</label>

              <div
                className={`rating-stars-container ${hasAttemptedSubmit && !rating ? "rating-error" : ""}`}
                id="rating-stars-container"
                onMouseLeave={() => setHoveredRating(0)}
              >
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    className={`rating-star-btn ${rating >= value ? "selected" : ""}`}
                    aria-label={`${value} ${value === 1 ? "estrella" : "estrellas"}`}
                    aria-pressed={rating === value}
                    onMouseEnter={() => setHoveredRating(value)}
                    onClick={() => setRating(value)}
                  >
                    <span
                      style={{
                        color: (hoveredRating || rating) >= value ? "#f59e0b" : "#d1d5db",
                      }}
                    >
                      ★
                    </span>
                  </button>
                ))}
              </div>

              <span className={`form-error ${hasAttemptedSubmit && !rating ? "visible" : ""}`} id="error-rating-test">
                Por favor selecciona una calificación.
              </span>
            </div>

            <button
              type="button"
              id="btn-publicar-test"
              className="btn-publicar"
              disabled={isSubmitting}
              onClick={handlePublishTestimonial}
            >
              {isSubmitting ? "Publicando..." : "Publicar testimonio"}
            </button>
            {notice && <p className="mt-3" role="status">{notice}</p>}
          </div>
        </div>
      </section>

      <div id="toast-testimonio">
        ¡Testimonio publicado! Gracias por tu opinión 🎉
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
