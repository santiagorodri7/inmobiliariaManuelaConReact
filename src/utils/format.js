const copFormatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

export const formatCOP = (value) =>
  copFormatter.format(Number(value) || 0);

export const formatNumber = (value) =>
  new Intl.NumberFormat("es-CO", { maximumFractionDigits: 0 }).format(
    Number(value) || 0,
  );

export const formatArea = (value) => {
  const area = Number(value);
  if (!area) return "";
  return `${formatNumber(area)} m²`;
};

export const initials = (value = "") => {
  const parts = String(value).trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "MB";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
};

export const normalizeText = (value = "") =>
  String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

export const truncate = (value = "", length = 130) => {
  const text = String(value).trim();
  if (text.length <= length) return text;
  return `${text.slice(0, length).trimEnd()}…`;
};

export const pluralize = (count, singular, plural) =>
  Number(count) === 1 ? singular : plural;

export const safeString = (value) =>
  value === null || value === undefined ? "" : String(value);
