import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { format } from "date-fns";
import { MapPin, Users, Share2, Heart, ArrowLeft, Globe, Ticket, Clock, Play, Twitter, Linkedin, Instagram, Link2, Star, StarHalf, ChevronRight, Calendar, Bookmark, Share, Facebook, Mail } from "lucide-react";
import { motion } from "framer-motion";
import PublicHeader from "@/components/PublicHeader";
import Footer from "@/components/layout/Footer";
import { DoodleIcon } from "@/components/DoodleIcon";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { fetchEventBySlug, fetchUpcomingEvents, MockEvent } from "@/lib/mockEvents";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import LocationCard from "@/components/event-public/LocationCard";
import OrganizerSocials from "@/components/event-public/OrganizerSocials";


// Native <video> with a robust autoplay fallback. Browsers block autoplay unless
// the element is muted; we start muted, then surface an "Unmute" affordance once
// playback begins. If autoplay is fully blocked, we show a Play overlay.
function FallbackVideo({ src, muted, onUnmute }: { src: string; muted: boolean; onUnmute: () => void }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [needsTap, setNeedsTap] = useState(false);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    v.muted = true; // required for cross-browser autoplay
    const p = v.play();
    if (p && typeof p.catch === "function") {
      p.catch(() => setNeedsTap(true));
    }
  }, [src]);

  return (
    <div className="relative w-full h-full">
      <video
        ref={ref}
        src={src}
        className="w-full h-full object-cover"
        playsInline
        autoPlay
        loop
      />
      {needsTap && (
        <button
          onClick={() => {
            const v = ref.current;
            if (v) v.play();
            setNeedsTap(false);
          }}
          className="absolute inset-0 w-full h-full flex items-center justify-center bg-black/40 text-white font-medium hover:bg-black/50 transition-colors"
        >
          <Play className="w-12 h-12 stroke-[1.5]" />
        </button>
      )}
      {!muted && (
        <button
          onClick={onUnmute}
          className="absolute bottom-4 right-4 bg-black/60 hover:bg-black/80 text-white px-3 py-1.5 rounded-full text-xs font-semibold"
        >
          Mute
        </button>
      )}
    </div>
  );
}

