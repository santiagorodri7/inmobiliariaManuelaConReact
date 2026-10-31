const crypto = require("node:crypto");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");
const { logger, setGlobalOptions } = require("firebase-functions");
const { HttpsError, onCall } = require("firebase-functions/v2/https");

admin.initializeApp();

const db = admin.firestore();
const { FieldValue, Timestamp } = admin.firestore;

setGlobalOptions({
  region: process.env.FUNCTIONS_REGION || "us-central1",
  maxInstances: 10,
  timeoutSeconds: 60,
});

const enforceAppCheck = process.env.ENFORCE_APP_CHECK === "true";

const clean = (value, max = 2000) =>
  String(value || "")
    .replace(/[\r\n]+/g, " ")
    .trim()
    .slice(0, max);

const cleanMultiline = (value, max = 3000) =>
  String(value || "").trim().slice(0, max);

const escapeHtml = (value) =>
  String(value || "").replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };
    return entities[character];
  });

const normalizeRole = (value) => {
  const role = String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
  if (["admin", "administrador", "administradora"].includes(role)) {
    return "Admin";
  }
  if (["vendedor", "vendedora", "propietario", "arrendador"].includes(role)) {
    return "Vendedor";
  }
  if (["comprador", "compradora", "arrendatario", "cliente"].includes(role)) {
    return "Comprador";
  }
  return "No especificado";
};

const assertAdmin = async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Inicia sesión para continuar.");
  }

  const snapshot = await db.collection("usuarios").doc(request.auth.uid).get();
  if (!snapshot.exists) {
    throw new HttpsError("permission-denied", "No encontramos tu perfil.");
  }

  const profile = snapshot.data();
  if (normalizeRole(profile.rol) !== "Admin") {
    throw new HttpsError("permission-denied", "Esta acción es solo para administración.");
  }
  if (profile.activo === false) {
    throw new HttpsError("permission-denied", "Tu cuenta está desactivada.");
  }

  return { uid: request.auth.uid, ...profile };
};

const assertRecentLogin = (request, maxAgeSeconds = 600) => {
  const authTime = Number(request.auth?.token?.auth_time || 0);
  const age = Math.floor(Date.now() / 1000) - authTime;
  if (!authTime || age > maxAgeSeconds) {
    throw new HttpsError(
      "failed-precondition",
      "Por seguridad, vuelve a iniciar sesión antes de completar esta acción.",
    );
  }
};

// ---------------------------------------------------------------------------
// Contacto
// ---------------------------------------------------------------------------

let mailTransport = null;

const getMailTransport = () => {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    throw new HttpsError(
      "failed-precondition",
      "El envío de correo aún no está configurado.",
    );
  }

  if (!mailTransport) {
    const secure = String(process.env.SMTP_SECURE || "true") === "true";
    mailTransport = nodemailer.createTransport({
      host,
      port: Number(process.env.SMTP_PORT || (secure ? 465 : 587)),
      secure,
      auth: { user, pass },
    });
  }

  return mailTransport;
};

const rateLimitKey = (request, email) => {
  const ip = request.rawRequest?.ip || request.rawRequest?.headers?.["x-forwarded-for"] || "";
  return crypto
    .createHash("sha256")
    .update(`${ip}|${email}`)
    .digest("hex")
    .slice(0, 32);
};

const checkContactRateLimit = async (key) => {
  const reference = db.collection("contactRateLimits").doc(key);
  const now = Date.now();

  await db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(reference);
    const data = snapshot.exists ? snapshot.data() : {};
    const lastSentAt = data.lastSentAt?.toMillis?.() || 0;
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const windowStart = data.windowStart?.toMillis?.() || 0;
    const count = windowStart >= startOfDay.getTime() ? Number(data.count || 0) : 0;

    if (now - lastSentAt < 30 * 1000) {
      throw new HttpsError(
        "resource-exhausted",
        "Espera unos segundos antes de enviar otro mensaje.",
      );
    }
    if (count >= 5) {
      throw new HttpsError(
        "resource-exhausted",
        "Recibimos varios mensajes hoy. Escríbenos directamente por correo.",
      );
    }

    transaction.set(
      reference,
      {
        lastSentAt: Timestamp.fromMillis(now),
        windowStart: Timestamp.fromMillis(
          windowStart >= startOfDay.getTime() ? windowStart : startOfDay.getTime(),
        ),
        count: count + 1,
        expiresAt: Timestamp.fromMillis(now + 2 * 24 * 60 * 60 * 1000),
      },
      { merge: true },
    );
  });
};

