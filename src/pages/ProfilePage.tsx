import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { format } from "date-fns";
import { Calendar, ExternalLink, Linkedin, MapPin, Plus, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import PublicHeader from "@/components/PublicHeader";
import Footer from "@/components/layout/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const MOCK_PAST_EVENTS = [
  {
    id: "mock-past-1",
    name: "Python Roadmap for Biologists ONLINE BOOTCAMP: From Code to Discovery",
    event_date: "2026-04-02T20:00:00Z",
    location_value: "ONLINE BOOTCAMP",
    background_image_url: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=500&q=80",
    slug: "python-roadmap-biologists",
  },
  {
    id: "mock-past-2",
    name: "AI & Vibe Coding Hackathon",
    event_date: "2026-03-15T09:00:00Z",
    location_value: "KAGICHA MATATU STAGE",
    background_image_url: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=500&q=80",
    slug: "ai-vibe-coding-hackathon",
  },
  {
    id: "mock-past-3",
    name: "Startup Weekend Nairobi",
    event_date: "2026-02-20T18:00:00Z",
    location_value: "Nairobi Garage, KE",
    background_image_url: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=500&q=80",
    slug: "startup-weekend-nairobi",
  },
];

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default function ProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");

  useEffect(() => {
    async function loadProfileAndEvents() {
      try {
        setLoading(true);

        const mockProfileSaved = localStorage.getItem("mock_profile");
        const parsedMock = mockProfileSaved ? JSON.parse(mockProfileSaved) : null;

        if (userId === "mock-user-id" || userId === parsedMock?.company_slug) {
          if (parsedMock) {
            setProfile(parsedMock);
            setEvents(MOCK_PAST_EVENTS);
            setLoading(false);
            return;
          }
        }

        const profileQuery = supabase.from("profiles").select("*");
        const { data: dbProfile, error: profileErr } = UUID_PATTERN.test(userId || "")
          ? await profileQuery.or(`company_slug.eq.${userId},id.eq.${userId}`).maybeSingle()
          : await profileQuery.eq("company_slug", userId).maybeSingle();

        if (profileErr) throw profileErr;

        if (dbProfile) {
          setProfile(dbProfile);

          const { data: dbEvents, error: eventsErr } = await supabase
            .from("events")
            .select("*")
            .eq("user_id", dbProfile.id)
            .order("event_date", { ascending: false });

          if (eventsErr) throw eventsErr;
          setEvents(dbEvents && dbEvents.length > 0 ? dbEvents : MOCK_PAST_EVENTS);
        } else {
          setProfile({
            full_name: "Kelvin Gichinga",
            company_slug: "kelvinmaina",
            company_description: "I host events, build useful systems, and bring people together around technology and community.",
            avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80",
          });
          setEvents(MOCK_PAST_EVENTS);
        }
      } catch (err) {
        console.error("Error loading profile details:", err);
      } finally {
        setLoading(false);
      }
    }

    loadProfileAndEvents();
  }, [userId]);

  const now = useMemo(() => new Date(), []);
  const upcomingEvents = useMemo(
    () =>
      events
        .filter((event) => !event.event_date || new Date(event.event_date) >= now)
        .sort((a, b) => new Date(a.event_date || 0).getTime() - new Date(b.event_date || 0).getTime()),
    [events, now]
  );
  const pastEvents = useMemo(
    () =>
      events
        .filter((event) => event.event_date && new Date(event.event_date) < now)
        .sort((a, b) => new Date(b.event_date).getTime() - new Date(a.event_date).getTime()),
    [events, now]
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <PublicHeader />
        <div className="max-w-5xl mx-auto px-6 py-12 space-y-8">
          <Skeleton className="h-64 w-full rounded-3xl" />
          <Skeleton className="h-40 w-full rounded-3xl" />
        </div>
      </div>
    );
  }

  const name = profile?.full_name || profile?.company || "Hostquill organizer";
  const slug = profile?.company_slug || "organizer";
  const bio = profile?.company_description || "I host events, bring people together, and share useful experiences with my community.";
  const avatar = profile?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${name}`;
  const isOwner = !!user?.id && profile?.id === user.id;
  const visibleEvents = activeTab === "upcoming" ? upcomingEvents : pastEvents;

  return (
    <div className="min-h-screen bg-background flex flex-col justify-between">
      <div>
        <PublicHeader />

        <main className="max-w-5xl mx-auto px-6 py-10 sm:py-14">
          <section className="rounded-3xl border border-border bg-card p-6 sm:p-8 mb-8">
            <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6 text-center lg:text-left">
              <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-border shadow-md shrink-0 bg-gradient-to-tr from-primary to-foreground">
                <img
                  src={avatar}
                  alt={name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = `https://api.dicebear.com/7.x/initials/svg?seed=${name}`;
                  }}
                />
              </div>

              <div className="space-y-3 flex-1">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary mb-2">Organizer profile</p>
                    <h1 className="text-3xl sm:text-4xl font-display font-bold text-foreground">{name}</h1>
                    <p className="text-sm text-muted-foreground font-mono mt-0.5">@{slug}</p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    {isOwner ? (
                      <>
                        <Button onClick={() => navigate("/dashboard/events/create")} className="bg-primary hover:bg-primary/90">
                          <Plus className="w-4 h-4 mr-2" /> Create event
                        </Button>
                        <Button variant="outline" onClick={() => navigate("/dashboard/events")}>
                          <Settings className="w-4 h-4 mr-2" /> Manage events
                        </Button>
                      </>
                    ) : (
                      <Button asChild variant="outline">
                        <Link to="/events">
                          <ExternalLink className="w-4 h-4 mr-2" /> Discover events
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>

                <p className="text-sm sm:text-base text-foreground/80 leading-relaxed max-w-2xl">{bio}</p>

                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-4 gap-y-1 text-xs text-muted-foreground pt-1">
                  <span className="font-semibold text-foreground">{events.length} hosted</span>
                  <span aria-hidden="true">/</span>
                  <span>{upcomingEvents.length} upcoming</span>
                  <span aria-hidden="true">/</span>
                  <span>{pastEvents.length} past</span>
                </div>

                <div className="pt-1 flex justify-center lg:justify-start">
                  <a
                    href="https://linkedin.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Linkedin className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-display font-bold text-foreground">Hosted events</h2>
                <p className="text-sm text-muted-foreground">Events published from this organizer profile.</p>
              </div>

              <div className="flex rounded-full bg-muted p-1 w-full sm:w-auto">
                {([
                  { id: "upcoming", label: "Upcoming", count: upcomingEvents.length },
                  { id: "past", label: "Past", count: pastEvents.length },
                ] as const).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 sm:flex-none rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                      activeTab === tab.id ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {tab.label}
                    <span className="ml-2 opacity-70">{tab.count}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              {visibleEvents.length > 0 ? (
                visibleEvents.map((event) => (
                  <Link key={event.id} to={`/register/${event.slug || event.id}`} className="block group">
                    <Card className="overflow-hidden hover:shadow-md border-border/40 transition-all bg-card/40 hover:bg-card">
                      <div className="flex flex-col sm:flex-row items-stretch">
                        <div className="w-full sm:w-32 h-32 shrink-0 overflow-hidden relative bg-muted">
                          {event.background_image_url ? (
                            <img
                              src={event.background_image_url}
                              alt={event.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Calendar className="w-8 h-8 text-muted-foreground/30" />
                            </div>
                          )}
                        </div>

                        <CardContent className="p-4 flex-1 flex flex-col justify-between gap-3">
                          <div className="space-y-1">
                            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                              {event.event_date ? format(new Date(event.event_date), "eee, MMM d, h:mm a") : "Date not set"}
                            </p>
                            <h3 className="font-display font-bold text-base text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                              {event.name}
                            </h3>
                          </div>

                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                              <img src={avatar} alt={name} className="w-5 h-5 rounded-full object-cover border border-border" />
                              <span>By {name}</span>
                            </div>
                            {event.location_value && (
                              <span className="inline-flex items-center gap-1 font-semibold text-foreground text-[10px] bg-muted/60 px-2 py-1 rounded-full uppercase tracking-wider w-fit">
                                <MapPin className="w-3 h-3" /> {event.location_value}
                              </span>
                            )}
                          </div>
                        </CardContent>
                      </div>
                    </Card>
                  </Link>
                ))
              ) : (
                <div className="rounded-3xl border border-dashed border-border bg-card/50 p-10 text-center">
                  <Calendar className="w-10 h-10 mx-auto text-muted-foreground/50 mb-3" />
                  <h3 className="font-display text-xl font-bold text-foreground">
                    {activeTab === "upcoming" ? "No upcoming events" : "No past events"}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {isOwner ? "Create an event when you are ready to host." : "Check back later for new hosted events."}
                  </p>
                  {isOwner && (
                    <Button className="mt-5 bg-primary hover:bg-primary/90" onClick={() => navigate("/dashboard/events/create")}>
                      <Plus className="w-4 h-4 mr-2" /> Create event
                    </Button>
                  )}
                </div>
              )}
            </div>
          </section>
        </main>
      </div>

      <Footer />
    </div>
  );
}
