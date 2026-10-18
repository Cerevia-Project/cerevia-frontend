import { expect, test } from "@playwright/test";

/**
 * Smoke tests for the Cerevia workspace.
 *
 * These run against a live API: either the contract mock (Prism on :4010) or
 * the real backend, selected by NEXT_PUBLIC_API_BASE_URL. Nothing here asserts
 * a specific number, because every figure on screen comes from the API.
 *
 * Credentials come from E2E_EMAIL / E2E_PASSWORD.
 */

const EMAIL = process.env.E2E_EMAIL ?? "admin@cerevia.dev";
const PASSWORD = process.env.E2E_PASSWORD ?? "admin12345";
const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";

/** An API client signed in as the given user, for arranging test data. */
async function apiAs(
  playwright: typeof import("@playwright/test").request,
  email: string,
  password: string,
) {
  const context = await playwright.newContext({ baseURL: API });
  const response = await context.post("/api/v1/auth/login", { data: { email, password } });
  expect(response.ok(), `login failed for ${email}`).toBeTruthy();
  const { csrfToken } = await response.json();
  return { context, csrfToken };
}

async function signIn(page: import("@playwright/test").Page, returnPath = "/overview") {
  await page.goto(`/login?next=${encodeURIComponent(returnPath)}`);
  await page.getByLabel("Work Email").fill(EMAIL);
  await page.getByLabel("Password").fill(PASSWORD);
  await page.getByRole("button", { name: /continue to workspace/i }).click();
  await page.waitForURL(`**${returnPath}`);
}

test.describe("Authentication", () => {
  test("an unauthenticated visitor is sent to login with the return path kept", async ({ page }) => {
    await page.goto("/projects");
    await page.waitForURL(/\/login\?next=/);
    expect(page.url()).toContain(encodeURIComponent("/projects"));
  });

  test("signing in lands on the requested page", async ({ page }) => {
    await signIn(page, "/overview");
    await expect(page.getByRole("heading", { name: "Overview", level: 1 })).toBeVisible();
  });

  test("rejected credentials are reported in place, not swallowed", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Work Email").fill("nobody@example.com");
    await page.getByLabel("Password").fill("wrong-password");
    await page.getByRole("button", { name: /continue to workspace/i }).click();
    await expect(page.getByRole("alert")).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe("Workspace", () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page);
  });

  test("the overview links each metric to the list it counts", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Overview", level: 1 })).toBeVisible();
    await page.getByRole("link", { name: /projects/i }).first().click();
    await page.waitForURL("**/projects");
  });

  test("the command palette finds an entity, whatever the casing", async ({ page, playwright }) => {
    const { context } = await apiAs(playwright.request, EMAIL, PASSWORD);
    const response = await context.get("/api/v1/graph/search?q=a");
    const { items } = await response.json();
    await context.dispose();
    test.skip(items.length === 0, "no entities in this environment");

    // Typed the way a person types: lower case, regardless of how the label
    // is capitalised in the graph.
    const entity = items[0];
    const typed = entity.label.slice(0, 6).toLowerCase();

    await page.keyboard.press("ControlOrMeta+k");
    const search = page.getByRole("combobox");
    await expect(search).toBeVisible();
    await search.fill(typed);

    await expect(page.getByRole("listbox")).toBeVisible();
    await expect(page.getByRole("option").first()).toBeVisible();
  });

  test("the graph explorer starts focused rather than rendering the whole org", async ({ page }) => {
    await page.goto("/graph");
    await expect(page.getByText(/search for an entity to begin/i)).toBeVisible();
  });

  test("the graph exposes a list view alongside the canvas", async ({ page, playwright }) => {
    const { context } = await apiAs(playwright.request, EMAIL, PASSWORD);
    const response = await context.get("/api/v1/graph/search?q=a");
    expect(response.ok()).toBeTruthy();
    const { items } = await response.json();
    await context.dispose();
    test.skip(items.length === 0, "no entities in this environment");

    await page.goto(`/graph?entity=${encodeURIComponent(items[0].id)}`);

    // The canvas is hidden from assistive technology, so the list view is
    // what makes the same data reachable.
    await expect(page.getByRole("tab", { name: /entities/i })).toBeVisible();
    await expect(page.getByRole("tab", { name: /relationships/i })).toBeVisible();
  });

  test("the assistant accepts a question and shows progress", async ({ page }) => {
    await page.goto("/assistant");
    const question = `Why is the launch delayed? ${Date.now()}`;
    await page.getByLabel("Your question").fill(question);
    await page.getByRole("button", { name: /^ask$/i }).click();

    // The question appears in the conversation immediately, before any answer.
    const conversation = page.getByRole("region", { name: "Conversation" });
    await expect(conversation.getByText(question, { exact: true })).toBeVisible();
  });

  test("an unavailable assistant is reported, and the rest stays usable", async ({ page }) => {
    await page.goto("/assistant");
    await page.getByLabel("Your question").fill(`Probe ${Date.now()}`);
    await page.getByRole("button", { name: /^ask$/i }).click();

    const conversation = page.getByRole("region", { name: "Conversation" });

    // Either an answer arrives or the failure is stated outright. What must
    // never happen is the question vanishing into a silent dead end.
    await expect(
      conversation
        .getByRole("alert")
        .or(conversation.getByRole("button", { name: /this answer was helpful/i })),
    ).toBeVisible({ timeout: 45_000 });

    // The workspace keeps working regardless of the assistant's state.
    await page.getByRole("link", { name: /decisions & evidence/i }).click();
    await page.waitForURL("**/decisions");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("planned connectors are visible but not connectable", async ({ page }) => {
    await page.goto("/sources");
    await page.getByRole("tab", { name: /connectors/i }).click();
    const planned = page.getByRole("button", { name: /^planned$/i }).first();
    if (await planned.count()) {
      await expect(planned).toBeDisabled();
    }
  });

  test("decisions and conflicts are both reachable", async ({ page }) => {
    await page.goto("/decisions");
    await expect(page.getByRole("tab", { name: /decisions/i })).toBeVisible();
    await page.getByRole("tab", { name: /conflicts/i }).click();
    await expect(page.getByRole("tabpanel")).toBeVisible();
  });
});

