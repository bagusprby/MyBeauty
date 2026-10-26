import { rowsToState, stateToRows } from "./mapper.js";
import { preserveLegacyImport, writeLocalState, readDirtySections, writeDirtySections, bindLocalCacheToUser } from "../state/local-cache.js";
import { deleteImageObject, flushPhotoDeleteQueue, uploadDataUrl, uploadPendingPath } from "./photo-storage.js";

const SECTIONS = {
  settings: ["lowMode", "periodMode", "theme", "sch", "fit", "muse", "archive", "gifts"],
  journey: ["start"], daily: ["done", "low", "j", "skin", "ci", "rest", "skip", "acts", "ovr", "spa", "rescue"],
  weekly: ["wk"], achievements: ["ach"], jar: ["jar"], photos: ["photos"], vanity: ["vanity"],
  lookbook: ["lookbook"], media: ["media"], books: ["books"], fx: ["fx"]
};
export class GlowRepository {
  constructor(client, { onStatus = () => {}, getState, getDefaults } = {}) {
    this.client = client;
    this.onStatus = onStatus;
    this.getState = getState;
    this.getDefaults = getDefaults;
    this.user = null;
    this.journeyId = null;
    this.dirty = new Set();
    this.lastSavedSnapshot = null;
    this.timer = null;
    this.flushing = false;
    this.ready = false;
    this.pendingImportState = null;
    this.accountHasData = false;
    this.importing = false;
    this.pendingArchiveId = null;
  }

