import { Link, NavLink as RRNavLink, useNavigate } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { Search, Bell, Plus, Calendar, Compass, Ticket, Sparkles } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Dialog, DialogContent, DialogTrigger,
} from "@/components/ui/dialog";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";

const items = [
  { to: "/", icon: Sparkles, label: "Home" },
  { to: "/events", icon: Ticket, label: "Events" },
  { to: "/calendars", icon: Calendar, label: "Calendars" },
  { to: "/discover", icon: Compass, label: "Discover" },
];

export function PublicHeader() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-background/80">
      <div className="max-w-7xl mx-auto h-14 flex items-center px-4 sm:px-6 gap-2">
        <Link to="/" className="mr-2 shrink-0"><Logo size="sm" /></Link>

        <nav className="flex items-center gap-1">
          {items.map((it) => (
            <RRNavLink
              key={it.to}
              to={it.to}
              className={({ isActive }) =>
                `w-10 h-10 grid place-items-center rounded-full transition-colors ${
                  isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`
              }
              aria-label={it.label}
            >
              <it.icon className="w-[18px] h-[18px]" />
            </RRNavLink>
          ))}
        </nav>

        <div className="flex-1" />

        <Link
          to={user ? "/dashboard/events/create" : "/auth"}
          className="hidden sm:inline-flex items-center gap-1.5 h-9 px-4 rounded-full text-sm font-medium hover:bg-muted transition-colors"
        >
          <Plus className="w-4 h-4" /> Create Event
        </Link>

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

        <button aria-label="Notifications" className="w-10 h-10 grid place-items-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors relative">
          <Bell className="w-[18px] h-[18px]" />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary" />
        </button>

        {user ? (
          <Link to="/dashboard/events" className="w-9 h-9 rounded-full bg-primary/10 grid place-items-center text-primary text-sm font-semibold ml-1">
            {(user.email?.[0] || "U").toUpperCase()}
          </Link>
        ) : (
          <Link to="/auth" className="ml-1 h-9 px-4 inline-flex items-center rounded-full bg-foreground text-background text-sm font-medium hover:bg-foreground/90 transition-colors">
            Sign in
          </Link>
        )}
      </div>
    </header>
  );
}

export default PublicHeader;
