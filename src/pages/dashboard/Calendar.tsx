import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  addDays, addMonths, eachDayOfInterval, endOfMonth, endOfWeek, format,
  isSameDay, isSameMonth, isToday, startOfMonth, startOfWeek, subMonths,
} from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft, ChevronRight, Plus, CalendarDays, Clock, Users,
  Eye, Pencil, QrCode, X, Mail, Users2, Share2, Sparkles, CalendarPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useProfile } from "@/hooks/useProfile";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { fetchUpcomingEvents, fetchPastEvents, MockEvent } from "@/lib/mockEvents";
import { CALENDAR_SYNC_ENDPOINT } from "@/lib/mediaConstants";

type View = "month" | "week" | "agenda";

const TIPS = [
  { icon: CalendarDays, title: "Welcome to eventspark Calendars", body: "Calendars let you easily share and manage your events. Every event on eventspark is part of a calendar — let's see how they work." },
  { icon: Users2, title: "Work with Your Team", body: "Easily add your teammates as calendar admins. They'll have manage access to events on the calendar." },
  { icon: Share2, title: "Share Your Calendar Page", body: "Customize and share your beautiful Calendar showcasing your upcoming events. Guests can browse your schedule and subscribe." },
  { icon: Mail, title: "Send Newsletters", body: "As guests subscribe to your Calendar, you can send them newsletters to keep them in the loop." },
  { icon: Sparkles, title: "Highlight Community Events", body: "Your Calendar can feature events from other Calendars. You can even include events hosted on other websites." },
];

