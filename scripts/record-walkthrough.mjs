/**
 * Records the product walkthrough video.
 *
 *   node scripts/record-walkthrough.mjs
 *
 * Needs the frontend on WALKTHROUGH_URL (default http://localhost:3000) and the
 * API behind it, with demonstration data loaded. Writes walkthrough/*.webm;
 * convert with ffmpeg for an .mp4.
 */

import { chromium } from "@playwright/test";
import { mkdir, readdir, rename } from "node:fs/promises";
import { join } from "node:path";

const BASE = process.env.WALKTHROUGH_URL ?? "http://localhost:3000";
const EMAIL = process.env.E2E_EMAIL ?? "admin@cerevia.dev";
const PASSWORD = process.env.E2E_PASSWORD ?? "admin12345";
const OUT = join(process.cwd(), "walkthrough");
const SIZE = { width: 1920, height: 1080 };

const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** Lower-third caption, re-injected after every navigation. */
async function caption(page, title, body = "") {
  await page.evaluate(
    ({ title, body }) => {
      let el = document.getElementById("wt-caption");
      if (!el) {
        el = document.createElement("div");
        el.id = "wt-caption";
        el.style.cssText = [
          "position:fixed", "left:50%", "bottom:40px", "transform:translateX(-50%)",
          "z-index:2147483647", "max-width:1100px", "padding:18px 28px",
          "border-radius:14px", "background:rgba(15,17,21,0.92)", "color:#fff",
          "font-family:Inter,system-ui,sans-serif", "box-shadow:0 12px 40px rgba(0,0,0,.35)",
          "pointer-events:none", "transition:opacity .3s",
        ].join(";");
        document.body.appendChild(el);
      }
      el.innerHTML =
        `<div style="font-size:22px;font-weight:650;letter-spacing:-.01em">${title}</div>` +
        (body ? `<div style="margin-top:6px;font-size:16px;opacity:.78;line-height:1.45">${body}</div>` : "");
    },
    { title, body },
  );
}

/** Full-screen title card. */
async function card(page, title, subtitle, ms = 4000) {
  await page.evaluate(
    ({ title, subtitle }) => {
      const el = document.createElement("div");
      el.id = "wt-card";
      el.style.cssText =
        "position:fixed;inset:0;z-index:2147483647;display:flex;flex-direction:column;" +
        "align-items:center;justify-content:center;background:#0f1115;color:#fff;" +
        "font-family:Inter,system-ui,sans-serif;text-align:center";
      el.innerHTML =
        `<div style="font-size:64px;font-weight:700;letter-spacing:-.03em">${title}</div>` +
        `<div style="margin-top:18px;font-size:24px;opacity:.7;max-width:1100px">${subtitle}</div>`;
      document.body.appendChild(el);
    },
    { title, subtitle },
  );
  await pause(ms);
  await page.evaluate(() => document.getElementById("wt-card")?.remove());
}

async function go(page, path) {
  await page.goto(`${BASE}${path}`, { waitUntil: "networkidle" });
  await pause(800);
}

