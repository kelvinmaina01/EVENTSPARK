import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { 
  ArrowRight, 
  MapPin, 
  Calendar, 
  Users, 
  Plus,
  Monitor,
  Utensils,
  Brain,
  Palette,
  Globe,
  Dumbbell,
  Heart,
  Coins,
  Briefcase,
  BookOpen,
  Music,
  Trophy
} from "lucide-react";
import { format } from "date-fns";
import PublicHeader from "@/components/PublicHeader";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card as UICard, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { fetchDiscoverEvents, CATEGORIES, EXPANDED_CATEGORIES, FEATURED_CALENDARS, LOCAL_EVENTS, MockEvent } from "@/lib/mockEvents";

// Icon mapping for duotone style
const iconMap: Record<string, any> = {
  Monitor, Utensils, Brain, Palette, Globe, Dumbbell, Heart, Coins,
  Briefcase, BookOpen, Music, Trophy
};

// Duotone Icon Components for Bento Style
const DuotoneIcon = ({ iconName }: { iconName: string }) => {
  const Icon = iconMap[iconName];
  if (!Icon) return null;
  
  return (
    <div className="relative w-11 h-11 rounded-xl bg-muted grid place-items-center overflow-hidden">
      {/* Background icon with muted color */}
      <Icon className="absolute w-8 h-8 text-muted/30" strokeWidth={1.5} />
      {/* Foreground icon with primary color */}
      <Icon className="relative w-5 h-5 text-primary" strokeWidth={2} />
    </div>
  );
};

const EventCard = ({ ev }: { ev: MockEvent }) => (
  <Link to={`/events/${ev.slug}`} className="w-full group block">
    <div className="aspect-[4/3] rounded-xl overflow-hidden bg-muted mb-3">
      <img src={ev.cover} alt={ev.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
    </div>
    <p className="text-xs text-muted-foreground mb-1">{format(new Date(ev.date), "EEE, MMM d, h:mm a")}</p>
    <h3 className="font-display font-bold text-base leading-snug line-clamp-2 group-hover:text-primary transition-colors">{ev.title}</h3>
    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1"><MapPin className="w-3 h-3" />{ev.location}</p>
  </Link>
);

function Row({ title, subtitle, items, maxItems = 3 }: { title: string; subtitle?: string; items: MockEvent[]; maxItems?: number }) {
  const displayItems = items.slice(0, maxItems);
  
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayItems.map((ev) => <EventCard key={ev.id} ev={ev} />)}
      </div>
    </section>
  );
}

export default function Discover() {
  const { data: events = [] } = useQuery({ queryKey: ["discover"], queryFn: fetchDiscoverEvents });

  const popular  = events.slice(0, 3);
  const featured = events.filter((e) => e.featured).slice(0, 3);
  const tech     = events.filter((e) => e.category === "Tech" || e.category === "AI").slice(0, 3);

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

        {/* Featured Calendars */}
        <section className="mb-16">
          <h2 className="text-2xl sm:text-3xl font-display font-bold tracking-[-0.02em] mb-5">Featured Calendars</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURED_CALENDARS.map((calendar) => (
              <UICard key={calendar.name} className="group hover:shadow-lg transition-all duration-200 border-border/50">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-2xl">
                      {calendar.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-display font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                        {calendar.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                        {calendar.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          <span>{calendar.events} events</span>
                        </div>
                        <Button size="sm" className="h-8 px-4 text-xs">
                          <Plus className="w-3 h-3 mr-1" />
                          Subscribe
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </UICard>
            ))}
          </div>
        </section>

        {/* Browse by category */}
        <section className="mb-16">
          <h2 className="text-2xl sm:text-3xl font-display font-bold tracking-[-0.02em] mb-5">Browse by Category</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {EXPANDED_CATEGORIES.map((c) => (
              <button
                key={c.name}
                className="group flex items-center gap-3 p-4 rounded-2xl bg-card hover:bg-muted/40 transition-colors text-left"
              >
                <DuotoneIcon iconName={c.icon} />
                <div>
                  <p className="font-semibold text-sm group-hover:text-primary transition-colors">{c.name}</p>
                  <p className="text-xs text-muted-foreground">{c.count.toLocaleString()} events</p>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Local Events */}
        <section className="mb-16">
          <div className="flex items-end justify-between mb-5">
            <div>
              <h2 className="text-2xl sm:text-3xl font-display font-bold tracking-[-0.02em]">Local Events</h2>
              <p className="text-sm text-muted-foreground mt-0.5">Discover events happening near you</p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {['Today', 'Tomorrow', 'This Week', 'This Month'].map((filter) => (
              <button
                key={filter}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  filter === 'This Week' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted hover:bg-muted/70 text-muted-foreground'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* Horizontal scrollable events */}
          <div className="-mx-4 sm:-mx-6 px-4 sm:px-6 overflow-x-auto">
            <div className="flex gap-3 pb-2 min-w-max">
              {LOCAL_EVENTS.map((event) => (
                <div key={event.id} className="w-80 sm:w-96 flex-shrink-0">
                  <div className="bg-card border border-border/50 rounded-xl p-4 hover:shadow-md transition-all duration-200 group">
                    <div className="flex gap-3">
                      <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                        <img src={event.cover} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <Badge variant="secondary" className="text-xs">
                            {event.category}
                          </Badge>
                          <button className="text-muted-foreground hover:text-foreground transition-colors">
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        <h3 className="font-display font-semibold text-sm mb-2 group-hover:text-primary transition-colors line-clamp-2 leading-tight">
                          {event.title}
                        </h3>
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {format(new Date(event.date), "EEE, MMM d, h:mm a")}
                          </p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {event.location}
                          </p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {event.attendees} attending
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
