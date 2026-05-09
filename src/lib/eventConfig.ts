// Per-event "thank-you" + resource delivery config.
// MOCK: stored in localStorage so we can iterate without a migration.
// TODO: replace getEventConfig/saveEventConfig with real API calls
//   GET  /api/events/:id/post-registration-config
//   POST /api/events/:id/post-registration-config

export type EventPostRegConfig = {
  thankYouTitle?: string;
  thankYouMessage?: string;
  resourceUrl?: string;       // e.g. PDF, video, deck, Discord invite
  resourceLabel?: string;     // CTA label, e.g. "Download the deck"
  redirectUrl?: string;       // optional redirect after N seconds
  showCalendar?: boolean;     // default true
};

const KEY = (eventId: string) => `eventspark:postreg:${eventId}`;

export function getEventConfig(eventId: string): EventPostRegConfig {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(KEY(eventId));
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveEventConfig(eventId: string, cfg: EventPostRegConfig) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY(eventId), JSON.stringify(cfg));
}
