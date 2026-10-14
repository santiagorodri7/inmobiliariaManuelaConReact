import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { listAllProperties } from "../services/properties.js";
import featuredProperties from "../data/featuredProperties.js";

function propertyFeatures(property) {
  if (Array.isArray(property.features) && property.features.length > 0) {
    return property.features;
  }

  return [
    { icon: "fa-bed", label: "Habitaciones", value: property.bedrooms || 0 },
    { icon: "fa-bath", label: "Baños", value: property.bathrooms || 0 },
    { icon: "fa-car", label: "Garaje", value: property.garage || 0 },
    {
      icon: "fa-ruler-combined",
      label: "Área",
      value: property.area ? `${property.area} m²` : "No especificada",
    },
    { icon: "fa-map-marker-alt", label: "Ubicación", value: property.location || "No especificada" },
    { icon: "fa-tag", label: "Tipo", value: property.type || "Propiedad" },
  ];
}

export default function PropertyDetailsPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchParams] = useSearchParams();
  const propertyId = searchParams.get("id");
  const [properties, setProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let active = true;
    listAllProperties()
      .then((items) => {
        if (active) setProperties(items);
      })
      .catch((error) => {
        console.error("No se pudieron cargar las propiedades:", error);
        if (active) setLoadError("No se pudieron cargar las propiedades.");
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const property =
    properties.find((item) => String(item.id) === String(propertyId)) ||
    featuredProperties.find((item) => String(item.id) === String(propertyId));
  const features = property ? propertyFeatures(property) : [];
  const amenities =
    property?.amenities?.length > 0
      ? property.amenities
      : [
          property?.type || "Propiedad",
          property?.location || "Ubicación disponible",
          "Consulta con nuestro equipo para más detalles",
        ];

  return (
    <>
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

      <div className="container-fluid pt-5 mt-5">
        <div className="container py-5">
          <div id="property-container">
            {isLoading ? (
              <p role="status">Cargando propiedad...</p>
            ) : loadError && !property ? (
              <div className="alert alert-danger" role="alert">{loadError}</div>
            ) : !property ? (
              <div className="alert alert-danger" role="alert">
                <h4 className="alert-heading">Propiedad no encontrada</h4>
                <p>Lo sentimos, la propiedad que buscas no existe.</p>
                <Link to="/home.html" className="alert-link">Volver al inicio</Link>
              </div>
            ) : (
              <div className="row">
                <div className="col-lg-8 mb-4">
                  <div className="mb-4">
                    <img
                      src={property.imageUrl || property.image || "img/placeholder.png"}
                      alt={property.title || "Propiedad"}
                      className="img-fluid rounded-lg shadow-lg"
                      style={{ maxHeight: "500px", objectFit: "cover", width: "100%" }}
                    />
                  </div>
                  <div className="bg-white p-5 rounded-lg shadow-sm mb-4">
                    <div className="d-flex justify-content-between align-items-start mb-4">
                      <div>
                        <h1 className="text-dark font-weight-bold mb-2">{property.title || "Propiedad"}</h1>
                        <p className="text-muted mb-0">
                          <i className="fa fa-map-marker-alt text-primary mr-2" />
                          {property.location || "Ubicación no especificada"}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="badge badge-primary p-2 mb-2">{property.type || "Propiedad"}</span>
                        <br />
                        <span className={`badge badge-${property.status === "Venta" ? "success" : "info"} p-2`}>
                          {property.status || "En Venta"}
                        </span>
                      </div>
                    </div>
                    <hr />
                    <h2 className="text-primary font-weight-bold mb-3">
                      ${Number(property.price || 0).toLocaleString("es-CO")}{" "}
                      <span className="small text-muted">COP</span>
                    </h2>
                    <h5 className="font-weight-bold mb-3">Descripción</h5>
                    <p className="text-muted lead">
                      {property.description || "Descripción no disponible por el momento."}
                    </p>
                  </div>
                  <div className="bg-white p-5 rounded-lg shadow-sm mb-4">
                    <h4 className="font-weight-bold mb-4">Características</h4>
                    <div className="row">
                      {features.map((feature, index) => (
                        <div className="col-md-6 mb-3" key={`${feature.label}-${index}`}>
                          <div className="d-flex align-items-center">
                            <i className={`fas ${feature.icon} text-primary fa-lg mr-3`} style={{ minWidth: "30px" }} />
                            <div>
                              <p className="mb-0 text-muted small">{feature.label}</p>
                              <strong className="text-dark">{feature.value}</strong>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-white p-5 rounded-lg shadow-sm">
                    <h4 className="font-weight-bold mb-4">Comodidades</h4>
                    <ul className="list-unstyled">
                      {amenities.map((amenity, index) => (
                        <li className="mb-2" key={`${amenity}-${index}`}>
                          <i className="fas fa-check text-primary mr-2" />
                          <span className="text-dark">{amenity}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="col-lg-4">
                  <div className="bg-primary text-white p-4 rounded-lg shadow-sm mb-4">
                    <h5 className="font-weight-bold mb-4">¿Interesado en esta propiedad?</h5>
                    <p>Escríbenos para recibir más información o agendar una visita.</p>
                    <Link
                      to={`/contact.html?subject=${encodeURIComponent(`Consulta por: ${property.title || "propiedad"}`)}`}
                      className="btn btn-light btn-block font-weight-bold"
                    >
                      Contactar
                    </Link>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
                    <h5 className="font-weight-bold mb-3 text-dark">Información de Contacto</h5>
                    <p className="text-dark font-weight-bold">+57 300 123 4567</p>
                    <p className="text-dark font-weight-bold">contacto@inmomanuela.com</p>
                    <p className="text-dark font-weight-bold">Medellín, Colombia</p>
                  </div>
                </div>
              </div>
            )}
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

      <a href="#" className="btn btn-lg btn-primary btn-lg-square back-to-top">
        <i className="fa fa-angle-double-up" />
      </a>
    </>
  );
}
