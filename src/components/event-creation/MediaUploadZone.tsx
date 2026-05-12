import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Image as ImageIcon, Video as VideoIcon, Link2, Upload, X, Loader2, Play, Pause } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  uploadToCloudinary,
  extractFirstFrame,
  parseVideoUrl,
  VIDEO_LIMITS,
  CLOUDINARY_UPLOAD_ENDPOINT,
  EmbedInfo,
} from "@/lib/mediaConstants";

export type MediaValue =
  | { kind: "image"; url: string }
  | { kind: "video"; url: string; poster?: string }
  | { kind: "embed"; url: string; embed: EmbedInfo }
  | null;

interface Props {
  value: MediaValue;
  onChange: (v: MediaValue) => void;
  /** Image-only fallback uploader (e.g. supabase) — used when user picks an image */
  onImageFile?: (file: File) => Promise<string | null>;
}

type Tab = "image" | "video" | "url";

export default function MediaUploadZone({ value, onChange, onImageFile }: Props) {
  const [tab, setTab] = useState<Tab>(
    value?.kind === "video" ? "video" : value?.kind === "embed" ? "url" : "image",
  );
  const [uploading, setUploading] = useState(false);
  const [urlInput, setUrlInput] = useState(value?.kind === "embed" ? value.url : "");
  const [playing, setPlaying] = useState(true);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleFile = async (file: File) => {
    if (tab === "image") {
      if (!file.type.startsWith("image/")) return toast.error("Please upload an image file");
      setUploading(true);
      try {
        const url = onImageFile ? await onImageFile(file) : URL.createObjectURL(file);
        if (url) onChange({ kind: "image", url });
      } finally {
        setUploading(false);
      }
    } else if (tab === "video") {
      if (!file.type.startsWith("video/")) return toast.error("Please upload a video file");
      if (file.size > VIDEO_LIMITS.maxBytes) return toast.error(`Video too large — ${VIDEO_LIMITS.label}`);
      setUploading(true);
      try {
        const [{ url }, poster] = await Promise.all([
          uploadToCloudinary(file), // stub → wired to CLOUDINARY_UPLOAD_ENDPOINT later
          extractFirstFrame(file),
        ]);
        onChange({ kind: "video", url, poster: poster || undefined });
        toast.success("Video ready");
      } catch {
        toast.error("Could not process video");
      } finally {
        setUploading(false);
      }
    }
  };

  const handleUrlSubmit = () => {
    const parsed = parseVideoUrl(urlInput.trim());
    if (parsed.kind === "invalid") {
      toast.error("Paste a valid YouTube, Vimeo, or .mp4 URL");
      return;
    }
    onChange({ kind: "embed", url: urlInput.trim(), embed: parsed });
  };

  const clear = () => {
    onChange(null);
    setUrlInput("");
    setPlaying(true);
  };

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) { v.play(); setPlaying(true); }
    else { v.pause(); setPlaying(false); }
  };

  const tabs: { id: Tab; label: string; icon: typeof ImageIcon }[] = [
    { id: "image", label: "Image", icon: ImageIcon },
    { id: "video", label: "Video", icon: VideoIcon },
    { id: "url", label: "Paste a URL", icon: Link2 },
  ];

  // ─── Frame ratio: Luma ~1.91:1 ──────────────────────────────────
  const frame = "aspect-[1.91/1] w-full bg-muted rounded-2xl overflow-hidden relative";

  return (
    <div className="space-y-3">
      {/* Tabs */}
      <div className="inline-flex gap-1 p-1 bg-muted rounded-full">
        {tabs.map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`inline-flex items-center gap-1.5 px-3.5 h-8 rounded-full text-xs font-medium transition-colors ${
                active ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <t.icon className="w-3.5 h-3.5" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Frame */}
      <div
        className={frame}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (tab === "url") return;
          const f = e.dataTransfer.files?.[0];
          if (f) handleFile(f);
        }}
      >
        <AnimatePresence mode="wait">
          {/* ─── Filled state ─── */}
          {value?.kind === "image" && (
            <motion.img
              key="img"
              src={value.url}
              alt="Cover"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
          {value?.kind === "video" && (
            <motion.div key="vid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 group">
              <video
                ref={videoRef}
                src={value.url}
                poster={value.poster}
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={togglePlay}
                className="absolute bottom-3 right-3 w-9 h-9 rounded-full bg-black/60 text-white grid place-items-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
            </motion.div>
          )}
          {value?.kind === "embed" && (
            <motion.div key="embed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0">
              {value.embed.kind === "direct" ? (
                <video src={value.embed.url} autoPlay muted loop playsInline className="w-full h-full object-cover" />
              ) : value.embed.kind === "youtube" || value.embed.kind === "vimeo" ? (
                <div className="relative w-full h-full">
                  <iframe
                    src={value.embed.embed}
                    title="Embedded video"
                    allow="autoplay; encrypted-media; picture-in-picture"
                    className="absolute inset-0 w-full h-full"
                    style={{ border: 0 }}
                  />
                  {/* Block all overlays/end cards/UI from the embed */}
                  <div className="absolute inset-0" style={{ pointerEvents: "none" }} />
                </div>
              ) : null}
            </motion.div>
          )}

          {/* ─── Empty state ─── */}
          {!value && (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 grid place-items-center">
              {tab === "url" ? (
                <div className="w-full max-w-md px-6 space-y-3">
                  <p className="text-sm text-center text-muted-foreground">
                    Paste a YouTube, Vimeo or direct .mp4 link
                  </p>
                  <div className="flex gap-2">
                    <Input
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      placeholder="https://youtube.com/watch?v=..."
                      className="rounded-full h-10"
                    />
                    <Button type="button" onClick={handleUrlSubmit} className="rounded-full h-10">
                      Add
                    </Button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className={`w-full h-full flex flex-col items-center justify-center gap-2 transition-colors ${
                    dragOver ? "bg-primary/5" : ""
                  }`}
                >
                  {uploading ? (
                    <Loader2 className="w-7 h-7 animate-spin text-muted-foreground" />
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-full bg-background grid place-items-center">
                        <Upload className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <p className="text-sm font-medium">
                        Drag & drop or <span className="text-primary">click to upload</span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {tab === "image" ? "PNG, JPG up to 10MB" : VIDEO_LIMITS.label}
                      </p>
                    </>
                  )}
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {value && (
          <button
            type="button"
            onClick={clear}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 text-white grid place-items-center hover:bg-black/80 transition-colors"
            aria-label="Remove media"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* URL tab when something is already loaded → show input below */}
      {tab === "url" && value?.kind === "embed" && (
        <div className="flex gap-2">
          <Input
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="Paste another URL"
            className="rounded-full h-10"
          />
          <Button type="button" onClick={handleUrlSubmit} variant="outline" className="rounded-full h-10">
            Replace
          </Button>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileRef}
        type="file"
        accept={tab === "video" ? "video/*" : "image/*"}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.target.value = "";
        }}
      />

      {/* Endpoint hint (dev only — silent in prod) */}
      <p className="text-[10px] text-muted-foreground/60">
        Videos upload via Cloudinary stub: <code className="font-mono">{CLOUDINARY_UPLOAD_ENDPOINT}</code>
      </p>
    </div>
  );
}