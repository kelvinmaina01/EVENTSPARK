import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import PublicHeader from "@/components/PublicHeader";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Icon } from "@iconify/react";
import { FEATURED_CALENDARS, MOCK_EVENTS, MockEvent } from "@/lib/mockEvents";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

type Tab = "my-calendars" | "subscribed" | "discover";

interface CalendarItem {
  name: string;
  icon: string;
  description: string;
  events: number;
}

export default function Calendars() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>("discover");
  const [subscribedList, setSubscribedList] = useState<CalendarItem[]>([]);
  const [myEvents, setMyEvents] = useState<MockEvent[]>([]);

  // Load subscriptions and personal events
  useEffect(() => {
    // Subscriptions
    const stored = localStorage.getItem("subscribed_calendars");
    if (stored) {
      try {
        setSubscribedList(JSON.parse(stored));
      } catch (e) {
        console.error(e);
      }
    } else {
      // Default initial subscription to make the page populated
      const defaultSub = [FEATURED_CALENDARS[0], FEATURED_CALENDARS[2]];
      localStorage.setItem("subscribed_calendars", JSON.stringify(defaultSub));
      setSubscribedList(defaultSub);
    }

    // Personal Calendar Events (where user is going or hosting)
    const personal = MOCK_EVENTS.filter(e => e.status === "going" || e.status === "hosting");
    setMyEvents(personal);
  }, []);

  const handleSubscribe = (cal: CalendarItem) => {
    const isAlreadySubbed = subscribedList.some(item => item.name === cal.name);
    let nextList: CalendarItem[];

    if (isAlreadySubbed) {
      nextList = subscribedList.filter(item => item.name !== cal.name);
      toast.success(`Unsubscribed from ${cal.name}`);
    } else {
      nextList = [...subscribedList, cal];
      toast.success(`Subscribed to ${cal.name}! 🎉`, {
        description: "You will receive notifications and updates for events in this calendar.",
      });
    }

    setSubscribedList(nextList);
    localStorage.setItem("subscribed_calendars", JSON.stringify(nextList));
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PublicHeader />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-10">
        {/* Page Title & Intro */}
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/5 text-primary text-xs font-semibold uppercase tracking-wider"
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
            Subscribe to your favorite communities, manage your personal schedule, and explore popular calendars across Kenya.
          </motion.p>
        </div>

        {/* Tab Toggle Switch (3 Toggle Buttons) */}
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

        {/* Tab Contents */}
        <div className="min-h-[300px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
            >
              {/* TAB 1: MY CALENDARS */}
              {activeTab === "my-calendars" && (
                <div>
                  {!user ? (
                    /* Guest View */
                    <div className="max-w-md mx-auto text-center p-8 rounded-3xl bg-card border border-border/50 shadow-[0_12px_40px_rgba(0,0,0,0.03)] space-y-6">
                      <div className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-3xl shadow-inner relative overflow-hidden border border-white/20">
                        <span className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 transform -skew-x-12" />
                        🔒
                      </div>
                      <div className="space-y-2">
                        <h3 className="font-display font-bold text-lg text-foreground">Sign In Required</h3>
                        <p className="text-sm text-muted-foreground">
                          Please sign in or create an account to view and manage your personal events calendar.
                        </p>
                      </div>
                      <Button asChild className="w-full rounded-full h-11">
                        <Link to="/auth">Sign In to Continue</Link>
                      </Button>
                    </div>
                  ) : (
                    /* Logged In View */
                    <div className="space-y-8">
                      {/* Personal Calendar Card */}
                      <div className="p-6 rounded-3xl bg-card border border-border/60 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/10 border border-white/20 text-2xl relative overflow-hidden">
                            <span className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/15 to-white/0 transform -skew-x-12" />
                            📅
                          </div>
                          <div>
                            <h3 className="font-display font-bold text-lg">{user.email?.split("@")[0]}'s Personal Calendar</h3>
                            <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
                              <Icon icon="fluent:calendar-empty-24-filled" className="w-3.5 h-3.5 text-primary" />
                              {myEvents.length} active events booked
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

                      {/* Personal Schedule List */}
                      <div>
                        <h3 className="font-display font-bold text-xl tracking-tight mb-5 flex items-center gap-2">
                          <Icon icon="fluent:clock-24-filled" className="w-5 h-5 text-indigo-500" />
                          Your Upcoming Schedule
                        </h3>

                        {myEvents.length === 0 ? (
                          <div className="text-center py-14 rounded-2xl bg-muted/30 border border-dashed border-border">
                            <Icon icon="fluent:calendar-empty-24-regular" className="w-12 h-12 mx-auto text-muted-foreground/60 mb-3" />
                            <p className="font-semibold text-foreground">No bookings found</p>
                            <p className="text-xs text-muted-foreground mt-1 mb-4">You have not registered for any upcoming events yet.</p>
                            <Button asChild size="sm" className="rounded-full">
                              <Link to="/discover">Discover Events</Link>
                            </Button>
                          </div>
                        ) : (
                          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {myEvents.map((ev) => (
                              <Link
                                key={ev.id}
                                to={`/events/${ev.slug}`}
                                className="group block bg-card border border-border/50 rounded-2xl overflow-hidden hover:shadow-md hover:border-border transition-all duration-300"
                              >
                                <div className="aspect-[16/10] overflow-hidden relative">
                                  <img src={ev.cover} alt={ev.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                  <div className="absolute top-3 right-3">
                                    <span className="inline-flex items-center text-[10px] font-bold px-2.5 py-1 rounded-full bg-success text-success-foreground shadow-sm">
                                      Going
                                    </span>
                                  </div>
                                </div>
                                <div className="p-4 space-y-2">
                                  <p className="text-xs text-primary font-semibold uppercase tracking-wide">
                                    {format(new Date(ev.date), "EEE, MMM d · h:mm a")}
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

              {/* TAB 2: SUBSCRIBED CALENDARS */}
              {activeTab === "subscribed" && (
                <div>
                  {subscribedList.length === 0 ? (
                    <div className="text-center py-20 max-w-md mx-auto">
                      <div className="w-16 h-16 mx-auto rounded-3xl bg-muted grid place-items-center text-2xl mb-4 shadow-inner">
                        ⭐
                      </div>
                      <h3 className="font-display font-bold text-xl mb-1.5">No Subscriptions</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                        You have not subscribed to any community calendars yet. Explore popular communities to stay in the loop!
                      </p>
                      <Button onClick={() => setActiveTab("discover")} className="rounded-full px-6">
                        Explore Discover Tab
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {subscribedList.map((cal) => (
                        <Card key={cal.name} className="group hover:shadow-lg transition-all duration-200 border-border/50 overflow-hidden">
                          <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                              {/* 3D Emoji Icon wrapper */}
                              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-500/10 flex items-center justify-center text-2xl border border-white/20 shadow-sm relative overflow-hidden">
                                <span className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 transform -skew-x-12" />
                                {cal.icon}
                              </div>
                              <div className="flex-1">
                                <h3 className="font-display font-semibold text-base mb-1.5 group-hover:text-primary transition-colors">
                                  {cal.name}
                                </h3>
                                <p className="text-xs text-muted-foreground mb-4 leading-relaxed line-clamp-2">
                                  {cal.description}
                                </p>
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                    <Icon icon="fluent:calendar-empty-24-filled" className="w-3.5 h-3.5 text-primary" />
                                    <span>{cal.events} events</span>
                                  </div>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-8 px-3 text-xs rounded-full border-border text-destructive hover:bg-destructive/5 hover:text-destructive"
                                    onClick={() => handleSubscribe(cal)}
                                  >
                                    <Icon icon="fluent:dismiss-24-filled" className="w-3 h-3 mr-1" />
                                    Unsubscribe
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: DISCOVER CALENDARS */}
              {activeTab === "discover" && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {FEATURED_CALENDARS.map((calendar) => {
                    const isSubbed = subscribedList.some(item => item.name === calendar.name);

                    return (
                      <Card key={calendar.name} className="group hover:shadow-lg hover:border-border/80 transition-all duration-300 border-border/50 overflow-hidden bg-card">
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            {/* 3D Gradient Icon Wrapper */}
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl border border-white/20 shadow-sm relative overflow-hidden shrink-0 bg-gradient-to-br ${
                              isSubbed ? "from-amber-500/20 to-amber-500/10" : "from-primary/20 to-primary/10"
                            }`}>
                              <span className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 transform -skew-x-12" />
                              {calendar.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-display font-semibold text-base mb-1.5 group-hover:text-primary transition-colors truncate">
                                {calendar.name}
                              </h3>
                              <p className="text-xs text-muted-foreground mb-4 leading-relaxed line-clamp-2 min-h-[32px]">
                                {calendar.description}
                              </p>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                  <Icon icon="fluent:calendar-empty-24-filled" className="w-3.5 h-3.5 text-primary" />
                                  <span>{calendar.events} events</span>
                                </div>
                                <Button
                                  size="sm"
                                  variant={isSubbed ? "outline" : "default"}
                                  className={`h-8 px-3.5 text-xs rounded-full transition-all duration-300 ${
                                    isSubbed 
                                      ? "border-amber-500/50 text-amber-600 bg-amber-500/5 hover:bg-amber-500/10" 
                                      : "shadow-sm"
                                  }`}
                                  onClick={() => handleSubscribe(calendar)}
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
                      </Card>
                    );
                  })}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <Footer />
    </div>
  );
}
