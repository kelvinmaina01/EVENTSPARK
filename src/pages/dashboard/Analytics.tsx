import { Users, TrendingUp, CalendarDays, Loader2, Eye, MousePointerClick, Target, Globe, Copy, MessageSquare, AlertCircle, ArrowUpRight, BarChart3 } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar
} from "recharts";
import { useRegistrationStats } from "@/hooks/useRegistrations";
import { useFunnel } from "@/hooks/useFunnel";
import { useMemo, useState, useEffect } from "react";
import { format, parseISO, startOfWeek } from "date-fns";
import { getCustomCalendars, FEATURED_CALENDARS, MockEvent } from "@/lib/mockEvents";
import { useProfile } from "@/hooks/useProfile";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type TimeRange = "24h" | "7d" | "30d" | "all";

// Chart data representing Luma Page Views
const PAGE_VIEWS_MOCK = [
  { date: "May 13", views: 0 },
  { date: "May 14", views: 0 },
  { date: "May 15", views: 1 },
  { date: "May 16", views: 0 },
  { date: "May 17", views: 0 },
  { date: "May 18", views: 0 },
  { date: "May 19", views: 0 },
];

export default function Analytics() {
  const { data: stats, isLoading: statsLoading } = useRegistrationStats();
  const { data: funnel, isLoading: funnelLoading } = useFunnel("30d");
  const { data: profile } = useProfile();

  // Selected calendar for filtering
  const [selectedCalendarSlug, setSelectedCalendarSlug] = useState<string>("all");
  const [myCalendars, setMyCalendars] = useState<any[]>([]);
  const [timeRange, setTimeRange] = useState<TimeRange>("7d");
  const [allEvents, setAllEvents] = useState<any[]>([]);

  // UTM generator states
  const [selectedEventSlug, setSelectedEventSlug] = useState("");
  const [utmSource, setUtmSource] = useState("");
  const [generatedLink, setGeneratedLink] = useState("");

  // Load custom calendars and events
  useEffect(() => {
    let list = getCustomCalendars();
    if (list.length === 0 && profile) {
      const defaultName = profile.full_name ? `${profile.full_name}'s Calendar` : "My Calendar";
      const defaultCal = {
        name: defaultName,
        slug: "my-calendar",
        icon: "⚡",
        description: "My personal event space.",
        longDescription: "Welcome to my personal calendar.",
        coverImage: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=1200&q=80",
        events: 0, subscribed: false, followers: 12,
        host: { name: profile.full_name || "Host", avatar: profile.avatar_url || "" },
        socials: { website: profile.website || "" },
        tintColor: "Pink", locationType: "global", locationValue: "",
      };
      localStorage.setItem("hostquill_custom_calendars", JSON.stringify([defaultCal]));
      list = [defaultCal];
    }
    setMyCalendars(list);

    const localEventsStr = localStorage.getItem("hostquill_custom_events") || "[]";
    const localEvents = JSON.parse(localEventsStr);
    const mappedLocal = localEvents.map((e: any) => ({
      id: e.id, slug: e.slug, title: e.title, date: e.date,
      category: e.category, calendarSlug: e.calendarSlug || "my-calendar",
      ticketPrice: e.ticketPrice || 0, attendees: e.attendees || 0,
    }));
    if (mappedLocal.length > 0) setSelectedEventSlug(mappedLocal[0].slug);
    else if (stats?.events?.length) setSelectedEventSlug(stats.events[0].slug);
    setAllEvents(mappedLocal);
  }, [profile, stats]);

  // Compute stats dynamically
  const computedStats = useMemo(() => {
    let eventsCount = stats?.activeEvents ?? 0;
    let registrationsCount = stats?.total ?? 0;
    let subscribersCount = 12;
    let totalSales = 0;

    if (selectedCalendarSlug !== "all") {
      const activeCal = myCalendars.find(c => c.slug === selectedCalendarSlug);
      if (activeCal) subscribersCount = activeCal.followers ?? 0;
      const calEvents = allEvents.filter(e => e.calendarSlug === selectedCalendarSlug);
      eventsCount = calEvents.length;
      registrationsCount = calEvents.reduce((acc, curr) => acc + (curr.attendees || 0), 0);
      totalSales = calEvents.reduce((acc, curr) => acc + ((curr.attendees || 0) * (curr.ticketPrice || 0)), 0);
    } else {
      const totalCustomFollowers = myCalendars.reduce((acc, curr) => acc + (curr.followers || 0), 0);
      subscribersCount = totalCustomFollowers > 0 ? totalCustomFollowers : 12;
      eventsCount = allEvents.length + (stats?.activeEvents ?? 0);
      registrationsCount = allEvents.reduce((acc, curr) => acc + (curr.attendees || 0), 0) + (stats?.total ?? 0);
      totalSales = allEvents.reduce((acc, curr) => acc + ((curr.attendees || 0) * (curr.ticketPrice || 0)), 0);
    }
    return { events: eventsCount, tickets: registrationsCount, subscribers: subscribersCount, sales: totalSales };
  }, [selectedCalendarSlug, myCalendars, allEvents, stats]);

  // Registration chart data from our hooks
  const registrationChartData = useMemo(() => {
    if (stats?.chartData?.length) return stats.chartData;
    return [{ date: "Jan", registrations: 0 }, { date: "Feb", registrations: 0 }, { date: "Mar", registrations: 0 }];
  }, [stats]);

  // Handle UTM Tracking link generator
  const handleGenerateLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEventSlug || !utmSource.trim()) {
      toast.error("Please select an event and type a custom link name.");
      return;
    }
    const cleanSource = utmSource.trim().toLowerCase().replace(/[^a-z0-9-]/g, "");
    const base = `${window.location.origin}/events/${selectedEventSlug}`;
    setGeneratedLink(`${base}?utm_source=${cleanSource}`);
    toast.success("Tracking link generated!");
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(generatedLink);
    toast.success("Copied to clipboard!");
  };

  const feedbacks = [
    { id: 1, event: "Design Tech Summit 2026", rating: 5, comment: "Amazing networking session, absolute masterclass!", author: "Sarah Connor" },
    { id: 2, event: "Product Launch AMA", rating: 4, comment: "Very insightful details from the CTO. The Q&A was golden.", author: "James Dean" },
  ];

  return (
    <div className="space-y-8">
      {/* Header & Calendar Selector */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-[-0.02em]">Analytics</h1>
          <p className="text-muted-foreground text-sm mt-1">Track event performance, traffic trends and visitor geography.</p>
        </div>
        <div className="flex items-center gap-2">
          <Label className="text-xs uppercase tracking-wider font-semibold text-muted-foreground shrink-0">Calendar:</Label>
          <select
            value={selectedCalendarSlug}
            onChange={e => setSelectedCalendarSlug(e.target.value)}
            className="bg-card border border-border/60 rounded-full text-xs font-semibold px-4 py-2 focus:outline-none focus:ring-1 focus:ring-pink-500 shadow-sm"
          >
            <option value="all">All Calendars Combined</option>
            {myCalendars.map(cal => (
              <option key={cal.slug} value={cal.slug}>{cal.icon} {cal.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI Stats Blocks */}
      <div className="space-y-2">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Events", value: computedStats.events, sub: "0 last week", icon: CalendarDays },
            { label: "Tickets", value: computedStats.tickets, sub: "0 last week", icon: Users },
            { label: "Subscribers", value: computedStats.subscribers, sub: "0 last week", icon: TrendingUp },
            { label: "Sales", value: `$${computedStats.sales}`, sub: "$0 last week", icon: Target },
          ].map(card => (
            <div key={card.label} className="bg-card border border-border/40 rounded-2xl p-5 hover:border-pink-500/30 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{card.label}</span>
                <card.icon className="w-4 h-4 text-pink-500/60" />
              </div>
              <p className="text-3xl font-display font-bold mt-2 tracking-tight">{card.value}</p>
              <span className="text-[10px] text-muted-foreground/80 mt-1 block font-medium">{card.sub}</span>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-muted-foreground/80 flex items-center gap-1 pl-1">
          <AlertCircle className="w-3.5 h-3.5 text-pink-500 shrink-0" />
          <span>Only events created under this calendar count towards these stats.</span>
        </p>
      </div>

      {/* Page Views Graph + Visitor Traffic Period */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-card border border-border/40 rounded-2xl p-5 sm:p-6 lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display font-bold text-base leading-tight">Page Views</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Recent visitors count on your public pages.</p>
            </div>
            <div className="flex items-center gap-1.5 bg-muted rounded-full p-1 shrink-0">
              {(["24h", "7d", "30d"] as TimeRange[]).map(r => (
                <button
                  key={r}
                  onClick={() => setTimeRange(r)}
                  className={`px-3 py-1 text-[10px] uppercase font-bold rounded-full transition-colors ${
                    timeRange === r ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
          <div className="h-64 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={PAGE_VIEWS_MOCK} margin={{ left: -20, right: 10, top: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="viewsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ec4899" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#ec4899" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border/40" />
                <XAxis dataKey="date" className="text-[10px] font-semibold text-muted-foreground" tickLine={false} />
                <YAxis className="text-[10px] font-semibold text-muted-foreground" tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 11 }} labelStyle={{ fontWeight: 700 }} />
                <Area type="monotone" dataKey="views" stroke="#ec4899" strokeWidth={2} fillOpacity={1} fill="url(#viewsGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card border border-border/40 rounded-2xl p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <h3 className="font-display font-bold text-base leading-tight">Visitor Traffic Period</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Total count based on timeline.</p>
            <div className="mt-5 space-y-4">
              {[
                { period: "24 hours", count: funnel?.views ?? 0 },
                { period: "7 days", count: Math.max(funnel?.views ?? 0, 1) },
                { period: "30 days", count: Math.max(funnel?.views ?? 0, 1) },
              ].map(item => (
                <div key={item.period} className="flex justify-between items-center py-2.5 border-b border-border/30 last:border-0">
                  <span className="text-xs font-semibold text-muted-foreground">{item.period}</span>
                  <span className="text-base font-bold tabular-nums">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-pink-500/5 border border-pink-500/10 rounded-xl p-3.5 mt-5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-pink-600 block">Conversion Insight</span>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              Your page conversion rate is currently <span className="font-bold text-foreground">{funnel?.conversionRate?.toFixed(1) ?? "100"}%</span> based on visitor-to-registration ratio.
            </p>
          </div>
        </div>
      </div>

      {/* Registration Trends (from our original hooks) + Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Registration Trends Chart */}
        <div className="bg-card border border-border/40 rounded-2xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display font-bold text-base">Registration Trends</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Monthly registrations across all your events.</p>
            </div>
            {statsLoading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
          </div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={registrationChartData} margin={{ left: -20, right: 10, top: 5, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border/40" />
                <XAxis dataKey="date" className="text-[10px] font-semibold" tickLine={false} />
                <YAxis className="text-[10px] font-semibold" tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 11 }} />
                <Bar dataKey="registrations" fill="#ec4899" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Conversion Funnel */}
        <div className="bg-card border border-border/40 rounded-2xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display font-bold text-base">Conversion Funnel</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Visitor → Registration pipeline from the last 30 days.</p>
            </div>
            {funnelLoading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
          </div>
          <div className="space-y-3 pt-2">
            {[
              { label: "Page Views", value: funnel?.views ?? 0, icon: Eye, pct: 100 },
              { label: "Unique Sessions", value: funnel?.sessions ?? 0, icon: MousePointerClick, pct: funnel?.views ? Math.round(((funnel?.sessions ?? 0) / funnel.views) * 100) : 0 },
              { label: "Registrations", value: funnel?.registrations ?? 0, icon: Users, pct: funnel?.views ? Math.round(((funnel?.registrations ?? 0) / funnel.views) * 100) : 0 },
              { label: "Converted Sessions", value: funnel?.convertedSessions ?? 0, icon: Target, pct: funnel?.sessions ? Math.round(((funnel?.convertedSessions ?? 0) / funnel.sessions) * 100) : 0 },
            ].map((step, i) => (
              <div key={step.label} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 font-semibold text-muted-foreground">
                    <step.icon className="w-3.5 h-3.5 text-pink-500" />
                    {step.label}
                  </span>
                  <span className="font-bold tabular-nums">{step.value} <span className="text-muted-foreground/70 font-medium">({step.pct}%)</span></span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-pink-500 transition-all duration-500"
                    style={{ width: `${Math.max(step.pct, 2)}%`, opacity: 1 - i * 0.15 }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Live Traffic & Sources */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border/40 rounded-2xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-base">Live Traffic</h3>
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-pink-600 bg-pink-100 dark:bg-pink-950/40 px-2 py-0.5 rounded-full uppercase tracking-wider">
              <span className="w-1.5 h-1.5 bg-pink-500 rounded-full animate-ping" /> Live
            </span>
          </div>
          <div className="py-8 text-center text-muted-foreground space-y-3">
            <p className="text-xs">No page views in the last hour.</p>
            <p className="text-[11px] text-muted-foreground/80 max-w-sm mx-auto">
              Start sharing your calendar link on social media channels, and you will see live traffic spikes populate here!
            </p>
          </div>
        </div>

        <div className="bg-card border border-border/40 rounded-2xl p-5 sm:p-6 space-y-4">
          <h3 className="font-display font-bold text-base">Traffic Sources</h3>
          {funnel?.sources && funnel.sources.length > 0 ? (
            <div className="space-y-3">
              {funnel.sources.map((src: any) => (
                <div key={src.source} className="flex items-center justify-between text-xs">
                  <span className="font-semibold capitalize flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-pink-500" /> {src.source}
                  </span>
                  <span className="tabular-nums">{src.views} views · {src.registrations} regs</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground space-y-2">
              <Globe className="w-8 h-8 mx-auto text-pink-500/40" />
              <p className="text-xs">Start sharing your link and you'll see traffic referrers here.</p>
            </div>
          )}
        </div>
      </div>

      {/* Cities & UTM Generator */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border/40 rounded-2xl p-5 sm:p-6 space-y-4">
          <h3 className="font-display font-bold text-base">Top Cities</h3>
          <div className="space-y-4">
            {[
              { city: "Ashburn, United States", pct: 100 },
              { city: "Nairobi, Kenya", pct: 0 },
            ].map(item => (
              <div key={item.city} className={`space-y-1.5 ${item.pct === 0 ? "opacity-40" : ""}`}>
                <div className="flex justify-between text-xs font-semibold">
                  <span>{item.city}</span>
                  <span>{item.pct}%</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full bg-pink-500" style={{ width: `${item.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card border border-border/40 rounded-2xl p-5 sm:p-6 space-y-4">
          <div>
            <h3 className="font-display font-bold text-base">UTM Tracking Link Generator</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Set up a tracking link by adding <code className="text-xs bg-muted px-1 rounded">?utm_source=your-link-name</code> to your URL.
            </p>
          </div>
          <form onSubmit={handleGenerateLink} className="space-y-3 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-[10px] uppercase font-bold text-muted-foreground">Select Event</Label>
                <select
                  value={selectedEventSlug}
                  onChange={e => setSelectedEventSlug(e.target.value)}
                  className="w-full bg-muted/50 border border-border h-9 rounded-lg px-2 text-xs focus:outline-none"
                >
                  <option value="" disabled>Choose Event</option>
                  {allEvents.map(e => (
                    <option key={e.id} value={e.slug}>{e.title}</option>
                  ))}
                  {stats?.events?.map(e => (
                    <option key={e.id} value={e.slug}>{e.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] uppercase font-bold text-muted-foreground">Link Name / UTM Source</Label>
                <Input
                  placeholder="e.g. twitter-post"
                  value={utmSource}
                  onChange={e => setUtmSource(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>
            </div>
            <Button type="submit" size="sm" className="w-full rounded-full bg-pink-500 hover:bg-pink-600 text-white font-semibold">
              Generate Tracking URL
            </Button>
          </form>
          {generatedLink && (
            <div className="p-3 bg-muted/40 rounded-xl flex items-center justify-between gap-3 border border-border/50">
              <span className="text-xs truncate text-muted-foreground select-all font-mono leading-relaxed">{generatedLink}</span>
              <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0 rounded-lg hover:bg-muted" onClick={handleCopyLink}>
                <Copy className="w-4 h-4 text-pink-500" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Event Feedback */}
      <div className="bg-card border border-border/40 rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h3 className="font-display font-bold text-base">Event Feedback</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Attendee ratings and reviews compiled after event completions.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground font-semibold">Filter:</span>
            <select className="bg-background border border-border rounded-full text-xs font-semibold px-3.5 py-1.5 focus:outline-none shadow-sm">
              <option value="all">By Event (All Combined)</option>
              {allEvents.map(e => (
                <option key={e.id} value={e.slug}>{e.title}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {feedbacks.map(f => (
            <div key={f.id} className="p-4 rounded-xl border border-border/50 bg-muted/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-pink-600">{f.event}</span>
                <span className="text-xs font-semibold text-muted-foreground">Rating: {f.rating}/5 ⭐</span>
              </div>
              <p className="text-sm text-foreground/90 italic leading-relaxed">
                "{f.comment}"
              </p>
              <p className="text-[11px] text-muted-foreground font-medium text-right">— {f.author}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
