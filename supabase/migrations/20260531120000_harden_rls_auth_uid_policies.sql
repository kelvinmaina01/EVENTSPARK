-- Reduce repeated auth.uid() evaluation in RLS policies and keep public reads explicit.

drop policy if exists "Users can view own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Users can insert own profile" on public.profiles;
drop policy if exists "Public can view company profiles by slug" on public.profiles;

create policy "Profiles are visible publicly by slug or to owner"
  on public.profiles
  as permissive
  for select
  to anon, authenticated
  using (company_slug is not null or id = (select auth.uid()));

create policy "Users can update own profile"
  on public.profiles
  as permissive
  for update
  to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

create policy "Users can insert own profile"
  on public.profiles
  as permissive
  for insert
  to authenticated
  with check (id = (select auth.uid()));

drop policy if exists "Users can view own events" on public.events;
drop policy if exists "Users can create own events" on public.events;
drop policy if exists "Users can update own events" on public.events;
drop policy if exists "Users can delete own events" on public.events;
drop policy if exists "Public can view live events" on public.events;
drop policy if exists "Public can view live events by slug" on public.events;

create policy "Events are visible when live or owned"
  on public.events
  as permissive
  for select
  to anon, authenticated
  using (status = 'live'::public.event_status or user_id = (select auth.uid()));

create policy "Users can create own events"
  on public.events
  as permissive
  for insert
  to authenticated
  with check (user_id = (select auth.uid()));

create policy "Users can update own events"
  on public.events
  as permissive
  for update
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "Users can delete own events"
  on public.events
  as permissive
  for delete
  to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists "Users can view own roles" on public.user_roles;
create policy "Users can view own roles"
  on public.user_roles
  as permissive
  for select
  to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists "Users can manage form fields via event ownership" on public.form_fields;
create policy "Users can manage form fields via event ownership"
  on public.form_fields
  as permissive
  for all
  to authenticated
  using (exists (
    select 1 from public.events
    where events.id = form_fields.event_id
      and events.user_id = (select auth.uid())
  ))
  with check (exists (
    select 1 from public.events
    where events.id = form_fields.event_id
      and events.user_id = (select auth.uid())
  ));

drop policy if exists "Event owners can view registrations" on public.registrations;
drop policy if exists "Event owners can update registrations" on public.registrations;

create policy "Event owners can view registrations"
  on public.registrations
  as permissive
  for select
  to authenticated
  using (exists (
    select 1 from public.events
    where events.id = registrations.event_id
      and events.user_id = (select auth.uid())
  ));

create policy "Event owners can update registrations"
  on public.registrations
  as permissive
  for update
  to authenticated
  using (exists (
    select 1 from public.events
    where events.id = registrations.event_id
      and events.user_id = (select auth.uid())
  ))
  with check (exists (
    select 1 from public.events
    where events.id = registrations.event_id
      and events.user_id = (select auth.uid())
  ));

drop policy if exists "Users can manage email templates via event ownership" on public.email_templates;
create policy "Users can manage email templates via event ownership"
  on public.email_templates
  as permissive
  for all
  to authenticated
  using (exists (
    select 1 from public.events
    where events.id = email_templates.event_id
      and events.user_id = (select auth.uid())
  ))
  with check (exists (
    select 1 from public.events
    where events.id = email_templates.event_id
      and events.user_id = (select auth.uid())
  ));

drop policy if exists "Event owners can view page views" on public.event_page_views;
create policy "Event owners can view page views"
  on public.event_page_views
  as permissive
  for select
  to authenticated
  using (exists (
    select 1 from public.events
    where events.id = event_page_views.event_id
      and events.user_id = (select auth.uid())
  ));

drop policy if exists "Event owners can view waitlist" on public.event_waitlist;
drop policy if exists "Event owners can manage waitlist" on public.event_waitlist;

create policy "Event owners can view waitlist"
  on public.event_waitlist
  as permissive
  for select
  to authenticated
  using (exists (
    select 1 from public.events
    where events.id = event_waitlist.event_id
      and events.user_id = (select auth.uid())
  ));

create policy "Event owners can manage waitlist"
  on public.event_waitlist
  as permissive
  for delete
  to authenticated
  using (exists (
    select 1 from public.events
    where events.id = event_waitlist.event_id
      and events.user_id = (select auth.uid())
  ));

notify pgrst, 'reload schema';
