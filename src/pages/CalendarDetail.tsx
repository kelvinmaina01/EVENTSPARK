import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, ArrowRight, Calendar, Globe, MapPin, Users, 
  ExternalLink, Share2, LayoutGrid, List, Check, Plus, Mail, Star, StarHalf, MessageSquare
} from "lucide-react";
import { format } from "date-fns";
import PublicHeader from "@/components/PublicHeader";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { getCalendarBySlug, FeaturedCalendar, CalendarEvent } from "@/lib/mockEvents";

const SOCIAL_ICONS: Record<string, string> = {
  twitter: "https://cdn.simpleicons.org/x/ffffff",
  linkedin: "https://cdn.simpleicons.org/linkedin/ffffff",
  instagram: "https://cdn.simpleicons.org/instagram/ffffff",
};

function EventCard({ event }: { event: CalendarEvent }) {
  return (
    <Link to={`/events/${event.slug}`} className="group block">
      <div className="bg-card border border-border/40 rounded-2xl overflow-hidden hover:border-border hover:shadow-md transition-all duration-300">
        <div className="aspect-[16/10] overflow-hidden relative">
          <img src={event.cover} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          <div className="absolute top-3 left-3">
            <Badge className="text-[10px] uppercase tracking-wider font-bold shadow-sm">{event.category}</Badge>
          </div>
        </div>
        <div className="p-5 space-y-3">
          <p className="text-xs text-primary font-semibold uppercase tracking-wide">
            {format(new Date(event.date), "EEE, MMM d · h:mm a")}
          </p>
          <h3 className="font-display font-bold text-base leading-snug group-hover:text-primary transition-colors line-clamp-2">
            {event.title}
          </h3>
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border/30">
            <span className="flex items-center gap-1 truncate"><MapPin className="w-3 h-3 shrink-0" /> {event.location}</span>
            <span className="flex items-center gap-1 shrink-0 font-medium text-foreground"><Users className="w-3.5 h-3.5 text-primary" /> {event.attendees}</span>
          </div>
          {event.hosts[0] && (
            <div className="flex items-center gap-2 pt-1">
              <img src={event.hosts[0].avatar} alt={event.hosts[0].name} className="w-5 h-5 rounded-full object-cover bg-muted" />
              <span className="text-xs text-muted-foreground">By <span className="font-medium text-foreground">{event.hosts[0].name}</span></span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

function EventListRow({ event }: { event: CalendarEvent }) {
  return (
    <Link to={`/events/${event.slug}`} className="group block">
      <div className="bg-card border border-border/40 rounded-2xl p-4 sm:p-5 hover:border-border hover:shadow-sm transition-all duration-300">
        <div className="flex gap-4 sm:gap-5">
          <div className="w-20 h-20 sm:w-24 sm:h-20 rounded-xl overflow-hidden shrink-0 bg-muted">
            <img src={event.cover} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          </div>
          <div className="flex-1 min-w-0 space-y-1.5">
            <p className="text-xs text-primary font-semibold uppercase tracking-wide">
              {format(new Date(event.date), "EEE, MMM d · h:mm a")}
            </p>
            <h3 className="font-display font-bold text-[15px] leading-snug group-hover:text-primary transition-colors line-clamp-1">
              {event.title}
            </h3>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {event.location}</span>
              <span className="flex items-center gap-1 font-medium text-foreground"><Users className="w-3.5 h-3.5 text-primary" /> {event.attendees} going</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function CalendarDetail() {
  const { calendarSlug } = useParams();
  const navigate = useNavigate();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [inviteEmail, setInviteEmail] = useState("");

  const calendar = getCalendarBySlug(calendarSlug || "");

  if (!calendar) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <PublicHeader />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4 max-w-md">
            <div className="w-16 h-16 rounded-2xl bg-muted grid place-items-center text-3xl mx-auto">📅</div>
            <h1 className="text-2xl font-display font-bold">Calendar Not Found</h1>
            <p className="text-muted-foreground text-sm">This community calendar doesn't exist or hasn't been set up yet.</p>
            <Button onClick={() => navigate("/calendars")} variant="outline" className="rounded-full">
              <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Calendars
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Initialize subscription state from the mock data
  if (!isSubscribed && calendar.subscribed) {
    setIsSubscribed(true);
  }

  const handleSubscribe = () => {
    setIsSubscribed(!isSubscribed);
    if (!isSubscribed) {
      toast.success(`Subscribed to ${calendar.name}! 🎉`, {
        description: "You'll be notified about new events from this calendar.",
      });
    } else {
      toast.success(`Unsubscribed from ${calendar.name}`);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard!");
  };

  const handleInviteFriends = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;
    toast.success(`Invitation sent to ${inviteEmail}! 📬`, {
      description: `They will receive an invitation to subscribe to ${calendar.name}.`
    });
    setInviteEmail("");
  };

  const allEvents = [...calendar.upcomingEvents, ...calendar.pastEvents];
  
  // Mock flag to display the manage access strip
  const hasManageAccess = true;

  const MOCK_REVIEWS = [
    { id: 1, name: "Sarah Jenkins", avatar: "https://i.pravatar.cc/150?img=1", rating: 5, date: "2 weeks ago", text: "Incredible events! The attention to detail in their workshops is unmatched. Highly recommend subscribing." },
    { id: 2, name: "David Chen", avatar: "https://i.pravatar.cc/150?img=11", rating: 5, date: "1 month ago", text: "Best tech meetups in the city. Always great speakers and perfect organization." },
    { id: 3, name: "Elena Rodriguez", avatar: "https://i.pravatar.cc/150?img=5", rating: 4, date: "1 month ago", text: "Really good networking opportunities. Sometimes the venues get a bit crowded though." },
    { id: 4, name: "Michael Chang", avatar: "https://i.pravatar.cc/150?img=15", rating: 5, date: "2 months ago", text: "I've met my co-founder at one of their events. Life changing community." },
    { id: 5, name: "Jessica Smith", avatar: "https://i.pravatar.cc/150?img=9", rating: 5, date: "2 months ago", text: "Consistently high quality gatherings. The organizers are so welcoming." },
    { id: 6, name: "Tom Baker", avatar: "https://i.pravatar.cc/150?img=14", rating: 4, date: "3 months ago", text: "Great content, but I wish they had more morning events to balance the schedule." },
    { id: 7, name: "Anita Desai", avatar: "https://i.pravatar.cc/150?img=20", rating: 5, date: "4 months ago", text: "The variety of topics covered is amazing. I always learn something new." },
    { id: 8, name: "Chris Wilson", avatar: "https://i.pravatar.cc/150?img=33", rating: 5, date: "5 months ago", text: "Super well organized. The check-in process is seamless every single time." },
    { id: 9, name: "Laura Palmer", avatar: "https://i.pravatar.cc/150?img=44", rating: 5, date: "6 months ago", text: "Love the community they've built here. 10/10." },
    { id: 10, name: "James Holden", avatar: "https://i.pravatar.cc/150?img=55", rating: 4, date: "6 months ago", text: "Solid events, good speakers. Will definitely attend more in the future." },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PublicHeader />

      {/* Manage Access Strip */}
      {hasManageAccess && (
        <div className="bg-pink-100 dark:bg-primary/10 border-b border-pink-200 dark:border-primary/20 px-4 sm:px-6 py-2.5 flex items-center justify-between w-full">
          <p className="text-sm font-medium text-pink-600 dark:text-primary">You have manage access for this calendar.</p>
          <Button size="sm" asChild className="h-7 rounded-full bg-pink-500 hover:bg-pink-600 dark:bg-primary dark:hover:bg-primary/90 text-white font-semibold text-xs px-3">
            <Link to={`/dashboard/calendar`}>Manage ↗</Link>
          </Button>
        </div>
      )}

      {/* Hero Banner */}
      <div className="relative w-full h-[260px] sm:h-[340px] overflow-hidden bg-[#19192E]">
        <img
          src={calendar.coverImage}
          alt={calendar.name}
          className="w-full h-full object-cover opacity-60 scale-100 mix-blend-luminosity"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#19192E] via-[#19192E]/80 to-primary/40" />

        <div className="absolute inset-0 max-w-6xl w-full mx-auto px-4 sm:px-6 flex flex-col justify-end pb-8 sm:pb-10">
          <Button
            onClick={() => navigate(-1)}
            variant="ghost"
            size="sm"
            className="w-fit mb-5 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/10 backdrop-blur-md shadow-sm gap-1.5 px-3.5 h-8 text-xs font-semibold"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </Button>

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-card/90 backdrop-blur-sm border border-white/20 flex items-center justify-center text-3xl sm:text-4xl shadow-lg shrink-0">
                {calendar.icon}
              </div>
              <div>
                <h1 className="text-2xl sm:text-4xl font-display font-extrabold text-white tracking-tight drop-shadow-md leading-tight">
                  {calendar.name}
                </h1>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2">
                  <p className="text-xs sm:text-sm text-zinc-300 flex items-center gap-3 font-medium">
                    <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {calendar.events} events</span>
                    <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {calendar.followers.toLocaleString()} followers</span>
                  </p>
                  
                  {/* Rating Block */}
                  <div className="hidden sm:block w-1 h-1 rounded-full bg-white/30" />
                  <div className="flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity">
                    <span className="text-sm font-semibold text-white">4.8</span>
                    <div className="flex text-pink-400">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <StarHalf className="w-3.5 h-3.5 fill-current" />
                    </div>
                    <span className="text-xs text-white/70 ml-0.5 underline underline-offset-2">128 reviews</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <Button
                onClick={handleSubscribe}
                className={`rounded-full h-10 px-5 text-sm font-semibold shadow-md transition-all ${
                  isSubscribed
                    ? "bg-white/15 text-white border border-white/30 hover:bg-white/25 backdrop-blur-sm"
                    : "bg-primary text-primary-foreground hover:bg-primary/90"
                }`}
              >
                {isSubscribed ? <><Check className="w-4 h-4 mr-1.5" /> Subscribed</> : <><Plus className="w-4 h-4 mr-1.5" /> Subscribe</>}
              </Button>
              <Button
                onClick={handleShare}
                variant="ghost"
                size="icon"
                className="rounded-full w-10 h-10 bg-white/10 hover:bg-white/20 text-white border border-white/10 backdrop-blur-sm"
              >
                <Share2 className="w-4 h-4" />
              </Button>
              <Button
                onClick={() => document.getElementById('reviews')?.scrollIntoView({ behavior: 'smooth' })}
                variant="ghost"
                size="icon"
                className="rounded-full w-10 h-10 bg-white/10 hover:bg-white/20 text-white border border-white/10 backdrop-blur-sm hidden sm:inline-flex"
                title="Write a review"
              >
                <MessageSquare className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-10">
        <div className="grid lg:grid-cols-[1fr,320px] gap-10">

          {/* Left Column: Events */}
          <div className="space-y-10">

            {/* About Section (mobile-visible, desktop hidden since sidebar has it) */}
            <div className="lg:hidden space-y-4">
              <div className="space-y-2">
                <h2 className="font-display font-bold text-lg">About</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">{calendar.longDescription}</p>
              </div>

              {/* Invite Friends (mobile) */}
              {isSubscribed && (
                <div className="bg-card border border-border/50 rounded-2xl p-5 space-y-3 bg-gradient-to-br from-primary/5 to-transparent">
                  <h3 className="font-display font-bold text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Mail className="w-4 h-4 text-primary" /> Invite Friends
                  </h3>
                  <p className="text-xs text-muted-foreground font-medium">
                    Invite your friends to subscribe to {calendar.name} via email.
                  </p>
                  <form onSubmit={handleInviteFriends} className="flex gap-2">
                    <input
                      type="email"
                      placeholder="friend@email.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      className="flex-1 h-9 px-3 rounded-full border border-border bg-background text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      required
                    />
                    <Button type="submit" size="sm" className="h-9 rounded-full text-xs font-semibold px-4">
                      Invite
                    </Button>
                  </form>
                </div>
              )}
            </div>

            {/* Upcoming Events */}
            {calendar.upcomingEvents.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl sm:text-2xl font-display font-bold tracking-tight flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Upcoming Events
                  </h2>
                  <div className="flex border border-border rounded-lg overflow-hidden">
                    <button
                      onClick={() => setViewMode("list")}
                      className={`p-2 transition-colors ${viewMode === "list" ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:bg-muted"}`}
                    >
                      <List className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`p-2 transition-colors ${viewMode === "grid" ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:bg-muted"}`}
                    >
                      <LayoutGrid className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {viewMode === "grid" ? (
                  <div className="grid sm:grid-cols-2 gap-5">
                    {calendar.upcomingEvents.map((ev) => (
                      <EventCard key={ev.id} event={ev} />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {calendar.upcomingEvents.map((ev) => (
                      <EventListRow key={ev.id} event={ev} />
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* Past Events */}
            {calendar.pastEvents.length > 0 && (
              <section>
                <h2 className="text-xl sm:text-2xl font-display font-bold tracking-tight mb-6 text-muted-foreground">
                  Past Events
                </h2>
                {viewMode === "grid" ? (
                  <div className="grid sm:grid-cols-2 gap-5 opacity-75">
                    {calendar.pastEvents.map((ev) => (
                      <EventCard key={ev.id} event={ev} />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3 opacity-75">
                    {calendar.pastEvents.map((ev) => (
                      <EventListRow key={ev.id} event={ev} />
                    ))}
                  </div>
                )}
              </section>
            )}

            {allEvents.length === 0 && (
              <div className="text-center py-16 rounded-2xl bg-card border border-dashed border-border/40">
                <Calendar className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                <h3 className="font-display font-bold text-lg mb-1">No events yet</h3>
                <p className="text-sm text-muted-foreground">Check back soon for upcoming events from {calendar.name}.</p>
              </div>
            )}

            {/* Reviews Section */}
            <section id="reviews" className="pt-8 mt-8 border-t border-border/40">
              <div className="flex items-end justify-between mb-6">
                <div>
                  <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
                    Community Reviews
                  </h2>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-lg font-bold">4.8</span>
                    <div className="flex text-pink-500">
                      <Star className="w-4 h-4 fill-current" />
                      <Star className="w-4 h-4 fill-current" />
                      <Star className="w-4 h-4 fill-current" />
                      <Star className="w-4 h-4 fill-current" />
                      <StarHalf className="w-4 h-4 fill-current" />
                    </div>
                    <span className="text-sm text-muted-foreground ml-1">based on 128 reviews</span>
                  </div>
                </div>
                <Button className="rounded-full bg-primary hover:bg-primary/90 text-white h-9 px-4 text-sm font-semibold hidden sm:inline-flex">
                  Write a review
                </Button>
              </div>

              {/* Reviews Stack */}
              <div className="space-y-4">
                {MOCK_REVIEWS.slice(0, 2).map((review) => (
                  <div key={review.id} className="bg-card rounded-2xl p-5 border border-border/40">
                    <div className="flex items-center gap-3 mb-3">
                      <img src={review.avatar} alt={review.name} className="w-10 h-10 rounded-full bg-muted object-cover" />
                      <div>
                        <p className="text-sm font-bold leading-tight">{review.name}</p>
                        <p className="text-xs text-muted-foreground">{review.date}</p>
                      </div>
                    </div>
                    <div className="flex text-pink-500 mb-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? 'fill-current' : 'text-muted stroke-current'}`} />
                      ))}
                    </div>
                    <p className="text-sm text-foreground/90 leading-relaxed">
                      "{review.text}"
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right Column: Sidebar */}
          <div className="hidden lg:block space-y-6 self-start sticky top-20">

            {/* About Card */}
            <div className="bg-card border border-border/50 rounded-2xl p-6 space-y-4">
              <h3 className="font-display font-bold text-sm uppercase tracking-wider text-muted-foreground">About</h3>
              <p className="text-sm text-foreground leading-relaxed">{calendar.longDescription}</p>

              {/* Host */}
              <div className="flex items-center gap-3 pt-2 border-t border-border/30">
                <img src={calendar.host.avatar} alt={calendar.host.name} className="w-9 h-9 rounded-full object-cover bg-muted border border-border" />
                <div>
                  <p className="text-sm font-semibold leading-tight">{calendar.host.name}</p>
                  <p className="text-[11px] text-muted-foreground">Organizer</p>
                </div>
              </div>
            </div>

            {/* Invite Friends Card (desktop) */}
            {isSubscribed && (
              <div className="bg-card border border-border/50 rounded-2xl p-6 space-y-4 bg-gradient-to-br from-primary/5 to-transparent">
                <h3 className="font-display font-bold text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-primary" /> Invite Friends
                </h3>
                <p className="text-xs text-muted-foreground">
                  Invite your friends to subscribe to {calendar.name} via email to stay updated together.
                </p>
                <form onSubmit={handleInviteFriends} className="space-y-2.5">
                  <input
                    type="email"
                    placeholder="friend@email.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="w-full h-9 px-3 rounded-full border border-border bg-background text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    required
                  />
                  <Button type="submit" size="sm" className="w-full h-9 rounded-full text-xs font-semibold">
                    Send Invitation
                  </Button>
                </form>
              </div>
            )}

            {/* Socials Card */}
            <div className="bg-card border border-border/50 rounded-2xl p-6 space-y-4">
              <h3 className="font-display font-bold text-sm uppercase tracking-wider text-muted-foreground">Connect</h3>
              <div className="flex flex-wrap gap-2.5">
                {calendar.socials.website && (
                  <a href={calendar.socials.website} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full bg-muted hover:bg-muted/70 text-sm font-medium transition-colors">
                    <Globe className="w-3.5 h-3.5" /> Website
                  </a>
                )}
                {calendar.socials.twitter && (
                  <a href={calendar.socials.twitter} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full bg-muted hover:bg-muted/70 text-sm font-medium transition-colors">
                    <img src={SOCIAL_ICONS.twitter} alt="X" className="w-3.5 h-3.5 dark:invert-0 invert" /> Twitter / X
                  </a>
                )}
                {calendar.socials.linkedin && (
                  <a href={calendar.socials.linkedin} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full bg-muted hover:bg-muted/70 text-sm font-medium transition-colors">
                    <img src={SOCIAL_ICONS.linkedin} alt="LinkedIn" className="w-3.5 h-3.5 dark:invert-0 invert" /> LinkedIn
                  </a>
                )}
                {calendar.socials.instagram && (
                  <a href={calendar.socials.instagram} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full bg-muted hover:bg-muted/70 text-sm font-medium transition-colors">
                    <img src={SOCIAL_ICONS.instagram} alt="Instagram" className="w-3.5 h-3.5 dark:invert-0 invert" /> Instagram
                  </a>
                )}
              </div>
            </div>

            {/* Stats Card */}
            <div className="bg-card border border-border/50 rounded-2xl p-6">
              <h3 className="font-display font-bold text-sm uppercase tracking-wider text-muted-foreground mb-4">Stats</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 rounded-xl bg-[#19192E] shadow-sm border border-[#19192E]/50">
                  <p className="text-2xl font-display font-extrabold text-primary drop-shadow-sm">{calendar.events}</p>
                  <p className="text-[11px] text-zinc-300 font-medium mt-0.5">Total Events</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-gradient-to-br from-[#19192E] to-[#252542] shadow-sm">
                  <p className="text-2xl font-display font-extrabold text-white drop-shadow-sm">{calendar.followers.toLocaleString()}</p>
                  <p className="text-[11px] text-primary/80 font-medium mt-0.5">Followers</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-gradient-to-br from-primary/10 to-transparent border border-primary/20">
                  <p className="text-2xl font-display font-extrabold text-primary">{calendar.upcomingEvents.length}</p>
                  <p className="text-[11px] text-foreground/70 font-medium mt-0.5">Upcoming</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-muted/40 border border-border/50">
                  <p className="text-2xl font-display font-extrabold text-foreground/60">{calendar.pastEvents.length}</p>
                  <p className="text-[11px] text-muted-foreground font-medium mt-0.5">Past</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
