const DB_NAME = "glow30-photo-queue";
const STORE = "pending";
const SIGNED_SECONDS = 900;
const REFRESH_MARGIN_MS = 5 * 60 * 1000;
const PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'%3E%3Crect width='1' height='1' fill='%23fdf1f3'/%3E%3C/svg%3E";
const DELETE_QUEUE = "glow30_photo_delete_queue_v1";

let dbPromise;
let client;
let getUser = () => null;
let onSignedUrlReady = () => {};
const signed = new Map();
const localUrls = new Map();
const pendingUrls = new Map();

function openDb() {
  if (!globalThis.indexedDB) return Promise.reject(new Error("Offline photo storage is not available in this browser"));
  if (!dbPromise) dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE, { keyPath: "id" });
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbPromise;
}

async function storeBlob(record) {
  const db = await openDb();
  await new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(record);
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

async function readBlob(id) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const req = db.transaction(STORE).objectStore(STORE).get(id);
    req.onsuccess = () => resolve(req.result ?? null);
    req.onerror = () => reject(req.error);
  });
}

async function removeBlob(id) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).delete(id);
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error);
  });
}

function canvasBlob(canvas, quality) {
  return new Promise((resolve, reject) => canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error("Foto gagal dikompres")), "image/jpeg", quality));
}

function imageKind(kind) {
  if (!["progress", "vanity", "lookbook", "muse"].includes(kind)) throw new Error("Jenis foto tidak dikenal");
  return kind;
}

async function uploadBlob(blob, kind, id = crypto.randomUUID()) {
  const user = getUser();
  if (!client || !user || !navigator.onLine) return null;
  const path = `${user.id}/${imageKind(kind)}/${id}.jpg`;
  const { error } = await client.storage.from("glow-photos").upload(path, blob, { contentType: "image/jpeg", upsert: true, cacheControl: "3600" });
  if (error) throw error;
  return path;
}

export function configurePhotoStorage(supabase, userGetter, onReady) {
  client = supabase;
  getUser = userGetter;
  onSignedUrlReady = onReady ?? (() => {});
}

export async function uploadCanvas(canvas, kind, quality, previousPath = null) {
  const blob = await canvasBlob(canvas, quality);
  const id = crypto.randomUUID();
  try {
    const path = await uploadBlob(blob, kind, id);
    if (path) {
      if (previousPath && !previousPath.startsWith("local:")) await deleteImageObject(previousPath);
      return path;
    }
  } catch (error) {
    console.warn("Photo upload queued for retry", error);
  }
  await storeBlob({ id, kind: imageKind(kind), blob, previousPath });
  return `local:${kind}:${id}`;
}

export async function uploadDataUrl(dataUrl, kind) {
  const response = await fetch(dataUrl);
  const blob = await response.blob();
  const id = crypto.randomUUID();
  try {
    const path = await uploadBlob(blob, kind, id);
    if (path) return path;
  } catch (error) {
    console.warn("Imported photo upload queued for retry", error);
  }
  await storeBlob({ id, kind: imageKind(kind), blob, previousPath: null });
  return `local:${kind}:${id}`;
}

export async function uploadPendingPath(path) {
  const match = /^local:(progress|vanity|lookbook|muse):([\w-]+)$/.exec(path ?? "");
  if (!match) return path;
  const [, kind, id] = match;
  const record = await readBlob(id);
  if (!record) throw new Error("Foto offline tidak ditemukan; sinkronisasi ditahan agar data tidak hilang");
  const uploaded = await uploadBlob(record.blob, kind, id);
  if (!uploaded) throw new Error("Belum ada sesi terhubung untuk mengunggah foto");
  if (record.previousPath && !record.previousPath.startsWith("local:")) await deleteImageObject(record.previousPath);
  await removeBlob(id);
  const localUrl = localUrls.get(path);
  if (localUrl) { URL.revokeObjectURL(localUrl); localUrls.delete(path); }
  signed.delete(uploaded);
  return uploaded;
}

export function imageUrl(path) {
  if (!path) return "";
  if (/^(https?:|data:|blob:)/i.test(path)) return path;
  if (path.startsWith("local:")) {
    if (localUrls.has(path)) return localUrls.get(path);
    if (!pendingUrls.has(path)) {
      const id = path.split(":").at(-1);
      pendingUrls.set(path, readBlob(id).then(record => {
        if (!record) return;
        const url = URL.createObjectURL(record.blob);
        localUrls.set(path, url);
        onSignedUrlReady();
      }).catch(() => {}));
    }
    return PLACEHOLDER;
  }
  const cached = signed.get(path);
  if (cached && cached.expiresAt - REFRESH_MARGIN_MS > Date.now()) return cached.url;
  if (client && getUser() && !pendingUrls.has(path)) {
    pendingUrls.set(path, client.storage.from("glow-photos").createSignedUrl(path, SIGNED_SECONDS).then(({ data, error }) => {
      if (error) throw error;
      signed.set(path, { url: data.signedUrl, expiresAt: Date.now() + SIGNED_SECONDS * 1000 });
      onSignedUrlReady();
    }).catch(error => console.warn("Could not create photo URL", error)).finally(() => pendingUrls.delete(path)));
  }
  return cached?.url ?? PLACEHOLDER;
}

export async function deleteImageObject(path) {
  if (!path) return;
  if (path.startsWith("local:")) {
    const id = path.split(":").at(-1);
    await removeBlob(id).catch(() => {});
    const url = localUrls.get(path);
    if (url) URL.revokeObjectURL(url);
    localUrls.delete(path);
    pendingUrls.delete(path);
    return;
  }
  if (/^(https?:|data:|blob:)/i.test(path)) return;
  if (!client || !getUser()) return;
  const queueDelete = () => {
    const queue = JSON.parse(localStorage.getItem(DELETE_QUEUE) || "[]");
    if (!queue.includes(path)) queue.push(path);
    localStorage.setItem(DELETE_QUEUE, JSON.stringify(queue));
  };
  if (!navigator.onLine) { queueDelete(); return; }
  const { error } = await client.storage.from("glow-photos").remove([path]);
  if (error) {
    queueDelete();
    throw error;
  }
  signed.delete(path);
}

export async function flushPhotoDeleteQueue() {
  if (!client || !getUser() || !navigator.onLine) return;
  const queue = JSON.parse(localStorage.getItem(DELETE_QUEUE) || "[]");
  if (!queue.length) return;
  const { error } = await client.storage.from("glow-photos").remove(queue);
  if (error) throw error;
  localStorage.removeItem(DELETE_QUEUE);
  queue.forEach(path => signed.delete(path));
}
