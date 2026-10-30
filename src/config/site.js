/**
 * Datos centralizados de la marca.
 *
 * IMPORTANTE: el correo, teléfono, dirección y logo definitivos deben
 * confirmarse antes de publicar. Mientras tanto se conservan los canales
 * que ya usaba el sitio y se muestran sin inventar información.
 */
export const site = {
  name: "Manuela Bermúdez",
  fullName: "Manuela Bermúdez Realtor",
  role: "Asesora inmobiliaria",
  tagline: "Un lugar que se sienta tuyo.",
  email: "manuelabermudezrealestate@gmail.com",
  phone: "+57 304 254 8683",
  phoneRaw: "+573042548683",
  whatsapp: "573042548683",
  location: "Medellín, Colombia",
  coverage: "Medellín y el Valle de Aburrá",
  hours: "Lunes a sábado · 8:00 a. m. – 6:00 p. m.",
  instagram: "",
  facebook: "",
  linkedin: "",
  pendingOfficialData: true,
};

export const siteMeta = {
  title: "Manuela Bermúdez Realtor | Propiedades en Medellín",
  description:
    "Propiedades en venta y arriendo en Medellín y el Valle de Aburrá. Asesoría inmobiliaria cercana, transparente y personalizada.",
};

export const navigation = [
  { label: "Inicio", to: "/" },
  { label: "Propiedades", to: "/#propiedades" },
  { label: "Servicios", to: "/servicios" },
  { label: "Nosotros", to: "/nosotros" },
  { label: "Contacto", to: "/contacto" },
];

export const propertyTypes = [
  { value: "Casa", label: "Casa" },
  { value: "Apartamento", label: "Apartamento" },
  { value: "Apartaestudio", label: "Apartaestudio" },
  { value: "Oficina", label: "Oficina" },
  { value: "Local", label: "Local comercial" },
  { value: "Terreno", label: "Terreno" },
  { value: "Finca", label: "Finca" },
];

export const operations = [
  { value: "venta", label: "Venta" },
  { value: "renta", label: "Renta" },
];

export const propertyStatuses = [
  { value: "disponible", label: "Publicada" },
  { value: "vendida", label: "Vendida" },
  { value: "rentada", label: "Rentada" },
  { value: "inactiva", label: "Oculta" },
];

export const amenitiesCatalog = [
  "Balcón",
  "Terraza",
  "Jardín",
  "Piscina",
  "Gimnasio",
  "Salón comunal",
  "Parqueadero visitantes",
  "Depósito",
  "Ascensor",
  "Conjunto cerrado",
  "Vigilancia",
  "Zona de BBQ",
  "Aire acondicionado",
  "Chimenea",
  "Estudio",
  "Vista panorámica",
];

export const budgetOptions = [
  { value: "", label: "Sin límite" },
  { value: "300000000", label: "Hasta $300 M" },
  { value: "600000000", label: "Hasta $600 M" },
  { value: "1000000000", label: "Hasta $1.000 M" },
  { value: "2000000000", label: "Hasta $2.000 M" },
];

export const bedroomOptions = [
  { value: "", label: "Cualquiera" },
  { value: "1", label: "1 o más" },
  { value: "2", label: "2 o más" },
  { value: "3", label: "3 o más" },
  { value: "4", label: "4 o más" },
];

export const contactSubjects = [
  "Quiero comprar una propiedad",
  "Quiero vender mi propiedad",
  "Quiero arrendar una propiedad",
  "Quiero publicar mi inmueble",
  "Necesito asesoría",
  "Otro asunto",
];

export const whatsappUrl = (message = "") => {
  const text = message
    ? `?text=${encodeURIComponent(message)}`
    : "";
  return `https://wa.me/${site.whatsapp}${text}`;
};

export const mailtoUrl = (subject = "", body = "") => {
  const params = new URLSearchParams();
  if (subject) params.set("subject", subject);
  if (body) params.set("body", body);
  const query = params.toString();
  return `mailto:${site.email}${query ? `?${query}` : ""}`;
};
