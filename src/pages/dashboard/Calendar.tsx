import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  addDays, addMonths, eachDayOfInterval, endOfMonth, endOfWeek, format,
  isSameDay, isSameMonth, isToday, startOfMonth, startOfWeek, subMonths,
} from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft, ChevronRight, Plus, CalendarDays, Clock, Users,
  Eye, Pencil, QrCode, X, Mail, Users2, Share2, Sparkles, CalendarPlus,
  Trash2, Globe, Link2, Instagram, Youtube, Check, Info, Settings, Compass, Search, LayoutGrid, List
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useProfile } from "@/hooks/useProfile";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { fetchUpcomingEvents, fetchPastEvents, MockEvent, FEATURED_CALENDARS, getCustomCalendars, FeaturedCalendar } from "@/lib/mockEvents";
import { CALENDAR_SYNC_ENDPOINT } from "@/lib/mediaConstants";
import OrganizerSocials from "@/components/event-public/OrganizerSocials";
import { toast } from "sonner";

type View = "month" | "week" | "agenda";
type TabType = "my-calendars" | "subscribed" | "discover" | "schedule";

const TINT_COLORS = [
  { name: "Grey", class: "bg-zinc-500", hex: "#71717A" },
  { name: "Pink", class: "bg-pink-500", hex: "#EC4899" },
  { name: "Purple", class: "bg-purple-500", hex: "#A855F7" },
  { name: "Indigo", class: "bg-indigo-500", hex: "#6366F1" },
  { name: "Blue", class: "bg-blue-500", hex: "#3B82F6" },
  { name: "Green", class: "bg-green-500", hex: "#22C55E" },
  { name: "Yellow", class: "bg-yellow-500", hex: "#EAB308" },
  { name: "Orange", class: "bg-orange-500", hex: "#F97316" },
  { name: "Red", class: "bg-red-500", hex: "#EF4444" },
  { name: "Rainbow", class: "bg-gradient-to-tr from-pink-500 via-purple-500 to-blue-500", hex: "linear-gradient(to right, #ec4899, #8b5cf6)" },
];

const PRESET_COVERS = [
  "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80",
  "https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=1200&q=80",
  "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&q=80",
  "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&q=80",
  "https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=1200&q=80"
];

const PRESET_EMOJIS = ["📅", "🦞", "🤖", "🚀", "🎨", "⚡", "🔮", "🍕", "🌍", "💡"];

