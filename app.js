
const STORAGE_KEY = "jobclock.jobs.v1";
const ACTIVE_KEY = "jobclock.active.v1";

const timerEl = document.getElementById("timer");
const jobNameEl = document.getElementById("jobName");
const jobNotesEl = document.getElementById("jobNotes");
const mainButton = document.getElementById("mainButton");
const mainButtonText = document.getElementById("mainButtonText");
const mainButtonIcon = document.getElementById("mainButtonIcon");
const helperText = document.getElementById("helperText");
const statusPill = document.getElementById("statusPill");
const jobList = document.getElementById("jobList");
const emptyState = document.getElementById("emptyState");
const clearAllButton = document.getElementById("clearAllButton");
const template = document.getElementById("jobTemplate");

let jobs = loadJSON(STORAGE_KEY, []);
let active = loadJSON(ACTIVE_KEY, null);
let timerHandle = null;

function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function formatDuration(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  return [hours, minutes, seconds]
    .map(v => String(v).padStart(2, "0"))
    .join(":");
}

function renderTimer() {
  if (!active) {
    timerEl.textContent = "00:00:00";
    return;
  }
  timerEl.textContent = formatDuration(Date.now() - active.startedAt);
}

function updateUI() {
  const isRunning = Boolean(active);

  jobNameEl.disabled = isRunning;
  mainButton.disabled = !isRunning && jobNameEl.value.trim().length === 0;
  mainButton.classList.toggle("stop", isRunning);
  mainButtonText.textContent = isRunning ? "Stop & Save" : "Start Job";
  mainButtonIcon.textContent = isRunning ? "■" : "▶";
  statusPill.textContent = isRunning ? "Running" : "Ready";
  statusPill.classList.toggle("running", isRunning);
  helperText.textContent = isRunning
    ? "Timer keeps its start time even if you close the app."
    : "Enter a job name to start the timer.";

  renderJobs();
  renderTimer();
}

function renderJobs() {
  jobList.innerHTML = "";
  emptyState.hidden = jobs.length > 0;
  clearAllButton.hidden = jobs.length === 0;

  jobs.forEach(job => {
    const node = template.content.cloneNode(true);
    node.querySelector(".job-title").textContent = job.name;
    node.querySelector(".job-duration").textContent = formatDuration(job.durationMs);

    const date = new Date(job.startedAt);
    node.querySelector(".job-date").textContent =
      date.toLocaleString([], { dateStyle: "medium", timeStyle: "short" });

    const notes = node.querySelector(".job-notes");
    if (job.notes) {
      notes.textContent = job.notes;
    } else {
      notes.remove();
    }

    node.querySelector(".delete-button").addEventListener("click", () => {
      jobs = jobs.filter(item => item.id !== job.id);
      saveJSON(STORAGE_KEY, jobs);
      renderJobs();
    });

    jobList.appendChild(node);
  });
}

function startJob() {
  const name = jobNameEl.value.trim();
  if (!name) return;

  active = {
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    name,
    notes: jobNotesEl.value.trim(),
    startedAt: Date.now()
  };

  saveJSON(ACTIVE_KEY, active);
  timerHandle = setInterval(renderTimer, 1000);
  updateUI();
}

function stopJob() {
  if (!active) return;

  const endedAt = Date.now();
  jobs.unshift({
    id: active.id,
    name: active.name,
    notes: jobNotesEl.value.trim(),
    startedAt: active.startedAt,
    endedAt,
    durationMs: endedAt - active.startedAt
  });

  saveJSON(STORAGE_KEY, jobs);
  localStorage.removeItem(ACTIVE_KEY);
  active = null;

  clearInterval(timerHandle);
  timerHandle = null;

  jobNameEl.value = "";
  jobNotesEl.value = "";
  updateUI();
}

mainButton.addEventListener("click", () => {
  active ? stopJob() : startJob();
});

jobNameEl.addEventListener("input", updateUI);

clearAllButton.addEventListener("click", () => {
  if (confirm("Delete all saved jobs?")) {
    jobs = [];
    saveJSON(STORAGE_KEY, jobs);
    renderJobs();
  }
});

if (active) {
  jobNameEl.value = active.name || "";
  jobNotesEl.value = active.notes || "";
  timerHandle = setInterval(renderTimer, 1000);
}

updateUI();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js");
  });
}
