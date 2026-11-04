import {
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { auth, db, requireFirebase } from "./firebase.js";
import { appError } from "../utils/errors.js";
import { normalizeText, safeString } from "../utils/format.js";
import { toDate } from "../utils/dates.js";

// Solo los campos públicos. El correo y el identificador de la cuenta viven
// en la subcolección privada `testimonios/{id}/privado/autor`.
const normalizeTestimonial = (id, raw = {}) => ({
  id,
  nombre: safeString(raw.nombre || raw.name || "Cliente"),
  profesion: safeString(raw.profesion || ""),
  texto: safeString(raw.texto || raw.message || ""),
  rating: Math.min(5, Math.max(1, Number(raw.rating) || 5)),
  estado: normalizeText(raw.estado || "pendiente"),
  fecha: raw.fechaCreacion || raw.fecha || raw.createdAt || null,
});

const byNewestFirst = (a, b) => {
  const dateA = toDate(a.fecha)?.getTime() || 0;
  const dateB = toDate(b.fecha)?.getTime() || 0;
  return dateB - dateA;
};

const moderationRank = (estado) => {
  if (estado === "pendiente") return 0;
  if (estado === "activo" || estado === "aprobado") return 1;
  return 2;
};

export const listTestimonials = async () => {
  requireFirebase();
  const snapshot = await getDocs(
    query(
      collection(db, "testimonios"),
      where("estado", "in", ["activo", "aprobado"]),
    ),
  );

  return snapshot.docs
    .map((item) => normalizeTestimonial(item.id, item.data()))
    .filter(
      (item) => item.estado === "activo" || item.estado === "aprobado",
    )
    .sort(byNewestFirst);
};

export const listAllTestimonials = async () => {
  requireFirebase();
  const snapshot = await getDocs(collection(db, "testimonios"));
  return snapshot.docs
    .map((item) => normalizeTestimonial(item.id, item.data()))
    .sort((a, b) => {
      const rankDiff = moderationRank(a.estado) - moderationRank(b.estado);
      return rankDiff || byNewestFirst(a, b);
    });
};

export const createTestimonial = async ({ nombre, profesion, texto, rating }) => {
  requireFirebase();
  const user = auth?.currentUser;
  if (!user) {
    throw appError("testimonial/requires-login");
  }

  const cleanText = String(texto || "").trim();
  const cleanName = String(nombre || "").trim();
  if (cleanName.length < 2) throw appError("testimonial/name");
  if (cleanText.length < 20) {
    throw appError("testimonial/text");
  }
  const stars = Number(rating);
  if (!stars || stars < 1 || stars > 5) {
    throw appError("testimonial/rating");
  }

  const date = new Date().toISOString().slice(0, 10);
  const reference = doc(collection(db, "testimonios"));
  const batch = writeBatch(db);

  batch.set(reference, {
    nombre: cleanName,
    profesion: String(profesion || "").trim(),
    texto: cleanText,
    rating: stars,
    estado: "pendiente",
    fecha: date,
    fechaCreacion: serverTimestamp(),
  });

  // Datos privados: visibles solo para administración.
  batch.set(doc(db, "testimonios", reference.id, "privado", "autor"), {
    userId: user.uid,
    createdAt: serverTimestamp(),
  });

  await batch.commit();

  return normalizeTestimonial(reference.id, {
    nombre: cleanName,
    profesion,
    texto: cleanText,
    rating: stars,
    estado: "pendiente",
    fecha: date,
  });
};

export const setTestimonialStatus = async (testimonialId, estado, actor = {}) => {
  requireFirebase();
  if (!["pendiente", "aprobado", "inactivo"].includes(estado)) {
    throw appError("testimonial/status");
  }

  await updateDoc(doc(db, "testimonios", testimonialId), {
    estado,
    moderatedAt: serverTimestamp(),
    moderatedBy: actor.uid || actor.id || "",
  });
};
