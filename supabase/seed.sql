-- Hostquill demo seed data.
-- Idempotent: safe to run repeatedly against local or linked Supabase databases.

create extension if not exists pgcrypto;

do $$
begin
  insert into auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    recovery_token,
    email_change_token_new,
    email_change_token_current,
    email_change_confirm_status,
    is_sso_user,
    is_anonymous
  )
  values
    (
      '11111111-1111-4111-8111-111111111111',
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'demo@hostquill.com',
      crypt('HostquillDemo123!', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"full_name":"Kelvin Gichinga"}'::jsonb,
      now(),
      now(),
      '',
      '',
      '',
      '',
      0,
      false,
      false
    ),
    (
      '22222222-2222-4222-8222-222222222222',
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'openclaw@hostquill.com',
      crypt('HostquillDemo123!', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"full_name":"OpenClaw Foundation"}'::jsonb,
      now(),
      now(),
      '',
      '',
      '',
      '',
      0,
      false,
      false
    ),
    (
      '33333333-3333-4333-8333-333333333333',
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'datapulse@hostquill.com',
      crypt('HostquillDemo123!', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"full_name":"Data Pulse Nairobi"}'::jsonb,
      now(),
      now(),
      '',
      '',
      '',
      '',
      0,
      false,
      false
    ),
    (
      '44444444-4444-4444-8444-444444444444',
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'creative@hostquill.com',
      crypt('HostquillDemo123!', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"full_name":"Creative Mornings Nairobi"}'::jsonb,
      now(),
      now(),
      '',
      '',
      '',
      '',
      0,
      false,
      false
    )
  on conflict (id) do update
  set
    email = excluded.email,
    raw_app_meta_data = excluded.raw_app_meta_data,
    raw_user_meta_data = excluded.raw_user_meta_data,
    updated_at = now();
exception
  when undefined_table then
    raise notice 'auth.users table unavailable in this environment; skipping auth user seed.';
end $$;

do $$
begin
  insert into auth.identities (
    id,
    user_id,
    provider_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
  )
  values
    (
      '91111111-1111-4111-8111-111111111111',
      '11111111-1111-4111-8111-111111111111',
      '11111111-1111-4111-8111-111111111111',
      '{"sub":"11111111-1111-4111-8111-111111111111","email":"demo@hostquill.com"}'::jsonb,
      'email',
      now(),
      now(),
      now()
    ),
    (
      '92222222-2222-4222-8222-222222222222',
      '22222222-2222-4222-8222-222222222222',
      '22222222-2222-4222-8222-222222222222',
      '{"sub":"22222222-2222-4222-8222-222222222222","email":"openclaw@hostquill.com"}'::jsonb,
      'email',
      now(),
      now(),
      now()
    ),
    (
      '93333333-3333-4333-8333-333333333333',
      '33333333-3333-4333-8333-333333333333',
      '33333333-3333-4333-8333-333333333333',
      '{"sub":"33333333-3333-4333-8333-333333333333","email":"datapulse@hostquill.com"}'::jsonb,
      'email',
      now(),
      now(),
      now()
    ),
    (
      '94444444-4444-4444-8444-444444444444',
      '44444444-4444-4444-8444-444444444444',
      '44444444-4444-4444-8444-444444444444',
      '{"sub":"44444444-4444-4444-8444-444444444444","email":"creative@hostquill.com"}'::jsonb,
      'email',
      now(),
      now(),
      now()
    )
  on conflict (provider_id, provider) do update
  set
    identity_data = excluded.identity_data,
    updated_at = now();
exception
  when undefined_table then
    raise notice 'auth.identities table unavailable in this environment; skipping auth identity seed.';
end $$;

