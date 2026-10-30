import { useEffect, useRef, useState } from "react";
import { Camera, LoaderCircle, Mail, Save, ShieldCheck } from "lucide-react";
import Field from "../ui/Field.jsx";
import Avatar from "../ui/Avatar.jsx";
import { useToast } from "../ui/Toast.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { updateOwnProfile } from "../../services/usersService.js";
import { uploadAvatar, validateImageFile } from "../../services/storageService.js";
import { getErrorMessage } from "../../utils/errors.js";
import { dateInputValue } from "../../utils/dates.js";

export default function PersonalInfoForm({ profile, onUpdated }) {
  const toast = useToast();
  const { updateProfileState } = useAuth();
  const fileRef = useRef(null);
  const [values, setValues] = useState({
    nombre: "",
    telefono: "",
    direccion: "",
    fechaNacimiento: "",
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setValues({
      nombre: profile?.nombre || "",
      telefono: profile?.telefono || "",
      direccion: profile?.direccion || "",
      fechaNacimiento: dateInputValue(profile?.fechaNacimiento),
    });
  }, [profile]);

  const update = (field) => (event) =>
    setValues((current) => ({ ...current, [field]: event.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!values.nombre.trim()) {
      setError("El nombre no puede quedar vacío.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const updated = await updateOwnProfile(profile.id, values);
      updateProfileState(updated);
      onUpdated?.(updated);
      toast.success("Tu información se actualizó.");
    } catch (saveError) {
      toast.error(getErrorMessage(saveError, "No se pudo guardar tu información."));
    } finally {
      setSaving(false);
    }
  };

  const handleAvatar = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const message = validateImageFile(file);
    if (message) {
      toast.error(message);
      return;
    }

    setUploading(true);
    try {
      const uploaded = await uploadAvatar(profile.id, file);
      const updated = await updateOwnProfile(profile.id, { avatar: uploaded.url });
      updateProfileState(updated);
      onUpdated?.(updated);
      toast.success("Foto de perfil actualizada.");
    } catch (uploadError) {
      toast.error(
        getErrorMessage(
          uploadError,
          "No se pudo actualizar la foto. Verifica Firebase Storage.",
        ),
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <form className="surface profile-form" onSubmit={handleSubmit}>
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Datos personales</p>
          <h2>Tu información de contacto</h2>
          <p>Estos datos se usan para comunicarnos contigo y no se muestran públicamente.</p>
        </div>
      </div>

      <div className="profile-avatar-row">
        <Avatar profile={profile} size="lg" />
        <div>
          <strong>Foto de perfil</strong>
          <p>Una imagen ayuda a reconocerte dentro de la plataforma.</p>
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? (
              <LoaderCircle size={16} className="spin" aria-hidden="true" />
            ) : (
              <Camera size={16} aria-hidden="true" />
            )}
            {uploading ? "Subiendo…" : "Cambiar foto"}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="visually-hidden"
            onChange={handleAvatar}
          />
        </div>
      </div>

      <div className="form-grid form-grid--two">
        <Field label="Nombre completo" htmlFor="profile-name" required error={error}>
          <input
            id="profile-name"
            className="form-control"
            value={values.nombre}
            onChange={update("nombre")}
            aria-invalid={Boolean(error)}
          />
        </Field>
        <Field label="Teléfono" htmlFor="profile-phone">
          <input
            id="profile-phone"
            type="tel"
            className="form-control"
            value={values.telefono}
            onChange={update("telefono")}
            placeholder="+57 300 000 0000"
          />
        </Field>
        <Field label="Fecha de nacimiento" htmlFor="profile-birth">
          <input
            id="profile-birth"
            type="date"
            className="form-control"
            value={values.fechaNacimiento}
            onChange={update("fechaNacimiento")}
          />
        </Field>
        <Field label="Dirección de contacto" htmlFor="profile-address" hint="Opcional">
          <input
            id="profile-address"
            className="form-control"
            value={values.direccion}
            onChange={update("direccion")}
            placeholder="Ciudad y sector"
          />
        </Field>
        <Field label="Correo electrónico" htmlFor="profile-email" hint="El correo está vinculado a tu cuenta.">
          <div className="input-with-icon">
            <Mail size={17} aria-hidden="true" />
            <input
              id="profile-email"
              className="form-control"
              value={profile?.email || ""}
              readOnly
            />
          </div>
        </Field>
        <Field label="Cédula" htmlFor="profile-id" hint="Solo la administradora puede modificarla.">
          <div className="input-with-icon">
            <ShieldCheck size={17} aria-hidden="true" />
            <input
              id="profile-id"
              className="form-control"
              value={profile?.cedula || "No registrada"}
              readOnly
            />
          </div>
        </Field>
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={saving}>
          <Save size={16} aria-hidden="true" />
          {saving ? "Guardando…" : "Guardar cambios"}
        </button>
      </div>
    </form>
  );
}
