const dateFormatter = new Intl.DateTimeFormat("es-CO", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const dateTimeFormatter = new Intl.DateTimeFormat("es-CO", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

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

export const formatDate = (value, fallback = "—") => {
  const date = toDate(value);
  return date ? dateFormatter.format(date) : fallback;
};

export const formatDateTime = (value, fallback = "—") => {
  const date = toDate(value);
  return date ? dateTimeFormatter.format(date) : fallback;
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

export const fileDateStamp = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};
