import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import es from "./es.json";
import en from "./en.json";
import {
  DEFAULT_LANGUAGE,
  detectBrowserLanguage,
  isSupportedLanguage,
  normalizeLanguage,
} from "./languages.js";
import { formatDate, formatDateTime } from "../utils/dates.js";
import { formatArea, formatCOP, formatNumber } from "../utils/format.js";

const VISITOR_LANGUAGE_KEY = "manuela.idioma.visitante";

const translations = { es, en };

const resolveTranslation = (table, key) =>
  String(key)
    .split(".")
    .reduce(
      (value, part) =>
        value && typeof value === "object" ? value[part] : undefined,
      table,
    );

const interpolate = (value, variables) =>
  value.replace(/\{\{(\w+)\}\}/g, (match, name) =>
    variables[name] === undefined ? match : String(variables[name]),
  );

const readVisitorLanguage = () => {
  if (typeof window === "undefined") return detectBrowserLanguage();
  try {
    const stored = window.localStorage.getItem(VISITOR_LANGUAGE_KEY);
    if (isSupportedLanguage(stored)) return stored;
  } catch {
    // localStorage puede estar bloqueado; usamos el idioma del navegador.
  }
  return detectBrowserLanguage();
};

const persistVisitorLanguage = (language) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(VISITOR_LANGUAGE_KEY, language);
  } catch {
    // No es crítico: el idioma sigue activo durante la sesión.
  }
};

const I18nContext = createContext(null);

export function I18nProvider({ children }) {
  const [language, setLanguageState] = useState(readVisitorLanguage);

  const locale = language === "en" ? "en-US" : "es-CO";

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = useCallback((nextLanguage, { persistVisitor = false } = {}) => {
    if (!isSupportedLanguage(nextLanguage)) return false;
    setLanguageState(nextLanguage);
    if (persistVisitor) persistVisitorLanguage(nextLanguage);
    return true;
  }, []);

  const resetToVisitorLanguage = useCallback(() => {
    setLanguageState(readVisitorLanguage());
  }, []);

  const t = useCallback(
    (key, variables = {}) => {
      const activeValue = resolveTranslation(translations[language], key);
      const fallbackValue = resolveTranslation(
        translations[DEFAULT_LANGUAGE],
        key,
      );
      const value =
        typeof activeValue === "string" ? activeValue : fallbackValue;
      if (typeof value !== "string") return key;
      return interpolate(value, variables);
    },
    [language],
  );

  const value = useMemo(
    () => ({
      language: normalizeLanguage(language),
      locale,
      setLanguage,
      resetToVisitorLanguage,
      t,
      formatDate: (date, fallback = "—") =>
        formatDate(date, fallback, locale),
      formatDateTime: (date, fallback = "—") =>
        formatDateTime(date, fallback, locale),
      formatCOP: (amount) => formatCOP(amount, locale),
      formatNumber: (amount) => formatNumber(amount, locale),
      formatArea: (area) => formatArea(area, locale),
    }),
    [language, locale, resetToVisitorLanguage, setLanguage, t],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n debe usarse dentro de I18nProvider.");
  }
  return context;
};
