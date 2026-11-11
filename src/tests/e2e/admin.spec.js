import { test, expect } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const ADMIN_EMAIL = "admin.demo@manuela.local";
const ADMIN_PASSWORD = "Demo1234!";
const EXCEL_DIR = path.resolve("test-results", "excel");

test.describe.configure({ mode: "serial" });

async function login(page) {
  await page.goto("/login");
  await page.locator("#login-email").fill(ADMIN_EMAIL);
  await page.locator("#login-password").fill(ADMIN_PASSWORD);
  await page.getByRole("button", { name: "Ingresar a mi cuenta" }).click();
  await page.waitForURL(/\/admin$/);
  await expect(page.locator(".dashboard-topbar h1")).toHaveText(
    "Panel de administración",
  );
}

async function openSection(page, navLabel, heading) {
  await page
    .locator(".dashboard-nav")
    .getByRole("button", { name: navLabel, exact: true })
    .click();
  await expect(page.locator(".dashboard-topbar h1")).toHaveText(heading);
}

async function downloadWorkbook(page, filename, trigger) {
  fs.mkdirSync(EXCEL_DIR, { recursive: true });
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    trigger(),
  ]);
  expect(download.suggestedFilename()).toMatch(/\.xlsx$/);
  const target = path.join(EXCEL_DIR, filename);
  await download.saveAs(target);
  expect(fs.statSync(target).size).toBeGreaterThan(1000);
  return target;
}

test("el resumen carga métricas y cierres recientes", async ({ page }) => {
  await login(page);

  const cards = page.locator(".stat-card");
  await expect(cards).toHaveCount(4);

  await expect(cards.nth(0).locator(".stat-card__value")).toHaveText("14");
  await expect(cards.nth(1).locator(".stat-card__value")).toHaveText("6");
  await expect(cards.nth(2).locator(".stat-card__value")).toHaveText("10");
  await expect(cards.nth(3).locator(".stat-card__value")).not.toHaveText(
    /^\s*$/,
  );

  await expect(
    page.locator(".dashboard-grid--main .data-table tbody tr"),
  ).toHaveCount(4);
  await expect(
    page.getByRole("link", { name: /Ver reporte de ventas/ }),
  ).toBeVisible();
});

test("usuarios: búsqueda, filtros, paginación y activación", async ({ page }) => {
  await login(page);
  await openSection(page, "Usuarios", "Usuarios");

  const rows = page.locator(".data-table tbody tr");
  const toolbar = page.locator(".admin-toolbar");
  const search = page.getByPlaceholder(
    "Buscar por nombre, correo, cédula o teléfono",
  );

  await expect(rows).toHaveCount(8);
  await expect(page.locator(".pagination-bar__page")).toHaveText(
    "Página 1 de 2",
  );

  await search.fill("Camila");
  await expect(rows).toHaveCount(1);
  await expect(rows.first().locator("strong")).toHaveText("Camila Restrepo");

  await search.fill("");
  await toolbar.getByLabel("Filtrar por rol").selectOption("Vendedor");
  await expect(rows).toHaveCount(7);
  await toolbar.getByLabel("Filtrar por estado").selectOption("Inactivos");
  await expect(rows).toHaveCount(1);
  await expect(rows.first()).toContainText("Paula Montoya");

  await toolbar.getByLabel("Filtrar por rol").selectOption("");
  await toolbar.getByLabel("Filtrar por estado").selectOption("");
  await expect(rows).toHaveCount(8);

  await page.getByLabel("Página siguiente").click();
  await expect(page.locator(".pagination-bar__page")).toHaveText(
    "Página 2 de 2",
  );
  await expect(rows).toHaveCount(6);
  await page.getByLabel("Página anterior").click();
  await expect(rows).toHaveCount(8);

  await search.fill("Camila");
  await expect(rows).toHaveCount(1);
  await rows.first().getByLabel("Desactivar a Camila Restrepo").click();
  await expect(rows.first().locator(".status-pill")).toHaveText("Inactivo");
  await expect(
    page.getByText("La cuenta quedó desactivada y no podrá ingresar."),
  ).toBeVisible();

  await rows.first().getByLabel("Reactivar a Camila Restrepo").click();
  await expect(rows.first().locator(".status-pill")).toHaveText("Activo");
  await expect(
    page.getByText("La cuenta se reactivó correctamente."),
  ).toBeVisible();
});

