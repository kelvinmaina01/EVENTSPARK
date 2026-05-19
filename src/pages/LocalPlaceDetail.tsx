import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { 
  MapPin, 
  Calendar, 
  Users, 
  Share2, 
  Heart, 
  ArrowLeft, 
  Globe, 
  Mail, 
  Clock, 
  Plus, 
  ArrowRight,
  Sparkles,
  Building,
  Building2,
  Compass,
  School,
  Mountain,
  Trees,
  Milestone,
  Bell,
  Waves
} from "lucide-react";
import { format } from "date-fns";
import PublicHeader from "@/components/PublicHeader";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { CITIES_BY_CONTINENT, fetchLocalEventsByCity, getCityTheme, MockEvent } from "@/lib/mockEvents";

const cityIconMap: Record<string, any> = {
  Building, Building2, Compass, School, Mountain, Trees, Milestone, Sparkles, Bell, Waves, Globe
};

// Colors matching discover city icons
const colors: Record<string, { bg: string; border: string; text: string; fill: string }> = {
  blue: { bg: "bg-[#0b1f3c]", border: "border-blue-500/25", text: "text-[#3b82f6]", fill: "#3b82f6" },
  yellow: { bg: "bg-[#332200]", border: "border-amber-500/25", text: "text-[#eab308]", fill: "#eab308" },
  orange: { bg: "bg-[#2d1702]", border: "border-orange-500/25", text: "text-[#f97316]", fill: "#f97316" },
  teal: { bg: "bg-[#002b2b]", border: "border-teal-500/25", text: "text-[#14b8a6]", fill: "#14b8a6" },
  pink: { bg: "bg-[#2d0c1c]", border: "border-pink-500/25", text: "text-[#ec4899]", fill: "#ec4899" },
  beige: { bg: "bg-[#272314]", border: "border-yellow-700/25", text: "text-[#d97706]", fill: "#d97706" },
  brown: { bg: "bg-[#1f1915]", border: "border-stone-700/25", text: "text-[#b45309]", fill: "#b45309" },
  green: { bg: "bg-[#0d2a13]", border: "border-emerald-500/25", text: "text-[#10b981]", fill: "#10b981" },
  purple: { bg: "bg-[#200d3a]", border: "border-purple-500/25", text: "text-[#a855f7]", fill: "#a855f7" },
  grey: { bg: "bg-[#252528]", border: "border-zinc-700/25", text: "text-[#a1a1aa]", fill: "#a1a1aa" }
};