async function main() {
  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: SIZE,
    colorScheme: "light",
    recordVideo: { dir: OUT, size: SIZE },
  });
  const page = await context.newPage();

  // ── Opening ───────────────────────────────────────────────────────────
  await go(page, "/login");
  await card(
    page,
    "Cerevia",
    "Organizational knowledge, with the evidence behind every answer",
    5000,
  );

  await caption(page, "Secure sign-in", "Session cookie and CSRF protection; permissions come from the server.");
  await page.getByLabel("Work Email").pressSequentially(EMAIL, { delay: 45 });
  await page.getByLabel("Password").pressSequentially(PASSWORD, { delay: 45 });
  await pause(600);
  await page.getByRole("button", { name: /continue to workspace/i }).click();
  await page.waitForURL("**/overview");
  await page.waitForLoadState("networkidle");
  await pause(800);

  // ── Overview ──────────────────────────────────────────────────────────
  await caption(page, "Overview", "Live counts from the API, open blockers, recent decisions and ingestion health. Demonstration data is labelled throughout.");
  await pause(6000);

  // ── Command palette ───────────────────────────────────────────────────
  await page.keyboard.press("Meta+k");
  await pause(500);
  await caption(page, "Global search", "Search any person, team, project or decision in the knowledge graph.");
  await page.getByRole("combobox").pressSequentially("payments", { delay: 90 });
  await pause(3500);
  await page.keyboard.press("Escape");

  // ── Graph explorer ────────────────────────────────────────────────────
  await go(page, "/graph?entity=prj_launch");
  await caption(page, "Knowledge graph explorer", "A focused neighbourhood around one entity — never the whole organisation.");
  await pause(5000);
  const row = page.getByRole("button", { name: /integrate payment gateway/i }).first();
  if (await row.count()) {
    await row.scrollIntoViewIfNeeded();
    await caption(page, "Accessible list view", "Everything on the canvas is mirrored in a keyboard-navigable table.");
    await pause(1500);
    await row.click();
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "smooth" }));
    await caption(page, "Entity inspector", "Properties and provenance: the source passage behind every fact.");
    await pause(5000);
  }

  // ── Project ───────────────────────────────────────────────────────────
  await go(page, "/projects/prj_launch");
  await caption(page, "Projects and risks", "Status, owners, milestones — and gaps called out explicitly.");
  await pause(4000);
  await page.getByRole("tab", { name: "Risks" }).click();
  await caption(page, "Evidence-typed risks", "Each risk carries its evidence kind and rationale; nothing is composed client-side.");
  await pause(4500);
  await page.getByRole("tab", { name: "Dependencies" }).click();
  await caption(page, "Dependency graph", "What the launch is blocked on, laid out hierarchically.");
  await pause(5000);

  // ── Decision ──────────────────────────────────────────────────────────
  await go(page, "/decisions/dec_queue");
  await caption(page, "Decision records", "Owner, approver, rationale, alternatives considered and affected work.");
  await pause(6000);

  // ── Sources ───────────────────────────────────────────────────────────
  await go(page, "/sources");
  await caption(page, "Knowledge sources", "Upload documents; they are extracted, chunked, embedded and mapped into the graph.");
  await pause(3500);
  await page.getByRole("tab", { name: "Ingestion" }).click();
  await caption(page, "Ingestion monitor", "Every job's stage and outcome, polled live.");
  await pause(3500);
  await page.getByRole("tab", { name: "Connectors" }).click();
  await caption(page, "Honest connector catalog", "Planned connectors are visible but never presented as working.");
  await pause(3500);

  // ── Assistant (flagship) ──────────────────────────────────────────────
  await go(page, "/assistant");
  await caption(page, "The assistant", "Ask in plain language. Answers come from your documents and the graph.");
  await pause(2000);
  await page.getByLabel("Your question").pressSequentially("Why is the payments launch delayed?", { delay: 55 });
  await pause(600);
  await page.getByRole("button", { name: /^ask$/i }).click();
  await caption(page, "Retrieving evidence…", "The agent searches documents and traverses relationships before it answers.");

  const conversation = page.getByRole("region", { name: "Conversation" });
  await conversation
    .getByRole("button", { name: /this answer was helpful/i })
    .or(conversation.getByRole("alert"))
    .first()
    .waitFor({ timeout: 120_000 });
  await pause(800);
  await caption(page, "Answered — with evidence", "Each claim is labelled by evidence kind and linked to its source passage.");
  await pause(6000);

  const chip = page.getByRole("button", { name: /^citation \d+/i }).first();
  if (await chip.count()) {
    await chip.click();
    await caption(page, "Open the source", "The exact cited passage, document version and the surrounding text.");
    await pause(6000);
    await page.keyboard.press("Escape");
    await pause(600);
  }

  // ── Actions ───────────────────────────────────────────────────────────
  await go(page, "/actions");
  await caption(page, "Actions and approvals", "Drafts generated from the knowledge base. Nothing leaves the system without a human.");
  await pause(3000);
  const open = page.getByRole("link", { name: /^open$/i }).first();
  if (await open.count()) {
    await open.click();
    await page.waitForLoadState("networkidle");
    await pause(1500);
    const approve = page.getByRole("button", { name: /^approve$/i });
    if (await approve.count()) {
      await approve.click();
      await caption(page, "Deliberate approval", "Explicit confirmation, a clear statement of consequences, and an audit entry.");
      await pause(5000);
      await page.keyboard.press("Escape");
    }
  }

  // ── Admin ─────────────────────────────────────────────────────────────
  await go(page, "/admin/roles");
  await caption(page, "Roles and permissions", "Enforced by the server; the interface hides only what it would refuse.");
  await pause(4000);
  await go(page, "/admin/audit");
  await caption(page, "Audit log", "Every privileged action, searchable by actor, action and date.");
  await pause(4000);

  // ── Close ─────────────────────────────────────────────────────────────
  await card(page, "Cerevia", "Every answer carries its evidence.", 5000);

  const video = page.video();
  await context.close();
  await browser.close();

  const recorded = await video.path();
  const target = join(OUT, "cerevia-walkthrough.webm");
  await rename(recorded, target);
  for (const file of await readdir(OUT)) if (file.endsWith(".webm") && file !== "cerevia-walkthrough.webm") void file;
  console.log(`Recorded ${target}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
