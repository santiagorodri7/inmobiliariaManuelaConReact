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
  { key: "resumen", label: "nav.dashboard.summary", icon: LayoutDashboard },
  {
    key: "recomendaciones",
    label: "nav.dashboard.recommendations",
    icon: Compass,
  },
  {
    key: "preferencias",
    label: "nav.dashboard.preferences",
    icon: SlidersHorizontal,
  },
  { key: "cuenta", label: "nav.dashboard.account", icon: UserRound, to: "/cuenta" },
];

export const sellerNav = [
  { key: "resumen", label: "nav.dashboard.summary", icon: LayoutDashboard },
  { key: "publicar", label: "nav.dashboard.publish", icon: Plus },
  {
    key: "propiedades",
    label: "nav.dashboard.properties",
    icon: Building2,
  },
  { key: "cuenta", label: "nav.dashboard.account", icon: UserRound, to: "/cuenta" },
];

export const adminNav = [
  { key: "resumen", label: "nav.dashboard.summary", icon: LayoutDashboard },
  {
    key: "propiedades",
    label: "nav.dashboard.adminProperties",
    icon: Building2,
  },
  { key: "usuarios", label: "nav.dashboard.users", icon: Users },
  { key: "ventas", label: "nav.dashboard.sales", icon: Handshake },
  {
    key: "reportes",
    label: "nav.dashboard.reports",
    icon: FileSpreadsheet,
    to: "/admin/reportes-ventas",
  },
  { key: "cuenta", label: "nav.dashboard.account", icon: UserRound, to: "/cuenta" },
];

export const accountNav = [
  { key: "perfil", label: "nav.dashboard.account", icon: UserRound },
  { key: "seguridad", label: "nav.dashboard.security", icon: LockKeyhole },
];
