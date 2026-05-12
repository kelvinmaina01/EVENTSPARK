// Stub constants — to be wired up to real services in next phase.
export const CLOUDINARY_UPLOAD_ENDPOINT =
  "https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/auto/upload";
export const CLOUDINARY_UPLOAD_PRESET = "YOUR_UNSIGNED_PRESET";

export const GOOGLE_MAPS_API_KEY = "YOUR_GOOGLE_MAPS_API_KEY";

export const JOIN_LINK_PLACEHOLDER = "https://meet.example.com/join/REPLACE_ME";

export const CALENDAR_SYNC_ENDPOINT = "/api/calendar/sync"; // Google / .ics — TODO

export const VIDEO_LIMITS = {
  maxDurationSec: 120,
  maxBytes: 100 * 1024 * 1024, // 100 MB
  label: "Up to 2 min · 100MB",
};

// ─── URL parsing helpers ──────────────────────────────────────────
export type EmbedInfo =
  | { kind: "youtube"; id: string; embed: string }
  | { kind: "vimeo"; id: string; embed: string }
  | { kind: "direct"; url: string }
  | { kind: "invalid" };

export function parseVideoUrl(url: string): EmbedInfo {
  if (!url) return { kind: "invalid" };
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");

    // YouTube
    if (host.includes("youtube.com") || host === "youtu.be") {
      let id = "";
      if (host === "youtu.be") id = u.pathname.slice(1);
      else if (u.pathname.startsWith("/shorts/")) id = u.pathname.split("/")[2];
      else id = u.searchParams.get("v") || "";
      if (!id) return { kind: "invalid" };
      // Strip overlays — modestbranding, no related, no kb, no controls
      const params = new URLSearchParams({
        modestbranding: "1",
        rel: "0",
        showinfo: "0",
        controls: "0",
        disablekb: "1",
        playsinline: "1",
        autoplay: "1",
        mute: "1",
        loop: "1",
        playlist: id,
      });
      return {
        kind: "youtube",
        id,
        embed: `https://www.youtube.com/embed/${id}?${params.toString()}`,
      };
    }

    // Vimeo
    if (host.includes("vimeo.com")) {
      const id = u.pathname.split("/").filter(Boolean).pop() || "";
      if (!id) return { kind: "invalid" };
      const params = new URLSearchParams({
        background: "1",
        autoplay: "1",
        loop: "1",
        muted: "1",
      });
      return {
        kind: "vimeo",
        id,
        embed: `https://player.vimeo.com/video/${id}?${params.toString()}`,
      };
    }

    // Direct video file
    if (/\.(mp4|webm|mov|m4v)$/i.test(u.pathname)) {
      return { kind: "direct", url };
    }
    return { kind: "invalid" };
  } catch {
    return { kind: "invalid" };
  }
}

// Stub: send a file to Cloudinary. Wired up later.
export async function uploadToCloudinary(file: File): Promise<{ url: string; publicId: string }> {
  // TODO: wire this up to CLOUDINARY_UPLOAD_ENDPOINT with CLOUDINARY_UPLOAD_PRESET
  // For now return a local object URL so the UI works.
  return { url: URL.createObjectURL(file), publicId: `local-${Date.now()}` };
}

// Extract first frame as a poster image (data URL) from a video file
export function extractFirstFrame(file: File): Promise<string | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const v = document.createElement("video");
    v.preload = "metadata";
    v.muted = true;
    v.src = url;
    v.onloadeddata = () => {
      v.currentTime = Math.min(0.1, (v.duration || 1) * 0.05);
    };
    v.onseeked = () => {
      try {
        const c = document.createElement("canvas");
        c.width = v.videoWidth;
        c.height = v.videoHeight;
        const ctx = c.getContext("2d");
        if (!ctx) return resolve(null);
        ctx.drawImage(v, 0, 0, c.width, c.height);
        resolve(c.toDataURL("image/jpeg", 0.7));
      } catch {
        resolve(null);
      } finally {
        URL.revokeObjectURL(url);
      }
    };
    v.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };
  });
}