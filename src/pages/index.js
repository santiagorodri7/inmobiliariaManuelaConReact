const pageLoaders = {
  about: () => import("./about.jsx"),
  admin: () => import("./admin.jsx"),
  blog: () => import("./blog.jsx"),
  buyer: () => import("./buyer.jsx"),
  contact: () => import("./contact.jsx"),
  guide: () => import("./guide.jsx"),
  home: () => import("./home.jsx"),
  index: () => import("./welcome.jsx"),
  login: () => import("./login.jsx"),
  profiles: () => import("./profiles.jsx"),
  "property-details": () => import("./property-details.jsx"),
  reporteVentas: () => import("./reporteVentas.jsx"),
  seller: () => import("./seller.jsx"),
  service: () => import("./service.jsx"),
  setup: () => import("./setup.jsx"),
  single: () => import("./single.jsx"),
  testimonial: () => import("./testimonial.jsx"),
  vandedorr: () => import("./vandedorr.jsx"),
};

export default pageLoaders;