exports.sendContactEmail = onCall(
  { enforceAppCheck, cors: true },
  async (request) => {
    const data = request.data || {};

    // Honeypot: el formulario real nunca envía este campo.
    if (clean(data.honeypot, 120)) return { ok: true };

    const payload = {
      name: clean(data.name, 120),
      email: clean(data.email, 180).toLowerCase(),
      phone: clean(data.phone, 40),
      subject: clean(data.subject, 160),
      message: cleanMultiline(data.message, 3000),
      propertyId: clean(data.propertyId, 120),
    };

    if (payload.name.length < 2) {
      throw new HttpsError("invalid-argument", "Escribe tu nombre.");
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(payload.email)) {
      throw new HttpsError("invalid-argument", "Escribe un correo válido.");
    }
    if (payload.message.length < 10) {
      throw new HttpsError("invalid-argument", "Cuéntanos un poco más.");
    }

    await checkContactRateLimit(rateLimitKey(request, payload.email));

    const transport = getMailTransport();
    const to = process.env.CONTACT_TO || process.env.SMTP_USER;
    const from = process.env.CONTACT_FROM || process.env.SMTP_USER;
    const subject = payload.subject
      ? `Contacto web: ${payload.subject}`
      : "Nuevo mensaje desde el sitio web";

    const lines = [
      `Nombre: ${payload.name}`,
      `Correo: ${payload.email}`,
      payload.phone ? `Teléfono: ${payload.phone}` : "",
      payload.propertyId ? `Propiedad: ${payload.propertyId}` : "",
      "",
      payload.message,
    ].filter(Boolean);

    const html = `
      <div style="font-family:Arial,sans-serif;color:#1c2a33;line-height:1.6">
        <h2 style="margin:0 0 16px">Nuevo mensaje desde el sitio web</h2>
        <p><strong>Nombre:</strong> ${escapeHtml(payload.name)}</p>
        <p><strong>Correo:</strong> ${escapeHtml(payload.email)}</p>
        ${payload.phone ? `<p><strong>Teléfono:</strong> ${escapeHtml(payload.phone)}</p>` : ""}
        ${payload.propertyId ? `<p><strong>Propiedad:</strong> ${escapeHtml(payload.propertyId)}</p>` : ""}
        <hr style="border:0;border-top:1px solid #e8e2d7;margin:20px 0" />
        <p style="white-space:pre-line">${escapeHtml(payload.message)}</p>
      </div>
    `;

    try {
      await transport.sendMail({
        from,
        to,
        replyTo: payload.email,
        subject,
        text: lines.join("\n"),
        html,
      });
    } catch (error) {
      logger.error("sendContactEmail: fallo del proveedor SMTP", error);
      throw new HttpsError(
        "internal",
        "No pudimos enviar el mensaje. Escríbenos directamente por correo.",
      );
    }

    return { ok: true };
  },
);

// ---------------------------------------------------------------------------
// Borrado definitivo protegido
// ---------------------------------------------------------------------------

