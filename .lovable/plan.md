## Scope

This is a large request spanning auth, emails, analytics, and a "Luma-parity" feature push. Here's what I'll do, what needs your input, and what has dependencies.

---

## 1. Auth page — Google + Apple OAuth (✅ no keys needed)

Lovable Cloud manages Google and Apple OAuth out-of-the-box. No API keys or redirect URLs to configure manually.

**Changes:**
- Enable Google + Apple via managed social auth, disable email/password sign-in flow on the auth page (still keep account records).
- Redesign `src/pages/Auth.tsx`:
  - Full-bleed background photo of people at an event (generated, premium quality).
  - Soft pinkish gradient overlay (low opacity, faint, on-brand rose).
  - Centered glass card with the eventspark logo, a tagline, and **two large pill buttons**: "Continue with Google" and "Continue with Apple", each with proper brand glyphs, full-width, h-14, generous spacing.
  - Mobile-first, borderless, matches existing brand memory (Bricolage + DM Sans, rose-red primary).

---

## 2. Email confirmations & reminders for registrations

This requires a verified sender domain (one-time setup on your end via a guided dialog — DNS records at your registrar). Once set:
- **Confirmation email**: sent immediately when someone registers (event name, date/time, location, calendar link, organizer branding).
- **Reminder emails**: sent 24h before and 1h before the event via a scheduled job (pg_cron) that scans upcoming events and queues reminders, deduped so each attendee only gets one of each.
- All emails branded per-event (logo, primary color) and per-company (from name).
- Logged in `email_send_log` for monitoring.

I'll prompt you to set up the sender domain when we get to this step.

---

## 3. Registration funnel analytics + UTM tracking

**Tracking layer:**
- New `event_page_views` table: records every visit to `/register/:slug` with `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`, `referrer`, `session_id` (anon cookie), `event_id`, `created_at`.
- `registrations` table gets UTM columns + `session_id` so we can attribute a registration to its originating view.
- Public-insert RLS for `event_page_views` (similar pattern to registrations).
- `Register.tsx` fires a view event on mount and stores the session_id; on submit, the UTM/session is attached to the registration.

**Funnel dashboard (new tab "Funnel" under Analytics or as a sub-section):**
- Stages: **Views → Started form → Completed registration**.
- Conversion %: view→start, start→complete, view→complete.
- Top UTM sources, mediums, campaigns (table + bar chart).
- Per-event drilldown.
- Time-range filter (7d / 30d / 90d / all).

---

## 4. "Luma-parity" features (minus payments)

"Everything Luma has" is too broad to ship in one pass. Here's a prioritized list of what eventspark is missing vs Luma. **I need you to pick which ones to build now** (I'd recommend tier 1 in this run, tier 2+ in follow-ups):

**Tier 1 — high impact, scoped**
- a. **Calendar invite (.ics)** attached to confirmation emails + "Add to Google/Apple Calendar" links
- b. **Waitlist** when capacity is full (auto-promote on cancellation)
- c. **Guest cancel/manage RSVP** via signed link in confirmation email
- d. **Host approval queue** (UI for `requires_approval` events — currently the column exists but no UX)
- e. **Co-hosts / team members on an event** (already have profile teams partially)
- f. **Event series / recurring events**

**Tier 2 — engagement**
- g. **Discussion / comments thread** per event for registered attendees
- h. **Check-in mode** (scan attendee QR code at the door, mark attended)
- i. **Attendee profile cards** + opt-in "who's coming" list on the public page
- j. **Email broadcast to attendees** (compose + send to all registered)

**Tier 3 — discovery**
- k. **Public event discovery feed** (`/discover`) with filters (date, location, type)
- l. **Featured / trending** events on the landing page
- m. **Subscriber following** — users follow a company and get notified on new events
- n. **Event hosting calendar** view in the dashboard

**Tier 4 — polish**
- o. **Custom event URLs** (let host pick the slug)
- p. **Multiple ticket types / RSVP options** (e.g. "Going", "Maybe", "+1")
- q. **Localization / multi-timezone display**
- r. **Embed widget** for hosts to drop registration into their own site

---

## What I need from you

1. **Confirm auth + email setup + funnel analytics (sections 1, 2, 3)** — I'll start these immediately.
2. **Pick which Luma features** from tier 1 (and optionally beyond) to include in this run. If you say "tier 1 all", I'll do a–f. If you want everything, I'll group it across multiple plans (a single response can't safely ship 18 features).

## Suggested execution order

1. Auth redesign + Google/Apple enable (fast, visible win)
2. Funnel tracking + dashboard (DB migration + UI)
3. Email infra setup dialog → confirmation + reminder emails + .ics
4. Tier 1 Luma features you select

---

## Technical notes (for my reference)

- Social auth via `supabase--configure_social_auth` with `["google", "apple"]`, then `lovable.auth.signInWithOAuth(...)` in `Auth.tsx`.
- New tables: `event_page_views`, `event_reminders_sent`, `event_waitlist` (if 4b chosen), `event_comments` (4g), etc.
- `registrations` adds: `utm_source/medium/campaign/content/term`, `session_id`, `attended_at` (4h).
- Reminder cron: `process-event-reminders` Edge Function on a 5-minute pg_cron, queries events between `now()+58min..now()+62min` and `now()+23h58m..now()+24h2m`, idempotent via `event_reminders_sent`.
- Confirmation email triggered from `register_for_event` RPC via `pg_net` enqueue, or from client after RPC returns — I'll use the queue path for retry safety.
- `.ics` generated in the Edge Function, attached as base64 in the email payload.