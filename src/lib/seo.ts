import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Event } from "@/hooks/useEvents";

export const SITE_URL = "https://hostquill.com";
export const SITE_NAME = "Hostquill";
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.svg`;

type SeoInput = {
  title: string;
  description: string;
  path?: string;
  image?: string;
  type?: "website" | "article";
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
};

const routeSeo: Record<string, SeoInput> = {
  "/": {
    title: "Hostquill - Create and Manage Events",
    description: "Hostquill helps organizers create event pages, collect registrations, manage attendees, run check-ins, and track event analytics.",
  },
  "/events": {
    title: "Events on Hostquill",
    description: "Discover events hosted on Hostquill, from conferences and meetups to community gatherings, workshops, festivals, and online events.",
  },
  "/discover": {
    title: "Discover Events and Communities",
    description: "Find events, communities, local calendars, and organizers using Hostquill's event discovery tools and public event directory.",
  },
  "/calendars": {
    title: "Hostquill Event Calendars",
    description: "Browse organizer calendars on Hostquill and follow upcoming events from communities, creators, teams, schools, and brands.",
  },
  "/pricing": {
    title: "Hostquill Pricing",
    description: "Explore Hostquill pricing for event organizers who need event pages, registrations, attendee tools, ticketing, and analytics.",
  },
  "/auth": {
    title: "Sign in to Hostquill",
    description: "Sign in to Hostquill to create events, manage registration forms, review attendees, and run event check-in workflows.",
  },
  "/about": {
    title: "About Hostquill",
    description: "Hostquill is an event management and ticketing platform for organizers, communities, brands, schools, creators, and businesses.",
  },
  "/features": {
    title: "Hostquill Features",
    description: "Explore Hostquill features for event creation, ticket selling, registration forms, check-in, analytics, calendars, and promotion.",
  },
  "/use-cases": {
    title: "Hostquill Use Cases",
    description: "See how Hostquill supports conferences, meetups, campus events, church events, festivals, workshops, and business gatherings.",
  },
  "/compare": {
    title: "Hostquill Comparisons",
    description: "Compare Hostquill with other event platforms for event creation, ticketing, registrations, attendee management, and analytics.",
  },
  "/blog": {
    title: "Hostquill Event Guides",
    description: "Read practical Hostquill guides about event planning, selling tickets, event marketing, attendee management, and check-ins.",
  },
};

function canonicalFor(path = "/") {
  const cleanPath = path === "/" ? "" : path.replace(/\/$/, "");
  return `${SITE_URL}${cleanPath || "/"}`;
}

function setMeta(selector: string, create: () => HTMLMetaElement, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = create();
    document.head.appendChild(element);
  }
  element.setAttribute("content", content);
}

function setCanonical(href: string) {
  let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!link) {
    link = document.createElement("link");
    link.setAttribute("rel", "canonical");
    document.head.appendChild(link);
  }
  link.setAttribute("href", href);
}

function setJsonLd(jsonLd?: SeoInput["jsonLd"]) {
  const id = "hostquill-json-ld";
  document.getElementById(id)?.remove();
  if (!jsonLd) return;
  const script = document.createElement("script");
  script.id = id;
  script.type = "application/ld+json";
  script.text = JSON.stringify(jsonLd);
  document.head.appendChild(script);
}

export function applySeo(input: SeoInput) {
  const path = input.path || window.location.pathname;
  const canonical = canonicalFor(path);
  const image = input.image || DEFAULT_OG_IMAGE;
  const type = input.type || "website";

  document.title = input.title;
  setMeta('meta[name="description"]', () => {
    const meta = document.createElement("meta");
    meta.setAttribute("name", "description");
    return meta;
  }, input.description);
  setCanonical(canonical);

  setMeta('meta[property="og:title"]', () => {
    const meta = document.createElement("meta");
    meta.setAttribute("property", "og:title");
    return meta;
  }, input.title);
  setMeta('meta[property="og:description"]', () => {
    const meta = document.createElement("meta");
    meta.setAttribute("property", "og:description");
    return meta;
  }, input.description);
  setMeta('meta[property="og:url"]', () => {
    const meta = document.createElement("meta");
    meta.setAttribute("property", "og:url");
    return meta;
  }, canonical);
  setMeta('meta[property="og:type"]', () => {
    const meta = document.createElement("meta");
    meta.setAttribute("property", "og:type");
    return meta;
  }, type);
  setMeta('meta[property="og:image"]', () => {
    const meta = document.createElement("meta");
    meta.setAttribute("property", "og:image");
    return meta;
  }, image);
  setMeta('meta[name="twitter:card"]', () => {
    const meta = document.createElement("meta");
    meta.setAttribute("name", "twitter:card");
    return meta;
  }, "summary_large_image");
  setMeta('meta[name="twitter:title"]', () => {
    const meta = document.createElement("meta");
    meta.setAttribute("name", "twitter:title");
    return meta;
  }, input.title);
  setMeta('meta[name="twitter:description"]', () => {
    const meta = document.createElement("meta");
    meta.setAttribute("name", "twitter:description");
    return meta;
  }, input.description);
  setMeta('meta[name="twitter:image"]', () => {
    const meta = document.createElement("meta");
    meta.setAttribute("name", "twitter:image");
    return meta;
  }, image);
  setJsonLd(input.jsonLd);
}

function metadataForPath(pathname: string): SeoInput {
  if (routeSeo[pathname]) return { ...routeSeo[pathname], path: pathname };

  if (pathname.startsWith("/events/city/")) {
    const city = titleize(pathname.split("/").pop() || "city");
    return {
      title: `${city} Events on Hostquill`,
      description: `Discover ${city} events on Hostquill, including meetups, conferences, workshops, festivals, community gatherings, and online programs.`,
      path: pathname,
    };
  }

  if (pathname.startsWith("/events/category/")) {
    const category = titleize(pathname.split("/").pop() || "events");
    return {
      title: `${category} Events on Hostquill`,
      description: `Find ${category.toLowerCase()} events on Hostquill and explore organizers, calendars, registrations, tickets, and event details.`,
      path: pathname,
    };
  }

  if (pathname.startsWith("/register/")) {
    return {
      title: "Register for an Event",
      description: "Register for an event hosted on Hostquill and save the event to your calendar after completing your RSVP.",
      path: pathname,
    };
  }

  if (pathname.startsWith("/events/")) {
    return {
      title: "Event Details on Hostquill",
      description: "View event details, organizer information, location, schedule, registration options, and related events on Hostquill.",
      path: pathname,
    };
  }

  if (pathname.startsWith("/company/")) {
    return {
      title: "Organizer Profile on Hostquill",
      description: "View an organizer profile on Hostquill, including public company details, event calendars, and upcoming hosted events.",
      path: pathname,
    };
  }

  return {
    title: "Hostquill",
    description: "Hostquill helps organizers create, manage, promote, and analyze events from one event hosting platform.",
    path: pathname,
  };
}

function titleize(slug: string) {
  return slug
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function SeoManager() {
  const location = useLocation();

  useEffect(() => {
    const organization = {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
      logo: `${SITE_URL}/logo-glyph.png`,
      sameAs: [
        "https://twitter.com/hostquill",
        "https://linkedin.com/company/hostquill",
      ],
    };
    const website = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: SITE_NAME,
      url: SITE_URL,
      potentialAction: {
        "@type": "SearchAction",
        target: `${SITE_URL}/events?search={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    };

    const meta = metadataForPath(location.pathname);
    applySeo({
      ...meta,
      jsonLd: location.pathname === "/" ? [organization, website] : meta.jsonLd,
    });
  }, [location.pathname]);

  return null;
}

export function eventToJsonLd(event: Event, path: string) {
  const isOnline = event.location_type === "virtual";
  const price = event.ticket_price ?? 0;
  const address = event.location_value || "Online";

  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.name,
    description: event.description || `${event.name} is hosted on Hostquill.`,
    startDate: event.event_date || undefined,
    endDate: event.event_end_date || undefined,
    eventAttendanceMode: isOnline
      ? "https://schema.org/OnlineEventAttendanceMode"
      : event.location_type === "hybrid"
        ? "https://schema.org/MixedEventAttendanceMode"
        : "https://schema.org/OfflineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    image: event.background_image_url ? [event.background_image_url] : [DEFAULT_OG_IMAGE],
    url: canonicalFor(path),
    location: isOnline
      ? {
          "@type": "VirtualLocation",
          url: event.location_value || canonicalFor(path),
        }
      : {
          "@type": "Place",
          name: address,
          address: {
            "@type": "PostalAddress",
            streetAddress: address,
          },
        },
    offers: {
      "@type": "Offer",
      price: String(price),
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: canonicalFor(path),
    },
    organizer: {
      "@type": "Organization",
      name: "Hostquill organizer",
      url: SITE_URL,
    },
  };
}

export function faqJsonLd(items: Array<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}
