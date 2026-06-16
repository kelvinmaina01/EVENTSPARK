import { useState, useEffect } from "react";
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
  Trophy,
  Building,
  Building2,
  Compass,
  School,
  Mountain,
  Trees,
  Milestone,
  Sparkles,
  Bell,
  Waves
} from "lucide-react";
import { format } from "date-fns";
import PublicHeader from "@/components/PublicHeader";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card as UICard, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EXPANDED_CATEGORIES, FEATURED_CALENDARS, CITIES_BY_CONTINENT, MockEvent } from "@/lib/mockEvents";
import { fetchPublicDiscoverEvents, fetchPublicEventsByCity } from "@/lib/publicEvents";

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

const cityIconMap: Record<string, any> = {
  Building, Building2, Compass, School, Mountain, Trees, Milestone, Sparkles, Bell, Waves, Globe
};

const CityCircularIcon = ({ iconName, colorName }: { iconName: string; colorName: string }) => {
  const Icon = cityIconMap[iconName] || Globe;
  
  const colors: Record<string, { bg: string; text: string }> = {
    blue: { bg: "bg-[#0b1f3c] border-blue-500/20", text: "text-[#3b82f6]" },
    yellow: { bg: "bg-[#332200] border-amber-500/20", text: "text-[#eab308]" },
    orange: { bg: "bg-[#2d1702] border-orange-500/20", text: "text-[#f97316]" },
    teal: { bg: "bg-[#002b2b] border-teal-500/20", text: "text-[#14b8a6]" },
    pink: { bg: "bg-[#2d0c1c] border-pink-500/20", text: "text-[#ec4899]" },
    beige: { bg: "bg-[#272314] border-yellow-700/20", text: "text-[#d97706]" },
    brown: { bg: "bg-[#1f1915] border-stone-700/20", text: "text-[#b45309]" },
    green: { bg: "bg-[#0d2a13] border-emerald-500/20", text: "text-[#10b981]" },
    purple: { bg: "bg-[#200d3a] border-purple-500/20", text: "text-[#a855f7]" },
    grey: { bg: "bg-[#252528] border-zinc-700/20", text: "text-[#a1a1aa]" }
  };

  const selectedColor = colors[colorName] || colors.grey;

  return (
    <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${selectedColor.bg} shrink-0 shadow-sm transition-transform duration-200 group-hover:scale-105`}>
      <Icon className={`w-4 h-4 ${selectedColor.text}`} strokeWidth={2} />
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
  const { data: events = [] } = useQuery({ queryKey: ["public-discover"], queryFn: fetchPublicDiscoverEvents });

  const [activeContinent, setActiveContinent] = useState<string>("North America");
  const [activeCity, setActiveCity] = useState<string>("San Francisco");
  const [localEvents, setLocalEvents] = useState<MockEvent[]>([]);
  const [loadingEvents, setLoadingEvents] = useState<boolean>(false);

  useEffect(() => {
    let active = true;
    setLoadingEvents(true);
    fetchPublicEventsByCity(activeCity).then((events) => {
      if (active) {
        setLocalEvents(events);
        setLoadingEvents(false);
      }
    });
    return () => { active = false; };
  }, [activeCity]);

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
            {FEATURED_CALENDARS.slice(0, 3).map((calendar) => (
              <UICard 
                key={calendar.name} 
                className="group shadow-none rounded-2xl bg-card transition-all duration-200 cursor-pointer"
                style={{ border: "1.5px solid hsl(var(--primary))" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.border = "1.5px solid #19192E"; (e.currentTarget as HTMLElement).style.backgroundColor = "#19192E"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.border = "1.5px solid hsl(var(--primary))"; (e.currentTarget as HTMLElement).style.backgroundColor = ""; }}
              >
                <Link to={`/cal/${calendar.slug}`} className="block">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-2xl shrink-0">
                        {calendar.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-display font-semibold text-lg mb-2 group-hover:text-white transition-colors truncate">
                          {calendar.name}
                        </h3>
                        <p className="text-sm text-muted-foreground group-hover:text-zinc-300 mb-4 leading-relaxed line-clamp-2 transition-colors">
                          {calendar.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground group-hover:text-zinc-400 transition-colors">
                            <Calendar className="w-3 h-3" />
                            <span>{calendar.events} events</span>
                          </div>
                          <span className={`inline-flex items-center gap-1 h-8 px-4 rounded-md text-xs font-medium ${
                            calendar.subscribed 
                              ? "bg-muted text-muted-foreground group-hover:bg-white/10 group-hover:text-zinc-300" 
                              : "bg-primary text-primary-foreground"
                          } transition-colors`}>
                            {!calendar.subscribed && <Plus className="w-3 h-3" />}
                            {calendar.subscribed ? "Subscribed" : "Subscribe"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Link>
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

        {/* Explore Local Events */}
        <section className="mb-16 border-t border-border/30 pt-16">
          <h2 className="text-2xl sm:text-3xl font-display font-bold tracking-[-0.02em] mb-6">Explore Local Events</h2>

          {/* Continent Tabs */}
          <div className="flex gap-1.5 sm:gap-2 mb-8 border-b border-border/40 pb-3 overflow-x-auto scrollbar-none">
            {Object.keys(CITIES_BY_CONTINENT).map((continent) => {
              const isActive = activeContinent === continent;
              return (
                <button
                  key={continent}
                  onClick={() => {
                    setActiveContinent(continent);
                    const cities = CITIES_BY_CONTINENT[continent];
                    if (cities && cities.length > 0) {
                      setActiveCity(cities[0].name);
                    }
                  }}
                  className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                    isActive
                      ? "bg-zinc-800 text-white shadow-md border border-zinc-700/30"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                  }`}
                >
                  {continent}
                </button>
              );
            })}
          </div>

          {/* City Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-5 mb-12 animate-in fade-in duration-300">
            {(CITIES_BY_CONTINENT[activeContinent] || []).map((city) => {
              const isSelected = activeCity === city.name;
              return (
                <button
                  key={city.name}
                  onClick={() => setActiveCity(city.name)}
                  className={`flex items-center gap-3.5 p-2 rounded-2xl transition-all duration-200 text-left group w-full ${
                    isSelected
                      ? "bg-muted/65 ring-1 ring-zinc-700/35 shadow-sm border border-border/50"
                      : "hover:bg-muted/30 border border-transparent"
                  }`}
                >
                  <CityCircularIcon iconName={city.iconName} colorName={city.color} />
                  <div>
                    <p className="font-bold text-[15px] text-foreground group-hover:text-primary transition-colors leading-tight">
                      {city.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-none">
                      {city.eventsCount} Events
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Dynamic Local Events Display */}
          <div className="mt-16 pt-10 border-t border-border/30">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 px-1">
              <div>
                <h3 className="text-xl sm:text-2xl font-display font-bold tracking-[-0.015em]">
                  Upcoming Events in <span className="text-primary">{activeCity}</span>
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Discover interesting local meetups and gatherings happening near you
                </p>
              </div>
              <Button asChild variant="outline" className="rounded-full shadow-sm bg-card hover:bg-muted border-border shrink-0 self-start sm:self-auto">
                <Link to={`/local/${activeCity.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}>
                  View Full Events <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Link>
              </Button>
            </div>

            {loadingEvents ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="bg-card border border-border/30 rounded-2xl p-4 animate-pulse">
                    <div className="flex gap-4">
                      <div className="w-20 h-20 bg-muted rounded-xl shrink-0" />
                      <div className="flex-1 space-y-2 py-1">
                        <div className="h-4 bg-muted rounded-full w-1/3" />
                        <div className="h-5 bg-muted rounded-full w-4/5" />
                        <div className="h-3 bg-muted rounded-full w-2/3" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : localEvents.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground border border-dashed border-border/40 rounded-2xl bg-card/20">
                No upcoming events scheduled in {activeCity} at this moment. Check back later!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
                {localEvents.map((event) => (
                  <div 
                    key={event.id} 
                    className="bg-card border border-border/50 rounded-2xl p-4 hover:shadow-lg hover:border-primary/20 transition-all duration-200 group relative flex flex-col justify-between"
                  >
                    <div className="flex gap-4">
                      <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-muted">
                        <img 
                          src={event.cover} 
                          alt={event.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1.5">
                          <Badge variant="secondary" className="text-[10px] uppercase tracking-wider font-semibold">
                            {event.category}
                          </Badge>
                          <button className="text-muted-foreground hover:text-foreground transition-colors shrink-0">
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <h4 className="font-display font-semibold text-[15px] mb-2 group-hover:text-primary transition-colors line-clamp-2 leading-tight">
                          <Link to={`/events/${event.slug}`} className="hover:underline">
                            {event.title}
                          </Link>
                        </h4>
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                            {format(new Date(event.date), "EEE, MMM d, h:mm a")}
                          </p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1.5 truncate">
                            <MapPin className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                            {event.location}
                          </p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                            {event.attendees} going
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
