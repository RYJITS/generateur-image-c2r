import { buildConfig } from "../src/c2r/config.mjs";
import { refreshImageValideManifest } from "../src/c2r/manifest.mjs";

const config = buildConfig();
const manifest = await refreshImageValideManifest(config);

console.log(`Image valide manifest refreshed: ${manifest.count} files, ${Math.round(manifest.totalBytes / 1024 / 1024)} MB`);
console.log(config.paths.manifestPath);
