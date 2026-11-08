export const MAX_SHARE_SELECTION = 10;

const PROPERTY_ID_PATTERN = /^[A-Za-z0-9_-]{1,128}$/;

export const normalizePropertyId = (value = "") => {
  const id = String(value || "").trim();
  return PROPERTY_ID_PATTERN.test(id) ? id : "";
};

export const parseSharedPropertyIds = (rawValue = "") => {
  const values = String(rawValue || "")
    .split(",")
    .map(normalizePropertyId)
    .filter(Boolean);

  return [...new Set(values)].slice(0, MAX_SHARE_SELECTION);
};

export const isPropertyId = (value = "") =>
  PROPERTY_ID_PATTERN.test(String(value || "").trim());

const absoluteUrl = (path) => {
  if (typeof window === "undefined") return path;
  return new URL(path, window.location.origin).toString();
};

export const buildPropertyShareUrl = (propertyId) =>
  absoluteUrl(`/propiedad/${encodeURIComponent(propertyId)}`);

export const buildSelectionShareUrl = (ids = []) => {
  const clean = [...new Set(ids.map(normalizePropertyId).filter(Boolean))].slice(
    0,
    MAX_SHARE_SELECTION,
  );
  if (!clean.length) return "";
  return absoluteUrl(
    `/propiedades?ids=${clean.map(encodeURIComponent).join(",")}`,
  );
};

export const copyToClipboard = async (text) => {
  if (!text) return false;

  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Seguimos con el respaldo para navegadores sin permiso de portapapeles.
  }

  try {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    const copied = document.execCommand("copy");
    document.body.removeChild(textarea);
    return copied;
  } catch {
    return false;
  }
};

/**
 * Usa Web Share API cuando está disponible. Si el usuario cancela, no hace
 * nada; si falla o no existe, copia el enlace al portapapeles.
 *
 * @returns {"shared"|"cancelled"|"copied"|"manual"}
 */
export const shareContent = async ({ title = "", text = "", url = "" }) => {
  if (
    typeof navigator !== "undefined" &&
    typeof navigator.share === "function" &&
    url
  ) {
    try {
      await navigator.share({ title, text, url });
      return "shared";
    } catch (error) {
      if (error?.name === "AbortError") return "cancelled";
    }
  }

  return (await copyToClipboard(url)) ? "copied" : "manual";
};