insert into public.profiles (
  id,
  full_name,
  company,
  avatar_url,
  website,
  company_description,
  social_links,
  company_slug
)
values
  (
    '11111111-1111-4111-8111-111111111111',
    'Kelvin Gichinga',
    'Hostquill Labs',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=80',
    'https://hostquill.com',
    'I host practical events for builders, data people, and community operators turning ideas into useful products.',
    '[{"platform":"LinkedIn","url":"https://linkedin.com/company/hostquill"},{"platform":"Twitter / X","url":"https://x.com/hostquill"}]'::jsonb,
    'kelvinmaina'
  ),
  (
    '22222222-2222-4222-8222-222222222222',
    'OpenClaw Foundation',
    'OpenClaw Foundation',
    'https://api.dicebear.com/7.x/identicon/svg?seed=openclaw',
    'https://openclaw.dev',
    'Open source builders running hands-on AI, product, and software engineering gatherings across Africa.',
    '[{"platform":"Twitter / X","url":"https://x.com/openclaw"},{"platform":"LinkedIn","url":"https://linkedin.com/company/openclaw"}]'::jsonb,
    'openclaw-foundation'
  ),
  (
    '33333333-3333-4333-8333-333333333333',
    'Data Pulse Nairobi',
    'Data Pulse Nairobi',
    'https://api.dicebear.com/7.x/identicon/svg?seed=data-pulse-nairobi',
    'https://datapulse.example.com',
    'A Nairobi data community for analysts, health technologists, founders, and researchers.',
    '[{"platform":"LinkedIn","url":"https://linkedin.com/company/data-pulse-nairobi"},{"platform":"GitHub","url":"https://github.com/datapulse"}]'::jsonb,
    'data-pulse-nairobi'
  ),
  (
    '44444444-4444-4444-8444-444444444444',
    'Creative Mornings Nairobi',
    'Creative Mornings Nairobi',
    'https://api.dicebear.com/7.x/initials/svg?seed=Creative%20Mornings%20Nairobi',
    'https://creativemornings.example.com',
    'Monthly sessions for designers, founders, storytellers, artists, and curious people building creative careers.',
    '[{"platform":"Instagram","url":"https://instagram.com/creativemornings"},{"platform":"LinkedIn","url":"https://linkedin.com/company/creative-mornings"}]'::jsonb,
    'creative-mornings-nairobi'
  )
on conflict (id) do update
set
  full_name = excluded.full_name,
  company = excluded.company,
  avatar_url = excluded.avatar_url,
  website = excluded.website,
  company_description = excluded.company_description,
  social_links = excluded.social_links,
  company_slug = excluded.company_slug,
  updated_at = now();

insert into public.events (
  id,
  user_id,
  name,
  slug,
  description,
  event_date,
  event_end_date,
  timezone,
  event_type,
  status,
  template,
  primary_color,
  color_mode,
  background_image_url,
  location_type,
  location_value,
  ticket_price,
  requires_approval,
  capacity,
  registration_limit,
  registration_deadline
)
values
  (
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1',
    '11111111-1111-4111-8111-111111111111',
    'AI Vibe Coding Hackathon Nairobi',
    'ai-vibe-coding-hackathon-nairobi',
    'A full-day build sprint for founders, designers, and engineers using AI tools to ship useful prototypes. Teams will form onsite, validate an idea, build, and demo to local operators.',
    now() + interval '10 days',
    now() + interval '10 days 7 hours',
    'Africa/Nairobi',
    'Hackathon',
    'live',
    'landing',
    '#F43F5E',
    'light',
    'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1400&q=80',
    'physical',
    'Nairobi Garage, Kilimani',
    0,
    false,
    120,
    120,
    now() + interval '9 days'
  ),
  (
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2',
    '11111111-1111-4111-8111-111111111111',
    'Python Roadmap for Biologists Online Bootcamp',
    'python-roadmap-biologists-online-bootcamp',
    'A practical online bootcamp for biologists and health researchers learning Python for data cleaning, visualization, notebooks, and reproducible analysis.',
    now() + interval '18 days',
    now() + interval '18 days 3 hours',
    'Africa/Nairobi',
    'Workshop',
    'live',
    'split',
    '#2563EB',
    'light',
    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1400&q=80',
    'virtual',
    'https://meet.hostquill.com/python-biology',
    25,
    false,
    80,
    80,
    now() + interval '17 days'
  ),
  (
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3',
    '22222222-2222-4222-8222-222222222222',
    'Open Source AI Maintainers Night',
    'open-source-ai-maintainers-night',
    'A community night for maintainers and contributors working on open source AI projects. Expect lightning talks, issue triage, and practical collaboration.',
    now() + interval '24 days',
    now() + interval '24 days 4 hours',
    'Africa/Nairobi',
    'Meetup',
    'live',
    'cards',
    '#7C3AED',
    'dark',
    'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1400&q=80',
    'hybrid',
    'iHub Nairobi + livestream',
    0,
    false,
    180,
    180,
    now() + interval '23 days'
  ),
  (
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa4',
    '33333333-3333-4333-8333-333333333333',
    'Health Data Systems Roundtable',
    'health-data-systems-roundtable',
    'A focused roundtable for data teams building reliable health reporting pipelines, dashboards, and governance workflows.',
    now() + interval '31 days',
    now() + interval '31 days 2 hours',
    'Africa/Nairobi',
    'Roundtable',
    'live',
    'minimal',
    '#059669',
    'light',
    'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1400&q=80',
    'physical',
    'Kijiji Offices, Westlands',
    10,
    true,
    45,
    45,
    now() + interval '29 days'
  ),
  (
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa5',
    '44444444-4444-4444-8444-444444444444',
    'Creative Careers Breakfast: Portfolio Reviews',
    'creative-careers-breakfast-portfolio-reviews',
    'A morning session for designers and creative technologists to review portfolios, trade feedback, and meet collaborators.',
    now() + interval '6 days',
    now() + interval '6 days 2 hours',
    'Africa/Nairobi',
    'Breakfast',
    'live',
    'stacked',
    '#F97316',
    'light',
    'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=1400&q=80',
    'physical',
    'Baraza Media Lab, Nairobi',
    0,
    false,
    70,
    70,
    now() + interval '5 days'
  ),
  (
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa6',
    '11111111-1111-4111-8111-111111111111',
    'Startup Weekend Nairobi: Community Edition',
    'startup-weekend-nairobi-community-edition',
    'A past weekend of startup formation, customer discovery, prototype building, and community demos.',
    now() - interval '52 days',
    now() - interval '50 days',
    'Africa/Nairobi',
    'Startup',
    'past',
    'landing',
    '#0F172A',
    'light',
    'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=1400&q=80',
    'physical',
    'Nairobi Garage, Westlands',
    0,
    false,
    150,
    150,
    now() - interval '54 days'
  ),
  (
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa7',
    '22222222-2222-4222-8222-222222222222',
    'Maintainer Onboarding Clinic',
    'maintainer-onboarding-clinic',
    'A draft event used to exercise dashboard draft states and editing workflows.',
    now() + interval '45 days',
    now() + interval '45 days 2 hours',
    'Africa/Nairobi',
    'Clinic',
    'draft',
    'minimal',
    '#9333EA',
    'light',
    'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=1400&q=80',
    'virtual',
    'Draft livestream link',
    0,
    false,
    60,
    60,
    now() + interval '44 days'
  )