  markDirty(state) {
    try { writeLocalState(state); } catch { /* retain in memory and report sync failure */ }
    for (const [section, keys] of Object.entries(SECTIONS)) {
      const prior = this.lastSavedSnapshot;
      if (!prior || keys.some(key => JSON.stringify(state[key]) !== JSON.stringify(prior[key]))) this.dirty.add(section);
    }
    if (this.user) writeDirtySections(this.user.id, [...this.dirty]);
    this.onStatus("saving");
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.flush(), 800);
  }

  async initialize(state, defaults) {
    this.getState = state;
    this.getDefaults = defaults;
    if (!this.client) { this.ready = true; this.onStatus("local"); return null; }
    const { data: { session }, error } = await this.client.auth.getSession();
    if (error) { this.ready = true; this.onStatus("failed"); return null; }
    if (!session?.user) { this.ready = true; this.onStatus("local"); return null; }
    this.user = session.user;
    this.pendingArchiveId = localStorage.getItem(`glow30_pending_archive_${this.user.id}_v1`);
    this.dirty = new Set(readDirtySections(this.user.id));
    this.pendingImportState = this.hadLocalCache ? structuredClone(this.hadLocalCache) : null;
    try {
      const remote = await this.loadAll(defaults());
      if (remote) {
        if (this.pendingImportState && !this.accountHasData) {
          this.ready = false;
          this.onStatus("local");
          return this.user;
        }
        if (this.dirty.size) {
          this.ready = true;
          this.lastSavedSnapshot = structuredClone(remote);
          this.onStatus("saving");
          setTimeout(() => this.flush(), 0);
        } else {
          if (this.pendingImportState) preserveLegacyImport(this.pendingImportState);
          window.__glowApp.replaceState(remote, { persist: false });
          try { bindLocalCacheToUser(this.user.id, remote); } catch { /* leave remote copy intact */ }
          clearTimeout(this.timer);
          this.dirty.clear();
          writeDirtySections(this.user.id, []);
          this.lastSavedSnapshot = structuredClone(remote);
          this.ready = true;
        }
      } else if (this.pendingImportState) {
        // The existing local diary must be explicitly imported before any cloud write.
        this.ready = false;
        this.onStatus("local");
        return this.user;
      } else {
        this.ready = true;
        if (this.dirty.size) setTimeout(() => this.flush(), 0);
        else if (this.hadOwnedCache) {
          this.dirty = new Set(Object.keys(SECTIONS));
          writeDirtySections(this.user.id, [...this.dirty]);
          setTimeout(() => this.flush(), 0);
        }
      }
    } catch (e) {
      console.error("Supabase load failed", e);
      this.onStatus("failed");
      if (this.hadLocalCache) { this.ready = false; return this.user; }
    }
    this.ready = true;
    this.onStatus("saved");
    return this.user;
  }

  async loadAll(defaults) {
    if (!this.user) return null;
    const uid = this.user.id;
    const { data: journey, error: journeyError } = await this.client.from("journeys").select("*").eq("user_id", uid).eq("is_active", true).maybeSingle();
    if (journeyError) throw journeyError;
    if (!journey) return null;
    this.journeyId = journey.id;
    const queries = await Promise.all([
      this.client.from("app_settings").select("*").eq("user_id", uid).maybeSingle(),
      this.client.from("daily_logs").select("*").eq("journey_id", journey.id),
      this.client.from("weekly_logs").select("*").eq("journey_id", journey.id),
      this.client.from("achievements").select("*").eq("journey_id", journey.id),
      this.client.from("jar_items").select("*").eq("journey_id", journey.id).order("position"),
      this.client.from("progress_photos").select("*").eq("journey_id", journey.id).order("created_at"),
      this.client.from("vanity_items").select("*").eq("user_id", uid).order("position"),
      this.client.from("lookbook_items").select("*").eq("user_id", uid).order("position"),
      this.client.from("media_items").select("*").eq("user_id", uid).order("position"),
      this.client.from("books").select("*").eq("user_id", uid).order("position"),
      this.client.from("reading_log").select("*").eq("user_id", uid),
      this.client.from("fx_state").select("*").eq("user_id", uid).maybeSingle()
    ]);
    for (const result of queries) if (result.error) throw result.error;
    const [settings, daily, weekly, achievements, jar, photos, vanity, lookbook, media, books, reading, fx] = queries.map(x => x.data);
    this.accountHasData = !!settings?.state_initialized;
    return rowsToState({ settings, journey, daily, weekly, achievements, jar, photos, vanity, lookbook, media, books, reading, fx }, defaults);
  }

  async ensureJourney(state) {
    if (this.journeyId) return this.journeyId;
    const { data, error } = await this.client.from("journeys").select("id").eq("user_id", this.user.id).eq("is_active", true).maybeSingle();
    if (error) throw error;
    if (data) this.journeyId = data.id;
    else {
      const row = stateToRows(state, { userId: this.user.id, journeyId: crypto.randomUUID() }).journey;
      delete row.id;
      const result = await this.client.from("journeys").insert(row).select("id").single();
      if (result.error) throw result.error;
      this.journeyId = result.data.id;
    }
    return this.journeyId;
  }

  async startNewJourney(state) {
    if (!this.user) return;
    if (this.journeyId) {
      const { error } = await this.client.from("journeys").update({ is_active: false, archived_at: new Date().toISOString() }).eq("id", this.journeyId).eq("user_id", this.user.id);
      if (error) throw error;
    }
    this.journeyId = null;
    const rows = stateToRows(state, { userId: this.user.id, journeyId: crypto.randomUUID() });
    delete rows.journey.id;
    const { data, error } = await this.client.from("journeys").insert(rows.journey).select("id").single();
    if (error) throw error;
    this.journeyId = data.id;
    this.pendingArchiveId = null;
    localStorage.removeItem(`glow30_pending_archive_${this.user.id}_v1`);
  }

  async saveSection(name) {
    if (!this.user || !this.client) return;
    const state = this.getState();
    await this.preparePhotoState(state);
    const journeyId = await this.ensureJourney(state);
    const rows = stateToRows(state, { userId: this.user.id, journeyId });
    const upsert = async (table, values, onConflict) => {
      if (!values.length) return;
      const { error } = await this.client.from(table).upsert(values, { onConflict });
      if (error) throw error;
    };
    const deleteMissing = async (table, scopeColumn, scopeValue, desiredIds) => {
      const hasImage = ["vanity_items", "lookbook_items"].includes(table);
      const { data, error } = await this.client.from(table).select(hasImage ? "id,legacy_id,image_path" : "id,legacy_id").eq(scopeColumn, scopeValue);
      if (error) throw error;
      const desired = new Set(desiredIds);
      for (const row of data ?? []) {
        if (row.legacy_id && !desired.has(row.legacy_id)) {
          if (row.image_path) await deleteImageObject(row.image_path);
          const { error: deleteError } = await this.client.from(table).delete().eq("id", row.id);
          if (deleteError) throw deleteError;
        }
      }
    };
    const syncImageItems = async (table, values, scopeColumn, scopeValue, onConflict) => {
      const { data: previous, error } = await this.client.from(table).select("id,legacy_id,image_path").eq(scopeColumn, scopeValue);
      if (error) throw error;
      await upsert(table, values, onConflict);
      const nextPaths = new Map(values.map(row => [row.legacy_id, row.image_path]));
      for (const old of previous ?? []) {
        const nextPath = nextPaths.get(old.legacy_id);
        if (old.image_path && old.image_path !== nextPath) await deleteImageObject(old.image_path);
      }
      await deleteMissing(table, scopeColumn, scopeValue, values.map(row => row.legacy_id));
    };
    const uid = this.user.id;
    switch (name) {
      case "settings": {
        const { data: previous, error } = await this.client.from("app_settings").select("muse").eq("user_id", uid).maybeSingle();
        if (error) throw error;
        if (this.importing) rows.settings.state_initialized = false;
        await upsert("app_settings", [rows.settings], "user_id");
        const oldImage = previous?.muse?.custom;
        if (oldImage && oldImage !== rows.settings.muse?.custom) await deleteImageObject(oldImage);
        break;
      }
      case "journey": {
        const { error } = await this.client.from("journeys").update({ start_date: rows.journey.start_date }).eq("id", journeyId).eq("user_id", uid);
        if (error) throw error; break;
      }
      case "daily": await upsert("daily_logs", rows.daily, "journey_id,day"); break;
      case "weekly": await upsert("weekly_logs", rows.weekly, "journey_id,week"); break;
      case "achievements": {
        await upsert("achievements", rows.achievements, "journey_id,key");
        const { data, error } = await this.client.from("achievements").select("key").eq("journey_id", journeyId);
        if (error) throw error;
        const keys = new Set(rows.achievements.map(r => r.key));
        for (const row of data ?? []) if (!keys.has(row.key)) {
          const { error: deleteError } = await this.client.from("achievements").delete().eq("journey_id", journeyId).eq("key", row.key);
          if (deleteError) throw deleteError;
        }
        break;
      }
      case "jar":
        await upsert("jar_items", rows.jar, "journey_id,legacy_id");
        await deleteMissing("jar_items", "journey_id", journeyId, rows.jar.map(r => r.legacy_id)); break;
      case "photos": {
        await upsert("progress_photos", rows.photos, "journey_id,legacy_id");
        const { data, error } = await this.client.from("progress_photos").select("id,legacy_id,storage_path").eq("journey_id", journeyId);
        if (error) throw error;
        const ids = new Set(rows.photos.map(r => r.legacy_id));
        for (const row of data ?? []) if (row.legacy_id && !ids.has(row.legacy_id)) {
          await deleteImageObject(row.storage_path);
          const { error: deleteError } = await this.client.from("progress_photos").delete().eq("id", row.id);
          if (deleteError) throw deleteError;
        }
        break;
      }
      case "vanity":
        await syncImageItems("vanity_items", rows.vanity, "user_id", uid, "user_id,legacy_id"); break;
      case "lookbook":
        await syncImageItems("lookbook_items", rows.lookbook, "user_id", uid, "user_id,legacy_id"); break;
      case "media":
        await upsert("media_items", rows.media, "user_id,legacy_id");
        await deleteMissing("media_items", "user_id", uid, rows.media.map(r => r.legacy_id)); break;
      case "books":
        await deleteMissing("books", "user_id", uid, rows.books.map(r => r.legacy_id));
        await upsert("books", rows.books, "user_id,legacy_id");
        await upsert("reading_log", rows.reading, "user_id,date");
        {
          const { data, error } = await this.client.from("reading_log").select("date").eq("user_id", uid);
          if (error) throw error;
          const dates = new Set(rows.reading.map(r => r.date));
          for (const row of data ?? []) if (!dates.has(row.date)) {
            const { error: deleteError } = await this.client.from("reading_log").delete().eq("user_id", uid).eq("date", row.date);
            if (deleteError) throw deleteError;
          }
        }
        break;
      case "fx": await upsert("fx_state", [rows.fx], "user_id"); break;
      default: throw new Error(`Unknown dirty section: ${name}`);
    }
  }

  async flush() {
    if (!this.ready || this.flushing || !this.dirty.size) return;
    if (!this.client || !this.user || !navigator.onLine) { this.onStatus("local"); return; }
    this.flushing = true;
    const sections = [...this.dirty];
    this.onStatus("saving");
    let failed = false;
    try {
      await flushPhotoDeleteQueue();
      if (this.pendingArchiveId) {
        const { error } = await this.client.from("journeys").update({ is_active: false, archived_at: new Date().toISOString() }).eq("id", this.pendingArchiveId).eq("user_id", this.user.id);
        if (error) throw error;
        this.pendingArchiveId = null;
        localStorage.removeItem(`glow30_pending_archive_${this.user.id}_v1`);
      }
      await this.preparePhotoState(this.getState());
      const snapshot = structuredClone(this.getState());
      for (const section of sections) await this.saveSection(section);
      for (const section of sections) {
        const keys = SECTIONS[section];
        if (keys.every(key => JSON.stringify(this.getState()[key]) === JSON.stringify(snapshot[key]))) this.dirty.delete(section);
      }
      writeDirtySections(this.user.id, [...this.dirty]);
      this.lastSavedSnapshot = snapshot;
      this.onStatus("saved");
    } catch (error) {
      console.error("Supabase save failed", error);
      this.onStatus("failed");
      failed = true;
    } finally {
      this.flushing = false;
      if (this.dirty.size && navigator.onLine) setTimeout(() => this.flush(), failed ? 3000 : 800);
    }
  }

  async preparePhotoState(state) {
    const replace = async (owner, field, kind) => {
      const path = owner?.[field];
      if (typeof path !== "string") return;
      if (path.startsWith("data:")) owner[field] = await uploadDataUrl(path, kind);
      else if (path.startsWith("local:")) owner[field] = await uploadPendingPath(path);
    };
    for (const photo of state.photos ?? []) await replace(photo, "src", "progress");
    for (const item of state.vanity ?? []) await replace(item, "img", "vanity");
    for (const item of state.lookbook ?? []) await replace(item, "img", "lookbook");
    await replace(state.muse, "custom", "muse");
    try { writeLocalState(state); } catch { /* local cache remains recoverable from the in-memory state */ }
  }

  async importLegacyState(state) {
    if (!this.user) throw new Error("Masuk ke akun Supabase terlebih dahulu.");
    if (this.accountHasData) throw new Error("Akun ini sudah memiliki data; impor dibatalkan agar tidak menimpa diary.");
    if (this.pendingImportState) preserveLegacyImport(this.pendingImportState);
    this.ready = false;
    this.importing = true;
    try {
      const journeyId = await this.ensureJourney(state);
      await this.preparePhotoState(state);
      window.__glowApp.replaceState(state, { persist: false });
      for (const section of Object.keys(SECTIONS)) await this.saveSection(section);

      const expected = stateToRows(state, { userId: this.user.id, journeyId });
      const verify = async (table, column, value, wanted) => {
        const { count, error } = await this.client.from(table).select("*", { count: "exact", head: true }).eq(column, value);
        if (error) throw error;
        if (count !== wanted) throw new Error(`Verifikasi ${table}: ditemukan ${count}, seharusnya ${wanted}. Data lokal tetap tersimpan.`);
      };
      await verify("daily_logs", "journey_id", journeyId, expected.daily.length);
      await verify("weekly_logs", "journey_id", journeyId, expected.weekly.length);
      await verify("achievements", "journey_id", journeyId, expected.achievements.length);
      await verify("jar_items", "journey_id", journeyId, expected.jar.length);
      await verify("progress_photos", "journey_id", journeyId, expected.photos.length);
      await verify("vanity_items", "user_id", this.user.id, expected.vanity.length);
      await verify("lookbook_items", "user_id", this.user.id, expected.lookbook.length);
      await verify("media_items", "user_id", this.user.id, expected.media.length);
      await verify("books", "user_id", this.user.id, expected.books.length);
      await verify("reading_log", "user_id", this.user.id, expected.reading.length);
      await verify("fx_state", "user_id", this.user.id, 1);
      for (const [kind, wanted] of Object.entries({
        progress: expected.photos.filter(r => r.storage_path).length,
        vanity: expected.vanity.filter(r => r.image_path).length,
        lookbook: expected.lookbook.filter(r => r.image_path).length,
        muse: expected.settings.muse.custom ? 1 : 0
      })) {
        const { data, error } = await this.client.storage.from("glow-photos").list(`${this.user.id}/${kind}`, { limit: 1000 });
        if (error) throw error;
        if ((data ?? []).length !== wanted) throw new Error(`Verifikasi Storage ${kind}: ditemukan ${(data ?? []).length}, seharusnya ${wanted}. Data lokal tetap tersimpan.`);
      }
      const { error: markerError } = await this.client.from("app_settings")
        .update({ state_initialized: true, legacy_imported_at: new Date().toISOString() }).eq("user_id", this.user.id);
      if (markerError) throw markerError;

      this.pendingImportState = null;
      this.accountHasData = true;
      this.dirty.clear();
      clearTimeout(this.timer);
      this.lastSavedSnapshot = structuredClone(state);
      writeLocalState(state);
      this.ready = true;
      return expected;
    } finally { this.importing = false; }
  }

  retry() { if (this.dirty.size) this.flush(); }
}
