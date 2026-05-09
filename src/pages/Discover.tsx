import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ArrowRight, MapPin } from "lucide-react";
import { format } from "date-fns";
import PublicHeader from "@/components/PublicHeader";
import Footer from "@/components/layout/Footer";
import { fetchDiscoverEvents, CATEGORIES, MockEvent } from "@/lib/mockEvents";

const Card = ({ ev }: { ev: MockEvent }) => (
  <Link to={`/events/${ev.slug}`} className="shrink-0 w-[260px] sm:w-[280px] group">
    <div className="aspect-[4/3] rounded-xl overflow-hidden bg-muted mb-3">
      <img src={ev.cover} alt={ev.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
    </div>
    <p className="text-xs text-muted-foreground mb-1">{format(new Date(ev.date), "EEE, MMM d, h:mm a")}</p>
    <h3 className="font-display font-bold text-base leading-snug line-clamp-2 group-hover:text-primary transition-colors">{ev.title}</h3>
    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1"><MapPin className="w-3 h-3" />{ev.location}</p>
  </Link>
);

function Row({ title, subtitle, items }: { title: string; subtitle?: string; items: MockEvent[] }) {
  return (
    <section className="mb-12">
      <div className="flex items-end justify-between mb-5 px-1">
        <div>
          <h2 className="text-2xl sm:text-3xl font-display font-bold tracking-[-0.02em]">{title}</h2>
          {subtitle && <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
        <button className="hidden sm:inline-flex items-center gap-1.5 h-9 px-4 rounded-full bg-muted hover:bg-muted/70 text-sm font-medium">
          View All <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="-mx-4 sm:-mx-6 px-4 sm:px-6 overflow-x-auto scrollbar-hide">
        <div className="flex gap-4 pb-2 min-w-max">
          {items.map((ev) => <Card key={ev.id} ev={ev} />)}
        </div>
      </div>
    </section>
  );
}

export default function Discover() {
  const { data: events = [] } = useQuery({ queryKey: ["discover"], queryFn: fetchDiscoverEvents });

  const popular  = events.slice(0, 6);
  const featured = events.filter((e) => e.featured);
  const tech     = events.filter((e) => e.category === "Tech" || e.category === "AI").slice(0, 6);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PublicHeader />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        <div className="mb-10">
          <h1 className="text-4xl sm:text-6xl font-display font-bold tracking-[-0.03em] mb-3">Discover Events</h1>
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl leading-relaxed">
            Explore popular events near you, browse by category, or check out some of the great community calendars.
          </p>
        </div>

        <Row title="Popular Events" subtitle="Nairobi" items={popular} />
        <Row title="Featured" subtitle="Hand-picked for this week" items={featured} />
        <Row title="Tech & AI" subtitle="Builders, hackers and engineers" items={tech} />

        {/* Browse by category */}
        <section className="mb-16">
          <h2 className="text-2xl sm:text-3xl font-display font-bold tracking-[-0.02em] mb-5">Browse by Category</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {CATEGORIES.map((c) => (
              <button
                key={c.name}
                className="group flex items-center gap-3 p-4 rounded-2xl bg-card hover:bg-muted/40 transition-colors text-left"
              >
                <div className="w-11 h-11 rounded-xl bg-muted grid place-items-center text-xl">{c.emoji}</div>
                <div>
                  <p className="font-semibold text-sm group-hover:text-primary transition-colors">{c.name}</p>
                  <p className="text-xs text-muted-foreground">{c.count.toLocaleString()} events</p>
                </div>
              </button>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
