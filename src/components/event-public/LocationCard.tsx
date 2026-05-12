import { MapPin, Globe, ExternalLink, Copy, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { GOOGLE_MAPS_API_KEY, JOIN_LINK_PLACEHOLDER } from "@/lib/mediaConstants";

interface Props {
  /** Venue name, e.g. "The Alchemist" */
  venue: string;
  /** Full address, e.g. "Westlands, Nairobi" */
  address?: string;
  /** "physical" | "virtual" | "hybrid" */
  mode?: "physical" | "virtual" | "hybrid";
  /** Optional join link for virtual / hybrid */
  joinLink?: string;
}

function MapEmbed({ query }: { query: string }) {
  const encoded = encodeURIComponent(query);
  const hasKey = GOOGLE_MAPS_API_KEY && GOOGLE_MAPS_API_KEY !== "YOUR_GOOGLE_MAPS_API_KEY";

  if (hasKey) {
    const src = `https://www.google.com/maps/embed/v1/place?key=${GOOGLE_MAPS_API_KEY}&q=${encoded}`;
    return (
      <iframe
        title="Map"
        src={src}
        loading="lazy"
        className="absolute inset-0 w-full h-full"
        style={{ border: 0 }}
      />
    );
  }

  // Stylish placeholder until the key is wired up
  return (
    <div className="absolute inset-0 bg-[linear-gradient(135deg,hsl(var(--muted))_0%,hsl(var(--background))_100%)]">
      {/* Faux grid */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(hsl(var(--border)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />
      {/* Faux roads */}
      <div className="absolute left-0 right-0 top-1/2 h-1.5 bg-background/80" />
      <div className="absolute top-0 bottom-0 left-1/3 w-1.5 bg-background/80" />
      {/* Pin */}
      <div className="absolute inset-0 grid place-items-center">
        <div className="relative">
          <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground grid place-items-center shadow-lg">
            <MapPin className="w-6 h-6" />
          </div>
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 bg-primary" />
          <div className="absolute -inset-3 rounded-full bg-primary/20 -z-10 animate-ping" />
        </div>
      </div>
    </div>
  );
}

export default function LocationCard({ venue, address, mode = "physical", joinLink }: Props) {
  const fullAddress = [venue, address].filter(Boolean).join(", ") || venue;
  const directionsHref = `https://maps.google.com/?q=${encodeURIComponent(fullAddress)}`;

  const physicalCard = (
    <div className="bg-card rounded-3xl overflow-hidden">
      <div className="relative w-full" style={{ height: 280 }}>
        <MapEmbed query={fullAddress} />
      </div>
      <div className="p-4 sm:p-5 flex items-start gap-4">
        <div className="w-11 h-11 rounded-xl bg-primary/10 grid place-items-center shrink-0">
          <MapPin className="w-5 h-5 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold truncate">{venue}</p>
          {address && <p className="text-sm text-muted-foreground truncate">{address}</p>}
        </div>
        <Button asChild size="sm" className="rounded-full shrink-0">
          <a href={directionsHref} target="_blank" rel="noreferrer">
            Get Directions <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
          </a>
        </Button>
      </div>
    </div>
  );

  const link = joinLink || JOIN_LINK_PLACEHOLDER;
  const virtualCard = (
    <div className="bg-card rounded-3xl p-5 flex items-start gap-4">
      <div className="w-11 h-11 rounded-xl bg-primary/10 grid place-items-center shrink-0">
        <Video className="w-5 h-5 text-primary" />
      </div>
      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-semibold">Online Event</p>
          <Badge variant="secondary" className="rounded-full text-[10px] uppercase tracking-wider">
            <Globe className="w-3 h-3 mr-1" /> Virtual
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground break-all">{link}</p>
        <div className="flex flex-wrap gap-2 pt-1">
          <Button asChild size="sm" className="rounded-full">
            <a href={link} target="_blank" rel="noreferrer">
              Join Event <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
            </a>
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="rounded-full"
            onClick={() => {
              navigator.clipboard.writeText(link);
              toast.success("Link copied");
            }}
          >
            <Copy className="w-3.5 h-3.5 mr-1.5" /> Copy
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <section className="space-y-3">
      <h2 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Location</h2>
      <div className="space-y-3">
        {(mode === "physical" || mode === "hybrid") && physicalCard}
        {(mode === "virtual" || mode === "hybrid") && virtualCard}
      </div>
    </section>
  );
}