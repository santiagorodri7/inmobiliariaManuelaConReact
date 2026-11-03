import { normalizeRole } from "../utils/roles.js";

const normalize = (value) =>
  String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

const operationKeys = {
  venta: "sale",
  sale: "sale",
  renta: "rent",
  rent: "rent",
  arriendo: "rent",
};

export const operationKey = (operation) =>
  operationKeys[normalize(operation)] || "sale";

export const operationLabel = (t, operation) =>
  t(`labels.operation.${operationKey(operation)}`);

const statusKeys = {
  disponible: "disponible",
  published: "disponible",
  publicada: "disponible",
  vendida: "vendida",
  sold: "vendida",
  rentada: "rentada",
  rented: "rentada",
  inactiva: "inactiva",
  hidden: "inactiva",
  oculta: "inactiva",
};

export const statusLabel = (t, status) =>
  t(`labels.status.${statusKeys[normalize(status)] || "disponible"}`);

const propertyTypeKeys = {
  casa: "casa",
  house: "casa",
  apartamento: "apartamento",
  departamento: "apartamento",
  apartment: "apartamento",
  apartaestudio: "apartaestudio",
  studio: "apartaestudio",
  oficina: "oficina",
  office: "oficina",
  local: "local",
  "local comercial": "local",
  "commercial space": "local",
  terreno: "terreno",
  land: "terreno",
  finca: "finca",
  "country property": "finca",
  otro: "otro",
  inmueble: "otro",
  property: "otro",
};

export const propertyTypeKey = (type) =>
  propertyTypeKeys[normalize(type)] || "otro";

export const propertyTypeLabel = (t, type) =>
  t(`labels.propertyType.${propertyTypeKey(type)}`);

export const propertyTypePluralLabel = (t, type) =>
  t(`labels.propertyTypePlural.${propertyTypeKey(type)}`);

const amenityKeys = {
  balcon: "balcony",
  terraza: "terrace",
  jardin: "garden",
  piscina: "pool",
  gimnasio: "gym",
  "salon comunal": "communityRoom",
  "parqueadero visitantes": "visitorParking",
  deposito: "storage",
  ascensor: "elevator",
  "conjunto cerrado": "gatedCommunity",
  vigilancia: "security",
  "zona de bbq": "bbqArea",
  "aire acondicionado": "airConditioning",
  chimenea: "fireplace",
  estudio: "studio",
  "vista panoramica": "panoramicView",
};

export const amenityLabel = (t, amenity) => {
  const key = amenityKeys[normalize(amenity)];
  return key ? t(`labels.amenity.${key}`) : String(amenity || "");
};

const roleKeys = {
  admin: "admin",
  vendedor: "seller",
  comprador: "buyer",
  "no especificado": "none",
};

export const roleLabel = (t, role) =>
  t(`labels.role.${roleKeys[normalizeRole(role)] || "none"}`);

export const saleStatusLabel = (t, status) =>
  t(`labels.saleStatus.${normalize(status) === "anulada" ? "anulada" : "cerrada"}`);

export const userStatusLabel = (t, active) =>
  t(`labels.userStatus.${active ? "active" : "inactive"}`);

const contactSubjectKeys = {
  "quiero comprar una propiedad": "buy",
  "quiero vender mi propiedad": "sell",
  "quiero arrendar una propiedad": "rent",
  "quiero publicar mi inmueble": "publish",
  "necesito asesoria": "advice",
  "otro asunto": "other",
};

export const contactSubjectLabel = (t, subject) => {
  const key = contactSubjectKeys[normalize(subject)];
  return key ? t(`labels.contactSubject.${key}`) : String(subject || "");
};
