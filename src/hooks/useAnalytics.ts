import { useQuery } from "@tanstack/react-query";
import { format, startOfDay, startOfHour, startOfMonth, subDays, subHours } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Tables } from "@/integrations/supabase/types";

export type AnalyticsRange = "24h" | "7d" | "30d" | "all";

type EventRow = Tables<"events">;
type RegistrationRow = Tables<"registrations">;
type PageViewRow = Tables<"event_page_views">;
type FeedbackRow = Tables<"event_feedback">;

function rangeStart(range: AnalyticsRange) {
  if (range === "24h") return subHours(new Date(), 24);
  if (range === "7d") return subDays(new Date(), 7);
  if (range === "30d") return subDays(new Date(), 30);
  return null;
}

function inRange(createdAt: string, range: AnalyticsRange) {
  const start = rangeStart(range);
  if (!start) return true;
  return new Date(createdAt) >= start;
}

function chartKey(date: Date, range: AnalyticsRange) {
  if (range === "24h") return startOfHour(date).toISOString();
  if (range === "all") return startOfMonth(date).toISOString();
  return startOfDay(date).toISOString();
}

function chartLabel(key: string, range: AnalyticsRange) {
  const date = new Date(key);
  if (range === "24h") return format(date, "ha");
  if (range === "all") return format(date, "MMM yyyy");
  return format(date, "MMM d");
}

function countByDate<T extends { created_at: string }>(rows: T[], range: AnalyticsRange, valueKey: "views" | "registrations") {
  const map = new Map<string, number>();
  rows.filter((row) => inRange(row.created_at, range)).forEach((row) => {
    const key = chartKey(new Date(row.created_at), range);
    map.set(key, (map.get(key) || 0) + 1);
  });

  return [...map.entries()]
    .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
    .map(([key, count]) => ({ date: chartLabel(key, range), [valueKey]: count }));
}

function getRegistrationEmail(row: RegistrationRow) {
  const data = row.data;
  if (!data || typeof data !== "object" || Array.isArray(data)) return null;
  const record = data as Record<string, unknown>;
  const value = record["Email Address"] || record.email || record.Email;
  return typeof value === "string" ? value.toLowerCase().trim() : null;
}

