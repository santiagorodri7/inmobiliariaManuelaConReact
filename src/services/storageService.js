import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { allowBase64Fallback, requireFirebase, storage } from "./firebase.js";
import { appError } from "../utils/errors.js";

const MAX_FILE_SIZE = 8 * 1024 * 1024;
const MAX_BASE64_BYTES = 700 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

const loadImage = (file) =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(appError("storage/image-error", "No se pudo leer la imagen."));
    };
    image.src = url;
  });

const canvasToBlob = (canvas, mime, quality) =>
  new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(appError("storage/image-error", "No se pudo comprimir la imagen."));
      },
      mime,
      quality,
    );
  });

const blobToDataUrl = (blob) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () =>
      reject(appError("storage/image-error", "No se pudo procesar la imagen."));
    reader.readAsDataURL(blob);
  });

const dataUrlBytes = (dataUrl) => {
  const base64 = dataUrl.split(",")[1] || "";
  return Math.ceil((base64.length * 3) / 4);
};

export const validateImageFile = (file) => {
  if (!file) return "Selecciona una imagen.";
  if (!ACCEPTED_TYPES.includes(file.type)) {
    return "Formato no compatible. Usa JPG, PNG o WebP.";
  }
  if (file.size > MAX_FILE_SIZE) {
    return "Cada imagen debe pesar menos de 8 MB.";
  }
  return "";
};

export const compressImage = async (
  file,
  { maxWidth = 1600, quality = 0.8 } = {},
) => {
  const image = await loadImage(file);
  const scale = Math.min(1, maxWidth / image.naturalWidth);
  const width = Math.max(1, Math.round(image.naturalWidth * scale));
  const height = Math.max(1, Math.round(image.naturalHeight * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw appError("storage/image-error", "No se pudo comprimir la imagen.");
  context.drawImage(image, 0, 0, width, height);

  const blob = await canvasToBlob(canvas, "image/webp", quality);
  return new File(
    [blob],
    `${file.name.replace(/\.[^.]+$/, "") || "imagen"}.webp`,
    { type: "image/webp", lastModified: Date.now() },
  );
};

export const createBase64Fallback = async (
  file,
  { maxBytes = MAX_BASE64_BYTES, initialWidth = 1200 } = {},
) => {
  const attempts = [
    { maxWidth: initialWidth, quality: 0.72 },
    { maxWidth: 1000, quality: 0.66 },
    { maxWidth: 900, quality: 0.6 },
    { maxWidth: 800, quality: 0.55 },
    { maxWidth: 720, quality: 0.5 },
    { maxWidth: 640, quality: 0.45 },
    { maxWidth: 520, quality: 0.4 },
  ];

  for (const attempt of attempts) {
    const compressed = await compressImage(file, attempt);
    const dataUrl = await blobToDataUrl(compressed);
    if (dataUrlBytes(dataUrl) <= maxBytes) {
      return {
        dataUrl,
        bytes: dataUrlBytes(dataUrl),
        type: compressed.type,
      };
    }
  }

  throw appError("storage/base64-too-large");
};

const uploadOne = async (ownerId, propertyId, file, index, onProgress) => {
  const errorMessage = validateImageFile(file);
  if (errorMessage) {
    throw appError("storage/invalid-file", errorMessage);
  }

  const compressed = await compressImage(file);
  const imageId = `${Date.now()}-${index}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
  const path = `propiedades/${ownerId}/${propertyId}/${imageId}.webp`;
  const storageRef = ref(storage, path);
  const task = uploadBytesResumable(storageRef, compressed, {
    contentType: "image/webp",
    cacheControl: "public,max-age=31536000,immutable",
  });

  return new Promise((resolve, reject) => {
    task.on(
      "state_changed",
      (snapshot) => {
        if (onProgress && snapshot.totalBytes) {
          onProgress(snapshot.bytesTransferred / snapshot.totalBytes);
        }
      },
      reject,
      async () => {
        try {
          const url = await getDownloadURL(task.snapshot.ref);
          resolve({ url, path });
        } catch (error) {
          reject(error);
        }
      },
    );
  });
};

export const uploadPropertyImages = async (
  ownerId,
  propertyId,
  files = [],
  onProgress,
) => {
  if (!files.length) {
    return { images: [], usedFallback: false, skipped: 0 };
  }

  requireFirebase();
  if (!storage) throw appError("storage/not-available");

  const uploaded = [];
  try {
    for (let index = 0; index < files.length; index += 1) {
      const image = await uploadOne(
        ownerId,
        propertyId,
        files[index],
        index,
        (fraction) => {
          if (!onProgress) return;
          const overall = ((index + fraction) / files.length) * 100;
          onProgress(Math.min(99, Math.round(overall)));
        },
      );
      uploaded.push(image);
    }
    if (onProgress) onProgress(100);
    return { images: uploaded, usedFallback: false, skipped: 0 };
  } catch (error) {
    await Promise.all(
      uploaded.map((image) =>
        deleteObject(ref(storage, image.path)).catch(() => undefined),
      ),
    );

    if (!allowBase64Fallback) throw error;

    const fallback = await createBase64Fallback(files[0]);
    if (onProgress) onProgress(100);
    return {
      images: [
        {
          url: fallback.dataUrl,
          path: "",
          fallback: true,
          bytes: fallback.bytes,
        },
      ],
      usedFallback: true,
      skipped: Math.max(0, files.length - 1),
      fallbackBytes: fallback.bytes,
    };
  }
};

export const uploadAvatar = async (uid, file) => {
  const errorMessage = validateImageFile(file);
  if (errorMessage) throw appError("storage/invalid-file", errorMessage);
  requireFirebase();
  if (!storage) throw appError("storage/not-available");

  const compressed = await compressImage(file, { maxWidth: 512, quality: 0.82 });
  const path = `avatares/${uid}/avatar.webp`;
  const storageRef = ref(storage, path);

  try {
    await uploadBytesResumable(storageRef, compressed, {
      contentType: "image/webp",
      cacheControl: "public,max-age=31536000,immutable",
    });
    return { url: await getDownloadURL(storageRef), path };
  } catch (error) {
    if (!allowBase64Fallback) throw error;
    const fallback = await createBase64Fallback(file, {
      maxBytes: 220 * 1024,
      initialWidth: 480,
    });
    return { url: fallback.dataUrl, path: "" };
  }
};

export const deleteStoragePaths = async (paths = []) => {
  if (!storage || !paths.length) return;
  await Promise.all(
    paths
      .filter(Boolean)
      .map((path) => deleteObject(ref(storage, path)).catch(() => undefined)),
  );
};

export const storageLimits = {
  maxFileSize: MAX_FILE_SIZE,
  maxBase64Bytes: MAX_BASE64_BYTES,
  acceptedTypes: ACCEPTED_TYPES,
};
