const DAY_MAPS = ["done", "low", "j", "skin", "ci", "rest", "skip", "acts", "ovr", "spa", "rescue"];
const own = (obj, key) => Object.prototype.hasOwnProperty.call(obj ?? {}, key);
const clone = value => value == null ? value : structuredClone(value);
const entries = value => Object.entries(value ?? {});

function epochToDate(epoch) {
  const d = new Date(epoch);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function dateToEpoch(date) {
  const [y, m, d] = String(date).split("-").map(Number);
  return new Date(y, m - 1, d).getTime();
}
function imagePath(value) {
  if (typeof value !== "string" || value.startsWith("data:") || value.startsWith("local:")) return null;
  return value || null;
}

/** Convert the legacy S object into idempotent row sets. No image bytes are written to SQL. */
export function stateToRows(S, { userId, journeyId }) {
  if (!userId || !journeyId) throw new Error("userId and journeyId are required to map state");
  const settings = {
    user_id: userId,
    theme: S.theme,
    low_mode: !!S.lowMode,
    period_mode: !!S.periodMode,
    fit: S.fit,
    schedule: clone(S.sch),
    muse: { ...clone(S.muse), custom: imagePath(S.muse?.custom) },
    archive: clone(S.archive),
    gifts: clone(S.gifts ?? {}),
    state_initialized: true
  };
  const journey = { id: journeyId, user_id: userId, start_date: epochToDate(S.start), is_active: true };

  const days = new Set();
  for (const key of DAY_MAPS) for (const [day] of entries(S[key])) days.add(Number(day));
  const daily = [...days].filter(d => Number.isInteger(d) && d >= 1 && d <= 30).sort((a, b) => a - b).map(day => {
    const row = { journey_id: journeyId, user_id: userId, day, extra: { state_presence: {} } };
    for (const key of DAY_MAPS) {
      if (own(S[key], day)) row.extra.state_presence[key] = true;
    }
    row.done = clone(S.done?.[day] ?? {});
    row.low = !!S.low?.[day];
    row.rest = !!S.rest?.[day];
    row.journal = clone(S.j?.[day] ?? {});
    row.skin = clone(S.skin?.[day] ?? {});
    row.checkin = clone(S.ci?.[day] ?? {});
    row.activities = clone(S.acts?.[day] ?? []);
    row.spa = clone(S.spa?.[day] ?? {});
    row.rescue = clone(S.rescue?.[day] ?? {});
    row.overrides = clone(S.ovr?.[day] ?? {});
    row.skip = clone(S.skip?.[day] ?? {});
    return row;
  });

  const weekly = entries(S.wk).map(([week, data]) => ({ journey_id: journeyId, user_id: userId, week: Number(week), data: clone(data) }));
  const achievements = entries(S.ach).map(([key, unlocked_at]) => ({ journey_id: journeyId, user_id: userId, key, unlocked_at: new Date(unlocked_at).toISOString() }));
  const jar = (S.jar ?? []).map((item, position) => ({
    journey_id: journeyId, user_id: userId, legacy_id: `jar:${position}`,
    text: item.t, day: item.d ?? null, ...(item.at ? { created_at: new Date(item.at).toISOString() } : {}),
    position, extra: { hadAt: own(item, "at") }
  }));
  const photos = (S.photos ?? []).filter(p => imagePath(p.storage_path || p.src)).map((p, position) => ({
    journey_id: journeyId, user_id: userId, day: p.d ?? null, storage_path: p.storage_path || p.src,
    legacy_id: String(p.id ?? `photo:${position}`), position, extra: { hadId: own(p, "id") }
  }));
  const vanity = (S.vanity ?? []).map((v, position) => ({
    user_id: userId, legacy_id: String(v.id ?? `vanity:${position}`), position,
    cat: v.cat ?? null, name: v.name, badge: v.badge ?? null, role: v.role ?? null, note: v.note ?? null,
    image_path: imagePath(v.storage_path || v.img), extra: { ...v, img: null }
  }));
  const lookbook = (S.lookbook ?? []).map((v, position) => ({
    user_id: userId, legacy_id: String(v.id ?? `lookbook:${position}`), position,
    title: v.title, description: v.desc ?? null, image_path: imagePath(v.storage_path || v.img),
    extra: { ...v, img: null }
  }));
  const media = (S.media ?? []).map((v, position) => ({
    user_id: userId, legacy_id: String(v.id ?? `media:${position}`), position,
    cat: v.cat, title: v.title, creator: v.creator ?? null, duration: v.dur ?? null,
    thumb_url: v.thumb ?? null, url: v.url ?? null, description: v.desc ?? null,
    extra: clone(v)
  }));

  const books = [];
  for (const [position, book] of (S.books?.tbr ?? []).entries()) books.push(bookRow(book, "tbr", position, userId));
  if (S.books?.cur) books.push(bookRow(S.books.cur, "reading", 0, userId));
  for (const [position, book] of (S.books?.done ?? []).entries()) books.push(bookRow(book, "done", position, userId));
  const reading = entries(S.books?.days).map(([date, data]) => ({ user_id: userId, date, data: clone(data) }));

  return { settings, journey, daily, weekly, achievements, jar, photos, vanity, lookbook, media, books, reading, fx: { user_id: userId, data: clone(S.fx) } };
}

function bookRow(book, status, position, userId) {
  return {
    user_id: userId, legacy_id: String(book.id), position, title: book.title, author: book.author ?? null,
    total_pages: book.totalPages ?? 0, status,
    extra: clone(book), started_at: status === "reading" ? new Date().toISOString() : null,
    finished_at: status === "done" && book.at ? new Date(book.at).toISOString() : null
  };
}

/** Rebuild a legacy-compatible S object, retaining the caller's exact defaults for absent rows. */
export function rowsToState(rows, defaults) {
  const S = clone(defaults);
  const { settings, journey } = rows;
  if (journey) S.start = dateToEpoch(journey.start_date);
  if (settings) {
    S.theme = settings.theme;
    S.lowMode = settings.low_mode;
    S.periodMode = settings.period_mode;
    S.fit = settings.fit;
    S.sch = clone(settings.schedule);
    S.muse = { ...clone(settings.muse), custom: settings.muse?.custom ?? null };
    S.archive = clone(settings.archive);
    S.gifts = clone(settings.gifts ?? {});
  }
  for (const key of DAY_MAPS) S[key] = {};
  for (const row of rows.daily ?? []) {
    const d = row.day;
    const present = row.extra?.state_presence ?? {};
    const values = {
      done: row.done, low: row.low, j: row.journal, skin: row.skin, ci: row.checkin,
      rest: row.rest, skip: row.skip, acts: row.activities, ovr: row.overrides,
      spa: row.spa, rescue: row.rescue
    };
    for (const key of DAY_MAPS) if (present[key]) S[key][d] = clone(values[key]);
  }
  if (rows.weekly?.length) S.wk = Object.fromEntries(rows.weekly.map(r => [r.week, clone(r.data)]));
  if (rows.achievements?.length) S.ach = Object.fromEntries(rows.achievements.map(r => [r.key, Date.parse(r.unlocked_at)]));
  if (rows.settings?.state_initialized) S.jar = [...(rows.jar ?? [])].sort((a, b) => a.position - b.position).map(r => ({
    t: r.text, d: r.day, ...(r.extra?.hadAt && r.created_at ? { at: Date.parse(r.created_at) } : {})
  }));
  if (rows.settings?.state_initialized) S.photos = [...(rows.photos ?? [])].sort((a, b) => a.position - b.position).map(r => ({
    d: r.day, ...(r.extra?.hadId ? { id: r.legacy_id } : {}), src: r.storage_path
  }));
  if (rows.settings?.state_initialized) S.vanity = [...(rows.vanity ?? [])].sort((a, b) => a.position - b.position).map(r => ({ ...clone(r.extra), id: r.legacy_id, cat: r.cat, name: r.name, badge: r.badge, role: r.role, note: r.note, img: r.image_path ?? null }));
  if (rows.settings?.state_initialized) S.lookbook = [...(rows.lookbook ?? [])].sort((a, b) => a.position - b.position).map(r => ({ ...clone(r.extra), title: r.title, desc: r.description, img: r.image_path ?? null }));
  if (rows.settings?.state_initialized) S.media = [...(rows.media ?? [])].sort((a, b) => a.position - b.position).map(r => ({ ...clone(r.extra), id: r.legacy_id, cat: r.cat, title: r.title, creator: r.creator, dur: r.duration, thumb: r.thumb_url, url: r.url, desc: r.description }));
  const bookState = rows.settings?.state_initialized ? { cur: null, days: {}, done: [], tbr: [] } : clone(S.books);
  bookState.days = Object.fromEntries((rows.reading ?? []).map(r => [r.date, clone(r.data)]));
  for (const r of [...(rows.books ?? [])].sort((a, b) => a.position - b.position)) {
    const book = { ...clone(r.extra), id: r.legacy_id, title: r.title, author: r.author ?? "", totalPages: r.total_pages };
    if (r.status === "reading") bookState.cur = book;
    else if (r.status === "done") bookState.done.push(book);
    else bookState.tbr.push(book);
  }
  if (rows.settings?.state_initialized || rows.books?.length || rows.reading?.length) S.books = bookState;
  S.fx = clone(rows.fx?.data ?? S.fx);
  return S;
}
