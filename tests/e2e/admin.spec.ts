/**
 * Admin login flow — safe, read-only validation only.
 *
 * These tests verify admin-related UI behavior without:
 * - Actually logging in as admin
 * - Accessing the admin panel
 * - Modifying any data
 *
 * All credentials used are intentionally invalid.
 */
import { test, expect } from "../fixtures/index";
import { fillLoginForm, submitLoginForm, navigateToLogin } from "../helpers/auth";
import { INVALID_ADMIN_CREDENTIALS } from "../utils/test-data";

test.describe("Admin — Login Form Behavior", () => {
  test.beforeEach(async ({ loginPage: page }) => {
    void page;
  });

  test("login form renders correctly for admin attempt", async ({ loginPage: page }) => {
    await expect(page.locator("#login-correo")).toBeVisible();
    await expect(page.locator("#login-contrasena")).toBeVisible();
    await expect(page.getByText("Bienvenido de vuelta")).toBeVisible();
  });

  test("invalid admin credentials return error response", async ({ loginPage: page }) => {
    await fillLoginForm(page, INVALID_ADMIN_CREDENTIALS.correo, INVALID_ADMIN_CREDENTIALS.contrasena);

    const [response] = await Promise.all([
      page.waitForResponse((r) => r.url().includes("/api/auth/login"), { timeout: 10_000 }),
      submitLoginForm(page),
    ]);

    // 401 = wrong credentials; 429 = rate limited by production server (both are failures, both safe)
    expect([401, 429]).toContain(response.status());
    if (response.status() === 401) {
      const json = await response.json();
      expect(json).toHaveProperty("mensaje");
      await expect(
        page.getByText(/Correo o contraseña incorrectos/i)
      ).toBeVisible({ timeout: 8_000 });
    }
  });

  test("failed login keeps user on login page", async ({ loginPage: page }) => {
    await fillLoginForm(page, INVALID_ADMIN_CREDENTIALS.correo, INVALID_ADMIN_CREDENTIALS.contrasena);
    await submitLoginForm(page);
    // Should remain on the login form after failure
    await expect(page.getByText("Bienvenido de vuelta")).toBeVisible({ timeout: 10_000 });
  });
});

test.describe("Admin — Access Control (unauthenticated)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("admin panel button not present in navbar when logged out", async ({ page }) => {
    await expect(
      page.getByRole("button", { name: /Panel de control/i })
    ).not.toBeVisible();
  });

  test("admin-protected endpoints return 401/403 without token", async ({ page }) => {
    const endpoints = [
      { url: "/api/users", methods: ["GET"] },
      { url: "/api/movements", methods: ["GET"] },
      { url: "/api/blocked-clients", methods: ["GET"] },
    ];

    for (const endpoint of endpoints) {
      const response = await page.request.get(endpoint.url);
      expect(
        [401, 403],
        `Expected ${endpoint.url} to require auth, got ${response.status()}`
      ).toContain(response.status());
    }
  });
});

test.describe("Admin — Login API Response Structure", () => {
  test("login endpoint returns correct error structure for bad credentials", async ({ page }) => {
    await navigateToLogin(page);
    const response = await page.request.post("/api/auth/login", {
      data: {
        correo: INVALID_ADMIN_CREDENTIALS.correo,
        contrasena: INVALID_ADMIN_CREDENTIALS.contrasena,
      },
    });
    // 401 = wrong credentials; 429 = rate limited by production server (both are expected failure modes)
    expect([401, 429]).toContain(response.status());
    if (response.status() === 401) {
      const json = await response.json();
      expect(json).toHaveProperty("mensaje");
      expect(typeof json.mensaje).toBe("string");
      expect(json.mensaje.endsWith(".")).toBe(true);
    }
  });
});
