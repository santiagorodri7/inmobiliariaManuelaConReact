const messages = {
  "auth/invalid-credential": "El correo o la contraseña no son correctos.",
  "auth/invalid-login-credentials":
    "El correo o la contraseña no son correctos.",
  "auth/wrong-password": "El correo o la contraseña no son correctos.",
  "auth/user-not-found": "El correo o la contraseña no son correctos.",
  "auth/invalid-email": "Escribe un correo electrónico válido.",
  "auth/email-already-in-use": "Ya existe una cuenta con este correo.",
  "auth/weak-password": "La contraseña debe tener al menos 8 caracteres.",
  "auth/too-many-requests":
    "Demasiados intentos. Espera unos minutos y vuelve a intentarlo.",
  "auth/network-request-failed":
    "No pudimos conectar con el servidor. Revisa tu conexión.",
  "auth/user-disabled": "Esta cuenta está desactivada.",
  "auth/requires-recent-login":
    "Por seguridad, vuelve a iniciar sesión antes de continuar.",
  "auth/operation-not-allowed":
    "El inicio de sesión con correo no está habilitado en Firebase.",
  "permission-denied":
    "No tienes permisos para realizar esta acción. Si crees que es un error, contacta a la administradora.",
  unavailable:
    "El servicio no está disponible en este momento. Inténtalo de nuevo.",
  "storage/unauthorized":
    "No tienes permisos para subir esta imagen. Revisa la configuración de Storage.",
  "storage/canceled": "La subida de la imagen fue cancelada.",
  "storage/retry-limit-exceeded":
    "La conexión se interrumpió durante la subida. Inténtalo de nuevo.",
  "storage/unknown":
    "No se pudo subir la imagen. Verifica que Firebase Storage esté habilitado.",
  "functions/not-found":
    "El servicio de correo aún no está desplegado. Puedes escribirnos directamente por correo o WhatsApp.",
  "functions/unavailable":
    "El servicio de correo no está disponible en este momento. Escríbenos directamente.",
  "functions/internal":
    "No se pudo enviar el mensaje. Escríbenos directamente por correo o WhatsApp.",
  "functions/resource-exhausted":
    "Has enviado varios mensajes en poco tiempo. Espera unos minutos.",
  "functions/invalid-argument":
    "Revisa los datos del formulario e inténtalo de nuevo.",
  "functions/failed-precondition":
    "El envío de correo aún no está configurado. Escríbenos directamente.",
  "app/not-configured":
    "Firebase no está configurado. Revisa el archivo .env.local.",
  "profile/not-found":
    "Tu cuenta existe, pero no tiene un perfil asociado. Contacta a la administradora.",
  "profile/disabled": "Tu cuenta está desactivada. Contacta a la administradora.",
  "property/not-available":
    "Esta propiedad ya no está disponible para registrar un cierre.",
  "property/not-found": "No encontramos esta propiedad.",
  "sale/not-found": "No encontramos este cierre.",
  "sale/already-annulled": "Este cierre ya fue anulado.",
  "storage/base64-too-large":
    "La imagen sigue superando el límite de 700 KB después de comprimirla. Usa una imagen más liviana o habilita Firebase Storage.",
  "storage/not-available":
    "Firebase Storage no está disponible. Actívalo o usa el modo de contingencia.",
  "contact/not-configured":
    "El envío de correo aún no está configurado. Puedes escribirnos directamente por correo o WhatsApp.",
  "export/no-rows": "No hay datos para exportar con los filtros actuales.",
};

export const appError = (code, message) => {
  const error = new Error(message || messages[code] || "Ocurrió un error.");
  error.code = code;
  return error;
};

export const getErrorMessage = (error, fallback = "Ocurrió un error.") => {
  if (!error) return fallback;
  if (error.code && messages[error.code]) return messages[error.code];
  if (typeof error === "string") return error;
  if (error.message) return error.message;
  return fallback;
};

export const isPermissionError = (error) =>
  error?.code === "permission-denied" ||
  error?.code === "storage/unauthorized";