on conflict (id) do update
set
  user_id = excluded.user_id,
  name = excluded.name,
  slug = excluded.slug,
  description = excluded.description,
  event_date = excluded.event_date,
  event_end_date = excluded.event_end_date,
  timezone = excluded.timezone,
  event_type = excluded.event_type,
  status = excluded.status,
  template = excluded.template,
  primary_color = excluded.primary_color,
  color_mode = excluded.color_mode,
  background_image_url = excluded.background_image_url,
  location_type = excluded.location_type,
  location_value = excluded.location_value,
  ticket_price = excluded.ticket_price,
  requires_approval = excluded.requires_approval,
  capacity = excluded.capacity,
  registration_limit = excluded.registration_limit,
  registration_deadline = excluded.registration_deadline,
  updated_at = now();

insert into public.form_fields (id, event_id, label, field_type, placeholder, required, position)
values
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbb001', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1', 'Full Name', 'text', 'Jane Wanjiku', true, 1),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbb002', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1', 'Email Address', 'email', 'jane@example.com', true, 2),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbb003', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1', 'Team or Company', 'text', 'Hostquill Labs', false, 3),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbb004', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2', 'Full Name', 'text', 'Alex Kimani', true, 1),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbb005', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2', 'Email Address', 'email', 'alex@example.com', true, 2),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbb006', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2', 'Research Area', 'text', 'Genomics, public health, ecology...', false, 3),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbb007', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3', 'Full Name', 'text', 'Your name', true, 1),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbb008', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3', 'Email Address', 'email', 'you@example.com', true, 2),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbb009', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa4', 'Full Name', 'text', 'Your name', true, 1),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbb010', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa4', 'Email Address', 'email', 'you@example.com', true, 2),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbb011', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa5', 'Full Name', 'text', 'Your name', true, 1),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbb012', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa5', 'Email Address', 'email', 'you@example.com', true, 2)
on conflict (id) do update
set
  event_id = excluded.event_id,
  label = excluded.label,
  field_type = excluded.field_type,
  placeholder = excluded.placeholder,
  required = excluded.required,
  position = excluded.position;

