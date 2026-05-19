import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, MapPin, Users, Globe, Linkedin, Shield, Compass, Sparkles } from "lucide-react";
import { format } from "date-fns";
import PublicHeader from "@/components/PublicHeader";
import Footer from "@/components/layout/Footer";
import { supabase } from "@/integrations/supabase/client";

// Define mock events for pre-populating profiles
const MOCK_PAST_EVENTS = [
  {
    id: "mock-past-1",
    name: "Python Roadmap for Biologists ONLINE BOOTCAMP: From Code to Discovery",
    event_date: "2026-04-02T20:00:00Z",
    location_value: "ONLINE BOOTCAMP",
    background_image_url: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=500&q=80",
    slug: "python-roadmap-biologists"
  },
  {
    id: "mock-past-2",
    name: "AI & Vibe Coding Hackathon",
    event_date: "2026-03-15T09:00:00Z",
    location_value: "KAGICHA MATATU STAGE",
    background_image_url: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=500&q=80",
    slug: "ai-vibe-coding-hackathon"
  },
  {
    id: "mock-past-3",
    name: "Startup Weekend Nairobi",
    event_date: "2026-02-20T18:00:00Z",
    location_value: "Nairobi Garage, KE",
    background_image_url: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=500&q=80",
    slug: "startup-weekend-nairobi"
  }
];

export default function ProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const [profile, setProfile] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfileAndEvents() {
      try {
        setLoading(true);
        
        // 1. Check if it's the mock user profile
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

        // 2. Query real database by company_slug or id
        const { data: dbProfile, error: profileErr } = await supabase
          .from("profiles")
          .select("*")
          .or(`company_slug.eq.${userId},id.eq.${userId}`)
          .maybeSingle();

        if (profileErr) throw profileErr;

        if (dbProfile) {
          setProfile(dbProfile);
          
          // Fetch events hosted by this user
          const { data: dbEvents } = await supabase
            .from("events")
            .select("*")
            .eq("user_id", dbProfile.id)
            .order("event_date", { ascending: false });
            
          const mergedEvents = dbEvents && dbEvents.length > 0 
            ? [...dbEvents, ...MOCK_PAST_EVENTS] 
            : MOCK_PAST_EVENTS;
            
          setEvents(mergedEvents);
        } else {
          // Fallback to custom guest profile
          setProfile({
            full_name: "Kelvin Gichinga",
            company_slug: "Kelvinmaina",
            company_description: "I build data-driven systems at the intersection of health, AI, and Technology as a Software Engineer",
            avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80",
            joined_date: "Joined April 2025"
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <PublicHeader />
        <div className="max-w-3xl mx-auto px-6 py-12 space-y-8">
          <div className="flex items-center gap-6">
            <Skeleton className="w-24 h-24 rounded-full" />
            <div className="space-y-3 flex-1">
              <Skeleton className="h-8 w-1/3" />
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
          <Skeleton className="h-[200px] w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  const name = profile?.full_name || profile?.company || "Kelvin Gichinga";
  const slug = profile?.company_slug || "Kelvinmaina";
  const bio = profile?.company_description || "I build data-driven systems at the intersection of health, AI, and Technology as a Software Engineer";
  const avatar = profile?.avatar_url || `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${slug}`;

  return (
    <div className="min-h-screen bg-background flex flex-col justify-between">
      <div>
        <PublicHeader />

        <div className="max-w-3xl mx-auto px-6 py-12">
          {/* Profile Card Header */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left mb-8">
            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-border/80 shadow-md shrink-0 bg-gradient-to-tr from-orange-500 to-red-500 flex items-center justify-center">
              <img
                src={avatar}
                alt={name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // If image fails, fallback to Dicebear avatar
                  e.currentTarget.src = `https://api.dicebear.com/7.x/initials/svg?seed=${name}`;
                }}
              />
            </div>
            
            <div className="space-y-2 flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="text-3xl font-display font-bold text-foreground">
                    {name}
                  </h1>
                  <p className="text-sm text-muted-foreground font-mono mt-0.5">
                    @{slug}
                  </p>
                </div>
              </div>

              <p className="text-sm text-foreground/80 leading-relaxed font-body max-w-xl">
                {bio}
              </p>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1 text-xs text-muted-foreground pt-1">
                <span>📅 Joined April 2025</span>
                <span>•</span>
                <span className="font-semibold text-foreground">7 Hosted</span>
                <span>•</span>
                <span className="font-semibold text-foreground">19 Attended</span>
              </div>

              <div className="pt-2 flex justify-center sm:justify-start">
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

          <hr className="border-border my-8" />

          {/* Past Events Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-display font-bold text-foreground">
                Past Events
              </h2>
              <Link to="/discover" className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors">
                View All
              </Link>
            </div>

            <div className="space-y-4">
              {events.map((event) => (
                <Link key={event.id} to={`/register/${event.slug || event.id}`} className="block group">
                  <Card className="overflow-hidden hover:shadow-md border-border/40 transition-all bg-card/40 hover:bg-card">
                    <div className="flex flex-col sm:flex-row items-stretch">
                      {/* Left: Square event image */}
                      <div className="w-full sm:w-28 h-28 shrink-0 overflow-hidden relative bg-muted">
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

                      {/* Right: Event Info */}
                      <CardContent className="p-4 flex-1 flex flex-col justify-between space-y-2">
                        <div className="space-y-1">
                          <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                            {format(new Date(event.event_date), "eee, MMM d, h:mm a")}
                          </p>
                          <h3 className="font-display font-bold text-sm text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                            {event.name}
                          </h3>
                        </div>

                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <img
                              src={avatar}
                              alt={name}
                              className="w-4 h-4 rounded-full object-cover border border-border"
                            />
                            <span>By {name}</span>
                          </div>
                          {event.location_value && (
                            <span className="font-semibold text-foreground text-[10px] bg-muted/60 px-2 py-0.5 rounded-full uppercase tracking-wider">
                              {event.location_value}
                            </span>
                          )}
                        </div>
                      </CardContent>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
