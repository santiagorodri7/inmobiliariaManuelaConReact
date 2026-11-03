const rawNumber = String(import.meta.env.VITE_WHATSAPP_NUMBER || "").replace(
  /\D/g,
  "",
);

export const WHATSAPP_NUMBER = rawNumber;

export const isWhatsappConfigured = rawNumber.length >= 8;

export const buildWhatsappUrl = (message = "") => {
  if (!isWhatsappConfigured) return "";
  const text = String(message || "").trim();
  const query = text ? `?text=${encodeURIComponent(text)}` : "";
  return `https://wa.me/${rawNumber}${query}`;
};
