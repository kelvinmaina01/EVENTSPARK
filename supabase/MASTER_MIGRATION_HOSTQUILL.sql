-- Hostquill master migration
-- Run this manually in the Supabase SQL editor for project etfokjdtemmhuzddjlux.
-- This file consolidates the existing app migrations into one idempotent setup script.

-- Extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Enums
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typnamespace = 'public'::regnamespace AND typname = 'app_role') THEN
    CREATE TYPE public.app_role AS ENUM ('admin', 'editor', 'viewer');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typnamespace = 'public'::regnamespace AND typname = 'event_status') THEN
    CREATE TYPE public.event_status AS ENUM ('draft', 'live', 'past');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typnamespace = 'public'::regnamespace AND typname = 'registration_status') THEN
    CREATE TYPE public.registration_status AS ENUM ('registered', 'checked_in', 'cancelled');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typnamespace = 'public'::regnamespace AND typname = 'email_template_type') THEN
    CREATE TYPE public.email_template_type AS ENUM ('confirmation', 'reminder', 'followup');
  END IF;
END $$;

-- Shared updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  company text,
  avatar_url text,
  website text,
  company_description text,
  social_links jsonb DEFAULT '[]'::jsonb,
  company_slug text UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name')
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Roles
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  );
$$;

-- Events
CREATE TABLE IF NOT EXISTS public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  event_date timestamptz,
  event_end_date timestamptz,
  timezone text DEFAULT 'America/New_York',
  event_type text DEFAULT 'webinar',
  status public.event_status NOT NULL DEFAULT 'draft',
  template text DEFAULT 'minimal',
  primary_color text DEFAULT '#7C3AED',
  color_mode text DEFAULT 'light',
  logo_url text,
  background_image_url text,
  location_type text,
  location_value text,
  ticket_price numeric,
  requires_approval boolean DEFAULT false,
  capacity integer,
  registration_limit integer,
  registration_deadline timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS update_events_updated_at ON public.events;
CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_events_slug ON public.events (slug);
CREATE INDEX IF NOT EXISTS idx_events_user_id ON public.events (user_id);
CREATE INDEX IF NOT EXISTS idx_events_status_date ON public.events (status, event_date);

-- Form fields
CREATE TABLE IF NOT EXISTS public.form_fields (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  label text NOT NULL,
  field_type text NOT NULL DEFAULT 'text',
  placeholder text,
  required boolean NOT NULL DEFAULT true,
  position integer NOT NULL DEFAULT 0
);

ALTER TABLE public.form_fields ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_form_fields_event_id ON public.form_fields (event_id);
CREATE INDEX IF NOT EXISTS idx_form_fields_event_position ON public.form_fields (event_id, position);

-- Registrations
CREATE TABLE IF NOT EXISTS public.registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  status public.registration_status NOT NULL DEFAULT 'registered',
  session_id text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  referrer text,
  attended_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_registrations_event_id ON public.registrations (event_id);
CREATE INDEX IF NOT EXISTS idx_registrations_event_created ON public.registrations (event_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_registrations_session ON public.registrations (session_id);

-- Email templates
CREATE TABLE IF NOT EXISTS public.email_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  template_type public.email_template_type NOT NULL,
  subject text NOT NULL DEFAULT '',
  body text NOT NULL DEFAULT '',
  enabled boolean NOT NULL DEFAULT true,
  UNIQUE (event_id, template_type)
);

ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

-- Page views
CREATE TABLE IF NOT EXISTS public.event_page_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
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

ALTER TABLE public.event_page_views ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_event_page_views_event ON public.event_page_views(event_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_event_page_views_session ON public.event_page_views(session_id);

-- Waitlist
CREATE TABLE IF NOT EXISTS public.event_waitlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  email text NOT NULL,
  name text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(event_id, email)
);

ALTER TABLE public.event_waitlist ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_event_waitlist_event ON public.event_waitlist(event_id, created_at);

-- Public/helper functions
CREATE OR REPLACE FUNCTION public.get_registration_count(p_event_id uuid)
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT count(*)::integer
  FROM public.registrations
  WHERE event_id = p_event_id
    AND status != 'cancelled'::public.registration_status;
