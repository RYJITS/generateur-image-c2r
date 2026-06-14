import express from "express";
import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import { buildConfig, publicConfig } from "../c2r/config.mjs";
import {
  findManifestItem,
  readImageValideManifest,
  refreshImageValideManifest,
  sliceManifest,
} from "../c2r/manifest.mjs";
import { getVersion, loadVersions } from "../c2r/versions.mjs";
import { createJobStore } from "../c2r/jobs.mjs";
import { buildGenerationArgs, makeOutputPath, runGeneration } from "../c2r/generator.mjs";

const config = buildConfig();
const jobStore = createJobStore(config);

function jsonError(res, status, message, extra = {}) {
  return res.status(status).json({ ok: false, error: message, ...extra });
}

function assertInside(rootDir, targetPath) {
  const root = path.resolve(rootDir);
  const target = path.resolve(targetPath);
  if (target !== root && !target.startsWith(`${root}${path.sep}`)) {
    throw new Error("Resolved path is outside the allowed root.");
  }
  return target;
}

async function appendFeedback(record) {
  const filePath = path.join(config.paths.feedbackDir, "feedback.jsonl");
  await fsp.mkdir(path.dirname(filePath), { recursive: true });
  await fsp.appendFile(filePath, `${JSON.stringify({ at: new Date().toISOString(), ...record })}\n`, "utf8");
}

async function probeComfy() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 1500);
  try {
    const response = await fetch(`${config.comfyApiUrl.replace(/\/$/, "")}/system_stats`, {
      signal: controller.signal,
    });
    return { ok: response.ok, status: response.status };
  } catch (error) {
    return { ok: false, error: error.name === "AbortError" ? "timeout" : error.message };
  } finally {
    clearTimeout(timeout);
  }
}

