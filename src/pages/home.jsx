import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  obtenerUsuarioActual,
  verificarEstadoSesion,
} from "../services/auth.js";
import { listAllProperties } from "../services/properties.js";

const LOCATION_EXAMPLES = [
  "Mansión en Santa Fe",
  "Apartamento en Itagüí",
  "Casa en Medellín",
  "Penthouse en El Poblado",
  "Lote en Llano Grande",
  "Apartaestudio en Laureles",
];

function matchesProperty(property, filters) {
  const location = String(property.location || "").toLocaleLowerCase("es");
  const type = String(property.type || "").toLocaleLowerCase("es");
  const query = filters.location.trim().toLocaleLowerCase("es");
  const bedrooms = Number(property.bedrooms ?? 99);
  const price = Number(property.price || 0);
  const selectedType = filters.type.toLocaleLowerCase("es");

  return (
    (!query || location.includes(query)) &&
    (!selectedType || type.includes(selectedType)) &&
    (filters.bedrooms === "todas" || bedrooms >= Number(filters.bedrooms)) &&
    (filters.price === "ilimitado" || price <= Number(filters.price))
  );
}

function RemotePropertyCard({ property }) {
  const type = String(property.type || "Propiedad").toLocaleLowerCase("es");
  const filterType = type === "oficina comercial" ? "oficina" : type;

  return (
    <article
      className="col-lg-4 col-md-6 mb-4 property-item"
      data-ubicacion={property.location || ""}
      data-tipo={filterType}
      data-habitaciones={property.bedrooms ?? 99}
      data-precio={Number(property.price || 0)}
    >
      <div className="property-card bg-white rounded-lg shadow-sm overflow-hidden h-100 d-flex flex-column">
        <div className="position-relative overflow-hidden property-img">
          <img
            className="img-fluid w-100 h-100"
            src={property.imageUrl || "img/placeholder.png"}
            alt={property.title || "Propiedad"}
            loading="lazy"
          />
          <span className="badge-status bg-success text-white position-absolute font-weight-bold px-3 py-1 rounded">
            {property.type || "Propiedad"}
          </span>
        </div>
        <div className="p-4 d-flex flex-column flex-grow-1">
          <h3 className="h4 text-primary font-weight-bold mb-2">
            ${Number(property.price || 0).toLocaleString("es-CO")}{" "}
            <span className="small text-muted font-weight-normal">COP</span>
          </h3>
          <h4 className="h5 font-weight-bold mb-2 text-dark property-title">
            {property.title || "Propiedad"}
          </h4>
          <p className="text-muted mb-3">
            <i className="fa fa-map-marker-alt text-primary mr-2" />
            {property.location || "Ubicación disponible"}
          </p>
          <p className="text-muted small mb-4 flex-grow-1">
            {property.description || ""}
          </p>
          <Link
            to={`/property-details.html?id=${encodeURIComponent(property.id)}`}
            className="btn btn-outline-primary btn-block rounded py-2 font-weight-bold"
          >
            Ver Detalles
          </Link>
        </div>
      </div>
    </article>
  );
}