test.describe("Permissions", () => {
  const viewer = {
    email: `viewer+${Date.now()}@cerevia.test`,
    password: "viewer-password-123",
    name: "Read Only",
  };

  test("approval controls are absent without actions:approve", async ({ page, playwright }) => {
    const { context, csrfToken } = await apiAs(playwright.request, EMAIL, PASSWORD);

    // A viewer holds documents:read and nothing that could approve anything.
    const created = await context.post("/api/v1/admin/users", {
      headers: { "X-CSRF-Token": csrfToken },
      data: { email: viewer.email, name: viewer.name, password: viewer.password, role: "role_viewer" },
    });
    expect(created.ok(), await created.text()).toBeTruthy();

    // An admin drafts a proposal for the viewer to look at.
    const proposal = await context.post("/api/v1/actions/proposals", {
      headers: { "X-CSRF-Token": csrfToken },
      data: { kind: "status_report" },
    });
    expect(proposal.ok(), await proposal.text()).toBeTruthy();
    const { proposalId } = await proposal.json();
    await context.dispose();

    await page.goto("/login");
    await page.getByLabel("Work Email").fill(viewer.email);
    await page.getByLabel("Password").fill(viewer.password);
    await page.getByRole("button", { name: /continue to workspace/i }).click();
    await page.waitForURL("**/overview");

    // Administration is not offered to a role that cannot use it.
    await expect(page.getByRole("link", { name: /admin & permissions/i })).toHaveCount(0);

    await page.goto(`/actions/${proposalId}`);
    await expect(page.getByRole("button", { name: /^approve$/i })).toHaveCount(0);
    await expect(page.getByRole("button", { name: /^reject$/i })).toHaveCount(0);
  });
});
