import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase.js";

export const writeAudit = async ({
  action,
  actorId,
  actorEmail = "",
  targetType = "",
  targetId = "",
  details = {},
}) => {
  if (!db) return null;
  try {
    const reference = await addDoc(collection(db, "auditLog"), {
      action,
      actorId: actorId || "",
      actorEmail,
      targetType,
      targetId,
      details,
      createdAt: serverTimestamp(),
    });
    return reference.id;
  } catch (error) {
    console.warn("No se pudo registrar la auditoría:", error);
    return null;
  }
};
