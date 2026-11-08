const dateFormatters = new Map();
const dateTimeFormatters = new Map();

const getDateFormatter = (locale) => {
  if (!dateFormatters.has(locale)) {
    dateFormatters.set(
      locale,
      new Intl.DateTimeFormat(locale, {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
    );
  }
  return dateFormatters.get(locale);
};

const getDateTimeFormatter = (locale) => {
  if (!dateTimeFormatters.has(locale)) {
    dateTimeFormatters.set(
      locale,
      new Intl.DateTimeFormat(locale, {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    );
  }
  return dateTimeFormatters.get(locale);
};

export const toDate = (value) => {
  if (!value) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  if (typeof value?.toDate === "function") {
    const date = value.toDate();
    return Number.isNaN(date.getTime()) ? null : date;
  }
  if (typeof value === "object" && typeof value.seconds === "number") {
    return new Date(value.seconds * 1000);
  }
  if (typeof value === "number") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  if (typeof value === "string") {
    const isDateOnly = /^\d{4}-\d{2}-\d{2}$/.test(value.trim());
    const date = new Date(isDateOnly ? `${value.trim()}T12:00:00` : value);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  return null;
};

export const formatDate = (value, fallback = "—", locale = "es-CO") => {
  const date = toDate(value);
  return date ? getDateFormatter(locale).format(date) : fallback;
};

export const formatDateTime = (value, fallback = "—", locale = "es-CO") => {
  const date = toDate(value);
  return date ? getDateTimeFormatter(locale).format(date) : fallback;
};

export const dateInputValue = (value) => {
  const date = toDate(value);
  if (!date) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const parseDateInput = (value) => {
  if (!value) return null;
  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const isFutureDate = (value) => {
  const date = toDate(value);
  if (!date) return false;
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  return date.getTime() > today.getTime();
};

export const isWithinRange = (value, from, to) => {
  const date = toDate(value);
  if (!date) return false;
  const fromDate = toDate(from);
  const toDateValue = toDate(to);
  if (fromDate && date < fromDate) return false;
  if (toDateValue) {
    const end = new Date(toDateValue);
    end.setHours(23, 59, 59, 999);
    if (date > end) return false;
  }
  return true;
};

export const todayInputValue = () => dateInputValue(new Date());

export const MIN_BIRTH_YEAR = 1920;

export const calculateAge = (value, reference = new Date()) => {
  const date = toDate(value);
  if (!date) return null;
  let age = reference.getFullYear() - date.getFullYear();
  const monthDiff = reference.getMonth() - date.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && reference.getDate() < date.getDate())) {
    age -= 1;
  }
  return age;
};

export const birthDateBounds = (reference = new Date()) => {
  const latest = new Date(reference);
  latest.setFullYear(latest.getFullYear() - 18);
  return {
    min: `${MIN_BIRTH_YEAR}-01-01`,
    max: dateInputValue(latest),
  };
};

export const fileDateStamp = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};
