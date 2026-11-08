import { buildMailtoUrl, contact } from "./contact.js";

/**
 * Datos centralizados de la marca.
 *
 * Solo se publican datos confirmados. No hay oficina, dirección, mapa ni
 * horario fijo: el canal principal es WhatsApp.
 *
 * TODO (legal): revisar la política de privacidad antes de publicarla.
 */
export const site = {
  name: contact.name,
  fullName: contact.fullName,
  role: contact.role,
  tagline: contact.tagline,
  email: contact.email,
  phone: contact.phone,
  phoneRaw: contact.phoneRaw,
  instagram: contact.instagram,
  instagramHandle: contact.instagramHandle,
  facebook: "",
  linkedin: "",
};

export const siteMeta = {
  title: "Manuela Bermúdez | Asesora inmobiliaria",
  description: "Manuela Bermúdez, asesora inmobiliaria. Atención por WhatsApp.",
  image: "/img/about-1.png",
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

export const mailtoUrl = (subject = "", body = "") =>
  buildMailtoUrl(subject, body);
