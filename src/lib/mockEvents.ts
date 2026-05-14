// Mock event listings for the public Events + Discover pages.
// TODO: replace with real API once backend integration resumes.

export type MockEvent = {
  id: string;
  slug: string;
  title: string;
  date: string;          // ISO
  endDate?: string;
  location: string;
  city?: string;
  cover: string;         // image url
  hosts: { name: string; avatar: string }[];
  attendees: number;
  status: "going" | "invited" | "interested" | "hosting" | "none";
  category: "Tech" | "AI" | "Climate" | "Crypto" | "Arts" | "Wellness" | "Community";
  source?: string;       // e.g. "YouTube", "In Person"
  featured?: boolean;
  videoUrl?: string;     // YouTube/Vimeo embed URL or direct mp4 — plays inside the cover frame
};

const COVERS = [
  "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80",
  "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&q=80",
  "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80",
  "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&q=80",
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
  "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80",
  "https://images.unsplash.com/photo-1559523161-0fc0d8b38a7a?w=800&q=80",
  "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&q=80",
];

const AVATARS = [1, 5, 8, 9, 12, 16, 22, 33].map((i) => `https://i.pravatar.cc/100?img=${i}`);

function dayOffset(d: number, hour = 18) {
  const x = new Date();
  x.setDate(x.getDate() + d);
  x.setHours(hour, 0, 0, 0);
  return x.toISOString();
}

export const MOCK_EVENTS: MockEvent[] = [
  {
    id: "m1", slug: "ai-builders-night",
    title: "AI Builders Night — Agents in Production",
    date: dayOffset(2, 18), location: "Sarit Centre, Nairobi", city: "Nairobi",
    cover: COVERS[0],
    hosts: [{ name: "Brandon", avatar: AVATARS[0] }, { name: "Priya", avatar: AVATARS[1] }],
    attendees: 142, status: "going", category: "AI", featured: true,
    videoUrl: "https://www.youtube.com/embed/aircAruvnKk",
  },
  {
    id: "m2", slug: "founders-coffee",
    title: "Founders Coffee · Westlands Edition",
    date: dayOffset(5, 9), location: "Java House, Westlands", city: "Nairobi",
    cover: COVERS[1],
    hosts: [{ name: "Marcus", avatar: AVATARS[2] }],
    attendees: 38, status: "invited", category: "Community",
  },
  {
    id: "m3", slug: "stellar-east-africa",
    title: "Stellar East Africa — Campus Series · JKUAT",
    date: dayOffset(7, 12), location: "JKUAT IPIC Main Campus", city: "Juja",
    cover: COVERS[2],
    hosts: [{ name: "Stellar", avatar: AVATARS[3] }, { name: "Brandon", avatar: AVATARS[0] }],
    attendees: 410, status: "going", category: "Crypto", featured: true,
  },
  {
    id: "m4", slug: "deliberate-democracy",
    title: "Deliberate Democracy in Practice",
    date: dayOffset(10, 17), location: "Online", city: "Online",
    cover: COVERS[3],
    hosts: [{ name: "PrivacyLab", avatar: AVATARS[4] }],
    attendees: 88, status: "interested", category: "Community", source: "YouTube",
  },
  {
    id: "m5", slug: "mjengo-networking",
    title: "Mjengo Networking — The Collaborative Challenge",
    date: dayOffset(12, 7), location: "CTM Ngong Road", city: "Nairobi",
    cover: COVERS[4],
    hosts: [{ name: "Mjengo", avatar: AVATARS[5] }],
    attendees: 220, status: "none", category: "Community", featured: true,
  },
  {
    id: "m6", slug: "magic-of-autocorrect",
    title: "The Magic Behind Autocorrect",
    date: dayOffset(14, 17), location: "Sarit Centre", city: "Nairobi",
    cover: COVERS[5],
    hosts: [{ name: "Meetup", avatar: AVATARS[6] }],
    attendees: 64, status: "none", category: "Tech",
  },
  {
    id: "m7", slug: "climate-makers",
    title: "Climate Makers Forum — Africa Edition",
    date: dayOffset(20, 10), location: "Radisson Blu", city: "Nairobi",
    cover: COVERS[6],
    hosts: [{ name: "EcoGuild", avatar: AVATARS[7] }],
    attendees: 305, status: "none", category: "Climate",
  },
  {
    id: "m8", slug: "late-night-jam",
    title: "Late Night Jam · Vibe Coding Edition",
    date: dayOffset(25, 21), location: "Online", city: "Online",
    cover: COVERS[7],
    hosts: [{ name: "Marcus", avatar: AVATARS[2] }],
    attendees: 51, status: "interested", category: "Arts",
  },
  // Past
  {
    id: "p1", slug: "replit-security-ama",
    title: "Replit + Security · Community AMA with CTO",
    date: dayOffset(-12, 19), location: "Online", city: "Online",
    cover: COVERS[1],
    hosts: [{ name: "Raymmar", avatar: AVATARS[4] }, { name: "Francisco", avatar: AVATARS[6] }],
    attendees: 6800, status: "invited", category: "Tech", source: "YouTube",
  },
  {
    id: "p2", slug: "stellar-jkuat-recap",
    title: "Stellar East Africa — JKUAT Recap",
    date: dayOffset(-15, 12), location: "JKUAT IPIC Main Campus", city: "Juja",
    cover: COVERS[2],
    hosts: [{ name: "Brandon", avatar: AVATARS[0] }],
    attendees: 138, status: "going", category: "Crypto",
  },
  {
    id: "p3", slug: "founders-april-mixer",
    title: "Founders April Mixer",
    date: dayOffset(-30, 18), location: "The Alchemist", city: "Nairobi",
    cover: COVERS[3],
    hosts: [{ name: "Marcus", avatar: AVATARS[2] }],
    attendees: 92, status: "going", category: "Community",
  },
];

// ─── Mock API surface ──────────────────────────────────────────────
// These functions are intentionally async + thin so that when real
// backend endpoints land, only the body of each function changes.

export async function fetchUpcomingEvents(): Promise<MockEvent[]> {
  // TODO: GET /api/events?filter=upcoming
  const now = Date.now();
  return MOCK_EVENTS.filter((e) => new Date(e.date).getTime() >= now)
    .sort((a, b) => +new Date(a.date) - +new Date(b.date));
}

export async function fetchPastEvents(): Promise<MockEvent[]> {
  // TODO: GET /api/events?filter=past
  const now = Date.now();
  return MOCK_EVENTS.filter((e) => new Date(e.date).getTime() < now)
    .sort((a, b) => +new Date(b.date) - +new Date(a.date));
}

export async function fetchDiscoverEvents(): Promise<MockEvent[]> {
  // TODO: GET /api/discover
  return [...MOCK_EVENTS].sort((a, b) => b.attendees - a.attendees);
}

export async function fetchEventBySlug(slug: string): Promise<MockEvent | null> {
  // TODO: GET /api/events/:slug
  return MOCK_EVENTS.find((e) => e.slug === slug) ?? null;
}

export const CATEGORIES: { name: MockEvent["category"]; emoji: string; count: number }[] = [
  { name: "Tech",      emoji: "💻", count: 4200 },
  { name: "AI",        emoji: "🧠", count: 3100 },
  { name: "Climate",   emoji: "🌍", count: 617 },
  { name: "Crypto",    emoji: "🪙", count: 980 },
  { name: "Arts",      emoji: "🎨", count: 1240 },
  { name: "Wellness",  emoji: "🧘", count: 540 },
  { name: "Community", emoji: "🤝", count: 2305 },
];
