import { supabase } from "@/integrations/supabase/client";
import { fetchDiscoverEvents, fetchPastEvents, fetchUpcomingEvents, MockEvent } from "@/lib/mockEvents";

const DEFAULT_COVER = "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80";
const DEFAULT_AVATAR = "https://api.dicebear.com/7.x/identicon/svg?seed=hostquill";
const CATEGORIES: MockEvent["category"][] = ["Tech", "AI", "Climate", "Crypto", "Arts", "Wellness", "Community"];

function normalizeCategory(value?: string | null): MockEvent["category"] {
  const match = CATEGORIES.find((category) => category.toLowerCase() === value?.toLowerCase());
  return match || "Community";
}

function socialsFromProfile(profile: any): MockEvent["hosts"][number]["socials"] {
  const socials: MockEvent["hosts"][number]["socials"] = {};
  const socialLinks = profile?.social_links;

  if (Array.isArray(socialLinks)) {
    socialLinks.forEach((link) => {
      if (!link || typeof link !== "object") return;
      const platform = String(link.platform || "").toLowerCase();
      const url = String(link.url || "");
      if (!url) return;
      if (platform.includes("twitter") || platform === "x") socials.twitter = url;
      if (platform.includes("linkedin")) socials.linkedin = url;
      if (platform.includes("instagram")) socials.instagram = url;
      if (platform.includes("website") || platform.includes("globe")) socials.website = url;
    });
  }

  if (profile?.website && !socials.website) socials.website = profile.website;
  return socials;
}

function cityFromLocation(location?: string | null) {
  if (!location) return "Online";
  return location.split(",")[0]?.trim() || location;
}

async function registrationCount(eventId: string) {
  const { data, error } = await supabase.rpc("get_registration_count", { p_event_id: eventId });
  if (error) return 0;
  return Number(data || 0);
}

async function fetchLiveDbEvents() {
  const { data, error } = await supabase
    .from("events")
    .select("*, profiles(*)")
    .eq("status", "live")
    .order("event_date", { ascending: true });

  if (error) throw error;

  const counts = await Promise.all((data || []).map((event) => registrationCount(event.id)));

  return (data || []).map((event: any, index): MockEvent => {
    const profile = event.profiles || {};
    const location = event.location_value || (event.location_type === "physical" ? "Event location" : "Online");

    return {
      id: event.id,
      slug: event.slug,
      title: event.name,
      date: event.event_date || event.created_at || new Date().toISOString(),
      endDate: event.event_end_date || undefined,
      location,
      city: cityFromLocation(location),
      cover: event.background_image_url || DEFAULT_COVER,
      hosts: [
        {
          name: profile.company || profile.full_name || "Hostquill Organizer",
          avatar: profile.avatar_url || DEFAULT_AVATAR,
          socials: socialsFromProfile(profile),
        },
      ],
      attendees: counts[index] || 0,
      status: "none",
      category: normalizeCategory(event.event_type),
      source: event.location_type === "physical" ? "In Person" : event.location_type === "hybrid" ? "Hybrid" : "Online",
      featured: index < 3,
    };
  });
}

export async function fetchPublicEvents() {
  const dbEvents = await fetchLiveDbEvents();
  return dbEvents;
}

export async function fetchPublicUpcomingEvents() {
  try {
    const events = await fetchPublicEvents();
    const now = Date.now();
    return events.filter((event) => new Date(event.endDate || event.date).getTime() >= now);
  } catch {
    return fetchUpcomingEvents();
  }
}

export async function fetchPublicPastEvents() {
  try {
    const events = await fetchPublicEvents();
    const now = Date.now();
    return events.filter((event) => new Date(event.endDate || event.date).getTime() < now);
  } catch {
    return fetchPastEvents();
  }
}

export async function fetchPublicDiscoverEvents() {
  try {
    return await fetchPublicEvents();
  } catch {
    return fetchDiscoverEvents();
  }
}

export async function fetchPublicEventsByCity(city: string) {
  try {
    const cityKey = city.toLowerCase();
    const events = await fetchPublicUpcomingEvents();
    return events.filter((event) => {
      const haystack = `${event.city || ""} ${event.location || ""}`.toLowerCase();
      return haystack.includes(cityKey);
    });
  } catch {
    return [];
  }
}
