import { Page, expect } from "@playwright/test";

export async function navigateToLogin(page: Page): Promise<void> {
  await page.goto("/");
  await page.getByRole("button", { name: "Iniciar Sesión" }).click();
  await expect(page.getByText("Bienvenido de vuelta")).toBeVisible();
}

export async function navigateToRegister(page: Page): Promise<void> {
  await navigateToLogin(page);
  await page.getByRole("button", { name: "Regístrate aquí" }).click();
  await expect(page.getByText("Crear Cuenta").first()).toBeVisible();
}

export async function fillLoginForm(
  page: Page,
  correo: string,
  contrasena: string
): Promise<void> {
  await page.fill("#login-correo", correo);
  await page.fill("#login-contrasena", contrasena);
}

export async function submitLoginForm(page: Page): Promise<void> {
  // On the login page, modoAuth replaces navbar — only one "Iniciar Sesión" button exists (form submit)
  await page.getByRole("button", { name: "Iniciar Sesión" }).click();
}

export async function navigateToForgotPassword(page: Page): Promise<void> {
  await navigateToLogin(page);
  await page.getByRole("button", { name: /Olvidaste tu contraseña/i }).click();
  await expect(page.getByText(/Olvidaste tu contraseña/i).first()).toBeVisible();
}
