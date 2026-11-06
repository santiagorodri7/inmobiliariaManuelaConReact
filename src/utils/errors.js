import { translate } from "../i18n/translate.js";

const messageKeys = {
  "auth/invalid-credential": "errors.auth.invalidCredential",
  "auth/invalid-login-credentials": "errors.auth.invalidCredential",
  "auth/wrong-password": "errors.auth.invalidCredential",
  "auth/user-not-found": "errors.auth.invalidCredential",
  "auth/invalid-email": "errors.auth.invalidEmail",
  "auth/email-already-in-use": "errors.auth.emailInUse",
  "auth/weak-password": "errors.auth.weakPassword",
  "auth/too-many-requests": "errors.auth.tooManyRequests",
  "auth/network-request-failed": "errors.auth.network",
  "auth/user-disabled": "errors.auth.userDisabled",
  "auth/requires-recent-login": "errors.auth.recentLogin",
  "auth/operation-not-allowed": "errors.auth.operationNotAllowed",
  "auth/requires-login": "errors.auth.requiresLogin",
  "auth/invalid-role": "errors.invalidRole",
  "permission-denied": "errors.permissionDenied",
  unavailable: "errors.unavailable",
  "storage/unauthorized": "errors.storage.unauthorized",
  "storage/canceled": "errors.storage.canceled",
  "storage/timeout": "errors.storage.timeout",
  "storage/retry-limit-exceeded": "errors.storage.retry",
  "storage/unknown": "errors.storage.unknown",
  "functions/not-found": "errors.functions.notFound",
  "functions/unavailable": "errors.functions.unavailable",
  "functions/internal": "errors.functions.internal",
  "functions/resource-exhausted": "errors.functions.resourceExhausted",
  "functions/invalid-argument": "errors.functions.invalidArgument",
  "functions/failed-precondition": "errors.functions.failedPrecondition",
  "app/not-configured": "errors.app.notConfigured",
  "profile/not-found": "errors.profile.notFound",
  "profile/disabled": "errors.profile.disabled",
  "property/not-available": "errors.property.notAvailable",
  "property/not-found": "errors.property.notFound",
  "sale/not-found": "errors.sale.notFound",
  "sale/already-annulled": "errors.sale.annulled",
  "storage/base64-too-large": "errors.storage.base64TooLarge",
  "storage/base64-batch-too-large": "errors.storage.base64BatchTooLarge",
  "storage/not-available": "errors.storage.notAvailable",
  "storage/bucket-missing": "errors.storage.bucketMissing",
  "storage/image-error": "errors.storage.imageError",
  "storage/invalid-file": "errors.storage.invalidFile",
  "contact/not-configured": "errors.contact.notConfigured",
  "contact/name": "validation.contact.name",
  "contact/email": "validation.contact.email",
  "contact/message": "validation.contact.message",
  "language/invalid": "errors.language.invalid",
  "export/no-rows": "errors.export.noRows",
  "property/locked": "errors.property.locked",
  "property/invalid-status": "errors.property.invalidStatus",
  "sale/buyer": "validation.sale.buyer",
  "sale/buyer-email": "validation.sale.buyerEmail",
  "sale/value": "validation.sale.value",
  "sale/date": "errors.sale.date",
  "sale/date-future": "errors.sale.dateFuture",
  "testimonial/requires-login": "errors.testimonial.loginRequired",
  "testimonial/name": "validation.testimonial.name",
  "testimonial/text": "validation.testimonial.text",
  "testimonial/rating": "validation.testimonial.rating",
  "testimonial/status": "errors.testimonial.status",
};

const looksLikeKey = (value) =>
  typeof value === "string" && /^[a-zA-Z0-9]+(\.[a-zA-Z0-9]+)+$/.test(value);

const renderFallback = (fallback) =>
  looksLikeKey(fallback) ? translate(fallback) : fallback;

export const appError = (code, message) => {
  const error = new Error(
    message || (messageKeys[code] ? translate(messageKeys[code]) : translate("errors.generic")),
  );
  error.code = code;
  return error;
};

export const getErrorMessage = (error, fallback = "errors.generic") => {
  const fallbackText = renderFallback(fallback);
  if (!error) return fallbackText;
  if (error.code && messageKeys[error.code]) {
    return translate(messageKeys[error.code]);
  }
  if (typeof error === "string") return error;
  if (error.message) return error.message;
  return fallbackText;
};

export const isPermissionError = (error) =>
  error?.code === "permission-denied" ||
  error?.code === "storage/unauthorized";