test("propiedades: búsqueda, filtros, paginación y publicación", async ({
  page,
}) => {
  await login(page);
  await openSection(page, "Propiedades", "Propiedades");

  const rows = page.locator(".data-table tbody tr");
  const toolbar = page.locator(".admin-toolbar");
  const search = page.getByPlaceholder(
    "Buscar por título, ubicación, tipo o propietario",
  );

  await expect(rows).toHaveCount(8);
  await expect(page.locator(".pagination-bar__page")).toHaveText(
    "Página 1 de 2",
  );

  await search.fill("Inmueble demo 01");
  await expect(rows).toHaveCount(1);
  await expect(rows.first()).toContainText("Inmueble demo 01");

  await search.fill("");
  await toolbar.getByLabel("Filtrar por operación").selectOption("renta");
  await expect(rows).toHaveCount(6);
  await toolbar.getByLabel("Filtrar por estado").selectOption("disponible");
  await expect(rows).toHaveCount(3);

  await toolbar.getByLabel("Filtrar por operación").selectOption("");
  await toolbar.getByLabel("Filtrar por estado").selectOption("");
  await expect(rows).toHaveCount(8);

  await page.getByLabel("Página siguiente").click();
  await expect(page.locator(".pagination-bar__page")).toHaveText(
    "Página 2 de 2",
  );
  await expect(rows).toHaveCount(4);
  await page.getByLabel("Página anterior").click();

  await search.fill("Inmueble demo 01");
  await expect(rows).toHaveCount(1);
  await rows.first().getByLabel("Ocultar Inmueble demo 01").click();
  await expect(rows.first().locator(".status-pill")).toHaveText("Oculta");
  await expect(
    page.getByText("La propiedad se ocultó del catálogo."),
  ).toBeVisible();

  await rows.first().getByLabel("Publicar Inmueble demo 01").click();
  await expect(rows.first().locator(".status-pill")).toHaveText("Publicada");
  await expect(
    page.getByText("La propiedad volvió a publicarse."),
  ).toBeVisible();
});

test("testimonios: filtro de pendientes y moderación", async ({ page }) => {
  await login(page);
  await openSection(page, "Testimonios", "Testimonios");

  const rows = page.locator(".data-table tbody tr");
  const statusFilter = page.locator(".admin-toolbar select");

  await expect(rows).toHaveCount(8);
  await statusFilter.selectOption("pendiente");
  await expect(rows).toHaveCount(4);

  await rows
    .filter({ hasText: "Cliente Demo 01" })
    .getByLabel("Aprobar el testimonio de Cliente Demo 01")
    .click();
  await expect(
    page.getByText("El testimonio se publicó."),
  ).toBeVisible();
  await expect(rows).toHaveCount(3);

  await statusFilter.selectOption("aprobado");
  await expect(rows).toHaveCount(5);
  await rows
    .filter({ hasText: "Cliente Demo 05" })
    .getByLabel("Retirar el testimonio de Cliente Demo 05")
    .click();
  await expect(
    page.getByText("El testimonio quedó inactivo."),
  ).toBeVisible();
  await expect(rows).toHaveCount(4);

  await statusFilter.selectOption("inactivo");
  await expect(rows).toHaveCount(5);
});

test("cierres: filtros, paginación, registro y anulación", async ({ page }) => {
  await login(page);
  await openSection(page, "Cierres", "Cierres registrados");

  const rows = page.locator(".data-table tbody tr");
  const search = page.getByPlaceholder("Propiedad, comprador o vendedor");
  const selects = page.locator(".sales-filters select");
  const dates = page.locator('.sales-filters input[type="date"]');

  await expect(rows).toHaveCount(8);
  await expect(page.locator(".pagination-bar__page")).toHaveText(
    "Página 1 de 2",
  );

  await search.fill("Inmueble demo 01");
  await expect(rows).toHaveCount(1);

  await search.fill("");
  await selects.nth(0).selectOption("renta");
  await expect(rows).toHaveCount(4);

  await selects.nth(0).selectOption("");
  await dates.nth(0).fill("2026-09-01");
  await dates.nth(1).fill("2026-10-31");
  await expect(rows).toHaveCount(4);

  await page.getByRole("button", { name: "Limpiar" }).click();
  await expect(rows).toHaveCount(8);
  await page.getByLabel("Página siguiente").click();
  await expect(rows).toHaveCount(4);
  await page.getByLabel("Página anterior").click();

  await page
    .locator(".panel-heading")
    .getByRole("button", { name: "Registrar cierre" })
    .click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await dialog.locator("#sale-property").selectOption("demo-prop-02");
  await dialog.locator("#sale-buyer").fill("Comprador E2E");
  await dialog.locator("#sale-email").fill("comprador.e2e@manuela.local");
  await dialog.getByRole("button", { name: "Registrar cierre" }).click();
  await expect(dialog).toBeHidden();
  await expect(
    page.getByText("Cierre registrado. La propiedad cambió de estado automáticamente."),
  ).toBeVisible();

  await page.getByRole("button", { name: "Limpiar" }).click();
  await expect(page.locator(".pagination-bar__summary")).toHaveText(/13$/);

  await search.fill("Inmueble demo 02");
  const createdSale = rows.filter({ hasText: "Comprador E2E" });
  await expect(createdSale).toHaveCount(1);
  await createdSale.getByRole("button", { name: "Anular" }).click();
  const confirm = page.getByRole("dialog");
  await expect(confirm).toBeVisible();
  await confirm.getByRole("button", { name: "Anular cierre" }).click();
  await expect(confirm).toBeHidden();
  await expect(createdSale.locator(".status-pill")).toHaveText("Anulada");
});

