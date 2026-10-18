/**
 * Records the product walkthrough and composes the final video.
 *
 *   npm run walkthrough
 *
 * Needs the frontend on WALKTHROUGH_URL and its API on WALKTHROUGH_API, with
 * demonstration data and at least one ingested document. Writes
 * walkthrough/cerevia-walkthrough.mp4.
 */

import { chromium, request } from "@playwright/test";
import { mkdir, rename, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { compose } from "./compose.mjs";

const BASE = process.env.WALKTHROUGH_URL ?? "http://localhost:3000";
const API = process.env.WALKTHROUGH_API ?? "http://localhost:3001";
const EMAIL = process.env.E2E_EMAIL ?? "admin@cerevia.dev";
const PASSWORD = process.env.E2E_PASSWORD ?? "admin12345";
const OUT = join(process.cwd(), "walkthrough");
const EFFECTS = fileURLToPath(new URL("./effects.js", import.meta.url));

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** Fresh state for a repeatable take: no old threads, one draft to approve. */
async function prepare() {
  const api = await request.newContext({ baseURL: API });
  const login = await api.post("/api/v1/auth/login", { data: { email: EMAIL, password: PASSWORD } });
  if (!login.ok()) throw new Error(`Login failed: ${login.status()}`);
  const { csrfToken } = await login.json();
  const headers = { "X-CSRF-Token": csrfToken };

  const { items } = await (await api.get("/api/v1/conversations?limit=100")).json();
  for (const conversation of items) {
    await api.delete(`/api/v1/conversations/${conversation.id}`, { headers });
  }

  const proposal = await api.post("/api/v1/actions/proposals", {
    headers,
    data: { kind: "launch_readiness_report", context: { projectId: "prj_launch" } },
  });
  const { proposalId } = await proposal.json();
  await api.dispose();
  return { proposalId };
}

class Director {
  constructor(page) {
    this.page = page;
    this.t0 = Date.now();
    this.captions = [];
    this.marks = {};
  }

  now() {
    return (Date.now() - this.t0) / 1000;
  }

  mark(name) {
    this.marks[name] = this.now();
  }

  caption(title, body) {
    this.captions.push({ t: this.now(), title, body });
  }

  async moveTo(locator) {
    await locator.waitFor({ state: "visible", timeout: 30_000 });
    const box = await locator.boundingBox();
    const x = box.x + box.width / 2;
    const y = box.y + box.height / 2;
    const distance = await this.page.evaluate(([x, y]) => window.__wt.distanceTo(x, y), [x, y]);
    const ms = Math.round(Math.min(1500, Math.max(700, distance * 1.1)));
    await this.page.evaluate(([x, y, ms]) => window.__wt.moveTo(x, y, ms), [x, y, ms]);
    await sleep(ms + 100);
    await this.page.mouse.move(x, y);
    return { x, y };
  }

  async click(locator) {
    const { x, y } = await this.moveTo(locator);
    await sleep(250);
    await this.page.evaluate(() => window.__wt.click());
    await this.page.mouse.click(x, y);
    await sleep(700);
  }

  async type(locator, text) {
    await this.click(locator);
    await this.page.keyboard.type(text, { delay: 95 });
    await sleep(500);
  }

  /** Zooms to fit one element, or the union of several. */
  async zoom(target, maxScale = 1.6, ms = 1400) {
    const boxes = [];
    for (const locator of [target].flat()) {
      await locator.waitFor({ state: "visible", timeout: 30_000 });
      boxes.push(await locator.boundingBox());
    }
    const x = Math.min(...boxes.map((b) => b.x));
    const y = Math.min(...boxes.map((b) => b.y));
    const box = {
      x,
      y,
      width: Math.max(...boxes.map((b) => b.x + b.width)) - x,
      height: Math.max(...boxes.map((b) => b.y + b.height)) - y,
    };
    await this.page.evaluate(([box, s, ms]) => window.__wt.zoom(box, s, ms), [box, maxScale, ms]);
    await sleep(ms + 200);
  }

  async zoomOut(ms = 1200) {
    await this.page.evaluate((ms) => window.__wt.zoom(null, 1, ms), ms);
    await sleep(ms + 200);
  }

  /** Moves the cursor off the content it would otherwise cover. */
  async park(x, y) {
    await this.page.evaluate(([x, y]) => window.__wt.moveTo(x, y, 900), [x, y]);
    await this.page.mouse.move(x, y);
    await sleep(1000);
  }

  async reveal(locator) {
    await locator.evaluate((el) => el.scrollIntoView({ behavior: "smooth", block: "center" }));
    await sleep(1000);
  }

  async heading(name) {
    await this.page.getByRole("heading", { name, level: 1 }).first().waitFor({ timeout: 30_000 });
    await sleep(600);
  }
}

const card = (page, title) =>
  page.getByText(title, { exact: true }).first().locator("xpath=ancestor::div[contains(@class,'border')][1]");

async function scenes(d, page, { proposalId }) {
  const sidebar = (name) => page.locator("aside").getByRole("link", { name, exact: true }).first();

  // Sign in
  await page.goto(`${BASE}/login`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: /continue to workspace/i }).waitFor();
  await sleep(500);
  d.mark("start");
  d.caption("Secure sign-in", "Server-side sessions with CSRF protection. Permissions come from the API.");
  await sleep(1200);
  await d.zoom(page.locator("form").locator("xpath=.."), 1.7);
  await d.type(page.getByLabel("Work Email"), EMAIL);
  await d.type(page.getByLabel("Password"), PASSWORD);
  await d.click(page.getByRole("button", { name: /continue to workspace/i }));
  await page.waitForURL("**/overview");
  await d.heading("Overview");
  await d.zoomOut(1300);

  // Overview
  d.caption("One view of the organisation", "Live counts, open blockers, recent decisions and ingestion health. Demonstration data is always labelled.");
  await sleep(3000);
  await d.zoom(page.getByRole("link", { name: /connected sources/i }).locator("xpath=ancestor::div[contains(@class,'grid')][1]"), 1.5);
  await sleep(3000);
  await d.zoom(card(page, "Outstanding blockers"), 1.6);
  d.caption("Blockers surface on their own", "Tasks the knowledge graph records as blocked, linked straight to the record.");
  await sleep(4000);
  await d.zoomOut();

  // Global search
  await d.click(page.getByRole("button", { name: /search cerevia knowledge graph/i }));
  d.caption("Find anything", "Search people, teams, projects and decisions across the knowledge graph.");
  const palette = page.getByRole("dialog");
  await palette.waitFor();
  await d.zoom(palette, 1.45);
  await page.keyboard.type("payments", { delay: 130 });
  await sleep(2500);
  await d.zoomOut(900);
  await d.click(page.getByRole("option").filter({ hasText: "Payments Launch" }).first());
  await page.waitForURL("**/projects/prj_launch");
  await d.heading("Payments Launch");

  // Project
  d.caption("Projects and their risks", "Status and ownership, with gaps such as a missing owner called out explicitly.");
  await sleep(4000);
  await d.click(page.getByRole("tab", { name: "Risks" }));
  d.caption("Evidence-typed risks", "Each risk states how it is known, how severe it is and why.");
  await sleep(1500);
  await d.zoom(page.getByRole("tabpanel"), 1.5);
  await sleep(4000);
  await d.zoomOut();
  await d.click(page.getByRole("tab", { name: "Dependencies" }));
  d.caption("What the launch is waiting on", "The launch depends on the payment gateway, which is blocked on vendor sign-off.");
  await sleep(2500);
  await d.zoom(page.getByRole("tabpanel").locator("canvas").first().locator("xpath=ancestor::div[contains(@class,'rounded')][1]"), 1.4);
  await sleep(4500);
  await d.zoomOut();

  // Graph explorer
  await d.click(page.getByRole("link", { name: /open in the graph/i }));
  await page.waitForURL("**/graph?**");
  await d.heading("Knowledge graph explorer");
  d.caption("Knowledge graph explorer", "A focused neighbourhood around one entity, never the whole organisation.");
  await sleep(4500);
  const row = page.getByRole("button", { name: /integrate payment gateway/i }).first();
  await d.reveal(row);
  d.caption("Accessible by design", "Everything on the canvas is mirrored in a keyboard-navigable list.");
  await sleep(2500);
  await d.click(row);
  await page.locator("main").evaluate((el) => el.scrollTo({ top: 0, behavior: "smooth" }));
  await sleep(1000);
  const inspector = page.getByRole("complementary", { name: /details for integrate payment gateway/i });
  await d.zoom(inspector, 1.6);
  d.caption("Entity inspector", "Properties, provenance and a link to the underlying record.");
  await sleep(4500);
  await d.zoomOut();

  // Decisions
  await d.click(sidebar("Decisions & Evidence"));
  await d.heading("Decisions and knowledge");
  d.caption("Decision records", "Every decision the organisation has recorded, searchable and filterable.");
  await sleep(3000);
  await d.click(page.locator('a[href="/decisions/dec_queue"]').first());
  await d.heading("Use queue A over queue B");
  d.caption("Who decided, and why", "Owner, approver, rationale, the alternatives considered and the work it affects.");
  await sleep(2500);
  await d.zoom([card(page, "Rationale"), card(page, "Accountability")], 1.45);
  await sleep(4500);
  await d.zoomOut();

  // Sources
  await d.click(sidebar("Knowledge Sources"));
  await d.heading("Knowledge sources");
  d.caption("Knowledge sources", "Uploaded documents are extracted, chunked, embedded and mapped into the graph.");
  await sleep(3500);
  await d.click(page.getByRole("tab", { name: "Ingestion" }));
  d.caption("Ingestion monitor", "Each job's stage and outcome, updated live.");
  await sleep(3500);
  await d.click(page.getByRole("tab", { name: "Connectors" }));
  d.caption("An honest connector catalog", "Planned connectors are shown, but never presented as working.");
  await sleep(4000);

  // Assistant
  await d.click(sidebar("AI Assistant"));
  await page.getByLabel("Your question").waitFor();
  await sleep(800);
  d.caption("Ask in plain language", "The assistant answers from your documents and the knowledge graph.");
  await sleep(2000);
  await d.type(page.getByLabel("Your question"), "Why is the payments launch delayed?");
  await d.click(page.getByRole("button", { name: /^ask$/i }));
  d.caption("Gathering evidence", "It searches documents and follows relationships before it answers.");
  await d.park(1180, 640);
  const conversation = page.getByRole("region", { name: "Conversation" });
  const done = conversation
    .getByRole("button", { name: /this answer was helpful/i })
    .or(conversation.getByRole("alert"))
    .first();
  await done.waitFor({ timeout: 150_000 });
  if (await conversation.getByRole("alert").count()) {
    throw new Error("The assistant could not answer (likely the model quota). Wait a minute and retry.");
  }
  await sleep(1200);
  d.caption("An answer you can check", "Each claim is labelled by how it is known and linked to its source.");
  await d.zoom(
    [
      conversation.getByText("Why is the payments launch delayed?", { exact: true }).last(),
      conversation.getByRole("button", { name: /this answer was helpful/i }),
      page.getByRole("complementary", { name: "Evidence and reasoning" }).locator(".border-l-4").first(),
    ],
    1.6,
  );
  await sleep(5000);
  await d.zoomOut();
  await d.click(page.getByRole("button", { name: /^citation 1/i }).first());
  const sheet = page.getByRole("dialog");
  await sheet.waitFor();
  await sleep(600);
  d.caption("Straight to the source", "The exact passage, its document and version, and the text around it.");
  await d.zoom([sheet.getByRole("heading").first(), sheet.locator("blockquote").first()], 1.6);
  await sleep(5500);
  await d.zoomOut();
  await page.keyboard.press("Escape");
  await sleep(900);

  // Actions
  await d.click(sidebar("Actions & Approvals"));
  await d.heading("Actions and approvals");
  d.caption("A human in the loop", "Drafts are generated from the knowledge base. Nothing is sent without approval.");
  await sleep(3500);
  await d.click(page.locator(`a[href="/actions/${proposalId}"]`).first());
  await page.getByRole("button", { name: /^approve$/i }).waitFor();
  await sleep(2000);
  await d.click(page.getByRole("button", { name: /^approve$/i }));
  const dialog = page.getByRole("dialog");
  await dialog.waitFor();
  await d.zoom(dialog, 1.5);
  d.caption("Deliberate approval", "The consequences are stated plainly, and approval needs explicit confirmation.");
  await sleep(2500);
  await d.type(dialog.getByRole("textbox"), "APPROVE");
  await d.click(dialog.getByRole("button", { name: /^approve$/i }));
  await d.zoomOut();
  d.caption("Approved and audited", "The proposal moves forward and the approval is written to the audit trail.");
  await sleep(4000);

  // Administration
  await d.click(sidebar("Admin & Permissions"));
  await page.getByRole("navigation", { name: /administration sections/i }).waitFor();
  await d.click(page.getByRole("link", { name: "Roles", exact: true }));
  await d.heading("Roles");
  d.caption("Role-based access", "Enforced by the server. The interface only hides what it would refuse.");
  await sleep(4500);
  await d.click(page.getByRole("link", { name: "Audit log", exact: true }));
  await d.heading("Audit log");
  d.caption("A complete audit trail", "Every privileged action, including the approval a moment ago.");
  await sleep(1500);
  await d.zoom([page.getByRole("row").nth(0), page.getByRole("row").nth(4)], 1.5);
  await sleep(4500);
  await d.zoomOut();
  await sleep(1000);
  d.mark("end");
}

async function main() {
  await rm(OUT, { recursive: true, force: true });
  await mkdir(OUT, { recursive: true });
  const setup = await prepare();

  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    colorScheme: "light",
    recordVideo: { dir: OUT, size: { width: 1920, height: 1080 } },
  });
  await context.addInitScript({ path: EFFECTS });
  const page = await context.newPage();
  const director = new Director(page);

  try {
    await scenes(director, page, setup);
  } finally {
    const video = page.video();
    await context.close();
    await browser.close();
    await rename(await video.path(), join(OUT, "raw.webm"));
  }

  const timeline = { start: director.marks.start, end: director.marks.end, captions: director.captions };
  await writeFile(join(OUT, "timeline.json"), JSON.stringify(timeline, null, 2));
  await compose(OUT, timeline);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
