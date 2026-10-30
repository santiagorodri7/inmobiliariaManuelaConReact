import { Mail, ShieldAlert } from "lucide-react";
import { mailtoUrl, site } from "../../config/site.js";

export default function DangerZone({ profile }) {
  return (
    <section className="surface danger-zone">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Privacidad</p>
          <h2>Tu cuenta y tus datos</h2>
        </div>
      </div>
      <div className="danger-zone__body">
        <span className="danger-zone__icon" aria-hidden="true">
          <ShieldAlert size={22} />
        </span>
        <div>
          <h3>Eliminación de la cuenta</h3>
          <p>
            La eliminación definitiva se realiza con verificación de identidad y
            permisos administrativos. Si necesitas borrar tu cuenta y tus datos,
            escríbenos desde <strong>{profile?.email}</strong> para gestionarlo
            de forma segura.
          </p>
          <a
            className="btn btn-outline-secondary btn-sm"
            href={mailtoUrl(
              "Solicitud de eliminación de cuenta",
              `Hola ${site.name},\n\nSolicito la eliminación de mi cuenta asociada a ${profile?.email}.\n\nNombre: ${profile?.nombre || ""}`,
            )}
          >
            <Mail size={15} aria-hidden="true" />
            Solicitar eliminación
          </a>
        </div>
      </div>
      <p className="danger-zone__note">
        La desactivación de una cuenta impide el acceso de inmediato y puede
        revertirse. El borrado permanente no está disponible desde el navegador.
      </p>
    </section>
  );
}
