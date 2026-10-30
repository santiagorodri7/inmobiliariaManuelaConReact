import { fileDateStamp, toDate } from "../utils/dates.js";
import { operationLabel, statusLabel } from "../utils/property.js";
import { roleLabel } from "../utils/roles.js";
import { appError } from "../utils/errors.js";

const headerStyle = {
  fontWeight: "bold",
  backgroundColor: "#E8E2D7",
  textColor: "#1C2A33",
  align: "center",
};

const headerRow = (headers) =>
  headers.map((header) => ({ value: header, ...headerStyle }));

const textCell = (value) => ({ value: value == null ? "" : String(value) });

const numberCell = (value) => {
  const number = Number(value);
  if (!Number.isFinite(number)) return { value: "" };
  return { value: number, format: "#,##0", align: "right" };
};

const dateCell = (value) => {
  const date = toDate(value);
  if (!date) return { value: "" };
  return { value: date, format: "dd/mm/yyyy", align: "center" };
};

const sheetWithRows = (headers, widths, rows, sheetName) => ({
  data: [headerRow(headers), ...rows],
  columns: widths.map((width) => ({ width })),
  sheet: sheetName,
  stickyRowsCount: 1,
  showGridLines: false,
});

export const usersSheet = (users = []) =>
  sheetWithRows(
    [
      "Nombre",
      "Cédula",
      "Correo",
      "Teléfono",
      "Rol",
      "Estado",
      "Fecha de nacimiento",
      "Fecha de registro",
    ],
    [26, 16, 30, 18, 15, 12, 18, 18],
    users.map((user) => [
      textCell(user.nombre),
      textCell(user.cedula),
      textCell(user.email),
      textCell(user.telefono),
      textCell(roleLabel(user.rol)),
      textCell(user.activo === false ? "Inactivo" : "Activo"),
      dateCell(user.fechaNacimiento),
      dateCell(user.fechaRegistro),
    ]),
    "Usuarios",
  );

export const propertiesSheet = (properties = []) =>
  sheetWithRows(
    [
      "Título",
      "Operación",
      "Tipo",
      "Estado",
      "Precio (COP)",
      "Ubicación",
      "Habitaciones",
      "Baños",
      "Parqueaderos",
      "Área (m²)",
      "Propietario",
      "Fecha de registro",
    ],
    [32, 12, 16, 12, 18, 25, 12, 10, 13, 11, 24, 18],
    properties.map((property) => [
      textCell(property.title),
      textCell(operationLabel(property.operation)),
      textCell(property.type),
      textCell(statusLabel(property.status)),
      numberCell(property.price),
      textCell(property.location),
      numberCell(property.bedrooms),
      numberCell(property.bathrooms),
      numberCell(property.parking),
      numberCell(property.area),
      textCell(property.ownerName),
      dateCell(property.createdAt || property.fechaRegistro),
    ]),
    "Propiedades",
  );

export const salesSheet = (sales = []) =>
  sheetWithRows(
    [
      "Propiedad",
      "Operación",
      "Vendedor",
      "Comprador / arrendatario",
      "Correo comprador",
      "Teléfono comprador",
      "Valor (COP)",
      "Fecha de cierre",
      "Estado",
      "Notas",
    ],
    [32, 12, 24, 26, 30, 18, 18, 16, 12, 40],
    sales.map((sale) => [
      textCell(sale.propertyTitle),
      textCell(operationLabel(sale.operation)),
      textCell(sale.sellerName),
      textCell(sale.buyerName),
      textCell(sale.buyerEmail),
      textCell(sale.buyerPhone),
      numberCell(sale.closingValue),
      dateCell(sale.closingDate),
      textCell(sale.status === "anulada" ? "Anulada" : "Cerrada"),
      textCell(sale.notes),
    ]),
    "Ventas",
  );

const writeSingleSheet = async (sheet, fileName) => {
  const module = await import("write-excel-file/browser");
  const writeXlsxFile = module.default;
  await writeXlsxFile(sheet.data, {
    columns: sheet.columns,
    sheet: sheet.sheet,
    stickyRowsCount: 1,
    showGridLines: false,
  }).toFile(fileName);
};

const writeWorkbook = async (sheets, fileName) => {
  const module = await import("write-excel-file/browser");
  const writeXlsxFile = module.default;
  await writeXlsxFile(
    sheets.map((sheet) => ({
      data: sheet.data,
      columns: sheet.columns,
      sheet: sheet.sheet,
      stickyRowsCount: 1,
      showGridLines: false,
    })),
  ).toFile(fileName);
};

const ensureRows = (rows, label) => {
  if (!rows.length) throw appError("export/no-rows", `No hay ${label} para exportar con los filtros actuales.`);
};

export const exportUsers = async (users = []) => {
  ensureRows(users, "usuarios");
  await writeSingleSheet(
    usersSheet(users),
    `manuela-usuarios-${fileDateStamp()}.xlsx`,
  );
};

export const exportProperties = async (properties = []) => {
  ensureRows(properties, "propiedades");
  await writeSingleSheet(
    propertiesSheet(properties),
    `manuela-propiedades-${fileDateStamp()}.xlsx`,
  );
};

export const exportSales = async (sales = []) => {
  ensureRows(sales, "cierres");
  await writeSingleSheet(
    salesSheet(sales),
    `manuela-ventas-${fileDateStamp()}.xlsx`,
  );
};

export const exportAll = async ({
  users = [],
  properties = [],
  sales = [],
} = {}) => {
  if (!users.length && !properties.length && !sales.length) {
    throw appError("export/no-rows");
  }
  await writeWorkbook(
    [usersSheet(users), propertiesSheet(properties), salesSheet(sales)],
    `manuela-reporte-completo-${fileDateStamp()}.xlsx`,
  );
};
