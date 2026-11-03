import { fileDateStamp, toDate } from "../utils/dates.js";
import {
  operationLabel,
  propertyTypeLabel,
  roleLabel,
  saleStatusLabel,
  statusLabel,
} from "../i18n/labels.js";
import { translate } from "../i18n/translate.js";
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
  return {
    value: date,
    format: translate("excel.dateFormat"),
    align: "center",
  };
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
      translate("excel.users.name"),
      translate("excel.users.id"),
      translate("excel.users.email"),
      translate("excel.users.phone"),
      translate("excel.users.role"),
      translate("excel.users.status"),
      translate("excel.users.birthDate"),
      translate("excel.users.registered"),
    ],
    [26, 16, 30, 18, 15, 12, 18, 18],
    users.map((user) => [
      textCell(user.nombre),
      textCell(user.cedula),
      textCell(user.email),
      textCell(user.telefono),
      textCell(roleLabel(translate, user.rol)),
      textCell(
        translate(
          user.activo === false ? "excel.users.inactive" : "excel.users.active",
        ),
      ),
      dateCell(user.fechaNacimiento),
      dateCell(user.fechaRegistro),
    ]),
    translate("excel.sheets.users"),
  );

export const propertiesSheet = (properties = []) =>
  sheetWithRows(
    [
      translate("excel.properties.title"),
      translate("excel.properties.operation"),
      translate("excel.properties.type"),
      translate("excel.properties.status"),
      translate("excel.properties.price"),
      translate("excel.properties.location"),
      translate("excel.properties.bedrooms"),
      translate("excel.properties.bathrooms"),
      translate("excel.properties.parking"),
      translate("excel.properties.area"),
      translate("excel.properties.owner"),
      translate("excel.properties.registered"),
    ],
    [32, 12, 16, 12, 18, 25, 12, 10, 13, 11, 24, 18],
    properties.map((property) => [
      textCell(property.title),
      textCell(operationLabel(translate, property.operation)),
      textCell(propertyTypeLabel(translate, property.type)),
      textCell(statusLabel(translate, property.status)),
      numberCell(property.price),
      textCell(property.location),
      numberCell(property.bedrooms),
      numberCell(property.bathrooms),
      numberCell(property.parking),
      numberCell(property.area),
      textCell(property.ownerName),
      dateCell(property.createdAt || property.fechaRegistro),
    ]),
    translate("excel.sheets.properties"),
  );

export const salesSheet = (sales = []) =>
  sheetWithRows(
    [
      translate("excel.sales.property"),
      translate("excel.sales.operation"),
      translate("excel.sales.seller"),
      translate("excel.sales.buyer"),
      translate("excel.sales.buyerEmail"),
      translate("excel.sales.buyerPhone"),
      translate("excel.sales.value"),
      translate("excel.sales.date"),
      translate("excel.sales.status"),
      translate("excel.sales.notes"),
    ],
    [32, 12, 24, 26, 30, 18, 18, 16, 12, 40],
    sales.map((sale) => [
      textCell(sale.propertyTitle),
      textCell(operationLabel(translate, sale.operation)),
      textCell(sale.sellerName),
      textCell(sale.buyerName),
      textCell(sale.buyerEmail),
      textCell(sale.buyerPhone),
      numberCell(sale.closingValue),
      dateCell(sale.closingDate),
      textCell(saleStatusLabel(translate, sale.status)),
      textCell(sale.notes),
    ]),
    translate("excel.sheets.sales"),
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

const ensureRows = (rows) => {
  if (!rows.length) throw appError("export/no-rows");
};

export const exportUsers = async (users = []) => {
  ensureRows(users);
  await writeSingleSheet(
    usersSheet(users),
    translate("excel.file.users", { date: fileDateStamp() }),
  );
};

export const exportProperties = async (properties = []) => {
  ensureRows(properties);
  await writeSingleSheet(
    propertiesSheet(properties),
    translate("excel.file.properties", { date: fileDateStamp() }),
  );
};

export const exportSales = async (sales = []) => {
  ensureRows(sales);
  await writeSingleSheet(
    salesSheet(sales),
    translate("excel.file.sales", { date: fileDateStamp() }),
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
    translate("excel.file.all", { date: fileDateStamp() }),
  );
};
