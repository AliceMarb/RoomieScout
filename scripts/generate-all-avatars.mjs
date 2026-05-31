/**
 * Generate all 16 HMTI avatar PNGs via the dev server API.
 * Usage: node scripts/generate-all-avatars.mjs [--force]
 */
import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const CODES = [
  "NPSD",
  "NPSL",
  "NPFD",
  "NPFL",
  "NOSD",
  "NOSL",
  "NOFD",
  "NOFL",
  "CPSD",
  "CPSL",
  "CPFD",
  "CPFL",
  "COSD",
  "COSL",
  "COFD",
  "COFL",
];

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const envPath = resolve(root, ".env.local");
const avatarsDir = resolve(root, "public", "avatars");
const force = process.argv.includes("--force");

if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}

const port = process.env.PORT ?? "3000";
const base = process.env.GENERATE_AVATAR_BASE_URL ?? `http://localhost:${port}`;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

const results = { ok: [], skipped: [], failed: [] };

console.log(`Generating ${CODES.length} avatars via ${base}/api/avatars/generate\n`);

for (let i = 0; i < CODES.length; i++) {
  const code = CODES[i];
  const outPath = resolve(avatarsDir, `${code}.png`);

  if (!force && existsSync(outPath)) {
    console.log(`[${i + 1}/${CODES.length}] ${code} — skipped (already exists)`);
    results.skipped.push(code);
    continue;
  }

  process.stdout.write(`[${i + 1}/${CODES.length}] ${code} — generating...`);

  try {
    const res = await fetch(`${base}/api/avatars/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
      signal: AbortSignal.timeout(180_000),
    });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      console.log(` FAILED: ${data.error ?? res.statusText}`);
      results.failed.push({ code, error: data.error ?? res.statusText });
    } else {
      console.log(` done → ${data.imageUrl} (${data.model})`);
      results.ok.push(code);
    }
  } catch (err) {
    console.log(` ERROR: ${err.message}`);
    results.failed.push({ code, error: err.message });
  }

  if (i < CODES.length - 1) await sleep(1500);
}

console.log("\n--- Summary ---");
console.log(`Generated: ${results.ok.length}${results.ok.length ? ` (${results.ok.join(", ")})` : ""}`);
console.log(`Skipped:   ${results.skipped.length}${results.skipped.length ? ` (${results.skipped.join(", ")})` : ""}`);
console.log(`Failed:    ${results.failed.length}`);
for (const f of results.failed) {
  console.log(`  ${f.code}: ${f.error}`);
}

process.exit(results.failed.length > 0 ? 1 : 0);
