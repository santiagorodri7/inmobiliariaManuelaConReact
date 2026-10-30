import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { auth, db, requireFirebase } from "./firebase.js";
import {
  deleteStoragePaths,
  uploadPropertyImages,
} from "./storageService.js";
import {
  isAvailable,
  normalizeProperty,
  propertyPayload,
  sortProperties,
} from "../utils/property.js";
import { appError } from "../utils/errors.js";
import { writeAudit } from "./auditService.js";

const PROPERTIES = "propiedades";

const propertyId = () =>
  `prop_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

const cleanImages = (images = []) =>
  images
    .filter((image) => image && typeof image.url === "string")
    .map((image) => ({ url: image.url, path: image.path || "" }));

const staleStoragePaths = (existing, keptImages = []) => {
  const keptPaths = new Set(keptImages.map((image) => image.path).filter(Boolean));
  const paths = new Set();
  existing.images.forEach((image) => {
    if (image.path && !keptPaths.has(image.path)) paths.add(image.path);
  });
  if (existing.raw?.imageUrl?.startsWith?.("https://")) {
    // La URL de portada no permite inferir el path; las imágenes nuevas
    // sí guardan path y se eliminan de forma segura.
  }
  return [...paths];
};

export const listProperties = async () => {
  requireFirebase();
  const snapshot = await getDocs(collection(db, PROPERTIES));
  return sortProperties(
    snapshot.docs.map((item) => normalizeProperty(item.id, item.data())),
  );
};

export const listPropertiesByOwner = async (ownerId) => {
  requireFirebase();
  if (!ownerId) return [];
  const snapshot = await getDocs(
    query(collection(db, PROPERTIES), where("ownerId", "==", ownerId)),
  );
  return sortProperties(
    snapshot.docs.map((item) => normalizeProperty(item.id, item.data())),
  );
};

export const getPropertyById = async (id) => {
  requireFirebase();
  if (!id) return null;
  const snapshot = await getDoc(doc(db, PROPERTIES, id));
  if (!snapshot.exists()) return null;
  return normalizeProperty(snapshot.id, snapshot.data());
};

export const saveProperty = async ({
  id = "",
  ownerId,
  ownerName = "",
  ownerEmail = "",
  values,
  newFiles = [],
  keptImages = [],
  imagesChanged = false,
  onProgress,
}) => {
  requireFirebase();
  if (!ownerId) throw appError("auth/requires-login", "Inicia sesión de nuevo.");

  const currentUser = auth?.currentUser;
  if (currentUser && currentUser.uid !== ownerId) {
    throw appError("permission-denied");
  }

  const payload = propertyPayload({
    ...values,
    ownerName,
    ownerEmail,
  });

  if (!id) {
    const newId = propertyId();
    let upload = { images: [], usedFallback: false, skipped: 0 };

    if (newFiles.length) {
      upload = await uploadPropertyImages(ownerId, newId, newFiles, onProgress);
    }

    const imageFields = upload.usedFallback
      ? {
          images: [],
          imageUrl: "",
          imageBase64: upload.images[0]?.url || "",
          storageMode: "base64",
        }
      : {
          images: cleanImages(upload.images),
          imageUrl: upload.images[0]?.url || "",
          imageBase64: "",
          storageMode: "storage",
        };

    const document = {
      id: newId,
      ownerId,
      ...payload,
      ...imageFields,
      featured: false,
      saleId: "",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      fechaRegistro: new Date().toISOString().slice(0, 10),
    };

    try {
      await setDoc(doc(db, PROPERTIES, newId), document);
    } catch (error) {
      await deleteStoragePaths(upload.images.map((image) => image.path));
      throw error;
    }

    return normalizeProperty(newId, {
      ...document,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  const existing = await getPropertyById(id);
  if (!existing) throw appError("property/not-found");
  if (existing.ownerId && existing.ownerId !== ownerId) {
    throw appError("permission-denied");
  }
  if (["vendida", "rentada"].includes(existing.status)) {
    throw appError(
      "property/locked",
      "Esta propiedad tiene un cierre registrado y ya no se puede editar.",
    );
  }

  let upload = { images: [], usedFallback: false, skipped: 0 };
  if (newFiles.length) {
    upload = await uploadPropertyImages(ownerId, id, newFiles, onProgress);
  }

  const updates = {
    ...payload,
    status: values.status === "inactiva" ? "inactiva" : "disponible",
    updatedAt: serverTimestamp(),
  };

  let finalImages = keptImages;
  if (newFiles.length) {
    if (upload.usedFallback) {
      finalImages = [];
      updates.images = [];
      updates.imageUrl = "";
      updates.imageBase64 = upload.images[0]?.url || "";
      updates.storageMode = "base64";
    } else {
      finalImages = [...cleanImages(keptImages), ...cleanImages(upload.images)];
      updates.images = finalImages;
      updates.imageUrl = finalImages[0]?.url || "";
      updates.imageBase64 = "";
      updates.storageMode = "storage";
    }
  } else if (imagesChanged) {
    const webImages = cleanImages(
      keptImages.filter((image) => !image.url.startsWith("data:image/")),
    );
    const base64Image = keptImages.find((image) =>
      image.url.startsWith("data:image/"),
    );
    finalImages = webImages;
    updates.images = webImages;
    updates.imageUrl = webImages[0]?.url || "";
    updates.imageBase64 = base64Image?.url || "";
    updates.storageMode = base64Image ? "base64" : "storage";
  }

  try {
    await updateDoc(doc(db, PROPERTIES, id), updates);
  } catch (error) {
    await deleteStoragePaths(upload.images.map((image) => image.path));
    throw error;
  }

  await deleteStoragePaths(staleStoragePaths(existing, finalImages));

  return normalizeProperty(id, {
    ...existing.raw,
    ...updates,
    images: updates.images || existing.images,
    imageUrl: updates.imageUrl ?? existing.imageUrl,
    imageBase64: updates.imageBase64 ?? existing.imageBase64,
    createdAt: existing.createdAt || new Date(),
    updatedAt: new Date(),
  });
};

export const setPropertyStatus = async (property, status, admin) => {
  requireFirebase();
  if (!property?.id) throw appError("property/not-found");
  if (!["disponible", "inactiva"].includes(status)) {
    throw appError(
      "property/invalid-status",
      "Solo puedes publicar u ocultar una propiedad desde este panel.",
    );
  }
  if (["vendida", "rentada"].includes(property.status)) {
    throw appError(
      "property/locked",
      "Una propiedad con cierre registrado solo cambia al anular la venta.",
    );
  }

  await updateDoc(doc(db, PROPERTIES, property.id), {
    status,
    updatedAt: serverTimestamp(),
  });

  await writeAudit({
    action: status === "disponible" ? "publishProperty" : "hideProperty",
    actorId: admin?.id,
    actorEmail: admin?.email,
    targetType: "propiedad",
    targetId: property.id,
    details: { title: property.title },
  });

  return { ...property, status };
};

export const softDeleteProperty = async (property, actor) => {
  requireFirebase();
  if (!property?.id) throw appError("property/not-found");
  if (!isAvailable(property)) {
    throw appError(
      "property/locked",
      "Solo puedes ocultar propiedades publicadas.",
    );
  }
  await updateDoc(doc(db, PROPERTIES, property.id), {
    status: "inactiva",
    updatedAt: serverTimestamp(),
  });
  await writeAudit({
    action: "softDeleteProperty",
    actorId: actor?.id,
    actorEmail: actor?.email,
    targetType: "propiedad",
    targetId: property.id,
    details: { title: property.title },
  });
  return { ...property, status: "inactiva" };
};

export const propertyStats = (properties = []) => {
  const available = properties.filter(isAvailable);
  const closed = properties.filter((property) =>
    ["vendida", "rentada"].includes(property.status),
  );
  const hidden = properties.filter((property) => property.status === "inactiva");
  const portfolioValue = available.reduce(
    (total, property) => total + Number(property.price || 0),
    0,
  );
  return {
    total: properties.length,
    available: available.length,
    closed: closed.length,
    hidden: hidden.length,
    portfolioValue,
  };
};
