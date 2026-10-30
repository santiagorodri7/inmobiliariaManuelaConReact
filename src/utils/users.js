import { dateInputValue } from "./dates.js";
import { normalizeRole } from "./roles.js";
import { safeString } from "./format.js";

export const normalizeUser = (id, data = {}, authUser = null) => {
  const email = safeString(data.email || authUser?.email);
  const nombre =
    safeString(data.nombre || data.displayName || authUser?.displayName) ||
    (email ? email.split("@")[0] : "Usuario");

  return {
    id,
    nombre,
    email,
    cedula: safeString(data.cedula),
    fechaNacimiento: dateInputValue(data.fechaNacimiento),
    rol: normalizeRole(data.rol || data.role),
    activo: data.activo !== false,
    fechaRegistro: data.fechaRegistro || data.createdAt || null,
    telefono: safeString(data.telefono),
    direccion: safeString(data.direccion),
    avatar: safeString(data.avatar),
    preferences:
      data.preferences && typeof data.preferences === "object"
        ? {
            operation: data.preferences.operation || "",
            zone: data.preferences.zone || "",
            propertyType: data.preferences.propertyType || "",
            maxBudget: data.preferences.maxBudget || "",
          }
        : {
            operation: "",
            zone: "",
            propertyType: "",
            maxBudget: "",
          },
  };
};

export const userDisplayName = (profile) =>
  profile?.nombre || profile?.email || "Usuario";

export const userInitials = (profile) => {
  const name = userDisplayName(profile);
  const parts = name.split(/\s+/).filter(Boolean);
  if (!parts.length) return "MB";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
};

export const profileCompletion = (profile) => {
  const fields = [
    profile?.nombre,
    profile?.email,
    profile?.telefono,
    profile?.direccion,
    profile?.cedula,
    profile?.fechaNacimiento,
  ];
  const complete = fields.filter(Boolean).length;
  return Math.round((complete / fields.length) * 100);
};
