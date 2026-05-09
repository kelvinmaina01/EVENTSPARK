import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useEvent } from "@/hooks/useEvents";
import { useRegistrationsByEvent } from "@/hooks/useRegistrations";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Camera, CheckCircle2, Search, UserCheck, X } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

// MOCK: persist check-ins to localStorage so we can iterate without a migration.
// TODO: replace with: POST /api/events/:id/checkin { registration_id }
function loadCheckedIn(eventId: string): Set<string> {
  try {
    const raw = localStorage.getItem(`eventspark:checkin:${eventId}`);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch { return new Set(); }
}
function saveCheckedIn(eventId: string, set: Set<string>) {
  localStorage.setItem(`eventspark:checkin:${eventId}`, JSON.stringify([...set]));
}

export default function CheckIn() {
  const { id } = useParams();
  const { data: event } = useEvent(id);
  const { data: regs = [] } = useRegistrationsByEvent(id);
  const [search, setSearch] = useState("");
  const [scannerOpen, setScannerOpen] = useState(false);
  const [manualCode, setManualCode] = useState("");
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [last, setLast] = useState<{ name: string; ok: boolean } | null>(null);

  useEffect(() => {
    if (id) setChecked(loadCheckedIn(id));
  }, [id]);

  const list = useMemo(() => {
    const q = search.trim().toLowerCase();
    return regs
      .filter((r) => {
        if (!q) return true;
        const data = (r.data || {}) as Record<string, string>;
        return Object.values(data).some((v) => String(v).toLowerCase().includes(q));
      })
      .map((r) => {
        const data = (r.data || {}) as Record<string, string>;
        const name = data["Full Name"] || data["Name"] || data["full_name"] || "Guest";
        const email = data["Email"] || data["Email Address"] || data["email"] || "";
        return { id: r.id, name, email };
      });
  }, [regs, search]);

  const stats = {
    total: regs.length,
    checked: checked.size,
    pct: regs.length ? Math.round((checked.size / regs.length) * 100) : 0,
  };

  const toggle = (regId: string, name: string) => {
    if (!id) return;
    const next = new Set(checked);
    let ok = true;
    if (next.has(regId)) { next.delete(regId); ok = false; }
    else { next.add(regId); }
    setChecked(next);
    saveCheckedIn(id, next);
    setLast({ name, ok });
    toast.success(ok ? `Checked in: ${name}` : `Undid check-in: ${name}`);
  };

  const handleManual = (e: React.FormEvent) => {
    e.preventDefault();
    const code = manualCode.trim().toLowerCase();
    if (!code) return;
    // Code can be a registration id, an email, or a name fragment.
    const match = regs.find((r) => {
      if (r.id.toLowerCase() === code) return true;
      const data = (r.data || {}) as Record<string, string>;
      return Object.values(data).some((v) => String(v).toLowerCase() === code);
    });
    if (!match) {
      toast.error("No matching registration found");
      setLast({ name: code, ok: false });
      return;
    }
    const data = (match.data || {}) as Record<string, string>;
    const name = data["Full Name"] || data["Name"] || "Guest";
    if (!checked.has(match.id)) toggle(match.id, name);
    else toast.message(`${name} is already checked in`);
    setManualCode("");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <Link to={`/dashboard/events/${id}`} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to event
          </Link>
          <h1 className="text-2xl sm:text-3xl font-display font-bold mt-1">Check-in · {event?.name || "…"}</h1>
        </div>
        <Button
          onClick={() => setScannerOpen((s) => !s)}
          className="rounded-full"
          variant={scannerOpen ? "outline" : "default"}
        >
          <Camera className="w-4 h-4 mr-2" />
          {scannerOpen ? "Close scanner" : "Scan QR"}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Registered", value: stats.total },
          { label: "Checked-in", value: stats.checked },
          { label: "Attendance", value: `${stats.pct}%` },
        ].map((s) => (
          <div key={s.label} className="bg-card rounded-2xl p-4 sm:p-5">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">{s.label}</p>
            <p className="text-2xl sm:text-3xl font-display font-bold mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Scanner placeholder + manual fallback */}
      <AnimatePresence>
        {scannerOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-card rounded-2xl p-5 sm:p-6 grid md:grid-cols-2 gap-5">
              <div>
                <h3 className="font-display font-semibold mb-3">Camera scanner</h3>
                <div className="aspect-video rounded-xl bg-foreground text-background grid place-items-center relative overflow-hidden">
                  <div className="absolute inset-6 border-2 border-primary/70 rounded-xl" />
                  <div className="text-center px-4">
                    <Camera className="w-10 h-10 mx-auto mb-2 opacity-70" />
                    <p className="text-sm opacity-70">Camera preview placeholder</p>
                    <p className="text-[11px] opacity-50 mt-1">
                      TODO: hook up html5-qrcode or BarcodeDetector — endpoint
                      will POST to <code>/api/events/:id/checkin</code>.
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-display font-semibold mb-3">Manual check-in</h3>
                <form onSubmit={handleManual} className="space-y-3">
                  <Input
                    autoFocus
                    placeholder="Paste code, scan, type name or email…"
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    className="rounded-full h-11"
                  />
                  <Button type="submit" className="w-full rounded-full h-11">
                    <UserCheck className="w-4 h-4 mr-2" /> Check in
                  </Button>
                </form>
                {last && (
                  <div className={`mt-4 flex items-center gap-2 text-sm rounded-xl px-3 py-2 ${last.ok ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
                    {last.ok ? <CheckCircle2 className="w-4 h-4" /> : <X className="w-4 h-4" />}
                    {last.ok ? `Checked in: ${last.name}` : `Failed: ${last.name}`}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Attendee list */}
      <div className="bg-card rounded-2xl p-4 sm:p-5">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search attendees…" className="pl-10 rounded-full" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="divide-y divide-border">
          {list.length === 0 && <p className="text-sm text-muted-foreground py-8 text-center">No registrations yet.</p>}
          {list.map((r) => {
            const isIn = checked.has(r.id);
            return (
              <div key={r.id} className="flex items-center justify-between py-3">
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate">{r.name}</p>
                  {r.email && <p className="text-xs text-muted-foreground truncate">{r.email}</p>}
                </div>
                <Button
                  size="sm"
                  variant={isIn ? "outline" : "default"}
                  className="rounded-full"
                  onClick={() => toggle(r.id, r.name)}
                >
                  {isIn ? <><CheckCircle2 className="w-4 h-4 mr-1.5 text-success" /> Checked in</> : "Check in"}
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
