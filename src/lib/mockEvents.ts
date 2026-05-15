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

export const EXPANDED_CATEGORIES = [
  { name: "Tech", icon: "Monitor", bgIcon: "Monitor", count: 4000 },
  { name: "Food & Drink", icon: "Utensils", bgIcon: "Utensils", count: 433 },
  { name: "AI", icon: "Brain", bgIcon: "Brain", count: 3000 },
  { name: "Arts & Culture", icon: "Palette", bgIcon: "Palette", count: 1000 },
  { name: "Climate", icon: "Globe", bgIcon: "Globe", count: 651 },
  { name: "Fitness", icon: "Dumbbell", bgIcon: "Dumbbell", count: 1000 },
  { name: "Wellness", icon: "Heart", bgIcon: "Heart", count: 1000 },
  { name: "Crypto", icon: "Coins", bgIcon: "Coins", count: 658 },
  { name: "Business", icon: "Briefcase", bgIcon: "Briefcase", count: 2500 },
  { name: "Education", icon: "BookOpen", bgIcon: "BookOpen", count: 1800 },
  { name: "Music", icon: "Music", bgIcon: "Music", count: 2200 },
  { name: "Sports", icon: "Trophy", bgIcon: "Trophy", count: 1500 },
];

export const FEATURED_CALENDARS = [
  {
    name: "OpenClaw Meetups",
    icon: "🦞",
    description: "Discover community meetups for OpenClaw around the world.",
    events: 45
  },
  {
    name: "Reading Rhythms Global",
    icon: "🎵",
    description: "Not a book club. A reading party. Read with friends to live music...",
    events: 128
  },
  {
    name: "Build Club",
    icon: "🏗️",
    description: "The most collaborative AI community in the world (50+ cities worldwide).",
    events: 89
  },
  {
    name: "South Park Commons",
    icon: "🔷",
    description: "South Park Commons helps you get from -1 to 0. To learn more...",
    events: 234
  },
  {
    name: "Design Buddies",
    icon: "🐰",
    description: "Events for all creatives across SF/LA, online, and the world!",
    events: 167
  },
  {
    name: "Cursor Community",
    icon: "👆",
    description: "Cursor community meetups, hackathons, workshops taking...",
    events: 92
  },
  {
    name: "Google DeepMind",
    icon: "🤖",
    description: "Connect with the Google DeepMind Developer Experience team...",
    events: 78
  },
  {
    name: "Y Combinator",
    icon: "🚀",
    description: "Startup events, founder meetups, and demo days from YC alumni...",
    events: 156
  },
  {
    name: "TechCrunch Events",
    icon: "📰",
    description: "Industry conferences, startup competitions, and networking events...",
    events: 203
  }
];

export const LOCAL_EVENTS = [
  {
    id: "local1",
    slug: "nairobi-tech-meetup",
    title: "Nairobi Tech Community Meetup",
    date: "2024-03-20T18:00:00Z",
    location: "iHub, Nairobi",
    category: "Tech",
    cover: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&q=80",
    attendees: 89
  },
  {
    id: "local2",
    slug: "ai-workshop-nairobi",
    title: "Machine Learning Workshop for Beginners",
    date: "2024-03-22T14:00:00Z",
    location: "Nairobi Garage, Kilimani",
    category: "AI",
    cover: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=400&q=80",
    attendees: 45
  },
  {
    id: "local3",
    slug: "wellness-yoga-session",
    title: "Weekend Wellness: Yoga & Meditation",
    date: "2024-03-23T09:00:00Z",
    location: "Karura Forest, Nairobi",
    category: "Wellness",
    cover: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&q=80",
    attendees: 67
  },
  {
    id: "local4",
    slug: "startup-pitch-night",
    title: "Startup Pitch Night: Nairobi Edition",
    date: "2024-03-24T17:00:00Z",
    location: "The Nairobi Innovation Hub",
    category: "Business",
    cover: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400&q=80",
    attendees: 123
  },
  {
    id: "local5",
    slug: "food-festival-nairobi",
    title: "Nairobi Street Food Festival",
    date: "2024-03-25T12:00:00Z",
    location: "Uhuru Gardens, Nairobi",
    category: "Food & Drink",
    cover: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80",
    attendees: 234
  },
  {
    id: "local6",
    slug: "crypto-meetup-kenya",
    title: "Kenya Crypto & Blockchain Meetup",
    date: "2024-03-26T18:30:00Z",
    location: "Nairobi Securities Exchange",
    category: "Crypto",
    cover: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=80",
    attendees: 78
  }
];
