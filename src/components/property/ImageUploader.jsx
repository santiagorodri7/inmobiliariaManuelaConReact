import { useEffect, useId, useRef, useState } from "react";
import { ImagePlus, Info, Trash2, UploadCloud } from "lucide-react";
import { validateImageFile } from "../../services/storageService.js";
import { useToast } from "../ui/Toast.jsx";

const MAX_IMAGES = 8;
const MAX_BYTES = 8 * 1024 * 1024;

function NewFilePreview({ file, onRemove, disabled }) {
  const [url, setUrl] = useState("");

  useEffect(() => {
    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  return (
    <div className="upload-preview">
      {url ? <img src={url} alt="" /> : <ImagePlus size={22} aria-hidden="true" />}
      <button
        type="button"
        className="upload-preview__remove"
        onClick={onRemove}
        disabled={disabled}
        aria-label={`Quitar ${file.name}`}
      >
        <Trash2 size={15} aria-hidden="true" />
      </button>
      <span className="upload-preview__name">{file.name}</span>
    </div>
  );
}

export default function ImageUploader({
  newFiles = [],
  existingImages = [],
  onFilesChange,
  onRemoveExisting,
  disabled = false,
  progress = 0,
  fallbackEnabled = false,
}) {
  const inputId = useId();
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const toast = useToast();
  const total = newFiles.length + existingImages.length;
  const remaining = Math.max(0, MAX_IMAGES - total);

  const addFiles = (fileList) => {
    const incoming = Array.from(fileList || []);
    if (!incoming.length) return;

    const valid = [];
    for (const file of incoming) {
      const message = validateImageFile(file);
      if (message) {
        toast.error(`${file.name}: ${message}`);
        continue;
      }
      if (file.size > MAX_BYTES) {
        toast.error(`${file.name}: supera el límite de 8 MB.`);
        continue;
      }
      valid.push(file);
    }

    if (!valid.length) return;
    const accepted = valid.slice(0, remaining);
    if (valid.length > remaining) {
      toast.info(`Puedes subir hasta ${MAX_IMAGES} imágenes por propiedad.`);
    }
    if (accepted.length) onFilesChange([...newFiles, ...accepted]);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragging(false);
    if (disabled) return;
    addFiles(event.dataTransfer.files);
  };

  return (
    <div className="image-uploader">
      <div
        className={`upload-zone${dragging ? " is-dragging" : ""}${disabled ? " is-disabled" : ""}`}
        onDragOver={(event) => {
          event.preventDefault();
          if (!disabled) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
      >
        <span className="upload-zone__icon" aria-hidden="true">
          <UploadCloud size={25} />
        </span>
        <div>
          <strong>Arrastra las fotos aquí o selecciónalas</strong>
          <p>JPG, PNG o WebP · máximo 8 MB por imagen · hasta 8 imágenes.</p>
        </div>
        <button
          type="button"
          className="btn btn-outline-secondary btn-sm"
          onClick={() => inputRef.current?.click()}
          disabled={disabled || remaining === 0}
        >
          Elegir imágenes
        </button>
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="visually-hidden"
          onChange={(event) => {
            addFiles(event.target.files);
            event.target.value = "";
          }}
          disabled={disabled}
        />
      </div>

      <div className="upload-meta">
        <span>
          {total} de {MAX_IMAGES} imágenes
        </span>
        <span>La primera imagen será la portada.</span>
      </div>

      {fallbackEnabled && (
        <p className="inline-note">
          <Info size={16} aria-hidden="true" />
          Modo de contingencia activo: si Storage no está disponible, se
          guardará solo una imagen comprimida dentro de Firestore (máximo 700
          KB). Para varias imágenes se requiere Firebase Storage.
        </p>
      )}

      {progress > 0 && progress < 100 && (
        <div className="upload-progress" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
          <span style={{ width: `${progress}%` }} />
          <small>Subiendo imágenes… {progress}%</small>
        </div>
      )}

      {(existingImages.length > 0 || newFiles.length > 0) && (
        <div className="upload-previews">
          {existingImages.map((image, index) => (
            <div className="upload-preview" key={`${image.url}-${index}`}>
              <img src={image.url} alt="" loading="lazy" />
              <button
                type="button"
                className="upload-preview__remove"
                onClick={() => onRemoveExisting?.(image, index)}
                disabled={disabled}
                aria-label="Quitar imagen existente"
              >
                <Trash2 size={15} aria-hidden="true" />
              </button>
              {index === 0 && <span className="upload-preview__cover">Portada</span>}
            </div>
          ))}
          {newFiles.map((file, index) => (
            <NewFilePreview
              key={`${file.name}-${file.size}-${index}`}
              file={file}
              disabled={disabled}
              onRemove={() => onFilesChange(newFiles.filter((_, item) => item !== index))}
            />
          ))}
        </div>
      )}
    </div>
  );
}
