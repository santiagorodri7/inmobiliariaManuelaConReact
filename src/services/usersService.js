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
import { appError } from "../utils/errors.js";
import { amountValue } from "../config/profileOptions.js";

const PROFILE_COLLECTIONS = ["users", "usuarios"];

const findProfileDocument = async (uid) => {
  for (const collectionName of PROFILE_COLLECTIONS) {
    const snapshot = await getDoc(doc(db, collectionName, uid));
    if (snapshot.exists()) {
      return { collectionName, snapshot };
    }
  }
  return null;
};

export const getUserProfile = async (uid) => {
  if (!uid || !db) return null;
  const found = await findProfileDocument(uid);
  if (!found) return null;
  return normalizeUser(
    found.snapshot.id,
    found.snapshot.data(),
    auth?.currentUser,
    found.collectionName,
  );
};

const readCollectionUsers = async (collectionName) => {
  try {
    const snapshot = await getDocs(collection(db, collectionName));
    return snapshot.docs.map((item) =>
      normalizeUser(item.id, item.data(), null, collectionName),
    );
  } catch (error) {
    // Compatibilidad: si una colección aún no está desplegada o no existe,
    // seguimos mostrando la otra en lugar de romper el panel.
    console.warn(`No se pudo leer la colección ${collectionName}:`, error);
    return [];
  }
};

export const listUsers = async () => {
  requireFirebase();
  const [canonical, legacy] = await Promise.all(
    PROFILE_COLLECTIONS.map(readCollectionUsers),
  );
  const byId = new Map();
  legacy.forEach((user) => byId.set(user.id, user));
  canonical.forEach((user) => byId.set(user.id, user));

  return [...byId.values()].sort((a, b) => {
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
  if (values.estadoCivil !== undefined) {
    payload.estadoCivil = String(values.estadoCivil);
  }
  if (values.tipoContrato !== undefined) {
    payload.tipoContrato = String(values.tipoContrato);
  }
  if (values.ingresosMensuales !== undefined) {
    payload.ingresosMensuales = amountValue(values.ingresosMensuales);
  }
  if (values.ingresosExtras !== undefined) {
    payload.ingresosExtras = amountValue(values.ingresosExtras);
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
  if (!uid) throw appError("auth/requires-login");
  const found = await findProfileDocument(uid);
  if (!found) throw appError("profile/not-found");
  const payload = cleanProfilePayload(values);
  await updateDoc(doc(db, found.collectionName, uid), payload);
  return normalizeUser(
    uid,
    { ...found.snapshot.data(), ...payload, updatedAt: new Date() },
    auth?.currentUser,
    found.collectionName,
  );
};

export const setUserActive = async (uid, active, adminId) => {
  requireFirebase();
  const updates = await Promise.all(
    PROFILE_COLLECTIONS.map(async (collectionName) => {
      const snapshot = await getDoc(doc(db, collectionName, uid));
      return snapshot.exists() ? collectionName : "";
    }),
  );
  const existing = updates.filter(Boolean);
  if (!existing.length) throw appError("profile/not-found");

  await Promise.all(
    existing.map((collectionName) =>
      updateDoc(doc(db, collectionName, uid), {
        activo: Boolean(active),
        deactivatedAt: active ? null : serverTimestamp(),
        deactivatedBy: active ? null : adminId || "",
        updatedAt: serverTimestamp(),
      }),
    ),
  );
};
