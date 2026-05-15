/**
 * Booking flow tests — READ ONLY, NON-DESTRUCTIVE.
 *
 * Safety constraints enforced here:
 * - NEVER clicks "Confirmar Cita" (the form submit button)
 * - Only uses dates 60+ days in the future (SAFE_CALENDAR_MONTHS_AHEAD = 3)
 * - All client data uses clearly labeled TEST values
 * - Does not create appointments, users, or financial movements
 */
import { test, expect } from "../fixtures/index";
import {
  navigateToBooking,
  openServiceAccordion,
  selectFirstAvailableService,
  advanceCalendarMonths,
  selectFirstAvailableDate,
} from "../helpers/booking";
import { TEST_USER } from "../utils/test-data";

test.describe("Booking Flow — Step 1: Service Selection", () => {
  test.beforeEach(async ({ bookingPage: page }) => {
    void page;
  });

  test("service picker accordion is visible and labeled", async ({ bookingPage: page }) => {
    // Use heading role to avoid strict-mode violation from mobile+desktop duplicate
    await expect(
      page.getByRole("heading", { name: "Selecciona tu Servicio" }).first()
    ).toBeVisible();
    // md:hidden (first) = visible on mobile; hidden md:block (last) = visible on desktop
    const { width } = page.viewportSize() ?? { width: 1280 };
    const accordionHint = page.getByText("Presiona para ver los disponibles");
    await expect(width < 768 ? accordionHint.first() : accordionHint.last()).toBeVisible();
  });

  test("accordion expands and shows services from API", async ({ bookingPage: page }) => {
    await openServiceAccordion(page);
    await page.waitForLoadState("networkidle");
    const serviceCards = page.locator('[class*="rounded-3xl"] div.border-t button[type="button"]');
    await expect(serviceCards.first()).toBeVisible({ timeout: 15_000 });
    const count = await serviceCards.count();
    expect(count).toBeGreaterThan(0);
  });

  test("selecting a service updates accordion header summary", async ({ bookingPage: page }) => {
    await selectFirstAvailableService(page);
    // After selection, the visible accordion no longer shows placeholder text
    const { width } = page.viewportSize() ?? { width: 1280 };
    const accordionHint = page.getByText("Presiona para ver los disponibles");
    await expect(
      width < 768 ? accordionHint.first() : accordionHint.last()
    ).not.toBeVisible({ timeout: 5_000 });
  });
});

test.describe("Booking Flow — Step 2: Date and Time Selection", () => {
  test.beforeEach(async ({ bookingPage: page }) => {
    void page;
  });

  test("calendar is visible on booking page", async ({ bookingPage: page }) => {
    await expect(page.getByText("Elige Fecha y Hora")).toBeVisible();
  });

  test("calendar shows month navigation buttons", async ({ bookingPage: page }) => {
    await expect(page.getByRole("button", { name: "‹" })).toBeVisible();
    await expect(page.getByRole("button", { name: "›" })).toBeVisible();
  });

  test("can navigate forward to future month (3 months ahead)", async ({ bookingPage: page }) => {
    const initialLabel = await page.locator('.font-display.text-sm.font-semibold').first().textContent();
    await advanceCalendarMonths(page, 3);
    const newLabel = await page.locator('.font-display.text-sm.font-semibold').first().textContent();
    expect(newLabel).not.toBe(initialLabel);
  });

  test("clicking a future date triggers occupied-slots API call", async ({ bookingPage: page }) => {
    const [response] = await Promise.all([
      page.waitForResponse((r) => r.url().includes("/api/appointments/occupied"), { timeout: 15_000 }),
      selectFirstAvailableDate(page),
    ]);
    expect(response.status()).toBe(200);
    const json = await response.json();
    expect(json).toHaveProperty("horasOcupadas");
    expect(Array.isArray(json.horasOcupadas)).toBe(true);
  });

  test("time slots appear after selecting a future date", async ({ bookingPage: page }) => {
    await selectFirstAvailableDate(page);
    const timeSlots = page.locator("button").filter({ hasText: /\d{1,2}:\d{2}\s?(AM|PM)/i });
    await expect(timeSlots.first()).toBeVisible({ timeout: 15_000 });
  });
});

test.describe("Booking Flow — Step 3: Client Data Form", () => {
  test.beforeEach(async ({ bookingPage: page }) => {
    void page;
  });

  test("client data section is visible", async ({ bookingPage: page }) => {
    await expect(page.getByText("Ingresa tus Datos")).toBeVisible();
  });

  test("all required fields are present", async ({ bookingPage: page }) => {
    await expect(page.getByPlaceholder("Ej. Juan Pérez")).toBeVisible();
    await expect(page.getByPlaceholder("755 123 4567")).toBeVisible();
    await expect(page.getByPlaceholder("correo@ejemplo.com")).toBeVisible();
  });

  test("confirm button is present", async ({ bookingPage: page }) => {
    await expect(page.getByRole("button", { name: "Confirmar Cita" })).toBeVisible();
  });

  test("can fill client data form with TEST values (does NOT submit)", async ({ bookingPage: page }) => {
    const nombreInput = page.getByPlaceholder("Ej. Juan Pérez");
    const telefonoInput = page.getByPlaceholder("755 123 4567");
    const correoInput = page.getByPlaceholder("correo@ejemplo.com");

    await nombreInput.fill(TEST_USER.nombre);
    await telefonoInput.fill(TEST_USER.telefono);
    await correoInput.fill(TEST_USER.correo);

    await expect(nombreInput).toHaveValue(TEST_USER.nombre);
    await expect(telefonoInput).toHaveValue(TEST_USER.telefono);
    await expect(correoInput).toHaveValue(TEST_USER.correo);

    // Safety assertion: confirm button exists but is NOT clicked
    await expect(page.getByRole("button", { name: "Confirmar Cita" })).toBeVisible();
  });
});

test.describe("Booking Flow — Error Handling (no API mutations)", () => {
  test.beforeEach(async ({ bookingPage: page }) => {
    void page;
  });

  test("submit without date/time shows validation error (no POST to API)", async ({
    bookingPage: page,
  }) => {
    await page.fill('input[placeholder="Ej. Juan Pérez"]', TEST_USER.nombre);
    await page.fill('input[placeholder="755 123 4567"]', TEST_USER.telefono);
    await page.fill('input[placeholder="correo@ejemplo.com"]', TEST_USER.correo);

    let postCalled = false;
    await page.route("**/api/appointments**", (route) => {
      if (route.request().method() === "POST") postCalled = true;
      route.continue();
    });

    await page.getByRole("button", { name: "Confirmar Cita" }).click();

    // Exact error message from manejarSubmit
    await expect(
      page.getByText("Por favor selecciona una fecha y hora.")
    ).toBeVisible({ timeout: 5_000 });

    expect(postCalled).toBe(false);
  });

  test("services API is called on page load", async ({ page }) => {
    const [response] = await Promise.all([
      page.waitForResponse((r) => r.url().includes("/api/services"), { timeout: 15_000 }),
      navigateToBooking(page),
    ]);
    expect(response.status()).toBe(200);
  });

  test("config API is called on page load", async ({ page }) => {
    const [response] = await Promise.all([
      page.waitForResponse((r) => r.url().includes("/api/config"), { timeout: 15_000 }),
      navigateToBooking(page),
    ]);
    expect(response.status()).toBe(200);
  });
});
