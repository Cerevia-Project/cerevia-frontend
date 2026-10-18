import { defineConfig, devices } from "@playwright/test";

/**
 * E2E configuration.
 *
 * The suite runs against a live API: the real backend on :3001 by default, or
 * the contract mock, selected by NEXT_PUBLIC_API_BASE_URL. Playwright starts
 * the frontend itself and reuses an already-running one.
 */
const PORT = Number(process.env.E2E_PORT ?? 3000);
// `localhost`, not `127.0.0.1`: it has to match the backend's FRONTEND_ORIGIN
// for CORS, and the session cookie is scoped to the host name.
const BASE_URL = process.env.E2E_BASE_URL ?? `http://localhost:${PORT}`;
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";

export default defineConfig({
  testDir: "./e2e",
  // Refuses to run against a different app that happens to hold the port.
  globalSetup: "./e2e/global-setup.ts",
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: process.env.CI ? [["github"], ["list"]] : [["list"]],
  timeout: 60_000,
  expect: { timeout: 15_000 },

  use: {
    baseURL: BASE_URL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },

  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],

  webServer: {
    command: `npm run dev -- --port ${PORT}`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    env: { NEXT_PUBLIC_API_BASE_URL: API_BASE_URL },
  },
});
