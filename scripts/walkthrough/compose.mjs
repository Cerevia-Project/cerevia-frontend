/**
 * Frames the raw recording as a window on a background, lays captions under
 * it and wraps it in intro and outro cards. Assets are rendered with Chromium
 * so the typography matches the app.
 */

import { chromium } from "@playwright/test";
import { spawn } from "node:child_process";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";

const FPS = 25;
const CANVAS = { width: 2560, height: 1440 };
const APP = { width: 1920, height: 1080 };
const TITLE_BAR = 44;
const WINDOW_X = (CANVAS.width - APP.width) / 2;
const WINDOW_Y = 72;
const APP_Y = WINDOW_Y + TITLE_BAR;
const CAPTION_Y = APP_Y + APP.height;
const CAPTION_HEIGHT = CANVAS.height - CAPTION_Y;
const RADIUS = 18;
const INTRO = 4.5;
const OUTRO = 5;
const XFADE = 0.9;

const BACKGROUND = `
  radial-gradient(1400px 900px at 12% 8%, rgba(88,124,190,.55), transparent 60%),
  radial-gradient(1200px 800px at 92% 95%, rgba(118,96,180,.45), transparent 58%),
  linear-gradient(135deg, #0d1628 0%, #172440 50%, #1f2f52 100%)`;

const LOGO = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
  stroke-linecap="round" stroke-linejoin="round"><rect x="16" y="16" width="6" height="6" rx="1"/>
  <rect x="2" y="16" width="6" height="6" rx="1"/><rect x="9" y="2" width="6" height="6" rx="1"/>
  <path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3"/><path d="M12 12V8"/></svg>`;

const FONT = `font-family:-apple-system,BlinkMacSystemFont,"SF Pro Display","Inter",system-ui,sans-serif;`;

const html = (body, style = "") =>
  `<!doctype html><html><head><meta charset="utf-8"><style>
  *{margin:0;padding:0;box-sizing:border-box}
  html,body{width:100%;height:100%;${FONT}-webkit-font-smoothing:antialiased;${style}}
  </style></head><body>${body}</body></html>`;

const backgroundPage = html(
  `<div style="position:absolute;left:${WINDOW_X}px;top:${WINDOW_Y}px;width:${APP.width}px;
     height:${TITLE_BAR + APP.height}px;border-radius:${RADIUS}px;background:#fff;
     box-shadow:0 50px 120px rgba(0,0,0,.5),0 18px 40px rgba(0,0,0,.25),0 0 0 1px rgba(255,255,255,.08)">
     <div style="height:${TITLE_BAR}px;border-radius:${RADIUS}px ${RADIUS}px 0 0;background:#f4f5f7;
       border-bottom:1px solid #e2e4e8;display:flex;align-items:center;padding:0 20px;position:relative">
       <span style="width:13px;height:13px;border-radius:50%;background:#ff5f57;margin-right:9px"></span>
       <span style="width:13px;height:13px;border-radius:50%;background:#febc2e;margin-right:9px"></span>
       <span style="width:13px;height:13px;border-radius:50%;background:#28c840"></span>
       <span style="position:absolute;left:0;right:0;text-align:center;font-size:15px;color:#6b7280;
         font-weight:500">Cerevia</span>
     </div>
   </div>`,
  `background:${BACKGROUND}`,
);

const maskPage = html(
  `<div style="width:${APP.width}px;height:${APP.height}px;background:#fff;
     border-radius:0 0 ${RADIUS}px ${RADIUS}px"></div>`,
  "background:#000",
);

const titleCard = (title, tagline, kicker) =>
  html(
    `<div style="height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;
       color:#fff;text-align:center">
       <div style="width:132px;height:132px;border-radius:30px;background:rgba(255,255,255,.1);
         border:1px solid rgba(255,255,255,.18);display:flex;align-items:center;justify-content:center;
         color:#fff;margin-bottom:44px"><div style="width:70px;height:70px">${LOGO}</div></div>
       <div style="font-size:132px;font-weight:700;letter-spacing:-.035em;line-height:1">${title}</div>
       <div style="margin-top:30px;font-size:42px;opacity:.78;letter-spacing:-.01em">${tagline}</div>
       ${kicker ? `<div style="margin-top:56px;font-size:22px;letter-spacing:.22em;text-transform:uppercase;opacity:.5">${kicker}</div>` : ""}
     </div>`,
    `background:${BACKGROUND}`,
  );

