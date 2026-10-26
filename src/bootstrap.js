import { supabase, signupAllowed } from "./data/client.js";
import { GlowRepository } from "./data/repo.js";
import { setSyncStatus } from "./ui/sync-status.js";
import { selectLocalCacheForUser, bindLocalCacheToUser, archiveLocalState, preserveLegacyImport, removeLegacyCache } from "./state/local-cache.js";
import { showLogin, showImportChoice, hideAuthScreen, exportState } from "./ui/auth-screen.js";
import { ART } from "./art/library.js";
import { configurePhotoStorage, deleteImageObject, imageUrl, uploadCanvas } from "./data/photo-storage.js";
import legacyApp from "./legacy-app.js?raw";
import "./styles/sync-status.css";
import "./styles/app.css";

window.__GLOW_ART = ART;
let repo;
let legacyLoaded = false;
repo = new GlowRepository(supabase, { onStatus: status => setSyncStatus(status, repo) });
configurePhotoStorage(supabase, () => repo.user, () => window.__glowApp?.render());
window.__photoUrl = imageUrl;
window.__uploadGlowImage = uploadCanvas;
window.__deleteGlowImage = deleteImageObject;
window.__repoSave = state => repo.markDirty(state);
window.__glowStartNewJourney = async (previous, fresh) => {
  if (repo.user && navigator.onLine) await repo.startNewJourney(fresh);
  else {
    archiveLocalState(previous);
    if (repo.user && repo.journeyId) {
      repo.pendingArchiveId = repo.journeyId;
      localStorage.setItem(`glow30_pending_archive_${repo.user.id}_v1`, repo.journeyId);
      repo.journeyId = null;
    }
  }
  repo.lastSavedSnapshot = null;
  return fresh;
};
window.__glowExport = () => exportState(window.__glowApp?.getState());
window.__glowLogout = async () => { await supabase?.auth.signOut(); location.reload(); };
window.__glowClearLegacyBackup = () => {
  if (!confirm("Hapus salinan data lokal lama dari perangkat ini? Pastikan impor cloud sudah benar.")) return;
  removeLegacyCache();
  window.__glowApp?.render();
};
window.__glowProfileActions = () => {
  const main = document.querySelector("#main");
  if (!main || document.querySelector("#profile-data-actions")) return;
  const panel = document.createElement("section");
  panel.id = "profile-data-actions";
  panel.className = "card profile-data-actions";
  panel.innerHTML = `<h3>Data &amp; privasi</h3><button class="btn ghost big" type="button" id="export-data">Ekspor data (JSON)</button><button class="btn ghost big" type="button" id="logout-data">Keluar</button><button class="lk" type="button" id="clear-legacy">Hapus salinan lokal lama</button>`;
  main.append(panel);
  panel.querySelector("#export-data").onclick = window.__glowExport;
  panel.querySelector("#logout-data").onclick = window.__glowLogout;
  panel.querySelector("#clear-legacy").onclick = window.__glowClearLegacyBackup;
};
window.addEventListener("online", () => repo.retry());

function loadLegacyApp() {
  if (legacyLoaded) return;
  const script = document.createElement("script");
  script.textContent = legacyApp;
  document.head.append(script);
  if (!window.__glowApp) throw new Error("Legacy app did not initialize");
  legacyLoaded = true;
}

async function activateUser(user) {
  const cache = selectLocalCacheForUser(user.id);
  repo.hadLocalCache = cache.isLegacy ? cache.legacyState : null;
  repo.hadOwnedCache = cache.hasOwnedCache;
  loadLegacyApp();
  bindLocalCacheToUser(user.id, window.__glowApp.getState());
  await repo.initialize(window.__glowApp.getState, window.__glowApp.getDefaultState);
  const firstCloudJourney = repo.user && !repo.journeyId && !repo.hadOwnedCache && !repo.pendingImportState && !repo.accountHasData;
  if ((repo.pendingImportState && !repo.accountHasData) || firstCloudJourney) {
    showImportChoice({
      hasLocalBackup: !!repo.pendingImportState,
      onImport: async uploadedState => {
        const source = structuredClone(uploadedState || repo.pendingImportState);
        if (!source) throw new Error("Pilih file cadangan terlebih dahulu.");
        exportState(source); // downloaded before any remote write
        await repo.importLegacyState(source);
        hideAuthScreen(); window.__glowApp.render();
      },
      onStartFresh: async () => {
        const source = repo.pendingImportState;
        if (source) preserveLegacyImport(source);
        const fresh = window.__glowApp.getDefaultState();
        await repo.startNewJourney(fresh);
        window.__glowApp.replaceState(fresh, { persist: false });
        repo.pendingImportState = null; repo.ready = true;
        repo.dirty = new Set(["settings", "journey", "daily", "weekly", "achievements", "jar", "photos", "vanity", "lookbook", "media", "books", "fx"]);
        repo.markDirty(fresh); await repo.flush();
        if (repo.dirty.size) throw new Error("Sinkronisasi belum selesai. Data lokal tetap tersimpan; coba lagi.");
        hideAuthScreen(); window.__glowApp.render();
      }
    });
    return;
  }
  hideAuthScreen();
  window.__glowApp.render();
  if (repo.user && !repo.journeyId && !repo.hadOwnedCache) {
    await repo.startNewJourney(window.__glowApp.getState());
    repo.dirty = new Set(["settings", "journey", "daily", "weekly", "achievements", "jar", "photos", "vanity", "lookbook", "media", "books", "fx"]);
    await repo.flush();
  }
}

if (!supabase) {
  loadLegacyApp();
  await repo.initialize(window.__glowApp.getState, window.__glowApp.getDefaultState);
} else {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (session?.user && !error) await activateUser(session.user);
  else showLogin({ supabase, signupAllowed, onSuccess: async user => {
    if (user) await activateUser(user);
  }});
}
