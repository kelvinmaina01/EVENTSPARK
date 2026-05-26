create index if not exists idx_event_feedback_registration_id
  on public.event_feedback(registration_id);

notify pgrst, 'reload schema';
