import { Link, NavLink as RRNavLink, useNavigate } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { Search, Bell, Plus, Compass, Ticket, Sparkles, Calendar, Globe } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Dialog, DialogContent, DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";

const navItems = [
  { to: "/events", label: "Events" },
  { to: "/calendars", label: "Calendars" },
  { to: "/discover", label: "Discover" },
];

export function PublicHeader() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const timeStr = new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: true }) +
    " " + new Intl.DateTimeFormat([], { timeZoneName: "short" }).formatToParts(new Date()).find(p => p.type === "timeZoneName")?.value;

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-background/80">
      <div className="max-w-7xl mx-auto h-14 flex items-center px-4 sm:px-6">
        
        {/* Left: Logo & Search */}
        <div className="flex-1 flex items-center gap-4 xl:gap-6">
          <Link to="/" className="shrink-0"><Logo size="sm" /></Link>

          {/* Search Bar (Meetup Style) */}
          <div className="hidden md:flex items-center h-10 bg-muted/60 hover:bg-muted border border-transparent hover:border-border rounded-full pl-4 pr-1.5 focus-within:!bg-background focus-within:!border-primary/50 focus-within:ring-2 focus-within:ring-primary/20 transition-all shadow-sm max-w-[380px] w-full">
            <input type="text" placeholder="Search events..." className="bg-transparent border-none outline-none text-sm placeholder:text-muted-foreground w-full flex-1 min-w-[80px] lg:min-w-[120px]" />
            <div className="w-px h-5 bg-border mx-2 shrink-0" />
            <input type="text" defaultValue="Othaya, KE" className="bg-transparent border-none outline-none text-sm w-[90px] xl:w-[110px] shrink-0" />
            <button className="w-8 h-8 rounded-full bg-[#19192E] text-white flex items-center justify-center ml-1 hover:bg-[#19192E]/90 shrink-0">
              <Search className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Language Selector Modal */}
          <Dialog>
            <DialogTrigger className="hidden lg:flex items-center gap-1.5 text-sm font-medium hover:bg-muted px-3 py-1.5 rounded-lg transition-colors text-foreground">
              <Globe className="w-4 h-4 text-muted-foreground" /> English
            </DialogTrigger>
            <DialogContent className="max-w-2xl p-6 rounded-3xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-base font-bold mx-auto">Change your language</h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  "English", "English (Australia)", "Deutsch",
                  "Español", "Español (España)", "Français",
                  "Italiano", "Nederlands", "Polski",
                  "Português", "Türkçe", "ไทย",
                  "日本語", "한국어", "Русский"
                ].map((lang) => (
                  <button key={lang} className={`flex items-center gap-3 p-3 rounded-full border transition-colors ${lang === 'English' ? 'border-[#19192E] ring-1 ring-[#19192E] bg-muted/20' : 'border-border hover:border-primary/50'}`}>
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${lang === 'English' ? 'border-[#19192E]' : 'border-muted-foreground/30'}`}>
                      {lang === 'English' && <div className="w-2 h-2 rounded-full bg-[#19192E]" />}
                    </div>
                    <span className="text-sm font-medium text-foreground">{lang}</span>
                  </button>
                ))}
              </div>
              <div className="flex justify-end gap-3 mt-8">
                <DialogTrigger asChild>
                  <Button variant="ghost" className="rounded-full font-semibold">Cancel</Button>
                </DialogTrigger>
                <DialogTrigger asChild>
                  <Button className="rounded-full bg-[#19192E] hover:bg-[#19192E]/90 text-white px-6 font-semibold">Save</Button>
                </DialogTrigger>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Center: Navigation */}
        <nav className="hidden sm:flex items-center justify-center gap-1">
          {navItems.map((it) => (
            <RRNavLink
              key={it.to}
              to={it.to}
              className={({ isActive }) =>
                `h-9 px-4 inline-flex items-center rounded-full text-sm font-medium transition-colors ${
                  isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`
              }
            >
              {it.label}
            </RRNavLink>
          ))}
        </nav>

        {/* Right: Actions */}
        <div className="flex-1 flex items-center justify-end gap-2">
          <span className="hidden md:inline text-xs text-muted-foreground tabular-nums mr-1">{timeStr}</span>

          {user && (
            <Link
              to="/dashboard/events/create"
              className="hidden sm:inline-flex items-center gap-1.5 h-9 px-4 rounded-full text-sm font-medium hover:bg-muted transition-colors"
            >
              <Plus className="w-4 h-4" /> Create Event
            </Link>
          )}

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <button aria-label="Search" className="w-10 h-10 grid place-items-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                <Search className="w-[18px] h-[18px]" />
              </button>
            </DialogTrigger>
            <DialogContent className="p-0 max-w-lg overflow-hidden">
              <Command>
                <CommandInput placeholder="Search for events, calendars and more…" />
                <CommandList>
                  <CommandEmpty>No results.</CommandEmpty>
                  <CommandGroup heading="Shortcuts">
                    <CommandItem onSelect={() => { setOpen(false); navigate(user ? "/dashboard/events/create" : "/auth"); }}>
                      <Plus className="w-4 h-4 mr-2" /> Create Event
                    </CommandItem>
                    <CommandItem onSelect={() => { setOpen(false); navigate("/events"); }}>
                      <Ticket className="w-4 h-4 mr-2" /> Open Events
                    </CommandItem>
                    <CommandItem onSelect={() => { setOpen(false); navigate("/discover"); }}>
                      <Compass className="w-4 h-4 mr-2" /> Open Discover
                    </CommandItem>
                    <CommandItem onSelect={() => { setOpen(false); navigate("/"); }}>
                      <Sparkles className="w-4 h-4 mr-2" /> Open Home
                    </CommandItem>
                  </CommandGroup>
                </CommandList>
              </Command>
            </DialogContent>
          </Dialog>

          {user ? (
            <>
              <button aria-label="Notifications" className="w-10 h-10 grid place-items-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors relative">
                <Bell className="w-[18px] h-[18px]" />
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary" />
              </button>
              <Link to="/dashboard/events" className="w-9 h-9 rounded-full bg-primary/10 grid place-items-center text-primary text-sm font-semibold ml-1">
                {(user.email?.[0] || "U").toUpperCase()}
              </Link>
            </>
          ) : (
            <>
              <Link to="/auth" className="h-9 px-4 inline-flex items-center rounded-full text-sm font-medium text-foreground hover:bg-muted transition-colors">
                Sign In
              </Link>
              <Link to="/auth" className="h-9 px-4 inline-flex items-center rounded-full bg-foreground text-background text-sm font-medium hover:bg-foreground/90 transition-colors">
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default PublicHeader;