$$;

CREATE OR REPLACE FUNCTION public.register_for_event(
  p_event_id uuid,
  p_data jsonb,
  p_meta jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id uuid;
  v_event record;
  v_current_count integer;
  v_email text;
  v_email_count integer;
BEGIN
  SELECT id, status, capacity, registration_limit, registration_deadline
  INTO v_event
  FROM public.events
  WHERE id = p_event_id
    AND status = 'live'::public.event_status
  FOR UPDATE;

  IF v_event IS NULL THEN
    RAISE EXCEPTION 'Event not found or not accepting registrations';
  END IF;

  IF v_event.registration_deadline IS NOT NULL AND now() > v_event.registration_deadline THEN
    RAISE EXCEPTION 'Registration deadline has passed';
  END IF;

  SELECT count(*)
  INTO v_current_count
  FROM public.registrations
  WHERE event_id = p_event_id
    AND status != 'cancelled'::public.registration_status;

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
    SELECT count(*)
    INTO v_email_count
    FROM public.registrations
    WHERE event_id = p_event_id
      AND status != 'cancelled'::public.registration_status
      AND lower(trim(COALESCE(data->>'Email Address', data->>'email', data->>'Email', ''))) = v_email;

    IF v_email_count >= 2 THEN
      RAISE EXCEPTION 'This email has already been used to register for this event';
    END IF;
  END IF;

  INSERT INTO public.registrations (
    event_id,
    data,
    session_id,
    utm_source,
    utm_medium,
    utm_campaign,
    utm_content,
    utm_term,
    referrer
  )
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
$$;

-- RLS policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Public can view company profiles by slug" ON public.profiles;

CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = id)
  WITH CHECK ((select auth.uid()) = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = id);

CREATE POLICY "Public can view company profiles by slug"
  ON public.profiles
  FOR SELECT
  TO anon, authenticated
  USING (company_slug IS NOT NULL);

DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;

CREATE POLICY "Users can view own roles"
  ON public.user_roles
  FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can view own events" ON public.events;
DROP POLICY IF EXISTS "Users can create own events" ON public.events;
DROP POLICY IF EXISTS "Users can update own events" ON public.events;
DROP POLICY IF EXISTS "Users can delete own events" ON public.events;
DROP POLICY IF EXISTS "Public can view live events by slug" ON public.events;
DROP POLICY IF EXISTS "Public can view live events" ON public.events;

CREATE POLICY "Users can view own events"
  ON public.events
  FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can create own events"
  ON public.events
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own events"
  ON public.events
  FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own events"
  ON public.events
  FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Public can view live events"
  ON public.events
  FOR SELECT
  TO anon, authenticated
  USING (status = 'live'::public.event_status);

DROP POLICY IF EXISTS "Users can manage form fields via event ownership" ON public.form_fields;
DROP POLICY IF EXISTS "Public can view form fields for live events" ON public.form_fields;

CREATE POLICY "Users can manage form fields via event ownership"
  ON public.form_fields
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1
    FROM public.events
    WHERE events.id = form_fields.event_id
      AND events.user_id = (select auth.uid())
  ))
  WITH CHECK (EXISTS (
    SELECT 1
    FROM public.events
    WHERE events.id = form_fields.event_id
      AND events.user_id = (select auth.uid())
  ));

CREATE POLICY "Public can view form fields for live events"
  ON public.form_fields
  FOR SELECT
  TO anon, authenticated
  USING (EXISTS (
    SELECT 1
    FROM public.events
    WHERE events.id = form_fields.event_id
      AND events.status = 'live'::public.event_status
  ));

DROP POLICY IF EXISTS "Allow registration for live events" ON public.registrations;
DROP POLICY IF EXISTS "Anyone can register for live events" ON public.registrations;
DROP POLICY IF EXISTS "Anonymous can register for live events" ON public.registrations;
DROP POLICY IF EXISTS "Event owners can view registrations" ON public.registrations;
DROP POLICY IF EXISTS "Event owners can update registrations" ON public.registrations;
DROP POLICY IF EXISTS "Public can view registration counts for live events" ON public.registrations;

