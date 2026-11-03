import { httpsCallable } from "firebase/functions";
import { functions } from "./firebase.js";
import { appError } from "../utils/errors.js";
import { isValidEmail } from "../utils/validation.js";
import { mailtoUrl, site } from "../config/site.js";
import { translate } from "../i18n/translate.js";

const CONTACT_FUNCTION = "sendContactEmail";

const clean = (value, max = 2000) =>
  String(value || "").trim().slice(0, max);

const fallbackEndpoint = () => import.meta.env.VITE_CONTACT_FALLBACK_URL || "";

const withTimeout = (promise, ms = 18000) =>
  Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(
        () => reject(appError("functions/unavailable")),
        ms,
      ),
    ),
  ]);

export const contactPayload = (values = {}) => ({
  name: clean(values.name, 120),
  email: clean(values.email, 180).toLowerCase(),
  phone: clean(values.phone, 40),
  subject: clean(values.subject, 160),
  message: clean(values.message, 3000),
  propertyId: clean(values.propertyId, 120),
  honeypot: clean(values.honeypot, 120),
});

export const sendContactMessage = async (values) => {
  const payload = contactPayload(values);

  if (payload.honeypot) return { ok: true };
  if (payload.name.length < 2) {
    throw appError("contact/name");
  }
  if (!isValidEmail(payload.email)) {
    throw appError("contact/email");
  }
  if (payload.message.length < 10) {
    throw appError("contact/message");
  }

  if (functions) {
    try {
      const callable = httpsCallable(functions, CONTACT_FUNCTION);
      const response = await withTimeout(callable(payload));
      return response.data || { ok: true };
    } catch (error) {
      const code = error?.code || "";
      if (
        code === "functions/invalid-argument" ||
        code === "functions/resource-exhausted"
      ) {
        throw error;
      }
      const fallback = fallbackEndpoint();
      if (fallback) {
        try {
          const response = await fetch(fallback, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          if (response.ok) return { ok: true, fallback: "php" };
          throw new Error(`Fallback respondió ${response.status}`);
        } catch (fallbackError) {
          console.error("Fallback de contacto falló:", fallbackError);
        }
      }
      if (
        code === "functions/not-found" ||
        code === "functions/unavailable" ||
        code === "functions/failed-precondition" ||
        code === "functions/internal"
      ) {
        throw appError("contact/not-configured");
      }
      throw error;
    }
  }

  const fallback = fallbackEndpoint();
  if (fallback) {
    const response = await fetch(fallback, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw appError("contact/not-configured");
    }
    return { ok: true, fallback: "php" };
  }

  throw appError("contact/not-configured");
};

export const buildContactMailto = (values = {}) => {
  const payload = contactPayload(values);
  const body = [
    translate("contactForm.mailto.name", { value: payload.name }),
    translate("contactForm.mailto.email", { value: payload.email }),
    payload.phone
      ? translate("contactForm.mailto.phone", { value: payload.phone })
      : "",
    payload.propertyId
      ? translate("contactForm.mailto.property", { value: payload.propertyId })
      : "",
    "",
    payload.message,
  ]
    .filter(Boolean)
    .join("\n");
  return mailtoUrl(
    payload.subject ||
      translate("contactForm.mailto.defaultSubject", { name: site.fullName }),
    body,
  );
};
