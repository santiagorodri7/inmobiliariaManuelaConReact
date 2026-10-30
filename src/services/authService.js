import {
  EmailAuthProvider,
  createUserWithEmailAndPassword,
  deleteUser,
  reauthenticateWithCredential,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updatePassword,
  updateProfile,
} from "firebase/auth";
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { auth, db, requireFirebase } from "./firebase.js";
import { getUserProfile } from "./usersService.js";
import { normalizeUser } from "../utils/users.js";
import { normalizeRole } from "../utils/roles.js";
import { appError, getErrorMessage, isPermissionError } from "../utils/errors.js";
import { isValidEmail } from "../utils/validation.js";

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const getProfileWithRetry = async (uid, attempts = 4) => {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const profile = await getUserProfile(uid);
    if (profile) return profile;
    if (attempt < attempts - 1) await wait(320 + attempt * 180);
  }
  return null;
};

export const registerUser = async ({
  nombre,
  cedula,
  fechaNacimiento,
  email,
  password,
  telefono = "",
  rol,
}) => {
  requireFirebase();
  const cleanEmail = String(email || "").trim().toLowerCase();
  if (!isValidEmail(cleanEmail)) {
    throw appError("auth/invalid-email", "Escribe un correo válido.");
  }
  if (!password || password.length < 8) {
    throw appError("auth/weak-password");
  }

  const selectedRole = normalizeRole(rol);
  if (!["Comprador", "Vendedor"].includes(selectedRole)) {
    throw appError(
      "auth/invalid-role",
      "El registro público solo permite cuentas de Comprador o Vendedor.",
    );
  }

  let credential;
  try {
    credential = await createUserWithEmailAndPassword(auth, cleanEmail, password);
  } catch (error) {
    if (isPermissionError(error)) {
      throw appError(
        "auth/operation-not-allowed",
        getErrorMessage(error, "No se pudo crear la cuenta."),
      );
    }
    throw error;
  }

  const user = credential.user;
  const createdAt = new Date();

  try {
    await updateProfile(user, { displayName: String(nombre || "").trim() });
    const payload = {
      nombre: String(nombre || "").trim(),
      cedula: String(cedula || "").trim(),
      fechaNacimiento: fechaNacimiento || "",
      email: cleanEmail,
      telefono: String(telefono || "").trim(),
      direccion: "",
      avatar: "",
      rol: selectedRole,
      activo: true,
      fechaRegistro: serverTimestamp(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    await setDoc(doc(db, "usuarios", user.uid), payload);
    return normalizeUser(
      user.uid,
      { ...payload, fechaRegistro: createdAt, createdAt },
      user,
    );
  } catch (error) {
    try {
      await deleteUser(user);
    } catch {
      // Si no se puede limpiar, el usuario queda sin perfil y deberá
      // contactar a la administradora. No ocultamos el error original.
    }
    throw error;
  }
};

export const signInUser = async (email, password) => {
  requireFirebase();
  const cleanEmail = String(email || "").trim().toLowerCase();
  const credential = await signInWithEmailAndPassword(auth, cleanEmail, password);
  const profile = await getUserProfile(credential.user.uid);

  if (!profile) {
    await signOut(auth);
    throw appError("profile/not-found");
  }
  if (profile.activo === false) {
    await signOut(auth);
    throw appError("profile/disabled");
  }
  return profile;
};

export const signOutUser = async () => {
  if (!auth) return;
  await signOut(auth);
};

export const changePassword = async (currentPassword, newPassword) => {
  requireFirebase();
  const user = auth.currentUser;
  if (!user) throw appError("auth/requires-login", "Inicia sesión de nuevo.");
  if (!user.email) {
    throw appError("auth/requires-recent-login");
  }
  if (!newPassword || newPassword.length < 8) {
    throw appError("auth/weak-password");
  }

  const credential = EmailAuthProvider.credential(user.email, currentPassword);
  await reauthenticateWithCredential(user, credential);
  await updatePassword(user, newPassword);
};

export const reauthenticate = async (currentPassword) => {
  requireFirebase();
  const user = auth.currentUser;
  if (!user?.email) throw appError("auth/requires-recent-login");
  const credential = EmailAuthProvider.credential(user.email, currentPassword);
  await reauthenticateWithCredential(user, credential);
  return user;
};

export const requestPasswordReset = async (email) => {
  requireFirebase();
  if (!isValidEmail(email)) {
    throw appError("auth/invalid-email");
  }
  await sendPasswordResetEmail(auth, String(email).trim().toLowerCase());
};

export const readProfileOnce = async (uid) => {
  if (!db) return null;
  const snapshot = await getDoc(doc(db, "usuarios", uid));
  if (!snapshot.exists()) return null;
  return normalizeUser(snapshot.id, snapshot.data(), auth?.currentUser);
};
