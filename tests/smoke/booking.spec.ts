import { test, expect } from "@playwright/test";

test.describe("Booking page access", () => {
  test("booking page opens from hero CTA", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Agendar cita" }).first().click();
    await expect(
      page.getByRole("heading", { name: /Agendar Cita/i })
    ).toBeVisible({ timeout: 8_000 });
  });

  test("booking page shows step 1 — service picker", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Agendar cita" }).first().click();
    await expect(
      page.getByRole("heading", { name: /Selecciona tu Servicio/i })
    ).toBeVisible({ timeout: 10_000 });
  });

  test("booking page shows multi-step subtitle", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Agendar cita" }).first().click();
    await expect(
      page.getByText(/tres pasos|reservar tu lugar/i)
    ).toBeVisible({ timeout: 8_000 });
  });

  test("booking page has back-to-home navigation", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Agendar cita" }).first().click();
    await expect(
      page.getByRole("button", { name: /Volver|volver|inicio/i }).first()
    ).toBeVisible({ timeout: 8_000 });
  });
});
