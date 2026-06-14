import fs from "node:fs/promises";
import path from "node:path";

export async function loadVersions(config) {
  const entries = await fs.readdir(config.paths.versionsDir, { withFileTypes: true });
  const versions = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const presetPath = path.join(config.paths.versionsDir, entry.name, "preset.json");
    try {
      const preset = JSON.parse(await fs.readFile(presetPath, "utf8"));
      versions.push({ ...preset, presetPath });
    } catch {
      continue;
    }
  }

  versions.sort((a, b) => String(a.id).localeCompare(String(b.id)));
  return versions;
}

export async function getVersion(config, id = "v6-exact-100") {
  const versions = await loadVersions(config);
  const selected = versions.find((version) => version.id === id) || versions.find((version) => version.id === "v6-exact-100") || versions[0];
  if (!selected) throw new Error("No C2R version preset found.");
  return selected;
}
