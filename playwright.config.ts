import { defineConfig, devices } from "@playwright/test";

// In CI, use port 3000 (default); locally use 3001
const port = process.env.CI ? 3000 : 3001;
const baseURL = process.env.E2E_BASE_URL ?? `http://localhost:${port}`;

// In CI, retry once for flaky test resilience; locally don't retry
const retries = process.env.CI ? 1 : 0;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  timeout: 90_000,
  expect: {
    timeout: 10_000,
  },
  retries,
  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  webServer: {
    command: "npm run dev",
    url: baseURL,
    reuseExistingServer: process.env.CI ? false : true,
    timeout: 120_000,
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
      },
    },
  ],
});
