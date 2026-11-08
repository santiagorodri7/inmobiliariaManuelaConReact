import { useEffect, useRef, useState } from "react";
import { Camera, LoaderCircle, Mail, Save, ShieldCheck, X } from "lucide-react";
import Field from "../ui/Field.jsx";
import Avatar from "../ui/Avatar.jsx";
import { useToast } from "../ui/Toast.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { useI18n } from "../../i18n/I18nContext.jsx";
import { updateOwnProfile } from "../../services/usersService.js";
import { uploadAvatar, validateImageFile } from "../../services/storageService.js";
import { getErrorMessage } from "../../utils/errors.js";
import { dateInputValue } from "../../utils/dates.js";

export default function PersonalInfoForm({ profile, onUpdated }) {
  const toast = useToast();
  const { updateProfileState } = useAuth();
  const { t } = useI18n();
  const fileRef = useRef(null);
  const uploadController = useRef(null);
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
      setError(t("account.personal.emptyName"));
      return;
    }
    setSaving(true);
    setError("");
    try {
      const updated = await updateOwnProfile(profile.id, values);
      updateProfileState(updated);
      onUpdated?.(updated);
      toast.success(t("account.personal.saveSuccess"));
    } catch (saveError) {
      toast.error(getErrorMessage(saveError, "account.personal.saveError"));
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

    const controller = new AbortController();
    uploadController.current = controller;
    setUploading(true);
    try {
      const uploaded = await uploadAvatar(profile.id, file, {
        signal: controller.signal,
      });
      const updated = await updateOwnProfile(profile.id, { avatar: uploaded.url });
      updateProfileState(updated);
      onUpdated?.(updated);
      toast.success(t("account.personal.photoSuccess"));
    } catch (uploadError) {
      if (uploadError?.code === "storage/canceled") {
        toast.info(t("account.personal.photoCanceled"));
      } else {
        toast.error(
          getErrorMessage(uploadError, "account.personal.photoError"),
        );
      }
    } finally {
      if (uploadController.current === controller) {
        uploadController.current = null;
      }
      setUploading(false);
    }
  };

  return (
    <form className="surface profile-form" onSubmit={handleSubmit}>
      <div className="panel-heading">
        <div>
          <p className="eyebrow">{t("account.personal.eyebrow")}</p>
          <h2>{t("account.personal.title")}</h2>
          <p>{t("account.personal.text")}</p>
        </div>
      </div>

      <div className="profile-avatar-row">
        <Avatar profile={profile} size="lg" />
        <div>
          <strong>{t("account.personal.photo")}</strong>
          <p>{t("account.personal.photoText")}</p>
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
            {uploading
              ? t("account.personal.uploading")
              : t("account.personal.changePhoto")}
          </button>
          {uploading && (
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm ms-2"
              onClick={() => uploadController.current?.abort()}
            >
              <X size={15} aria-hidden="true" />
              {t("account.personal.cancel")}
            </button>
          )}
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
        <Field
          label={t("account.personal.name")}
          htmlFor="profile-name"
          required
          error={error}
        >
          <input
            id="profile-name"
            className="form-control"
            value={values.nombre}
            onChange={update("nombre")}
            aria-invalid={Boolean(error)}
          />
        </Field>
        <Field label={t("account.personal.phone")} htmlFor="profile-phone">
          <input
            id="profile-phone"
            type="tel"
            className="form-control"
            value={values.telefono}
            onChange={update("telefono")}
            placeholder={t("account.personal.phonePlaceholder")}
          />
        </Field>
        <Field label={t("account.personal.birth")} htmlFor="profile-birth">
          <input
            id="profile-birth"
            type="date"
            className="form-control"
            value={values.fechaNacimiento}
            onChange={update("fechaNacimiento")}
          />
        </Field>
        <Field
          label={t("account.personal.address")}
          htmlFor="profile-address"
          hint={t("account.personal.addressHint")}
        >
          <input
            id="profile-address"
            className="form-control"
            value={values.direccion}
            onChange={update("direccion")}
            placeholder={t("account.personal.addressPlaceholder")}
          />
        </Field>
        <Field
          label={t("account.personal.email")}
          htmlFor="profile-email"
          hint={t("account.personal.emailHint")}
        >
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
        <Field
          label={t("account.personal.id")}
          htmlFor="profile-id"
          hint={t("account.personal.idHint")}
        >
          <div className="input-with-icon">
            <ShieldCheck size={17} aria-hidden="true" />
            <input
              id="profile-id"
              className="form-control"
              value={profile?.cedula || t("account.personal.idMissing")}
              readOnly
            />
          </div>
        </Field>
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={saving}>
          <Save size={16} aria-hidden="true" />
          {saving ? t("common.saving") : t("common.saveChanges")}
        </button>
      </div>
    </form>
  );
}
