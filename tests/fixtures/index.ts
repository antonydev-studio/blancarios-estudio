import { test as base, expect, Page } from "@playwright/test";
import { navigateToLogin } from "../helpers/auth";
import { navigateToBooking } from "../helpers/booking";

type AppFixtures = {
  loginPage: Page;
  bookingPage: Page;
};

export const test = base.extend<AppFixtures>({
  loginPage: async ({ page }, use) => {
    await navigateToLogin(page);
    await use(page);
  },
  bookingPage: async ({ page }, use) => {
    await navigateToBooking(page);
    await use(page);
  },
});

export { expect };