export function useAnalytics(range: AnalyticsRange = "30d") {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["analytics", user?.id, range],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data: events, error: eventsError } = await supabase
        .from("events")
        .select("*")
        .eq("user_id", user!.id)
        .order("event_date", { ascending: false });

      if (eventsError) throw eventsError;

      const ownedEvents = (events || []) as EventRow[];
      const eventIds = ownedEvents.map((event) => event.id);

      if (eventIds.length === 0) {
        return {
          events: [] as EventRow[],
          registrations: [] as RegistrationRow[],
          pageViews: [] as PageViewRow[],
          feedback: [] as Array<FeedbackRow & { event_name: string }>,
          totals: { events: 0, registrations: 0, subscribers: 0, sales: 0, views: 0, liveViews: 0, conversionRate: 0 },
          pageViewsChart: [] as Array<{ date: string; views: number }>,
          registrationsChart: [] as Array<{ date: string; registrations: number }>,
          trafficPeriods: { "24h": 0, "7d": 0, "30d": 0 },
          sources: [] as Array<{ source: string; views: number; registrations: number }>,
          topCities: [] as Array<{ city: string; count: number; pct: number }>,
          funnelEvents: [] as Array<{ name: string; views: number; registrations: number }>,
        };
      }

      const [{ data: registrations, error: registrationsError }, { data: pageViews, error: pageViewsError }, { data: feedback, error: feedbackError }] =
        await Promise.all([
          supabase.from("registrations").select("*").in("event_id", eventIds).order("created_at", { ascending: false }),
          supabase.from("event_page_views").select("*").in("event_id", eventIds).order("created_at", { ascending: false }),
          supabase.from("event_feedback").select("*").in("event_id", eventIds).order("created_at", { ascending: false }).limit(20),
        ]);

      if (registrationsError) throw registrationsError;
      if (pageViewsError) throw pageViewsError;
      if (feedbackError) throw feedbackError;

      const registrationRows = (registrations || []) as RegistrationRow[];
      const viewRows = (pageViews || []) as PageViewRow[];
      const feedbackRows = (feedback || []) as FeedbackRow[];
      const filteredViews = viewRows.filter((view) => inRange(view.created_at, range));
      const filteredRegistrations = registrationRows.filter((registration) => inRange(registration.created_at, range));
      const eventById = new Map(ownedEvents.map((event) => [event.id, event]));
      const ticketPriceByEvent = new Map(ownedEvents.map((event) => [event.id, Number(event.ticket_price || 0)]));

      const uniqueEmails = new Set(registrationRows.map(getRegistrationEmail).filter(Boolean));
      const sales = registrationRows.reduce((total, registration) => total + (ticketPriceByEvent.get(registration.event_id) || 0), 0);

      const viewSessions = new Set(filteredViews.map((view) => view.session_id).filter(Boolean));
      const regSessions = new Set(filteredRegistrations.map((registration) => registration.session_id).filter(Boolean));
      const convertedSessions = [...regSessions].filter((session) => viewSessions.has(session)).length;
      const conversionRate = viewSessions.size ? (convertedSessions / viewSessions.size) * 100 : 0;

      const sourceMap = new Map<string, { source: string; views: number; registrations: number }>();
      filteredViews.forEach((view) => {
        const source = view.utm_source || view.referrer || "direct";
        const item = sourceMap.get(source) || { source, views: 0, registrations: 0 };
        item.views += 1;
        sourceMap.set(source, item);
      });
      filteredRegistrations.forEach((registration) => {
        const source = registration.utm_source || registration.referrer || "direct";
        const item = sourceMap.get(source) || { source, views: 0, registrations: 0 };
        item.registrations += 1;
        sourceMap.set(source, item);
      });

      const cityMap = new Map<string, number>();
      filteredViews.forEach((view) => {
        const city = [view.city, view.country].filter(Boolean).join(", ") || "Unknown";
        cityMap.set(city, (cityMap.get(city) || 0) + 1);
      });
      const maxCityCount = Math.max(...cityMap.values(), 0);

      const eventFunnelMap = new Map<string, { name: string; views: number; registrations: number }>();
      ownedEvents.forEach((event) => eventFunnelMap.set(event.id, { name: event.name, views: 0, registrations: 0 }));
      filteredViews.forEach((view) => {
        const item = eventFunnelMap.get(view.event_id);
        if (item) item.views += 1;
      });
      filteredRegistrations.forEach((registration) => {
        const item = eventFunnelMap.get(registration.event_id);
        if (item) item.registrations += 1;
      });

      const oneHourAgo = subHours(new Date(), 1);

      return {
        events: ownedEvents,
        registrations: registrationRows,
        pageViews: viewRows,
        feedback: feedbackRows.map((row) => ({ ...row, event_name: eventById.get(row.event_id)?.name || "Event" })),
        totals: {
          events: ownedEvents.length,
          registrations: registrationRows.length,
          subscribers: uniqueEmails.size,
          sales,
          views: filteredViews.length,
          liveViews: viewRows.filter((view) => new Date(view.created_at) >= oneHourAgo).length,
          conversionRate,
        },
        pageViewsChart: countByDate(viewRows, range, "views") as Array<{ date: string; views: number }>,
        registrationsChart: countByDate(registrationRows, range, "registrations") as Array<{ date: string; registrations: number }>,
        trafficPeriods: {
          "24h": viewRows.filter((view) => new Date(view.created_at) >= subHours(new Date(), 24)).length,
          "7d": viewRows.filter((view) => new Date(view.created_at) >= subDays(new Date(), 7)).length,
          "30d": viewRows.filter((view) => new Date(view.created_at) >= subDays(new Date(), 30)).length,
        },
        sources: [...sourceMap.values()].sort((a, b) => b.views - a.views).slice(0, 8),
        topCities: [...cityMap.entries()]
          .sort((a, b) => b[1] - a[1])
          .slice(0, 6)
          .map(([city, count]) => ({ city, count, pct: maxCityCount ? Math.round((count / maxCityCount) * 100) : 0 })),
        funnelEvents: [...eventFunnelMap.values()].filter((event) => event.views > 0 || event.registrations > 0),
      };
    },
  });
}