async function createApp() {
  const app = express();
  app.disable("x-powered-by");
  app.use(express.json({ limit: "2mb" }));

  app.get("/api/health", async (req, res) => {
    const manifestExists = fs.existsSync(config.paths.manifestPath);
    let manifestCount = null;
    if (manifestExists) {
      try {
        const manifest = await readImageValideManifest(config, { refreshIfMissing: false });
        manifestCount = manifest.count;
      } catch {
        manifestCount = null;
      }
    }

    res.json({
      ok: true,
      time: new Date().toISOString(),
      paths: {
        projectRoot: fs.existsSync(config.projectRoot),
        validImagesDir: fs.existsSync(config.paths.validImagesDir),
        legacySdxlScript: fs.existsSync(config.paths.legacySdxlScript),
        manifest: manifestExists,
      },
      manifestCount,
      comfy: await probeComfy(),
    });
  });

  app.get("/api/config", async (req, res) => {
    res.json({
      ok: true,
      config: publicConfig(config),
      versions: await loadVersions(config),
    });
  });

  app.get("/api/gallery/image-valide", async (req, res) => {
    try {
      const refresh = req.query.refresh === "1" || req.query.refresh === "true";
      const manifest = refresh
        ? await refreshImageValideManifest(config)
        : await readImageValideManifest(config);
      res.json({
        ok: true,
        gallery: sliceManifest(manifest, {
          offset: req.query.offset,
          limit: req.query.limit,
          query: req.query.query,
        }),
      });
    } catch (error) {
      jsonError(res, 500, error.message);
    }
  });

  app.post("/api/gallery/refresh", async (req, res) => {
    try {
      const manifest = await refreshImageValideManifest(config);
      res.json({ ok: true, manifest: sliceManifest(manifest, { limit: 60 }) });
    } catch (error) {
      jsonError(res, 500, error.message);
    }
  });

  app.get("/api/assets/image-valide/:id", async (req, res) => {
    try {
      const manifest = await readImageValideManifest(config);
      const item = findManifestItem(manifest, req.params.id);
      if (!item) return jsonError(res, 404, "Image not found in manifest.");
      const filePath = assertInside(config.paths.validImagesDir, item.path);
      return res.sendFile(filePath);
    } catch (error) {
      return jsonError(res, 500, error.message);
    }
  });

  app.get("/api/assets/generated/:name", (req, res) => {
    try {
      const filePath = assertInside(config.paths.outputDir, path.join(config.paths.outputDir, req.params.name));
      if (!fs.existsSync(filePath)) return jsonError(res, 404, "Generated file not found.");
      return res.sendFile(filePath);
    } catch (error) {
      return jsonError(res, 500, error.message);
    }
  });

  app.get("/api/jobs", (req, res) => {
    res.json({ ok: true, jobs: jobStore.listJobs() });
  });

  app.get("/api/jobs/:id", (req, res) => {
    const job = jobStore.getJob(req.params.id);
    if (!job) return jsonError(res, 404, "Job not found.");
    return res.json({ ok: true, job });
  });

  app.post("/api/generate", async (req, res) => {
    try {
      const body = req.body || {};
      const version = await getVersion(config, body.version);
      const prompt = String(body.prompt || "").trim();
      const job = jobStore.createJob({
        prompt,
        versionId: version.id,
        versionLabel: version.label,
        outputPath: "",
        outputUrl: "",
        params: body.params || {},
      });
      const outputPath = makeOutputPath(config, version.id, job.id);
      jobStore.updateJob(job.id, { outputPath });
      if (body.dryRun || body.params?.dryRun) {
        const args = buildGenerationArgs({
          config,
          version,
          prompt,
          outputPath,
          params: body.params || {},
        });
        jobStore.updateJob(job.id, {
          status: "completed",
          dryRun: true,
          command: `node ${args.map((item) => JSON.stringify(item)).join(" ")}`,
          completedAt: new Date().toISOString(),
        });
        return res.status(202).json({ ok: true, job: jobStore.getJob(job.id) });
      }
      runGeneration({
        config,
        jobStore,
        job: { ...job, outputPath },
        version,
        params: body.params || {},
      });
      return res.status(202).json({ ok: true, job: jobStore.getJob(job.id) });
    } catch (error) {
      return jsonError(res, 500, error.message);
    }
  });

  app.post("/api/feedback", async (req, res) => {
    try {
      const { jobId, status, note = "" } = req.body || {};
      const normalizedStatus = status === "valid" ? "valid" : "rejected";
      const job = jobStore.getJob(jobId);
      if (!job) return jsonError(res, 404, "Job not found.");

      let copiedTo = "";
      if (normalizedStatus === "valid") {
        if (!job.outputPath || !fs.existsSync(job.outputPath)) {
          return jsonError(res, 400, "Generated image is missing.");
        }
        await fsp.mkdir(config.paths.validImagesDir, { recursive: true });
        copiedTo = path.join(config.paths.validImagesDir, `web-valid-${path.basename(job.outputPath)}`);
        await fsp.copyFile(job.outputPath, copiedTo);
        await refreshImageValideManifest(config);
      }

      const feedback = {
        type: "generation-feedback",
        jobId,
        status: normalizedStatus,
        note,
        copiedTo,
        outputPath: job.outputPath,
        prompt: job.prompt,
        versionId: job.versionId,
      };
      await appendFeedback(feedback);
      jobStore.updateJob(jobId, { feedbackStatus: normalizedStatus, feedbackNote: note, copiedTo });
      return res.json({ ok: true, feedback, job: jobStore.getJob(jobId) });
    } catch (error) {
      return jsonError(res, 500, error.message);
    }
  });

  const distDir = path.join(config.projectRoot, "dist");
  const indexHtml = path.join(distDir, "index.html");
  if (process.env.NODE_ENV === "production" && fs.existsSync(indexHtml)) {
    app.use(express.static(distDir));
    app.get(/.*/, (req, res) => res.sendFile(indexHtml));
  } else {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      root: path.join(config.projectRoot, "src", "app"),
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  }

  return app;
}

const app = await createApp();
const host = "127.0.0.1";
app.listen(config.port, host, () => {
  console.log(`C2R web app listening on http://${host}:${config.port}`);
  console.log(`Image valide: ${config.paths.validImagesDir}`);
});
