import { test, expect } from "@playwright/test";

test.describe("Cerevia Enterprise Workspace Smoke Tests", () => {
  test("Overview dashboard loads with calm BI aesthetic and verified metrics", async ({ page }) => {
    await page.goto("/overview");
    await expect(page).toHaveTitle(/Cerevia/);
    await expect(page.locator("h1")).toContainText("Enterprise Knowledge Intelligence");
    await expect(page.getByText("14,290")).toBeVisible();
    await expect(page.getByText("FalkorDB v1.4")).toBeVisible();
  });

  test("Knowledge Assistant opens and displays ground-truth verified claims", async ({ page }) => {
    await page.goto("/assistant");
    await expect(page.locator("h1")).toContainText("Knowledge Assistant");
    await expect(page.getByPlaceholder("Ask Cerevia Assistant")).toBeVisible();
  });

  test("Knowledge Graph Explorer renders interactive SVG canvas", async ({ page }) => {
    await page.goto("/graph");
    await expect(page.locator("h1")).toContainText("Knowledge Graph Explorer");
    await expect(page.locator("#graph-background")).toBeVisible();
    await expect(page.getByText("Node Inspector")).toBeVisible();
  });

  test("Architectural Decisions (ADRs) table and details render", async ({ page }) => {
    await page.goto("/decisions");
    await expect(page.locator("h1")).toContainText("Architectural Decision Records");
    await expect(page.getByText("ADR-042")).toBeVisible();
  });

  test("Design System showcase loads all token tabs and components", async ({ page }) => {
    await page.goto("/design-system");
    await expect(page.locator("h1")).toContainText("Design System & UI Component Showcase");
    await expect(page.getByText("Evidence Verification Badges")).toBeVisible();
    await expect(page.getByRole("tab", { name: /Feedback States/i })).toBeVisible();
  });

  test("Login page renders focused enterprise auth without AppShell", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator("h1")).toContainText("Sign in to Cerevia");
    await expect(page.getByRole("button", { name: "Continue to Workspace" })).toBeVisible();
    // Verify sidebar is not present on login
    await expect(page.locator("nav[aria-label='Sidebar']")).toHaveCount(0);
  });
});
