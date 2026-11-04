import { isSupportedLanguage } from "../i18n/languages.js";
import { translate } from "../i18n/translate.js";

export const isValidEmail = (value = "") =>
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(String(value).trim());

const t = (key) => translate(key);

export const validateRegister = (values) => {
  const errors = {};
  if (!values.nombre?.trim() || values.nombre.trim().length < 3) {
    errors.nombre = t("validation.register.name");
  }
  if (!values.cedula?.trim()) {
    errors.cedula = t("validation.register.id");
  }
  if (!values.fechaNacimiento) {
    errors.fechaNacimiento = t("validation.register.birth");
  }
  if (!isValidEmail(values.email)) {
    errors.email = t("validation.register.email");
  }
  if (!values.rol) {
    errors.rol = t("validation.register.role");
  }
  if (!isSupportedLanguage(values.idioma)) {
    errors.idioma = t("language.invalid");
  }
  if (!values.password || values.password.length < 8) {
    errors.password = t("validation.register.password");
  }
  if (values.password !== values.confirmPassword) {
    errors.confirmPassword = t("validation.register.confirm");
  }
  if (!values.terms) {
    errors.terms = t("validation.register.terms");
  }
  return errors;
};

export const validateLogin = (values) => {
  const errors = {};
  if (!isValidEmail(values.email)) errors.email = t("validation.login.email");
  if (!values.password) errors.password = t("validation.login.password");
  return errors;
};

export const validateProperty = (values) => {
  const errors = {};
  if (!values.title?.trim() || values.title.trim().length < 5) {
    errors.title = t("validation.property.title");
  }
  if (!values.location?.trim() || values.location.trim().length < 3) {
    errors.location = t("validation.property.location");
  }
  if (!values.price || Number(values.price) <= 0) {
    errors.price = t("validation.property.price");
  }
  if (!values.type) errors.type = t("validation.property.type");
  if (!values.operation) errors.operation = t("validation.property.operation");
  if (!values.description?.trim() || values.description.trim().length < 20) {
    errors.description = t("validation.property.description");
  }
  if (values.bedrooms && Number(values.bedrooms) < 0) {
    errors.bedrooms = t("validation.property.bedrooms");
  }
  if (values.bathrooms && Number(values.bathrooms) < 0) {
    errors.bathrooms = t("validation.property.bathrooms");
  }
  if (values.area && Number(values.area) < 0) {
    errors.area = t("validation.property.area");
  }
  if (values.stratum && (Number(values.stratum) < 1 || Number(values.stratum) > 6)) {
    errors.stratum = t("validation.property.stratum");
  }
  return errors;
};

export const validateSale = (values) => {
  const errors = {};
  if (!values.propertyId) errors.propertyId = t("validation.sale.property");
  if (!values.buyerName?.trim() || values.buyerName.trim().length < 3) {
    errors.buyerName = t("validation.sale.buyer");
  }
  if (values.buyerEmail && !isValidEmail(values.buyerEmail)) {
    errors.buyerEmail = t("validation.sale.buyerEmail");
  }
  if (!values.closingValue || Number(values.closingValue) <= 0) {
    errors.closingValue = t("validation.sale.value");
  }
  if (!values.closingDate) {
    errors.closingDate = t("validation.sale.date");
  }
  return errors;
};

export const validateContact = (values) => {
  const errors = {};
  if (!values.name?.trim() || values.name.trim().length < 2) {
    errors.name = t("validation.contact.name");
  }
  if (!isValidEmail(values.email)) {
    errors.email = t("validation.contact.email");
  }
  if (!values.subject?.trim()) {
    errors.subject = t("validation.contact.subject");
  }
  if (!values.message?.trim() || values.message.trim().length < 10) {
    errors.message = t("validation.contact.message");
  }
  if (values.phone && values.phone.replace(/\D/g, "").length < 7) {
    errors.phone = t("validation.contact.phone");
  }
  if (!values.acepta) {
    errors.acepta = t("validation.contact.consent");
  }
  return errors;
};

export const validateTestimonial = (values) => {
  const errors = {};
  if (!values.nombre?.trim() || values.nombre.trim().length < 2) {
    errors.nombre = t("validation.testimonial.name");
  }
  if (!values.texto?.trim() || values.texto.trim().length < 20) {
    errors.texto = t("validation.testimonial.text");
  }
  if (!values.rating || Number(values.rating) < 1 || Number(values.rating) > 5) {
    errors.rating = t("validation.testimonial.rating");
  }
  if (!values.acepta) {
    errors.acepta = t("validation.testimonial.consent");
  }
  return errors;
};

export const validatePasswordChange = (values) => {
  const errors = {};
  if (!values.currentPassword) {
    errors.currentPassword = t("validation.password.current");
  }
  if (!values.newPassword || values.newPassword.length < 8) {
    errors.newPassword = t("validation.password.new");
  }
  if (values.newPassword !== values.confirmPassword) {
    errors.confirmPassword = t("validation.password.confirm");
  }
  if (values.currentPassword && values.currentPassword === values.newPassword) {
    errors.newPassword = t("validation.password.different");
  }
  return errors;
};

export const hasErrors = (errors) =>
  Object.values(errors).some((value) => Boolean(value));