test("reporte de ventas: filtros y barras mensuales", async ({ page }) => {
  await login(page);
  await page
    .locator(".dashboard-nav")
    .getByRole("link", { name: "Reporte de ventas" })
    .click();
  await page.waitForURL(/\/admin\/reportes-ventas$/);
  await expect(page.locator(".dashboard-topbar h1")).toHaveText(
    "Reporte de ventas",
  );

  const rows = page.locator(".data-table tbody tr");
  const selects = page.locator(".sales-filters select");
  const dates = page.locator('.sales-filters input[type="date"]');

  await expect(rows).toHaveCount(10);

  await selects.nth(0).selectOption("renta");
  await expect(rows).toHaveCount(4);
  await page.getByRole("button", { name: "Limpiar" }).click();
  await expect(rows).toHaveCount(10);

  await selects.nth(1).selectOption("anulada");
  await expect(rows).toHaveCount(3);
  await page.getByRole("button", { name: "Limpiar" }).click();
  await expect(rows).toHaveCount(10);

  await dates.nth(0).fill("2026-09-01");
  await dates.nth(1).fill("2026-10-31");
  await expect(rows).toHaveCount(4);
  await page.getByRole("button", { name: "Limpiar" }).click();
  await expect(rows).toHaveCount(10);

  await expect(page.locator(".month-bar")).toHaveCount(6);
  await expect(
    page.getByRole("heading", { name: "Valor cerrado por mes" }),
  ).toBeVisible();
});

test("exportaciones Excel: libro completo y reportes por sección", async ({
  page,
}) => {
  await login(page);
  await expect(page.locator(".stat-card__value").first()).toHaveText("14");

  await downloadWorkbook(page, "admin-all.xlsx", () =>
    page.getByRole("button", { name: "Exportar libro completo" }).click(),
  );

  await openSection(page, "Usuarios", "Usuarios");
  await expect(page.locator(".data-table tbody tr")).toHaveCount(8);
  await downloadWorkbook(page, "admin-users.xlsx", () =>
    page
      .locator(".dashboard-topbar")
      .getByRole("button", { name: "Exportar usuarios" })
      .click(),
  );

  await openSection(page, "Propiedades", "Propiedades");
  await expect(page.locator(".data-table tbody tr")).toHaveCount(8);
  await downloadWorkbook(page, "admin-properties.xlsx", () =>
    page
      .locator(".dashboard-topbar")
      .getByRole("button", { name: "Exportar propiedades" })
      .click(),
  );

  await openSection(page, "Cierres", "Cierres registrados");
  await expect(page.locator(".data-table tbody tr")).toHaveCount(8);
  await downloadWorkbook(page, "admin-sales.xlsx", () =>
    page
      .locator(".dashboard-topbar")
      .getByRole("button", { name: "Exportar cierres" })
      .click(),
  );

  await page
    .locator(".dashboard-nav")
    .getByRole("link", { name: "Reporte de ventas" })
    .click();
  await page.waitForURL(/\/admin\/reportes-ventas$/);
  await expect(page.locator(".data-table tbody tr")).toHaveCount(10);
  await downloadWorkbook(page, "admin-report.xlsx", () =>
    page.getByRole("button", { name: "Exportar reporte" }).click(),
  );
});
