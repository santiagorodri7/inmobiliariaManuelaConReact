import { normalizeText, safeString } from "./format.js";
import { toDate } from "./dates.js";

const validImage = (value) =>
  typeof value === "string" &&
  (value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("data:image/"));

export const inferOperation = (raw = {}, price = 0) => {
  const value = normalizeText(
    raw.operation ?? raw.operacion ?? raw.modalidad ?? raw.tipoOperacion,
  );
  if (value.includes("rent") || value.includes("arriend") || value.includes("alquil")) {
    return "renta";
  }
  if (value.includes("vent")) return "venta";
  return price > 0 && price < 15000000 ? "renta" : "venta";
};

export const normalizeStatus = (raw = {}) => {
  const value = normalizeText(raw.status ?? raw.estado ?? "");
  if (value.includes("vendid")) return "vendida";
  if (value.includes("rentad") || value.includes("alquilad")) return "rentada";
  if (
    value.includes("inactiv") ||
    value.includes("pausad") ||
    value.includes("ocult") ||
    value.includes("eliminad") ||
    value.includes("borrad")
  ) {
    return "inactiva";
  }
  return "disponible";
};

export const normalizeTypeKey = (value = "") => {
  const type = normalizeText(value);
  if (type.includes("apartaestudio")) return "apartaestudio";
  if (type.includes("apartamento") || type.includes("departamento")) {
    return "apartamento";
  }
  if (type.includes("oficina")) return "oficina";
  if (type.includes("local")) return "local";
  if (type.includes("terreno") || type.includes("lote")) return "terreno";
  if (type.includes("finca") || type.includes("campestre")) return "finca";
  if (type.includes("casa")) return "casa";
  return "otro";
};

export const normalizeAmenities = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => safeString(item).trim()).filter(Boolean);
  }
  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
};

export const normalizeImages = (raw = {}) => {
  const images = [];
  const seen = new Set();

  const push = (url, path = "") => {
    if (!validImage(url) || seen.has(url)) return;
    seen.add(url);
    images.push({ url, path: safeString(path) });
  };

  if (Array.isArray(raw.images)) {
    raw.images.forEach((item) => {
      if (typeof item === "string") push(item);
      else if (item && typeof item === "object") push(item.url, item.path);
    });
  }

  push(raw.imageBase64);
  if (validImage(raw.imageUrl)) push(raw.imageUrl);

  return images;
};

export const normalizeProperty = (id, raw = {}) => {
  const price = Number(raw.price ?? raw.precio ?? 0) || 0;
  const images = normalizeImages(raw);
  const createdAt = toDate(
    raw.createdAt ?? raw.fechaRegistro ?? raw.updatedAt ?? null,
  );

  return {
    id: safeString(raw.id || id),
    ownerId: safeString(raw.ownerId || raw.owner || ""),
    ownerName: safeString(raw.ownerName || raw.propietario || ""),
    ownerEmail: safeString(raw.ownerEmail || ""),
    title: safeString(raw.title || raw.titulo || "Propiedad sin título"),
    location: safeString(raw.location || raw.ubicacion || ""),
    price,
    type: safeString(raw.type || raw.tipo || "Inmueble"),
    operation: inferOperation(raw, price),
    status: normalizeStatus(raw),
    description: safeString(raw.description || raw.descripcion || ""),
    bedrooms: Number(raw.bedrooms ?? raw.habitaciones ?? 0) || 0,
    bathrooms: Number(raw.bathrooms ?? raw.banos ?? raw.baños ?? 0) || 0,
    parking: Number(raw.parking ?? raw.parqueaderos ?? 0) || 0,
    area: Number(raw.area ?? raw.areaM2 ?? raw.metrosCuadrados ?? 0) || 0,
    stratum: Number(raw.stratum ?? raw.estrato ?? 0) || 0,
    amenities: normalizeAmenities(raw.amenities ?? raw.amenidades),
    images,
    imageUrl: safeString(raw.imageUrl || ""),
    imageBase64: safeString(raw.imageBase64 || ""),
    storageMode: safeString(raw.storageMode || ""),
    featured: raw.featured === true,
    saleId: safeString(raw.saleId || ""),
    closedAt: raw.closedAt || null,
    createdAt,
    updatedAt: toDate(raw.updatedAt ?? null),
    fechaRegistro: safeString(raw.fechaRegistro || ""),
    raw,
  };
};

export const coverImage = (property) => property?.images?.[0]?.url || "";

export const isAvailable = (property) => property?.status === "disponible";

export const isPublicProperty = (property) => property?.status === "disponible";

export const operationLabel = (operation) =>
  operation === "renta" ? "Renta" : "Venta";

export const statusLabel = (status) => {
  const labels = {
    disponible: "Publicada",
    vendida: "Vendida",
    rentada: "Rentada",
    inactiva: "Oculta",
  };
  return labels[status] || "Publicada";
};

export const sortProperties = (properties = []) =>
  [...properties].sort((a, b) => {
    if (a.featured !== b.featured) return a.featured ? -1 : 1;
    const dateA = a.createdAt?.getTime?.() || 0;
    const dateB = b.createdAt?.getTime?.() || 0;
    return dateB - dateA;
  });

export const filterProperties = (properties = [], filters = {}) => {
  const search = normalizeText(
    filters.search || filters.location || filters.query || "",
  );
  const operation = filters.operation || "";
  const type = filters.type || "";
  const bedrooms = Number(filters.bedrooms || 0);
  const maxPrice = Number(filters.maxPrice || 0);
  const status = filters.status || "";

  return properties.filter((property) => {
    if (operation && property.operation !== operation) return false;
    if (type && normalizeTypeKey(property.type) !== type) return false;
    if (bedrooms && Number(property.bedrooms || 0) < bedrooms) return false;
    if (maxPrice && Number(property.price || 0) > maxPrice) return false;
    if (status && property.status !== status) return false;
    if (search) {
      const haystack = normalizeText(
        [
          property.title,
          property.location,
          property.type,
          property.description,
          property.ownerName,
        ].join(" "),
      );
      if (!haystack.includes(search)) return false;
    }
    return true;
  });
};

export const propertyPayload = (values = {}) => ({
  title: safeString(values.title).trim(),
  location: safeString(values.location).trim(),
  price: Number(values.price) || 0,
  type: safeString(values.type),
  operation: values.operation === "renta" ? "renta" : "venta",
  status: values.status || "disponible",
  description: safeString(values.description).trim(),
  bedrooms: Number(values.bedrooms) || 0,
  bathrooms: Number(values.bathrooms) || 0,
  parking: Number(values.parking) || 0,
  area: Number(values.area) || 0,
  stratum: Number(values.stratum) || 0,
  amenities: normalizeAmenities(values.amenities),
  ownerName: safeString(values.ownerName),
  ownerEmail: safeString(values.ownerEmail),
});

export const propertySearchSummary = (filters = {}) => {
  const parts = [];
  if (filters.operation) {
    parts.push(operationLabel(filters.operation));
  }
  if (filters.type) {
    const found = {
      casa: "Casas",
      apartamento: "Apartamentos",
      apartaestudio: "Apartaestudios",
      oficina: "Oficinas",
      local: "Locales",
      terreno: "Terrenos",
      finca: "Fincas",
      otro: "Inmuebles",
    }[filters.type];
    if (found) parts.push(found);
  }
  if (filters.location || filters.search) {
    parts.push(`en ${filters.location || filters.search}`);
  }
  return parts.join(" · ");
};
