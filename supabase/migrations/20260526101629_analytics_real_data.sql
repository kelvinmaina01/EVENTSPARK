-- Real analytics support: feedback plus optional page-view geography.

alter table public.event_page_views
  add column if not exists city text,
  add column if not exists country text;

create index if not exists idx_event_page_views_geo
  on public.event_page_views(country, city);

create table if not exists public.event_feedback (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  registration_id uuid references public.registrations(id) on delete set null,
  rating integer not null check (rating between 1 and 5),
  comment text,
  author_name text,
  created_at timestamptz not null default now()
);

alter table public.event_feedback enable row level security;

create index if not exists idx_event_feedback_event_created
  on public.event_feedback(event_id, created_at desc);

drop policy if exists "Anyone can leave feedback for public events" on public.event_feedback;
drop policy if exists "Event owners can view feedback" on public.event_feedback;
drop policy if exists "Event owners can manage feedback" on public.event_feedback;

create policy "Anyone can leave feedback for public events"
  on public.event_feedback
  for insert
  to anon, authenticated
  with check (exists (
    select 1
    from public.events
    where events.id = event_feedback.event_id
      and events.status in ('live'::public.event_status, 'past'::public.event_status)
  ));

create policy "Event owners can view feedback"
  on public.event_feedback
  for select
  to authenticated
  using (exists (
    select 1
    from public.events
    where events.id = event_feedback.event_id
      and events.user_id = (select auth.uid())
  ));

create policy "Event owners can manage feedback"
  on public.event_feedback
  for delete
  to authenticated
  using (exists (
    select 1
    from public.events
    where events.id = event_feedback.event_id
      and events.user_id = (select auth.uid())
  ));

grant select, insert, delete on public.event_feedback to anon, authenticated;

notify pgrst, 'reload schema';