export default function HomePage() {
  const [filters, setFilters] = useState({
    location: "",
    type: "",
    bedrooms: "todas",
    price: "ilimitado",
  });
  const [remoteProperties, setRemoteProperties] = useState([]);
  const [userRole, setUserRole] = useState("");
  const [locationExample, setLocationExample] = useState(0);
  const [hasSearched, setHasSearched] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    const unsubscribe = verificarEstadoSesion(async (firebaseUser) => {
      if (!firebaseUser) {
        setUserRole("");
        return;
      }
      try {
        const profile = await obtenerUsuarioActual();
        setUserRole(String(profile?.rol || "").toLocaleLowerCase("es"));
      } catch (error) {
        console.error("No se pudo cargar el perfil de usuario:", error);
        setLoadError("No se pudo cargar el perfil de tu cuenta.");
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    let active = true;
    listAllProperties()
      .then((items) => {
        if (active) setRemoteProperties(items);
      })
      .catch((error) => {
        console.error("No se pudieron cargar las propiedades:", error);
        if (active) setLoadError("No se pudieron actualizar las propiedades.");
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setLocationExample((index) => (index + 1) % LOCATION_EXAMPLES.length);
    }, 2500);
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const visibleRemoteProperties = useMemo(
    () => remoteProperties.filter((item) => matchesProperty(item, filters)),
    [remoteProperties, filters],
  );
  const staticProperties = [
    {
      location: "El Poblado",
      type: "departamento",
      bedrooms: 3,
      price: 4500000,
    },
    { location: "Laureles", type: "casa", bedrooms: 4, price: 3800000 },
    { location: "Envigado", type: "departamento", bedrooms: 2, price: 2500000 },
    { location: "Sabaneta", type: "departamento", bedrooms: 3, price: 2800000 },
    { location: "Bello", type: "casa", bedrooms: 3, price: 1500000 },
    { location: "Rionegro", type: "terreno", bedrooms: 0, price: 800000 },
    { location: "Itagüí", type: "departamento", bedrooms: 2, price: 1800000 },
    { location: "La Estrella", type: "casa", bedrooms: 4, price: 3200000 },
    { location: "Copacabana", type: "terreno", bedrooms: 0, price: 900000 },
  ];
  const visibleCount = remoteProperties.length
    ? visibleRemoteProperties.length
    : staticProperties.filter((item) => matchesProperty(item, filters)).length;

  const updateFilter = (field) => (event) => {
    setFilters((current) => ({ ...current, [field]: event.target.value }));
    setHasSearched(true);
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    setHasSearched(true);
    document
      .getElementById("destacadas")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <nav
        className={`navbar navbar-expand-lg bg-white navbar-light fixed-top px-3 px-lg-5 transition-navbar ${
          scrolled ? "shadow-sm py-2" : "py-3 py-lg-0"
        }`}
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
            Manuela Bermudez Realtor
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
          className={`collapse navbar-collapse justify-content-between ${
            menuOpen ? "show" : ""
          }`}
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
            to={
              userRole === "comprador"
                ? "/buyer.html"
                : userRole === "vendedor"
                  ? "/seller.html"
                  : userRole === "admin" || userRole === "administrador"
                    ? "/admin.html"
                    : "/profiles.html"
            }
            className={
              "btn btn-primary btn-cta rounded-pill py-2 px-4 d-none d-lg-block ml-3 font-weight-bold text-white smooth-scroll"
            }
          >
            {userRole ? "Administrar Cuenta" : "Inicia sesión"}
          </Link>

          {(userRole === "admin" || userRole === "administrador") && (
            <Link to="/admin.html" className="btn-admin-panel ml-3">
              <i className="fas fa-shield-alt mr-2" />
              Panel Admin
            </Link>
          )}
        </div>
      </nav>

      <div id="inicio" className="hero-section position-relative">
        <div className="hero-visual-wrapper">
          <video
            className="hero-background-video"
            src="img/BANNERV4.mp4"
            poster="img/BANNERV3.png"
            autoPlay
            muted
            loop
            playsInline
            aria-hidden="true"
          />

          <div className="atmosphere-overlay" />

          <div className="vignette-overlay" />

          <div className="scanline-overlay" />
        </div>

        <div
          className={
            "hero-content-wrapper d-flex flex-column justify-content-between h-100 text-center"
          }
        >
          <div
            className="hero-top-block container mt-auto mb-auto"
            style={{ pointerEvents: "auto" }}
          >
            <span className="hero-tagline d-block text-uppercase">
              Manuela Bermudez Realtor
            </span>
          </div>

          <div
            className="hero-bottom-block container mt-auto"
            style={{ pointerEvents: "auto" }}
          >
            <div
              className={
                "d-flex flex-column flex-sm-row justify-content-center align-items-center mb-5"
              }
              style={{ gap: "16px" }}
            >
              <a
                href="#destacadas"
                className="btn btn-hero-primary smooth-scroll"
              >
                Explorar propiedades
              </a>

              <Link to="/service.html" className="btn btn-hero-secondary">
                Ver servicios
              </Link>
            </div>
          </div>

          <div
            className="hero-scroll-indicator"
            style={{ pointerEvents: "auto" }}
          >
            <span className="scroll-text d-block">SCROLL</span>

            <div className="scroll-line" />
          </div>
        </div>
      </div>

      <div
        className="container search-container"
        style={{ marginTop: "-120px", position: "relative", zIndex: "10" }}
      >
        <div className="bg-white rounded-lg shadow-lg p-4 p-md-5 search-card">
          <h4 className="text-primary font-weight-bold mb-4">
            Busca tu próxima propiedad
          </h4>

          <form id="searchForm" onSubmit={handleSearchSubmit}>
            <div className="row align-items-end">
              <div className="col-lg-3 col-md-6 mb-3 mb-lg-0">
                <label
                  className={
                    "font-weight-bold text-primary small text-uppercase"
                  }
                  htmlFor="ubicacionInput"
                >
                  Ubicación
                </label>

                <input
                  type="text"
                  className="form-control bg-light border-0 py-3"
                  id="ubicacionInput"
                  placeholder={`Ej: ${LOCATION_EXAMPLES[locationExample]}`}
                  value={filters.location}
                  onChange={updateFilter("location")}
                />
              </div>

              <div className="col-lg-3 col-md-6 mb-3 mb-lg-0">
                <label
                  className={
                    "font-weight-bold text-primary small text-uppercase"
                  }
                  htmlFor="tipo"
                >
                  Tipo de Inmueble
                </label>

                <select
                  className="form-control bg-light border-0 py-3"
                  id="tipo"
                  value={filters.type}
                  onChange={updateFilter("type")}
                >
                  <option value="">Cualquier tipo</option>

                  <option value="casa">Casa</option>

                  <option value="departamento">Departamento</option>

                  <option value="terreno">Terreno</option>

                  <option value="oficina">Oficina Comercial</option>
                </select>
              </div>

              <div className="col-lg-2 col-md-6 mb-3 mb-lg-0">
                <label
                  className={
                    "font-weight-bold text-primary small text-uppercase"
                  }
                  htmlFor="habitaciones"
                >
                  Habitaciones
                </label>

                <select
                  className="form-control bg-light border-0 py-3"
                  id="habitaciones"
                  value={filters.bedrooms}
                  onChange={updateFilter("bedrooms")}
                >
                  <option value="todas">Todas</option>

                  <option value="1">1 o más</option>

                  <option value="2">2 o más</option>

                  <option value="3">3 o más</option>

                  <option value="4">4 o más</option>
                </select>
              </div>

              <div className="col-lg-2 col-md-6 mb-3 mb-lg-0">
                <label
                  className={
                    "font-weight-bold text-primary small text-uppercase"
                  }
                  htmlFor="precio"
                >
                  Rango de Precio
                </label>

                <select
                  className="form-control bg-light border-0 py-3"
                  id="precio"
                  value={filters.price}
                  onChange={updateFilter("price")}
                >
                  <option value="ilimitado">Sin límite</option>

                  <option value="1000000">Hasta $1M COP</option>

                  <option value="3000000">Hasta $3M COP</option>

                  <option value="5000000">Hasta $5M COP</option>

                  <option value="10000000">Hasta $10M COP</option>
                </select>
              </div>

              <div className="col-lg-2 mt-3 mt-lg-0">
                <button
                  className={
                    "btn btn-primary btn-block py-3 font-weight-bold shadow-sm d-flex align-items-center justify-content-center text-white submit-btn"
                  }
                  type="submit"
                >
                  Buscar
                  <i className="fa fa-search ml-2" />
                </button>
              </div>
            </div>

            <div
              id="search-feedback"
              className={`mt-4 text-center p-3 rounded font-weight-bold ${
                hasSearched ? "d-block" : "d-none"
              } ${visibleCount ? "alert alert-success" : "alert alert-info"}`}
              role="status"
              aria-live="polite"
            >
              {loadError ||
                (visibleCount
                  ? `¡Encontramos ${visibleCount} propiedad(es)!`
                  : "No encontramos propiedades. Intenta cambiar los filtros.")}
            </div>
          </form>
        </div>
      </div>

      <div id="destacadas" className="container-fluid bg-light py-5">
        <div className="container py-5">
          <div className="text-center mb-5 pb-3">
            <h6
              className="text-primary text-uppercase font-weight-bold"
              style={{ letterSpacing: "2px" }}
            >
              Catálogo Seleccionado
            </h6>

            <h2 className="display-4 font-weight-bold text-dark">
              Nuestras Propiedades
            </h2>
          </div>

          <div className="row" id="property-grid">
            {remoteProperties.length > 0 &&
              visibleRemoteProperties.map((property) => (
                <RemotePropertyCard key={property.id} property={property} />
              ))}
            <div
              className="col-lg-4 col-md-6 mb-4 property-item"
              data-ubicacion="El Poblado"
              data-tipo="departamento"
              data-habitaciones="3"
              data-precio="4500000"
              hidden={
                remoteProperties.length > 0 ||
                !matchesProperty(
                  {
                    location: "El Poblado",
                    type: "departamento",
                    bedrooms: 3,
                    price: 4500000,
                  },
                  filters,
                )
              }
            >
              <div
                className={
                  "property-card bg-white rounded-lg shadow-sm overflow-hidden h-100 d-flex flex-column"
                }
              >
                <div
                  className="position-relative overflow-hidden property-img"
                  style={{ height: "250px" }}
                >
                  <img
                    className="img-fluid w-100 h-100"
                    src="img/destination-1.png"
                    alt="Propiedad"
                    style={{ objectFit: "cover" }}
                  />

                  <div
                    className={
                      "badge-status bg-success text-white position-absolute font-weight-bold px-3 py-1 rounded"
                    }
                  />
                </div>

                <div className="p-4 d-flex flex-column flex-grow-1">
                  <h4 className="text-primary font-weight-bold mb-2">
                    $950,000,000
                    <span className="small text-muted font-weight-normal">
                      COP
                    </span>
                  </h4>

                  <h5 className="font-weight-bold mb-2 text-dark property-title">
                    Terraza del Sol
                  </h5>

                  <p className="text-muted mb-4">
                    <i className="fa fa-map-marker-alt text-primary mr-2" />
                    El Poblado
                  </p>
                  {
                    "\n                            \n                            "
                  }
                  <div className="mt-auto">
                    <div
                      className={
                        "d-flex justify-content-between mb-4 pt-3 border-top border-light"
                      }
                    >
                      <span className="property-specs text-muted font-weight-bold">
                        <i className="fa fa-bed text-primary mr-1" />3
                      </span>

                      <span className="property-specs text-muted font-weight-bold">
                        <i className="fa fa-bath text-primary mr-1" />3
                      </span>

                      <span className="property-specs text-muted font-weight-bold">
                        <i className="fa fa-car text-primary mr-1" />2
                      </span>

                      <span className="property-specs text-muted font-weight-bold">
                        <i className="fa fa-ruler-combined text-primary mr-1" />
                        250m²
                      </span>
                    </div>

                    <Link
                      to="/property-details.html?id=1"
                      className={
                        "btn btn-outline-primary btn-block rounded py-2 font-weight-bold w-100"
                      }
                    >
                      Ver Detalles
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <div
              className="col-lg-4 col-md-6 mb-4 property-item"
              data-ubicacion="Laureles"
              data-tipo="casa"
              data-habitaciones="4"
              data-precio="3800000"
              hidden={
                remoteProperties.length > 0 ||
                !matchesProperty(
                  {
                    location: "Laureles",
                    type: "casa",
                    bedrooms: 4,
                    price: 3800000,
                  },
                  filters,
                )
              }
            >
              <div
                className={
                  "property-card bg-white rounded-lg shadow-sm overflow-hidden h-100 d-flex flex-column"
                }
              >
                <div
                  className="position-relative overflow-hidden property-img"
                  style={{ height: "250px" }}
                >
                  <img
                    className="img-fluid w-100 h-100"
                    src="img/destination-2.png"
                    alt="Propiedad"
                    style={{ objectFit: "cover" }}
                  />

                  <div
                    className={
                      "badge-status bg-success text-white position-absolute font-weight-bold px-3 py-1 rounded"
                    }
                  />
                </div>

                <div className="p-4 d-flex flex-column flex-grow-1">
                  <h4 className="text-primary font-weight-bold mb-2">
                    $849,900,000
                    <span className="small text-muted font-weight-normal">
                      COP
                    </span>
                  </h4>

                  <h5 className="font-weight-bold mb-2 text-dark property-title">
                    La Blanca Señorial
                  </h5>

                  <p className="text-muted mb-4">
                    <i className="fa fa-map-marker-alt text-primary mr-2" />
                    Laureles
                  </p>
                  {
                    "\n                            \n                            "
                  }
                  <div className="mt-auto">
                    <div
                      className={
                        "d-flex justify-content-between mb-4 pt-3 border-top border-light"
                      }
                    >
                      <span className="property-specs text-muted font-weight-bold">
                        <i className="fa fa-bed text-primary mr-1" />4
                      </span>

                      <span className="property-specs text-muted font-weight-bold">
                        <i className="fa fa-bath text-primary mr-1" />3
                      </span>

                      <span className="property-specs text-muted font-weight-bold">
                        <i className="fa fa-car text-primary mr-1" />2
                      </span>

                      <span className="property-specs text-muted font-weight-bold">
                        <i className="fa fa-ruler-combined text-primary mr-1" />
                        300m²
                      </span>
                    </div>

                    <Link
                      to="/property-details.html?id=2"
                      className={
                        "btn btn-outline-primary btn-block rounded py-2 font-weight-bold w-100"
                      }
                    >
                      Ver Detalles
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <div
              className="col-lg-4 col-md-6 mb-4 property-item"
              data-ubicacion="Envigado"
              data-tipo="departamento"
              data-habitaciones="2"
              data-precio="2500000"
              hidden={
                remoteProperties.length > 0 ||
                !matchesProperty(
                  {
                    location: "Envigado",
                    type: "departamento",
                    bedrooms: 2,
                    price: 2500000,
                  },
                  filters,
                )
              }
            >
              <div
                className={
                  "property-card bg-white rounded-lg shadow-sm overflow-hidden h-100 d-flex flex-column"
                }
              >
                <div
                  className="position-relative overflow-hidden property-img"
                  style={{ height: "250px" }}
                >
                  <img
                    className="img-fluid w-100 h-100"
                    src="img/destination-3.png"
                    alt="Propiedad"
                    style={{ objectFit: "cover" }}
                  />

                  <div
                    className={
                      "badge-status bg-success text-white position-absolute font-weight-bold px-3 py-1 rounded"
                    }
                  >
                    Renta
                  </div>
                </div>

                <div className="p-4 d-flex flex-column flex-grow-1">
                  <h4 className="text-primary font-weight-bold mb-2">
                    $799,999,999
                    <span className="small text-muted font-weight-normal">
                      COP
                    </span>
                  </h4>

                  <h5 className="font-weight-bold mb-2 text-dark property-title">
                    Rancho Los Girasoles
                  </h5>

                  <p className="text-muted mb-4">
                    <i className="fa fa-map-marker-alt text-primary mr-2" />
                    Envigado
                  </p>
                  {
                    "\n                            \n                            "
                  }
                  <div className="mt-auto">
                    <div
                      className={
                        "d-flex justify-content-between mb-4 pt-3 border-top border-light"
                      }
                    >
                      <span className="property-specs text-muted font-weight-bold">
                        <i className="fa fa-bed text-primary mr-1" />2
                      </span>

                      <span className="property-specs text-muted font-weight-bold">
                        <i className="fa fa-bath text-primary mr-1" />2
                      </span>

                      <span className="property-specs text-muted font-weight-bold">
                        <i className="fa fa-car text-primary mr-1" />1
                      </span>

                      <span className="property-specs text-muted font-weight-bold">
                        <i className="fa fa-ruler-combined text-primary mr-1" />
                        90m²
                      </span>
                    </div>

                    <Link
                      to="/property-details.html?id=3"
                      className={
                        "btn btn-outline-primary btn-block rounded py-2 font-weight-bold w-100"
                      }
                    >
                      Ver Detalles
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <div
              className="col-lg-4 col-md-6 mb-4 property-item"
              data-ubicacion="Sabaneta"
              data-tipo="departamento"
              data-habitaciones="3"
              data-precio="2800000"
              hidden={
                remoteProperties.length > 0 ||
                !matchesProperty(
                  {
                    location: "Sabaneta",
                    type: "departamento",
                    bedrooms: 3,
                    price: 2800000,
                  },
                  filters,
                )
              }
            >
              <div
                className={
                  "property-card bg-white rounded-lg shadow-sm overflow-hidden h-100 d-flex flex-column"
                }
              >
                <div
                  className="position-relative overflow-hidden property-img"
                  style={{ height: "250px" }}
                >
                  <img
                    className="img-fluid w-100 h-100"
                    src="img/destination-4.png"
                    alt="Propiedad"
                    style={{ objectFit: "cover" }}
                  />

                  <div
                    className={
                      "badge-status bg-success text-white position-absolute font-weight-bold px-3 py-1 rounded"
                    }
                  />
                </div>

                <div className="p-4 d-flex flex-column flex-grow-1">
                  <h4 className="text-primary font-weight-bold mb-2">
                    $829,999,999
                    <span className="small text-muted font-weight-normal">
                      COP
                    </span>
                  </h4>

                  <h5 className="font-weight-bold mb-2 text-dark property-title">
                    El Rincón de las Flores
                  </h5>

                  <p className="text-muted mb-4">
                    <i className="fa fa-map-marker-alt text-primary mr-2" />
                    Sabaneta
                  </p>
                  {
                    "\n                            \n                            "
                  }
                  <div className="mt-auto">
                    <div
                      className={
                        "d-flex justify-content-between mb-4 pt-3 border-top border-light"
                      }
                    >
                      <span className="property-specs text-muted font-weight-bold">
                        <i className="fa fa-bed text-primary mr-1" />3
                      </span>

                      <span className="property-specs text-muted font-weight-bold">
                        <i className="fa fa-bath text-primary mr-1" />2
                      </span>

                      <span className="property-specs text-muted font-weight-bold">
                        <i className="fa fa-car text-primary mr-1" />1
                      </span>

                      <span className="property-specs text-muted font-weight-bold">
                        <i className="fa fa-ruler-combined text-primary mr-1" />
                        110m²
                      </span>
                    </div>

                    <Link
                      to="/property-details.html?id=4"
                      className={
                        "btn btn-outline-primary btn-block rounded py-2 font-weight-bold w-100"
                      }
                    >
                      Ver Detalles
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <div
              className="col-lg-4 col-md-6 mb-4 property-item"
              data-ubicacion="Bello"
              data-tipo="casa"
              data-habitaciones="3"
              data-precio="1500000"
              hidden={
                remoteProperties.length > 0 ||
                !matchesProperty(
                  {
                    location: "Bello",
                    type: "casa",
                    bedrooms: 3,
                    price: 1500000,
                  },
                  filters,
                )
              }
            >
              <div
                className={
                  "property-card bg-white rounded-lg shadow-sm overflow-hidden h-100 d-flex flex-column"
                }
              >
                <div
                  className="position-relative overflow-hidden property-img"
                  style={{ height: "250px" }}
                >
                  <img
                    className="img-fluid w-100 h-100"
                    src="img/destination-5.png"
                    alt="Propiedad"
                    style={{ objectFit: "cover" }}
                  />

                  <div
                    className={
                      "badge-status bg-success text-white position-absolute font-weight-bold px-3 py-1 rounded"
                    }
                  >
                    Renta
                  </div>
                </div>

                <div className="p-4 d-flex flex-column flex-grow-1">
                  <h4 className="text-primary font-weight-bold mb-2">
                    $1,199,999,999
                    <span className="small text-muted font-weight-normal">
                      COP
                    </span>
                  </h4>

                  <h5 className="font-weight-bold mb-2 text-dark property-title">
                    Torre de Arcilla
                  </h5>

                  <p className="text-muted mb-4">
                    <i className="fa fa-map-marker-alt text-primary mr-2" />
                    Bello
                  </p>
                  {
                    "\n                            \n                            "
                  }
                  <div className="mt-auto">
                    <div
                      className={
                        "d-flex justify-content-between mb-4 pt-3 border-top border-light"
                      }
                    >
                      <span className="property-specs text-muted font-weight-bold">
                        <i className="fa fa-bed text-primary mr-1" />3
                      </span>

                      <span className="property-specs text-muted font-weight-bold">
                        <i className="fa fa-bath text-primary mr-1" />2
                      </span>

                      <span className="property-specs text-muted font-weight-bold">
                        <i className="fa fa-car text-primary mr-1" />1
                      </span>

                      <span className="property-specs text-muted font-weight-bold">
                        <i className="fa fa-ruler-combined text-primary mr-1" />
                        120m²
                      </span>
                    </div>

                    <Link
                      to="/property-details.html?id=5"
                      className={
                        "btn btn-outline-primary btn-block rounded py-2 font-weight-bold w-100"
                      }
                    >
                      Ver Detalles
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <div
              className="col-lg-4 col-md-6 mb-4 property-item"
              data-ubicacion="Rionegro"
              data-tipo="terreno"
              data-habitaciones="0"
              data-precio="800000"
              hidden={
                remoteProperties.length > 0 ||
                !matchesProperty(
                  {
                    location: "Rionegro",
                    type: "terreno",
                    bedrooms: 0,
                    price: 800000,
                  },
                  filters,
                )
              }
            >
              <div
                className={
                  "property-card bg-white rounded-lg shadow-sm overflow-hidden h-100 d-flex flex-column"
                }
              >
                <div
                  className="position-relative overflow-hidden property-img"
                  style={{ height: "250px" }}
                >
                  <img
                    className="img-fluid w-100 h-100"
                    src="img/destination-6.png"
                    alt="Propiedad"
                    style={{ objectFit: "cover" }}
                  />

                  <div
                    className={
                      "badge-status bg-success text-white position-absolute font-weight-bold px-3 py-1 rounded"
                    }
                  >
                    Renta
                  </div>
                </div>

                <div className="p-4 d-flex flex-column flex-grow-1">
                  <h4 className="text-primary font-weight-bold mb-2">
                    $899,999,990,000
                    <span className="small text-muted font-weight-normal">
                      COP / mes
                    </span>
                  </h4>

                  <h5 className="font-weight-bold mb-2 text-dark property-title">
                    Refugio de la Montaña
                  </h5>

                  <p className="text-muted mb-4">
                    <i className="fa fa-map-marker-alt text-primary mr-2" />
                    Rionegro
                  </p>
                  {
                    "\n                            \n                            "
                  }
                  <div className="mt-auto">
                    <div
                      className={
                        "d-flex justify-content-between mb-4 pt-3 border-top border-light"
                      }
                    >
                      <span className="property-specs text-muted font-weight-bold">
                        <i className="fa fa-cube text-primary mr-1" />
                        Lote
                      </span>

                      <span className="property-specs text-muted font-weight-bold">
                        <i className="fa fa-ruler-combined text-primary mr-1" />
                        500m²
                      </span>
                    </div>

                    <Link
                      to="/property-details.html?id=6"
                      className={
                        "btn btn-outline-primary btn-block rounded py-2 font-weight-bold w-100"
                      }
                    >
                      Ver Detalles
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <div
              className="col-lg-4 col-md-6 mb-4 property-item"
              data-ubicacion="Itagüí"
              data-tipo="departamento"
              data-habitaciones="2"
              data-precio="1800000"
              hidden={
                remoteProperties.length > 0 ||
                !matchesProperty(
                  {
                    location: "Itagüí",
                    type: "departamento",
                    bedrooms: 2,
                    price: 1800000,
                  },
                  filters,
                )
              }
            >
              <div
                className={
                  "property-card bg-white rounded-lg shadow-sm overflow-hidden h-100 d-flex flex-column"
                }
              >
                <div
                  className="position-relative overflow-hidden property-img"
                  style={{ height: "250px" }}
                >
                  <img
                    className="img-fluid w-100 h-100"
                    src="img/itagui.png"
                    alt="Propiedad"
                    style={{ objectFit: "cover" }}
                  />

                  <div
                    className={
                      "badge-status bg-success text-white position-absolute font-weight-bold px-3 py-1 rounded"
                    }
                  >
                    Renta
                  </div>
                </div>

                <div className="p-4 d-flex flex-column flex-grow-1">
                  <h4 className="text-primary font-weight-bold mb-2">
                    $1,800,000,000
                    <span className="small text-muted font-weight-normal">
                      COP
                    </span>
                  </h4>

                  <h5 className="font-weight-bold mb-2 text-dark property-title">
                    Aura Residencial
                  </h5>

                  <p className="text-muted mb-4">
                    <i className="fa fa-map-marker-alt text-primary mr-2" />
                    Itagüí
                  </p>
                  {
                    "\n                            \n                            "
                  }
                  <div className="mt-auto">
                    <div
                      className={
                        "d-flex justify-content-between mb-4 pt-3 border-top border-light"
                      }
                    >
                      <span className="property-specs text-muted font-weight-bold">
                        <i className="fa fa-bed text-primary mr-1" />2
                      </span>

                      <span className="property-specs text-muted font-weight-bold">
                        <i className="fa fa-bath text-primary mr-1" />1
                      </span>

                      <span className="property-specs text-muted font-weight-bold">
                        <i className="fa fa-car text-primary mr-1" />1
                      </span>

                      <span className="property-specs text-muted font-weight-bold">
                        <i className="fa fa-ruler-combined text-primary mr-1" />
                        75m²
                      </span>
                    </div>

                    <Link
                      to="/property-details.html?id=7"
                      className={
                        "btn btn-outline-primary btn-block rounded py-2 font-weight-bold w-100"
                      }
                    >
                      Ver Detalles
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <div
              className="col-lg-4 col-md-6 mb-4 property-item"
              data-ubicacion="La Estrella"
              data-tipo="casa"
              data-habitaciones="4"
              data-precio="3200000"
              hidden={
                remoteProperties.length > 0 ||
                !matchesProperty(
                  {
                    location: "La Estrella",
                    type: "casa",
                    bedrooms: 4,
                    price: 3200000,
                  },
                  filters,
                )
              }
            >
              <div
                className={
                  "property-card bg-white rounded-lg shadow-sm overflow-hidden h-100 d-flex flex-column"
                }
              >
                <div
                  className="position-relative overflow-hidden property-img"
                  style={{ height: "250px" }}
                >
                  <img
                    className="img-fluid w-100 h-100"
                    src="img/estrella.png"
                    alt="Propiedad"
                    style={{ objectFit: "cover" }}
                  />

                  <div
                    className={
                      "badge-status bg-success text-white position-absolute font-weight-bold px-3 py-1 rounded"
                    }
                  >
                    Renta
                  </div>
                </div>

                <div className="p-4 d-flex flex-column flex-grow-1">
                  <h4 className="text-primary font-weight-bold mb-2">
                    $999,999,999,999
                    <span className="small text-muted font-weight-normal">
                      COP
                    </span>
                  </h4>

                  <h5 className="font-weight-bold mb-2 text-dark property-title">
                    Palacio de la Perla
                  </h5>

                  <p className="text-muted mb-4">
                    <i className="fa fa-map-marker-alt text-primary mr-2" />
                    La Estrella
                  </p>
                  {
                    "\n                            \n                            "
                  }
                  <div className="mt-auto">
                    <div
                      className={
                        "d-flex justify-content-between mb-4 pt-3 border-top border-light"
                      }
                    >
                      <span className="property-specs text-muted font-weight-bold">
                        <i className="fa fa-bed text-primary mr-1" />4
                      </span>

                      <span className="property-specs text-muted font-weight-bold">
                        <i className="fa fa-bath text-primary mr-1" />2
                      </span>

                      <span className="property-specs text-muted font-weight-bold">
                        <i className="fa fa-car text-primary mr-1" />2
                      </span>

                      <span className="property-specs text-muted font-weight-bold">
                        <i className="fa fa-ruler-combined text-primary mr-1" />
                        220m²
                      </span>
                    </div>

                    <Link
                      to="/property-details.html?id=8"
                      className={
                        "btn btn-outline-primary btn-block rounded py-2 font-weight-bold w-100"
                      }
                    >
                      Ver Detalles
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <div
              className="col-lg-4 col-md-6 mb-4 property-item"
              data-ubicacion="Copacabana"
              data-tipo="terreno"
              data-habitaciones="0"
              data-precio="900000"
              hidden={
                remoteProperties.length > 0 ||
                !matchesProperty(
                  {
                    location: "Copacabana",
                    type: "terreno",
                    bedrooms: 0,
                    price: 900000,
                  },
                  filters,
                )
              }
            >
              <div
                className={
                  "property-card bg-white rounded-lg shadow-sm overflow-hidden h-100 d-flex flex-column"
                }
              >
                <div
                  className="position-relative overflow-hidden property-img"
                  style={{ height: "250px" }}
                >
                  <img
                    className="img-fluid w-100 h-100"
                    src="img/copacabana (1).png"
                    alt="Propiedad"
                    style={{ objectFit: "cover" }}
                  />

                  <div
                    className={
                      "badge-status bg-success text-white position-absolute font-weight-bold px-3 py-1 rounded"
                    }
                  >
                    Renta
                  </div>
                </div>

                <div className="p-4 d-flex flex-column flex-grow-1">
                  <h4 className="text-primary font-weight-bold mb-2">
                    $17,999,999,999,999
                    <span className="small text-muted font-weight-normal">
                      COP
                    </span>
                  </h4>

                  <h5 className="font-weight-bold mb-2 text-dark property-title">
                    Hacienda El Rosal
                  </h5>

                  <p className="text-muted mb-4">
                    <i className="fa fa-map-marker-alt text-primary mr-2" />
                    Copacabana
                  </p>
                  {
                    "\n                            \n                            "
                  }
                  <div className="mt-auto">
                    <div
                      className={
                        "d-flex justify-content-between mb-4 pt-3 border-top border-light"
                      }
                    >
                      <span className="property-specs text-muted font-weight-bold">
                        <i className="fa fa-cube text-primary mr-1" />
                        Lote Finca
                      </span>

                      <span className="property-specs text-muted font-weight-bold">
                        <i className="fa fa-ruler-combined text-primary mr-1" />
                        400m²
                      </span>
                    </div>

                    <Link
                      to="/property-details.html?id=9"
                      className={
                        "btn btn-outline-primary btn-block rounded py-2 font-weight-bold w-100"
                      }
                    >
                      Ver Detalles
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div id="servicios" className="container-fluid py-5 bg-white text-center">
        <div className="container py-5">
          <div className="text-center mb-4">
            <h6
              className="text-primary text-uppercase font-weight-bold"
              style={{ letterSpacing: "2px" }}
            >
              Conoce
            </h6>

            <h2 className="display-4 font-weight-bold text-dark">
              Nuestros Servicios
            </h2>

            <p
              className="text-muted mx-auto mb-0"
              style={{ maxWidth: "600px", fontSize: "1.1rem" }}
            >
              {
                "\n                    Descubre todo lo que tenemos para ti: asesoría profesional, precios competitivos y una amplia cobertura de zonas.\n                "
              }
            </p>
          </div>

          <Link
            to="/service.html"
            className={
              "btn btn-primary btn-lg rounded-pill py-3 px-5 font-weight-bold shadow-lg mt-4"
            }
            style={{ fontSize: "1.1rem" }}
          >
            Ver todos los servicios
            <i className="fa fa-arrow-right ml-2" />
          </Link>
        </div>
      </div>

      <div className="container-fluid bg-primary py-5">
        <div className="container py-5">
          <div className="row align-items-center">
            <div
              className={
                "col-lg-6 col-md-12 text-center text-lg-left mb-5 mb-lg-0"
              }
            >
              <h2 className="text-white font-weight-bold">
                ¿Deseas vender o rentar tu inmueble?
              </h2>

              <p
                className="mb-5 fs-5 lead mx-auto"
                style={{
                  color: "#ffffff !important",
                  maxWidth: "700px",
                  lineHeight: "1.8",
                }}
              >
                {
                  "Alcanzamos a los clientes correctos con estrategias de marketing modernas, garantizando un proceso seguro, transparente y sin complicaciones."
                }
              </p>

              <a
                href="#contacto"
                className={
                  "btn btn-light btn-cta rounded-pill py-3 px-5 font-weight-bold shadow-lg mt-2 smooth-scroll"
                }
                style={{
                  color: "var(--color-verde-corporativo) !important",
                  backgroundColor: "#ffffff !important",
                  borderColor: "#ffffff !important",
                  fontSize: "1.1rem",
                }}
              >
                Publicar Proyecto Ahora
              </a>
            </div>

            <div className="col-lg-6 col-md-12 text-center">
              <h4 className="mb-3 font-weight-bold text-white">
                ¡Conoce nuestras propiedades!
              </h4>

              <p className="text-white-50 mb-4">
                {
                  "Te invitamos a ver uno de nuestros recorridos virtuales más recientes directamente desde nuestro Instagram."
                }
              </p>

              <div className="d-flex justify-content-center">
                <blockquote
                  className="instagram-media"
                  data-instgrm-permalink={
                    "https://www.instagram.com/reel/DRik3a2keXG/?utm_source=ig_embed&utm_campaign=loading"
                  }
                  data-instgrm-version="14"
                  style={{
                    background: "#FFF",
                    border: "0",
                    borderRadius: "3px",
                    boxShadow:
                      "0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15)",
                    margin: "1px",
                    maxWidth: "540px",
                    minWidth: "326px",
                    padding: "0",
                    width: "calc(100% - 2px)",
                  }}
                >
                  <div style={{ padding: "16px" }}>
                    <a
                      href={
                        "https://www.instagram.com/reel/DRik3a2keXG/?utm_source=ig_embed&utm_campaign=loading"
                      }
                      style={{
                        background: "#FFFFFF",
                        lineHeight: "0",
                        padding: "0 0",
                        textAlign: "center",
                        textDecoration: "none",
                        width: "100%",
                      }}
                      target="_blank"
                    >
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "row",
                          alignItems: "center",
                        }}
                      >
                        <div
                          style={{
                            backgroundColor: "#F4F4F4",
                            borderRadius: "50%",
                            flexGrow: "0",
                            height: "40px",
                            marginRight: "14px",
                            width: "40px",
                          }}
                        />
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            flexGrow: "1",
                            justifyContent: "center",
                          }}
                        >
                          <div
                            style={{
                              backgroundColor: "#F4F4F4",
                              borderRadius: "4px",
                              flexGrow: "0",
                              height: "14px",
                              marginBottom: "6px",
                              width: "100px",
                            }}
                          />
                          <div
                            style={{
                              backgroundColor: "#F4F4F4",
                              borderRadius: "4px",
                              flexGrow: "0",
                              height: "14px",
                              width: "60px",
                            }}
                          />
                        </div>
                      </div>
                      <div style={{ padding: "19% 0" }} />
                      <div
                        style={{
                          display: "block",
                          height: "50px",
                          margin: "0 auto 12px",
                          width: "50px",
                        }}
                      >
                        <i className="fab fa-instagram" aria-hidden="true" />
                      </div>
                      <div style={{ paddingTop: "8px" }}>
                        <div
                          style={{
                            color: "#3897f0",
                            fontFamily: "Arial,sans-serif",
                            fontSize: "14px",
                            fontStyle: "normal",
                            fontWeight: "550",
                            lineHeight: "18px",
                          }}
                        >
                          View this post on Instagram
                        </div>
                      </div>
                      <div style={{ padding: "12.5% 0" }} />
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "row",
                          marginBottom: "14px",
                          alignItems: "center",
                        }}
                      >
                        <div>
                          <div
                            style={{
                              backgroundColor: "#F4F4F4",
                              borderRadius: "50%",
                              height: "12.5px",
                              width: "12.5px",
                              transform: "translateX(0px) translateY(7px)",
                            }}
                          />
                          <div
                            style={{
                              backgroundColor: "#F4F4F4",
                              height: "12.5px",
                              transform:
                                "rotate(-45deg) translateX(3px) translateY(1px)",
                              width: "12.5px",
                              flexGrow: "0",
                              marginRight: "14px",
                              marginLeft: "2px",
                            }}
                          />
                          <div
                            style={{
                              backgroundColor: "#F4F4F4",
                              borderRadius: "50%",
                              height: "12.5px",
                              width: "12.5px",
                              transform: "translateX(9px) translateY(-18px)",
                            }}
                          />
                        </div>
                        <div style={{ marginLeft: "8px" }}>
                          <div
                            style={{
                              backgroundColor: "#F4F4F4",
                              borderRadius: "50%",
                              flexGrow: "0",
                              height: "20px",
                              width: "20px",
                            }}
                          />
                          <div
                            style={{
                              width: "0",
                              height: "0",
                              borderTop: "2px solid transparent",
                              borderLeft: "6px solid #f4f4f4",
                              borderBottom: "2px solid transparent",
                              transform:
                                "translateX(16px) translateY(-4px) rotate(30deg)",
                            }}
                          />
                        </div>
                        <div style={{ marginLeft: "auto" }}>
                          <div
                            style={{
                              width: "0px",
                              borderTop: "8px solid #F4F4F4",
                              borderRight: "8px solid transparent",
                              transform: "translateY(16px)",
                            }}
                          />
                          <div
                            style={{
                              backgroundColor: "#F4F4F4",
                              flexGrow: "0",
                              height: "12px",
                              width: "16px",
                              transform: "translateY(-4px)",
                            }}
                          />
                          <div
                            style={{
                              width: "0",
                              height: "0",
                              borderTop: "8px solid #F4F4F4",
                              borderLeft: "8px solid transparent",
                              transform: "translateY(-4px) translateX(8px)",
                            }}
                          />
                        </div>
                      </div>
                    </a>
                  </div>
                </blockquote>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div id="testimonios-cta">
        <div className="cta-inner">
          <i className="fas fa-quote-left cta-icon" />

          <h2 className="cta-title">Lo que dicen nuestros clientes</h2>

          <Link to="/service.html#testimonios" className="cta-btn">
            Ver todos los testimonios →
          </Link>

          <p className="cta-disclaimer">
            Sin costo · Sin registro · Solo experiencias reales
          </p>
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
    </>
  );
}
