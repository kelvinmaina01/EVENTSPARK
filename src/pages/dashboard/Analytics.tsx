import { useEffect, useState } from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AlertCircle, BarChart3, Copy, Eye, Globe, Loader2, MousePointerClick, Target, TrendingUp, Users, CalendarDays } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AnalyticsRange, useAnalytics } from "@/hooks/useAnalytics";

export default function Analytics() {
  const [timeRange, setTimeRange] = useState<AnalyticsRange>("30d");
  const { data: analytics, isLoading } = useAnalytics(timeRange);
  const [selectedEventSlug, setSelectedEventSlug] = useState("");
  const [utmSource, setUtmSource] = useState("");
  const [generatedLink, setGeneratedLink] = useState("");

  useEffect(() => {
    if (!selectedEventSlug && analytics?.events?.length) {
      setSelectedEventSlug(analytics.events[0].slug);
    }
  }, [analytics?.events, selectedEventSlug]);

  const totals = analytics?.totals ?? {
    events: 0,
    registrations: 0,
    subscribers: 0,
    sales: 0,
    views: 0,
    liveViews: 0,
    conversionRate: 0,
  };

  const handleGenerateLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEventSlug || !utmSource.trim()) {
      toast.error("Select an event and enter a tracking source.");
      return;
    }

    const cleanSource = utmSource.trim().toLowerCase().replace(/[^a-z0-9-]/g, "");
    setGeneratedLink(`${window.location.origin}/register/${selectedEventSlug}?utm_source=${cleanSource}`);
    toast.success("Tracking link generated.");
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(generatedLink);
    toast.success("Copied to clipboard.");
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-[-0.02em]">Analytics</h1>
          <p className="text-muted-foreground text-sm mt-1">Real event performance from Supabase registrations, page views, and feedback.</p>
        </div>

        <div className="flex items-center gap-1.5 bg-muted rounded-full p-1 shrink-0">
          {(["24h", "7d", "30d", "all"] as AnalyticsRange[]).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1.5 text-[10px] uppercase font-bold rounded-full transition-colors ${
                timeRange === range ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Events", value: totals.events, sub: "owned events", icon: CalendarDays },
            { label: "Registrations", value: totals.registrations, sub: "all time", icon: Users },
            { label: "Subscribers", value: totals.subscribers, sub: "unique emails", icon: TrendingUp },
            { label: "Sales", value: `$${totals.sales.toLocaleString()}`, sub: "registered revenue", icon: Target },
          ].map((card) => (
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
          <span>These numbers are scoped to events owned by the signed-in organizer.</span>
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-card border border-border/40 rounded-2xl p-5 sm:p-6 lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display font-bold text-base leading-tight">Page Views</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Tracked from public event pages.</p>
            </div>
            {isLoading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
          </div>
          <div className="h-64 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics?.pageViewsChart ?? []} margin={{ left: -20, right: 10, top: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="viewsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ec4899" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border/40" />
                <XAxis dataKey="date" className="text-[10px] font-semibold text-muted-foreground" tickLine={false} />
                <YAxis className="text-[10px] font-semibold text-muted-foreground" tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 11 }} />
                <Area type="monotone" dataKey="views" stroke="#ec4899" strokeWidth={2} fillOpacity={1} fill="url(#viewsGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card border border-border/40 rounded-2xl p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <h3 className="font-display font-bold text-base leading-tight">Visitor Traffic</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Tracked views by time window.</p>
            <div className="mt-5 space-y-4">
              {[
                { period: "24 hours", count: analytics?.trafficPeriods["24h"] ?? 0 },
                { period: "7 days", count: analytics?.trafficPeriods["7d"] ?? 0 },
                { period: "30 days", count: analytics?.trafficPeriods["30d"] ?? 0 },
              ].map((item) => (
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
              Current conversion rate is <span className="font-bold text-foreground">{totals.conversionRate.toFixed(1)}%</span> from unique viewed sessions to registered sessions.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border/40 rounded-2xl p-5 sm:p-6 space-y-4">
          <div>
            <h3 className="font-display font-bold text-base">Registration Trends</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Registrations grouped by the selected range.</p>
          </div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics?.registrationsChart ?? []} margin={{ left: -20, right: 10, top: 5, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border/40" />
                <XAxis dataKey="date" className="text-[10px] font-semibold" tickLine={false} />
                <YAxis className="text-[10px] font-semibold" tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 11 }} />
                <Bar dataKey="registrations" fill="#ec4899" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card border border-border/40 rounded-2xl p-5 sm:p-6 space-y-4">
          <div>
            <h3 className="font-display font-bold text-base">Conversion Funnel</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Visitor to registration pipeline.</p>
          </div>
          <div className="space-y-3 pt-2">
            {[
              { label: "Page Views", value: totals.views, icon: Eye, pct: 100 },
              { label: "Unique Sessions", value: new Set(analytics?.pageViews.map((view) => view.session_id).filter(Boolean)).size, icon: MousePointerClick, pct: totals.views ? 75 : 0 },
              { label: "Registrations", value: totals.registrations, icon: Users, pct: totals.views ? Math.round((totals.registrations / totals.views) * 100) : 0 },
              { label: "Converted Sessions", value: analytics?.funnelEvents.reduce((sum, event) => sum + Math.min(event.views, event.registrations), 0) ?? 0, icon: Target, pct: Math.round(totals.conversionRate) },
            ].map((step, index) => (
              <div key={step.label} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 font-semibold text-muted-foreground">
                    <step.icon className="w-3.5 h-3.5 text-pink-500" />
                    {step.label}
                  </span>
                  <span className="font-bold tabular-nums">{step.value} <span className="text-muted-foreground/70 font-medium">({step.pct}%)</span></span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full bg-pink-500 transition-all duration-500" style={{ width: `${Math.max(Math.min(step.pct, 100), step.value ? 2 : 0)}%`, opacity: 1 - index * 0.15 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border/40 rounded-2xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-base">Live Traffic</h3>
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-pink-600 bg-pink-100 dark:bg-pink-950/40 px-2 py-0.5 rounded-full uppercase tracking-wider">
              <span className="w-1.5 h-1.5 bg-pink-500 rounded-full animate-ping" /> Live
            </span>
          </div>
          <div className="py-8 text-center text-muted-foreground space-y-3">
            <p className="text-3xl font-display font-bold text-foreground">{totals.liveViews}</p>
            <p className="text-xs">Page views recorded in the last hour.</p>
          </div>
        </div>

        <div className="bg-card border border-border/40 rounded-2xl p-5 sm:p-6 space-y-4">
          <h3 className="font-display font-bold text-base">Traffic Sources</h3>
          {analytics?.sources.length ? (
            <div className="space-y-3">
              {analytics.sources.map((source) => (
                <div key={source.source} className="flex items-center justify-between text-xs">
                  <span className="font-semibold capitalize flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-pink-500" /> {source.source}
                  </span>
                  <span className="tabular-nums">{source.views} views / {source.registrations} regs</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground space-y-2">
              <Globe className="w-8 h-8 mx-auto text-pink-500/40" />
              <p className="text-xs">No source data yet.</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border/40 rounded-2xl p-5 sm:p-6 space-y-4">
          <h3 className="font-display font-bold text-base">Top Cities</h3>
          <div className="space-y-4">
            {analytics?.topCities.length ? analytics.topCities.map((item) => (
              <div key={item.city} className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span>{item.city}</span>
                  <span>{item.count} views</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full bg-pink-500" style={{ width: `${item.pct}%` }} />
                </div>
              </div>
            )) : <p className="text-xs text-muted-foreground py-8 text-center">No city data recorded yet.</p>}
          </div>
        </div>

        <div className="bg-card border border-border/40 rounded-2xl p-5 sm:p-6 space-y-4">
          <div>
            <h3 className="font-display font-bold text-base">UTM Tracking Link Generator</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Generate a campaign URL for any real event.</p>
          </div>
          <form onSubmit={handleGenerateLink} className="space-y-3 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-[10px] uppercase font-bold text-muted-foreground">Select Event</Label>
                <select value={selectedEventSlug} onChange={(e) => setSelectedEventSlug(e.target.value)} className="w-full bg-muted/50 border border-border h-9 rounded-lg px-2 text-xs focus:outline-none">
                  <option value="" disabled>Choose Event</option>
                  {analytics?.events.map((event) => (
                    <option key={event.id} value={event.slug}>{event.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] uppercase font-bold text-muted-foreground">UTM Source</Label>
                <Input placeholder="e.g. twitter-post" value={utmSource} onChange={(e) => setUtmSource(e.target.value)} className="h-9 text-xs" />
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

      <div className="bg-card border border-border/40 rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h3 className="font-display font-bold text-base">Event Feedback</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Attendee ratings and reviews stored in Supabase.</p>
          </div>
          <BarChart3 className="w-5 h-5 text-pink-500/60" />
        </div>
        {analytics?.feedback.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {analytics.feedback.map((feedback) => (
              <div key={feedback.id} className="p-4 rounded-xl border border-border/50 bg-muted/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-pink-600">{feedback.event_name}</span>
                  <span className="text-xs font-semibold text-muted-foreground">Rating: {feedback.rating}/5</span>
                </div>
                <p className="text-sm text-foreground/90 italic leading-relaxed">"{feedback.comment || "No comment provided."}"</p>
                <p className="text-[11px] text-muted-foreground font-medium text-right">- {feedback.author_name || "Anonymous"}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground py-8 text-center">No feedback has been submitted yet.</p>
        )}
      </div>
    </div>
  );
}
