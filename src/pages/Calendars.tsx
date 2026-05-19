import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import PublicHeader from "@/components/PublicHeader";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Icon } from "@iconify/react";
import { FEATURED_CALENDARS, MockEvent } from "@/lib/mockEvents";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

type Tab = "my-calendars" | "subscribed" | "discover";

interface CalendarItem {
  id?: string;
  name: string;
  icon: string;
  description: string;
  events: number;
  slug?: string;
  isDb?: boolean;
}

export default function Calendars() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("discover");
  const [subscribedList, setSubscribedList] = useState<CalendarItem[]>([]);

  // 1. Fetch live events from Supabase to compute event counts
  const { data: dbEvents = [] } = useQuery({
    queryKey: ["calendars-db-events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("id, name, status, user_id, event_date, slug, location_value, background_image_url")
        .eq("status", "live");
      if (error) throw error;
      return data;
    }
  });

  // Calculate live event counts grouped by user_id
  const eventCountMap = useMemo(() => {
    const counts: Record<string, number> = {};
    dbEvents.forEach(e => {
      if (e.user_id) {
        counts[e.user_id] = (counts[e.user_id] || 0) + 1;
      }
    });
    return counts;
  }, [dbEvents]);

  // 2. Fetch actual profiles from Supabase to serve as real community calendars
  const { data: dbCompanies = [], isLoading: isLoadingProfiles } = useQuery({
    queryKey: ["calendars-db-companies"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, company, full_name, company_description, avatar_url, company_slug")
        .not("company_slug", "is", null);
      if (error) throw error;
      return data;
    }
  });

  // 3. Merge Supabase company profiles with mock calendars
  const calendarList = useMemo(() => {
    const list: CalendarItem[] = dbCompanies.map(c => ({
      id: c.id,
      name: c.company || c.full_name || "Unnamed Organization",
      icon: "🏢",
      description: c.company_description || "A community organizer hosting premium events on Events Spark.",
      events: eventCountMap[c.id] || 0,
      slug: c.company_slug || undefined,
      isDb: true
    }));

    // Filter mock featured calendars to avoid name collisions
    const mockItems = FEATURED_CALENDARS.filter(
      mock => !list.some(db => db.name.toLowerCase() === mock.name.toLowerCase())
    ).map(mock => ({
      ...mock,
      isDb: false
    }));

    return [...list, ...mockItems];
  }, [dbCompanies, eventCountMap]);

  // 4. Fetch registrations for the personal calendar (Attending)
  const { data: userRegistrations = [], isLoading: isLoadingRegistrations } = useQuery({
    queryKey: ["my-calendar-registrations", user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      const { data, error } = await supabase
        .from("registrations")
        .select("*, events(*)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user?.email
  });

  // Match attendee registrations in database via in-memory email check
  const bookedEvents = useMemo(() => {
    const userEmail = user?.email?.toLowerCase();
    if (!userEmail) return [];

    const booked: any[] = [];
    userRegistrations.forEach((reg: any) => {
      const regData = reg.data;
      if (!regData || typeof regData !== "object") return;

      const regEmail = (
        (regData as any).email ||
        (regData as any).Email ||
        (regData as any).emailAddress ||
        ""
      ).toString().toLowerCase();

      if (regEmail === userEmail && reg.events) {
        booked.push({
          id: reg.events.id,
          title: reg.events.name,
          date: reg.events.event_date,
          location: reg.events.location_value || "Virtual",
          cover: reg.events.background_image_url || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800",
          slug: reg.events.slug,
          isHost: false
        });
      }
    });

    return booked;
  }, [userRegistrations, user]);

  // 5. Fetch hosted events for the personal calendar
  const { data: hostedEvents = [], isLoading: isLoadingHosted } = useQuery({
    queryKey: ["my-calendar-hosted", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("user_id", user.id)
        .order("event_date", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id
  });

  const formattedHosted = useMemo(() => {
    return hostedEvents.map(e => ({
      id: e.id,
      title: e.name,
      date: e.event_date,
      location: e.location_value || "Virtual",
      cover: e.background_image_url || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800",
      slug: e.slug,
      isHost: true
    }));
  }, [hostedEvents]);

  // Combined personal agenda (hosted + booked) sorted chronologically
  const myAgenda = useMemo(() => {
    const combined = [...bookedEvents, ...formattedHosted];
    return combined.sort((a, b) => {
      const da = a.date ? new Date(a.date).getTime() : 0;
      const db = b.date ? new Date(b.date).getTime() : 0;
      return da - db;
    });
  }, [bookedEvents, formattedHosted]);

  // 6. Load and manage subscriptions
  useEffect(() => {
    const stored = localStorage.getItem("subscribed_calendars");
    if (stored) {
      try {
        setSubscribedList(JSON.parse(stored));
      } catch (e) {
        console.error(e);
      }
    } else {
      // Default subscriptions to make Subscribed tab active at first launch
      const defaultSub = [calendarList[0], calendarList[1]].filter(Boolean);
      localStorage.setItem("subscribed_calendars", JSON.stringify(defaultSub));
      setSubscribedList(defaultSub);
    }
  }, [calendarList]);

  const handleSubscribe = (cal: CalendarItem) => {
    const isAlreadySubbed = subscribedList.some(item => item.name === cal.name);
    let nextList: CalendarItem[];

    if (isAlreadySubbed) {
      nextList = subscribedList.filter(item => item.name !== cal.name);
      toast.success(`Unsubscribed from ${cal.name}`);
    } else {
      nextList = [...subscribedList, cal];
      toast.success(`Subscribed to ${cal.name}! 🎉`, {
        description: "You've successfully subscribed to notifications and live schedules for this community.",
      });
    }

    setSubscribedList(nextList);
    localStorage.setItem("subscribed_calendars", JSON.stringify(nextList));
  };

  const isPageLoading = isLoadingProfiles || (user && (isLoadingRegistrations || isLoadingHosted));

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PublicHeader />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-10">
        {/* Intro */}
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/5 text-primary text-xs font-semibold uppercase tracking-wider shadow-sm"
          >
            <Icon icon="fluent:calendar-sparkle-24-filled" className="w-3.5 h-3.5" />
            Events Spark Calendars
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl font-display font-extrabold tracking-tight"
          >
            Discover Community Calendars
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground text-sm sm:text-base leading-relaxed"
          >
            Stay synchronized with top developer clubs, design hubs, and corporate organizations in Kenya.
          </motion.p>
        </div>

        {/* Tab Controls (3 Toggles) */}
        <div className="flex justify-center mb-12">
          <div className="bg-muted/80 backdrop-blur-sm p-1.5 rounded-full flex gap-1 border border-border/40 shadow-inner">
            <button
              onClick={() => setActiveTab("my-calendars")}
              className={`px-5 py-2.5 rounded-full text-xs font-semibold transition-all duration-300 flex items-center gap-2 ${
                activeTab === "my-calendars"
                  ? "bg-background text-foreground shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-border/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
              }`}
            >
              <Icon icon="fluent:calendar-person-24-filled" className={`w-4 h-4 ${activeTab === "my-calendars" ? "text-primary" : ""}`} />
              My Calendar
            </button>
            <button
              onClick={() => setActiveTab("subscribed")}
              className={`px-5 py-2.5 rounded-full text-xs font-semibold transition-all duration-300 flex items-center gap-2 ${
                activeTab === "subscribed"
                  ? "bg-background text-foreground shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-border/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
              }`}
            >
              <Icon icon="fluent:calendar-star-24-filled" className={`w-4 h-4 ${activeTab === "subscribed" ? "text-amber-500" : ""}`} />
              Subscribed
              {subscribedList.length > 0 && (
                <span className="ml-0.5 px-1.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                  {subscribedList.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("discover")}
              className={`px-5 py-2.5 rounded-full text-xs font-semibold transition-all duration-300 flex items-center gap-2 ${
                activeTab === "discover"
                  ? "bg-background text-foreground shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-border/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
              }`}
            >
              <Icon icon="fluent:compass-24-filled" className={`w-4 h-4 ${activeTab === "discover" ? "text-blue-500" : ""}`} />
              Discover
            </button>
          </div>
        </div>

        {/* Dynamic Display Area */}
        <div className="min-h-[300px]">
          {isPageLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                Loading database schemas...
              </p>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
              >
                {/* TAB 1: MY CALENDARS */}
                {activeTab === "my-calendars" && (
                  <div>
                    {!user ? (
                      /* Guest Promo View */
                      <div className="max-w-md mx-auto text-center p-8 rounded-3xl bg-card border border-border/50 shadow-[0_12px_40px_rgba(0,0,0,0.03)] space-y-6">
                        <div className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-3xl shadow-inner border border-white/20 relative overflow-hidden">
                          <span className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 transform -skew-x-12" />
                          🔒
                        </div>
                        <div className="space-y-2">
                          <h3 className="font-display font-bold text-lg text-foreground">Sign In Required</h3>
                          <p className="text-sm text-muted-foreground">
                            Sign in to Events Spark to check your agenda, manage hosting schedules, and track RSVP bookings.
                          </p>
                        </div>
                        <Button asChild className="w-full rounded-full h-11 shadow-md">
                          <Link to="/auth">Sign In to Continue</Link>
                        </Button>
                      </div>
                    ) : (
                      /* Database schedules */
                      <div className="space-y-8">
                        {/* Personal profile status bar */}
                        <div className="p-6 rounded-3xl bg-card border border-border/60 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/10 border border-white/25 text-2xl relative overflow-hidden shrink-0">
                              <span className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/15 to-white/0 transform -skew-x-12" />
                              📅
                            </div>
                            <div>
                              <h3 className="font-display font-bold text-lg">
                                {user.email?.split("@")[0]}'s Personal Agenda
                              </h3>
                              <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5 font-medium">
                                <Icon icon="fluent:calendar-empty-24-filled" className="w-3.5 h-3.5 text-primary" />
                                {myAgenda.length} active database bookings & hosted events
                              </p>
                            </div>
                          </div>
                          <Button variant="outline" className="rounded-full h-10 border-border" asChild>
                            <Link to="/dashboard/calendar">
                              <Icon icon="fluent:settings-24-filled" className="w-4 h-4 mr-1.5 text-muted-foreground" />
                              Manage Dashboard
                            </Link>
                          </Button>
                        </div>

                        {/* List of active events */}
                        <div>
                          <h3 className="font-display font-bold text-xl tracking-tight mb-5 flex items-center gap-2">
                            <Icon icon="fluent:clock-24-filled" className="w-5 h-5 text-indigo-500" />
                            Your Active Live Events
                          </h3>

                          {myAgenda.length === 0 ? (
                            <div className="text-center py-14 rounded-2xl bg-muted/20 border border-dashed border-border/70">
                              <Icon icon="fluent:calendar-empty-24-regular" className="w-12 h-12 mx-auto text-muted-foreground/60 mb-3" />
                              <p className="font-semibold text-foreground">No active bookings or events found</p>
                              <p className="text-xs text-muted-foreground mt-1 mb-4">
                                You haven't created any events or registered for any RSVPs.
                              </p>
                              <Button asChild size="sm" className="rounded-full">
                                <Link to="/discover">Discover Events</Link>
                              </Button>
                            </div>
                          ) : (
                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                              {myAgenda.map((ev) => (
                                <Link
                                  key={ev.id}
                                  to={`/events/${ev.slug}`}
                                  className="group block bg-card border border-border/50 rounded-2xl overflow-hidden hover:shadow-md hover:border-border transition-all duration-300"
                                >
                                  <div className="aspect-[16/10] overflow-hidden relative">
                                    <img src={ev.cover} alt={ev.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    <div className="absolute top-3 right-3">
                                      <span className={`inline-flex items-center text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm ${
                                        ev.isHost 
                                          ? "bg-primary text-primary-foreground" 
                                          : "bg-success text-success-foreground"
                                      }`}>
                                        {ev.isHost ? "Hosting" : "Attending"}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="p-4 space-y-2">
                                    <p className="text-xs text-primary font-semibold uppercase tracking-wide">
                                      {ev.date 
                                        ? format(new Date(ev.date), "EEE, MMM d · h:mm a")
                                        : "TBD"}
                                    </p>
                                    <h4 className="font-display font-bold text-base leading-snug group-hover:text-primary transition-colors line-clamp-2">
                                      {ev.title}
                                    </h4>
                                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                                      <Icon icon="fluent:location-24-filled" className="w-3.5 h-3.5 text-muted-foreground/80" />
                                      {ev.location}
                                    </p>
                                  </div>
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 2: SUBSCRIBED */}
                {activeTab === "subscribed" && (
                  <div>
                    {subscribedList.length === 0 ? (
                      <div className="text-center py-20 max-w-md mx-auto">
                        <div className="w-16 h-16 mx-auto rounded-3xl bg-muted grid place-items-center text-2xl mb-4 shadow-inner">
                          ⭐
                        </div>
                        <h3 className="font-display font-bold text-xl mb-1.5">No Subscriptions</h3>
                        <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                          You haven't subscribed to any community calendars yet. Browse community calendars in discover to follow their schedules!
                        </p>
                        <Button onClick={() => setActiveTab("discover")} className="rounded-full px-6">
                          Explore Discover Tab
                        </Button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {subscribedList.map((cal) => {
                          const routePath = cal.slug ? (cal.isDb ? `/company/${cal.slug}` : `/cal/${cal.slug}`) : `/calendars`;
                          
                          return (
                            <Card 
                              key={cal.name} 
                              className="group shadow-none rounded-2xl bg-card transition-all duration-200 cursor-pointer"
                              style={{ border: "1.5px solid hsl(var(--primary))" }}
                              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.border = "1.5px solid #19192E"; (e.currentTarget as HTMLElement).style.backgroundColor = "#19192E"; }}
                              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.border = "1.5px solid hsl(var(--primary))"; (e.currentTarget as HTMLElement).style.backgroundColor = ""; }}
                            >
                              <Link to={routePath} className="block">
                                <CardContent className="p-6">
                                  <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-500/10 flex items-center justify-center text-2xl border border-white/20 shadow-sm relative overflow-hidden shrink-0">
                                      <span className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 transform -skew-x-12" />
                                      {cal.icon}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <h3 className="font-display font-semibold text-base mb-1.5 group-hover:text-white transition-colors truncate">
                                        {cal.name}
                                      </h3>
                                      <p className="text-xs text-muted-foreground group-hover:text-zinc-300 mb-4 leading-relaxed line-clamp-2 min-h-[32px] transition-colors">
                                        {cal.description}
                                      </p>
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground group-hover:text-zinc-400 transition-colors">
                                          <Icon icon="fluent:calendar-empty-24-filled" className="w-3.5 h-3.5 text-primary" />
                                          <span>{cal.events} events</span>
                                        </div>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          className="h-8 px-3.5 text-xs rounded-full transition-all duration-300 border-amber-500/50 text-amber-600 bg-amber-500/5 group-hover:bg-white/10 group-hover:text-zinc-300 group-hover:border-transparent"
                                          onClick={(e) => { e.preventDefault(); handleSubscribe(cal); }}
                                        >
                                          <Icon icon="fluent:dismiss-24-filled" className="w-3 h-3 mr-1" />
                                          Unsubscribe
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                </CardContent>
                              </Link>
                            </Card>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 3: DISCOVER (Real + Mock Data) */}
                {activeTab === "discover" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {calendarList.map((calendar) => {
                      const isSubbed = subscribedList.some(item => item.name === calendar.name);
                      const routePath = calendar.slug ? (calendar.isDb ? `/company/${calendar.slug}` : `/cal/${calendar.slug}`) : `/calendars`;

                      return (
                        <Card 
                          key={calendar.name} 
                          className="group shadow-none rounded-2xl bg-card transition-all duration-200 cursor-pointer"
                          style={{ border: "1.5px solid hsl(var(--primary))" }}
                          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.border = "1.5px solid #19192E"; (e.currentTarget as HTMLElement).style.backgroundColor = "#19192E"; }}
                          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.border = "1.5px solid hsl(var(--primary))"; (e.currentTarget as HTMLElement).style.backgroundColor = ""; }}
                        >
                          <Link to={routePath} className="block">
                            <CardContent className="p-6">
                              <div className="flex items-start gap-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl border border-white/20 shadow-sm relative overflow-hidden shrink-0 bg-gradient-to-br ${
                                  isSubbed ? "from-amber-500/20 to-amber-500/10" : "from-primary/20 to-primary/10"
                                }`}>
                                  <span className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 transform -skew-x-12" />
                                  {calendar.icon}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-display font-semibold text-base mb-1.5 group-hover:text-white transition-colors truncate">
                                    {calendar.name}
                                  </h3>
                                  <p className="text-xs text-muted-foreground group-hover:text-zinc-300 mb-4 leading-relaxed line-clamp-2 min-h-[32px] transition-colors">
                                    {calendar.description}
                                  </p>
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground group-hover:text-zinc-400 transition-colors">
                                      <Icon icon="fluent:calendar-empty-24-filled" className="w-3.5 h-3.5 text-primary" />
                                      <span>{calendar.events} events</span>
                                    </div>
                                    <Button
                                      size="sm"
                                      variant={isSubbed ? "outline" : "default"}
                                      className={`h-8 px-3.5 text-xs rounded-full transition-all duration-300 ${
                                        isSubbed 
                                          ? "border-amber-500/50 text-amber-600 bg-amber-500/5 group-hover:bg-white/10 group-hover:text-zinc-300 group-hover:border-transparent" 
                                          : "bg-[#19192E] text-white hover:bg-[#19192E]/90 group-hover:bg-primary group-hover:text-primary-foreground shadow-sm"
                                      }`}
                                      onClick={(e) => { e.preventDefault(); handleSubscribe(calendar); }}
                                    >
                                      {isSubbed ? (
                                        <>
                                          <Icon icon="fluent:checkmark-24-filled" className="w-3 h-3 mr-1" />
                                          Subscribed
                                        </>
                                      ) : (
                                        <>
                                          <Icon icon="fluent:add-24-filled" className="w-3 h-3 mr-1" />
                                          Subscribe
                                        </>
                                      )}
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Link>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
