import {
  collection,
  doc,
  documentId,
  getDoc,
  getDocs,
  increment,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";
import { db, requireFirebase } from "./firebase.js";
import { isPublicProperty, normalizeProperty } from "../utils/property.js";

const VIEWS = "propertyViews";
const PROPERTIES = "propiedades";

export const MAX_MOST_VIEWED = 6;

export const currentMonthKey = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
};

export const viewDocumentId = (propertyId, month = currentMonthKey()) =>
  `${month}__${propertyId}`;

/**
 * Suma una visita al contador mensual del inmueble.
 *
 * El ID determinista `{mes}__{id}` permite usar `increment(1)` sin leer el
 * documento antes. Las reglas solo aceptan crear con views = 1 o sumar 1.
 */
export const registerPropertyView = async (propertyId) => {
  if (!db || !propertyId) return;
  const month = currentMonthKey();
  await setDoc(
    doc(db, VIEWS, viewDocumentId(propertyId, month)),
    {
      month,
      propertyId,
      views: increment(1),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
};

const readPropertiesByIds = async (ids) => {
  if (!ids.length) return new Map();

  try {
    const snapshot = await getDocs(
      query(
        collection(db, PROPERTIES),
        where(documentId(), "in", ids),
        where("status", "==", "disponible"),
      ),
    );
    return new Map(
      snapshot.docs.map((item) => [
        item.id,
        normalizeProperty(item.id, item.data()),
      ]),
    );
  } catch (error) {
    console.warn("No se pudo resolver la selección en una consulta:", error);
    const entries = await Promise.all(
      ids.map(async (id) => {
        try {
          const snapshot = await getDoc(doc(db, PROPERTIES, id));
          if (!snapshot.exists()) return null;
          return [id, normalizeProperty(id, snapshot.data())];
        } catch {
          return null;
        }
      }),
    );
    return new Map(entries.filter(Boolean));
  }
};

/**
 * Devuelve hasta `max` inmuebles con más visitas en el mes actual.
 *
 * Hace una sola consulta ordenada con límite sobre `propertyViews` y una
 * segunda consulta acotada para resolver los inmuebles. Si no hay datos,
 * devuelve [] y la portada usa los inmuebles recientes como respaldo.
 */
export const listMostViewedProperties = async (max = MAX_MOST_VIEWED) => {
  requireFirebase();
  const month = currentMonthKey();
  const snapshot = await getDocs(
    query(
      collection(db, VIEWS),
      where("month", "==", month),
      orderBy("views", "desc"),
      limit(Math.min(Math.max(max * 2, max), 10)),
    ),
  );

  const ids = snapshot.docs
    .map((item) => item.data().propertyId)
    .filter((value) => typeof value === "string" && value.length > 0)
    .slice(0, 10);

  if (!ids.length) return [];

  const byId = await readPropertiesByIds(ids);
  return ids
    .map((id) => byId.get(id))
    .filter((property) => property && isPublicProperty(property))
    .slice(0, max);
};
