/**
 * Única fuente de datos públicos de contacto.
 *
 * Si cambia el número de WhatsApp, el correo o el Instagram, se actualiza
 * aquí y el resto de la aplicación lo toma de este archivo.
 */
export const contact = Object.freeze({
  name: "Manuela Bermúdez",
  fullName: "Manuela Bermúdez",
  role: "Asesora inmobiliaria",
  tagline: "Un lugar que se sienta tuyo.",
  email: "manuelabermudezrealestate@gmail.com",
  phone: "+57 304 254 8683",
  phoneRaw: "+573042548683",
  whatsappNumber: "573042548683",
  instagram: "https://www.instagram.com/manubermu_realtor",
  instagramHandle: "@manubermu_realtor",
});

const envWhatsappNumber = String(
  import.meta.env.VITE_WHATSAPP_NUMBER || "",
).replace(/\D/g, "");

export const WHATSAPP_NUMBER = envWhatsappNumber || contact.whatsappNumber;

export const isWhatsappConfigured = WHATSAPP_NUMBER.length >= 8;

export const buildWhatsappUrl = (message = "") => {
  if (!isWhatsappConfigured) return "";
  const text = String(message || "").trim();
  const query = text ? `?text=${encodeURIComponent(text)}` : "";
  return `https://wa.me/${WHATSAPP_NUMBER}${query}`;
};

export const buildMailtoUrl = (subject = "", body = "") => {
  const params = new URLSearchParams();
  if (subject) params.set("subject", subject);
  if (body) params.set("body", body);
  const query = params.toString();
  return `mailto:${contact.email}${query ? `?${query}` : ""}`;
};
