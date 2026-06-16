export type EventTemplateId = "minimal" | "split" | "stacked" | "landing" | "cards";

export type EventTemplateConfig = {
  id: EventTemplateId;
  name: string;
  description: string;
  image: {
    ratio: string;
    size: string;
    tip: string;
  };
  publicDetailVariant: "focused" | "split" | "hero";
};

export const EVENT_TEMPLATES: Record<EventTemplateId, EventTemplateConfig> = {
  minimal: {
    id: "minimal",
    name: "Minimal",
    description: "Clean single-column layout with your image as a top banner",
    image: {
      ratio: "16:9",
      size: "1920 x 1080px",
      tip: "A wide banner works best - it appears at the top of a single-column layout.",
    },
    publicDetailVariant: "focused",
  },
  split: {
    id: "split",
    name: "Split Screen",
    description: "Image on the left, registration form on the right",
    image: {
      ratio: "3:4 or 4:5",
      size: "1200 x 1600px",
      tip: "Portrait orientation works best when the image sits beside the event details.",
    },
    publicDetailVariant: "split",
  },
  stacked: {
    id: "stacked",
    name: "Stacked",
    description: "Large event artwork first, details and actions below",
    image: {
      ratio: "16:9",
      size: "1920 x 1080px",
      tip: "Use a clear banner or flyer that still reads well above the event details.",
    },
    publicDetailVariant: "hero",
  },
  landing: {
    id: "landing",
    name: "Landing Page",
    description: "Full-width hero image with registration emphasis",
    image: {
      ratio: "16:9",
      size: "1920 x 1080px",
      tip: "Full-width hero banner - use a high-impact photo or branded flyer.",
    },
    publicDetailVariant: "hero",
  },
  cards: {
    id: "cards",
    name: "Cards",
    description: "Compact editorial layout with details grouped into cards",
    image: {
      ratio: "21:9",
      size: "2100 x 900px",
      tip: "A wide image keeps the card layout balanced and easy to scan.",
    },
    publicDetailVariant: "focused",
  },
};

export const EVENT_TEMPLATE_OPTIONS = Object.values(EVENT_TEMPLATES);

export function getEventTemplate(template?: string | null) {
  return EVENT_TEMPLATES[(template || "split") as EventTemplateId] || EVENT_TEMPLATES.split;
}