exports.deletePropertyPermanently = onCall(
  { enforceAppCheck, cors: true },
  async (request) => {
    const adminProfile = await assertAdmin(request);
    assertRecentLogin(request);

    const propertyId = clean(request.data?.propertyId, 120);
    if (!propertyId) {
      throw new HttpsError("invalid-argument", "Falta la propiedad.");
    }

    const propertyRef = db.collection("propiedades").doc(propertyId);
    const propertySnapshot = await propertyRef.get();
    if (!propertySnapshot.exists) {
      throw new HttpsError("not-found", "La propiedad ya no existe.");
    }

    const property = propertySnapshot.data();
    if (property.status !== "inactiva") {
      throw new HttpsError(
        "failed-precondition",
        "Primero oculta la propiedad. Solo se pueden borrar definitivamente las propiedades ocultas.",
      );
    }

    const salesSnapshot = await db
      .collection("ventas")
      .where("propertyId", "==", propertyId)
      .limit(10)
      .get();
    const activeSale = salesSnapshot.docs.find(
      (sale) => sale.data().status !== "anulada",
    );
    if (activeSale) {
      throw new HttpsError(
        "failed-precondition",
        "La propiedad tiene un cierre vigente. Anula la venta antes de borrarla.",
      );
    }

    const ownerId = String(property.ownerId || "");
    if (ownerId) {
      const bucket = process.env.STORAGE_BUCKET
        ? admin.storage().bucket(process.env.STORAGE_BUCKET)
        : admin.storage().bucket();
      try {
        await bucket.deleteFiles({
          prefix: `propiedades/${ownerId}/${propertyId}/`,
          force: true,
        });
      } catch (error) {
        logger.warn("deletePropertyPermanently: no se pudieron borrar imágenes", {
          propertyId,
          error: error.message,
        });
      }
    }

    await propertyRef.delete();

    await db.collection("auditLog").add({
      action: "hardDeleteProperty",
      actorId: adminProfile.uid,
      actorEmail: adminProfile.email || request.auth.token.email || "",
      targetType: "propiedad",
      targetId: propertyId,
      details: {
        title: property.title || "",
        ownerId,
        images: Array.isArray(property.images) ? property.images.length : 0,
      },
      createdAt: FieldValue.serverTimestamp(),
    });

    return { ok: true };
  },
);

// ---------------------------------------------------------------------------
// Migración de documentos legacy
// ---------------------------------------------------------------------------

const legacyStatus = (data = {}) => {
  const value = String(data.status || data.estado || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
  if (value.includes("vendid")) return "vendida";
  if (value.includes("rentad") || value.includes("alquilad")) return "rentada";
  if (
    value.includes("inactiv") ||
    value.includes("pausad") ||
    value.includes("ocult") ||
    value.includes("eliminad") ||
    value.includes("borrad")
  ) {
    return "inactiva";
  }
  return "disponible";
};

const flushUpdates = async (operations) => {
  if (!operations.length) return;
  const batch = db.batch();
  operations.forEach(({ reference, data }) => batch.update(reference, data));
  await batch.commit();
  operations.length = 0;
};

exports.backfillLegacyData = onCall(
  { enforceAppCheck, cors: true },
  async (request) => {
    const adminProfile = await assertAdmin(request);

    let propertiesUpdated = 0;
    let testimonialsUpdated = 0;
    let ownerEmailsRemoved = 0;
    const operations = [];

    const properties = await db.collection("propiedades").get();
    properties.forEach((document) => {
      const data = document.data();
      const hasStatus =
        typeof data.status === "string" && data.status.trim().length > 0;
      const hasOwnerEmail = Object.prototype.hasOwnProperty.call(
        data,
        "ownerEmail",
      );
      if (hasStatus && !hasOwnerEmail) return;

      const update = { updatedAt: FieldValue.serverTimestamp() };
      if (!hasStatus) update.status = legacyStatus(data);
      if (hasOwnerEmail) {
        // El correo del propietario no debe ser legible en el catálogo público.
        update.ownerEmail = FieldValue.delete();
        ownerEmailsRemoved += 1;
      }

      operations.push({ reference: document.ref, data: update });
      propertiesUpdated += 1;
    });

    const testimonials = await db.collection("testimonios").get();
    testimonials.forEach((document) => {
      const data = document.data();
      const hasStatus =
        typeof data.estado === "string" && data.estado.trim().length > 0;
      if (hasStatus) return;
      operations.push({
        reference: document.ref,
        data: { estado: "activo" },
      });
      testimonialsUpdated += 1;
    });

    // Firestore limita los batches a 500 operaciones.
    while (operations.length) {
      const chunk = operations.splice(0, 400);
      await flushUpdates(chunk);
    }

    await db.collection("auditLog").add({
      action: "backfillLegacyData",
      actorId: adminProfile.uid,
      actorEmail: adminProfile.email || request.auth.token.email || "",
      targetType: "sistema",
      targetId: "legacy",
      details: { propertiesUpdated, testimonialsUpdated, ownerEmailsRemoved },
      createdAt: FieldValue.serverTimestamp(),
    });

    return {
      ok: true,
      propertiesUpdated,
      testimonialsUpdated,
      ownerEmailsRemoved,
    };
  },
);