insert into public.registrations (
  id,
  event_id,
  data,
  status,
  session_id,
  utm_source,
  utm_medium,
  utm_campaign,
  referrer,
  created_at,
  attended_at
)
values
  ('cccccccc-cccc-4ccc-8ccc-ccccccccc001', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1', '{"Full Name":"Amina Otieno","Email Address":"amina@example.com","Team or Company":"Savannah AI"}'::jsonb, 'registered', 'seed-session-001', 'linkedin', 'social', 'hackathon-launch', 'https://linkedin.com', now() - interval '6 days', null),
  ('cccccccc-cccc-4ccc-8ccc-ccccccccc002', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1', '{"Full Name":"Brian Mwangi","Email Address":"brian@example.com","Team or Company":"Fintech Lab"}'::jsonb, 'registered', 'seed-session-002', 'x', 'social', 'hackathon-launch', 'https://x.com', now() - interval '5 days', null),
  ('cccccccc-cccc-4ccc-8ccc-ccccccccc003', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1', '{"Full Name":"Njeri Kariuki","Email Address":"njeri@example.com","Team or Company":"Independent"}'::jsonb, 'registered', 'seed-session-003', 'newsletter', 'email', 'weekly-events', null, now() - interval '4 days', null),
  ('cccccccc-cccc-4ccc-8ccc-ccccccccc004', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2', '{"Full Name":"Dr. Peter Odhiambo","Email Address":"peter@example.com","Research Area":"Epidemiology"}'::jsonb, 'registered', 'seed-session-004', 'newsletter', 'email', 'python-biology', null, now() - interval '7 days', null),
  ('cccccccc-cccc-4ccc-8ccc-ccccccccc005', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2', '{"Full Name":"Grace Wairimu","Email Address":"grace@example.com","Research Area":"Genomics"}'::jsonb, 'registered', 'seed-session-005', 'google', 'organic', 'python-biology', 'https://google.com', now() - interval '3 days', null),
  ('cccccccc-cccc-4ccc-8ccc-ccccccccc006', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3', '{"Full Name":"Moses Kibet","Email Address":"moses@example.com"}'::jsonb, 'registered', 'seed-session-006', 'community', 'partner', 'open-source-ai', null, now() - interval '2 days', null),
  ('cccccccc-cccc-4ccc-8ccc-ccccccccc007', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa4', '{"Full Name":"Lilian Atieno","Email Address":"lilian@example.com"}'::jsonb, 'registered', 'seed-session-007', 'linkedin', 'social', 'health-data', null, now() - interval '1 day', null),
  ('cccccccc-cccc-4ccc-8ccc-ccccccccc008', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa5', '{"Full Name":"Sam Mbugua","Email Address":"sam@example.com"}'::jsonb, 'registered', 'seed-session-008', 'instagram', 'social', 'creative-breakfast', null, now() - interval '8 hours', null),
  ('cccccccc-cccc-4ccc-8ccc-ccccccccc009', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa6', '{"Full Name":"Irene Chebet","Email Address":"irene@example.com"}'::jsonb, 'checked_in', 'seed-session-009', 'direct', 'none', 'startup-weekend', null, now() - interval '57 days', now() - interval '52 days'),
  ('cccccccc-cccc-4ccc-8ccc-ccccccccc010', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa6', '{"Full Name":"Daniel Ouma","Email Address":"daniel@example.com"}'::jsonb, 'checked_in', 'seed-session-010', 'partner', 'community', 'startup-weekend', null, now() - interval '56 days', now() - interval '52 days')
on conflict (id) do update
set
  event_id = excluded.event_id,
  data = excluded.data,
  status = excluded.status,
  session_id = excluded.session_id,
  utm_source = excluded.utm_source,
  utm_medium = excluded.utm_medium,
  utm_campaign = excluded.utm_campaign,
  referrer = excluded.referrer,
  created_at = excluded.created_at,
  attended_at = excluded.attended_at;

insert into public.event_page_views (
  id,
  event_id,
  session_id,
  utm_source,
  utm_medium,
  utm_campaign,
  referrer,
  city,
  country,
  user_agent,
  created_at
)
select
  gen_random_uuid(),
  seeded.event_id,
  seeded.session_id,
  seeded.utm_source,
  seeded.utm_medium,
  seeded.utm_campaign,
  seeded.referrer,
  seeded.city,
  seeded.country,
  'Hostquill seed browser',
  seeded.created_at
from (
  values
    ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1'::uuid, 'seed-session-001', 'linkedin', 'social', 'hackathon-launch', 'https://linkedin.com', 'Nairobi', 'Kenya', now() - interval '6 days 2 hours'),
    ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1'::uuid, 'seed-session-002', 'x', 'social', 'hackathon-launch', 'https://x.com', 'Nairobi', 'Kenya', now() - interval '5 days 4 hours'),
    ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1'::uuid, 'seed-session-003', 'newsletter', 'email', 'weekly-events', null, 'Mombasa', 'Kenya', now() - interval '4 days 1 hour'),
    ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1'::uuid, 'seed-session-011', 'direct', 'none', 'hackathon-launch', null, 'Kampala', 'Uganda', now() - interval '3 days'),
    ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1'::uuid, 'seed-session-012', 'google', 'organic', 'hackathon-launch', 'https://google.com', 'Lagos', 'Nigeria', now() - interval '2 days'),
    ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2'::uuid, 'seed-session-004', 'newsletter', 'email', 'python-biology', null, 'Nairobi', 'Kenya', now() - interval '7 days 2 hours'),
    ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2'::uuid, 'seed-session-005', 'google', 'organic', 'python-biology', 'https://google.com', 'Kisumu', 'Kenya', now() - interval '3 days 3 hours'),
    ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3'::uuid, 'seed-session-006', 'community', 'partner', 'open-source-ai', null, 'Accra', 'Ghana', now() - interval '2 days 5 hours'),
    ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa4'::uuid, 'seed-session-007', 'linkedin', 'social', 'health-data', null, 'Nairobi', 'Kenya', now() - interval '1 day 3 hours'),
    ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa5'::uuid, 'seed-session-008', 'instagram', 'social', 'creative-breakfast', null, 'Nairobi', 'Kenya', now() - interval '10 hours')
) as seeded(event_id, session_id, utm_source, utm_medium, utm_campaign, referrer, city, country, created_at)
where not exists (
  select 1
  from public.event_page_views existing
  where existing.event_id = seeded.event_id
    and existing.session_id = seeded.session_id
);

insert into public.event_waitlist (id, event_id, email, name, created_at)
values
  ('dddddddd-dddd-4ddd-8ddd-ddddddddd001', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1', 'waitlist.one@example.com', 'Waitlist One', now() - interval '2 days'),
  ('dddddddd-dddd-4ddd-8ddd-ddddddddd002', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa5', 'creative.waitlist@example.com', 'Creative Waitlist', now() - interval '1 day')
on conflict (event_id, email) do update
set
  name = excluded.name,
  created_at = excluded.created_at;

insert into public.email_templates (id, event_id, template_type, subject, body, enabled)
values
  ('eeeeeeee-eeee-4eee-8eee-eeeeeeeee001', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1', 'confirmation', 'You are registered for AI Vibe Coding Hackathon Nairobi', 'Thanks for registering. We will send team formation details before the event.', true),
  ('eeeeeeee-eeee-4eee-8eee-eeeeeeeee002', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1', 'reminder', 'Hackathon starts tomorrow', 'Bring your laptop, charger, and a problem you want to solve.', true),
  ('eeeeeeee-eeee-4eee-8eee-eeeeeeeee003', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2', 'confirmation', 'Python Roadmap bootcamp registration confirmed', 'Your bootcamp seat is confirmed. Setup instructions are coming soon.', true),
  ('eeeeeeee-eeee-4eee-8eee-eeeeeeeee004', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa5', 'confirmation', 'Creative Careers Breakfast RSVP confirmed', 'Thanks for joining us for portfolio reviews.', true)
on conflict (event_id, template_type) do update
set
  subject = excluded.subject,
  body = excluded.body,
  enabled = excluded.enabled;

insert into public.event_feedback (id, event_id, registration_id, rating, comment, author_name, created_at)
values
  ('ffffffff-ffff-4fff-8fff-fffffffff001', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa6', 'cccccccc-cccc-4ccc-8ccc-ccccccccc009', 5, 'Strong founder energy and practical mentor feedback. I left with a clearer pitch.', 'Irene Chebet', now() - interval '49 days'),
  ('ffffffff-ffff-4fff-8fff-fffffffff002', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa6', 'cccccccc-cccc-4ccc-8ccc-ccccccccc010', 4, 'Great room, helpful community, and the demos were better than expected.', 'Daniel Ouma', now() - interval '48 days'),
  ('ffffffff-ffff-4fff-8fff-fffffffff003', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1', 'cccccccc-cccc-4ccc-8ccc-ccccccccc001', 5, 'The prep notes were clear and the team formation process was smooth.', 'Amina Otieno', now() - interval '3 days')
on conflict (id) do update
set
  event_id = excluded.event_id,
  registration_id = excluded.registration_id,
  rating = excluded.rating,
  comment = excluded.comment,
  author_name = excluded.author_name,
  created_at = excluded.created_at;

-- Also seed the first real profile already present in this project so the signed-in dashboard is not empty.
with real_profile as (
  select id
  from public.profiles
  where id not in (
    '11111111-1111-4111-8111-111111111111',
    '22222222-2222-4222-8222-222222222222',
    '33333333-3333-4333-8333-333333333333',
    '44444444-4444-4444-8444-444444444444'
  )
  order by created_at
  limit 1
)
update public.profiles p
set
  full_name = coalesce(p.full_name, 'Hostquill Organizer'),
  company = coalesce(p.company, 'Hostquill Demo Company'),
  company_slug = coalesce(p.company_slug, 'hostquill-organizer'),
  company_description = coalesce(p.company_description, 'A seeded organizer profile with real events, registrations, traffic, and feedback for dashboard testing.'),
  avatar_url = coalesce(p.avatar_url, 'https://api.dicebear.com/7.x/initials/svg?seed=Hostquill%20Organizer'),
  website = coalesce(p.website, 'https://hostquill.com'),
  social_links = coalesce(p.social_links, '[{"platform":"LinkedIn","url":"https://linkedin.com/company/hostquill"}]'::jsonb),
  updated_at = now()
from real_profile
where p.id = real_profile.id;

with real_profile as (
  select id from public.profiles where company_slug = 'hostquill-organizer' limit 1
)
insert into public.events (id, user_id, name, slug, description, event_date, event_end_date, timezone, event_type, status, template, primary_color, color_mode, background_image_url, location_type, location_value, ticket_price, requires_approval, capacity, registration_limit, registration_deadline)
select 'abababab-abab-4aba-8aba-ababababab01'::uuid, id, 'Hostquill Launch Workshop', 'hostquill-launch-workshop', 'A practical workshop for setting up event pages, tracking registrations, and reading real analytics in Hostquill.', now() + interval '12 days', now() + interval '12 days 2 hours', 'Africa/Nairobi', 'Workshop', 'live'::public.event_status, 'split', '#EC4899', 'light', 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1400&q=80', 'physical', 'Nairobi, Kenya', 15, false, 60, 60, now() + interval '11 days' from real_profile
union all
select 'abababab-abab-4aba-8aba-ababababab02'::uuid, id, 'Hostquill Community Demo Day', 'hostquill-community-demo-day', 'A past showcase used to populate feedback, check-ins, and post-event analytics.', now() - interval '21 days', now() - interval '21 days 3 hours', 'Africa/Nairobi', 'Demo Day', 'past'::public.event_status, 'landing', '#111827', 'light', 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=1400&q=80', 'physical', 'Nairobi Garage', 0, false, 100, 100, now() - interval '23 days' from real_profile
on conflict (id) do update
set user_id = excluded.user_id, name = excluded.name, slug = excluded.slug, description = excluded.description, event_date = excluded.event_date, event_end_date = excluded.event_end_date, timezone = excluded.timezone, event_type = excluded.event_type, status = excluded.status, template = excluded.template, primary_color = excluded.primary_color, color_mode = excluded.color_mode, background_image_url = excluded.background_image_url, location_type = excluded.location_type, location_value = excluded.location_value, ticket_price = excluded.ticket_price, requires_approval = excluded.requires_approval, capacity = excluded.capacity, registration_limit = excluded.registration_limit, registration_deadline = excluded.registration_deadline, updated_at = now();

insert into public.form_fields (id, event_id, label, field_type, placeholder, required, position)
values
  ('babababa-baba-4bab-8bab-babababab001', 'abababab-abab-4aba-8aba-ababababab01', 'Full Name', 'text', 'Your name', true, 1),
  ('babababa-baba-4bab-8bab-babababab002', 'abababab-abab-4aba-8aba-ababababab01', 'Email Address', 'email', 'you@example.com', true, 2),
  ('babababa-baba-4bab-8bab-babababab003', 'abababab-abab-4aba-8aba-ababababab02', 'Full Name', 'text', 'Your name', true, 1),
  ('babababa-baba-4bab-8bab-babababab004', 'abababab-abab-4aba-8aba-ababababab02', 'Email Address', 'email', 'you@example.com', true, 2)
on conflict (id) do update set event_id = excluded.event_id, label = excluded.label, field_type = excluded.field_type, placeholder = excluded.placeholder, required = excluded.required, position = excluded.position;

insert into public.registrations (id, event_id, data, status, session_id, utm_source, utm_medium, utm_campaign, referrer, created_at, attended_at)
values
  ('cacacaca-caca-4cac-8cac-cacacacac001', 'abababab-abab-4aba-8aba-ababababab01', '{"Full Name":"Mary Wanjiru","Email Address":"mary@example.com"}'::jsonb, 'registered', 'real-seed-session-001', 'linkedin', 'social', 'launch-workshop', 'https://linkedin.com', now() - interval '4 days', null),
  ('cacacaca-caca-4cac-8cac-cacacacac002', 'abababab-abab-4aba-8aba-ababababab01', '{"Full Name":"John Kamau","Email Address":"john@example.com"}'::jsonb, 'registered', 'real-seed-session-002', 'newsletter', 'email', 'launch-workshop', null, now() - interval '2 days', null),
  ('cacacaca-caca-4cac-8cac-cacacacac003', 'abababab-abab-4aba-8aba-ababababab02', '{"Full Name":"Faith Achieng","Email Address":"faith@example.com"}'::jsonb, 'checked_in', 'real-seed-session-003', 'direct', 'none', 'demo-day', null, now() - interval '25 days', now() - interval '21 days')
on conflict (id) do update set event_id = excluded.event_id, data = excluded.data, status = excluded.status, session_id = excluded.session_id, utm_source = excluded.utm_source, utm_medium = excluded.utm_medium, utm_campaign = excluded.utm_campaign, referrer = excluded.referrer, created_at = excluded.created_at, attended_at = excluded.attended_at;

insert into public.event_page_views (id, event_id, session_id, utm_source, utm_medium, utm_campaign, referrer, city, country, user_agent, created_at)
select gen_random_uuid(), seeded.event_id, seeded.session_id, seeded.utm_source, seeded.utm_medium, seeded.utm_campaign, seeded.referrer, seeded.city, seeded.country, 'Hostquill seed browser', seeded.created_at
from (values
  ('abababab-abab-4aba-8aba-ababababab01'::uuid, 'real-seed-session-001', 'linkedin', 'social', 'launch-workshop', 'https://linkedin.com', 'Nairobi', 'Kenya', now() - interval '4 days 2 hours'),
  ('abababab-abab-4aba-8aba-ababababab01'::uuid, 'real-seed-session-002', 'newsletter', 'email', 'launch-workshop', null, 'Nairobi', 'Kenya', now() - interval '2 days 3 hours'),
  ('abababab-abab-4aba-8aba-ababababab01'::uuid, 'real-seed-session-004', 'google', 'organic', 'launch-workshop', 'https://google.com', 'Mombasa', 'Kenya', now() - interval '1 day'),
  ('abababab-abab-4aba-8aba-ababababab02'::uuid, 'real-seed-session-003', 'direct', 'none', 'demo-day', null, 'Kisumu', 'Kenya', now() - interval '25 days')
) as seeded(event_id, session_id, utm_source, utm_medium, utm_campaign, referrer, city, country, created_at)
where not exists (select 1 from public.event_page_views existing where existing.event_id = seeded.event_id and existing.session_id = seeded.session_id);

insert into public.event_feedback (id, event_id, registration_id, rating, comment, author_name, created_at)
values ('fafafafa-fafa-4faf-8faf-fafafafaf001', 'abababab-abab-4aba-8aba-ababababab02', 'cacacaca-caca-4cac-8cac-cacacacac003', 5, 'The demo flow made the product feel real and usable.', 'Faith Achieng', now() - interval '20 days')
on conflict (id) do update set event_id = excluded.event_id, registration_id = excluded.registration_id, rating = excluded.rating, comment = excluded.comment, author_name = excluded.author_name, created_at = excluded.created_at;

notify pgrst, 'reload schema';
