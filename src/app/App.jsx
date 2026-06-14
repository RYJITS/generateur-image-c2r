import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  Check,
  FolderOpen,
  GitBranch,
  History,
  Image,
  LoaderCircle,
  Play,
  RefreshCw,
  Server,
  SlidersHorizontal,
  X,
} from "lucide-react";

const TABS = [
  { id: "generate", label: "Generateur", icon: Play },
  { id: "gallery", label: "Galerie", icon: Image },
  { id: "jobs", label: "Jobs", icon: History },
  { id: "versions", label: "Versions", icon: GitBranch },
];

async function api(path, options = {}) {
  const response = await fetch(path, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  const data = await response.json();
  if (!response.ok || data.ok === false) {
    throw new Error(data.error || `HTTP ${response.status}`);
  }
  return data;
}

function bytes(value) {
  if (!value) return "0 MB";
  return `${Math.round(value / 1024 / 1024)} MB`;
}

function statusLabel(job) {
  if (!job) return "Aucun job";
  if (job.status === "completed") return "Termine";
  if (job.status === "running") return "En cours";
  if (job.status === "failed") return "Echec";
  return "En file";
}

export default function App() {
  const [tab, setTab] = useState("generate");
  const [config, setConfig] = useState(null);
  const [versions, setVersions] = useState([]);
  const [versionId, setVersionId] = useState("v6-exact-100");
  const [health, setHealth] = useState(null);
  const [gallery, setGallery] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [prompt, setPrompt] = useState("");
  const [seed, setSeed] = useState("");
  const [steps, setSteps] = useState("");
  const [guidance, setGuidance] = useState("");
  const [query, setQuery] = useState("");
  const [offset, setOffset] = useState(0);
  const [selectedJobId, setSelectedJobId] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const selectedJob = useMemo(() => {
    return jobs.find((job) => job.id === selectedJobId) || jobs[0] || null;
  }, [jobs, selectedJobId]);

  const selectedVersion = versions.find((version) => version.id === versionId) || versions[0];

  async function loadConfig() {
    const data = await api("/api/config");
    setConfig(data.config);
    setVersions(data.versions || []);
    if (!data.versions?.some((version) => version.id === versionId) && data.versions?.[0]) {
      setVersionId(data.versions[0].id);
    }
  }

  async function loadHealth() {
    setHealth(await api("/api/health"));
  }

  async function loadGallery(nextOffset = offset, nextQuery = query, refresh = false) {
    const params = new URLSearchParams({
      offset: String(nextOffset),
      limit: "48",
      query: nextQuery,
    });
    if (refresh) params.set("refresh", "1");
    const data = await api(`/api/gallery/image-valide?${params.toString()}`);
    setGallery(data.gallery);
  }

  async function loadJobs() {
    const data = await api("/api/jobs");
    setJobs(data.jobs || []);
  }

  useEffect(() => {
    Promise.all([loadConfig(), loadHealth(), loadGallery(0, "", false), loadJobs()]).catch((error) => {
      setMessage(error.message);
    });
    const timer = setInterval(() => {
      loadHealth().catch(() => {});
      loadJobs().catch(() => {});
    }, 2500);
    return () => clearInterval(timer);
  }, []);

  async function refreshGallery() {
    setBusy(true);
    setMessage("");
    try {
      setOffset(0);
      await loadGallery(0, query, true);
      setMessage("Galerie actualisee.");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  }

  async function startGeneration() {
    setBusy(true);
    setMessage("");
    try {
      const params = {};
      if (seed.trim()) params.seed = seed.trim();
      if (steps.trim()) params.steps = Number(steps);
      if (guidance.trim()) params.guidance = Number(guidance);
      const data = await api("/api/generate", {
        method: "POST",
        body: JSON.stringify({ version: versionId, prompt, params }),
      });
      setSelectedJobId(data.job.id);
      await loadJobs();
      setMessage(`Job lance: ${data.job.id.slice(0, 8)}`);
      setTab("generate");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  }

  async function sendFeedback(status) {
    if (!selectedJob) return;
    setBusy(true);
    setMessage("");
    try {
      await api("/api/feedback", {
        method: "POST",
        body: JSON.stringify({ jobId: selectedJob.id, status }),
      });
      await Promise.all([loadJobs(), status === "valid" ? loadGallery(0, query, true) : Promise.resolve()]);
      setMessage(status === "valid" ? "Image ajoutee au corpus." : "Image rejetee.");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  }

  function changePage(delta) {
    const next = Math.max(0, offset + delta);
    setOffset(next);
    loadGallery(next, query, false).catch((error) => setMessage(error.message));
  }

  function applySearch(event) {
    event.preventDefault();
    setOffset(0);
    loadGallery(0, query, false).catch((error) => setMessage(error.message));
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">C2R</div>
          <div>
            <h1>Generateur image C2R</h1>
            <p>{config?.paths?.validImagesDir || "Chargement chemins"}</p>
          </div>
        </div>
        <div className="status-row">
          <StatusBadge icon={FolderOpen} label="Corpus" ok={health?.paths?.validImagesDir} value={String(health?.manifestCount ?? "-")} />
          <StatusBadge icon={Server} label="ComfyUI" ok={health?.comfy?.ok} value={health?.comfy?.ok ? "OK" : "OFF"} />
          <button className="icon-button" type="button" onClick={() => Promise.all([loadHealth(), loadJobs()])} title="Actualiser">
            <RefreshCw size={18} />
          </button>
        </div>
      </header>

      <nav className="tabs" aria-label="Vues C2R">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} className={tab === id ? "tab active" : "tab"} type="button" onClick={() => setTab(id)}>
            <Icon size={17} />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      {message ? <div className="notice">{message}</div> : null}

      {tab === "generate" && (
        <section className="workspace">
          <form className="panel controls" onSubmit={(event) => { event.preventDefault(); startGeneration(); }}>
            <div className="panel-header">
              <h2>Generation</h2>
              <SlidersHorizontal size={18} />
            </div>

            <label className="field">
              <span>Version</span>
              <div className="segmented">
                {versions.map((version) => (
                  <button
                    key={version.id}
                    type="button"
                    className={versionId === version.id ? "selected" : ""}
                    onClick={() => setVersionId(version.id)}
                  >
                    {version.label}
                  </button>
                ))}
              </div>
            </label>

            <label className="field">
              <span>Prompt</span>
              <textarea
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                rows={8}
                placeholder="Femme adulte C2R dans un decor profond, robe peinture impasto..."
              />
            </label>

            <div className="grid-fields">
              <label className="field">
                <span>Seed</span>
                <input value={seed} onChange={(event) => setSeed(event.target.value)} inputMode="numeric" />
              </label>
              <label className="field">
                <span>Steps</span>
                <input value={steps} onChange={(event) => setSteps(event.target.value)} inputMode="numeric" placeholder={String(selectedVersion?.steps || "")} />
              </label>
              <label className="field">
                <span>Guidance</span>
                <input value={guidance} onChange={(event) => setGuidance(event.target.value)} inputMode="decimal" placeholder={String(selectedVersion?.guidance || "")} />
              </label>
            </div>

            <button className="primary-action" type="submit" disabled={busy}>
              {busy ? <LoaderCircle className="spin" size={18} /> : <Play size={18} />}
              <span>Generer</span>
            </button>
          </form>

          <section className="panel preview">
            <div className="panel-header">
              <h2>Resultat</h2>
              <span className={`pill ${selectedJob?.status || ""}`}>{statusLabel(selectedJob)}</span>
            </div>
            <JobPreview job={selectedJob} />
            <div className="feedback-row">
              <button type="button" className="success-button" disabled={!selectedJob?.outputUrl || busy} onClick={() => sendFeedback("valid")}>
                <Check size={17} />
                <span>Valider</span>
              </button>
              <button type="button" className="danger-button" disabled={!selectedJob || busy} onClick={() => sendFeedback("rejected")}>
                <X size={17} />
                <span>Rejeter</span>
              </button>
            </div>
          </section>
        </section>
      )}

      {tab === "gallery" && (
        <section className="panel full-panel">
          <div className="panel-header gallery-head">
            <div>
              <h2>Image valide</h2>
              <p>{gallery?.count ?? 0} images / {bytes(gallery?.totalBytes)}</p>
            </div>
            <form className="search-row" onSubmit={applySearch}>
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Filtrer" />
              <button type="submit">Filtrer</button>
              <button type="button" onClick={refreshGallery} disabled={busy}>
                <RefreshCw size={16} />
              </button>
            </form>
          </div>
          <div className="gallery-grid">
            {(gallery?.items || []).map((item) => (
              <figure key={item.id} className="thumb">
                <img src={item.assetUrl} alt={item.name} loading="lazy" />
                <figcaption>{item.relativePath}</figcaption>
              </figure>
            ))}
          </div>
          <div className="pager">
            <button type="button" onClick={() => changePage(-48)} disabled={offset === 0}>Precedent</button>
            <span>{offset + 1}-{Math.min(offset + 48, gallery?.count || 0)}</span>
            <button type="button" onClick={() => changePage(48)} disabled={offset + 48 >= (gallery?.count || 0)}>Suivant</button>
          </div>
        </section>
      )}

      {tab === "jobs" && (
        <section className="panel full-panel">
          <div className="panel-header">
            <h2>Jobs</h2>
            <button type="button" className="compact-button" onClick={loadJobs}>
              <RefreshCw size={16} />
              <span>Actualiser</span>
            </button>
          </div>
          <div className="job-table">
            {jobs.map((job) => (
              <button key={job.id} type="button" className={selectedJob?.id === job.id ? "job-row active" : "job-row"} onClick={() => setSelectedJobId(job.id)}>
                <span>{job.id.slice(0, 8)}</span>
                <span>{job.versionLabel}</span>
                <span className={`pill ${job.status}`}>{statusLabel(job)}</span>
                <span>{new Date(job.createdAt).toLocaleTimeString()}</span>
              </button>
            ))}
          </div>
          <pre className="log-view">{selectedJob?.stderr || selectedJob?.stdout || "Aucun log selectionne."}</pre>
        </section>
      )}

      {tab === "versions" && (
        <section className="versions-grid">
          {versions.map((version) => (
            <article key={version.id} className="panel version-panel">
              <div className="panel-header">
                <h2>{version.label}</h2>
                <span className="pill">{version.status}</span>
              </div>
              <dl>
                <dt>Target</dt>
                <dd>{version.target}</dd>
                <dt>Modele</dt>
                <dd>{version.model}</dd>
                <dt>Resolution</dt>
                <dd>{version.width} x {version.height}</dd>
                <dt>Steps</dt>
                <dd>{version.steps}</dd>
                <dt>Guidance</dt>
                <dd>{version.guidance}</dd>
              </dl>
              <div className="lock-list">
                {(version.promptLock || []).slice(0, 8).map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </div>
            </article>
          ))}
        </section>
      )}

      <footer className="footer">
        <Activity size={15} />
        <span>{config?.paths?.manifestPath || "Manifest en attente"}</span>
      </footer>
    </main>
  );
}

function StatusBadge({ icon: Icon, label, ok, value }) {
  return (
    <div className={ok ? "status ok" : "status bad"}>
      <Icon size={16} />
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function JobPreview({ job }) {
  if (!job) {
    return <div className="empty-preview">Aucun job lance.</div>;
  }
  if (job.status === "running" || job.status === "queued") {
    return (
      <div className="empty-preview">
        <LoaderCircle className="spin" size={28} />
        <span>{statusLabel(job)}</span>
      </div>
    );
  }
  if (job.outputUrl) {
    return <img className="result-image" src={job.outputUrl} alt={`Generation ${job.id}`} />;
  }
  return <div className="empty-preview">{job.error || "Aucun rendu disponible."}</div>;
}
