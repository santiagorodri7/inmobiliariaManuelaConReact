import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { allowBase64Fallback, requireFirebase, storage } from "./firebase.js";
import { appError } from "../utils/errors.js";
import { translate } from "../i18n/translate.js";

const MAX_FILE_SIZE = 8 * 1024 * 1024;
const MAX_BASE64_BYTES = 180 * 1024;
const MAX_BASE64_TOTAL_BYTES = 600 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const UPLOAD_TIMEOUT_MS = 45 * 1000;

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
      reject(appError("storage/image-error"));
    };
    image.src = url;
  });

const canvasToBlob = (canvas, mime, quality) =>
  new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(appError("storage/image-error"));
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
      reject(appError("storage/image-error"));
    reader.readAsDataURL(blob);
  });

const dataUrlBytes = (dataUrl) => {
  const base64 = dataUrl.split(",")[1] || "";
  return Math.ceil((base64.length * 3) / 4);
};

export const validateImageFile = (file) => {
  if (!file) return translate("errors.storage.select");
  if (!ACCEPTED_TYPES.includes(file.type)) {
    return translate("errors.storage.format");
  }
  if (file.size > MAX_FILE_SIZE) {
    return translate("errors.storage.size");
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
  if (!context) throw appError("storage/image-error");
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
    { maxWidth: 480, quality: 0.35 },
    { maxWidth: 420, quality: 0.32 },
    { maxWidth: 360, quality: 0.3 },
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

const uploadWithTimeout = (
  storageRef,
  file,
  metadata,
  { signal, onProgress, timeoutMs = UPLOAD_TIMEOUT_MS } = {},
) => {
  const task = uploadBytesResumable(storageRef, file, metadata);

  return new Promise((resolve, reject) => {
    let settled = false;
    let timeoutId = null;

    const cleanup = () => {
      if (timeoutId) clearTimeout(timeoutId);
      signal?.removeEventListener("abort", handleAbort);
    };

    const succeed = (url) => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve(url);
    };

    const fail = (error) => {
      if (settled) return;
      settled = true;
      cleanup();
      try {
        task.cancel();
      } catch {
        // La tarea ya había terminado; no hay nada que cancelar.
      }
      reject(error);
    };

    const handleAbort = () => fail(appError("storage/canceled"));

    if (signal?.aborted) {
      handleAbort();
      return;
    }

    signal?.addEventListener("abort", handleAbort, { once: true });

    timeoutId = setTimeout(() => {
      fail(appError("storage/timeout"));
    }, timeoutMs);

    task.on(
      "state_changed",
      (snapshot) => {
        if (onProgress && snapshot.totalBytes) {
          onProgress(snapshot.bytesTransferred / snapshot.totalBytes);
        }
      },
      (error) => fail(error),
      async () => {
        try {
          const url = await getDownloadURL(task.snapshot.ref);
          succeed(url);
        } catch (error) {
          fail(error);
        }
      },
    );
  });
};

const uploadOne = async (
  ownerId,
  propertyId,
  file,
  index,
  onProgress,
  signal,
) => {
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
  const url = await uploadWithTimeout(
    storageRef,
    compressed,
    {
      contentType: "image/webp",
      cacheControl: "public,max-age=31536000,immutable",
    },
    { signal, onProgress },
  );

  return { url, path };
};

const fallbackBatchError = (omitted, total) => {
  const error = new Error(
    translate("errors.storage.base64BatchTooLarge", { omitted, total }),
  );
  error.code = "storage/base64-batch-too-large";
  return error;
};

export const uploadPropertyImages = async (
  ownerId,
  propertyId,
  files = [],
  onProgress,
  { signal } = {},
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
        signal,
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

    if (
      !allowBase64Fallback ||
      signal?.aborted ||
      error?.code === "storage/canceled" ||
      error?.code === "storage/timeout"
    ) {
      throw error;
    }

    const fallbackImages = [];
    let totalBytes = 0;

    for (let index = 0; index < files.length; index += 1) {
      let fallback;
      try {
        fallback = await createBase64Fallback(files[index], {
          maxBytes: MAX_BASE64_BYTES,
          initialWidth: 960,
        });
      } catch {
        throw fallbackBatchError(files.length - index, files.length);
      }

      if (totalBytes + fallback.bytes > MAX_BASE64_TOTAL_BYTES) {
        throw fallbackBatchError(files.length - index, files.length);
      }

      totalBytes += fallback.bytes;
      fallbackImages.push({
        url: fallback.dataUrl,
        path: "",
        fallback: true,
        bytes: fallback.bytes,
      });
      if (onProgress) {
        onProgress(Math.round(((index + 1) / files.length) * 100));
      }
    }

    return {
      images: fallbackImages,
      usedFallback: true,
      skipped: 0,
      fallbackBytes: totalBytes,
    };
  }
};

export const uploadAvatar = async (uid, file, { signal } = {}) => {
  const errorMessage = validateImageFile(file);
  if (errorMessage) throw appError("storage/invalid-file", errorMessage);
  requireFirebase();
  if (!storage) throw appError("storage/not-available");

  const compressed = await compressImage(file, { maxWidth: 512, quality: 0.82 });
  const path = `avatares/${uid}/avatar.webp`;
  const storageRef = ref(storage, path);

  try {
    const url = await uploadWithTimeout(
      storageRef,
      compressed,
      {
        contentType: "image/webp",
        cacheControl: "public,max-age=31536000,immutable",
      },
      { signal },
    );
    return { url, path };
  } catch (error) {
    if (
      !allowBase64Fallback ||
      signal?.aborted ||
      error?.code === "storage/canceled" ||
      error?.code === "storage/timeout"
    ) {
      throw error;
    }
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
