
-- Page views table
CREATE TABLE public.event_page_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL,
  session_id text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  referrer text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_event_page_views_event ON public.event_page_views(event_id, created_at DESC);
CREATE INDEX idx_event_page_views_session ON public.event_page_views(session_id);

ALTER TABLE public.event_page_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can record a page view for live events"
  ON public.event_page_views FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM events WHERE events.id = event_page_views.event_id AND events.status = 'live'::event_status)
  );

CREATE POLICY "Event owners can view page views"
  ON public.event_page_views FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM events WHERE events.id = event_page_views.event_id AND events.user_id = auth.uid())
  );

-- UTM + session columns on registrations
ALTER TABLE public.registrations
  ADD COLUMN session_id text,
  ADD COLUMN utm_source text,
  ADD COLUMN utm_medium text,
  ADD COLUMN utm_campaign text,
  ADD COLUMN utm_content text,
  ADD COLUMN utm_term text,
  ADD COLUMN referrer text,
  ADD COLUMN attended_at timestamptz;

-- Waitlist table
CREATE TABLE public.event_waitlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL,
  email text NOT NULL,
  name text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(event_id, email)
);

CREATE INDEX idx_event_waitlist_event ON public.event_waitlist(event_id, created_at);
ALTER TABLE public.event_waitlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can join waitlist for live events"
  ON public.event_waitlist FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM events WHERE events.id = event_waitlist.event_id AND events.status = 'live'::event_status)
  );

CREATE POLICY "Event owners can view waitlist"
  ON public.event_waitlist FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM events WHERE events.id = event_waitlist.event_id AND events.user_id = auth.uid())
  );

CREATE POLICY "Event owners can manage waitlist"
  ON public.event_waitlist FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM events WHERE events.id = event_waitlist.event_id AND events.user_id = auth.uid())
  );

-- Update register_for_event to accept and persist UTM/session
CREATE OR REPLACE FUNCTION public.register_for_event(p_event_id uuid, p_data jsonb, p_meta jsonb DEFAULT '{}'::jsonb)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_id uuid;
  v_event record;
  v_current_count integer;
  v_email text;
  v_email_count integer;
BEGIN
  SELECT id, status, capacity, registration_limit, registration_deadline
  INTO v_event
  FROM events
  WHERE id = p_event_id AND status = 'live'::event_status
  FOR UPDATE;

  IF v_event IS NULL THEN
    RAISE EXCEPTION 'Event not found or not accepting registrations';
  END IF;

  IF v_event.registration_deadline IS NOT NULL AND now() > v_event.registration_deadline THEN
    RAISE EXCEPTION 'Registration deadline has passed';
  END IF;

  SELECT count(*) INTO v_current_count
  FROM registrations
  WHERE event_id = p_event_id AND status != 'cancelled'::registration_status;

  IF v_event.capacity IS NOT NULL AND v_current_count >= v_event.capacity THEN
    RAISE EXCEPTION 'Event is at full capacity';
  END IF;

  IF v_event.registration_limit IS NOT NULL AND v_current_count >= v_event.registration_limit THEN
    RAISE EXCEPTION 'Registration limit reached';
  END IF;

  IF p_data IS NULL OR p_data = '{}'::jsonb THEN
    RAISE EXCEPTION 'Registration data is required';
  END IF;

  IF octet_length(p_data::text) > 4096 THEN
    RAISE EXCEPTION 'Registration data too large';
  END IF;

  v_email := lower(trim(COALESCE(p_data->>'Email Address', p_data->>'email', p_data->>'Email', '')));

  IF v_email IS NOT NULL AND v_email != '' THEN
    SELECT count(*) INTO v_email_count
    FROM registrations
    WHERE event_id = p_event_id
      AND status != 'cancelled'::registration_status
      AND lower(trim(COALESCE(data->>'Email Address', data->>'email', data->>'Email', ''))) = v_email;

    IF v_email_count >= 2 THEN
      RAISE EXCEPTION 'This email has already been used to register for this event';
    END IF;
  END IF;

  INSERT INTO registrations (event_id, data, session_id, utm_source, utm_medium, utm_campaign, utm_content, utm_term, referrer)
  VALUES (
    p_event_id,
    p_data,
    NULLIF(p_meta->>'session_id', ''),
    NULLIF(p_meta->>'utm_source', ''),
    NULLIF(p_meta->>'utm_medium', ''),
    NULLIF(p_meta->>'utm_campaign', ''),
    NULLIF(p_meta->>'utm_content', ''),
    NULLIF(p_meta->>'utm_term', ''),
    NULLIF(p_meta->>'referrer', '')
  )
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$function$;
