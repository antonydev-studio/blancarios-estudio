import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 1 : 2,
  outputDir: "test-results",

  reporter: [
    ["html", { open: "never", outputFolder: "playwright-report" }],
    ["list"],
  ],

  expect: {
    timeout: 10_000,
  },

  use: {
    baseURL: "https://blancarios-estudio.vercel.app",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    actionTimeout: 10_000,
    navigationTimeout: 30_000,
    locale: "es-MX",
    timezoneId: "America/Mexico_City",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "mobile-chrome",
      use: { ...devices["Pixel 5"] },
    },
    // WebKit (mobile-safari) requires system libs not available on Arch Linux.
    // Enable after: sudo pnpm exec playwright install-deps
    // {
    //   name: "mobile-safari",
    //   use: { ...devices["iPhone 13"] },
    // },
  ],
});
