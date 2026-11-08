const copFormatters = new Map();
const numberFormatters = new Map();

const getCopFormatter = (locale) => {
  if (!copFormatters.has(locale)) {
    copFormatters.set(
      locale,
      new Intl.NumberFormat(locale, {
        style: "currency",
        currency: "COP",
        maximumFractionDigits: 0,
      }),
    );
  }
  return copFormatters.get(locale);
};

const getNumberFormatter = (locale) => {
  if (!numberFormatters.has(locale)) {
    numberFormatters.set(
      locale,
      new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }),
    );
  }
  return numberFormatters.get(locale);
};

export const formatCOP = (value, locale = "es-CO") =>
  getCopFormatter(locale).format(Number(value) || 0);

export const formatCopInput = (value) => {
  const digits = String(value ?? "").replace(/\D/g, "").slice(0, 12);
  return digits ? formatCOP(Number(digits)) : "";
};

export const formatNumber = (value, locale = "es-CO") =>
  getNumberFormatter(locale).format(Number(value) || 0);

export const formatArea = (value, locale = "es-CO") => {
  const area = Number(value);
  if (!area) return "";
  return `${formatNumber(area, locale)} m²`;
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
