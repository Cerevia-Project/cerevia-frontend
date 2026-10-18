/**
 * Copies the API contract and its fixtures from the backend repository.
 *
 * The frontend depends on exactly one artifact: `openapi.yaml` (plus its
 * fixtures). Point CEREVIA_CONTRACT_DIR at the backend's contracts package,
 * or rely on the sibling-checkout default.
 */

import { cp, mkdir, readdir, stat } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(here, "..");

const contractDir = resolve(
  process.env.CEREVIA_CONTRACT_DIR ??
    join(projectRoot, "..", "cerevia-backend", "packages", "contracts"),
);

const specSource = join(contractDir, "openapi.yaml");
const fixturesSource = join(contractDir, "fixtures");
const specTarget = join(projectRoot, "contracts", "openapi.yaml");
const fixturesTarget = join(projectRoot, "src", "mocks", "fixtures");

async function exists(path) {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

if (!(await exists(specSource))) {
  console.error(
    `No contract at ${specSource}\n` +
      "Set CEREVIA_CONTRACT_DIR to the backend's packages/contracts directory.",
  );
  process.exit(1);
}

await mkdir(dirname(specTarget), { recursive: true });
await cp(specSource, specTarget);
console.log(`Contract  -> ${specTarget}`);

if (await exists(fixturesSource)) {
  await mkdir(fixturesTarget, { recursive: true });
  await cp(fixturesSource, fixturesTarget, { recursive: true });
  const files = await readdir(fixturesTarget);
  console.log(`Fixtures  -> ${fixturesTarget} (${files.length} files)`);
}

console.log("Run `npm run contracts:generate` to regenerate the typed client.");