export default function EventPublicDetail() {
  const { slug } = useParams();
  const [event, setEvent] = useState<MockEvent | null>(null);
  const [more, setMore] = useState<MockEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [registered, setRegistered] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [videoMuted, setVideoMuted] = useState(true); // Start muted so autoplay isn't blocked
  const [showStickyBar, setShowStickyBar] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowStickyBar(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    
    const loadEventData = async () => {
      try {
        // 1. Try mock events first
        let resolvedEvent = await fetchEventBySlug(slug || "");
        
        // 2. Try Supabase database if mock is not found
        if (!resolvedEvent && slug) {
          const { data: dbEvent, error } = await supabase
            .from("events")
            .select("*, profiles(*)")
            .eq("slug", slug)
            .maybeSingle();

          if (dbEvent && !error) {
            const profile = dbEvent.profiles as any;
            const socialLinks = profile?.social_links || [];
            const socialsObj: Record<string, string> = {};

            if (Array.isArray(socialLinks)) {
              socialLinks.forEach((l: any) => {
                if (!l || typeof l !== "object") return;
                const platform = (l.platform || "").toLowerCase();
                if (platform.includes("twitter") || platform.includes("x")) {
                  socialsObj.twitter = l.url;
                } else if (platform.includes("linkedin")) {
                  socialsObj.linkedin = l.url;
                } else if (platform.includes("instagram")) {
                  socialsObj.instagram = l.url;
                } else if (platform.includes("website") || platform.includes("globe")) {
                  socialsObj.website = l.url;
                }
              });
            }
            if (profile?.website && !socialsObj.website) {
              socialsObj.website = profile.website;
            }

            resolvedEvent = {
              id: dbEvent.id,
              title: dbEvent.name,
              description: dbEvent.description || "",
              date: dbEvent.event_date || new Date().toISOString(),
              endDate: dbEvent.event_end_date || undefined,
              location: dbEvent.location_value || "Virtual",
              cover: dbEvent.background_image_url || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800",
              category: dbEvent.event_type || "Community",
              attendees: 0,
              capacity: dbEvent.capacity || undefined,
              slug: dbEvent.slug,
              hosts: [
                {
                  name: profile?.company || profile?.full_name || "Community Host",
                  avatar: profile?.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80",
                  socials: socialsObj
                }
              ]
            };
          }
        }

        const allUpcoming = await fetchUpcomingEvents();

        if (active) {
          setEvent(resolvedEvent);
          setMore(allUpcoming.filter((x) => x.slug !== slug).slice(0, 3));
          setLoading(false);
        }
      } catch (err) {
        console.error("Error loading public event detail:", err);
        if (active) setLoading(false);
      }
    };

    loadEventData();
    return () => { active = false; };
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <PublicHeader />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 animate-pulse">
          <div className="h-8 w-40 bg-muted rounded-full mb-6" />
          <div className="grid lg:grid-cols-[1fr,360px] gap-8">
            <div className="aspect-[16/10] bg-muted rounded-3xl" />
            <div className="space-y-4">
              <div className="h-32 bg-muted rounded-3xl" />
              <div className="h-48 bg-muted rounded-3xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-background">
        <PublicHeader />
        <div className="max-w-3xl mx-auto px-6 py-24 text-center">
          <p className="text-6xl mb-4">🔍</p>
          <h1 className="font-display text-3xl font-bold mb-2">Event not found</h1>
          <p className="text-muted-foreground mb-6">This event may have been removed or the link is incorrect.</p>
          <Button asChild className="rounded-full"><Link to="/events">Browse events</Link></Button>
        </div>
      </div>
    );
  }

  const date = new Date(event.date);
  const endDate = event.endDate ? new Date(event.endDate) : new Date(date.getTime() + 2 * 60 * 60 * 1000);
  
  // Calculate if event is in the past
  const isPastEvent = endDate < new Date();
  
  // Mock flag to display the manage access strip
  const hasManageAccess = true; 

  const handleRegister = () => {
    setRegistered(true);
    toast.success(`You're going to ${event.title}!`);
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ title: event.title, url }); } catch {}
    } else {
      navigator.clipboard.writeText(url);
      toast.success("Link copied");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />

      {/* Manage Access Strip */}
      {hasManageAccess && (
        <div className="bg-pink-100 dark:bg-primary/10 border-b border-pink-200 dark:border-primary/20 px-4 sm:px-6 py-2.5 flex items-center justify-between w-full">
          <p className="text-sm font-medium text-pink-600 dark:text-primary">You have manage access for this event.</p>
          <Button size="sm" asChild className="h-7 rounded-full bg-pink-500 hover:bg-pink-600 dark:bg-primary dark:hover:bg-primary/90 text-white font-semibold text-xs px-3">
            <Link to={`/dashboard/events/${event.id}`}>Manage ↗</Link>
          </Button>
        </div>
      )}

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-20">
        <Link to="/events" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4 mr-1" /> All events
        </Link>

        <div className="grid lg:grid-cols-[1fr,380px] gap-8 lg:gap-12 items-start">
          {/* Left column */}
          <div className="space-y-8">
            {/* Cover — image OR embedded video */}
            <motion.div
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              className="relative aspect-[16/10] rounded-3xl overflow-hidden bg-muted group"
            >
              {playing && event.videoUrl ? (
                event.videoUrl.includes("youtube") || event.videoUrl.includes("vimeo") ? (
                  // Browsers block autoplay unless muted — start muted, user can unmute via player controls.
                  <iframe
                    src={`${event.videoUrl}${event.videoUrl.includes("?") ? "&" : "?"}autoplay=1&mute=1&muted=1&rel=0&modestbranding=1&playsinline=1`}
                    title={event.title}
                    className="w-full h-full"
                    allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                    allowFullScreen
                  />
                ) : (
                  <FallbackVideo src={event.videoUrl} muted={videoMuted} onUnmute={() => setVideoMuted(false)} />
                )
              ) : (
                <>
                  <img src={event.cover} alt={event.title} className="w-full h-full object-cover" />
                  {event.videoUrl && (
                    <button
                      onClick={() => setPlaying(true)}
                      aria-label="Play event video"
                      className="absolute inset-0 grid place-items-center bg-black/20 hover:bg-black/30 transition-colors"
                    >
                      <span className="w-16 h-16 rounded-full bg-white/95 grid place-items-center shadow-xl group-hover:scale-110 transition-transform">
                        <Play className="w-7 h-7 text-foreground ml-0.5" fill="currentColor" />
                      </span>
                    </button>
                  )}
                </>
              )}
              {event.featured && !playing && (
                <Badge className="absolute top-4 left-4 bg-primary text-primary-foreground border-0 rounded-full px-3 py-1">
                  Featured
                </Badge>
              )}
            </motion.div>

            {/* Title */}
            <div>
              <p className="text-sm text-muted-foreground mb-2">{event.category} · {event.city}</p>
              <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-[-0.02em] leading-[1.05]">
                {event.title}
              </h1>
            </div>

            {/* Hosted by */}
            <section>
              <h2 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-3">Hosted by</h2>
              <OrganizerSocials hosts={event.hosts} />
              
              {isPastEvent && (
                <div className="mt-4 flex items-center gap-4 bg-muted/40 hover:bg-muted/60 transition-colors p-3 pr-4 rounded-2xl cursor-pointer w-fit border border-border/50">
                  <div className="w-[72px] h-[48px] rounded-lg overflow-hidden shrink-0 bg-[#19192E]">
                    <img src={event.cover} className="w-full h-full object-cover opacity-80" alt="Group" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm flex items-center gap-1 text-foreground hover:text-primary transition-colors">
                      {event.title} Organizer <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                    </h3>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-sm font-medium text-foreground/80">4.8</span>
                      <div className="flex text-pink-500">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <StarHalf className="w-3.5 h-3.5 fill-current" />
                      </div>
                      <span className="text-xs text-muted-foreground ml-1">26 reviews</span>
                    </div>
                  </div>
                </div>
              )}
            </section>

            {/* About */}
            <section>
              <h2 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-3">About this event</h2>
              <div className="prose prose-sm max-w-none text-foreground/90 space-y-4">
                <p>
                  Join us for <strong>{event.title}</strong> — an unforgettable {event.category.toLowerCase()} gathering
                  bringing together builders, thinkers, and the curious. Expect inspiring talks,
                  hands-on demos, and warm conversation over good food and drinks.
                </p>
                <p>
                  Whether you're shipping your first project or your fiftieth, you'll leave with new
                  ideas, new friends, and a renewed sense of momentum. Doors open 30 minutes before start.
                </p>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li>Curated keynotes from industry leaders</li>
                  <li>Hands-on workshops and live demos</li>
                  <li>Networking with {event.attendees.toLocaleString()}+ attendees</li>
                  <li>Food, drinks, and parting gifts</li>
                </ul>
              </div>
            </section>

            {/* Location */}
            <LocationCard
              venue={event.location}
              address={event.city}
              mode={event.location === "Online" || event.city === "Online" ? "virtual" : "physical"}
            />

            {/* Attendees preview */}
            <section>
              <div className="flex items-end justify-between mb-3">
                <h2 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                  {event.attendees.toLocaleString()} going
                </h2>
                <button className="text-xs text-primary font-semibold hover:underline">See all</button>
              </div>
              <div className="flex -space-x-2">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Avatar key={i} className="w-10 h-10 ring-2 ring-background">
                    <AvatarImage src={`https://i.pravatar.cc/80?img=${(i + 3) * 4}`} />
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                ))}
                <div className="w-10 h-10 rounded-full bg-muted ring-2 ring-background grid place-items-center text-xs font-semibold">
                  +{Math.max(0, event.attendees - 8)}
                </div>
              </div>
            </section>
          </div>

          {/* Right column — sticky CTA */}
          <aside className="lg:sticky lg:top-20 space-y-4">
            {isPastEvent ? (
              <div className="bg-card rounded-3xl p-5 sm:p-6 shadow-sm border border-border/40">
                <div className="mb-6">
                  <img src={event.hosts[0]?.avatar} alt={event.hosts[0]?.name} className="w-10 h-10 object-cover rounded-full mb-3 ring-2 ring-background" />
                  <h3 className="font-display font-bold text-xl mb-0.5">Thank You for Joining</h3>
                  <p className="text-sm text-muted-foreground">We hope you enjoyed the event!</p>
                </div>

                <div className="space-y-4">
                  <div className="border-t border-border/30 pt-4">
                    <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-2.5">Hosted By</p>
                    <div className="flex items-center gap-2.5">
                      <img src={event.hosts[0]?.avatar} alt={event.hosts[0]?.name} className="w-6 h-6 object-cover rounded-full" />
                      <span className="text-sm font-medium">{event.hosts[0]?.name}</span>
                    </div>
                  </div>

                  <div className="border-t border-border/30 pt-4">
                    <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-2.5">{event.attendees.toLocaleString()} Went</p>
                    <div className="flex items-center gap-2.5">
                      <div className="flex -space-x-1.5">
                        <img src="https://i.pravatar.cc/80?img=12" className="w-6 h-6 rounded-full ring-2 ring-card" />
                        <div className="w-6 h-6 rounded-full bg-primary/20 ring-2 ring-card flex items-center justify-center text-[10px]">🙂</div>
                      </div>
                      <p className="text-xs font-medium text-foreground">Including {event.hosts[0]?.name}</p>
                    </div>
                  </div>

                  <div className="border-t border-border/30 pt-4">
                    <button className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium mb-4 block">Contact the Host</button>
                    <div className="inline-flex items-center px-2.5 py-1 rounded-full border border-border/50 text-xs font-medium text-muted-foreground bg-muted/30">
                      # {event.category}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-card rounded-3xl p-5 sm:p-6 space-y-5">
                {/* Date block */}
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 shrink-0 grid place-items-center">
                    <DoodleIcon icon={Calendar} colorClass="bg-pink-400 dark:bg-pink-500/80" size={24} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold">{format(date, "EEEE, MMM d")}</p>
                    <p className="text-sm text-muted-foreground inline-flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {format(date, "h:mm a")} – {format(endDate, "h:mm a")}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 shrink-0 grid place-items-center">
                    <DoodleIcon icon={event.location === "Online" ? Globe : MapPin} colorClass="bg-orange-300 dark:bg-orange-500/80" size={24} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold truncate">{event.location}</p>
                    <p className="text-sm text-muted-foreground">{event.city}</p>
                  </div>
                </div>

                <div className="h-px bg-border" />

                {registered ? (
                  <div className="space-y-2">
                    <div className="bg-success/10 text-success rounded-2xl p-4 text-center">
                      <p className="font-display font-bold text-lg">You're going! 🎉</p>
                      <p className="text-xs mt-1 opacity-80">A confirmation has been sent.</p>
                    </div>
                    <Button variant="outline" className="w-full rounded-full h-11" asChild>
                      <Link to={`/register/${event.slug}`}>Manage registration</Link>
                    </Button>
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-center text-muted-foreground">
                      Welcome! Please tap below to register.
                    </p>
                    <Button onClick={handleRegister} className="w-full rounded-full h-12 text-base font-semibold">
                      <Ticket className="w-4 h-4 mr-2" /> Register
                    </Button>
                  </>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <Button onClick={handleShare} variant="outline" className="rounded-full h-10">
                    <Share2 className="w-4 h-4 mr-1.5" /> Share
                  </Button>
                  <Button variant="outline" className="rounded-full h-10" onClick={() => toast.success("Saved to your interests")}>
                    <Heart className="w-4 h-4 mr-1.5" /> Save
                  </Button>
                </div>
              </div>
            )}

            {/* Stats card */}
            <div className="bg-card rounded-3xl p-5 sm:p-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Going</p>
                  <p className="font-display font-bold text-2xl mt-1">{event.attendees.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Category</p>
                  <p className="font-display font-bold text-lg mt-1">{event.category}</p>
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* More events */}
        {more.length > 0 && (
          <section className="mt-20">
            <div className="flex items-end justify-between mb-6">
              <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-[-0.02em]">More events</h2>
              <Link to="/events" className="text-sm font-semibold text-primary hover:underline">Browse all</Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {more.map((e) => (
                <Link key={e.id} to={`/events/${e.slug}`} className="group block bg-card rounded-2xl overflow-hidden hover:-translate-y-0.5 transition-transform">
                  <div className="aspect-[16/10] overflow-hidden">
                    <img src={e.cover} alt={e.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="p-4">
                    <p className="text-xs text-muted-foreground mb-1">{format(new Date(e.date), "EEE, MMM d · h:mm a")}</p>
                    <h3 className="font-display font-bold text-base leading-snug line-clamp-2 group-hover:text-primary transition-colors">{e.title}</h3>
                    <p className="text-xs text-muted-foreground mt-2 inline-flex items-center gap-1">
                      <Users className="w-3 h-3" /> {e.attendees.toLocaleString()} going
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Sticky Bottom Action Bar */}
      <div className={`fixed bottom-0 left-0 right-0 p-4 sm:p-6 pointer-events-none z-50 flex justify-center transition-all duration-300 ${showStickyBar ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"}`}>
        <div className="bg-background border border-border shadow-2xl rounded-full pl-6 pr-3 py-2 flex items-center justify-between gap-4 sm:gap-8 max-w-4xl w-full pointer-events-auto ring-1 ring-border/50">
          {/* Left side: Event info */}
          <div className="hidden sm:block min-w-0 flex-1">
             <p className="text-[11px] text-muted-foreground font-semibold">{format(date, "EEE, MMM d · h:mm a")}</p>
             <p className="font-display font-bold text-sm truncate">{event.title}</p>
          </div>
          {/* Right side: Actions */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0 w-full sm:w-auto justify-between sm:justify-end">
            <Badge variant="outline" className="rounded-full px-3 h-9 hidden md:inline-flex bg-background font-semibold">Free</Badge>
            <div className="flex items-center gap-1.5">
              <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 shrink-0 text-muted-foreground hover:text-foreground"><Bookmark className="w-5 h-5" /></Button>
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="secondary" size="icon" className="rounded-full h-10 w-10 shrink-0 bg-primary/5 hover:bg-primary/10 text-primary">
                    <Share className="w-4 h-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md p-0 rounded-[32px] overflow-hidden gap-0 bg-background border-border shadow-2xl">
                   <div className="p-6 pb-4 flex flex-col items-center">
                      <h2 className="text-base font-bold mb-6">Share</h2>
                      
                      {/* Social Icons row */}
                      <div className="flex justify-center gap-4 sm:gap-6 w-full px-4">
                        <button className="flex flex-col items-center gap-2 group">
                          <div className="w-12 h-12 rounded-full border border-border flex items-center justify-center group-hover:bg-muted transition-colors"><Link2 className="w-5 h-5 text-foreground" /></div>
                          <span className="text-[10px] font-medium text-muted-foreground">Copy link</span>
                        </button>
                        <button className="flex flex-col items-center gap-2 group">
                          <div className="w-12 h-12 rounded-full border border-border flex items-center justify-center group-hover:bg-muted transition-colors"><Facebook className="w-5 h-5 text-[#1877F2]" /></div>
                          <span className="text-[10px] font-medium text-muted-foreground">Facebook</span>
                        </button>
                        <button className="flex flex-col items-center gap-2 group">
                          <div className="w-12 h-12 rounded-full border border-border flex items-center justify-center group-hover:bg-muted transition-colors"><Linkedin className="w-5 h-5 text-[#0A66C2]" /></div>
                          <span className="text-[10px] font-medium text-muted-foreground">LinkedIn</span>
                        </button>
                        <button className="flex flex-col items-center gap-2 group">
                          <div className="w-12 h-12 rounded-full border border-border flex items-center justify-center group-hover:bg-muted transition-colors"><Twitter className="w-5 h-5 text-foreground" /></div>
                          <span className="text-[10px] font-medium text-muted-foreground">X</span>
                        </button>
                        <button className="flex flex-col items-center gap-2 group">
                          <div className="w-12 h-12 rounded-full border border-border flex items-center justify-center group-hover:bg-muted transition-colors"><Mail className="w-5 h-5 text-foreground" /></div>
                          <span className="text-[10px] font-medium text-muted-foreground">Email</span>
                        </button>
                      </div>

                      <div className="relative w-full flex items-center py-6 mt-2">
                        <div className="flex-grow border-t border-border/60"></div>
                        <span className="shrink-0 px-4 text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">or share a flyer</span>
                        <div className="flex-grow border-t border-border/60"></div>
                      </div>

                      {/* Flyer Carousel */}
                      <div className="w-full relative px-2 pb-4 -mx-6">
                         <div className="flex overflow-x-auto snap-x gap-4 scrollbar-hide py-2 px-6">
                            {/* Template 1 (Dark) */}
                            <div className="w-[200px] h-[280px] shrink-0 snap-center rounded-2xl bg-[#19192E] text-white p-5 relative overflow-hidden shadow-sm border border-[#19192E]/20 cursor-pointer hover:-translate-y-1 transition-transform">
                               <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl rounded-full translate-x-10 -translate-y-10" />
                               <div className="relative z-10 h-full flex flex-col">
                                  <Logo size="sm" className="mb-auto opacity-90 [&_span]:!text-white" />
                                  <div className="mt-auto space-y-3">
                                    <h3 className="font-display font-bold text-lg leading-tight">{event.title}</h3>
                                    <div className="flex items-center gap-2">
                                      <div className="w-10 h-10 rounded-lg bg-white/10 grid place-items-center shrink-0">
                                        <span className="text-[8px] font-bold uppercase">{format(date, "MMM")}</span>
                                        <span className="text-sm font-bold leading-none">{format(date, "d")}</span>
                                      </div>
                                      <p className="text-[10px] text-white/70 line-clamp-2">{event.location}, {event.city}</p>
                                    </div>
                                    <div className="pt-2 border-t border-white/10 flex justify-between items-center">
                                      <span className="text-[10px] font-medium opacity-60">By {event.hosts[0]?.name}</span>
                                      <span className="text-[10px] font-bold text-primary">Attend on Eventspark</span>
                                    </div>
                                  </div>
                               </div>
                            </div>
                            {/* Template 2 (Vibrant) */}
                            <div className="w-[200px] h-[280px] shrink-0 snap-center rounded-2xl bg-gradient-to-br from-orange-300 via-pink-400 to-primary text-white p-5 relative overflow-hidden shadow-sm cursor-pointer hover:-translate-y-1 transition-transform">
                               <div className="absolute inset-0 bg-black/10 mix-blend-overlay" style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")', opacity: 0.4}} />
                               <div className="relative z-10 h-full flex flex-col bg-background/95 rounded-xl p-3 text-foreground">
                                  <Logo size="sm" className="mb-auto" />
                                  <div className="mt-auto space-y-2">
                                    <h3 className="font-display font-bold text-sm leading-tight">{event.title}</h3>
                                    <p className="text-[9px] font-semibold text-primary">{format(date, "EEE, MMM d · h:mm a")}</p>
                                    <p className="text-[9px] text-muted-foreground line-clamp-2">{event.location}</p>
                                  </div>
                               </div>
                            </div>
                         </div>
                      </div>
                   </div>
                </DialogContent>
              </Dialog>

              <Button className="rounded-full h-11 px-8 font-semibold bg-[#19192E] text-white hover:bg-[#19192E]/90 shrink-0 ml-1 shadow-md">Attend</Button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