const captionPage = (title, body) =>
  html(
    `<div style="height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;
       text-align:center;color:#fff;padding:0 200px">
       <div style="font-size:46px;font-weight:650;letter-spacing:-.02em">${title}</div>
       ${body ? `<div style="margin-top:14px;font-size:29px;opacity:.74;line-height:1.4">${body}</div>` : ""}
     </div>`,
    "background:transparent",
  );

async function renderAssets(dir, captions) {
  const browser = await chromium.launch();
  const shoot = async (content, size, file, transparent = false) => {
    const page = await browser.newPage({ viewport: size, deviceScaleFactor: 1 });
    await page.setContent(content);
    await page.screenshot({ path: join(dir, file), omitBackground: transparent });
    await page.close();
  };

  await shoot(backgroundPage, CANVAS, "background.png");
  await shoot(maskPage, APP, "mask.png");
  await shoot(titleCard("Cerevia", "Organisational knowledge, with the evidence behind every answer", "Product walkthrough"), CANVAS, "intro.png");
  await shoot(titleCard("Cerevia", "Every answer carries its evidence."), CANVAS, "outro.png");
  for (const [index, caption] of captions.entries()) {
    await shoot(captionPage(caption.title, caption.body), { width: CANVAS.width, height: CAPTION_HEIGHT }, `caption-${index}.png`, true);
  }
  await browser.close();
}

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: ["ignore", "inherit", "inherit"] });
    child.on("exit", (code) => (code === 0 ? resolve() : reject(new Error(`${command} exited with ${code}`))));
  });
}

export async function compose(out, timeline) {
  const assets = join(out, "assets");
  await mkdir(assets, { recursive: true });

  const start = timeline.start;
  const duration = timeline.end - start;
  const captions = timeline.captions.map((caption, index, all) => ({
    ...caption,
    from: Math.max(0, caption.t - start),
    to: (all[index + 1]?.t ?? timeline.end) - start,
  }));

  await renderAssets(assets, captions);

  const still = (file, seconds) => ["-loop", "1", "-framerate", String(FPS), "-t", seconds.toFixed(3), "-i", join(assets, file)];
  const inputs = [
    ...still("background.png", duration),
    "-i", join(out, "raw.webm"),
    ...still("mask.png", duration),
    ...still("intro.png", INTRO),
    ...still("outro.png", OUTRO),
    ...captions.flatMap((caption, index) => still(`caption-${index}.png`, caption.to)),
  ];

  const fade = 0.45;
  const filters = [
    `[1:v]trim=start=${start.toFixed(3)}:end=${timeline.end.toFixed(3)},setpts=PTS-STARTPTS,fps=${FPS},format=yuva420p[app]`,
    `[2:v]format=gray[mask]`,
    `[app][mask]alphamerge[window]`,
    `[0:v][window]overlay=${WINDOW_X}:${APP_Y}[v0]`,
  ];
  captions.forEach((caption, index) => {
    const input = 5 + index;
    const outFade = Math.max(caption.from + fade, caption.to - fade);
    filters.push(
      `[${input}:v]format=rgba,fade=t=in:st=${caption.from.toFixed(3)}:d=${fade}:alpha=1,` +
        `fade=t=out:st=${outFade.toFixed(3)}:d=${fade}:alpha=1[c${index}]`,
      `[v${index}][c${index}]overlay=0:${CAPTION_Y}:eof_action=pass[v${index + 1}]`,
    );
  });
  const last = `v${captions.length}`;
  const total = INTRO + duration + OUTRO - 2 * XFADE;
  filters.push(
    `[${last}]format=yuv420p,settb=AVTB,fps=${FPS}[main]`,
    `[3:v]format=yuv420p,settb=AVTB,fps=${FPS}[intro]`,
    `[4:v]format=yuv420p,settb=AVTB,fps=${FPS}[outro]`,
    `[intro][main]xfade=transition=fade:duration=${XFADE}:offset=${(INTRO - XFADE).toFixed(3)}[x1]`,
    `[x1][outro]xfade=transition=fade:duration=${XFADE}:offset=${(INTRO + duration - 2 * XFADE).toFixed(3)}[x2]`,
    `[x2]fade=t=in:st=0:d=0.6,fade=t=out:st=${(total - 0.9).toFixed(3)}:d=0.9[final]`,
  );

  const target = join(out, "cerevia-walkthrough.mp4");
  await run("ffmpeg", [
    "-y", "-loglevel", "error",
    ...inputs,
    "-filter_complex", filters.join(";"),
    "-map", "[final]",
    "-c:v", "libx264", "-preset", "slow", "-crf", "17", "-pix_fmt", "yuv420p",
    "-r", String(FPS), "-movflags", "+faststart",
    target,
  ]);
  console.log(`Wrote ${target} (${total.toFixed(1)}s)`);
}
