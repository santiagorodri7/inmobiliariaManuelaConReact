import {
  collection,
  doc,
  getDocs,
  runTransaction,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db, requireFirebase } from "./firebase.js";
import { appError } from "../utils/errors.js";
import { isFutureDate, isWithinRange, parseDateInput, toDate } from "../utils/dates.js";
import { isValidEmail } from "../utils/validation.js";
import { normalizeText, safeString } from "../utils/format.js";

const SALES = "ventas";

export const normalizeSale = (id, raw = {}) => ({
  id,
  propertyId: safeString(raw.propertyId || ""),
  propertyTitle: safeString(raw.propertyTitle || "Propiedad"),
  operation: raw.operation === "renta" ? "renta" : "venta",
  sellerId: safeString(raw.sellerId || ""),
  sellerName: safeString(raw.sellerName || ""),
  buyerId: safeString(raw.buyerId || ""),
  buyerName: safeString(raw.buyerName || ""),
  buyerEmail: safeString(raw.buyerEmail || ""),
  buyerPhone: safeString(raw.buyerPhone || ""),
  closingValue: Number(raw.closingValue || 0) || 0,
  currency: raw.currency || "COP",
  closingDate: toDate(raw.closingDate),
  status: raw.status === "anulada" ? "anulada" : "cerrada",
  notes: safeString(raw.notes || ""),
  createdBy: safeString(raw.createdBy || ""),
  createdAt: toDate(raw.createdAt),
  updatedAt: toDate(raw.updatedAt),
  annulledAt: toDate(raw.annulledAt),
  annulledBy: safeString(raw.annulledBy || ""),
  annulReason: safeString(raw.annulReason || ""),
  raw,
});

export const listSales = async () => {
  requireFirebase();
  const snapshot = await getDocs(collection(db, SALES));
  return snapshot.docs
    .map((item) => normalizeSale(item.id, item.data()))
    .sort((a, b) => {
      const dateA = a.closingDate?.getTime() || 0;
      const dateB = b.closingDate?.getTime() || 0;
      return dateB - dateA;
    });
};

