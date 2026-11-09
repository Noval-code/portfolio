import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// Sanity Studio ships minified code with an intentional duplicate switch case.
// OpenNext's esbuild pass reports it as a warning that is harmless but noisy.
// Silencing only that diagnostic keeps the build output clean.
const targets = [
  join(process.cwd(), "node_modules", "@opennextjs", "aws", "dist", "build", "helper.js"),
  join(
    process.cwd(),
    "node_modules",
    "@opennextjs",
    "cloudflare",
    "dist",
    "cli",
    "build",
    "bundle-server.js"
  ),
];

const marker = "bundle: true,";
const replacement = 'bundle: true,\n        logOverride: { "duplicate-case": "silent" },';

for (const target of targets) {
  try {
    let source = readFileSync(target, "utf8");

    if (source.includes('"duplicate-case": "silent"')) {
      console.log(`OpenNext warning patch already applied: ${target}`);
      continue;
    }

    const occurrences = source.split(marker).length - 1;

    if (occurrences === 0) {
      console.log(`OpenNext pattern not found, skipping: ${target}`);
      continue;
    }

    source = source.split(marker).join(replacement);
    writeFileSync(target, source);
    console.log(`Patched OpenNext esbuild options (${occurrences}) : ${target}`);
  } catch (error) {
    // A failed patch should never break installs; the warning is non-fatal.
    console.warn(`Could not patch OpenNext warning (${target}):`, error.message);
  }
}
