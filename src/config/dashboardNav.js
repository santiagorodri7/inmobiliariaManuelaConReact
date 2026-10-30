import {
  Building2,
  Compass,
  FileSpreadsheet,
  Handshake,
  LayoutDashboard,
  LockKeyhole,
  Plus,
  SlidersHorizontal,
  UserRound,
  Users,
} from "lucide-react";

export const buyerNav = [
  { key: "resumen", label: "Resumen", icon: LayoutDashboard },
  { key: "recomendaciones", label: "Recomendaciones", icon: Compass },
  { key: "preferencias", label: "Mis preferencias", icon: SlidersHorizontal },
  { key: "cuenta", label: "Mi perfil", icon: UserRound, to: "/cuenta" },
];

export const sellerNav = [
  { key: "resumen", label: "Resumen", icon: LayoutDashboard },
  { key: "publicar", label: "Publicar propiedad", icon: Plus },
  { key: "propiedades", label: "Mis propiedades", icon: Building2 },
  { key: "cuenta", label: "Mi perfil", icon: UserRound, to: "/cuenta" },
];

export const adminNav = [
  { key: "resumen", label: "Resumen", icon: LayoutDashboard },
  { key: "propiedades", label: "Propiedades", icon: Building2 },
  { key: "usuarios", label: "Usuarios", icon: Users },
  { key: "ventas", label: "Cierres", icon: Handshake },
  { key: "reportes", label: "Reporte de ventas", icon: FileSpreadsheet, to: "/admin/reportes-ventas" },
  { key: "cuenta", label: "Mi perfil", icon: UserRound, to: "/cuenta" },
];

export const accountNav = [
  { key: "perfil", label: "Mi perfil", icon: UserRound },
  { key: "seguridad", label: "Seguridad", icon: LockKeyhole },
];
