/**
 * Protected route behavior — verifies access controls work correctly
 * when the user is NOT authenticated.
 *
 * Note: This app uses SPA-internal state routing (all URLs are "/").
 * Protection is enforced at the React Router component level, not at URL level.
 * These tests verify the UI-level enforcement.
 */
import { test, expect } from "@playwright/test";

test.describe("Protected Routes — Unauthenticated State", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("historial link is NOT visible when logged out", async ({ page }) => {
    // "Historial" ghost button only appears in navbar when a cliente is authenticated
    await expect(
      page.getByRole("button", { name: /^Historial$/i })
    ).not.toBeVisible();
  });

  test("panel de control link is NOT visible when logged out", async ({ page }) => {
    // "Panel de control" only appears in navbar when admin is authenticated
    await expect(
      page.getByRole("button", { name: /Panel de control/i })
    ).not.toBeVisible();
  });

  test("logout button is NOT visible when logged out", async ({ page }) => {
    await expect(
      page.getByRole("button", { name: /Cerrar sesión/i })
    ).not.toBeVisible();
  });

  test("Iniciar Sesión IS visible when logged out", async ({ page }) => {
    await expect(page.getByRole("button", { name: "Iniciar Sesión" })).toBeVisible();
  });

  test("clicking navbar Servicios does NOT require auth", async ({ page }) => {
    const { width } = page.viewportSize() ?? { width: 1280 };
    test.skip(width < 768, "Servicios nav hidden on mobile");
    await page.getByRole("button", { name: "Servicios" }).click();
    // Should scroll to services — not redirect to login
    await expect(page.locator("#servicios")).toBeInViewport({ timeout: 5_000 });
    // Login form should NOT have appeared
    await expect(page.getByText("Bienvenido de vuelta")).not.toBeVisible();
  });

  test("booking page is accessible without auth", async ({ page }) => {
    await page.getByRole("button", { name: "Agendar cita" }).first().click();
    await expect(
      page.getByRole("heading", { name: /Agendar Cita/i })
    ).toBeVisible({ timeout: 8_000 });
    // Login form should NOT have appeared
    await expect(page.getByText("Bienvenido de vuelta")).not.toBeVisible();
  });
});

test.describe("Protected Routes — API Authorization", () => {
  test("services endpoint is publicly accessible (GET)", async ({ page }) => {
    const response = await page.request.get("/api/services");
    expect(response.status()).toBe(200);
    const json = await response.json();
    expect(json).toHaveProperty("services");
    expect(Array.isArray(json.services)).toBe(true);
  });

  test("config endpoint is publicly accessible (GET)", async ({ page }) => {
    const response = await page.request.get("/api/config");
    expect(response.status()).toBe(200);
    const json = await response.json();
    expect(json).toHaveProperty("config");
  });

  test("occupied appointments endpoint is publicly accessible (GET)", async ({ page }) => {
    const today = new Date().toISOString().split("T")[0];
    const response = await page.request.get(`/api/appointments/occupied?fecha=${today}`);
    expect(response.status()).toBe(200);
    const json = await response.json();
    expect(json).toHaveProperty("horasOcupadas");
  });

  test("auth/me endpoint returns 401 without token", async ({ page }) => {
    const response = await page.request.get("/api/auth/me");
    expect(response.status()).toBe(401);
  });

  test("appointments list returns 401 without token", async ({ page }) => {
    // GET /api/appointments requires admin auth
    const response = await page.request.get("/api/appointments");
    expect([401, 403]).toContain(response.status());
  });

  test("users list returns 401 without token", async ({ page }) => {
    const response = await page.request.get("/api/users");
    expect([401, 403]).toContain(response.status());
  });
});
