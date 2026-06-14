import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

export function createJobStore(config) {
  const jobs = new Map();
  const eventsPath = path.join(config.paths.jobsDir, "jobs.jsonl");

  async function append(event) {
    await fs.mkdir(path.dirname(eventsPath), { recursive: true });
    await fs.appendFile(eventsPath, `${JSON.stringify({ at: new Date().toISOString(), ...event })}\n`, "utf8");
  }

  function createJob(input) {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const job = {
      id,
      status: "queued",
      createdAt: now,
      updatedAt: now,
      stdout: "",
      stderr: "",
      exitCode: null,
      ...input,
    };
    jobs.set(id, job);
    append({ type: "job-created", job }).catch(() => {});
    return job;
  }

  function updateJob(id, patch) {
    const previous = jobs.get(id);
    if (!previous) return null;
    const job = { ...previous, ...patch, updatedAt: new Date().toISOString() };
    jobs.set(id, job);
    append({ type: "job-updated", id, patch }).catch(() => {});
    return job;
  }

  function getJob(id) {
    return jobs.get(id) || null;
  }

  function listJobs() {
    return [...jobs.values()].sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
  }

  return { createJob, updateJob, getJob, listJobs, append };
}
