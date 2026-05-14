import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useEvent } from "@/hooks/useEvents";
import { useRegistrationsByEvent } from "@/hooks/useRegistrations";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Camera, CheckCircle2, Search, UserCheck, X } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";

export default function CheckIn() {
  const { id } = useParams();
  const { data: event } = useEvent(id);
  const { data: regs = [] } = useRegistrationsByEvent(id);
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [scannerOpen, setScannerOpen] = useState(false);
  const [manualCode, setManualCode] = useState("");
  const [last, setLast] = useState<{ name: string; ok: boolean } | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const lastScanRef = useRef<{ code: string; t: number }>({ code: "", t: 0 });
  const regsRef = useRef(regs);
  useEffect(() => { regsRef.current = regs; }, [regs]);
  // Track in-flight check-in mutations per registration id to disable controls.
  const [pending, setPending] = useState<Set<string>>(new Set());

  // Derive checked-in set from registration.attended_at (server-side persistence).
  const checked = useMemo(() => {
    const s = new Set<string>();
    regs.forEach((r) => { if ((r as any).attended_at) s.add(r.id); });
    return s;
  }, [regs]);

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

  const toggle = async (regId: string, name: string) => {
    if (!id) return;
    if (pending.has(regId)) return;
    const wasIn = checked.has(regId);
    const nextValue = wasIn ? null : new Date().toISOString();
    setPending((p) => { const n = new Set(p); n.add(regId); return n; });
    const { error } = await supabase
      .from("registrations")
      .update({ attended_at: nextValue })
      .eq("id", regId);
    setPending((p) => { const n = new Set(p); n.delete(regId); return n; });
    if (error) {
      toast.error(error.message || "Couldn't update check-in");
      setLast({ name, ok: false });
      return;
    }
    await qc.invalidateQueries({ queryKey: ["registrations", id] });
    setLast({ name, ok: !wasIn });
    toast.success(wasIn ? `Undid check-in: ${name}` : `Checked in: ${name}`);
  };

  const handleManual = (e: React.FormEvent) => {
    e.preventDefault();
    const code = manualCode.trim().toLowerCase();
    if (!code) return;
    processCode(code);
    setManualCode("");
  };

  // Process a scanned/typed code: match registration id, email, or any field value (substring).
  const processCode = (raw: string) => {
    const code = raw.trim().toLowerCase();
    if (!code) return;
    const list = regsRef.current;
    const match = list.find((r) => {
      if (r.id.toLowerCase() === code) return true;
      const data = (r.data || {}) as Record<string, string>;
      return Object.values(data).some((v) => {
        const s = String(v).toLowerCase();
        return s === code || s.includes(code);
      });
    });
    if (!match) {
      toast.error("No matching registration found");
      setLast({ name: raw, ok: false });
      return;
    }
    const data = (match.data || {}) as Record<string, string>;
    const name = data["Full Name"] || data["Name"] || "Guest";
    if (!(match as any).attended_at) toggle(match.id, name);
    else { setLast({ name, ok: true }); toast.message(`${name} is already checked in`); }
  };

  // Start/stop the QR scanner when the panel opens/closes.
  useEffect(() => {
    if (!scannerOpen) {
      const inst = scannerRef.current;
      if (inst) {
        inst.stop().catch(() => {}).finally(() => { inst.clear(); scannerRef.current = null; });
      }
      return;
    }
    let cancelled = false;
    const elementId = "qr-reader-region";
    const start = async () => {
      // Wait one frame so the DOM node exists.
      await new Promise((r) => requestAnimationFrame(r));
      if (cancelled) return;
      try {
        const inst = new Html5Qrcode(elementId, {
          formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
          verbose: false,
        });
        scannerRef.current = inst;
        await inst.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 240, height: 240 }, aspectRatio: 1.6 },
          (decoded) => {
            const now = Date.now();
            // debounce identical scans within 2s
            if (lastScanRef.current.code === decoded && now - lastScanRef.current.t < 2000) return;
            lastScanRef.current = { code: decoded, t: now };
            processCode(decoded);
          },
          () => { /* ignore decode errors */ },
        );
      } catch (err: any) {
        toast.error(err?.message || "Couldn't start camera. Check permissions.");
      }
    };
    start();
    return () => {
      cancelled = true;
      const inst = scannerRef.current;
      if (inst) {
        inst.stop().catch(() => {}).finally(() => { inst.clear(); scannerRef.current = null; });
      }
    };
  }, [scannerOpen]);

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
                <div className="rounded-xl bg-foreground overflow-hidden relative">
                  <div id="qr-reader-region" className="w-full [&_video]:w-full [&_video]:h-auto [&_video]:rounded-xl" />
                  <div className="pointer-events-none absolute inset-6 border-2 border-primary/70 rounded-xl" />
                </div>
                <p className="text-[11px] text-muted-foreground mt-2">
                  Point the camera at an attendee QR code. Allow camera access if prompted.
                </p>
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
            const isPending = pending.has(r.id);
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
                  disabled={isPending}
                >
                  {isPending ? (
                    <><span className="w-3.5 h-3.5 mr-1.5 rounded-full border-2 border-current border-t-transparent animate-spin" /> Saving…</>
                  ) : isIn ? (
                    <><CheckCircle2 className="w-4 h-4 mr-1.5 text-success" /> Checked in</>
                  ) : (
                    "Check in"
                  )}
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
