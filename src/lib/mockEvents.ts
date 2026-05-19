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
  hosts: {
    name: string;
    avatar: string;
    socials?: { twitter?: string; linkedin?: string; instagram?: string; website?: string };
  }[];
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

const SOCIALS = {
  brandon:   { twitter: "https://twitter.com/brandon",   linkedin: "https://linkedin.com/in/brandon",   website: "https://brandon.dev" },
  priya:     { twitter: "https://twitter.com/priya",     linkedin: "https://linkedin.com/in/priya",     instagram: "https://instagram.com/priya" },
  marcus:    { twitter: "https://twitter.com/marcus",    linkedin: "https://linkedin.com/in/marcus" },
  stellar:   { twitter: "https://twitter.com/StellarOrg", website: "https://stellar.org" },
  privacy:   { twitter: "https://twitter.com/privacylab", website: "https://privacylab.org" },
  mjengo:    { instagram: "https://instagram.com/mjengo", website: "https://mjengo.co" },
  meetup:    { website: "https://meetup.com" },
  ecoguild:  { twitter: "https://twitter.com/ecoguild", website: "https://ecoguild.org" },
  raymmar:   { twitter: "https://twitter.com/raymmar", linkedin: "https://linkedin.com/in/raymmar" },
  francisco: { twitter: "https://twitter.com/francisco", linkedin: "https://linkedin.com/in/francisco" },
};

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
    hosts: [
      { name: "Brandon", avatar: AVATARS[0], socials: SOCIALS.brandon },
      { name: "Priya", avatar: AVATARS[1], socials: SOCIALS.priya },
    ],
    attendees: 142, status: "going", category: "AI", featured: true,
    videoUrl: "https://www.youtube.com/embed/aircAruvnKk",
  },
  {
    id: "m2", slug: "founders-coffee",
    title: "Founders Coffee · Westlands Edition",
    date: dayOffset(5, 9), location: "Java House, Westlands", city: "Nairobi",
    cover: COVERS[1],
    hosts: [{ name: "Marcus", avatar: AVATARS[2], socials: SOCIALS.marcus }],
    attendees: 38, status: "invited", category: "Community",
  },
  {
    id: "m3", slug: "stellar-east-africa",
    title: "Stellar East Africa — Campus Series · JKUAT",
    date: dayOffset(7, 12), location: "JKUAT IPIC Main Campus", city: "Juja",
    cover: COVERS[2],
    hosts: [
      { name: "Stellar", avatar: AVATARS[3], socials: SOCIALS.stellar },
      { name: "Brandon", avatar: AVATARS[0], socials: SOCIALS.brandon },
    ],
    attendees: 410, status: "going", category: "Crypto", featured: true,
  },
  {
    id: "m4", slug: "deliberate-democracy",
    title: "Deliberate Democracy in Practice",
    date: dayOffset(10, 17), location: "Online", city: "Online",
    cover: COVERS[3],
    hosts: [{ name: "PrivacyLab", avatar: AVATARS[4], socials: SOCIALS.privacy }],
    attendees: 88, status: "interested", category: "Community", source: "YouTube",
  },
  {
    id: "m5", slug: "mjengo-networking",
    title: "Mjengo Networking — The Collaborative Challenge",
    date: dayOffset(12, 7), location: "CTM Ngong Road", city: "Nairobi",
    cover: COVERS[4],
    hosts: [{ name: "Mjengo", avatar: AVATARS[5], socials: SOCIALS.mjengo }],
    attendees: 220, status: "none", category: "Community", featured: true,
  },
  {
    id: "m6", slug: "magic-of-autocorrect",
    title: "The Magic Behind Autocorrect",
    date: dayOffset(14, 17), location: "Sarit Centre", city: "Nairobi",
    cover: COVERS[5],
    hosts: [{ name: "Meetup", avatar: AVATARS[6], socials: SOCIALS.meetup }],
    attendees: 64, status: "none", category: "Tech",
  },
  {
    id: "m7", slug: "climate-makers",
    title: "Climate Makers Forum — Africa Edition",
    date: dayOffset(20, 10), location: "Radisson Blu", city: "Nairobi",
    cover: COVERS[6],
    hosts: [{ name: "EcoGuild", avatar: AVATARS[7], socials: SOCIALS.ecoguild }],
    attendees: 305, status: "none", category: "Climate",
  },
  {
    id: "m8", slug: "late-night-jam",
    title: "Late Night Jam · Vibe Coding Edition",
    date: dayOffset(25, 21), location: "Online", city: "Online",
    cover: COVERS[7],
    hosts: [{ name: "Marcus", avatar: AVATARS[2], socials: SOCIALS.marcus }],
    attendees: 51, status: "interested", category: "Arts",
  },
  // Past
  {
    id: "p1", slug: "replit-security-ama",
    title: "Replit + Security · Community AMA with CTO",
    date: dayOffset(-12, 19), location: "Online", city: "Online",
    cover: COVERS[1],
    hosts: [
      { name: "Raymmar", avatar: AVATARS[4], socials: SOCIALS.raymmar },
      { name: "Francisco", avatar: AVATARS[6], socials: SOCIALS.francisco },
    ],
    attendees: 6800, status: "invited", category: "Tech", source: "YouTube",
  },
  {
    id: "p2", slug: "stellar-jkuat-recap",
    title: "Stellar East Africa — JKUAT Recap",
    date: dayOffset(-15, 12), location: "JKUAT IPIC Main Campus", city: "Juja",
    cover: COVERS[2],
    hosts: [{ name: "Brandon", avatar: AVATARS[0], socials: SOCIALS.brandon }],
    attendees: 138, status: "going", category: "Crypto",
  },
  {
    id: "p3", slug: "founders-april-mixer",
    title: "Founders April Mixer",
    date: dayOffset(-30, 18), location: "The Alchemist", city: "Nairobi",
    cover: COVERS[3],
    hosts: [{ name: "Marcus", avatar: AVATARS[2], socials: SOCIALS.marcus }],
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

export type CityDetail = {
  name: string;
  eventsCount: number;
  iconName: string;
  color: "blue" | "yellow" | "orange" | "teal" | "pink" | "beige" | "brown" | "green" | "purple" | "grey";
};

export const CITIES_BY_CONTINENT: Record<string, CityDetail[]> = {
  "Africa": [
    { name: "Cape Town", eventsCount: 6, iconName: "Waves", color: "teal" },
    { name: "Lagos", eventsCount: 12, iconName: "Building2", color: "grey" },
    { name: "Nairobi", eventsCount: 13, iconName: "Building", color: "green" }
  ],
  "Asia & Pacific": [
    { name: "Tokyo", eventsCount: 42, iconName: "Compass", color: "orange" },
    { name: "Singapore", eventsCount: 35, iconName: "Building2", color: "blue" },
    { name: "Sydney", eventsCount: 24, iconName: "Waves", color: "teal" },
    { name: "Bengaluru", eventsCount: 51, iconName: "School", color: "yellow" },
    { name: "Seoul", eventsCount: 18, iconName: "Building", color: "purple" },
    { name: "Melbourne", eventsCount: 15, iconName: "Trees", color: "green" }
  ],
  "Europe": [
    { name: "London", eventsCount: 87, iconName: "Building2", color: "blue" },
    { name: "Paris", eventsCount: 54, iconName: "Compass", color: "orange" },
    { name: "Berlin", eventsCount: 39, iconName: "School", color: "grey" },
    { name: "Amsterdam", eventsCount: 32, iconName: "Waves", color: "teal" },
    { name: "Lisbon", eventsCount: 21, iconName: "Trees", color: "pink" },
    { name: "Zürich", eventsCount: 12, iconName: "Mountain", color: "purple" }
  ],
  "South America": [
    { name: "São Paulo", eventsCount: 28, iconName: "Building", color: "blue" },
    { name: "Buenos Aires", eventsCount: 22, iconName: "School", color: "yellow" },
    { name: "Bogotá", eventsCount: 15, iconName: "Mountain", color: "orange" },
    { name: "Rio de Janeiro", eventsCount: 19, iconName: "Waves", color: "teal" },
    { name: "Santiago", eventsCount: 11, iconName: "Mountain", color: "green" },
    { name: "Lima", eventsCount: 8, iconName: "Compass", color: "grey" }
  ],
  "North America": [
    { name: "Atlanta", eventsCount: 17, iconName: "Building", color: "blue" },
    { name: "Austin", eventsCount: 31, iconName: "Building2", color: "yellow" },
    { name: "Boston", eventsCount: 25, iconName: "Compass", color: "orange" },
    { name: "Calgary", eventsCount: 10, iconName: "Building", color: "teal" },
    { name: "Chicago", eventsCount: 36, iconName: "Waves", color: "pink" },
    { name: "Dallas", eventsCount: 14, iconName: "Milestone", color: "beige" },
    { name: "Denver", eventsCount: 13, iconName: "Mountain", color: "orange" },
    { name: "Houston", eventsCount: 9, iconName: "Building2", color: "brown" },
    { name: "Las Vegas", eventsCount: 16, iconName: "Sparkles", color: "yellow" },
    { name: "Los Angeles", eventsCount: 45, iconName: "Trees", color: "green" },
    { name: "Mexico City", eventsCount: 29, iconName: "Sparkles", color: "orange" },
    { name: "Miami", eventsCount: 24, iconName: "Trees", color: "blue" },
    { name: "Minneapolis", eventsCount: 10, iconName: "Waves", color: "pink" },
    { name: "Montréal", eventsCount: 29, iconName: "Globe", color: "blue" },
    { name: "New York", eventsCount: 105, iconName: "Building", color: "orange" },
    { name: "Philadelphia", eventsCount: 28, iconName: "Bell", color: "orange" },
    { name: "Phoenix", eventsCount: 14, iconName: "Compass", color: "orange" },
    { name: "Portland", eventsCount: 11, iconName: "Sparkles", color: "pink" },
    { name: "Sacramento", eventsCount: 14, iconName: "Waves", color: "green" },
    { name: "Salt Lake City", eventsCount: 13, iconName: "Mountain", color: "yellow" },
    { name: "San Diego", eventsCount: 10, iconName: "Building2", color: "blue" },
    { name: "San Francisco", eventsCount: 78, iconName: "Waves", color: "orange" },
    { name: "Seattle", eventsCount: 41, iconName: "Building", color: "purple" },
    { name: "Toronto", eventsCount: 96, iconName: "Building2", color: "blue" },
    { name: "Vancouver", eventsCount: 33, iconName: "Globe", color: "yellow" },
    { name: "Washington, DC", eventsCount: 27, iconName: "Building", color: "grey" },
    { name: "Waterloo", eventsCount: 8, iconName: "School", color: "green" }
  ]
};

export const LOCAL_EVENTS_TEMPLATES = [
  {
    title: "Tech Community Meetup",
    location: "Hub & Cafe",
    category: "Tech",
    cover: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&q=80",
    offset: 2,
    hour: 18
  },
  {
    title: "AI Builders Night",
    location: "Innovation Space",
    category: "AI",
    cover: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=400&q=80",
    offset: 4,
    hour: 19
  },
  {
    title: "Weekend Wellness: Yoga & Meditation",
    location: "Local Gardens",
    category: "Wellness",
    cover: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&q=80",
    offset: 5,
    hour: 9
  },
  {
    title: "Startup Pitch Night",
    location: "Enterprise Hall",
    category: "Community",
    cover: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400&q=80",
    offset: 6,
    hour: 17
  },
  {
    title: "Street Food & Arts Festival",
    location: "Downtown Plaza",
    category: "Arts",
    cover: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80",
    offset: 7,
    hour: 12
  },
  {
    title: "Crypto & Web3 Blockchain Meetup",
    location: "Finance Center",
    category: "Crypto",
    cover: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=80",
    offset: 9,
    hour: 18
  }
];

export async function fetchLocalEventsByCity(cityName: string): Promise<MockEvent[]> {
  // Simulate network latency (very brief for seamless UI experience)
  await new Promise((resolve) => setTimeout(resolve, 80));

  // Generate customized events based on the selected city's name
  return LOCAL_EVENTS_TEMPLATES.map((tmpl, idx) => ({
    id: `local-${cityName.toLowerCase().replace(/[^a-z0-9]/g, "-")}-${idx}`,
    slug: `${cityName.toLowerCase().replace(/[^a-z0-9]/g, "-")}-${tmpl.title.toLowerCase().replace(/[^a-z0-9]/g, "-")}`,
    title: `${cityName} ${tmpl.title}`,
    date: dayOffset(tmpl.offset, tmpl.hour),
    location: `${tmpl.location}, ${cityName}`,
    city: cityName,
    cover: tmpl.cover,
    hosts: [
      { name: "Local Host", avatar: AVATARS[idx % AVATARS.length] }
    ],
    attendees: Math.floor(Math.random() * 150) + 30,
    status: "none",
    category: tmpl.category as any
  }));
}

// Fallback for backward compatibility
export const LOCAL_EVENTS = LOCAL_EVENTS_TEMPLATES.map((tmpl, idx) => ({
  id: `local-default-${idx}`,
  slug: `default-${tmpl.title.toLowerCase().replace(/[^a-z0-9]/g, "-")}`,
  title: `Nairobi ${tmpl.title}`,
  date: dayOffset(tmpl.offset, tmpl.hour),
  location: `${tmpl.location}, Nairobi`,
  category: tmpl.category,
  cover: tmpl.cover,
  attendees: Math.floor(Math.random() * 100) + 20
}));

export interface CityTheme {
  heroImage: string;
  timezone: string;
  description: string;
  longDescription: string;
  localTimeOffset: number;
}

export const CITY_THEMES: Record<string, CityTheme> = {
  "Cape Town": {
    heroImage: "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=1600&q=80",
    timezone: "GMT+2",
    description: "Discover the hottest events in Cape Town, and get notified of new events before they sell out.",
    longDescription: "In Cape Town, creativity gathers between ocean and mountain. From builder meetups to wellness Sundays, the scene blends entrepreneurial energy with a laid-back coastal rhythm.",
    localTimeOffset: 2
  },
  "Nairobi": {
    heroImage: "https://images.unsplash.com/photo-1549488344-1f9b8d2bd1f3?w=1600&q=80",
    timezone: "GMT+3",
    description: "Nairobi is East Africa's leading tech hub—the Silicon Savannah. Join dynamic builder nights, venture capital meetups, and groundbreaking mobile technology summits.",
    longDescription: "In Nairobi, the Silicon Savannah is alive with builder meetups, community coding sessions, and creative design workshops. Entrepreneurial drive meets a warm, cooperative tech spirit.",
    localTimeOffset: 3
  },
  "Lagos": {
    heroImage: "https://images.unsplash.com/photo-1594913785202-58df87760144?w=1600&q=80",
    timezone: "GMT+1",
    description: "Lagos pulses with unmatched creative, commercial, and tech energy. Discover bustling startup workshops, fintech panels, and vibrant cultural exhibitions in Nigeria's commercial capital.",
    longDescription: "Lagos is the commercial engine of West Africa, dynamic and filled with creative energy. Explore tech startup mixers, media production panels, and intense business development cohorts.",
    localTimeOffset: 1
  },
  "San Francisco": {
    heroImage: "https://images.unsplash.com/photo-1506012787146-f92b2d7d6d96?w=1600&q=80",
    timezone: "GMT-7",
    description: "San Francisco is the global center of AI innovation and software engineering. Connect with founders, builders, and developers at hacker house gatherings, AI demo nights, and casual meetups.",
    longDescription: "In San Francisco, AI research meets product builders. From elite hacker homes in Hayes Valley to dynamic demo days in SOMA, the city remains the ultimate technological frontier.",
    localTimeOffset: -7
  },
  "New York": {
    heroImage: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=1600&q=80",
    timezone: "GMT-4",
    description: "New York City blends tech innovation with media, finance, and the arts. Explore fintech meetups, creative coding events, and elite networking socials in the city that never sleeps.",
    longDescription: "In Manhattan and Brooklyn, financial technology, advertising, and creative arts merge seamlessly. The NYC scene is fast-paced, intellectually demanding, and extremely high-energy.",
    localTimeOffset: -4
  },
  "Tokyo": {
    heroImage: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1600&q=80",
    timezone: "GMT+9",
    description: "Tokyo merges cutting-edge technology with deep-rooted tradition. Discover next-gen gaming showcases, robotics workshops, and cultural technology expos in Japan's neon-lit metropolis.",
    longDescription: "Tokyo represents the pinnacle of robotic and digital art integration, blending clean streets with electric nights. Witness next-gen game dev meetups, AI art showoffs, and anime tech circles.",
    localTimeOffset: 9
  },
  "London": {
    heroImage: "https://images.unsplash.com/photo-1513635269975-59663e0ca1ad?w=1600&q=80",
    timezone: "GMT+1",
    description: "London brings together a global community of builders, investors, and creatives. Join prime tech summits, venture roundtables, and high-impact fintech gatherings across Europe's leading startup capital.",
    longDescription: "London brings together top global venture financing and digital services. Join high-profile tech summits, elite hacker nights, and developer gatherings in Shoreditch.",
    localTimeOffset: 1
  },
  "Paris": {
    heroImage: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1600&q=80",
    timezone: "GMT+2",
    description: "Paris stands at the intersection of AI excellence, design, and culture. Experience premier developer bootcamps, creative agency socials, and state-of-the-art research roundtables.",
    longDescription: "Paris is emerging as Europe's leading playground for open-source AI and boutique tech design. Join open-source bootcamps, developer dinners, and creative socials near the Seine.",
    localTimeOffset: 2
  }
};

export function getCityTheme(cityName: string): CityTheme {
  return CITY_THEMES[cityName] || {
    heroImage: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=1600&q=80",
    timezone: "GMT+3",
    description: `Discover the hottest events in ${cityName}, and get notified of new events before they sell out.`,
    longDescription: `Welcome to ${cityName}! From local gatherings to builder meetups, find the best communities and stay connected to what is happening near you.`,
    localTimeOffset: 3
  };
}

