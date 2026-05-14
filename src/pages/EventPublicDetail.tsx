import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { format } from "date-fns";
import { MapPin, Users, Share2, Heart, ArrowLeft, Globe, Ticket, Clock, Play } from "lucide-react";
import { motion } from "framer-motion";
import PublicHeader from "@/components/PublicHeader";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { fetchEventBySlug, fetchUpcomingEvents, MockEvent } from "@/lib/mockEvents";
import { toast } from "sonner";
import LocationCard from "@/components/event-public/LocationCard";

export default function EventPublicDetail() {
  const { slug } = useParams();
  const [event, setEvent] = useState<MockEvent | null>(null);
  const [more, setMore] = useState<MockEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [registered, setRegistered] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [videoMuted, setVideoMuted] = useState(true); // Start muted so autoplay isn't blocked

  useEffect(() => {
    let active = true;
    setLoading(true);
    Promise.all([fetchEventBySlug(slug || ""), fetchUpcomingEvents()]).then(([e, all]) => {
      if (!active) return;
      setEvent(e);
      setMore(all.filter((x) => x.slug !== slug).slice(0, 3));
      setLoading(false);
    });
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
              <div className="flex flex-wrap gap-3">
                {event.hosts.map((h) => (
                  <div key={h.name} className="flex items-center gap-2.5 bg-card rounded-full pl-1 pr-4 py-1">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={h.avatar} alt={h.name} />
                      <AvatarFallback>{h.name[0]}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{h.name}</span>
                  </div>
                ))}
              </div>
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
            <div className="bg-card rounded-3xl p-5 sm:p-6 space-y-5">
              {/* Date block */}
              <div className="flex items-start gap-4">
                <div className="rounded-xl overflow-hidden border-0 bg-background w-14 shrink-0 text-center">
                  <div className="bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider py-1">
                    {format(date, "MMM")}
                  </div>
                  <div className="font-display font-bold text-2xl py-1.5">{format(date, "d")}</div>
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
                <div className="w-14 h-14 rounded-xl bg-muted grid place-items-center shrink-0">
                  {event.location === "Online" ? <Globe className="w-5 h-5" /> : <MapPin className="w-5 h-5" />}
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

      <Footer />
    </div>
  );
}
