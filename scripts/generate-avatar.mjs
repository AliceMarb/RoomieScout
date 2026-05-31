/**
 * Generate one HMTI avatar PNG via OpenAI image models.
 * Usage: node scripts/generate-avatar.mjs NPSD
 * Requires OPENAI_API_KEY in .env.local
 */
import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const envPath = resolve(root, ".env.local");

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

const code = (process.argv[2] ?? "NPSD").toUpperCase();
const preview = process.argv.includes("--preview");
const style = process.argv.includes("--classic") ? "classic" : "cool";
const port = process.env.PORT ?? "3000";
const base = process.env.GENERATE_AVATAR_BASE_URL ?? `http://localhost:${port}`;

console.log(`Generating avatar for ${code} via ${base}/api/avatars/generate ...`);

const res = await fetch(`${base}/api/avatars/generate`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ code, style, preview }),
});

const data = await res.json().catch(() => ({}));
if (!res.ok) {
  console.error("Failed:", data.error ?? res.statusText);
  process.exit(1);
}

console.log("Success!");
console.log("  Model:", data.model);
console.log("  Image:", data.imageUrl);
console.log("  Saved: public" + data.imageUrl);
