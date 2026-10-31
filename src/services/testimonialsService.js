import {
  addDoc,
  collection,
  getDocs,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { auth, db, requireFirebase } from "./firebase.js";
import { appError } from "../utils/errors.js";
import { normalizeText, safeString } from "../utils/format.js";
import { toDate } from "../utils/dates.js";

const normalizeTestimonial = (id, raw = {}) => ({
  id,
  nombre: safeString(raw.nombre || raw.name || "Cliente"),
  profesion: safeString(raw.profesion || ""),
  texto: safeString(raw.texto || raw.message || ""),
  rating: Math.min(5, Math.max(1, Number(raw.rating) || 5)),
  estado: normalizeText(raw.estado || "activo"),
  fecha: raw.fechaCreacion || raw.fecha || raw.createdAt || null,
  userId: safeString(raw.userId || ""),
  email: safeString(raw.email || ""),
});

export const listTestimonials = async () => {
  requireFirebase();
  const snapshot = await getDocs(
    query(
      collection(db, "testimonios"),
      where("estado", "in", ["activo", "aprobado"]),
    ),
  );
  let documents = snapshot.docs;

  // Respaldo de desarrollo para testimonios legacy sin `estado`.
  if (!documents.length && import.meta.env.DEV) {
    try {
      const legacySnapshot = await getDocs(collection(db, "testimonios"));
      documents = legacySnapshot.docs.filter((item) => {
        const estado = String(item.data().estado || "").toLowerCase();
        return !estado || estado === "activo" || estado === "aprobado";
      });
    } catch {
      // Sin migración ni permisos, la sección queda vacía.
    }
  }

  return documents
    .map((item) => normalizeTestimonial(item.id, item.data()))
    .filter(
      (item) =>
        item.estado === "activo" ||
        item.estado === "aprobado" ||
        item.estado === "",
    )
    .sort((a, b) => {
      const dateA = toDate(a.fecha)?.getTime() || 0;
      const dateB = toDate(b.fecha)?.getTime() || 0;
      return dateB - dateA;
    });
};

export const createTestimonial = async ({ nombre, profesion, texto, rating }) => {
  requireFirebase();
  const user = auth?.currentUser;
  if (!user) {
    throw appError(
      "auth/requires-login",
      "Inicia sesión para compartir tu experiencia.",
    );
  }

  const cleanText = String(texto || "").trim();
  const cleanName = String(nombre || "").trim();
  if (cleanName.length < 2) throw appError("testimonial/name", "Escribe tu nombre.");
  if (cleanText.length < 20) {
    throw appError(
      "testimonial/text",
      "Escribe al menos 20 caracteres sobre tu experiencia.",
    );
  }
  const stars = Number(rating);
  if (!stars || stars < 1 || stars > 5) {
    throw appError("testimonial/rating", "Selecciona una calificación.");
  }

  const reference = await addDoc(collection(db, "testimonios"), {
    nombre: cleanName,
    profesion: String(profesion || "").trim(),
    texto: cleanText,
    rating: stars,
    estado: "activo",
    fecha: new Date().toISOString().slice(0, 10),
    fechaCreacion: serverTimestamp(),
    userId: user.uid,
    email: user.email || "",
  });

  return normalizeTestimonial(reference.id, {
    nombre: cleanName,
    profesion,
    texto: cleanText,
    rating: stars,
    estado: "activo",
    fecha: new Date(),
    userId: user.uid,
    email: user.email,
  });
};
