import es from "./es.json";
import en from "./en.json";
import { DEFAULT_LANGUAGE, normalizeLanguage } from "./languages.js";

const translations = { es, en };

let activeLanguage = DEFAULT_LANGUAGE;

export const setActiveLanguage = (language) => {
  activeLanguage = normalizeLanguage(language);
};

export const getActiveLanguage = () => activeLanguage;

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

export const translate = (key, variables = {}, language = activeLanguage) => {
  const normalized = normalizeLanguage(language);
  const activeValue = resolveTranslation(translations[normalized], key);
  const fallbackValue = resolveTranslation(
    translations[DEFAULT_LANGUAGE],
    key,
  );
  const value =
    typeof activeValue === "string" ? activeValue : fallbackValue;
  if (typeof value !== "string") return key;
  return interpolate(value, variables);
};