export default function Calendar() {
  const navigate = useNavigate();
  const { data: profile } = useProfile();

  // Navigation and Tabs state
  const [activeTab, setActiveTab] = useState<TabType>("my-calendars");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Calendars & events lists
  const [myCalendars, setMyCalendars] = useState<FeaturedCalendar[]>([]);
  const [discoverCalendars, setDiscoverCalendars] = useState<FeaturedCalendar[]>([]);
  const [subscribedCalendars, setSubscribedCalendars] = useState<FeaturedCalendar[]>([]);
  const [allEvents, setAllEvents] = useState<MockEvent[]>([]);

  // Filtering for Schedule
  const [selectedCalendarSlug, setSelectedCalendarSlug] = useState<string>("all");

  // Schedule View States
  const [view, setView] = useState<View>("month");
  const [cursor, setCursor] = useState<Date>(new Date());
  const [selectedEvent, setSelectedEvent] = useState<MockEvent | null>(null);

  // Search Discover state
  const [searchQuery, setSearchQuery] = useState("");

  // Modals / Drawers states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCalendar, setEditingCalendar] = useState<FeaturedCalendar | null>(null);

  // Forms states (Create Calendar)
  const [newName, setNewName] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [newIcon, setNewIcon] = useState("⚡");
  const [newDesc, setNewDesc] = useState("");
  const [newTint, setNewTint] = useState("Pink");
  const [newLocType, setNewLocType] = useState<"city" | "global">("global");
  const [newLocVal, setNewLocVal] = useState("");

  // Forms states (Edit Settings)
  const [editName, setEditName] = useState("");
  const [editIcon, setEditIcon] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editLongDesc, setEditLongDesc] = useState("");
  const [editSlug, setEditSlug] = useState("");
  const [editTint, setEditTint] = useState("");
  const [editLocType, setEditLocType] = useState<"city" | "global">("global");
  const [editLocVal, setEditLocVal] = useState("");
  const [editCover, setEditCover] = useState("");
  const [editSocials, setEditSocials] = useState<Record<string, string>>({});
  const [editPreviewImage, setEditPreviewImage] = useState("");
  const [editStatus, setEditStatus] = useState<"active" | "coming-soon" | "archived">("active");

  // Load everything
  const loadData = () => {
    // 1. Load custom calendars from localStorage
    let custom = getCustomCalendars();
    
    // Seed default if empty
    if (custom.length === 0) {
      const defaultName = profile?.full_name ? `${profile.full_name}'s Calendar` : "My Calendar";
      const defaultCal = {
        name: defaultName,
        slug: "my-calendar",
        icon: "⚡",
        description: "My personal event space.",
        longDescription: "Welcome to my personal calendar. Find and subscribe to all my upcoming and past events.",
        coverImage: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=1200&q=80",
        events: 0,
        subscribed: false,
        followers: 12,
        host: { name: profile?.full_name || "Host", avatar: profile?.avatar_url || "https://api.dicebear.com/7.x/identicon/svg?seed=default" },
        socials: { website: profile?.website || "" },
        tintColor: "Pink",
        locationType: "global" as const,
        locationValue: "",
        upcomingEvents: [],
        pastEvents: []
      };
      localStorage.setItem("eventspark_custom_calendars", JSON.stringify([defaultCal]));
      custom = [defaultCal];
    }
    setMyCalendars(custom);

    // 2. Load featured / discover calendars
    const localSubsStr = localStorage.getItem("eventspark_subscribed_slugs") || "[]";
    const localSubs = JSON.parse(localSubsStr) as string[];

    const subs = FEATURED_CALENDARS.filter(c => c.subscribed || localSubs.includes(c.slug));
    const disc = FEATURED_CALENDARS.filter(c => !c.subscribed && !localSubs.includes(c.slug));
    
    setSubscribedCalendars(subs);
    setDiscoverCalendars(disc);

    // 3. Load events (mock + custom local)
    Promise.all([fetchUpcomingEvents(), fetchPastEvents()]).then(([u, p]) => {
      const localEventsStr = localStorage.getItem("eventspark_custom_events") || "[]";
      const localEvents = JSON.parse(localEventsStr);
      
      const mappedLocal = localEvents.map((e: any) => ({
        id: e.id,
        slug: e.slug,
        title: e.title,
        date: e.date,
        endDate: e.endDate,
        location: e.location,
        cover: e.cover,
        category: e.category || "Tech",
        hosts: e.hosts || [{ name: profile?.full_name || "Organizer", avatar: profile?.avatar_url || "" }],
        attendees: e.attendees || 0,
        calendarSlug: e.calendarSlug, // Keep track of parent calendar
      }));

      // Map mock events to openclaw/designbuddies/etc based on tags
      const mappedMocks = [...u, ...p].map(e => {
        let calendarSlug = "my-calendar";
        if (e.title.toLowerCase().includes("openclaw")) calendarSlug = "openclaw-meetups";
        else if (e.title.toLowerCase().includes("design")) calendarSlug = "design-buddies";
        return { ...e, calendarSlug };
      });

      setAllEvents([...mappedLocal, ...mappedMocks]);
    });
  };

  useEffect(() => {
    loadData();
  }, [profile]);

  // Derived filtered events list for Schedule
  const filteredEvents = useMemo(() => {
    if (selectedCalendarSlug === "all") return allEvents;
    return allEvents.filter(e => e.calendarSlug === selectedCalendarSlug);
  }, [allEvents, selectedCalendarSlug]);

  // Create calendar submission
  const handleCreateCalendar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newSlug.trim()) {
      toast.error("Name and slug are required");
      return;
    }

    const cleanedSlug = newSlug.toLowerCase().replace(/[^a-z0-9-]/g, "");
    
    const existing = myCalendars.find(c => c.slug === cleanedSlug) || discoverCalendars.find(c => c.slug === cleanedSlug);
    if (existing) {
      toast.error("A calendar with this slug already exists.");
      return;
    }

    const randomCover = PRESET_COVERS[Math.floor(Math.random() * PRESET_COVERS.length)];

    const newCal: FeaturedCalendar = {
      name: newName,
      slug: cleanedSlug,
      icon: newIcon,
      description: newDesc,
      longDescription: newDesc,
      coverImage: randomCover,
      events: 0,
      subscribed: false,
      followers: 0,
      host: { name: profile?.full_name || "Organizer", avatar: profile?.avatar_url || "https://api.dicebear.com/7.x/identicon/svg?seed=default" },
      socials: {},
      tintColor: newTint,
      locationType: newLocType,
      locationValue: newLocVal,
      upcomingEvents: [],
      pastEvents: []
    };

    const updated = [...myCalendars, newCal];
    localStorage.setItem("eventspark_custom_calendars", JSON.stringify(updated));
    setMyCalendars(updated);
    setShowCreateModal(false);
    toast.success("Calendar created successfully! 🎉");

    // Reset fields
    setNewName("");
    setNewSlug("");
    setNewIcon("⚡");
    setNewDesc("");
    setNewTint("Pink");
    setNewLocType("global");
    setNewLocVal("");
  };

  // Open edit drawer
  const openEditDrawer = (cal: FeaturedCalendar) => {
    setEditingCalendar(cal);
    setEditName(cal.name);
    setEditIcon(cal.icon);
    setEditDesc(cal.description);
    setEditLongDesc(cal.longDescription || cal.description);
    setEditSlug(cal.slug);
    setEditTint(cal.tintColor || "Pink");
    setEditLocType(cal.locationType || "global");
    setEditLocVal(cal.locationValue || "");
    setEditCover(cal.coverImage);
    setEditSocials(cal.socials || {});
    setEditPreviewImage(cal.coverImage);
    setEditStatus(cal.status || "active");
  };

  // Save changes from drawer settings
  const handleSaveSettings = () => {
    if (!editingCalendar) return;
    
    // Save custom settings to localStorage
    const updated = myCalendars.map(c => {
      if (c.slug === editingCalendar.slug) {
        return {
          ...c,
          name: editName,
          icon: editIcon,
          description: editDesc,
          longDescription: editLongDesc,
          slug: editSlug.toLowerCase().replace(/[^a-z0-9-]/g, ""),
          tintColor: editTint,
          locationType: editLocType,
          locationValue: editLocVal,
          coverImage: editCover,
          socials: editSocials,
          status: editStatus,
        };
      }
      return c;
    });

    localStorage.setItem("eventspark_custom_calendars", JSON.stringify(updated));
    setMyCalendars(updated);
    setEditingCalendar(null);
    toast.success("Calendar configuration saved!");
    loadData();
  };

  // Delete calendar
  const handleDeleteCalendar = (slug: string) => {
    if (!confirm("Are you sure you want to delete this calendar? This action cannot be undone.")) return;
    
    const updated = myCalendars.filter(c => c.slug !== slug);
    localStorage.setItem("eventspark_custom_calendars", JSON.stringify(updated));
    setMyCalendars(updated);
    setEditingCalendar(null);
    toast.success("Calendar deleted.");
    loadData();
  };

  // Toggle subscribe/unsubscribe for discover calendars
  const handleSubscribeToggle = (slug: string, currentSubbed: boolean) => {
    const localSubsStr = localStorage.getItem("eventspark_subscribed_slugs") || "[]";
    let localSubs = JSON.parse(localSubsStr) as string[];

    if (currentSubbed) {
      // Unsubscribe
      localSubs = localSubs.filter(s => s !== slug);
      toast.success("Unsubscribed from calendar");
    } else {
      // Subscribe
      localSubs.push(slug);
      toast.success("Subscribed to calendar! 🎉");
    }
    localStorage.setItem("eventspark_subscribed_slugs", JSON.stringify(localSubs));
    loadData();
  };

  // Generate initials for avatar fallbacks
  const initials = (name: string) => name.split(" ").map(s => s[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-[-0.02em]">Calendars</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage, discover and host events under custom namespaces.</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" className="rounded-full bg-pink-500 hover:bg-pink-600 text-white font-semibold" onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 mr-1.5" /> Create Calendar
          </Button>
          <Button size="sm" variant="outline" className="rounded-full" onClick={() => navigate("/dashboard/events/create")}>
            <CalendarPlus className="w-4 h-4 mr-1.5" /> Create Event
          </Button>
        </div>
      </div>

      {/* Tabs list */}
      <div className="flex border-b border-border/40 pb-px gap-1 overflow-x-auto">
        {(["my-calendars", "subscribed", "discover", "schedule"] as const).map(tab => {
          let label = "My Calendars";
          let count = myCalendars.length;
          if (tab === "subscribed") { label = "Subscribed"; count = subscribedCalendars.length; }
          else if (tab === "discover") { label = "Discover"; count = discoverCalendars.length; }
          else if (tab === "schedule") { label = "Schedule Grid"; count = filteredEvents.length; }

          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 px-4 text-sm font-semibold transition-all relative shrink-0 ${
                activeTab === tab ? "text-pink-500" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span className="flex items-center gap-1.5">
                {label}
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  activeTab === tab ? "bg-pink-100 text-pink-600 dark:bg-pink-950/40" : "bg-muted text-muted-foreground"
                }`}>
                  {count}
                </span>
              </span>
              {activeTab === tab && (
                <motion.div
                  layoutId="activeTabUnderline"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-pink-500"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Tabs Panels */}
      <div className="space-y-6">
        {activeTab !== "schedule" && (
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between bg-muted/20 p-3 rounded-2xl border border-border/40">
            <div className="relative max-w-sm flex-1 w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search calendars..."
                className="pl-10 rounded-full h-9 text-xs bg-background"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex bg-muted rounded-full p-1 self-end sm:self-auto shrink-0">
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-full transition-colors ${viewMode === "list" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                title="List View"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-full transition-colors ${viewMode === "grid" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Panel: My Calendars */}
        {activeTab === "my-calendars" && (
          viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myCalendars
                .filter(cal => cal.name.toLowerCase().includes(searchQuery.toLowerCase()) || cal.description.toLowerCase().includes(searchQuery.toLowerCase()))
                .map(cal => {
                  const tint = TINT_COLORS.find(c => c.name === cal.tintColor) || TINT_COLORS[1];
                  return (
                    <div key={cal.slug} className="bg-card border border-border/40 rounded-2xl overflow-hidden hover:border-pink-500/40 transition-all duration-300 flex flex-col min-h-[460px]">
                      {/* Banner */}
                      <div className="h-36 overflow-hidden relative bg-muted shrink-0">
                        <img src={cal.coverImage} alt="" className="w-full h-full object-cover opacity-100" />
                        <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent" />
                        <div className="absolute top-3 right-3 flex items-center gap-1.5">
                          <span className={`w-3.5 h-3.5 rounded-full border border-white/20 ${tint.class}`} title={`Theme: ${tint.name}`} />
                          <Badge variant="outline" className="text-[10px] bg-background/90 backdrop-blur-md uppercase tracking-wider font-semibold border-border/60">
                            {cal.locationType === "global" ? "Global" : cal.locationValue || "City"}
                          </Badge>
                        </div>
                      </div>

                      {/* Body Content */}
                      <div className="p-6 flex-1 flex flex-col">
                        <div className="flex items-start gap-4.5 -mt-12 mb-4 relative z-10">
                          <div className="w-16 h-16 rounded-2xl bg-card border border-border flex items-center justify-center text-3xl shadow-lg shrink-0">
                            {cal.icon || "⚡"}
                          </div>
                          <div className="pt-10 min-w-0 flex-1">
                            <h3 className="font-display font-bold text-xl leading-tight truncate">{cal.name}</h3>
                            <p className="text-xs text-muted-foreground mt-1 font-medium truncate">
                              eventspark.co/cal/{cal.slug}
                            </p>
                          </div>
                        </div>
                        
                        <p className="text-sm text-muted-foreground/90 line-clamp-3 mt-2 leading-relaxed flex-1">
                          {cal.description || "No description provided."}
                        </p>

                        {/* Detailed Host Card Row */}
                        <div className="flex items-center gap-2 mt-4 p-2 bg-muted/30 rounded-xl border border-border/20 shrink-0">
                          <div className="w-6 h-6 rounded-full bg-pink-500/10 flex items-center justify-center text-[10px] font-bold text-pink-600 shrink-0">
                            {cal.host.avatar ? (
                              <img src={cal.host.avatar} className="w-full h-full object-cover rounded-full" alt="" />
                            ) : (
                              initials(cal.host.name)
                            )}
                          </div>
                          <span className="text-[11px] text-muted-foreground truncate">Hosted by <span className="font-semibold text-foreground">{cal.host.name}</span></span>
                        </div>

                        {/* Stats & Actions */}
                        <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 mt-4 border-t border-border/30 shrink-0">
                          <span className="flex items-center gap-1.5 font-medium"><CalendarDays className="w-4 h-4 text-pink-500" /> <span className="font-bold text-foreground">{cal.events}</span> Events</span>
                          <span className="flex items-center gap-1.5 font-medium"><Users className="w-4 h-4 text-pink-500" /> <span className="font-bold text-foreground">{cal.followers.toLocaleString()}</span> Followers</span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 mt-5 pt-1 shrink-0">
                          <Button variant="outline" size="default" className="rounded-xl font-bold h-11 text-sm border-border/60 hover:bg-muted" onClick={() => openEditDrawer(cal)}>
                            <Settings className="w-4 h-4 mr-1.5 text-muted-foreground" /> Configure
                          </Button>
                          <Button variant="outline" size="default" className="rounded-xl font-bold h-11 text-sm border-border/60 hover:bg-muted" asChild>
                            <a href={`/cal/${cal.slug}`} target="_blank" rel="noopener noreferrer">
                              <Eye className="w-4 h-4 mr-1.5 text-muted-foreground" /> View Page
                            </a>
                          </Button>
                        </div>

                        <Button className="w-full mt-2.5 rounded-xl h-11 text-sm bg-pink-500/10 text-pink-600 hover:bg-pink-500/20 font-bold border-0 shrink-0" onClick={() => navigate(`/dashboard/events/create?calendar=${cal.slug}`)}>
                          <Plus className="w-4 h-4 mr-1.5" /> Add Event
                        </Button>
                      </div>
                    </div>
                  );
                })}
            </div>
          ) : (
            /* LIST VIEW */
            <div className="space-y-4">
              {myCalendars
                .filter(cal => cal.name.toLowerCase().includes(searchQuery.toLowerCase()) || cal.description.toLowerCase().includes(searchQuery.toLowerCase()))
                .map(cal => {
                  const tint = TINT_COLORS.find(c => c.name === cal.tintColor) || TINT_COLORS[1];
                  return (
                    <div key={cal.slug} className="bg-card border border-border/40 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-pink-500/40 transition-all duration-300">
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="w-14 h-14 rounded-2xl bg-muted/40 border border-border flex items-center justify-center text-3xl shadow-sm shrink-0">
                          {cal.icon || "⚡"}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-display font-bold text-lg leading-tight truncate">{cal.name}</h3>
                            <Badge variant="outline" className="text-[9px] uppercase tracking-wider font-semibold border-border/60 py-0 px-2 h-5">
                              {cal.locationType === "global" ? "Global" : cal.locationValue || "City"}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground/80 mt-1 line-clamp-1">{cal.description || "No description provided."}</p>
                          <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-1.5">
                            <span className="flex items-center gap-1"><CalendarDays className="w-3 h-3 text-pink-500" /> {cal.events} events</span>
                            <span>•</span>
                            <span className="flex items-center gap-1"><Users className="w-3 h-3 text-pink-500" /> {cal.followers.toLocaleString()} followers</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                        <Button variant="outline" size="sm" className="rounded-full font-semibold h-8 text-xs border-border/60 hover:bg-muted" onClick={() => openEditDrawer(cal)}>
                          <Settings className="w-3 h-3 mr-1" /> Configure
                        </Button>
                        <Button variant="outline" size="sm" className="rounded-full font-semibold h-8 text-xs border-border/60 hover:bg-muted" asChild>
                          <a href={`/cal/${cal.slug}`} target="_blank" rel="noopener noreferrer">
                            <Eye className="w-3 h-3 mr-1" /> View
                          </a>
                        </Button>
                        <Button className="rounded-full h-8 text-xs bg-pink-500 hover:bg-pink-600 text-white font-semibold border-0" onClick={() => navigate(`/dashboard/events/create?calendar=${cal.slug}`)}>
                          <Plus className="w-3 h-3 mr-1" /> Event
                        </Button>
                      </div>
                    </div>
                  );
                })}
            </div>
          )
        )}

        {/* Panel: Subscribed */}
        {activeTab === "subscribed" && (
          viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {subscribedCalendars
                .filter(cal => cal.name.toLowerCase().includes(searchQuery.toLowerCase()) || cal.description.toLowerCase().includes(searchQuery.toLowerCase()))
                .map(cal => (
                  <div key={cal.slug} className="bg-card border border-border/40 rounded-2xl overflow-hidden hover:border-pink-500/40 transition-all duration-300 flex flex-col min-h-[420px]">
                    <div className="h-32 overflow-hidden relative bg-muted shrink-0">
                      <img src={cal.coverImage} alt="" className="w-full h-full object-cover opacity-100" />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent" />
                    </div>
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="flex items-start gap-4 -mt-11 mb-4 relative z-10">
                        <div className="w-14 h-14 rounded-2xl bg-card border border-border flex items-center justify-center text-2xl shadow-lg shrink-0">
                          {cal.icon || "📅"}
                        </div>
                        <div className="pt-9 min-w-0 flex-1">
                          <h3 className="font-display font-bold text-lg leading-tight truncate">{cal.name}</h3>
                          <p className="text-xs text-muted-foreground mt-0.5">By {cal.host.name}</p>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed flex-1">
                        {cal.description}
                      </p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 mt-4 border-t border-border/30 shrink-0">
                        <span className="flex items-center gap-1.5"><CalendarDays className="w-4 h-4 text-pink-500" /> <span className="font-semibold text-foreground">{cal.events}</span> events</span>
                        <span className="flex items-center gap-1.5"><Users className="w-4 h-4 text-pink-500" /> <span className="font-semibold text-foreground">{cal.followers.toLocaleString()}</span> followers</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-5 shrink-0">
                        <Button variant="outline" size="default" className="rounded-xl h-11 text-sm font-bold" asChild>
                          <Link to={`/cal/${cal.slug}`}>View Page</Link>
                        </Button>
                        <Button variant="ghost" size="default" className="rounded-xl h-11 text-sm text-destructive hover:bg-destructive/10 font-bold" onClick={() => handleSubscribeToggle(cal.slug, true)}>
                          Unsubscribe
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              {subscribedCalendars.length === 0 && (
                <div className="col-span-full py-16 text-center bg-card border border-dashed border-border/40 rounded-2xl">
                  <CalendarDays className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                  <h3 className="font-display font-semibold text-lg">No Subscriptions</h3>
                  <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">You haven't subscribed to any community calendars yet. Browse the Discover tab to find great circles.</p>
                </div>
              )}
            </div>
          ) : (
            /* LIST VIEW SUBSCRIBED */
            <div className="space-y-4">
              {subscribedCalendars
                .filter(cal => cal.name.toLowerCase().includes(searchQuery.toLowerCase()) || cal.description.toLowerCase().includes(searchQuery.toLowerCase()))
                .map(cal => (
                  <div key={cal.slug} className="bg-card border border-border/40 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-pink-500/40 transition-all duration-300">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="w-14 h-14 rounded-2xl bg-muted/40 border border-border flex items-center justify-center text-3xl shadow-sm shrink-0">
                        {cal.icon || "📅"}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-display font-bold text-lg leading-tight truncate">{cal.name}</h3>
                        <p className="text-xs text-muted-foreground/80 mt-1 line-clamp-1">By {cal.host.name} · {cal.description}</p>
                        <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-1.5">
                          <span className="flex items-center gap-1"><CalendarDays className="w-3 h-3 text-pink-500" /> {cal.events} events</span>
                          <span>•</span>
                          <span className="flex items-center gap-1"><Users className="w-3 h-3 text-pink-500" /> {cal.followers.toLocaleString()} followers</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                      <Button variant="outline" size="sm" className="rounded-full font-semibold h-8 text-xs border-border/60 hover:bg-muted" asChild>
                        <Link to={`/cal/${cal.slug}`}><Eye className="w-3 h-3 mr-1" /> View</Link>
                      </Button>
                      <Button variant="ghost" size="sm" className="rounded-full h-8 text-xs text-destructive hover:bg-destructive/10 font-semibold" onClick={() => handleSubscribeToggle(cal.slug, true)}>
                        Unsubscribe
                      </Button>
                    </div>
                  </div>
                ))}
              {subscribedCalendars.length === 0 && (
                <div className="col-span-full py-16 text-center bg-card border border-dashed border-border/40 rounded-2xl">
                  <CalendarDays className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                  <h3 className="font-display font-semibold text-lg">No Subscriptions</h3>
                  <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">You haven't subscribed to any community calendars yet.</p>
                </div>
              )}
            </div>
          )
        )}

        {/* Panel: Discover */}
        {activeTab === "discover" && (
          viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {discoverCalendars
                .filter(cal => cal.name.toLowerCase().includes(searchQuery.toLowerCase()) || cal.description.toLowerCase().includes(searchQuery.toLowerCase()))
                .map(cal => (
                  <div key={cal.slug} className="bg-card border border-border/40 rounded-2xl overflow-hidden hover:border-pink-500/40 transition-all duration-300 flex flex-col min-h-[420px]">
                    <div className="h-32 overflow-hidden relative bg-muted shrink-0">
                      <img src={cal.coverImage} alt="" className="w-full h-full object-cover opacity-100" />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent" />
                    </div>
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="flex items-start gap-4 -mt-11 mb-4 relative z-10">
                        <div className="w-14 h-14 rounded-2xl bg-card border border-border flex items-center justify-center text-2xl shadow-lg shrink-0">
                          {cal.icon || "📅"}
                        </div>
                        <div className="pt-9 min-w-0 flex-1">
                          <h3 className="font-display font-bold text-lg leading-tight truncate">{cal.name}</h3>
                          <p className="text-xs text-muted-foreground mt-0.5">By {cal.host.name}</p>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed flex-1">
                        {cal.description}
                      </p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 mt-4 border-t border-border/30 shrink-0">
                        <span className="flex items-center gap-1.5"><CalendarDays className="w-4 h-4 text-pink-500" /> <span className="font-semibold text-foreground">{cal.events}</span> events</span>
                        <span className="flex items-center gap-1.5"><Users className="w-4 h-4 text-pink-500" /> <span className="font-semibold text-foreground">{cal.followers.toLocaleString()}</span> followers</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-5 shrink-0">
                        <Button variant="outline" size="default" className="rounded-xl h-11 text-sm font-bold" asChild>
                          <Link to={`/cal/${cal.slug}`}>View Page</Link>
                        </Button>
                        <Button size="default" className="rounded-xl h-11 text-sm font-bold bg-pink-500 hover:bg-pink-600 text-white border-0" onClick={() => handleSubscribeToggle(cal.slug, false)}>
                          Subscribe
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            /* LIST VIEW DISCOVER */
            <div className="space-y-4">
              {discoverCalendars
                .filter(cal => cal.name.toLowerCase().includes(searchQuery.toLowerCase()) || cal.description.toLowerCase().includes(searchQuery.toLowerCase()))
                .map(cal => (
                  <div key={cal.slug} className="bg-card border border-border/40 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-pink-500/40 transition-all duration-300">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="w-14 h-14 rounded-2xl bg-muted/40 border border-border flex items-center justify-center text-3xl shadow-sm shrink-0">
                        {cal.icon || "📅"}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-display font-bold text-lg leading-tight truncate">{cal.name}</h3>
                        <p className="text-xs text-muted-foreground/80 mt-1 line-clamp-1">By {cal.host.name} · {cal.description}</p>
                        <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-1.5">
                          <span className="flex items-center gap-1"><CalendarDays className="w-3 h-3 text-pink-500" /> {cal.events} events</span>
                          <span>•</span>
                          <span className="flex items-center gap-1"><Users className="w-3 h-3 text-pink-500" /> {cal.followers.toLocaleString()} followers</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                      <Button variant="outline" size="sm" className="rounded-full font-semibold h-8 text-xs border-border/60 hover:bg-muted" asChild>
                        <Link to={`/cal/${cal.slug}`}><Eye className="w-3 h-3 mr-1" /> View Page</Link>
                      </Button>
                      <Button size="sm" className="rounded-full h-8 text-xs font-semibold bg-pink-500 hover:bg-pink-600 text-white" onClick={() => handleSubscribeToggle(cal.slug, false)}>
                        Subscribe
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          )
        )}

        {/* Panel: Schedule */}
        {activeTab === "schedule" && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Label className="text-xs uppercase tracking-wider font-semibold text-muted-foreground shrink-0">Show Events For:</Label>
                <select
                  value={selectedCalendarSlug}
                  onChange={e => setSelectedCalendarSlug(e.target.value)}
                  className="bg-card border border-border/60 rounded-full text-xs font-medium px-3.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-pink-500"
                >
                  <option value="all">All Calendars Combined</option>
                  {myCalendars.map(cal => (
                    <option key={cal.slug} value={cal.slug}>Host: {cal.icon} {cal.name}</option>
                  ))}
                  {subscribedCalendars.map(cal => (
                    <option key={cal.slug} value={cal.slug}>Subbed: {cal.icon} {cal.name}</option>
                  ))}
                </select>
              </div>

              {/* View tabs */}
              <div className="inline-flex gap-1 p-1 bg-muted rounded-full shrink-0">
                {(["month", "week", "agenda"] as View[]).map((v) => (
                  <button
                    key={v}
                    onClick={() => setView(v)}
                    className={`capitalize px-3.5 h-8 rounded-full text-xs font-medium transition-colors ${
                      view === v ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            {/* Calendar grid wrapper */}
            <div className="bg-card border border-border/40 rounded-2xl p-4 sm:p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Button
                    size="icon" variant="ghost" className="rounded-full h-8 w-8"
                    onClick={() => setCursor(view === "week" ? addDays(cursor, -7) : subMonths(cursor, 1))}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon" variant="ghost" className="rounded-full h-8 w-8"
                    onClick={() => setCursor(view === "week" ? addDays(cursor, 7) : addMonths(cursor, 1))}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="ghost" className="rounded-full h-8 ml-1" onClick={() => setCursor(new Date())}>
                    Today
                  </Button>
                  <span className="ml-2 text-sm font-semibold">{format(cursor, "MMMM yyyy")}</span>
                </div>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={view + cursor.toISOString().slice(0, 10)}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  {view === "month" && <MonthView cursor={cursor} events={filteredEvents} onPick={setSelectedEvent} />}
                  {view === "week" && <WeekView cursor={cursor} events={filteredEvents} onPick={setSelectedEvent} />}
                  {view === "agenda" && <AgendaView events={filteredEvents} onPick={setSelectedEvent} />}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>

      {/* Dialog: Create Calendar */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Calendar Space</DialogTitle>
            <DialogDescription>
              A calendar acts as your host profile and groups related events together.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateCalendar} className="space-y-4 pt-2">
            <div className="grid grid-cols-4 gap-3 items-end">
              <div className="col-span-1">
                <Label>Icon</Label>
                <select
                  value={newIcon}
                  onChange={e => setNewIcon(e.target.value)}
                  className="w-full bg-muted/50 border border-border h-9 rounded-lg text-center text-lg focus:outline-none"
                >
                  {PRESET_EMOJIS.map(em => (
                    <option key={em} value={em}>{em}</option>
                  ))}
                </select>
              </div>
              <div className="col-span-3 space-y-1">
                <Label htmlFor="cal-name">Calendar Name</Label>
                <Input
                  id="cal-name"
                  placeholder="e.g. Design Tech Guild"
                  value={newName}
                  onChange={e => {
                    setNewName(e.target.value);
                    setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-"));
                  }}
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="cal-slug">Public URL Slug</Label>
              <div className="flex items-center">
                <span className="bg-muted border border-r-0 border-border px-3 h-9 flex items-center text-xs text-muted-foreground rounded-l-lg">
                  eventspark.co/cal/
                </span>
                <Input
                  id="cal-slug"
                  placeholder="design-tech"
                  value={newSlug}
                  onChange={e => setNewSlug(e.target.value)}
                  className="rounded-l-none"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="cal-desc">Description</Label>
              <Textarea
                id="cal-desc"
                placeholder="A community exploring design..."
                value={newDesc}
                onChange={e => setNewDesc(e.target.value)}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Tint Color</Label>
                <select
                  value={newTint}
                  onChange={e => setNewTint(e.target.value)}
                  className="w-full bg-muted/50 border border-border h-9 rounded-lg px-2 text-xs focus:outline-none"
                >
                  {TINT_COLORS.map(c => (
                    <option key={c.name} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <Label>Location</Label>
                <select
                  value={newLocType}
                  onChange={e => setNewLocType(e.target.value as "city" | "global")}
                  className="w-full bg-muted/50 border border-border h-9 rounded-lg px-2 text-xs focus:outline-none"
                >
                  <option value="global">Global (Online)</option>
                  <option value="city">Specific City</option>
                </select>
              </div>
            </div>

            {newLocType === "city" && (
              <div className="space-y-1">
                <Label htmlFor="cal-city">City Name</Label>
                <Input
                  id="cal-city"
                  placeholder="e.g. San Francisco, Nairobi"
                  value={newLocVal}
                  onChange={e => setNewLocVal(e.target.value)}
                />
              </div>
            )}

            <DialogFooter className="pt-4 border-t border-border/20">
              <Button type="button" variant="outline" className="rounded-full" onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
              <Button type="submit" className="rounded-full bg-pink-500 hover:bg-pink-600 text-white font-semibold">
                Create Space
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Settings Drawer (Customization & Details settings) */}
      <Sheet open={!!editingCalendar} onOpenChange={o => !o && setEditingCalendar(null)}>
        <SheetContent className="sm:max-w-xl p-0 overflow-y-auto bg-card">
          {editingCalendar && (
            <div className="flex flex-col min-h-screen">
              {/* Cover Banner Mock Header */}
              <div className="relative w-full h-[180px] bg-[#19192E] overflow-hidden shrink-0">
                <img src={editPreviewImage} alt="" className="w-full h-full object-cover opacity-60" />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
                
                {/* Image presets overlay */}
                <div className="absolute bottom-3 right-3 flex items-center gap-2">
                  <select
                    value={editCover}
                    onChange={e => {
                      setEditCover(e.target.value);
                      setEditPreviewImage(e.target.value);
                    }}
                    className="bg-black/60 text-white border border-white/20 rounded-full text-[10px] px-3 py-1 font-semibold focus:outline-none"
                  >
                    <option value="" disabled>Change Cover Preset</option>
                    {PRESET_COVERS.map((cov, idx) => (
                      <option key={cov} value={cov}>Preset {idx + 1}</option>
                    ))}
                  </select>
                </div>

                <div className="absolute -bottom-6 left-6 flex items-end gap-3">
                  <div className="w-16 h-16 rounded-2xl bg-card border border-border flex items-center justify-center text-3xl shadow-lg relative group">
                    <span>{editIcon}</span>
                    <select
                      value={editIcon}
                      onChange={e => setEditIcon(e.target.value)}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    >
                      {PRESET_EMOJIS.map(em => (
                        <option key={em} value={em}>{em}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Form Settings Details */}
              <div className="p-6 space-y-6 pt-10 flex-1">
                <SheetHeader className="text-left p-0 mb-4">
                  <SheetTitle className="font-display text-xl tracking-tight">Calendar Customization</SheetTitle>
                </SheetHeader>

                <div className="space-y-4">
                  {/* Basic Identifiers */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label>Space Title</Label>
                      <Input value={editName} onChange={e => setEditName(e.target.value)} placeholder="e.g. Design Buddies" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Public URL Slug</Label>
                      <div className="flex items-center">
                        <span className="bg-muted border border-r-0 border-border px-3.5 h-10 flex items-center text-xs text-muted-foreground rounded-l-lg shrink-0">
                          eventspark.co/cal/
                        </span>
                        <Input value={editSlug} onChange={e => setEditSlug(e.target.value)} className="rounded-l-none" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label>Short Description</Label>
                    <Input value={editDesc} onChange={e => setEditDesc(e.target.value)} placeholder="Add a short description." />
                  </div>

                  <div className="space-y-1.5">
                    <Label>Long About Info (Page bio)</Label>
                    <Textarea value={editLongDesc} onChange={e => setEditLongDesc(e.target.value)} rows={3} placeholder="Tell attendees more about this space..." />
                  </div>

                  {/* Tint Color Swatches */}
                  <div className="space-y-2.5 p-4 rounded-xl border border-border/50 bg-muted/20">
                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Customization Tint Color</Label>
                    <div className="flex flex-wrap gap-2.5 pt-1">
                      {TINT_COLORS.map(c => {
                        const isSelected = editTint === c.name;
                        return (
                          <button
                            key={c.name}
                            type="button"
                            onClick={() => setEditTint(c.name)}
                            className={`w-7 h-7 rounded-full transition-all border-2 relative shrink-0 ${c.class} ${
                              isSelected ? "border-pink-500 scale-110 shadow-sm" : "border-transparent hover:scale-105"
                            }`}
                            title={c.name}
                          >
                            {isSelected && (
                              <Check className="w-3.5 h-3.5 text-white absolute inset-0 m-auto" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Location Settings */}
                  <div className="space-y-3 p-4 rounded-xl border border-border/50 bg-muted/20">
                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Location Scope</Label>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant={editLocType === "global" ? "default" : "outline"}
                        size="sm"
                        className={`rounded-full ${editLocType === "global" ? "bg-pink-500 text-white hover:bg-pink-600" : ""}`}
                        onClick={() => { setEditLocType("global"); setEditLocVal(""); }}
                      >
                        Global / Online
                      </Button>
                      <Button
                        type="button"
                        variant={editLocType === "city" ? "default" : "outline"}
                        size="sm"
                        className={`rounded-full ${editLocType === "city" ? "bg-pink-500 text-white hover:bg-pink-600" : ""}`}
                        onClick={() => setEditLocType("city")}
                      >
                        Local City
                      </Button>
                    </div>
                    {editLocType === "city" && (
                      <Input
                        value={editLocVal}
                        onChange={e => setEditLocVal(e.target.value)}
                        placeholder="Nairobi, Kenya"
                        className="mt-2 text-xs"
                      />
                    )}
                  </div>

                  {/* Calendar Status Card */}
                  <div className="space-y-4 p-4 rounded-xl border border-border/50 bg-muted/20">
                    <div>
                      <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Calendar Status</Label>
                      <span className="text-[11px] text-muted-foreground">Mark the calendar as coming soon or archive it if it is no longer active.</span>
                    </div>

                    <div className="p-3 bg-background border border-border/40 rounded-xl space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${
                          editStatus === "active" ? "bg-green-500" : editStatus === "coming-soon" ? "bg-yellow-500" : "bg-zinc-500"
                        }`} />
                        <span className="text-xs font-bold capitalize">{editStatus.replace("-", " ")}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground leading-normal font-medium">
                        {editStatus === "active" && "The calendar is active and accepting subscriptions and event submissions."}
                        {editStatus === "coming-soon" && "The calendar is marked as Coming Soon. Subscriptions and new events are paused."}
                        {editStatus === "archived" && "The calendar is archived. Past events are preserved but no new activity is permitted."}
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground block">Change Status</span>
                      <select
                        value={editStatus}
                        onChange={e => setEditStatus(e.target.value as any)}
                        className="w-full bg-background border border-border h-9 rounded-lg px-2 text-xs focus:outline-none focus:ring-1 focus:ring-pink-500"
                      >
                        <option value="active">Active</option>
                        <option value="coming-soon">Coming Soon</option>
                        <option value="archived">Archived</option>
                      </select>
                    </div>

                    <div className="pt-3 border-t border-border/40">
                      <span className="text-[10px] uppercase font-bold text-destructive block mb-1">Danger Zone</span>
                      <Button
                        type="button"
                        variant="ghost"
                        className="h-8 rounded-lg text-xs font-bold text-destructive hover:bg-destructive/10 p-0 justify-start w-full hover:text-destructive"
                        onClick={() => handleDeleteCalendar(editingCalendar.slug)}
                      >
                        Permanently Delete Calendar
                      </Button>
                    </div>
                  </div>

                  {/* Social links */}
                  <div className="space-y-3 p-4 rounded-xl border border-border/50 bg-muted/20">
                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Social Links</Label>
                    <div className="grid grid-cols-2 gap-3.5">
                      <div className="space-y-1">
                        <span className="text-[11px] text-muted-foreground flex items-center gap-1"><Instagram className="w-3 h-3 text-pink-500" /> Instagram Username</span>
                        <Input
                          placeholder="username"
                          value={editSocials.instagram || ""}
                          onChange={e => setEditSocials({ ...editSocials, instagram: e.target.value })}
                          className="h-8 text-xs bg-background"
                        />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[11px] text-muted-foreground flex items-center gap-1"><Globe className="w-3 h-3 text-pink-500" /> X (Twitter) handle</span>
                        <Input
                          placeholder="handle"
                          value={editSocials.twitter || ""}
                          onChange={e => setEditSocials({ ...editSocials, twitter: e.target.value })}
                          className="h-8 text-xs bg-background"
                        />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[11px] text-muted-foreground flex items-center gap-1"><Youtube className="w-3 h-3 text-pink-500" /> YouTube Channel</span>
                        <Input
                          placeholder="channel"
                          value={editSocials.youtube || ""}
                          onChange={e => setEditSocials({ ...editSocials, youtube: e.target.value })}
                          className="h-8 text-xs bg-background"
                        />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[11px] text-muted-foreground flex items-center gap-1"><Link2 className="w-3 h-3 text-pink-500" /> Website URL</span>
                        <Input
                          placeholder="https://mysite.com"
                          value={editSocials.website || ""}
                          onChange={e => setEditSocials({ ...editSocials, website: e.target.value })}
                          className="h-8 text-xs bg-background"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Social Sharing Image */}
                  <div className="space-y-2 p-4 rounded-xl border border-border/50 bg-muted/20">
                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Social Preview Image</Label>
                    <div className="border-2 border-dashed border-border/60 hover:border-pink-500/50 hover:bg-pink-500/5 transition-colors rounded-xl p-6 text-center cursor-pointer">
                      <QrCode className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
                      <p className="text-xs font-semibold">Drag & Drop or Click Here to upload</p>
                      <p className="text-[10px] text-muted-foreground/75 mt-0.5">Ratio: 1.91:1 banner layout recommended.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Save / Delete Actions Footer */}
              <div className="p-6 bg-muted/20 border-t border-border/40 flex items-center justify-between gap-3 shrink-0">
                <Button variant="ghost" className="rounded-full text-xs font-semibold text-destructive hover:bg-destructive/10" onClick={() => handleDeleteCalendar(editingCalendar.slug)}>
                  <Trash2 className="w-4 h-4 mr-1.5" /> Delete Calendar
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" className="rounded-full text-xs font-semibold" onClick={() => setEditingCalendar(null)}>
                    Cancel
                  </Button>
                  <Button className="rounded-full text-xs font-semibold bg-pink-500 hover:bg-pink-600 text-white" onClick={handleSaveSettings}>
                    Save Changes
                  </Button>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Drawer: Event Info Preview */}
      <Sheet open={!!selectedEvent} onOpenChange={(o) => !o && setSelectedEvent(null)}>
        <SheetContent className="sm:max-w-md p-0 overflow-y-auto">
          {selectedEvent && (
            <div>
              <div className="aspect-[16/10] w-full overflow-hidden bg-muted">
                <img src={selectedEvent.cover} alt={selectedEvent.title} className="w-full h-full object-cover" />
              </div>
              <div className="p-5 space-y-4">
                <SheetHeader className="text-left p-0">
                  <SheetTitle className="font-display text-xl tracking-[-0.01em]">{selectedEvent.title}</SheetTitle>
                </SheetHeader>
                <div className="space-y-2 text-sm">
                  <p className="inline-flex items-center gap-2 text-muted-foreground">
                    <CalendarDays className="w-4 h-4 text-pink-500" />
                    {format(new Date(selectedEvent.date), "EEE, MMM d")}
                  </p>
                  <p className="inline-flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-4 h-4 text-pink-500" />
                    {format(new Date(selectedEvent.date), "h:mm a")}
                  </p>
                  <p className="inline-flex items-center gap-2 text-muted-foreground">
                    <Users className="w-4 h-4 text-pink-500" />
                    {selectedEvent.attendees?.toLocaleString() || 0} registered
                  </p>
                </div>
                
                <div className="pt-2 border-t border-border/45">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">Hosted by</p>
                  <OrganizerSocials hosts={selectedEvent.hosts} />
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <Button variant="outline" className="rounded-full text-xs font-semibold" size="sm" asChild>
                    <Link to={`/events/${selectedEvent.slug}`}>
                      <Eye className="w-3.5 h-3.5 mr-1" /> View Event Page
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    className="rounded-full text-xs font-semibold"
                    size="sm"
                    onClick={() => {
                      navigate(`/dashboard/events/${selectedEvent.id}`);
                      setSelectedEvent(null);
                    }}
                  >
                    <Pencil className="w-3.5 h-3.5 mr-1" /> Edit Settings
                  </Button>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

// ─── Month view ────────────────────────────────────────────────────
function MonthView({ cursor, events, onPick }: { cursor: Date; events: MockEvent[]; onPick: (e: MockEvent) => void }) {
  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(cursor), { weekStartsOn: 0 });
    const end = endOfWeek(endOfMonth(cursor), { weekStartsOn: 0 });
    return eachDayOfInterval({ start, end });
  }, [cursor]);

  const eventsByDay = useMemo(() => {
    const map = new Map<string, MockEvent[]>();
    for (const e of events) {
      if (!e.date) continue;
      const k = format(new Date(e.date), "yyyy-MM-dd");
      map.set(k, [...(map.get(k) || []), e]);
    }
    return map;
  }, [events]);

  return (
    <div className="bg-card rounded-2xl overflow-hidden border border-border/30">
      {/* Day headers */}
      <div className="grid grid-cols-7 border-b border-border/40">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="px-3 py-2.5 text-[11px] uppercase tracking-wider font-semibold text-muted-foreground text-center bg-muted/10">
            {d}
          </div>
        ))}
      </div>
      {/* Grid */}
      <div className="grid grid-cols-7 auto-rows-[112px]">
        {days.map((day) => {
          const k = format(day, "yyyy-MM-dd");
          const dayEvents = eventsByDay.get(k) || [];
          const inMonth = isSameMonth(day, cursor);
          const today = isToday(day);
          return (
            <div
              key={k}
              className={`p-1.5 border-r border-b border-border/30 min-w-0 flex flex-col ${
                inMonth ? "bg-card" : "bg-muted/10 opacity-60"
              }`}
            >
              <div className="flex justify-end mb-1">
                <span
                  className={`inline-grid place-items-center w-6 h-6 text-xs rounded-full ${
                    today
                      ? "bg-pink-500 text-white font-semibold"
                      : inMonth ? "text-foreground font-medium" : "text-muted-foreground/50"
                  }`}
                >
                  {format(day, "d")}
                </span>
              </div>
              <div className="flex-1 space-y-1 overflow-y-auto scrollbar-thin">
                {dayEvents.slice(0, 2).map((e) => (
                  <button
                    key={e.id}
                    onClick={() => onPick(e)}
                    className="w-full text-left text-[10px] px-1.5 py-1 rounded bg-pink-500/10 text-pink-600 dark:bg-pink-950/20 dark:text-pink-400 hover:bg-pink-500/20 transition-colors truncate shadow-sm font-medium"
                    title={e.title}
                  >
                    {e.title}
                  </button>
                ))}
                {dayEvents.length > 2 && (
                  <div className="text-[9px] text-muted-foreground/80 font-medium px-1.5">
                    +{dayEvents.length - 2} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Week view ─────────────────────────────────────────────────────
function WeekView({ cursor, events, onPick }: { cursor: Date; events: MockEvent[]; onPick: (e: MockEvent) => void }) {
  const days = useMemo(() => {
    const start = startOfWeek(cursor, { weekStartsOn: 0 });
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  }, [cursor]);

  const hours = Array.from({ length: 15 }, (_, i) => 8 + i); // 8am – 10pm

  return (
    <div className="bg-card rounded-2xl overflow-hidden border border-border/30">
      <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-border/40 bg-muted/10">
        <div />
        {days.map((d) => (
          <div key={d.toISOString()} className="p-2 text-center border-l border-border/30">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{format(d, "EEE")}</p>
            <p className={`text-xs font-semibold mt-0.5 inline-grid place-items-center w-6 h-6 rounded-full ${
              isToday(d) ? "bg-pink-500 text-white" : ""
            }`}>
              {format(d, "d")}
            </p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-[60px_repeat(7,1fr)] max-h-[500px] overflow-y-auto">
        {hours.map((h) => (
          <div key={h} className="contents">
            <div className="text-[10px] text-muted-foreground text-right pr-2 pt-1 border-t border-border/30 h-12 font-medium">
              {h.toString().padStart(2, "0")}:00
            </div>
            {days.map((d) => {
              const dayEvents = events.filter((e) => {
                if (!e.date) return false;
                const dDate = new Date(e.date);
                return isSameDay(dDate, d) && dDate.getHours() === h;
              });
              return (
                <div key={d.toISOString() + h} className="border-t border-l border-border/30 h-12 p-0.5 relative">
                  {dayEvents.map((e) => (
                    <button
                      key={e.id}
                      onClick={() => onPick(e)}
                      className="absolute inset-0.5 text-left text-[9px] px-1 rounded bg-pink-500/10 text-pink-600 dark:bg-pink-950/20 dark:text-pink-400 hover:bg-pink-500/20 transition-colors truncate shadow-sm font-semibold"
                    >
                      {e.title}
                    </button>
                  ))}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Agenda view ───────────────────────────────────────────────────
function AgendaView({ events, onPick }: { events: MockEvent[]; onPick: (e: MockEvent) => void }) {
  const sorted = useMemo(() => {
    return [...events]
      .filter(e => e.date)
      .sort((a, b) => +new Date(a.date) - +new Date(b.date));
  }, [events]);

  const grouped = useMemo(() => {
    return sorted.reduce<Record<string, MockEvent[]>>((acc, e) => {
      const k = format(new Date(e.date), "yyyy-MM-dd");
      (acc[k] ||= []).push(e);
      return acc;
    }, {});
  }, [sorted]);

  if (sorted.length === 0) {
    return (
      <div className="bg-card border border-border/40 rounded-2xl p-12 text-center text-muted-foreground">
        <CalendarDays className="w-8 h-8 mx-auto mb-3 opacity-40 text-pink-500" />
        <p className="text-sm">No events scheduled for the selected calendar.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {Object.entries(grouped).map(([day, list]) => {
        const d = new Date(day);
        return (
          <div key={day} className="grid grid-cols-[80px_1fr] gap-4">
            <div className="text-right pt-2">
              <p className={`font-display text-2xl font-bold ${isToday(d) ? "text-pink-500" : ""}`}>
                {format(d, "d")}
              </p>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">{format(d, "EEE MMM")}</p>
            </div>
            <div className="space-y-2">
              {list.map((e) => (
                <button
                  key={e.id}
                  onClick={() => onPick(e)}
                  className="w-full text-left bg-card border border-border/30 hover:border-pink-500/30 rounded-xl p-3 flex items-center gap-3.5 transition-all"
                >
                  <img src={e.cover} alt="" className="w-12 h-12 rounded-lg object-cover shrink-0 bg-muted" />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm truncate">{e.title}</p>
                    <p className="text-xs text-muted-foreground inline-flex items-center gap-3 mt-0.5">
                      <span className="inline-flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-pink-500" />{format(new Date(e.date), "h:mm a")}</span>
                      <span className="inline-flex items-center gap-1"><Users className="w-3.5 h-3.5 text-pink-500" />{e.attendees?.toLocaleString() || 0}</span>
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground/60 shrink-0" />
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}