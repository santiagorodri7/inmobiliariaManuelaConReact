import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function BlogPage() {
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
            <h3 className="display-4 text-white text-uppercase">Blog</h3>

            <div className="d-inline-flex text-white">
              <p className="m-0 text-uppercase">
                <a className="text-white" href="">
                  Inicio
                </a>
              </p>

              <i className="fa fa-angle-double-right pt-1 px-3" />

              <p className="m-0 text-uppercase">Blog</p>
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
                          placeholder="Fecha de Salida"
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
                          placeholder="Fecha de Regreso"
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
                  Enviar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container-fluid py-5">
        <div className="container py-5">
          <div className="row">
            <div className="col-lg-8">
              <div className="row pb-3">
                <div className="col-md-6 mb-4 pb-2">
                  <div className="blog-item">
                    <div className="position-relative">
                      <img
                        className="img-fluid w-100"
                        src="img/blog-1.jpg"
                        alt=""
                      />

                      <div className="blog-date">
                        <h6 className="font-weight-bold mb-n1">01</h6>

                        <small className="text-white text-uppercase">Jan</small>
                      </div>
                    </div>

                    <div className="bg-white p-4">
                      <div className="d-flex mb-2">
                        <a
                          className={
                            "text-primary text-uppercase text-decoration-none"
                          }
                          href=""
                        >
                          Admin
                        </a>

                        <span className="text-primary px-2">|</span>

                        <a
                          className={
                            "text-primary text-uppercase text-decoration-none"
                          }
                          href=""
                        >
                          Tours &amp; Travel
                        </a>
                      </div>

                      <a className="h5 m-0 text-decoration-none" href="">
                        Dolor justo sea kasd lorem clita justo diam amet
                      </a>
                    </div>
                  </div>
                </div>

                <div className="col-md-6 mb-4 pb-2">
                  <div className="blog-item">
                    <div className="position-relative">
                      <img
                        className="img-fluid w-100"
                        src="img/blog-2.jpg"
                        alt=""
                      />

                      <div className="blog-date">
                        <h6 className="font-weight-bold mb-n1">01</h6>

                        <small className="text-white text-uppercase">Jan</small>
                      </div>
                    </div>

                    <div className="bg-white p-4">
                      <div className="d-flex mb-2">
                        <a
                          className={
                            "text-primary text-uppercase text-decoration-none"
                          }
                          href=""
                        >
                          Admin
                        </a>

                        <span className="text-primary px-2">|</span>

                        <a
                          className={
                            "text-primary text-uppercase text-decoration-none"
                          }
                          href=""
                        >
                          Tours &amp; Travel
                        </a>
                      </div>

                      <a className="h5 m-0 text-decoration-none" href="">
                        Dolor justo sea kasd lorem clita justo diam amet
                      </a>
                    </div>
                  </div>
                </div>

                <div className="col-md-6 mb-4 pb-2">
                  <div className="blog-item">
                    <div className="position-relative">
                      <img
                        className="img-fluid w-100"
                        src="img/blog-3.jpg"
                        alt=""
                      />

                      <div className="blog-date">
                        <h6 className="font-weight-bold mb-n1">01</h6>

                        <small className="text-white text-uppercase">Jan</small>
                      </div>
                    </div>

                    <div className="bg-white p-4">
                      <div className="d-flex mb-2">
                        <a
                          className={
                            "text-primary text-uppercase text-decoration-none"
                          }
                          href=""
                        >
                          Admin
                        </a>

                        <span className="text-primary px-2">|</span>

                        <a
                          className={
                            "text-primary text-uppercase text-decoration-none"
                          }
                          href=""
                        >
                          Tours &amp; Travel
                        </a>
                      </div>

                      <a className="h5 m-0 text-decoration-none" href="">
                        Dolor justo sea kasd lorem clita justo diam amet
                      </a>
                    </div>
                  </div>
                </div>

                <div className="col-md-6 mb-4 pb-2">
                  <div className="blog-item">
                    <div className="position-relative">
                      <img
                        className="img-fluid w-100"
                        src="img/blog-1.jpg"
                        alt=""
                      />

                      <div className="blog-date">
                        <h6 className="font-weight-bold mb-n1">01</h6>

                        <small className="text-white text-uppercase">Jan</small>
                      </div>
                    </div>

                    <div className="bg-white p-4">
                      <div className="d-flex mb-2">
                        <a
                          className={
                            "text-primary text-uppercase text-decoration-none"
                          }
                          href=""
                        >
                          Admin
                        </a>

                        <span className="text-primary px-2">|</span>

                        <a
                          className={
                            "text-primary text-uppercase text-decoration-none"
                          }
                          href=""
                        >
                          Tours &amp; Travel
                        </a>
                      </div>

                      <a className="h5 m-0 text-decoration-none" href="">
                        Dolor justo sea kasd lorem clita justo diam amet
                      </a>
                    </div>
                  </div>
                </div>

                <div className="col-md-6 mb-4 pb-2">
                  <div className="blog-item">
                    <div className="position-relative">
                      <img
                        className="img-fluid w-100"
                        src="img/blog-2.jpg"
                        alt=""
                      />

                      <div className="blog-date">
                        <h6 className="font-weight-bold mb-n1">01</h6>

                        <small className="text-white text-uppercase">Jan</small>
                      </div>
                    </div>

                    <div className="bg-white p-4">
                      <div className="d-flex mb-2">
                        <a
                          className={
                            "text-primary text-uppercase text-decoration-none"
                          }
                          href=""
                        >
                          Admin
                        </a>

                        <span className="text-primary px-2">|</span>

                        <a
                          className={
                            "text-primary text-uppercase text-decoration-none"
                          }
                          href=""
                        >
                          Tours &amp; Travel
                        </a>
                      </div>

                      <a className="h5 m-0 text-decoration-none" href="">
                        Dolor justo sea kasd lorem clita justo diam amet
                      </a>
                    </div>
                  </div>
                </div>

                <div className="col-md-6 mb-4 pb-2">
                  <div className="blog-item">
                    <div className="position-relative">
                      <img
                        className="img-fluid w-100"
                        src="img/blog-3.jpg"
                        alt=""
                      />

                      <div className="blog-date">
                        <h6 className="font-weight-bold mb-n1">01</h6>

                        <small className="text-white text-uppercase">Jan</small>
                      </div>
                    </div>

                    <div className="bg-white p-4">
                      <div className="d-flex mb-2">
                        <a
                          className={
                            "text-primary text-uppercase text-decoration-none"
                          }
                          href=""
                        >
                          Admin
                        </a>

                        <span className="text-primary px-2">|</span>

                        <a
                          className={
                            "text-primary text-uppercase text-decoration-none"
                          }
                          href=""
                        >
                          Tours &amp; Travel
                        </a>
                      </div>

                      <a className="h5 m-0 text-decoration-none" href="">
                        Dolor justo sea kasd lorem clita justo diam amet
                      </a>
                    </div>
                  </div>
                </div>

                <div className="col-md-6 mb-4 pb-2">
                  <div className="blog-item">
                    <div className="position-relative">
                      <img
                        className="img-fluid w-100"
                        src="img/blog-1.jpg"
                        alt=""
                      />

                      <div className="blog-date">
                        <h6 className="font-weight-bold mb-n1">01</h6>

                        <small className="text-white text-uppercase">Jan</small>
                      </div>
                    </div>

                    <div className="bg-white p-4">
                      <div className="d-flex mb-2">
                        <a
                          className={
                            "text-primary text-uppercase text-decoration-none"
                          }
                          href=""
                        >
                          Admin
                        </a>

                        <span className="text-primary px-2">|</span>

                        <a
                          className={
                            "text-primary text-uppercase text-decoration-none"
                          }
                          href=""
                        >
                          Tours &amp; Travel
                        </a>
                      </div>

                      <a className="h5 m-0 text-decoration-none" href="">
                        Dolor justo sea kasd lorem clita justo diam amet
                      </a>
                    </div>
                  </div>
                </div>

                <div className="col-md-6 mb-4 pb-2">
                  <div className="blog-item">
                    <div className="position-relative">
                      <img
                        className="img-fluid w-100"
                        src="img/blog-2.jpg"
                        alt=""
                      />

                      <div className="blog-date">
                        <h6 className="font-weight-bold mb-n1">01</h6>

                        <small className="text-white text-uppercase">Jan</small>
                      </div>
                    </div>

                    <div className="bg-white p-4">
                      <div className="d-flex mb-2">
                        <a
                          className={
                            "text-primary text-uppercase text-decoration-none"
                          }
                          href=""
                        >
                          Admin
                        </a>

                        <span className="text-primary px-2">|</span>

                        <a
                          className={
                            "text-primary text-uppercase text-decoration-none"
                          }
                          href=""
                        >
                          Tours &amp; Travel
                        </a>
                      </div>

                      <a className="h5 m-0 text-decoration-none" href="">
                        Dolor justo sea kasd lorem clita justo diam amet
                      </a>
                    </div>
                  </div>
                </div>

                <div className="col-12">
                  <nav aria-label="Page navigation">
                    <ul
                      className={
                        "pagination pagination-lg justify-content-center bg-white mb-0"
                      }
                      style={{ padding: "30px" }}
                    >
                      <li className="page-item disabled">
                        <a className="page-link" href="#" aria-label="Previous">
                          <span aria-hidden="true">«</span>

                          <span className="sr-only">Previous</span>
                        </a>
                      </li>

                      <li className="page-item active">
                        <a className="page-link" href="#">
                          1
                        </a>
                      </li>

                      <li className="page-item">
                        <a className="page-link" href="#">
                          2
                        </a>
                      </li>

                      <li className="page-item">
                        <a className="page-link" href="#">
                          3
                        </a>
                      </li>

                      <li className="page-item">
                        <a className="page-link" href="#" aria-label="Next">
                          <span aria-hidden="true">»</span>

                          <span className="sr-only">Next</span>
                        </a>
                      </li>
                    </ul>
                  </nav>
                </div>
              </div>
            </div>

            <div className="col-lg-4 mt-5 mt-lg-0">
              <div
                className={
                  "d-flex flex-column text-center bg-white mb-5 py-5 px-4"
                }
              >
                <img
                  src="img/user.jpg"
                  className="img-fluid mx-auto mb-3"
                  style={{ width: "100px" }}
                />

                <h3 className="text-primary mb-3">John Doe</h3>

                <p>
                  {
                    "Conset elitr erat vero dolor ipsum et diam, eos dolor lorem, ipsum sit no ut est  ipsum erat kasd amet elitr"
                  }
                </p>

                <div className="d-flex justify-content-center">
                  <a className="text-primary px-2" href="">
                    <i className="fab fa-facebook-f" />
                  </a>

                  <a className="text-primary px-2" href="">
                    <i className="fab fa-twitter" />
                  </a>

                  <a className="text-primary px-2" href="">
                    <i className="fab fa-linkedin-in" />
                  </a>

                  <a className="text-primary px-2" href="">
                    <i className="fab fa-instagram" />
                  </a>

                  <a className="text-primary px-2" href="">
                    <i className="fab fa-youtube" />
                  </a>
                </div>
              </div>

              <div className="mb-5">
                <div className="bg-white" style={{ padding: "30px" }}>
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control p-4"
                      placeholder="Keyword"
                    />

                    <div className="input-group-append">
                      <span
                        className={
                          "input-group-text bg-primary border-primary text-white"
                        }
                      >
                        <i className="fa fa-search" />
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-5">
                <h4
                  className="text-uppercase mb-4"
                  style={{ letterSpacing: "5px" }}
                >
                  Categories
                </h4>

                <div className="bg-white" style={{ padding: "30px" }}>
                  <ul className="list-inline m-0">
                    <li
                      className={
                        "mb-3 d-flex justify-content-between align-items-center"
                      }
                    >
                      <a className="text-dark" href="#">
                        <i className="fa fa-angle-right text-primary mr-2" />
                        Web Design
                      </a>

                      <span className="badge badge-primary badge-pill">
                        150
                      </span>
                    </li>

                    <li
                      className={
                        "mb-3 d-flex justify-content-between align-items-center"
                      }
                    >
                      <a className="text-dark" href="#">
                        <i className="fa fa-angle-right text-primary mr-2" />
                        {
                          "Web\n                                        Development"
                        }
                      </a>

                      <span className="badge badge-primary badge-pill">
                        131
                      </span>
                    </li>

                    <li
                      className={
                        "mb-3 d-flex justify-content-between align-items-center"
                      }
                    >
                      <a className="text-dark" href="#">
                        <i className="fa fa-angle-right text-primary mr-2" />
                        Online Marketing
                      </a>

                      <span className="badge badge-primary badge-pill">78</span>
                    </li>

                    <li
                      className={
                        "mb-3 d-flex justify-content-between align-items-center"
                      }
                    >
                      <a className="text-dark" href="#">
                        <i className="fa fa-angle-right text-primary mr-2" />
                        Keyword Research
                      </a>

                      <span className="badge badge-primary badge-pill">56</span>
                    </li>

                    <li
                      className={
                        "d-flex justify-content-between align-items-center"
                      }
                    >
                      <a className="text-dark" href="#">
                        <i className="fa fa-angle-right text-primary mr-2" />
                        Email Marketing
                      </a>

                      <span className="badge badge-primary badge-pill">98</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mb-5">
                <h4
                  className="text-uppercase mb-4"
                  style={{ letterSpacing: "5px" }}
                >
                  Recent Post
                </h4>

                <a
                  className={
                    "d-flex align-items-center text-decoration-none bg-white mb-3"
                  }
                  href=""
                >
                  <img
                    className="img-fluid"
                    src="img/blog-100x100.jpg"
                    alt=""
                  />

                  <div className="pl-3">
                    <h6 className="m-1">
                      Diam lorem dolore justo eirmod lorem dolore
                    </h6>

                    <small>Jan 01, 2050</small>
                  </div>
                </a>

                <a
                  className={
                    "d-flex align-items-center text-decoration-none bg-white mb-3"
                  }
                  href=""
                >
                  <img
                    className="img-fluid"
                    src="img/blog-100x100.jpg"
                    alt=""
                  />

                  <div className="pl-3">
                    <h6 className="m-1">
                      Diam lorem dolore justo eirmod lorem dolore
                    </h6>

                    <small>Jan 01, 2050</small>
                  </div>
                </a>

                <a
                  className={
                    "d-flex align-items-center text-decoration-none bg-white mb-3"
                  }
                  href=""
                >
                  <img
                    className="img-fluid"
                    src="img/blog-100x100.jpg"
                    alt=""
                  />

                  <div className="pl-3">
                    <h6 className="m-1">
                      Diam lorem dolore justo eirmod lorem dolore
                    </h6>

                    <small>Jan 01, 2050</small>
                  </div>
                </a>
              </div>

              <div className="mb-5">
                <h4
                  className="text-uppercase mb-4"
                  style={{ letterSpacing: "5px" }}
                >
                  Tag Cloud
                </h4>

                <div className="d-flex flex-wrap m-n1">
                  <a href="" className="btn btn-light m-1">
                    Design
                  </a>

                  <a href="" className="btn btn-light m-1">
                    Development
                  </a>

                  <a href="" className="btn btn-light m-1">
                    Marketing
                  </a>

                  <a href="" className="btn btn-light m-1">
                    SEO
                  </a>

                  <a href="" className="btn btn-light m-1">
                    Writing
                  </a>

                  <a href="" className="btn btn-light m-1">
                    Consulting
                  </a>
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