export default function LocalPlaceDetail() {
  const { citySlug } = useParams();
  const navigate = useNavigate();
  const [cityName, setCityName] = useState<string>("");
  const [cityObj, setCityObj] = useState<any>(null);
  const [events, setEvents] = useState<MockEvent[]>([]);
  const [popularEvents, setPopularEvents] = useState<MockEvent[]>([]);
  const [timelineEvents, setTimelineEvents] = useState<MockEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [localTime, setLocalTime] = useState("");
  const [likedEvents, setLikedEvents] = useState<Record<string, boolean>>({});

  // 1. Resolve city name from slug
  useEffect(() => {
    let resolvedName = "";
    let foundCity: any = null;

    Object.entries(CITIES_BY_CONTINENT).forEach(([continent, cities]) => {
      cities.forEach((c) => {
        const slug = c.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        if (slug === citySlug) {
          resolvedName = c.name;
          foundCity = c;
        }
      });
    });

    if (!resolvedName && citySlug) {
      // Fallback: capitalize words
      resolvedName = citySlug
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
    }

    setCityName(resolvedName);
    setCityObj(foundCity);
  }, [citySlug]);

  // 2. Fetch events in city
  useEffect(() => {
    if (!cityName) return;
    setLoading(true);
    fetchLocalEventsByCity(cityName).then((data) => {
      setEvents(data);
      // First 2 sorted by attendee count as popular
      const sorted = [...data].sort((a, b) => b.attendees - a.attendees);
      setPopularEvents(sorted.slice(0, 2));
      // Rest sorted chronologically for timeline
      const chrono = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      setTimelineEvents(chrono);
      setLoading(false);
    });
  }, [cityName]);

  // 3. Dynamic Local Time Tracker
  useEffect(() => {
    if (!cityName) return;
    const theme = getCityTheme(cityName);
    
    const updateTime = () => {
      const utc = new Date().getTime() + new Date().getTimezoneOffset() * 60000;
      const nd = new Date(utc + 3600000 * theme.localTimeOffset);
      setLocalTime(format(nd, "h:mm a"));
    };

    updateTime();
    const interval = setInterval(updateTime, 60000); // update every minute
    return () => clearInterval(interval);
  }, [cityName]);

  // 4. Handle Subscription
  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubscribed(true);
      toast.success(`Subscribed! You will get community alerts for ${cityName}! 🎉`);
      setEmail("");
    }, 800);
  };

  const toggleLike = (id: string, eventName: string) => {
    setLikedEvents(prev => {
      const next = { ...prev, [id]: !prev[id] };
      if (next[id]) {
        toast.success(`Saved "${eventName}" to your likes!`);
      }
      return next;
    });
  };

  if (loading && !cityName) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <PublicHeader />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      </div>
    );
  }

  const theme = getCityTheme(cityName);
  const IconComponent = cityObj ? (cityIconMap[cityObj.iconName] || Globe) : Globe;
  const cityColor = cityObj ? (colors[cityObj.color] || colors.grey) : colors.grey;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PublicHeader />

      {/* Hero Banner Section */}
      <div className="relative w-full h-[280px] sm:h-[350px] overflow-hidden bg-zinc-950">
        <img 
          src={theme.heroImage} 
          alt={cityName} 
          className="w-full h-full object-cover opacity-60 scale-105 blur-[2px]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-black/35" />
        
        {/* Banner Content Container */}
        <div className="absolute inset-0 max-w-6xl w-full mx-auto px-4 sm:px-6 flex flex-col justify-end pb-8 sm:pb-12">
          <Button 
            onClick={() => navigate(-1)} 
            variant="ghost" 
            size="sm" 
            className="w-fit mb-4 sm:mb-6 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/10 backdrop-blur-md shadow-sm gap-1.5 px-3.5 h-8 text-xs font-semibold"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Discover
          </Button>

          <div className="space-y-2.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white text-[11px] font-semibold tracking-wider uppercase backdrop-blur-md shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Local Hotspot
            </div>
            
            <h1 className="text-3xl sm:text-5xl font-display font-extrabold text-white tracking-tight drop-shadow-md leading-none">
              What's Happening in {cityName}
            </h1>

            {localTime && (
              <p className="text-xs sm:text-sm text-zinc-200 flex items-center gap-1.5 drop-shadow-sm font-medium">
                <Clock className="w-4 h-4 text-zinc-300" /> 
                <span>{localTime} {theme.timezone}</span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area: 2-Column Grid */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-12">
        <div className="grid lg:grid-cols-[1fr,340px] gap-10 sm:gap-12">
          
          {/* Column 1: Main Timeline and Popular Grid */}
          <div className="space-y-12">
            
            {/* Popular Section */}
            {popularEvents.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <Badge className="bg-primary/10 hover:bg-primary/10 text-primary border-primary/20 text-[10px] uppercase font-bold tracking-wider rounded-md">
                    Featured
                  </Badge>
                  <h2 className="text-lg sm:text-xl font-display font-bold tracking-tight">
                    Popular in {cityName}
                  </h2>
                </div>

                <div className="grid sm:grid-cols-2 gap-5">
                  {popularEvents.map((ev) => (
                    <div 
                      key={ev.id} 
                      className="group flex flex-col bg-card border border-border/40 rounded-3xl overflow-hidden hover:shadow-md hover:border-border transition-all duration-300 relative"
                    >
                      <div className="aspect-[16/10] overflow-hidden relative">
                        <img 
                          src={ev.cover} 
                          alt={ev.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                        />
                        <div className="absolute top-3 left-3">
                          <span className="inline-flex items-center text-[9px] font-extrabold uppercase bg-primary text-primary-foreground px-2 py-0.5 rounded-md shadow-sm tracking-wider">
                            🔥 Highly Popular
                          </span>
                        </div>
                        <button 
                          onClick={() => toggleLike(ev.id, ev.title)}
                          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/45 hover:bg-black/60 text-white backdrop-blur-sm grid place-items-center transition-colors"
                        >
                          <Heart className={`w-4 h-4 ${likedEvents[ev.id] ? "fill-red-500 stroke-red-500" : ""}`} />
                        </button>
                      </div>
                      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                        <div className="space-y-1.5">
                          <p className="text-xs text-primary font-semibold uppercase tracking-wide">
                            {format(new Date(ev.date), "EEE, MMM d · h:mm a")}
                          </p>
                          <h3 className="font-display font-bold text-[15px] sm:text-base leading-snug group-hover:text-primary transition-colors line-clamp-2">
                            <Link to={`/events/${ev.slug}`}>{ev.title}</Link>
                          </h3>
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border/30 pt-3 shrink-0">
                          <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-zinc-500" /> {ev.location.split(",")[0]}</span>
                          <span className="flex items-center gap-1 font-medium text-foreground"><Users className="w-3.5 h-3.5 text-primary" /> {ev.attendees} RSVP</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Dotted Timeline Section */}
            <div>
              <h2 className="text-lg sm:text-xl font-display font-bold tracking-tight mb-8">
                Timeline Schedule
              </h2>

              {timelineEvents.length === 0 ? (
                <div className="text-center py-12 rounded-2xl bg-card border border-dashed border-border/40 text-muted-foreground">
                  No upcoming timeline events listed.
                </div>
              ) : (
                <div className="relative pl-6 sm:pl-8 space-y-8">
                  {/* Timeline Guideline Line */}
                  <div className="absolute left-1.5 sm:left-2 top-2 bottom-2 w-0.5 border-l border-dashed border-border/60 -z-10" />

                  {timelineEvents.map((ev, index) => {
                    const evDate = new Date(ev.date);
                    const dateHeader = format(evDate, "MMM d EEEE");
                    
                    return (
                      <div key={ev.id} className="relative group space-y-3">
                        {/* Timeline Connector Bullet */}
                        <div className="absolute -left-6 sm:-left-8 top-1.5 w-3 h-3 rounded-full border-2 border-background bg-zinc-300 group-hover:bg-primary transition-colors" />

                        {/* Timeline Date Label */}
                        <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider pl-1 select-none">
                          {dateHeader}
                        </div>

                        {/* Event Content Row */}
                        <div className="bg-card border border-border/30 rounded-3xl p-5 sm:p-6 hover:shadow-sm hover:border-border transition-all duration-300 relative">
                          <div className="flex flex-col sm:flex-row justify-between gap-5">
                            
                            {/* Left: Metadata and Details */}
                            <div className="flex-1 space-y-3.5 min-w-0">
                              <div className="space-y-1">
                                <span className="text-xs text-primary font-bold tracking-wider uppercase">
                                  {format(evDate, "h:mm a")}
                                </span>
                                <h3 className="font-display font-bold text-base sm:text-lg group-hover:text-primary transition-colors line-clamp-1 leading-snug">
                                  <Link to={`/events/${ev.slug}`}>{ev.title}</Link>
                                </h3>
                              </div>

                              {/* Host Line */}
                              {ev.hosts && ev.hosts[0] && (
                                <div className="flex items-center gap-2">
                                  <img 
                                    src={ev.hosts[0].avatar} 
                                    alt={ev.hosts[0].name} 
                                    className="w-5 h-5 rounded-full object-cover bg-muted shrink-0" 
                                  />
                                  <span className="text-xs text-muted-foreground">
                                    By <span className="font-medium text-foreground">{ev.hosts[0].name}</span>
                                  </span>
                                </div>
                              )}

                              {/* Footer details row */}
                              <div className="flex flex-wrap items-center gap-x-4 gap-y-2.5 text-xs text-muted-foreground pt-1.5 border-t border-border/20">
                                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-zinc-500 shrink-0" /> {ev.location}</span>
                                <span className="flex items-center gap-1 font-medium text-foreground"><Users className="w-3.5 h-3.5 text-primary shrink-0" /> {ev.attendees} RSVP</span>
                              </div>
                            </div>

                            {/* Right: Cover Thumbnail */}
                            <div className="w-full sm:w-28 h-20 rounded-2xl overflow-hidden shrink-0 bg-muted border border-border/30 relative">
                              <img 
                                src={ev.cover} 
                                alt={ev.title} 
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            </div>

                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>

          {/* Column 2: Sidebar Profile, Subscription and Mock Maps */}
          <div className="space-y-8 lg:sticky lg:top-8 self-start">
            
            {/* City Card Profile */}
            <div className="bg-card border border-border/50 rounded-3xl p-6 sm:p-7 shadow-sm text-center sm:text-left space-y-6">
              
              <div className="flex flex-col sm:flex-row items-center gap-4 border-b border-border/30 pb-5">
                {/* HSL Iconic representation */}
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border shrink-0 bg-gradient-to-br ${cityColor.bg} ${cityColor.border} shadow-inner`}>
                  <IconComponent className={`w-6 h-6 ${cityColor.text}`} strokeWidth={2} />
                </div>
                <div>
                  <h3 className="font-display font-extrabold text-xl leading-none mb-1">
                    {cityName}
                  </h3>
                  <p className="text-xs text-primary font-bold tracking-wider uppercase">
                    {theme.timezone} Locale
                  </p>
                </div>
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed">
                {theme.longDescription}
              </p>

              {/* Glassmorphic Subscription Pill Form */}
              <form onSubmit={handleSubscribe} className="space-y-3 pt-2">
                <p className="text-xs text-foreground font-semibold uppercase tracking-wider pl-1">
                  Get Local Alerts
                </p>
                <div className="relative flex items-center bg-muted/50 rounded-2xl border border-border/40 p-1 group focus-within:border-primary/40 focus-within:ring-1 focus-within:ring-primary/25 transition-all">
                  <Mail className="w-4 h-4 text-muted-foreground ml-3 shrink-0" />
                  <Input 
                    type="email" 
                    placeholder="me@email.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isSubscribed || isSubmitting}
                    className="border-none bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 text-sm h-9 px-2"
                  />
                  <Button 
                    type="submit" 
                    disabled={isSubscribed || isSubmitting}
                    className={`rounded-xl h-9 px-4 text-xs font-semibold shrink-0 transition-all ${
                      isSubscribed ? "bg-emerald-500 text-white" : "bg-zinc-800 text-white hover:bg-zinc-700"
                    }`}
                  >
                    {isSubmitting ? "..." : isSubscribed ? "Active" : "Subscribe"}
                  </Button>
                </div>
              </form>

            </div>

            {/* Custom SVG Maps Graphic Mockup */}
            <div className="bg-card border border-border/50 rounded-3xl p-6 sm:p-7 shadow-sm space-y-4 relative overflow-hidden">
              <h4 className="font-display font-bold text-sm tracking-tight text-foreground select-none">
                Interactive Local Map
              </h4>

              {/* Stylized custom SVG map visualization */}
              <div className="w-full aspect-square rounded-2xl bg-[#eff3f6] dark:bg-[#1a1e22] relative overflow-hidden border border-border/30 shadow-inner">
                {/* SVG Paths representing water body, land grids, routes */}
                <svg viewBox="0 0 200 200" className="absolute inset-0 w-full h-full select-none">
                  {/* Grid Lines */}
                  <g stroke="currentColor" strokeOpacity="0.08" strokeWidth="0.5" strokeDasharray="3 3">
                    <line x1="0" y1="40" x2="200" y2="40" />
                    <line x1="0" y1="80" x2="200" y2="80" />
                    <line x1="0" y1="120" x2="200" y2="120" />
                    <line x1="0" y1="160" x2="200" y2="160" />
                    <line x1="40" y1="0" x2="40" y2="200" />
                    <line x1="80" y1="0" x2="80" y2="200" />
                    <line x1="120" y1="0" x2="120" y2="200" />
                    <line x1="160" y1="0" x2="160" y2="200" />
                  </g>

                  {/* Ocean Body for Coastal Cities (e.g. Cape Town / San Francisco) */}
                  {(cityName.includes("Cape") || cityName.includes("San") || cityName.includes("Sydney")) && (
                    <path d="M 0 0 Q 80 40 120 0 Z" fill={cityColor.fill} fillOpacity="0.07" />
                  )}

                  {/* Route Paths */}
                  <path d="M 20 180 Q 90 120 180 160" fill="none" stroke="currentColor" strokeOpacity="0.12" strokeWidth="2.5" />
                  <path d="M 80 20 Q 120 100 110 200" fill="none" stroke="currentColor" strokeOpacity="0.12" strokeWidth="2.5" />

                  {/* Concentric scan lines around location pointer */}
                  <circle cx="100" cy="100" r="25" fill="none" stroke={cityColor.fill} strokeOpacity="0.1" strokeWidth="1" />
                  <circle cx="100" cy="100" r="50" fill="none" stroke={cityColor.fill} strokeOpacity="0.05" strokeWidth="1" />

                  {/* Landmark nodes */}
                  <circle cx="65" cy="130" r="3" fill="currentColor" fillOpacity="0.25" />
                  <circle cx="135" cy="85" r="3" fill="currentColor" fillOpacity="0.25" />

                  {/* Map Pointer pulsing background indicator */}
                  <circle cx="100" cy="100" r="10" fill={cityColor.fill} fillOpacity="0.15" className="animate-ping" style={{ transformOrigin: "center", animationDuration: "2.5s" }} />
                  <circle cx="100" cy="100" r="5" fill={cityColor.fill} className="shadow-lg" />
                </svg>

                {/* Styled CSS Floating Labels */}
                <div className="absolute top-24 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                  <span className="px-2.5 py-1 rounded-lg bg-background/95 border border-border/80 text-[10px] font-bold shadow-md tracking-wide text-foreground">
                    {cityName}
                  </span>
                  <span className="text-[8px] text-muted-foreground uppercase font-bold tracking-widest mt-1 bg-background/40 backdrop-blur-[1px] px-1 rounded">
                    Central
                  </span>
                </div>

                {/* Suburbs floating labels depending on city */}
                {cityName.includes("Cape Town") ? (
                  <>
                    <span className="absolute text-[8px] text-muted-foreground/80 font-semibold left-6 bottom-14">Table Mountain</span>
                    <span className="absolute text-[8px] text-muted-foreground/80 font-semibold right-8 top-10">Table Bay</span>
                    <span className="absolute text-[8px] text-muted-foreground/80 font-semibold right-6 bottom-16">Athlone</span>
                  </>
                ) : cityName.includes("Nairobi") ? (
                  <>
                    <span className="absolute text-[8px] text-muted-foreground/80 font-semibold left-6 bottom-14">National Park</span>
                    <span className="absolute text-[8px] text-muted-foreground/80 font-semibold left-10 top-10">Westlands</span>
                    <span className="absolute text-[8px] text-muted-foreground/80 font-semibold right-6 bottom-16">Mombasa Rd</span>
                  </>
                ) : (
                  <>
                    <span className="absolute text-[8px] text-muted-foreground/80 font-semibold left-6 bottom-14">North District</span>
                    <span className="absolute text-[8px] text-muted-foreground/80 font-semibold right-8 top-10">Bay Side</span>
                    <span className="absolute text-[8px] text-muted-foreground/80 font-semibold right-6 bottom-16">East Suburbs</span>
                  </>
                )}
              </div>

              {/* Bottom tag indicator */}
              <div className="text-[10px] text-muted-foreground/60 text-center font-medium flex items-center justify-center gap-1 select-none">
                <Globe className="w-3 h-3" /> Live coordinates synced to database
              </div>

            </div>

          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
