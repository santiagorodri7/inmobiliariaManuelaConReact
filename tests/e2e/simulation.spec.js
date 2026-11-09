import { test, expect } from "@playwright/test";

const ADMIN_EMAIL = "admin.demo@manuela.local";
const ADMIN_PASSWORD = "Demo1234!";
const CHART_IDS = [
  "chart-buyer-balances",
  "chart-buyer-status",
  "chart-buyer-interests",
  "chart-seller-balances",
  "chart-seller-status",
  "chart-seller-sold",
  "chart-admin-types",
  "chart-admin-share",
  "chart-admin-quality",
];

test.describe.configure({ mode: "serial" });

async function login(page) {
  await page.goto("/login");
  await page.locator("#login-email").fill(ADMIN_EMAIL);
  await page.locator("#login-password").fill(ADMIN_PASSWORD);
  await page.getByRole("button", { name: "Ingresar a mi cuenta" }).click();
  await page.waitForURL(/\/admin$/);
}

async function expectAllCharts(page) {
  for (const chartId of CHART_IDS) {
    await expect(page.getByTestId(chartId)).toBeVisible();
  }
  await expect(
    page.locator(".simulation-chart .recharts-responsive-container"),
  ).toHaveCount(CHART_IDS.length);
}

test("simulación: navegación, nueve gráficos y totales", async ({ page }) => {
  await login(page);

  await page
    .locator(".dashboard-nav")
    .getByRole("link", { name: "Simulación" })
    .click();
  await page.waitForURL(/\/admin\/simulacion$/);

  await expect(page.locator(".dashboard-topbar h1")).toHaveText(
    "Reportes de simulación",
  );
  await expect(
    page.getByText("Indicadores generados a partir de los CSV limpios"),
  ).toBeVisible();

  const cards = page.locator(".simulation-summary .stat-card");
  await expect(cards).toHaveCount(4);
  await expect(cards.nth(0).locator(".stat-card__value")).toHaveText("300");
  await expect(cards.nth(1).locator(".stat-card__value")).toHaveText("300");
  await expect(cards.nth(2).locator(".stat-card__value")).toHaveText("300");
  await expect(cards.nth(3).locator(".stat-card__value")).toHaveText("315");

  await expectAllCharts(page);

  await expect(
    page.getByRole("heading", { name: "Comportamiento de compra" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Comportamiento de venta" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Gestión y calidad de datos" }),
  ).toBeVisible();

  const refreshed = page.waitForResponse(
    (response) =>
      response.url().includes("/api/simulation/overview") &&
      response.status() === 200,
  );
  await page.getByRole("button", { name: "Actualizar datos" }).click();
  await refreshed;
  await expectAllCharts(page);
  await expect(page.getByText(/Datos actualizados el/)).toBeVisible();
});

test("simulación: error del API y reintento", async ({ page }) => {
  await login(page);

  let failNextRequest = true;
  await page.route("**/api/simulation/overview", async (route) => {
    if (failNextRequest) {
      failNextRequest = false;
      await route.fulfill({
        status: 503,
        contentType: "application/json",
        body: JSON.stringify({ detail: "Simulación no disponible" }),
      });
      return;
    }
    await route.continue();
  });

  await page
    .locator(".dashboard-nav")
    .getByRole("link", { name: "Simulación" })
    .click();
  await page.waitForURL(/\/admin\/simulacion$/);

  await expect(
    page.getByRole("heading", { name: "No pudimos cargar los reportes" }),
  ).toBeVisible();
  await expect(
    page.getByText("No se pudo conectar con el servicio de simulación."),
  ).toBeVisible();

  const retried = page.waitForResponse(
    (response) =>
      response.url().includes("/api/simulation/overview") &&
      response.status() === 200,
  );
  await page.getByRole("button", { name: "Reintentar" }).click();
  await retried;

  await expectAllCharts(page);
  await expect(
    page.locator(".simulation-summary .stat-card").first(),
  ).toBeVisible();

  await page.unroute("**/api/simulation/overview");
});
