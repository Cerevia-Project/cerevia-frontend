import type { FullConfig } from "@playwright/test";

/**
 * Confirms the server under test is actually this app.
 *
 * Playwright's `reuseExistingServer` trusts whatever answers on the port. A
 * stray service there (the FalkorDB Browser publishes on 3000 by default)
 * returns 200 for every path, so the whole suite will run against the wrong
 * application and fail in ways that look like app bugs. Failing here instead
 * makes the real cause obvious.
 */
export default async function globalSetup(config: FullConfig): Promise<void> {
  const baseURL = config.projects[0]?.use?.baseURL;
  if (!baseURL) return;

  const response = await fetch(new URL("/login", baseURL));
  const body = await response.text();

  if (!body.includes("Cerevia")) {
    throw new Error(
      `${baseURL} is serving something other than the Cerevia frontend.\n` +
        "Another process is on that port. Stop it, or set E2E_PORT to a free one.",
    );
  }
}
