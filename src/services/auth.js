//este es el js de la base de datos, aca estan toda las apis y lo que se requiere para que la base de datos funcione bien
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  deleteUser,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc,
  collection,
  getDocs,
  deleteDoc,
  getDoc,
  updateDoc,
  query,
  where,
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyC_R9dW12aW4-1-FsOeuwXmKOqccWGl7M8",
  authDomain: "registrologininmobiliaria.firebaseapp.com",
  projectId: "registrologininmobiliaria",
  storageBucket: "registrologininmobiliaria.firebasestorage.app",
  messagingSenderId: "19537440445",
  appId: "1:19537440445:web:632de5e06471d8dfe1fd14",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
export const db = getFirestore(app);

export const registrarUsuarioCompleto = async (email, pass, datosExtra) => {
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    pass,
  );
  const user = userCredential.user;

  // Guarda los datos extra en la colección "usuarios"
  // activo: true por defecto al registrar
  await setDoc(doc(db, "usuarios", user.uid), {
    nombre: datosExtra.nombre,
    cedula: datosExtra.cedula,
    fechaNacimiento: datosExtra.fecha,
    email: email,
    rol: datosExtra.rol || "No especificado",
    activo: true,
  });
  return user;
};

export const iniciarSesion = async (email, pass) => {
  // Verificar si la cuenta está activa antes de permitir login
  const snapshot = await getDocs(
    query(collection(db, "usuarios"), where("email", "==", email)),
  );
  if (!snapshot.empty) {
    const userData = snapshot.docs[0].data();
    if (userData.activo === false) {
      throw new Error("CUENTA_DESACTIVADA");
    }
  }
  return signInWithEmailAndPassword(auth, email, pass);
};

export const obtenerUsuarios = async () => {
  const querySnapshot = await getDocs(collection(db, "usuarios"));
  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

// Búsqueda de usuarios por email, nombre o cédula
export const buscarUsuarios = async (termino) => {
  if (!termino || termino.trim() === "") {
    return await obtenerUsuarios();
  }
  const terminoLower = termino.toLowerCase().trim();
  const todos = await obtenerUsuarios();
  return todos.filter((user) => {
    const nombre = (user.nombre || "").toLowerCase();
    const email = (user.email || "").toLowerCase();
    const cedula = (user.cedula || "").toLowerCase();
    return (
      nombre.includes(terminoLower) ||
      email.includes(terminoLower) ||
      cedula.includes(terminoLower)
    );
  });
};

// Activar o desactivar una cuenta de usuario
export const toggleEstadoUsuario = async (userId, nuevoEstado) => {
  await updateDoc(doc(db, "usuarios", userId), {
    activo: nuevoEstado,
  });
};

export const verificarEstadoSesion = (callback) => {
  return onAuthStateChanged(auth, callback);
};

export const obtenerUsuarioActual = async () => {
  const user = auth.currentUser;
  if (user) {
    const userDoc = await getDoc(doc(db, "usuarios", user.uid));
    if (userDoc.exists()) {
      return { id: user.uid, ...userDoc.data() };
    }
  }
  return null;
};

export const eliminarUsuario = async (userId) => {
  await deleteDoc(doc(db, "usuarios", userId));
};

// ============================================
// FUNCIONES PARA GESTIÓN DE SEGURIDAD
// ============================================

// Exportar instancia de auth para uso en otros módulos
export { getAuth };

// Función para cambiar contraseña
export const cambiarPassword = async (currentPassword, newPassword) => {
  const user = auth.currentUser;
  if (!user) throw new Error("Usuario no autenticado");

  const credential = EmailAuthProvider.credential(user.email, currentPassword);
  await reauthenticateWithCredential(user, credential);
  await updatePassword(user, newPassword);
};

// Función para eliminar cuenta
export const eliminarCuentaUsuario = async () => {
  const user = auth.currentUser;
  if (!user) throw new Error("Usuario no autenticado");

  await deleteDoc(doc(db, "usuarios", user.uid));
  await deleteUser(user);
};

// Función para actualizar datos del usuario en Firestore
export const actualizarUsuario = async (userId, datos) => {
  if (!userId) throw new Error("ID de usuario requerido");
  await updateDoc(doc(db, "usuarios", userId), datos);
};

// Función para cerrar sesión
export const cerrarSesion = async () => {
  await signOut(auth);
};
