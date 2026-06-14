import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const PROJECT_ROOT = path.resolve(__dirname, "..", "..");

const LOCAL_ENV_PATH = path.join(PROJECT_ROOT, ".env.local");
const DEFAULT_WORKSPACE_ROOT = "D:/00_Cerveau_IA";
const CENTRAL_ENV_PATH = path.join(DEFAULT_WORKSPACE_ROOT, "API", "env.Local");

dotenv.config({ path: LOCAL_ENV_PATH, override: false });
dotenv.config({ path: CENTRAL_ENV_PATH, override: false });

function readJsonIfExists(filePath) {
  try {
    if (!fs.existsSync(filePath)) return {};
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    throw new Error(`Cannot read JSON config ${filePath}: ${error.message}`);
  }
}

function pickEnv(name, fallback) {
  const value = process.env[name];
  return value && value.trim() ? value.trim() : fallback;
}

function ensureDirectory(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
  return dirPath;
}

export function buildConfig() {
  const pathsFile = path.join(PROJECT_ROOT, "config", "c2r.paths.json");
  const fileConfig = readJsonIfExists(pathsFile);

  const workspaceRoot = pickEnv("C2R_WORKSPACE_ROOT", fileConfig.workspaceRoot || DEFAULT_WORKSPACE_ROOT);
  const competencesDir = pickEnv("C2R_COMPETENCES_DIR", fileConfig.competencesDir || path.join(workspaceRoot, "Conpetances"));
  const runtimeDir = path.join(PROJECT_ROOT, "runtime");
  const outputDir = path.join(runtimeDir, "outputs", "generated");
  const jobsDir = path.join(runtimeDir, "jobs");
  const feedbackDir = path.join(runtimeDir, "feedback");
  const logsDir = path.join(runtimeDir, "logs");

  const paths = {
    workspaceRoot,
    competencesDir,
    validImagesDir: pickEnv(
      "C2R_VALID_IMAGES_DIR",
      fileConfig.validImagesDir || path.join(competencesDir, "Image", "outputs", "Image valide"),
    ),
    legacyC2rScript: pickEnv(
      "C2R_LEGACY_SCRIPT",
      fileConfig.legacyC2rScript || path.join(competencesDir, "generate-image-c2r-system.mjs"),
    ),
    legacySdxlScript: pickEnv(
      "C2R_LEGACY_SDXL_SCRIPT",
      fileConfig.legacySdxlScript || path.join(competencesDir, "generate-image-local-sdxl.mjs"),
    ),
    manifestPath: path.join(PROJECT_ROOT, "data", "manifests", "image-valide.json"),
    versionsDir: path.join(PROJECT_ROOT, "versions"),
    runtimeDir,
    outputDir,
    jobsDir,
    feedbackDir,
    logsDir,
    comfyOutputDir: pickEnv("C2R_COMFY_OUTPUT_DIR", fileConfig.comfyOutputDir || ""),
    comfyInputDir: pickEnv("C2R_COMFY_INPUT_DIR", fileConfig.comfyInputDir || ""),
  };

  ensureDirectory(outputDir);
  ensureDirectory(jobsDir);
  ensureDirectory(feedbackDir);
  ensureDirectory(logsDir);
  ensureDirectory(path.dirname(paths.manifestPath));

  return {
    projectRoot: PROJECT_ROOT,
    appName: "Generateur image C2R",
    port: Number(pickEnv("C2R_PORT", "5176")),
    comfyApiUrl: pickEnv("C2R_COMFY_API_URL", fileConfig.comfyApiUrl || "http://127.0.0.1:8188"),
    paths,
  };
}

export function publicConfig(config) {
  return {
    appName: config.appName,
    port: config.port,
    comfyApiUrl: config.comfyApiUrl,
    paths: {
      projectRoot: config.projectRoot,
      validImagesDir: config.paths.validImagesDir,
      outputDir: config.paths.outputDir,
      manifestPath: config.paths.manifestPath,
      versionsDir: config.paths.versionsDir,
      legacySdxlScript: config.paths.legacySdxlScript,
    },
  };
}
