const LABELS = {
  local: "tersimpan di perangkat",
  saving: "menyimpan…",
  saved: "tersimpan",
  failed: "gagal — coba lagi"
};

export function setSyncStatus(status, repo) {
  let el = document.getElementById("sync-indicator");
  if (!el) {
    el = document.createElement("button");
    el.id = "sync-indicator";
    el.type = "button";
    el.className = "sync-indicator";
    el.setAttribute("aria-live", "polite");
    document.body.append(el);
  }
  el.textContent = LABELS[status] ?? LABELS.local;
  el.dataset.state = status;
  el.onclick = () => repo?.retry();
}