export default function Calendar() {
  const navigate = useNavigate();
  const { data: profile } = useProfile();
  const [events, setEvents] = useState<MockEvent[]>([]);
  const [view, setView] = useState<View>("month");
  const [cursor, setCursor] = useState<Date>(new Date());
  const [selected, setSelected] = useState<MockEvent | null>(null);
  const [tipIndex, setTipIndex] = useState(0);
  const [tipDismissed, setTipDismissed] = useState(false);

  useEffect(() => {
    Promise.all([fetchUpcomingEvents(), fetchPastEvents()]).then(([u, p]) => setEvents([...u, ...p]));
    setTipDismissed(localStorage.getItem("calendar-tip-dismissed") === "1");
  }, []);

  const dismissTip = () => { localStorage.setItem("calendar-tip-dismissed", "1"); setTipDismissed(true); };
  const Tip = TIPS[tipIndex];
  const isLastTip = tipIndex === TIPS.length - 1;
  const displayName = profile?.full_name || profile?.company || "My Calendar";
  const initials = displayName.split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase();

  const monthLabel = format(cursor, "MMMM yyyy");

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-[-0.02em]">Calendars</h1>
          <p className="text-muted-foreground text-sm mt-1">All your events in one place.</p>
        </div>
      </div>

      {/* Onboarding tip carousel */}
      {!tipDismissed && (
        <AnimatePresence mode="wait">
          <motion.div
            key={tipIndex}
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="bg-card rounded-2xl p-4 sm:p-5 flex items-start gap-4 sm:gap-5 relative"
          >
            <button onClick={dismissTip} aria-label="Dismiss"
              className="absolute top-3 right-3 w-7 h-7 grid place-items-center rounded-full text-muted-foreground hover:bg-muted">
              <X className="w-4 h-4" />
            </button>
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-muted grid place-items-center shrink-0">
              <Tip.icon className="w-8 h-8 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0 pr-6">
              <h3 className="font-display font-bold text-base sm:text-lg">{Tip.title}</h3>
              <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{Tip.body}</p>
              <div className="flex items-center justify-between mt-4 gap-3">
                <div className="flex items-center gap-1.5">
                  {TIPS.map((_, i) => (
                    <button key={i} onClick={() => setTipIndex(i)} aria-label={`Tip ${i + 1}`}
                      className={`h-1 rounded-full transition-all ${i === tipIndex ? "w-6 bg-foreground" : "w-4 bg-muted-foreground/30 hover:bg-muted-foreground/50"}`} />
                  ))}
                </div>
                <Button size="sm" className="rounded-full"
                  onClick={() => isLastTip ? dismissTip() : setTipIndex((i) => i + 1)}>
                  {isLastTip ? "Create Calendar" : "Next"}
                </Button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      )}

      {/* My Calendars */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-lg font-bold tracking-[-0.01em]">My Calendars</h2>
          <Button size="sm" variant="ghost" className="rounded-full" onClick={() => navigate("/dashboard/events/create")}>
            <Plus className="w-4 h-4 mr-1" /> Create
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <button onClick={() => setView("agenda")}
            className="text-left bg-card rounded-2xl p-4 flex items-center gap-3 hover:bg-muted/40 transition-colors">
            <Avatar className="w-12 h-12">
              <AvatarImage src={profile?.avatar_url || undefined} />
              <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">{initials || "ME"}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="font-semibold truncate">{displayName}</p>
              <p className="text-xs text-muted-foreground">{events.length} Events</p>
            </div>
          </button>
          <button onClick={() => navigate("/dashboard/events/create")}
            className="text-left bg-card rounded-2xl p-4 flex items-center gap-3 hover:bg-muted/40 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-200 to-lime-200 grid place-items-center shrink-0">
              <CalendarPlus className="w-5 h-5 text-foreground/70" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold truncate">My Calendar</p>
              <p className="text-xs text-muted-foreground">No Subscribers</p>
            </div>
          </button>
        </div>
      </section>

      {/* Subscribed Calendars */}
      <section>
        <h2 className="font-display text-lg font-bold tracking-[-0.01em] mb-3">Subscribed Calendars</h2>
        <div className="bg-card rounded-2xl p-6 max-w-sm">
          <div className="w-12 h-12 rounded-xl bg-muted grid place-items-center mb-3">
            <CalendarDays className="w-5 h-5 text-muted-foreground" />
          </div>
          <p className="font-semibold">No Subscriptions</p>
          <p className="text-sm text-muted-foreground mt-1">You have not subscribed to any calendars.</p>
        </div>
      </section>

      {/* Schedule */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold tracking-[-0.01em]">Schedule</h2>
          <Button asChild className="rounded-full" size="sm">
            <Link to="/dashboard/events/create">
              <Plus className="w-4 h-4 mr-1.5" /> Create Event
            </Link>
          </Button>
        </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-card rounded-2xl p-2 sm:p-3">
        <div className="flex items-center gap-1">
          <Button
            size="icon" variant="ghost" className="rounded-full h-8 w-8"
            onClick={() => setCursor(view === "week" ? addDays(cursor, -7) : subMonths(cursor, 1))}
            aria-label="Previous"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            size="icon" variant="ghost" className="rounded-full h-8 w-8"
            onClick={() => setCursor(view === "week" ? addDays(cursor, 7) : addMonths(cursor, 1))}
            aria-label="Next"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="ghost" className="rounded-full h-8 ml-1" onClick={() => setCursor(new Date())}>
            Today
          </Button>
          <span className="ml-2 text-sm font-semibold">{monthLabel}</span>
        </div>

        {/* View tabs */}
        <div className="inline-flex gap-1 p-1 bg-muted rounded-full">
          {(["month", "week", "agenda"] as View[]).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`capitalize px-3.5 h-8 rounded-full text-xs font-medium transition-colors ${
                view === v ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Body */}
      <AnimatePresence mode="wait">
        <motion.div
          key={view + cursor.toISOString().slice(0, 10)}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {view === "month" && <MonthView cursor={cursor} events={events} onPick={setSelected} />}
          {view === "week" && <WeekView cursor={cursor} events={events} onPick={setSelected} />}
          {view === "agenda" && <AgendaView events={events} onPick={setSelected} />}
        </motion.div>
      </AnimatePresence>

      <p className="text-[11px] text-muted-foreground/60 text-center">
        Sync calendars via <code className="font-mono">{CALENDAR_SYNC_ENDPOINT}</code> — coming soon.
      </p>
      </div>

      {/* Drawer */}
      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="sm:max-w-md p-0 overflow-y-auto">
          {selected && (
            <div>
              <div className="aspect-[16/10] w-full overflow-hidden bg-muted">
                <img src={selected.cover} alt={selected.title} className="w-full h-full object-cover" />
              </div>
              <div className="p-5 space-y-4">
                <SheetHeader className="text-left p-0">
                  <SheetTitle className="font-display text-xl tracking-[-0.01em]">{selected.title}</SheetTitle>
                </SheetHeader>
                <div className="space-y-2 text-sm">
                  <p className="inline-flex items-center gap-2 text-muted-foreground">
                    <CalendarDays className="w-4 h-4" />
                    {format(new Date(selected.date), "EEE, MMM d")}
                  </p>
                  <p className="inline-flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    {format(new Date(selected.date), "h:mm a")}
                  </p>
                  <p className="inline-flex items-center gap-2 text-muted-foreground">
                    <Users className="w-4 h-4" />
                    {selected.attendees.toLocaleString()} registered
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-2">
                  <Button variant="outline" className="rounded-full" size="sm" asChild>
                    <Link to={`/events/${selected.slug}`}>
                      <Eye className="w-3.5 h-3.5 mr-1" /> View Page
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    className="rounded-full"
                    size="sm"
                    onClick={() => {
                      navigate(`/dashboard/events/${selected.id}`);
                      setSelected(null);
                    }}
                  >
                    <Pencil className="w-3.5 h-3.5 mr-1" /> Edit
                  </Button>
                  <Button
                    variant="outline"
                    className="rounded-full"
                    size="sm"
                    onClick={() => {
                      navigate(`/dashboard/events/${selected.id}/checkin`);
                      setSelected(null);
                    }}
                  >
                    <QrCode className="w-3.5 h-3.5 mr-1" /> Check-in
                  </Button>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

// ─── Month view ────────────────────────────────────────────────────
function MonthView({ cursor, events, onPick }: { cursor: Date; events: MockEvent[]; onPick: (e: MockEvent) => void }) {
  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(cursor), { weekStartsOn: 0 });
    const end = endOfWeek(endOfMonth(cursor), { weekStartsOn: 0 });
    return eachDayOfInterval({ start, end });
  }, [cursor]);

  const eventsByDay = useMemo(() => {
    const map = new Map<string, MockEvent[]>();
    for (const e of events) {
      const k = format(new Date(e.date), "yyyy-MM-dd");
      map.set(k, [...(map.get(k) || []), e]);
    }
    return map;
  }, [events]);

  return (
    <div className="bg-card rounded-2xl overflow-hidden">
      {/* Day headers */}
      <div className="grid grid-cols-7 border-b border-border/60">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="px-3 py-2 text-[11px] uppercase tracking-wider font-semibold text-muted-foreground text-center">
            {d}
          </div>
        ))}
      </div>
      {/* Grid */}
      <div className="grid grid-cols-7 auto-rows-[112px]">
        {days.map((day) => {
          const k = format(day, "yyyy-MM-dd");
          const dayEvents = eventsByDay.get(k) || [];
          const inMonth = isSameMonth(day, cursor);
          const today = isToday(day);
          return (
            <div
              key={k}
              className={`p-1.5 border-r border-b border-border/40 min-w-0 ${
                inMonth ? "bg-card" : "bg-muted/30"
              }`}
            >
              <div className="flex justify-end">
                <span
                  className={`inline-grid place-items-center w-6 h-6 text-xs rounded-full ${
                    today
                      ? "bg-primary text-primary-foreground font-semibold"
                      : inMonth ? "text-foreground" : "text-muted-foreground/60"
                  }`}
                >
                  {format(day, "d")}
                </span>
              </div>
              {dayEvents.length > 0 && (
                <div className="flex items-center gap-0.5 mt-0.5 px-1">
                  {dayEvents.slice(0, 3).map((e) => (
                    <span key={e.id} className="w-1.5 h-1.5 rounded-full bg-primary/70" />
                  ))}
                </div>
              )}
              <div className="space-y-1 mt-1">
                {dayEvents.slice(0, 2).map((e) => (
                  <button
                    key={e.id}
                    onClick={() => onPick(e)}
                    className="w-full text-left text-[11px] px-1.5 py-1 rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors truncate shadow-sm"
                    title={e.title}
                  >
                    {format(new Date(e.date), "HH:mm")} · {e.title}
                  </button>
                ))}
                {dayEvents.length > 2 && (
                  <button
                    onClick={() => onPick(dayEvents[2])}
                    className="text-[10px] text-muted-foreground hover:text-foreground px-1.5"
                  >
                    +{dayEvents.length - 2} more
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Week view ─────────────────────────────────────────────────────
function WeekView({ cursor, events, onPick }: { cursor: Date; events: MockEvent[]; onPick: (e: MockEvent) => void }) {
  const days = useMemo(() => {
    const start = startOfWeek(cursor, { weekStartsOn: 0 });
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  }, [cursor]);

  const hours = Array.from({ length: 18 }, (_, i) => 6 + i); // 6am – 11pm

  return (
    <div className="bg-card rounded-2xl overflow-hidden">
      <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-border/60">
        <div />
        {days.map((d) => (
          <div key={d.toISOString()} className="p-2 text-center">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{format(d, "EEE")}</p>
            <p className={`text-sm font-semibold mt-0.5 inline-grid place-items-center w-7 h-7 rounded-full ${
              isToday(d) ? "bg-primary text-primary-foreground" : ""
            }`}>
              {format(d, "d")}
            </p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-[60px_repeat(7,1fr)]">
        {hours.map((h) => (
          <div key={h} className="contents">
            <div className="text-[10px] text-muted-foreground text-right pr-2 pt-1 border-t border-border/40 h-14">
              {h.toString().padStart(2, "0")}:00
            </div>
            {days.map((d) => {
              const dayEvents = events.filter(
                (e) => isSameDay(new Date(e.date), d) && new Date(e.date).getHours() === h,
              );
              return (
                <div key={d.toISOString() + h} className="border-t border-l border-border/40 h-14 p-0.5 relative">
                  {dayEvents.map((e) => (
                    <button
                      key={e.id}
                      onClick={() => onPick(e)}
                      className="absolute inset-0.5 text-left text-[10px] px-1.5 py-1 rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors truncate shadow-sm"
                    >
                      {e.title}
                    </button>
                  ))}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Agenda view ───────────────────────────────────────────────────
function AgendaView({ events, onPick }: { events: MockEvent[]; onPick: (e: MockEvent) => void }) {
  const sorted = [...events].sort((a, b) => +new Date(a.date) - +new Date(b.date));
  const grouped = sorted.reduce<Record<string, MockEvent[]>>((acc, e) => {
    const k = format(new Date(e.date), "yyyy-MM-dd");
    (acc[k] ||= []).push(e);
    return acc;
  }, {});

  if (sorted.length === 0) {
    return (
      <div className="bg-card rounded-2xl p-12 text-center text-muted-foreground">
        <CalendarDays className="w-8 h-8 mx-auto mb-3 opacity-50" />
        <p>No events to show.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {Object.entries(grouped).map(([day, list]) => {
        const d = new Date(day);
        return (
          <div key={day} className="grid grid-cols-[80px_1fr] gap-4 sm:gap-6">
            <div className="text-right">
              <p className={`font-display text-2xl font-bold ${isToday(d) ? "text-primary" : ""}`}>
                {format(d, "d")}
              </p>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">{format(d, "EEE MMM")}</p>
            </div>
            <div className="space-y-2">
              {list.map((e) => (
                <button
                  key={e.id}
                  onClick={() => onPick(e)}
                  className="w-full text-left bg-card hover:bg-muted/50 rounded-2xl p-3 sm:p-4 flex items-center gap-3 transition-colors"
                >
                  <img src={e.cover} alt="" className="w-14 h-14 rounded-xl object-cover shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold truncate">{e.title}</p>
                    <p className="text-xs text-muted-foreground inline-flex items-center gap-3 mt-0.5">
                      <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" />{format(new Date(e.date), "h:mm a")}</span>
                      <span className="inline-flex items-center gap-1"><Users className="w-3 h-3" />{e.attendees.toLocaleString()}</span>
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}