export const registerSale = async ({
  propertyId,
  buyerName,
  buyerEmail = "",
  buyerPhone = "",
  closingValue,
  closingDate,
  operation,
  notes = "",
  admin,
}) => {
  requireFirebase();
  if (!propertyId) throw appError("property/not-found");
  if (!admin?.id) throw appError("auth/requires-login", "Inicia sesión de nuevo.");
  if (!buyerName?.trim() || buyerName.trim().length < 3) {
    throw appError("sale/buyer", "Escribe el nombre del comprador o arrendatario.");
  }
  if (buyerEmail && !isValidEmail(buyerEmail)) {
    throw appError("sale/buyer-email", "El correo del comprador no es válido.");
  }
  const value = Number(closingValue);
  if (!Number.isFinite(value) || value <= 0) {
    throw appError("sale/value", "Ingresa un valor de cierre válido.");
  }
  const date = parseDateInput(closingDate);
  if (!date) throw appError("sale/date", "Selecciona una fecha de cierre válida.");
  if (isFutureDate(date)) {
    throw appError("sale/date-future", "La fecha del cierre no puede ser futura.");
  }

  const propertyRef = doc(db, "propiedades", propertyId);
  const saleRef = doc(collection(db, SALES));
  let result = null;

  await runTransaction(db, async (transaction) => {
    const propertySnapshot = await transaction.get(propertyRef);
    if (!propertySnapshot.exists()) throw appError("property/not-found");
    const property = propertySnapshot.data();
    const status = property.status || "disponible";
    if (status !== "disponible") {
      throw appError(
        "property/not-available",
        "Esta propiedad ya no está disponible para registrar un cierre.",
      );
    }

    const selectedOperation =
      operation === "renta" || operation === "venta"
        ? operation
        : property.operation === "renta"
          ? "renta"
          : "venta";

    let sellerName = safeString(property.ownerName || "");
    if (property.ownerId) {
      const ownerSnapshot = await transaction.get(
        doc(db, "usuarios", property.ownerId),
      );
      if (ownerSnapshot.exists()) {
        sellerName = safeString(ownerSnapshot.data().nombre || sellerName);
      }
    }

    const sale = {
      propertyId,
      propertyTitle: safeString(property.title || "Propiedad"),
      operation: selectedOperation,
      sellerId: safeString(property.ownerId || ""),
      sellerName,
      buyerId: "",
      buyerName: buyerName.trim(),
      buyerEmail: buyerEmail.trim(),
      buyerPhone: buyerPhone.trim(),
      closingValue: value,
      currency: "COP",
      closingDate: Timestamp.fromDate(date),
      status: "cerrada",
      notes: notes.trim(),
      createdBy: admin.id,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    transaction.set(saleRef, sale);
    transaction.update(propertyRef, {
      status: selectedOperation === "renta" ? "rentada" : "vendida",
      saleId: saleRef.id,
      closedAt: Timestamp.fromDate(date),
      updatedAt: serverTimestamp(),
    });

    transaction.set(doc(collection(db, "auditLog")), {
      action: "createSale",
      actorId: admin.id,
      actorEmail: admin.email || "",
      targetType: "venta",
      targetId: saleRef.id,
      details: {
        propertyId,
        propertyTitle: property.title || "",
        closingValue: value,
        operation: selectedOperation,
      },
      createdAt: serverTimestamp(),
    });

    result = { id: saleRef.id, ...sale, closingDate: date };
  });

  return normalizeSale(result.id, result);
};

export const annulSale = async (saleId, { admin, reason = "" } = {}) => {
  requireFirebase();
  if (!saleId) throw appError("sale/not-found");
  if (!admin?.id) throw appError("auth/requires-login", "Inicia sesión de nuevo.");

  const saleRef = doc(db, SALES, saleId);
  let result = null;

  await runTransaction(db, async (transaction) => {
    const saleSnapshot = await transaction.get(saleRef);
    if (!saleSnapshot.exists()) throw appError("sale/not-found");
    const sale = saleSnapshot.data();
    if (sale.status === "anulada") {
      throw appError("sale/already-annulled");
    }

    transaction.update(saleRef, {
      status: "anulada",
      annulledAt: serverTimestamp(),
      annulledBy: admin.id,
      annulReason: reason.trim(),
      updatedAt: serverTimestamp(),
    });

    if (sale.propertyId) {
      const propertyRef = doc(db, "propiedades", sale.propertyId);
      const propertySnapshot = await transaction.get(propertyRef);
      if (propertySnapshot.exists()) {
        transaction.update(propertyRef, {
          status: "disponible",
          saleId: "",
          closedAt: null,
          updatedAt: serverTimestamp(),
        });
      }
    }

    transaction.set(doc(collection(db, "auditLog")), {
      action: "annulSale",
      actorId: admin.id,
      actorEmail: admin.email || "",
      targetType: "venta",
      targetId: saleId,
      details: {
        propertyId: sale.propertyId || "",
        reason: reason.trim(),
      },
      createdAt: serverTimestamp(),
    });

    result = {
      ...sale,
      status: "anulada",
      annulledAt: new Date(),
      annulledBy: admin.id,
      annulReason: reason,
    };
  });

  return normalizeSale(saleId, result);
};

export const filterSales = (sales = [], filters = {}) => {
  const search = normalizeText(filters.search || "");
  return sales.filter((sale) => {
    if (filters.operation && sale.operation !== filters.operation) return false;
    if (filters.status && sale.status !== filters.status) return false;
    if (
      (filters.from || filters.to) &&
      !isWithinRange(sale.closingDate, filters.from, filters.to)
    ) {
      return false;
    }
    if (search) {
      const haystack = normalizeText(
        [
          sale.propertyTitle,
          sale.buyerName,
          sale.buyerEmail,
          sale.sellerName,
          sale.notes,
        ].join(" "),
      );
      if (!haystack.includes(search)) return false;
    }
    return true;
  });
};

export const salesStats = (sales = []) => {
  const closed = sales.filter((sale) => sale.status === "cerrada");
  const totalValue = closed.reduce(
    (total, sale) => total + Number(sale.closingValue || 0),
    0,
  );
  const salesCount = closed.filter((sale) => sale.operation === "venta").length;
  const rentalCount = closed.filter((sale) => sale.operation === "renta").length;
  return {
    total: sales.length,
    closed: closed.length,
    annulled: sales.filter((sale) => sale.status === "anulada").length,
    totalValue,
    averageValue: closed.length ? totalValue / closed.length : 0,
    salesCount,
    rentalCount,
  };
};
