import type { FullConfig } from "@playwright/test";

/** Fails fast when another app (such as the FalkorDB Browser) holds the port. */
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
