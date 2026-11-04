import {
  collection,
  deleteField,
  doc,
  getDocs,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { db, functions, requireFirebase } from "./firebase.js";
import { normalizeStatus } from "../utils/property.js";
import { writeAudit } from "./auditService.js";

const CHUNK_SIZE = 400;

const missingText = (value) =>
  typeof value !== "string" || value.trim().length === 0;

const commitUpdates = async (updates) => {
  for (let index = 0; index < updates.length; index += CHUNK_SIZE) {
    const batch = writeBatch(db);
    updates.slice(index, index + CHUNK_SIZE).forEach(({ reference, data, merge }) => {
      if (merge) batch.set(reference, data, { merge: true });
      else batch.update(reference, data);
    });
    await batch.commit();
  }
};

// Respaldo sin Cloud Functions: un administrador autenticado puede completar
// el estado desde el cliente porque las reglas le permiten editar cualquier
// propiedad y testimonio. La Function sigue siendo la vía principal.
const backfillFromClient = async (admin) => {
  const properties = await getDocs(collection(db, "propiedades"));
  const testimonials = await getDocs(collection(db, "testimonios"));

  const propertyUpdates = properties.docs
    .map((item) => {
      const data = item.data();
      const update = {};
      if (missingText(data.status)) update.status = normalizeStatus(data);
      const removesOwnerEmail = Object.prototype.hasOwnProperty.call(
        data,
        "ownerEmail",
      );
      if (removesOwnerEmail) update.ownerEmail = deleteField();
      if (!Object.keys(update).length) return null;
      update.updatedAt = serverTimestamp();
      return {
        reference: doc(db, "propiedades", item.id),
        data: update,
        removesOwnerEmail,
      };
    })
    .filter(Boolean);

  const emailsRemoved = propertyUpdates.filter(
    (item) => item.removesOwnerEmail,
  ).length;
  const cleanPropertyUpdates = propertyUpdates.map(({ reference, data }) => ({
    reference,
    data,
  }));

  const testimonialOperations = [];
  let testimonialPrivateFieldsRemoved = 0;

  testimonials.docs.forEach((item) => {
    const data = item.data();
    const update = {};
    const hasEmail = Object.prototype.hasOwnProperty.call(data, "email");
    const hasUserId = Object.prototype.hasOwnProperty.call(data, "userId");

    if (missingText(data.estado)) update.estado = "pendiente";
    if (hasEmail) update.email = deleteField();
    if (hasUserId) update.userId = deleteField();

    if (hasUserId && data.userId) {
      testimonialOperations.push({
        reference: doc(db, "testimonios", item.id, "privado", "autor"),
        data: { userId: data.userId, createdAt: serverTimestamp() },
        merge: true,
      });
    }

    if (!Object.keys(update).length) return;
    update.updatedAt = serverTimestamp();
    testimonialOperations.push({
      reference: doc(db, "testimonios", item.id),
      data: update,
    });
    if (hasEmail || hasUserId) testimonialPrivateFieldsRemoved += 1;
  });

  await commitUpdates([...cleanPropertyUpdates, ...testimonialOperations]);

  if (admin?.uid) {
    await writeAudit({
      action: "backfillLegacyData",
      actorId: admin.uid,
      actorEmail: admin.email || "",
      targetType: "sistema",
      targetId: "legacy",
      details: {
        propertiesUpdated: cleanPropertyUpdates.length,
        testimonialsUpdated: testimonialOperations.filter(
          (item) => !item.merge,
        ).length,
        ownerEmailsRemoved: emailsRemoved,
        testimonialPrivateFieldsRemoved,
        source: "client",
      },
    });
  }

  return {
    ok: true,
    propertiesUpdated: cleanPropertyUpdates.length,
    testimonialsUpdated: testimonialOperations.filter((item) => !item.merge)
      .length,
    ownerEmailsRemoved: emailsRemoved,
    testimonialPrivateFieldsRemoved,
    source: "client",
  };
};

export const backfillLegacyData = async (admin = {}) => {
  requireFirebase();

  if (functions) {
    try {
      const callable = httpsCallable(functions, "backfillLegacyData");
      const response = await callable();
      return { ...(response.data || {}), source: "function" };
    } catch (error) {
      // Si la Function aún no está desplegada (plan Spark), el panel puede
      // completar los datos con las reglas de Firestore.
      console.warn("backfillLegacyData: se usará el respaldo del cliente.", error);
    }
  }

  return backfillFromClient(admin);
};
