export const SUPPORTED_LANGUAGES = Object.freeze(["es", "en"]);

export const DEFAULT_LANGUAGE = "es";

export const isSupportedLanguage = (value) =>
  SUPPORTED_LANGUAGES.includes(value);

export const normalizeLanguage = (value) =>
  isSupportedLanguage(value) ? value : DEFAULT_LANGUAGE;

export const assertSupportedLanguage = (value) => {
  if (!isSupportedLanguage(value)) {
    const error = new Error("El idioma debe ser «es» o «en».");
    error.code = "language/invalid";
    throw error;
  }
  return value;
};

export const detectBrowserLanguage = () => {
  if (typeof navigator === "undefined") return DEFAULT_LANGUAGE;
  const browserLanguage = String(
    navigator.languages?.[0] || navigator.language || "",
  ).toLowerCase();
  return browserLanguage.startsWith("en") ? "en" : DEFAULT_LANGUAGE;
};
