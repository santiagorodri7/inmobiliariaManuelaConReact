export const isValidEmail = (value = "") =>
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(String(value).trim());

export const validateRegister = (values) => {
  const errors = {};
  if (!values.nombre?.trim() || values.nombre.trim().length < 3) {
    errors.nombre = "Escribe tu nombre completo.";
  }
  if (!values.cedula?.trim()) {
    errors.cedula = "La cédula es obligatoria.";
  }
  if (!values.fechaNacimiento) {
    errors.fechaNacimiento = "Selecciona tu fecha de nacimiento.";
  }
  if (!isValidEmail(values.email)) {
    errors.email = "Escribe un correo válido.";
  }
  if (!values.rol) {
    errors.rol = "Selecciona cómo quieres usar la plataforma.";
  }
  if (!values.password || values.password.length < 8) {
    errors.password = "La contraseña debe tener al menos 8 caracteres.";
  }
  if (values.password !== values.confirmPassword) {
    errors.confirmPassword = "Las contraseñas no coinciden.";
  }
  if (!values.terms) {
    errors.terms = "Debes aceptar el tratamiento de datos para continuar.";
  }
  return errors;
};

export const validateLogin = (values) => {
  const errors = {};
  if (!isValidEmail(values.email)) errors.email = "Escribe un correo válido.";
  if (!values.password) errors.password = "Escribe tu contraseña.";
  return errors;
};

export const validateProperty = (values) => {
  const errors = {};
  if (!values.title?.trim() || values.title.trim().length < 5) {
    errors.title = "El título debe tener al menos 5 caracteres.";
  }
  if (!values.location?.trim() || values.location.trim().length < 3) {
    errors.location = "Indica la ciudad o el sector.";
  }
  if (!values.price || Number(values.price) <= 0) {
    errors.price = "Ingresa un precio válido.";
  }
  if (!values.type) errors.type = "Selecciona el tipo de inmueble.";
  if (!values.operation) errors.operation = "Selecciona la operación.";
  if (!values.description?.trim() || values.description.trim().length < 20) {
    errors.description = "Describe la propiedad con al menos 20 caracteres.";
  }
  if (values.bedrooms && Number(values.bedrooms) < 0) {
    errors.bedrooms = "El número de habitaciones no es válido.";
  }
  if (values.bathrooms && Number(values.bathrooms) < 0) {
    errors.bathrooms = "El número de baños no es válido.";
  }
  if (values.area && Number(values.area) < 0) {
    errors.area = "El área no es válida.";
  }
  if (values.stratum && (Number(values.stratum) < 1 || Number(values.stratum) > 6)) {
    errors.stratum = "El estrato debe estar entre 1 y 6.";
  }
  return errors;
};

export const validateSale = (values) => {
  const errors = {};
  if (!values.propertyId) errors.propertyId = "Selecciona una propiedad.";
  if (!values.buyerName?.trim() || values.buyerName.trim().length < 3) {
    errors.buyerName = "Escribe el nombre del comprador o arrendatario.";
  }
  if (values.buyerEmail && !isValidEmail(values.buyerEmail)) {
    errors.buyerEmail = "El correo del comprador no es válido.";
  }
  if (!values.closingValue || Number(values.closingValue) <= 0) {
    errors.closingValue = "Ingresa el valor del cierre.";
  }
  if (!values.closingDate) {
    errors.closingDate = "Selecciona la fecha del cierre.";
  }
  return errors;
};

export const validateContact = (values) => {
  const errors = {};
  if (!values.name?.trim() || values.name.trim().length < 2) {
    errors.name = "Escribe tu nombre.";
  }
  if (!isValidEmail(values.email)) {
    errors.email = "Escribe un correo válido.";
  }
  if (!values.subject?.trim()) {
    errors.subject = "Selecciona o escribe un asunto.";
  }
  if (!values.message?.trim() || values.message.trim().length < 10) {
    errors.message = "Cuéntanos un poco más (mínimo 10 caracteres).";
  }
  if (values.phone && values.phone.replace(/\D/g, "").length < 7) {
    errors.phone = "El teléfono no parece válido.";
  }
  return errors;
};

export const validateTestimonial = (values) => {
  const errors = {};
  if (!values.nombre?.trim() || values.nombre.trim().length < 2) {
    errors.nombre = "Escribe tu nombre.";
  }
  if (!values.texto?.trim() || values.texto.trim().length < 20) {
    errors.texto = "Escribe al menos 20 caracteres.";
  }
  if (!values.rating || Number(values.rating) < 1 || Number(values.rating) > 5) {
    errors.rating = "Selecciona una calificación.";
  }
  return errors;
};

export const validatePasswordChange = (values) => {
  const errors = {};
  if (!values.currentPassword) {
    errors.currentPassword = "Escribe tu contraseña actual.";
  }
  if (!values.newPassword || values.newPassword.length < 8) {
    errors.newPassword = "La nueva contraseña debe tener al menos 8 caracteres.";
  }
  if (values.newPassword !== values.confirmPassword) {
    errors.confirmPassword = "Las contraseñas no coinciden.";
  }
  if (values.currentPassword && values.currentPassword === values.newPassword) {
    errors.newPassword = "La nueva contraseña debe ser diferente.";
  }
  return errors;
};

export const hasErrors = (errors) =>
  Object.values(errors).some((value) => Boolean(value));
