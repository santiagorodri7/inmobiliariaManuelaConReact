export const ROLES = {
  ADMIN: "Admin",
  SELLER: "Vendedor",
  BUYER: "Comprador",
};

export const normalizeRole = (value) => {
  const role = String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

  if (["admin", "administrador", "administradora"].includes(role)) {
    return ROLES.ADMIN;
  }
  if (["vendedor", "vendedora", "propietario", "arrendador"].includes(role)) {
    return ROLES.SELLER;
  }
  if (["comprador", "compradora", "arrendatario", "cliente"].includes(role)) {
    return ROLES.BUYER;
  }
  return "No especificado";
};

export const isAdmin = (profile) =>
  normalizeRole(profile?.rol || profile?.role) === ROLES.ADMIN;

export const isSeller = (profile) =>
  normalizeRole(profile?.rol || profile?.role) === ROLES.SELLER;

export const isBuyer = (profile) =>
  normalizeRole(profile?.rol || profile?.role) === ROLES.BUYER;

export const roleHome = (profile) => {
  const role = normalizeRole(profile?.rol || profile?.role);
  if (role === ROLES.ADMIN) return "/admin";
  if (role === ROLES.SELLER) return "/vendedor";
  if (role === ROLES.BUYER) return "/comprador";
  return "/";
};

export const roleLabel = (value) => {
  const role = normalizeRole(value);
  return role === "No especificado" ? "Sin rol asignado" : role;
};

export const canPublishProperties = (profile) => {
  const role = normalizeRole(profile?.rol || profile?.role);
  return role === ROLES.SELLER || role === ROLES.ADMIN;
};
