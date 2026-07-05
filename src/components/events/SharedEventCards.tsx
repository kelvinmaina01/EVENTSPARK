import { Link } from "react-router-dom";
import { format } from "date-fns";
import { MapPin, Users, CalendarDays } from "lucide-react";

export interface UnifiedEvent {
  id: string;
  title: string;
  date: string | null;
  location: string | null;
  cover: string | null;
  status: string;
  category: string | null;
  slug: string;
  attendees: number;
  hosts: Array<{ name: string; avatar: string }>;
  price?: number | null;
}

export const StatusBadge = ({ s }: { s: string }) => {
  const status = s.toLowerCase();
  if (status === "going") return <span className="inline-flex items-center text-[11px] font-semibold px-2.5 py-1 rounded-full bg-success text-success-foreground">Going</span>;
  if (status === "invited") return <span className="inline-flex items-center text-[11px] font-semibold px-2.5 py-1 rounded-full bg-primary text-primary-foreground">Invited</span>;
  if (status === "interested") return <span className="inline-flex items-center text-[11px] font-semibold px-2.5 py-1 rounded-full bg-warning text-warning-foreground">Interested</span>;
  if (status === "hosting") return <span className="inline-flex items-center text-[11px] font-semibold px-2.5 py-1 rounded-full bg-foreground text-background">Hosting</span>;
  if (status === "live") return <span className="inline-flex items-center text-[11px] font-semibold px-2.5 py-1 rounded-full bg-success text-success-foreground">Live</span>;
  if (status === "draft") return <span className="inline-flex items-center text-[11px] font-semibold px-2.5 py-1 rounded-full bg-muted text-muted-foreground">Draft</span>;
  if (status === "past") return <span className="inline-flex items-center text-[11px] font-semibold px-2.5 py-1 rounded-full bg-secondary/20 text-secondary">Past</span>;
  return <span className="inline-flex items-center text-[11px] font-semibold px-2.5 py-1 rounded-full bg-muted text-muted-foreground capitalize">{s}</span>;
};

// Extracted from Discover.tsx
export const EventCard = ({ ev }: { ev: UnifiedEvent }) => (
  <Link to={`/events/${ev.slug}`} className="w-full group block">
    <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-muted mb-3">
      {ev.cover ? (
        <img src={ev.cover} alt={ev.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <CalendarDays className="w-8 h-8 text-muted-foreground/30" />
        </div>
      )}
      {ev.price !== undefined && ev.price !== null && (
        <div className="absolute top-3 left-3">
          <span className="bg-card text-foreground text-xs font-semibold px-3 py-1 rounded-full shadow-sm">
            {ev.price > 0 ? `$${ev.price}` : "Free"}
          </span>
        </div>
      )}
    </div>
    <p className="text-xs text-muted-foreground mb-1">
      {ev.date ? format(new Date(ev.date), "EEE, MMM d, h:mm a") : "No date set"}
    </p>
    <h3 className="font-display font-bold text-base leading-snug line-clamp-2 group-hover:text-primary transition-colors">{ev.title}</h3>
    {ev.location && (
      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1"><MapPin className="w-3 h-3" />{ev.location}</p>
    )}
  </Link>
);

// Extracted from EventsList.tsx
export function EventRow({ ev }: { ev: UnifiedEvent }) {
  const time = ev.date ? format(new Date(ev.date), "h:mm a") : "TBD";
  return (
    <Link
      to={`/events/${ev.slug}`}
      className="group block bg-card hover:bg-muted/40 transition-colors rounded-2xl p-4 sm:p-5"
    >
      <div className="flex gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-muted-foreground mb-1.5">{time}</p>
          <h3 className="font-display font-bold text-lg sm:text-xl leading-snug group-hover:text-primary transition-colors line-clamp-2">{ev.title}</h3>

          {ev.hosts && ev.hosts.length > 0 && (
            <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
              <div className="flex -space-x-2">
                {ev.hosts.slice(0, 2).map((h, i) => (
                  <img key={i} src={h.avatar} alt={h.name} className="w-5 h-5 rounded-full ring-2 ring-card object-cover" />
                ))}
              </div>
              <span className="truncate">By {ev.hosts.map((h) => h.name).join(", ")}</span>
            </div>
          )}

          {ev.location && (
            <div className="mt-1.5 flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="w-3.5 h-3.5" />
              <span className="truncate">{ev.location}</span>
            </div>
          )}

          <div className="mt-3 flex items-center gap-2">
            <StatusBadge s={ev.status} />
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Users className="w-3 h-3" /> {ev.attendees.toLocaleString()}
            </div>
          </div>
        </div>

        <div className="w-24 sm:w-32 aspect-square rounded-xl overflow-hidden bg-muted shrink-0 relative">
          {ev.cover ? (
            <img src={ev.cover} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <CalendarDays className="w-8 h-8 text-muted-foreground/30" />
            </div>
          )}
          {ev.price !== undefined && ev.price !== null && (
            <div className="absolute top-2 left-2 sm:hidden">
              <span className="bg-card text-foreground text-[10px] font-semibold px-2 py-0.5 rounded-full shadow-sm">
                {ev.price > 0 ? `$${ev.price}` : "Free"}
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
