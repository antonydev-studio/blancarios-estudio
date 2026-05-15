import { Page, expect } from "@playwright/test";
import { SAFE_CALENDAR_MONTHS_AHEAD } from "../utils/dates";

export async function navigateToBooking(page: Page): Promise<void> {
  await page.goto("/");
  await page.getByRole("button", { name: "Agendar cita" }).first().click();
  await expect(page.getByRole("heading", { level: 1, name: /Agendar Cita/i })).toBeVisible();
}

// Returns the visible service picker section (desktop or mobile depending on viewport).
function visibleServicePicker(page: Page) {
  // Both mobile and desktop render the same ServicePickerSection.
  // Target by accordion button text — unique enough to avoid strict-mode issues.
  return page.getByRole("button", { name: /Selecciona tu servicio/i }).first();
}

// Opens the service accordion (click the accordion header button).
export async function openServiceAccordion(page: Page): Promise<void> {
  await visibleServicePicker(page).click();
  // Wait for the expanded panel — first ServicePickerCard button appears
  await expect(
    page.locator('[class*="rounded-3xl"] div.border-t button[type="button"]').first()
  ).toBeVisible({ timeout: 12_000 });
}

// Opens accordion, waits for API services to load, selects the first card.
export async function selectFirstAvailableService(page: Page): Promise<void> {
  await openServiceAccordion(page);
  await page.waitForLoadState("networkidle");
  const serviceCards = page.locator('[class*="rounded-3xl"] div.border-t button[type="button"]');
  await serviceCards.first().click();
}

// Clicks the "›" next-month button N times.
export async function advanceCalendarMonths(
  page: Page,
  months: number = SAFE_CALENDAR_MONTHS_AHEAD
): Promise<void> {
  for (let i = 0; i < months; i++) {
    await page.getByRole("button", { name: "›" }).click();
    await page.waitForTimeout(150);
  }
}

// Advances calendar then clicks first non-disabled date.
export async function selectFirstAvailableDate(page: Page): Promise<void> {
  await advanceCalendarMonths(page);
  const dayButtons = page.locator('.grid.grid-cols-7.gap-1 button:not([disabled])');
  await dayButtons.first().click({ timeout: 8_000 });
}
