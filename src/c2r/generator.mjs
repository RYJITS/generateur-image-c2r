import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";

function safeSlug(value) {
  return String(value || "c2r")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40) || "c2r";
}

export function buildPrompt(userPrompt, version) {
  const basePrompt = String(userPrompt || "").trim() || "C2R valid image, adult woman, sculptural impasto paint dress, cinematic real environment";
  const lock = Array.isArray(version.promptLock) ? version.promptLock : [];
  return [basePrompt, ...lock.map((item) => `(${item})`)].join(", ");
}

export function makeOutputPath(config, versionId, jobId) {
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  return path.join(config.paths.outputDir, `${stamp}_${safeSlug(versionId)}_${jobId.slice(0, 8)}.png`);
}

export function buildGenerationArgs({ config, version, prompt, outputPath, params = {} }) {
  const args = [
    config.paths.legacySdxlScript,
    "--prompt", buildPrompt(prompt, version),
    "--negative", String(params.negative || version.negative || "low quality, blurry, broken anatomy, watermark, text"),
    "--output", outputPath,
    "--model", String(params.model || version.model || "juggernaut_xl.safetensors"),
    "--width", String(params.width || version.width || 832),
    "--height", String(params.height || version.height || 1216),
    "--steps", String(params.steps || version.steps || 42),
    "--guidance", String(params.guidance || version.guidance || 5.5),
  ];

  if (params.seed !== undefined && params.seed !== null && String(params.seed).trim()) {
    args.push("--seed", String(params.seed));
  }

  for (const lora of version.loras || []) {
    if (!lora?.name) continue;
    args.push("--lora", lora.name);
    if (lora.strength !== undefined) args.push("--lora-strength", String(lora.strength));
  }

  if (params.poseImage) {
    args.push("--pose-image", String(params.poseImage));
    args.push("--pose-strength", String(params.poseStrength || version.poseStrength || 0.5));
    args.push("--pose-end", String(params.poseEnd || version.poseEnd || 0.65));
  }

  if (params.textureImage && Number(params.textureStrength ?? version.textureStrength ?? 0) > 0) {
    args.push("--texture-image", String(params.textureImage));
    args.push("--texture-strength", String(params.textureStrength ?? version.textureStrength));
    args.push("--texture-end", String(params.textureEnd || version.textureEnd || 1));
  }

  return args;
}

export function runGeneration({ config, jobStore, job, version, params = {} }) {
  fs.mkdirSync(config.paths.outputDir, { recursive: true });
  const args = buildGenerationArgs({
    config,
    version,
    prompt: job.prompt,
    outputPath: job.outputPath,
    params,
  });

  jobStore.updateJob(job.id, {
    status: "running",
    command: `node ${args.map((item) => JSON.stringify(item)).join(" ")}`,
  });

  const env = {
    ...process.env,
    COMFY_API_URL: config.comfyApiUrl,
  };
  if (config.paths.comfyOutputDir) env.COMFY_OUTPUT_DIR = config.paths.comfyOutputDir;
  if (config.paths.comfyInputDir) env.COMFY_INPUT_DIR = config.paths.comfyInputDir;

  const child = spawn(process.execPath, args, {
    cwd: config.paths.competencesDir,
    env,
    windowsHide: true,
  });

  child.stdout.on("data", (chunk) => {
    const text = chunk.toString();
    const current = jobStore.getJob(job.id);
    jobStore.updateJob(job.id, { stdout: `${current?.stdout || ""}${text}`.slice(-8000) });
  });

  child.stderr.on("data", (chunk) => {
    const text = chunk.toString();
    const current = jobStore.getJob(job.id);
    jobStore.updateJob(job.id, { stderr: `${current?.stderr || ""}${text}`.slice(-8000) });
  });

  child.on("error", (error) => {
    jobStore.updateJob(job.id, { status: "failed", error: error.message });
  });

  child.on("close", (code) => {
    const exists = fs.existsSync(job.outputPath);
    jobStore.updateJob(job.id, {
      status: code === 0 && exists ? "completed" : "failed",
      exitCode: code,
      completedAt: new Date().toISOString(),
      outputUrl: exists ? `/api/assets/generated/${path.basename(job.outputPath)}` : "",
      error: code === 0 && exists ? "" : `Generation failed or output missing. Exit code: ${code}`,
    });
  });

  return child;
}
