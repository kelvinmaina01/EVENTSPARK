import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type FunnelRange = "7d" | "30d" | "90d" | "all";

function rangeStart(r: FunnelRange): string | null {
  if (r === "all") return null;
  const days = r === "7d" ? 7 : r === "30d" ? 30 : 90;
  return new Date(Date.now() - days * 86400_000).toISOString();
}

export function useFunnel(range: FunnelRange = "30d", eventId?: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["funnel", user?.id, range, eventId],
    enabled: !!user,
    queryFn: async () => {
      const since = rangeStart(range);

      // Get user's events first (needed to scope page views)
      const { data: events } = await supabase.from("events").select("id, name");
      const eventIds = (events || []).filter(e => !eventId || e.id === eventId).map(e => e.id);
      if (eventIds.length === 0) {
        return { views: 0, registrations: 0, sessions: 0, convertedSessions: 0, conversionRate: 0, sources: [], events: [] };
      }

      let viewsQ = supabase.from("event_page_views").select("session_id, utm_source, utm_medium, utm_campaign, event_id, created_at").in("event_id", eventIds);
      let regsQ = supabase.from("registrations").select("session_id, utm_source, utm_medium, utm_campaign, event_id, created_at").in("event_id", eventIds);

      if (since) {
        viewsQ = viewsQ.gte("created_at", since);
        regsQ = regsQ.gte("created_at", since);
      }

      const [{ data: views }, { data: regs }] = await Promise.all([viewsQ, regsQ]);

      const viewSessions = new Set((views || []).map(v => v.session_id).filter(Boolean));
      const regSessions = new Set((regs || []).map(r => r.session_id).filter(Boolean));
      const convertedSessions = [...regSessions].filter(s => viewSessions.has(s)).length;
      const conversionRate = viewSessions.size ? (convertedSessions / viewSessions.size) * 100 : 0;

      // Top sources by views/regs
      const srcMap: Record<string, { source: string; views: number; registrations: number }> = {};
      (views || []).forEach(v => {
        const k = v.utm_source || (v as any).referrer || "direct";
        srcMap[k] = srcMap[k] || { source: k, views: 0, registrations: 0 };
        srcMap[k].views++;
      });
      (regs || []).forEach(r => {
        const k = r.utm_source || (r as any).referrer || "direct";
        srcMap[k] = srcMap[k] || { source: k, views: 0, registrations: 0 };
        srcMap[k].registrations++;
      });
      const sources = Object.values(srcMap).sort((a, b) => b.views - a.views).slice(0, 8);

      // Per-event funnel
      const eventMap: Record<string, { name: string; views: number; registrations: number }> = {};
      (events || []).forEach(e => { eventMap[e.id] = { name: e.name, views: 0, registrations: 0 }; });
      (views || []).forEach(v => { if (eventMap[v.event_id]) eventMap[v.event_id].views++; });
      (regs || []).forEach(r => { if (eventMap[r.event_id]) eventMap[r.event_id].registrations++; });
      const eventsArr = Object.values(eventMap).filter(e => e.views > 0 || e.registrations > 0);

      return {
        views: views?.length ?? 0,
        registrations: regs?.length ?? 0,
        sessions: viewSessions.size,
        convertedSessions,
        conversionRate,
        sources,
        events: eventsArr,
      };
    },
  });
}
