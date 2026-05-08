import { Users, TrendingUp, CalendarDays, Loader2, Eye, MousePointerClick, Target } from "lucide-react";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { useRegistrationStats } from "@/hooks/useRegistrations";
import { useFunnel, FunnelRange } from "@/hooks/useFunnel";
import { useMemo, useState } from "react";
import { format, parseISO, startOfWeek } from "date-fns";

const Analytics = () => {
  const { data: stats, isLoading } = useRegistrationStats();
  const [range, setRange] = useState<FunnelRange>("30d");
  const { data: funnel, isLoading: funnelLoading } = useFunnel(range);

  const perEventData = useMemo(() => {
    if (!stats?.events || !stats?.registrations) return [];
    const countMap: Record<string, { name: string; registrations: number }> = {};
    stats.events.forEach(e => { countMap[e.id] = { name: e.name, registrations: 0 }; });
    stats.registrations.forEach(r => {
      if (countMap[r.event_id]) countMap[r.event_id].registrations++;
    });
    return Object.values(countMap)
      .filter(d => d.registrations > 0)
      .sort((a, b) => b.registrations - a.registrations);
  }, [stats]);

  const overTimeData = useMemo(() => {
    if (!stats?.registrations?.length) return [];
    const weekMap: Record<string, number> = {};
    stats.registrations.forEach(r => {
      const week = format(startOfWeek(parseISO(r.created_at)), "MMM d");
      weekMap[week] = (weekMap[week] || 0) + 1;
    });
    return Object.entries(weekMap).map(([week, count]) => ({ week, registrations: count }));
  }, [stats]);

  if (isLoading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  }

  const statCards = [
    { label: "Total registrations", value: stats?.total ?? 0, icon: Users },
    { label: "Active events", value: stats?.activeEvents ?? 0, icon: CalendarDays },
    { label: "Avg per event", value: stats?.events?.length ? Math.round((stats?.total ?? 0) / stats.events.length) : 0, icon: TrendingUp },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold">Analytics</h1>
        <p className="text-muted-foreground">Track your event performance and registration metrics.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {statCards.map((stat) => (
          <div key={stat.label} className="bg-card rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">{stat.label}</span>
              <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center">
                <stat.icon className="w-4 h-4 text-muted-foreground" />
              </div>
            </div>
            <p className="text-2xl font-display font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-card rounded-xl p-5 sm:p-6">
          <h3 className="font-display font-semibold mb-4">Registrations by event</h3>
          {perEventData.length > 0 ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={perEventData} layout="vertical" margin={{ left: 8, right: 16, top: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" horizontal={false} />
                  <XAxis type="number" className="text-xs" allowDecimals={false} />
                  <YAxis type="category" dataKey="name" width={120} className="text-xs" tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 13 }}
                    labelStyle={{ fontWeight: 600 }}
                  />
                  <Bar dataKey="registrations" fill="hsl(var(--primary))" radius={[0, 6, 6, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-12 text-sm">No registration data yet.</p>
          )}
        </div>

        <div className="bg-card rounded-xl p-5 sm:p-6">
          <h3 className="font-display font-semibold mb-4">Registrations over time</h3>
          {overTimeData.length > 0 ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={overTimeData} margin={{ left: 0, right: 16, top: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="week" className="text-xs" tick={{ fontSize: 11 }} />
                  <YAxis className="text-xs" allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 13 }}
                    labelStyle={{ fontWeight: 600 }}
                  />
                  <Line type="monotone" dataKey="registrations" stroke="hsl(var(--success))" strokeWidth={2.5} dot={{ fill: "hsl(var(--success))", r: 4, strokeWidth: 0 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-12 text-sm">No registration data yet.</p>
          )}
        </div>
      </div>

      {/* Funnel section */}
      <div className="space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-xl font-display font-bold">Registration funnel</h2>
            <p className="text-sm text-muted-foreground">Views → registrations, with UTM source attribution.</p>
          </div>
          <div className="flex items-center gap-1 bg-muted rounded-full p-1">
            {(["7d", "30d", "90d", "all"] as FunnelRange[]).map(r => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${range === r ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"}`}
              >
                {r === "all" ? "All time" : `Last ${r}`}
              </button>
            ))}
          </div>
        </div>

        {funnelLoading ? (
          <div className="flex justify-center py-10"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
        ) : (
          <>
            {/* Funnel cards */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              {[
                { label: "Page views", value: funnel?.views ?? 0, icon: Eye },
                { label: "Unique visitors", value: funnel?.sessions ?? 0, icon: MousePointerClick },
                { label: "Registrations", value: funnel?.registrations ?? 0, icon: Users },
                { label: "Conversion rate", value: `${(funnel?.conversionRate ?? 0).toFixed(1)}%`, icon: Target },
              ].map(s => (
                <div key={s.label} className="bg-card rounded-xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-muted-foreground">{s.label}</span>
                    <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center">
                      <s.icon className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                  <p className="text-2xl font-display font-bold">{s.value}</p>
                </div>
              ))}
            </div>

            {/* Funnel bar visual */}
            {(funnel?.views ?? 0) > 0 && (
              <div className="bg-card rounded-xl p-5 sm:p-6">
                <h3 className="font-display font-semibold mb-4">Funnel</h3>
                <div className="space-y-3">
                  {[
                    { label: "Visited registration page", value: funnel?.sessions ?? 0, base: funnel?.sessions ?? 1 },
                    { label: "Completed registration", value: funnel?.convertedSessions ?? 0, base: funnel?.sessions ?? 1 },
                  ].map((s, i) => {
                    const pct = s.base ? (s.value / s.base) * 100 : 0;
                    return (
                      <div key={i}>
                        <div className="flex justify-between text-sm mb-1.5">
                          <span className="text-muted-foreground">{s.label}</span>
                          <span className="font-semibold">{s.value} <span className="text-muted-foreground font-normal">({pct.toFixed(1)}%)</span></span>
                        </div>
                        <div className="h-3 rounded-full bg-muted overflow-hidden">
                          <div className="h-full rounded-full bg-primary" style={{ width: `${Math.max(2, pct)}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Sources */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className="bg-card rounded-xl p-5 sm:p-6">
                <h3 className="font-display font-semibold mb-4">Top sources</h3>
                {(funnel?.sources?.length ?? 0) > 0 ? (
                  <div className="space-y-2.5">
                    {funnel!.sources.map(s => {
                      const conv = s.views ? (s.registrations / s.views) * 100 : 0;
                      return (
                        <div key={s.source} className="flex items-center justify-between text-sm">
                          <span className="font-medium truncate max-w-[40%]">{s.source}</span>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>{s.views} views</span>
                            <span>{s.registrations} regs</span>
                            <span className="font-semibold text-foreground tabular-nums w-12 text-right">{conv.toFixed(1)}%</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8 text-sm">No traffic data yet. Share your registration link with <code className="text-xs bg-muted px-1.5 py-0.5 rounded">?utm_source=…</code> to track sources.</p>
                )}
              </div>

              <div className="bg-card rounded-xl p-5 sm:p-6">
                <h3 className="font-display font-semibold mb-4">Per-event conversion</h3>
                {(funnel?.events?.length ?? 0) > 0 ? (
                  <div className="space-y-2.5">
                    {funnel!.events.map(e => {
                      const conv = e.views ? (e.registrations / e.views) * 100 : 0;
                      return (
                        <div key={e.name} className="flex items-center justify-between text-sm">
                          <span className="font-medium truncate max-w-[50%]">{e.name}</span>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>{e.views} / {e.registrations}</span>
                            <span className="font-semibold text-foreground tabular-nums w-12 text-right">{conv.toFixed(1)}%</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8 text-sm">No event activity yet.</p>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Analytics;
