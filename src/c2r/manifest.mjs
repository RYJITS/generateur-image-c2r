import fs from "node:fs/promises";
import fsSync from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const IMAGE_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".webp"]);

function imageId(filePath) {
  return crypto.createHash("sha1").update(path.resolve(filePath).toLowerCase()).digest("hex").slice(0, 16);
}

async function walkImages(rootDir) {
  const items = [];
  const entries = await fs.readdir(rootDir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(rootDir, entry.name);
    if (entry.isDirectory()) {
      items.push(...await walkImages(fullPath));
      continue;
    }
    if (!entry.isFile()) continue;
    const ext = path.extname(entry.name).toLowerCase();
    if (!IMAGE_EXTENSIONS.has(ext)) continue;
    const stat = await fs.stat(fullPath);
    const relativePath = path.relative(rootDir, fullPath).replaceAll("\\", "/");
    items.push({
      id: imageId(fullPath),
      name: entry.name,
      relativePath,
      path: fullPath,
      ext,
      size: stat.size,
      mtimeMs: stat.mtimeMs,
      updatedAt: stat.mtime.toISOString(),
      assetUrl: `/api/assets/image-valide/${imageId(fullPath)}`,
    });
  }

  return items;
}

export async function refreshImageValideManifest(config) {
  const rootDir = config.paths.validImagesDir;
  if (!fsSync.existsSync(rootDir)) {
    throw new Error(`Image valide folder not found: ${rootDir}`);
  }

  const items = await walkImages(rootDir);
  items.sort((a, b) => b.mtimeMs - a.mtimeMs || a.relativePath.localeCompare(b.relativePath));

  const manifest = {
    type: "c2r-image-valide-manifest",
    version: 1,
    generatedAt: new Date().toISOString(),
    rootDir,
    count: items.length,
    totalBytes: items.reduce((sum, item) => sum + item.size, 0),
    items,
  };

  await fs.mkdir(path.dirname(config.paths.manifestPath), { recursive: true });
  await fs.writeFile(config.paths.manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  return manifest;
}

export async function readImageValideManifest(config, { refreshIfMissing = true } = {}) {
  try {
    const raw = await fs.readFile(config.paths.manifestPath, "utf8");
    return JSON.parse(raw);
  } catch (error) {
    if (!refreshIfMissing) throw error;
    return refreshImageValideManifest(config);
  }
}

export function sliceManifest(manifest, { offset = 0, limit = 60, query = "" } = {}) {
  const normalizedQuery = String(query || "").trim().toLowerCase();
  let items = manifest.items || [];
  if (normalizedQuery) {
    items = items.filter((item) => {
      return item.name.toLowerCase().includes(normalizedQuery)
        || item.relativePath.toLowerCase().includes(normalizedQuery);
    });
  }
  const safeOffset = Math.max(0, Number(offset) || 0);
  const safeLimit = Math.min(120, Math.max(1, Number(limit) || 60));
  return {
    generatedAt: manifest.generatedAt,
    rootDir: manifest.rootDir,
    count: items.length,
    totalBytes: manifest.totalBytes || 0,
    offset: safeOffset,
    limit: safeLimit,
    items: items.slice(safeOffset, safeOffset + safeLimit),
  };
}

export function findManifestItem(manifest, id) {
  return (manifest.items || []).find((item) => item.id === id);
}
