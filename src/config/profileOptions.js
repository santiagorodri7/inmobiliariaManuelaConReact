export const MARITAL_STATUS_VALUES = Object.freeze([
  "soltero",
  "casado",
  "union_libre",
  "divorciado",
  "viudo",
]);

export const CONTRACT_TYPE_VALUES = Object.freeze([
  "indefinido",
  "fijo",
  "prestacion_servicios",
  "independiente",
  "pensionado",
  "otro",
]);

export const ID_DIGITS_REGEX = /^\d{6,12}$/;

export const AMOUNT_DIGITS_REGEX = /^\d{1,12}$/;

export const onlyDigits = (value = "") => String(value).replace(/\D/g, "");

export const amountDigits = (value = "") =>
  onlyDigits(value).slice(0, 12);

export const amountValue = (value = "") => {
  const digits = amountDigits(value);
  return digits ? Number(digits) : 0;
};
