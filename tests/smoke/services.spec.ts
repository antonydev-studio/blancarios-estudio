import { test, expect } from "@playwright/test";

test.describe("Services section", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("services section heading is present", async ({ page }) => {
    const section = page.locator("#servicios");
    await expect(section.getByRole("heading", { name: "Nuestros Servicios" })).toBeVisible();
  });

  test("services section subtitle is present", async ({ page }) => {
    await expect(
      page.getByText(/Cada servicio incluye atención personalizada/i)
    ).toBeVisible();
  });

  test("at least one service card loads from API", async ({ page }) => {
    await page.waitForLoadState("networkidle");
    const cards = page.locator("#servicios article.card");
    await expect(cards.first()).toBeVisible({ timeout: 15_000 });
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);
  });

  test("service cards have a name", async ({ page }) => {
    await page.waitForLoadState("networkidle");
    const firstCardTitle = page.locator("#servicios article.card h4").first();
    await expect(firstCardTitle).toBeVisible({ timeout: 15_000 });
    const text = await firstCardTitle.textContent();
    expect(text?.trim().length).toBeGreaterThan(0);
  });
});
