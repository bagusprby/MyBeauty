const CACHE_KEY = "glow30_v1";
const ARCHIVE_KEY = "glow30_archive_v1";
const IMPORT_BACKUP_KEY = "glow30_legacy_backup_v1";
const OWNER_KEY = "glow30_cache_owner_v1";
let activeUserId = null;

const accountKey = userId => `glow30_cache_${userId}_v1`;

export function readLocalState() {
  try { return JSON.parse(localStorage.getItem(CACHE_KEY) || "null"); }
  catch { return null; }
}

export function writeLocalState(state) {
  const serialized = JSON.stringify(state);
  localStorage.setItem(CACHE_KEY, serialized);
  if (activeUserId) {
    localStorage.setItem(accountKey(activeUserId), serialized);
    localStorage.setItem(OWNER_KEY, activeUserId);
  }
}

export function removeLegacyCache() {
  localStorage.removeItem(CACHE_KEY);
  localStorage.removeItem(IMPORT_BACKUP_KEY);
}

export function selectLocalCacheForUser(userId) {
  const owner = localStorage.getItem(OWNER_KEY);
  if (!owner) {
    activeUserId = null;
    const legacyState = readLocalState();
    return { isLegacy: legacyState !== null, legacyState, hasOwnedCache: false };
  }
  activeUserId = userId;
  const key = accountKey(userId);
  if (owner === userId) {
    const raw = localStorage.getItem(key) ?? localStorage.getItem(CACHE_KEY);
    if (raw) localStorage.setItem(CACHE_KEY, raw);
    return { isLegacy: false, legacyState: null, hasOwnedCache: raw !== null };
  }
  const raw = localStorage.getItem(key);
  if (raw) localStorage.setItem(CACHE_KEY, raw);
  else localStorage.removeItem(CACHE_KEY);
  return { isLegacy: false, legacyState: null, hasOwnedCache: raw !== null };
}

export function bindLocalCacheToUser(userId, state) {
  activeUserId = userId;
  writeLocalState(state);
}

export function readDirtySections(userId) {
  try { return JSON.parse(localStorage.getItem(`glow30_dirty_${userId}_v1`) || "[]"); }
  catch { return []; }
}

export function writeDirtySections(userId, sections) {
  if (!userId) return;
  const key = `glow30_dirty_${userId}_v1`;
  if (sections.length) localStorage.setItem(key, JSON.stringify(sections));
  else localStorage.removeItem(key);
}

export function archiveLocalState(state) {
  const archived = JSON.parse(localStorage.getItem(ARCHIVE_KEY) || "[]");
  archived.push({ archivedAt: new Date().toISOString(), state });
  localStorage.setItem(ARCHIVE_KEY, JSON.stringify(archived));
}

export function preserveLegacyImport(state) {
  localStorage.setItem(IMPORT_BACKUP_KEY, JSON.stringify({ savedAt: new Date().toISOString(), state }));
}

export function clearLegacyImportBackup() {
  localStorage.removeItem(IMPORT_BACKUP_KEY);
}
