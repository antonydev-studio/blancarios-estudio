import { test, expect } from "@playwright/test";

test.describe("Homepage", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("page title is correct", async ({ page }) => {
    await expect(page).toHaveTitle("Blanca Rios Estudio");
  });

  test("brand label is visible", async ({ page }) => {
    await expect(page.getByText("Blanca Ríos Estudio").first()).toBeVisible();
  });

  test("hero heading is visible", async ({ page }) => {
    await expect(
      page.getByRole("heading", { level: 1, name: /experiencia/i })
    ).toBeVisible();
  });

  test("hero CTA button is visible", async ({ page }) => {
    await expect(
      page.getByRole("button", { name: "Agendar cita" }).first()
    ).toBeVisible();
  });

  test("page loads without JS errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));
    await page.waitForLoadState("networkidle");
    expect(errors).toHaveLength(0);
  });
});
