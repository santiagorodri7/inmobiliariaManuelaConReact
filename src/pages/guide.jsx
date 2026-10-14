import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function GuidePage() {
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
                  info@example.com
                </p>

                <p className="text-body px-3">|</p>

                <p>
                  <i className="fa fa-phone-alt mr-2" />
                  +012 345 6789
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
        <Link to="/home.html" className="navbar-brand">
          <h1 className="m-0 text-primary font-weight-bold">
            <i className="fa fa-home mr-2" />
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
            <Link to="/home.html" className="nav-item nav-link">
              Inicio
            </Link>

            <Link to="/home.html#destacadas" className="nav-item nav-link">
              Venta
            </Link>

            <Link to="/service.html" className="nav-item nav-link">
              Alquiler
            </Link>

            <Link to="/service.html" className="nav-item nav-link">
              Servicios
            </Link>

            <Link to="/about.html" className="nav-item nav-link">
              Nosotros
            </Link>

            <Link to="/contact.html" className="nav-item nav-link">
              Contacto
            </Link>
          </div>

          <a
            href="#contacto"
            className={
              "btn btn-primary btn-cta rounded-pill py-2 px-4 d-none d-lg-block ml-3 font-weight-bold text-white smooth-scroll"
            }
          >
            Listar Propiedad
          </a>
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
            <h3 className="display-4 text-white text-uppercase">Guías</h3>

            <div className="d-inline-flex text-white">
              <p className="m-0 text-uppercase">
                <a className="text-white" href="">
                  Inicio
                </a>
              </p>

              <i className="fa fa-angle-double-right pt-1 px-3" />

              <p className="m-0 text-uppercase">Guías</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container-fluid booking mt-5 pb-5">
        <div className="container pb-5">
          <div className="bg-light shadow" style={{ padding: "30px" }}>
            <div
              className="row align-items-center"
              style={{ minHeight: "60px" }}
            >
              <div className="col-md-10">
                <div className="row">
                  <div className="col-md-3">
                    <div className="mb-3 mb-md-0">
                      <select
                        className="custom-select px-4"
                        style={{ height: "47px" }}
                      >
                        <option selected>Destination</option>

                        <option value="1">Destination 1</option>

                        <option value="2">Destination 1</option>

                        <option value="3">Destination 1</option>
                      </select>
                    </div>
                  </div>

                  <div className="col-md-3">
                    <div className="mb-3 mb-md-0">
                      <div
                        className="date"
                        id="date1"
                        data-target-input="nearest"
                      >
                        <input
                          type="text"
                          className="form-control p-4 datetimepicker-input"
                          placeholder="Depart Date"
                          data-target="#date1"
                          data-toggle="datetimepicker"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="col-md-3">
                    <div className="mb-3 mb-md-0">
                      <div
                        className="date"
                        id="date2"
                        data-target-input="nearest"
                      >
                        <input
                          type="text"
                          className="form-control p-4 datetimepicker-input"
                          placeholder="Return Date"
                          data-target="#date2"
                          data-toggle="datetimepicker"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="col-md-3">
                    <div className="mb-3 mb-md-0">
                      <select
                        className="custom-select px-4"
                        style={{ height: "47px" }}
                      >
                        <option selected>Duration</option>

                        <option value="1">Duration 1</option>

                        <option value="2">Duration 1</option>

                        <option value="3">Duration 1</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-md-2">
                <button
                  className="btn btn-primary btn-block"
                  type="submit"
                  style={{ height: "47px", marginTop: "-2px" }}
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container-fluid py-5">
        <div className="container pt-5 pb-3">
          <div className="text-center mb-3 pb-3">
            <h6
              className="text-primary text-uppercase"
              style={{ letterSpacing: "5px" }}
            >
              Guías
            </h6>

            <h1>Nuestras Guías de Viaje</h1>
          </div>

          <div className="row">
            <div className="col-lg-3 col-md-4 col-sm-6 pb-2">
              <div className="team-item bg-white mb-4">
                <div className="team-img position-relative overflow-hidden">
                  <img
                    className="img-fluid w-100"
                    src="img/team-1.jpg"
                    alt=""
                  />

                  <div className="team-social">
                    <a className="btn btn-outline-primary btn-square" href="">
                      <i className="fab fa-twitter" />
                    </a>

                    <a className="btn btn-outline-primary btn-square" href="">
                      <i className="fab fa-facebook-f" />
                    </a>

                    <a className="btn btn-outline-primary btn-square" href="">
                      <i className="fab fa-instagram" />
                    </a>

                    <a className="btn btn-outline-primary btn-square" href="">
                      <i className="fab fa-linkedin-in" />
                    </a>
                  </div>
                </div>

                <div className="text-center py-4">
                  <h5 className="text-truncate">Guide Name</h5>

                  <p className="m-0">Designation</p>
                </div>
              </div>
            </div>

            <div className="col-lg-3 col-md-4 col-sm-6 pb-2">
              <div className="team-item bg-white mb-4">
                <div className="team-img position-relative overflow-hidden">
                  <img
                    className="img-fluid w-100"
                    src="img/team-2.jpg"
                    alt=""
                  />

                  <div className="team-social">
                    <a className="btn btn-outline-primary btn-square" href="">
                      <i className="fab fa-twitter" />
                    </a>

                    <a className="btn btn-outline-primary btn-square" href="">
                      <i className="fab fa-facebook-f" />
                    </a>

                    <a className="btn btn-outline-primary btn-square" href="">
                      <i className="fab fa-instagram" />
                    </a>

                    <a className="btn btn-outline-primary btn-square" href="">
                      <i className="fab fa-linkedin-in" />
                    </a>
                  </div>
                </div>

                <div className="text-center py-4">
                  <h5 className="text-truncate">Guide Name</h5>

                  <p className="m-0">Designation</p>
                </div>
              </div>
            </div>

            <div className="col-lg-3 col-md-4 col-sm-6 pb-2">
              <div className="team-item bg-white mb-4">
                <div className="team-img position-relative overflow-hidden">
                  <img
                    className="img-fluid w-100"
                    src="img/team-3.jpg"
                    alt=""
                  />

                  <div className="team-social">
                    <a className="btn btn-outline-primary btn-square" href="">
                      <i className="fab fa-twitter" />
                    </a>

                    <a className="btn btn-outline-primary btn-square" href="">
                      <i className="fab fa-facebook-f" />
                    </a>

                    <a className="btn btn-outline-primary btn-square" href="">
                      <i className="fab fa-instagram" />
                    </a>

                    <a className="btn btn-outline-primary btn-square" href="">
                      <i className="fab fa-linkedin-in" />
                    </a>
                  </div>
                </div>

                <div className="text-center py-4">
                  <h5 className="text-truncate">Guide Name</h5>

                  <p className="m-0">Designation</p>
                </div>
              </div>
            </div>

            <div className="col-lg-3 col-md-4 col-sm-6 pb-2">
              <div className="team-item bg-white mb-4">
                <div className="team-img position-relative overflow-hidden">
                  <img
                    className="img-fluid w-100"
                    src="img/team-4.jpg"
                    alt=""
                  />

                  <div className="team-social">
                    <a className="btn btn-outline-primary btn-square" href="">
                      <i className="fab fa-twitter" />
                    </a>

                    <a className="btn btn-outline-primary btn-square" href="">
                      <i className="fab fa-facebook-f" />
                    </a>

                    <a className="btn btn-outline-primary btn-square" href="">
                      <i className="fab fa-instagram" />
                    </a>

                    <a className="btn btn-outline-primary btn-square" href="">
                      <i className="fab fa-linkedin-in" />
                    </a>
                  </div>
                </div>

                <div className="text-center py-4">
                  <h5 className="text-truncate">Guide Name</h5>

                  <p className="m-0">Designation</p>
                </div>
              </div>
            </div>

            <div className="col-lg-3 col-md-4 col-sm-6 pb-2">
              <div className="team-item bg-white mb-4">
                <div className="team-img position-relative overflow-hidden">
                  <img
                    className="img-fluid w-100"
                    src="img/team-1.jpg"
                    alt=""
                  />

                  <div className="team-social">
                    <a className="btn btn-outline-primary btn-square" href="">
                      <i className="fab fa-twitter" />
                    </a>

                    <a className="btn btn-outline-primary btn-square" href="">
                      <i className="fab fa-facebook-f" />
                    </a>

                    <a className="btn btn-outline-primary btn-square" href="">
                      <i className="fab fa-instagram" />
                    </a>

                    <a className="btn btn-outline-primary btn-square" href="">
                      <i className="fab fa-linkedin-in" />
                    </a>
                  </div>
                </div>

                <div className="text-center py-4">
                  <h5 className="text-truncate">Guide Name</h5>

                  <p className="m-0">Designation</p>
                </div>
              </div>
            </div>

            <div className="col-lg-3 col-md-4 col-sm-6 pb-2">
              <div className="team-item bg-white mb-4">
                <div className="team-img position-relative overflow-hidden">
                  <img
                    className="img-fluid w-100"
                    src="img/team-2.jpg"
                    alt=""
                  />

                  <div className="team-social">
                    <a className="btn btn-outline-primary btn-square" href="">
                      <i className="fab fa-twitter" />
                    </a>

                    <a className="btn btn-outline-primary btn-square" href="">
                      <i className="fab fa-facebook-f" />
                    </a>

                    <a className="btn btn-outline-primary btn-square" href="">
                      <i className="fab fa-instagram" />
                    </a>

                    <a className="btn btn-outline-primary btn-square" href="">
                      <i className="fab fa-linkedin-in" />
                    </a>
                  </div>
                </div>

                <div className="text-center py-4">
                  <h5 className="text-truncate">Guide Name</h5>

                  <p className="m-0">Designation</p>
                </div>
              </div>
            </div>

            <div className="col-lg-3 col-md-4 col-sm-6 pb-2">
              <div className="team-item bg-white mb-4">
                <div className="team-img position-relative overflow-hidden">
                  <img
                    className="img-fluid w-100"
                    src="img/team-3.jpg"
                    alt=""
                  />

                  <div className="team-social">
                    <a className="btn btn-outline-primary btn-square" href="">
                      <i className="fab fa-twitter" />
                    </a>

                    <a className="btn btn-outline-primary btn-square" href="">
                      <i className="fab fa-facebook-f" />
                    </a>

                    <a className="btn btn-outline-primary btn-square" href="">
                      <i className="fab fa-instagram" />
                    </a>

                    <a className="btn btn-outline-primary btn-square" href="">
                      <i className="fab fa-linkedin-in" />
                    </a>
                  </div>
                </div>

                <div className="text-center py-4">
                  <h5 className="text-truncate">Guide Name</h5>

                  <p className="m-0">Designation</p>
                </div>
              </div>
            </div>

            <div className="col-lg-3 col-md-4 col-sm-6 pb-2">
              <div className="team-item bg-white mb-4">
                <div className="team-img position-relative overflow-hidden">
                  <img
                    className="img-fluid w-100"
                    src="img/team-4.jpg"
                    alt=""
                  />

                  <div className="team-social">
                    <a className="btn btn-outline-primary btn-square" href="">
                      <i className="fab fa-twitter" />
                    </a>

                    <a className="btn btn-outline-primary btn-square" href="">
                      <i className="fab fa-facebook-f" />
                    </a>

                    <a className="btn btn-outline-primary btn-square" href="">
                      <i className="fab fa-instagram" />
                    </a>

                    <a className="btn btn-outline-primary btn-square" href="">
                      <i className="fab fa-linkedin-in" />
                    </a>
                  </div>
                </div>

                <div className="text-center py-4">
                  <h5 className="text-truncate">Guide Name</h5>

                  <p className="m-0">Designation</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        className="container-fluid bg-dark text-white-50 py-5 px-sm-3 px-lg-5"
        style={{ marginTop: "90px" }}
      >
        <div className="row pt-5">
          <div className="col-lg-3 col-md-6 mb-5">
            <a href="" className="navbar-brand">
              <h1 className="text-primary">
                <span className="text-white">TRAVEL</span>
                ER
              </h1>
            </a>

            <p>
              {
                "Sed ipsum clita tempor ipsum ipsum amet sit ipsum lorem amet labore rebum lorem ipsum dolor. No sed vero lorem dolor dolor"
              }
            </p>

            <h6
              className="text-white text-uppercase mt-4 mb-3"
              style={{ letterSpacing: "5px" }}
            >
              Follow Us
            </h6>

            <div className="d-flex justify-content-start">
              <a className="btn btn-outline-primary btn-square mr-2" href="#">
                <i className="fab fa-twitter" />
              </a>

              <a className="btn btn-outline-primary btn-square mr-2" href="#">
                <i className="fab fa-facebook-f" />
              </a>

              <a className="btn btn-outline-primary btn-square mr-2" href="#">
                <i className="fab fa-linkedin-in" />
              </a>

              <a className="btn btn-outline-primary btn-square" href="#">
                <i className="fab fa-instagram" />
              </a>
            </div>
          </div>

          <div className="col-lg-3 col-md-6 mb-5">
            <h5
              className="text-white text-uppercase mb-4"
              style={{ letterSpacing: "5px" }}
            >
              Our Services
            </h5>

            <div className="d-flex flex-column justify-content-start">
              <a className="text-white-50 mb-2" href="#">
                <i className="fa fa-angle-right mr-2" />
                About
              </a>

              <a className="text-white-50 mb-2" href="#">
                <i className="fa fa-angle-right mr-2" />
                Destination
              </a>

              <a className="text-white-50 mb-2" href="#">
                <i className="fa fa-angle-right mr-2" />
                Services
              </a>

              <a className="text-white-50 mb-2" href="#">
                <i className="fa fa-angle-right mr-2" />
                Packages
              </a>

              <a className="text-white-50 mb-2" href="#">
                <i className="fa fa-angle-right mr-2" />
                Guides
              </a>

              <a className="text-white-50 mb-2" href="#">
                <i className="fa fa-angle-right mr-2" />
                Testimonial
              </a>

              <a className="text-white-50" href="#">
                <i className="fa fa-angle-right mr-2" />
                Blog
              </a>
            </div>
          </div>

          <div className="col-lg-3 col-md-6 mb-5">
            <h5
              className="text-white text-uppercase mb-4"
              style={{ letterSpacing: "5px" }}
            >
              Usefull Links
            </h5>

            <div className="d-flex flex-column justify-content-start">
              <a className="text-white-50 mb-2" href="#">
                <i className="fa fa-angle-right mr-2" />
                About
              </a>

              <a className="text-white-50 mb-2" href="#">
                <i className="fa fa-angle-right mr-2" />
                Destination
              </a>

              <a className="text-white-50 mb-2" href="#">
                <i className="fa fa-angle-right mr-2" />
                Services
              </a>

              <a className="text-white-50 mb-2" href="#">
                <i className="fa fa-angle-right mr-2" />
                Packages
              </a>

              <a className="text-white-50 mb-2" href="#">
                <i className="fa fa-angle-right mr-2" />
                Guides
              </a>

              <a className="text-white-50 mb-2" href="#">
                <i className="fa fa-angle-right mr-2" />
                Testimonial
              </a>

              <a className="text-white-50" href="#">
                <i className="fa fa-angle-right mr-2" />
                Blog
              </a>
            </div>
          </div>

          <div className="col-lg-3 col-md-6 mb-5">
            <h5
              className="text-white text-uppercase mb-4"
              style={{ letterSpacing: "5px" }}
            >
              Contact Us
            </h5>

            <p>
              <i className="fa fa-map-marker-alt mr-2" />
              123 Street, New York, USA
            </p>

            <p>
              <i className="fa fa-phone-alt mr-2" />
              +012 345 67890
            </p>

            <p>
              <i className="fa fa-envelope mr-2" />
              info@example.com
            </p>

            <h6
              className="text-white text-uppercase mt-4 mb-3"
              style={{ letterSpacing: "5px" }}
            >
              Newsletter
            </h6>

            <div className="w-100">
              <div className="input-group">
                <input
                  type="text"
                  className="form-control border-light"
                  style={{ padding: "25px" }}
                  placeholder="Your Email"
                />

                <div className="input-group-append">
                  <button className="btn btn-primary px-3">Sign Up</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        className={
          "container-fluid bg-dark text-white border-top py-4 px-sm-3 px-md-5"
        }
        style={{ borderColor: "rgba(256, 256, 256, .1) !important" }}
      >
        <div className="row">
          <div className="col-lg-6 text-center text-md-left mb-3 mb-md-0">
            <p className="m-0 text-white-50">
              Copyright ©<a href="#">Domain</a>. All Rights Reserved.
            </p>
          </div>

          <div className="col-lg-6 text-center text-md-right">
            <p className="m-0 text-white-50">
              Designed by
              <a href="https://htmlcodex.com">HTML Codex</a>
            </p>
          </div>
        </div>
      </div>

      <a href="#" className="btn btn-lg btn-primary btn-lg-square back-to-top">
        <i className="fa fa-angle-double-up" />
      </a>
    </>
  );
}
