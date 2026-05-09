import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Plus, MapPin, Users, CalendarDays as CalIcon } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import PublicHeader from "@/components/PublicHeader";
import Footer from "@/components/layout/Footer";
import { fetchUpcomingEvents, fetchPastEvents, MockEvent } from "@/lib/mockEvents";

type Tab = "upcoming" | "past";

const StatusBadge = ({ s }: { s: MockEvent["status"] }) => {
  if (s === "going") return <span className="inline-flex items-center text-[11px] font-semibold px-2.5 py-1 rounded-full bg-success text-success-foreground">Going</span>;
  if (s === "invited") return <span className="inline-flex items-center text-[11px] font-semibold px-2.5 py-1 rounded-full bg-primary text-primary-foreground">Invited</span>;
  if (s === "interested") return <span className="inline-flex items-center text-[11px] font-semibold px-2.5 py-1 rounded-full bg-warning text-warning-foreground">Interested</span>;
  if (s === "hosting") return <span className="inline-flex items-center text-[11px] font-semibold px-2.5 py-1 rounded-full bg-foreground text-background">Hosting</span>;
  return null;
};

function EventRow({ ev }: { ev: MockEvent }) {
  const time = format(new Date(ev.date), "h:mm a");
  return (
    <Link
      to={`/events/${ev.slug}`}
      className="group block bg-card hover:bg-muted/40 transition-colors rounded-2xl p-4 sm:p-5"
    >
      <div className="flex gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-muted-foreground mb-1.5">{time}</p>
          <h3 className="font-display font-bold text-lg sm:text-xl leading-snug group-hover:text-primary transition-colors line-clamp-2">{ev.title}</h3>

          <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
            <div className="flex -space-x-2">
              {ev.hosts.slice(0, 2).map((h) => (
                <img key={h.name} src={h.avatar} alt={h.name} className="w-5 h-5 rounded-full ring-2 ring-card" />
              ))}
            </div>
            <span className="truncate">By {ev.hosts.map((h) => h.name).join(", ")}</span>
          </div>

          <div className="mt-1.5 flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="w-3.5 h-3.5" />
            <span className="truncate">{ev.location}</span>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <StatusBadge s={ev.status} />
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Users className="w-3 h-3" /> {ev.attendees.toLocaleString()}
            </div>
          </div>
        </div>

        <div className="w-24 sm:w-32 aspect-square rounded-xl overflow-hidden bg-muted shrink-0">
          <img src={ev.cover} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
        </div>
      </div>
    </Link>
  );
}

function DayGroup({ date, events }: { date: string; events: MockEvent[] }) {
  const d = new Date(date);
  const dayLabel = format(d, "MMM d");
  const weekday = format(d, "EEEE");
  return (
    <div className="grid grid-cols-[100px_1fr] sm:grid-cols-[140px_1fr] gap-4 sm:gap-6">
      <div className="pt-4 sticky top-16 self-start">
        <div className="flex items-start gap-2">
          <div className="w-2 h-2 rounded-full bg-muted-foreground/40 mt-2.5" />
          <div>
            <p className="font-display font-bold text-lg">{dayLabel}</p>
            <p className="text-sm text-muted-foreground">{weekday}</p>
          </div>
        </div>
      </div>
      <div className="space-y-3 border-l border-border pl-4 sm:pl-6">
        {events.map((ev) => <EventRow key={ev.id} ev={ev} />)}
      </div>
    </div>
  );
}

const EmptyState = ({ tab }: { tab: Tab }) => (
  <div className="text-center py-20">
    <div className="relative inline-block mb-6">
      <div className="w-24 h-24 rounded-2xl bg-muted grid place-items-center">
        <CalIcon className="w-10 h-10 text-muted-foreground/40" />
      </div>
      <span className="absolute -top-2 -right-2 w-9 h-9 rounded-full bg-foreground text-background text-sm font-bold grid place-items-center">0</span>
    </div>
    <h3 className="font-display font-bold text-2xl mb-2">No {tab === "upcoming" ? "Upcoming" : "Past"} Events</h3>
    <p className="text-muted-foreground mb-6">{tab === "upcoming" ? "You have no upcoming events. Why not host one?" : "You haven't attended any events yet."}</p>
    <Link to="/dashboard/events/create" className="inline-flex items-center gap-2 h-11 px-5 rounded-full bg-foreground text-background text-sm font-medium hover:bg-foreground/90">
      <Plus className="w-4 h-4" /> Create Event
    </Link>
  </div>
);

export default function EventsList() {
  const [tab, setTab] = useState<Tab>("upcoming");
  const { data: upcoming = [] } = useQuery({ queryKey: ["events-upcoming"], queryFn: fetchUpcomingEvents });
  const { data: past = [] } = useQuery({ queryKey: ["events-past"], queryFn: fetchPastEvents });

  const list = tab === "upcoming" ? upcoming : past;
  const grouped = useMemo(() => {
    const map: Record<string, MockEvent[]> = {};
    list.forEach((e) => {
      const k = format(new Date(e.date), "yyyy-MM-dd");
      (map[k] = map[k] || []).push(e);
    });
    return Object.entries(map);
  }, [list]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PublicHeader />
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between gap-4 mb-8">
          <h1 className="text-3xl sm:text-5xl font-display font-bold tracking-[-0.02em]">Events</h1>
          <div className="bg-muted rounded-full p-1 flex">
            {(["upcoming", "past"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-5 h-9 text-sm font-medium rounded-full transition-colors capitalize ${
                  tab === t ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {list.length === 0 ? (
          <EmptyState tab={tab} />
        ) : (
          <div className="space-y-8">
            {grouped.map(([date, evs]) => (
              <DayGroup key={date} date={date} events={evs} />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
