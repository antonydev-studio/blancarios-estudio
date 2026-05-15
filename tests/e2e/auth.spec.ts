import { test, expect } from "../fixtures/index";
import {
  navigateToLogin,
  navigateToRegister,
  navigateToForgotPassword,
  fillLoginForm,
  submitLoginForm,
} from "../helpers/auth";
import { INVALID_CREDENTIALS, INVALID_FORM_INPUTS } from "../utils/test-data";

test.describe("Authentication — Login Form", () => {
  test.beforeEach(async ({ loginPage: page }) => {
    // fixture navigates to login and asserts it loaded
    void page;
  });

  test("renders login form with email and password fields", async ({ loginPage: page }) => {
    await expect(page.locator("#login-correo")).toBeVisible();
    await expect(page.locator("#login-contrasena")).toBeVisible();
    await expect(page.getByRole("button", { name: "Iniciar Sesión" })).toBeVisible();
  });

  test("shows error for invalid credentials", async ({ loginPage: page }) => {
    await fillLoginForm(page, INVALID_CREDENTIALS.correo, INVALID_CREDENTIALS.contrasena);

    const [response] = await Promise.all([
      page.waitForResponse((r) => r.url().includes("/api/auth/login"), { timeout: 10_000 }),
      submitLoginForm(page),
    ]);

    // 401 = wrong credentials; 429 = rate limited by production server (both keep user on login page)
    expect([401, 429]).toContain(response.status());
    if (response.status() === 401) {
      await expect(
        page.getByText(/Correo o contraseña incorrectos/i)
      ).toBeVisible({ timeout: 8_000 });
    } else {
      // Rate limited — login page must still be visible (not navigated away)
      await expect(page.getByText("Bienvenido de vuelta")).toBeVisible({ timeout: 5_000 });
    }
  });

  test("shows error for empty form submission", async ({ loginPage: page }) => {
    await submitLoginForm(page);
    // Should not navigate away — still on login
    await expect(page.getByText("Bienvenido de vuelta")).toBeVisible();
  });

  test("forgot password link navigates to recovery form", async ({ page }) => {
    await navigateToForgotPassword(page);
    await expect(page.locator("#recuperar-correo")).toBeVisible({ timeout: 5_000 });
  });

  test("register link navigates to registration form", async ({ page }) => {
    await navigateToRegister(page);
    await expect(page.locator("#registro-nombre")).toBeVisible({ timeout: 5_000 });
    await expect(page.locator("#registro-telefono")).toBeVisible();
    await expect(page.locator("#registro-correo")).toBeVisible();
    await expect(page.locator("#registro-contrasena")).toBeVisible();
  });
});

test.describe("Authentication — Registration Form Validation", () => {
  test.beforeEach(async ({ page }) => {
    await navigateToRegister(page);
  });

  test("shows validation error for invalid email format", async ({ page }) => {
    await page.fill("#registro-nombre", "TEST User");
    await page.fill("#registro-telefono", "7551234567");
    await page.fill("#registro-correo", INVALID_FORM_INPUTS.correoMalFormato);
    await page.fill("#registro-contrasena", "ValidPass123!");
    await page.getByRole("button", { name: "Crear Cuenta" }).click();
    await expect(page.getByText(/correo válido/i)).toBeVisible({ timeout: 5_000 });
  });

  test("shows validation error for short phone number", async ({ page }) => {
    await page.fill("#registro-nombre", "TEST User");
    await page.fill("#registro-telefono", INVALID_FORM_INPUTS.telefonoCorto);
    await page.fill("#registro-correo", "valid@example.com");
    await page.fill("#registro-contrasena", "ValidPass123!");
    await page.getByRole("button", { name: "Crear Cuenta" }).click();
    await expect(page.getByText(/10 dígitos/i)).toBeVisible({ timeout: 5_000 });
  });

  test("shows validation error for weak password", async ({ page }) => {
    await page.fill("#registro-nombre", "TEST User");
    await page.fill("#registro-telefono", "7551234567");
    await page.fill("#registro-correo", "valid@example.com");
    await page.fill("#registro-contrasena", INVALID_FORM_INPUTS.contrasenaDebil);
    await page.getByRole("button", { name: "Crear Cuenta" }).click();
    // Exact message from src/utils/passwordUtils.js CONTRASENA_MENSAJE
    await expect(
      page.getByText("Mínimo 8 caracteres, una mayúscula, una minúscula y un número.")
    ).toBeVisible({ timeout: 5_000 });
  });

  test("login link on registration navigates back to login", async ({ page }) => {
    // Two "Iniciar Sesión" buttons exist on registration page (navbar + form link), both go to login
    await page.getByRole("button", { name: "Iniciar Sesión" }).first().click();
    await expect(page.getByText("Bienvenido de vuelta")).toBeVisible({ timeout: 5_000 });
  });
});

test.describe("Authentication — Forgot Password Form", () => {
  test.beforeEach(async ({ page }) => {
    await navigateToForgotPassword(page);
  });

  test("renders email field", async ({ page }) => {
    await expect(page.locator("#recuperar-correo")).toBeVisible();
  });

  test("submit with empty email stays on form", async ({ page }) => {
    await page.getByRole("button", { name: /Enviar|Recuperar|Continuar/i }).click();
    await expect(page.locator("#recuperar-correo")).toBeVisible({ timeout: 5_000 });
  });
});
