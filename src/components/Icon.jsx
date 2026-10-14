import React from "react";
import {
  AlignLeft,
  Bell,
  Building,
  Building2,
  Camera,
  CloudUpload,
  Download,
  Fingerprint,
  KeyRound,
  Link as LinkIcon,
  LockKeyhole,
  LogOut,
  Mail,
  MapPin,
  Monitor,
  Phone,
  PlusCircle,
  Search,
  Shield,
  SlidersHorizontal,
  TriangleAlert,
  Type,
  Upload,
  UserRound,
  X,
} from "lucide-react";

const icons = {
  "align-left": AlignLeft,
  bell: Bell,
  building: Building,
  "building-2": Building2,
  camera: Camera,
  "cloud-upload": CloudUpload,
  download: Download,
  facebook: LinkIcon,
  fingerprint: Fingerprint,
  key: KeyRound,
  link: LinkIcon,
  lock: LockKeyhole,
  "log-out": LogOut,
  mail: Mail,
  "map-pin": MapPin,
  monitor: Monitor,
  phone: Phone,
  "plus-circle": PlusCircle,
  search: Search,
  shield: Shield,
  "sliders-horizontal": SlidersHorizontal,
  "alert-triangle": TriangleAlert,
  type: Type,
  twitter: LinkIcon,
  upload: Upload,
  user: UserRound,
  x: X,
};

export default function Icon({ name, size = 18, className, ...props }) {
  const IconComponent = icons[name];

  if (!IconComponent) {
    console.error(`Icono no registrado: ${name}`);
    return null;
  }

  return (
    <IconComponent
      aria-hidden="true"
      className={className}
      size={Number(size)}
      {...props}
    />
  );
}
