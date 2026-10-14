/*
  ============================================================
  SISTEMA DE PROPIEDADES — localStorage + Firestore
  ============================================================

  Las propiedades se guardan en localStorage (rápido para el
  panel vendedor) y también en Firestore (para el catálogo
  público en home.html).

  Las imágenes se almacenan como Base64 directamente en
  Firestore (campo imageBase64) porque Storage no está
  activado. Límite por documento: 1MB.

  Cuando Storage esté activado:
  1. Reemplazar imageBase64 por subida a Storage
  2. Guardar la URL de descarga en imageUrl
  3. Eliminar imageBase64 de los documentos
  ============================================================
*/

import { collection, doc, setDoc, updateDoc, deleteDoc, getDocs, getDoc, query, where }
  from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { db } from './auth.js';

// ===== HELPERS INTERNOS =====

const generarId = () => `prop_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const obtenerPropiedades = (ownerId) => {
    try {
        const raw = localStorage.getItem(`propiedades_${ownerId}`);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
};

const guardarPropiedades = (ownerId, props) => {
    localStorage.setItem(`propiedades_${ownerId}`, JSON.stringify(props));
};

function comprimirBase64(file, maxWidth = 800, quality = 0.7) {
    return new Promise((resolve) => {
        if (!file || !file.type.startsWith('image/')) return resolve(null);
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                try {
                    const canvas = document.createElement('canvas');
                    const scale = Math.min(maxWidth / img.width, 1);
                    canvas.width = img.width * scale;
                    canvas.height = img.height * scale;
                    const ctx = canvas.getContext('2d');
                    if (!ctx) return resolve(e.target.result);
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    canvas.toBlob((blob) => {
                        if (!blob) return resolve(e.target.result);
                        const fr = new FileReader();
                        fr.onload = () => resolve(fr.result);
                        fr.readAsDataURL(blob);
                    }, 'image/jpeg', quality);
                } catch {
                    resolve(e.target.result);
                }
            };
            img.onerror = () => resolve(null);
            img.src = e.target.result;
        };
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(file);
    });
}

const guardarImagen = async (propId, file) => {
    if (!file) return { marker: null, base64: null };
    console.log('[props] comprimiendo imagen...', file.name || 'imagen', (file.size / 1024).toFixed(1) + 'KB');
    const base64 = await comprimirBase64(file);
    if (!base64) return { marker: null, base64: null };
    const kb = ((base64.length * 3 / 4) / 1024).toFixed(1);
    console.log('[props] imagen comprimida:', kb + 'KB');
    try {
        localStorage.setItem(`prop_img_${propId}`, base64);
        console.log(`[props] imagen guardada en localStorage: prop_img_${propId}`);
    } catch (e) {
        console.warn('[props] localStorage lleno, imagen solo en Firestore');
    }
    return { marker: `__local__${propId}`, base64 };
};

const resolverImagenUrl = (imageUrl, imageBase64) => {
    if (imageUrl && imageUrl.startsWith('__local__')) {
        const propId = imageUrl.replace('__local__', '');
        const local = localStorage.getItem(`prop_img_${propId}`);
        if (local) return local;
    }
    if (imageBase64) return imageBase64;
    if (imageUrl && !imageUrl.startsWith('__local__')) return imageUrl;
    return 'img/placeholder.png';
};

// ===== FIRESTORE HELPERS =====

const guardarEnFirestore = async (data) => {
    try {
        await setDoc(doc(db, 'propiedades', data.id), data);
        console.log('[props] guardado en Firestore:', data.id);
    } catch (e) {
        console.warn('[props] error al guardar en Firestore:', e.message);
    }
};

const actualizarEnFirestore = async (id, data) => {
    try {
        await updateDoc(doc(db, 'propiedades', id), data);
        console.log('[props] actualizado en Firestore:', id);
    } catch (e) {
        console.warn('[props] error al actualizar en Firestore:', e.message);
    }
};

const eliminarDeFirestore = async (id) => {
    try {
        await deleteDoc(doc(db, 'propiedades', id));
        console.log('[props] eliminado de Firestore:', id);
    } catch (e) {
        console.warn('[props] error al eliminar de Firestore:', e.message);
    }
};

// ===== FUNCIONES EXPORTADAS =====

export const addProperty = async (ownerId, property) => {
    const id = generarId();
    let imageUrl = null;
    let imageBase64 = null;

    if (property.file) {
        const result = await guardarImagen(id, property.file);
        imageUrl = result.marker;
        imageBase64 = result.base64;
    } else if (property.image) {
        const result = await guardarImagen(id, property.image);
        imageUrl = result.marker;
        imageBase64 = result.base64;
    }

    const nuevaPropiedad = {
        id,
        ownerId,
        title: property.title || property.titulo || '',
        location: property.location || property.ubicacion || '',
        price: Number(property.price || property.precio || 0),
        type: property.type || property.tipo || '',
        description: property.description || property.descripcion || '',
        imageUrl,
        imageBase64,
        createdAt: new Date().toISOString(),
        fechaRegistro: new Date().toISOString().split('T')[0]
    };

    const props = obtenerPropiedades(ownerId);
    props.push(nuevaPropiedad);
    guardarPropiedades(ownerId, props);

    await guardarEnFirestore(nuevaPropiedad);

    console.log('[props] propiedad creada:', id);
    return id;
};

export const updateProperty = async (id, updates) => {
    let ownerId = updates.ownerId;

    if (!ownerId) {
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('propiedades_')) {
                const arr = JSON.parse(localStorage.getItem(key) || '[]');
                if (arr.some(p => p.id === id)) {
                    ownerId = key.replace('propiedades_', '');
                    break;
                }
            }
        }
    }

    if (!ownerId) {
        console.warn('[props] updateProperty: no se encontró ownerId para', id);
        return;
    }

    const props = obtenerPropiedades(ownerId);
    const idx = props.findIndex(p => p.id === id);
    if (idx === -1) {
        console.warn('[props] updateProperty: propiedad no encontrada', id);
        return;
    }

    const fbUpdates = {};

    if (updates.file) {
        localStorage.removeItem(`prop_img_${id}`);
        const result = await guardarImagen(id, updates.file);
        if (result.marker) {
            props[idx].imageUrl = result.marker;
            props[idx].imageBase64 = result.base64;
            fbUpdates.imageUrl = result.marker;
            fbUpdates.imageBase64 = result.base64;
        }
    } else if (updates.image) {
        localStorage.removeItem(`prop_img_${id}`);
        const result = await guardarImagen(id, updates.image);
        if (result.marker) {
            props[idx].imageUrl = result.marker;
            props[idx].imageBase64 = result.base64;
            fbUpdates.imageUrl = result.marker;
            fbUpdates.imageBase64 = result.base64;
        }
    }

    if (updates.title !== undefined) { props[idx].title = updates.title; fbUpdates.title = updates.title; }
    if (updates.location !== undefined) { props[idx].location = updates.location; fbUpdates.location = updates.location; }
    if (updates.price !== undefined) { props[idx].price = Number(updates.price); fbUpdates.price = Number(updates.price); }
    if (updates.type !== undefined) { props[idx].type = updates.type; fbUpdates.type = updates.type; }
    if (updates.description !== undefined) { props[idx].description = updates.description; fbUpdates.description = updates.description; }

    props[idx].updatedAt = new Date().toISOString();
    fbUpdates.updatedAt = props[idx].updatedAt;
    guardarPropiedades(ownerId, props);

    await actualizarEnFirestore(id, fbUpdates);
    console.log('[props] propiedad actualizada:', id);
};

export const deleteProperty = async (id) => {
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('propiedades_')) {
            const arr = JSON.parse(localStorage.getItem(key) || '[]');
            const propIdx = arr.findIndex(p => p.id === id);
            if (propIdx !== -1) {
                const ownerId = key.replace('propiedades_', '');
                arr.splice(propIdx, 1);
                guardarPropiedades(ownerId, arr);
                break;
            }
        }
    }

    localStorage.removeItem(`prop_img_${id}`);
    await eliminarDeFirestore(id);
    console.log('[props] propiedad eliminada:', id);
};

export const listPropertiesByUser = async (ownerId) => {
    const props = obtenerPropiedades(ownerId);
    console.log(`[props] ${props.length} props en localStorage para owner: ${ownerId}`);
    return props.map(p => ({
        ...p,
        imageUrl: resolverImagenUrl(p.imageUrl, p.imageBase64)
    }));
};

export const listAllProperties = async () => {
    // Intentar desde Firestore primero
    try {
        const q = query(collection(db, 'propiedades'));
        const snap = await getDocs(q);
        const results = snap.docs.map(d => {
            const data = d.data();
            return {
                ...data,
                imageUrl: resolverImagenUrl(data.imageUrl, data.imageBase64)
            };
        });
        if (results.length > 0) {
            console.log(`[props] ${results.length} propiedades obtenidas de Firestore`);
            return results;
        }
    } catch (e) {
        console.warn('[props] Firestore no disponible:', e.message);
    }

    // Fallback: leer de todos los localStorage si Firestore no tiene datos
    const all = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('propiedades_')) {
            try {
                const arr = JSON.parse(localStorage.getItem(key) || '[]');
                arr.forEach(p => all.push({
                    ...p,
                    imageUrl: resolverImagenUrl(p.imageUrl, p.imageBase64)
                }));
            } catch (e) { /* ignorar */ }
        }
    }
    console.log(`[props] ${all.length} propiedades obtenidas de localStorage (fallback)`);
    return all;
};
