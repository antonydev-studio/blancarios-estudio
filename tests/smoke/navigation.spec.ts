import { test, expect } from "@playwright/test";

test.describe("Navigation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("navbar is visible on load", async ({ page }) => {
    await expect(page.locator("nav, header").first()).toBeVisible();
  });

  test("Iniciar Sesión button is present when logged out", async ({ page }) => {
    await expect(page.getByRole("button", { name: "Iniciar Sesión" })).toBeVisible();
  });

  test("Servicios nav link is present on desktop", async ({ page }) => {
    const { width } = page.viewportSize() ?? { width: 1280 };
    test.skip(width < 768, "Servicios nav is hidden on mobile (hidden md:flex)");
    await expect(page.getByRole("button", { name: "Servicios" })).toBeVisible();
  });

  test("clicking Servicios scrolls to services section", async ({ page }) => {
    const { width } = page.viewportSize() ?? { width: 1280 };
    test.skip(width < 768, "Servicios nav is hidden on mobile (hidden md:flex)");
    await page.getByRole("button", { name: "Servicios" }).click();
    await expect(page.locator("#servicios")).toBeInViewport({ timeout: 5_000 });
  });

  test("clicking brand logo scrolls to top", async ({ page }) => {
    const { width } = page.viewportSize() ?? { width: 1280 };
    test.skip(width < 768, "Servicios nav is hidden on mobile (hidden md:flex)");
    await page.getByRole("button", { name: "Servicios" }).click();
    await page.getByRole("button", { name: /Blanca|Inicio/i }).first().click();
    await expect(page.locator("#inicio")).toBeInViewport({ timeout: 5_000 });
  });

  test("Login page opens from Iniciar Sesión", async ({ page }) => {
    await page.getByRole("button", { name: "Iniciar Sesión" }).click();
    await expect(
      page.getByRole("heading", { name: /Iniciar|Bienvenid|Login/i })
    ).toBeVisible({ timeout: 5_000 });
  });
});