CREATE POLICY "Allow registration for live events"
  ON public.registrations
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (EXISTS (
    SELECT 1
    FROM public.events
    WHERE events.id = registrations.event_id
      AND events.status = 'live'::public.event_status
  ));

CREATE POLICY "Event owners can view registrations"
  ON public.registrations
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1
    FROM public.events
    WHERE events.id = registrations.event_id
      AND events.user_id = (select auth.uid())
  ));

CREATE POLICY "Event owners can update registrations"
  ON public.registrations
  FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1
    FROM public.events
    WHERE events.id = registrations.event_id
      AND events.user_id = (select auth.uid())
  ))
  WITH CHECK (EXISTS (
    SELECT 1
    FROM public.events
    WHERE events.id = registrations.event_id
      AND events.user_id = (select auth.uid())
  ));

DROP POLICY IF EXISTS "Users can manage email templates via event ownership" ON public.email_templates;

CREATE POLICY "Users can manage email templates via event ownership"
  ON public.email_templates
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1
    FROM public.events
    WHERE events.id = email_templates.event_id
      AND events.user_id = (select auth.uid())
  ))
  WITH CHECK (EXISTS (
    SELECT 1
    FROM public.events
    WHERE events.id = email_templates.event_id
      AND events.user_id = (select auth.uid())
  ));

DROP POLICY IF EXISTS "Anyone can record a page view for live events" ON public.event_page_views;
DROP POLICY IF EXISTS "Event owners can view page views" ON public.event_page_views;

CREATE POLICY "Anyone can record a page view for live events"
  ON public.event_page_views
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (EXISTS (
    SELECT 1
    FROM public.events
    WHERE events.id = event_page_views.event_id
      AND events.status = 'live'::public.event_status
  ));

CREATE POLICY "Event owners can view page views"
  ON public.event_page_views
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1
    FROM public.events
    WHERE events.id = event_page_views.event_id
      AND events.user_id = (select auth.uid())
  ));

DROP POLICY IF EXISTS "Anyone can join waitlist for live events" ON public.event_waitlist;
DROP POLICY IF EXISTS "Event owners can view waitlist" ON public.event_waitlist;
DROP POLICY IF EXISTS "Event owners can manage waitlist" ON public.event_waitlist;

CREATE POLICY "Anyone can join waitlist for live events"
  ON public.event_waitlist
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (EXISTS (
    SELECT 1
    FROM public.events
    WHERE events.id = event_waitlist.event_id
      AND events.status = 'live'::public.event_status
  ));

CREATE POLICY "Event owners can view waitlist"
  ON public.event_waitlist
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1
    FROM public.events
    WHERE events.id = event_waitlist.event_id
      AND events.user_id = (select auth.uid())
  ));

CREATE POLICY "Event owners can manage waitlist"
  ON public.event_waitlist
  FOR DELETE
  TO authenticated
  USING (EXISTS (
    SELECT 1
    FROM public.events
    WHERE events.id = event_waitlist.event_id
      AND events.user_id = (select auth.uid())
  ));

-- Storage bucket and policies
INSERT INTO storage.buckets (id, name, public)
VALUES ('event-assets', 'event-assets', true)
ON CONFLICT (id) DO UPDATE SET public = excluded.public;

DROP POLICY IF EXISTS "Anyone can view event assets" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload event assets" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own event assets" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own event assets" ON storage.objects;

CREATE POLICY "Anyone can view event assets"
  ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'event-assets');

CREATE POLICY "Authenticated users can upload event assets"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'event-assets');

CREATE POLICY "Users can update own event assets"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'event-assets' AND owner::uuid = (select auth.uid()))
  WITH CHECK (bucket_id = 'event-assets' AND owner::uuid = (select auth.uid()));

CREATE POLICY "Users can delete own event assets"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'event-assets' AND owner::uuid = (select auth.uid()));

-- API grants. RLS still controls row access.
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_registration_count(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.register_for_event(uuid, jsonb, jsonb) TO anon, authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO anon, authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO anon, authenticated;

-- Refresh PostgREST schema cache.
NOTIFY pgrst, 'reload schema';

