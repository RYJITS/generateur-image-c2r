import fs from "node:fs";
import { buildConfig } from "../src/c2r/config.mjs";

const config = buildConfig();
const checks = [
  ["Conpetances", config.paths.competencesDir],
  ["Image valide", config.paths.validImagesDir],
  ["Legacy SDXL script", config.paths.legacySdxlScript],
  ["Legacy C2R script", config.paths.legacyC2rScript],
];

let failed = false;
for (const [label, filePath] of checks) {
  const ok = fs.existsSync(filePath);
  console.log(`${ok ? "OK" : "MISSING"} ${label}: ${filePath}`);
  if (!ok) failed = true;
}

if (failed) process.exit(1);
