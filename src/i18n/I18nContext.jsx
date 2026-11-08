import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  detectBrowserLanguage,
  isSupportedLanguage,
  normalizeLanguage,
} from "./languages.js";
import { setActiveLanguage, translate } from "./translate.js";
import {
  amenityLabel,
  contactSubjectLabel,
  operationLabel,
  propertyTypeLabel,
  propertyTypePluralLabel,
  roleLabel,
  saleStatusLabel,
  statusLabel,
  userStatusLabel,
} from "./labels.js";
import { formatDate, formatDateTime } from "../utils/dates.js";
import { formatArea, formatCOP, formatNumber } from "../utils/format.js";

const VISITOR_LANGUAGE_KEY = "manuela.idioma.visitante";

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
    setActiveLanguage(language);
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = useCallback((nextLanguage) => {
    if (!isSupportedLanguage(nextLanguage)) return false;
    setLanguageState(nextLanguage);
    persistVisitorLanguage(nextLanguage);
    return true;
  }, []);

  const t = useCallback(
    (key, variables = {}) => translate(key, variables, language),
    [language],
  );

  const value = useMemo(
    () => ({
      language: normalizeLanguage(language),
      locale,
      setLanguage,
      t,
      operationLabel: (operation) => operationLabel(t, operation),
      statusLabel: (status) => statusLabel(t, status),
      propertyTypeLabel: (type) => propertyTypeLabel(t, type),
      propertyTypePluralLabel: (type) => propertyTypePluralLabel(t, type),
      amenityLabel: (amenity) => amenityLabel(t, amenity),
      roleLabel: (role) => roleLabel(t, role),
      contactSubjectLabel: (subject) => contactSubjectLabel(t, subject),
      saleStatusLabel: (status) => saleStatusLabel(t, status),
      userStatusLabel: (active) => userStatusLabel(t, active),
      formatDate: (date, fallback = "—") =>
        formatDate(date, fallback, locale),
      formatDateTime: (date, fallback = "—") =>
        formatDateTime(date, fallback, locale),
      formatCOP: (amount) => formatCOP(amount, locale),
      formatNumber: (amount) => formatNumber(amount, locale),
      formatArea: (area) => formatArea(area, locale),
    }),
    [language, locale, setLanguage, t],
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
