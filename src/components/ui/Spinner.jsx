import { LoaderCircle } from "lucide-react";
import Logo from "./Logo.jsx";

export function Spinner({ size = 20, label = "Cargando" }) {
  return (
    <span className="spinner" role="status" aria-label={label}>
      <LoaderCircle size={size} className="spin" aria-hidden="true" />
    </span>
  );
}

export function PageLoader({ message = "Cargando…" }) {
  return (
    <div className="page-loader" role="status" aria-live="polite">
      <Logo compact />
      <LoaderCircle size={28} className="spin" aria-hidden="true" />
      <p>{message}</p>
    </div>
  );
}
