-- =====================================================================
-- My Glow Up Era — skema Supabase (Postgres)
-- Jalankan sekali di Supabase Dashboard → SQL Editor → New query → Run
-- Simpan juga sebagai supabase/migrations/0001_init.sql di repo.
--
-- Catatan desain:
--  * Satu "journey" = satu lembar 30 hari (tombol "Lembar baru" di app lama
--    mereset S = dflt(); di sini lembar lama diarsipkan, bukan dihapus).
--  * Data harian memakai kolom jsonb karena bentuk dalamnya (done, ci, acts,
--    spa, rescue, ovr, dst.) bergantung pada kode app. Antigravity wajib
--    memverifikasi bentuknya dari kode sebelum menambah constraint.
--  * Foto TIDAK disimpan sebagai base64 di database; hanya path ke Storage.
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------- helper: updated_at otomatis ----------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ---------- 1. pengaturan per user (1 baris) ----------
create table public.app_settings (
  user_id      uuid primary key references auth.users(id) on delete cascade,
  theme        text check (theme in ('light','dark')),   -- null = ikuti sistem
  low_mode     boolean not null default false,           -- S.lowMode
  period_mode  boolean not null default false,           -- S.periodMode
  fit          boolean not null default true,            -- S.fit
  schedule     jsonb   not null default '{}'::jsonb,     -- S.sch (jadwal kuliah/kerja/mandi)
  muse         jsonb   not null default '{}'::jsonb,     -- S.muse (preset, motto; custom -> storage path)
  archive      jsonb   not null default '{}'::jsonb,     -- S.archive
  updated_at   timestamptz not null default now()
);

-- ---------- 2. journey (lembar 30 hari) ----------
create table public.journeys (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  start_date  date not null default current_date,        -- S.start
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  archived_at timestamptz
);
-- hanya boleh ada 1 journey aktif per user
create unique index journeys_one_active on public.journeys(user_id) where is_active;

-- ---------- 3. log harian (hari 1..30) ----------
create table public.daily_logs (
  journey_id uuid not null references public.journeys(id) on delete cascade,
  day        smallint not null check (day between 1 and 30),
  user_id    uuid not null references auth.users(id) on delete cascade,
  done       jsonb not null default '{}'::jsonb,   -- S.done[day]  { habitKey: true }
  low        boolean not null default false,       -- S.low[day]
  rest       boolean not null default false,       -- S.rest[day]
  journal    jsonb not null default '{}'::jsonb,   -- S.j[day]     { text, well, tom, mood }
  skin       jsonb not null default '{}'::jsonb,   -- S.skin[day]  { tags[], note }
  checkin    jsonb not null default '{}'::jsonb,   -- S.ci[day]
  activities jsonb not null default '[]'::jsonb,   -- S.acts[day]
  spa        jsonb not null default '{}'::jsonb,   -- S.spa[day]
  rescue     jsonb not null default '{}'::jsonb,   -- S.rescue[day]
  overrides  jsonb not null default '{}'::jsonb,   -- S.ovr[day]
  gifts      jsonb not null default '{}'::jsonb,   -- S.gifts (verifikasi: per-hari atau global?)
  extra      jsonb not null default '{}'::jsonb,   -- cadangan untuk field yang terlewat (mis. S.skip)
  updated_at timestamptz not null default now(),
  primary key (journey_id, day)
);

-- ---------- 4. log mingguan (minggu 1..4) ----------
create table public.weekly_logs (
  journey_id uuid not null references public.journeys(id) on delete cascade,
  week       smallint not null check (week between 1 and 4),
  user_id    uuid not null references auth.users(id) on delete cascade,
  data       jsonb not null default '{}'::jsonb,   -- S.wk[week]
  updated_at timestamptz not null default now(),
  primary key (journey_id, week)
);

-- ---------- 5. achievement ----------
create table public.achievements (
  journey_id  uuid not null references public.journeys(id) on delete cascade,
  key         text not null,                       -- 'first','skin','m0',...
  user_id     uuid not null references auth.users(id) on delete cascade,
  unlocked_at timestamptz not null default now(),
  primary key (journey_id, key)
);

