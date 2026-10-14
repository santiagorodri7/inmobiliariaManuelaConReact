// js/testimonios.js
// Módulo de testimonios — leer y guardar en Firestore, colección "testimonios"
import { db } from './auth.js';
import {
    collection,
    addDoc,
    getDocs,
    orderBy,
    query
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

// Reutilizamos la instancia de auth desde la app ya inicializada
const auth = getAuth();

/**
 * Guarda un testimonio nuevo en Firestore.
 * @param {{ nombre: string, texto: string, rating: number }} params
 */
export const guardarTestimonio = async ({ nombre, texto, rating }) => {
    const user = auth.currentUser;

    const testimonio = {
        nombre: nombre.trim(),
        texto: texto.trim(),
        rating: Number(rating),
        fecha: new Date().toISOString().split('T')[0],
        userId: user ? user.uid : null,
        email: user ? user.email : null
    };

    const docRef = await addDoc(collection(db, 'testimonios'), testimonio);
    return docRef.id;
};

/**
 * Obtiene todos los testimonios ordenados por fecha descendente.
 * @returns {Promise<Array<{id: string, nombre: string, texto: string, rating: number, fecha: string}>>}
 */
export const obtenerTestimonios = async () => {
    const q = query(collection(db, 'testimonios'), orderBy('fecha', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};
