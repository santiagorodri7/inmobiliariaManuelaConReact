import {
  collection,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { auth, db, requireFirebase } from "./firebase.js";
import { normalizeUser } from "../utils/users.js";
import { dateInputValue, toDate } from "../utils/dates.js";

export const getUserProfile = async (uid) => {
  if (!uid || !db) return null;
  const snapshot = await getDoc(doc(db, "usuarios", uid));
  if (!snapshot.exists()) return null;
  return normalizeUser(snapshot.id, snapshot.data(), auth?.currentUser);
};

export const listUsers = async () => {
  requireFirebase();
  const snapshot = await getDocs(collection(db, "usuarios"));
  return snapshot.docs
    .map((item) => normalizeUser(item.id, item.data()))
    .sort((a, b) => {
      const dateA = toDate(a.fechaRegistro)?.getTime() || 0;
      const dateB = toDate(b.fechaRegistro)?.getTime() || 0;
      if (dateA !== dateB) return dateB - dateA;
      return a.nombre.localeCompare(b.nombre, "es");
    });
};

const cleanProfilePayload = (values = {}) => {
  const payload = {};
  if (values.nombre !== undefined) payload.nombre = String(values.nombre).trim();
  if (values.telefono !== undefined) {
    payload.telefono = String(values.telefono).trim();
  }
  if (values.direccion !== undefined) {
    payload.direccion = String(values.direccion).trim();
  }
  if (values.avatar !== undefined) payload.avatar = String(values.avatar || "");
  if (values.fechaNacimiento !== undefined) {
    payload.fechaNacimiento = dateInputValue(values.fechaNacimiento);
  }
  if (values.preferences !== undefined) {
    payload.preferences = {
      operation: values.preferences.operation || "",
      zone: String(values.preferences.zone || "").trim(),
      propertyType: values.preferences.propertyType || "",
      maxBudget: Number(values.preferences.maxBudget) || 0,
    };
  }
  payload.updatedAt = serverTimestamp();
  return payload;
};

export const updateOwnProfile = async (uid, values) => {
  requireFirebase();
  if (!uid) throw new Error("No hay un usuario autenticado.");
  const payload = cleanProfilePayload(values);
  await updateDoc(doc(db, "usuarios", uid), payload);
  const updated = await getUserProfile(uid);
  return updated;
};

export const setUserActive = async (uid, active, adminId) => {
  requireFirebase();
  await updateDoc(doc(db, "usuarios", uid), {
    activo: Boolean(active),
    deactivatedAt: active ? null : serverTimestamp(),
    deactivatedBy: active ? null : adminId || "",
    updatedAt: serverTimestamp(),
  });
};