-- ---------- 6. Jar of Little Proofs ----------
create table public.jar_items (
  id         uuid primary key default gen_random_uuid(),
  journey_id uuid not null references public.journeys(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  text       text not null,
  day        smallint check (day between 1 and 30),
  created_at timestamptz not null default now()
);

-- ---------- 7. foto progres (file ada di Storage) ----------
create table public.progress_photos (
  id           uuid primary key default gen_random_uuid(),
  journey_id   uuid not null references public.journeys(id) on delete cascade,
  user_id      uuid not null references auth.users(id) on delete cascade,
  day          smallint check (day between 1 and 30),
  storage_path text not null,                      -- {user_id}/progress/{uuid}.jpg
  created_at   timestamptz not null default now()
);

-- ---------- 8. vanity shelf & lookbook (lintas journey) ----------
create table public.vanity_items (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  position   int  not null default 0,
  cat        text,            -- Skincare / Hair & Body / Makeup
  name       text not null,
  badge      text,
  role       text,            -- moist / clean / spf / hair / makeup / lip (dipakai logika app)
  note       text,
  image_path text,
  updated_at timestamptz not null default now()
);

create table public.lookbook_items (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  position   int  not null default 0,
  title      text not null,
  description text,
  image_path text,
  updated_at timestamptz not null default now()
);

-- ---------- 9. media curated ----------
create table public.media_items (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  position   int  not null default 0,
  cat        text not null,   -- posture / podcast / glowup / subliminal
  title      text not null,
  creator    text,
  duration   text,
  thumb_url  text,
  url        text,
  updated_at timestamptz not null default now()
);

-- ---------- 10. buku ----------
create table public.books (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  title       text not null,
  author      text,
  total_pages int  not null default 0,
  status      text not null default 'tbr' check (status in ('tbr','reading','done')),
  extra       jsonb not null default '{}'::jsonb,  -- sisa field dari S.books.cur / S.books.done[]
  started_at  timestamptz,
  finished_at timestamptz,
  updated_at  timestamptz not null default now()
);
-- hanya 1 buku "reading" per user
create unique index books_one_reading on public.books(user_id) where status = 'reading';

create table public.reading_log (
  user_id uuid not null references auth.users(id) on delete cascade,
  date    date not null,                           -- key ymd di S.books.days
  data    jsonb not null default '{}'::jsonb,
  primary key (user_id, date)
);

-- ---------- 11. state fitur FX / sticker ----------
create table public.fx_state (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  data       jsonb not null default '{"fav":{},"nope":{},"log":[],"seen":{}}'::jsonb,  -- S.fx
  updated_at timestamptz not null default now()
);

-- ---------- trigger updated_at ----------
do $$
declare t text;
begin
  foreach t in array array['app_settings','daily_logs','weekly_logs','vanity_items',
                           'lookbook_items','media_items','books','fx_state']
  loop
    execute format('create trigger trg_%I_updated before update on public.%I
                    for each row execute function public.set_updated_at()', t, t);
  end loop;
end $$;

-- ---------- index bantu ----------
create index on public.daily_logs (user_id);
create index on public.progress_photos (journey_id, day);
create index on public.jar_items (journey_id);
create index on public.books (user_id, status);

-- =====================================================================
-- ROW LEVEL SECURITY — wajib. Data ini sensitif (jurnal, mood, siklus, foto).
-- =====================================================================
do $$
declare t text;
begin
  foreach t in array array['app_settings','journeys','daily_logs','weekly_logs','achievements',
                           'jar_items','progress_photos','vanity_items','lookbook_items',
                           'media_items','books','reading_log','fx_state']
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format(
      'create policy "own rows" on public.%I for all to authenticated
         using ((select auth.uid()) = user_id)
         with check ((select auth.uid()) = user_id)', t);
  end loop;
end $$;

-- =====================================================================
-- STORAGE — bucket privat; path wajib diawali {user_id}/
-- =====================================================================
insert into storage.buckets (id, name, public)
values ('glow-photos', 'glow-photos', false)
on conflict (id) do nothing;

create policy "glow-photos read own" on storage.objects for select to authenticated
  using (bucket_id = 'glow-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "glow-photos insert own" on storage.objects for insert to authenticated
  with check (bucket_id = 'glow-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "glow-photos update own" on storage.objects for update to authenticated
  using (bucket_id = 'glow-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "glow-photos delete own" on storage.objects for delete to authenticated
  using (bucket_id = 'glow-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
