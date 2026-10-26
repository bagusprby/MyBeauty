-- Additive corrections for the verified legacy S shape.
-- Keep 0001_init.sql immutable once applied.

alter table public.app_settings
  add column if not exists gifts jsonb not null default '{}'::jsonb,
  add column if not exists state_initialized boolean not null default false,
  add column if not exists legacy_imported_at timestamptz;

alter table public.daily_logs
  add column if not exists skip jsonb not null default '{}'::jsonb;

alter table public.media_items
  add column if not exists description text;

alter table public.vanity_items
  add column if not exists legacy_id text,
  add column if not exists extra jsonb not null default '{}'::jsonb;
create unique index if not exists vanity_items_user_legacy_id
  on public.vanity_items(user_id, legacy_id);

alter table public.lookbook_items
  add column if not exists legacy_id text,
  add column if not exists extra jsonb not null default '{}'::jsonb;
create unique index if not exists lookbook_items_user_legacy_id
  on public.lookbook_items(user_id, legacy_id);

alter table public.media_items
  add column if not exists legacy_id text,
  add column if not exists extra jsonb not null default '{}'::jsonb;
create unique index if not exists media_items_user_legacy_id
  on public.media_items(user_id, legacy_id);

alter table public.progress_photos
  add column if not exists legacy_id text,
  add column if not exists position integer not null default 0,
  add column if not exists extra jsonb not null default '{}'::jsonb;
create unique index if not exists progress_photos_journey_legacy_id
  on public.progress_photos(journey_id, legacy_id);

alter table public.jar_items
  add column if not exists legacy_id text,
  add column if not exists position integer not null default 0,
  add column if not exists extra jsonb not null default '{}'::jsonb;
create unique index if not exists jar_items_journey_legacy_id
  on public.jar_items(journey_id, legacy_id);

alter table public.books
  add column if not exists legacy_id text,
  add column if not exists position integer not null default 0;
create unique index if not exists books_user_legacy_id
  on public.books(user_id, legacy_id);

-- Keep journey ownership aligned with row ownership for RLS-protected logs.
create unique index if not exists journeys_user_id_id on public.journeys(user_id, id);
alter table public.daily_logs
  add constraint daily_logs_journey_owner_fk
  foreign key (user_id, journey_id) references public.journeys(user_id, id)
  on delete cascade;
alter table public.weekly_logs
  add constraint weekly_logs_journey_owner_fk
  foreign key (user_id, journey_id) references public.journeys(user_id, id)
  on delete cascade;
alter table public.achievements
  add constraint achievements_journey_owner_fk
  foreign key (user_id, journey_id) references public.journeys(user_id, id)
  on delete cascade;
alter table public.jar_items
  add constraint jar_items_journey_owner_fk
  foreign key (user_id, journey_id) references public.journeys(user_id, id)
  on delete cascade;
alter table public.progress_photos
  add constraint progress_photos_journey_owner_fk
  foreign key (user_id, journey_id) references public.journeys(user_id, id)
  on delete cascade;
