import { Icon } from "@iconify/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export type Host = {
  name: string;
  avatar: string;
  socials?: {
    twitter?: string;
    linkedin?: string;
    instagram?: string;
    website?: string;
  };
};

interface OrganizerSocialsProps {
  hosts: Host[];
  className?: string;
}

export function OrganizerSocials({ hosts, className = "" }: OrganizerSocialsProps) {
  if (!hosts || hosts.length === 0) return null;

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex flex-wrap gap-4">
        {hosts.map((host) => {
          const initials = host.name.split(" ").map(n => n[0]).join("").toUpperCase();

          return (
            <div
              key={host.name}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-3xl bg-card border border-border/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] w-full transition-all duration-300 hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] hover:border-border"
            >
              {/* Host Profile Info */}
              <div className="flex items-center gap-3">
                <Avatar className="w-11 h-11 border-2 border-background shadow-sm shrink-0">
                  <AvatarImage src={host.avatar} alt={host.name} />
                  <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">
                    {initials || "H"}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground tracking-tight truncate">
                    {host.name}
                  </p>
                  <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">
                    Event Host
                  </p>
                </div>
              </div>

              {/* Fluent UI 3D Gradient Social Links */}
              {host.socials && Object.keys(host.socials).length > 0 && (
                <div className="flex items-center gap-2.5">
                  {host.socials.twitter && (
                    <a
                      href={host.socials.twitter}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`${host.name} on Twitter/X`}
                      className="group relative w-9 h-9 rounded-2xl bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/15 border border-white/25 overflow-hidden transition-all duration-300 hover:scale-110 hover:-translate-y-0.5 hover:shadow-blue-500/30"
                    >
                      {/* 3D Glossy reflection layer */}
                      <span className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/15 to-white/0 transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                      <Icon icon="fluent:logo-twitter-24-filled" className="w-[18px] h-[18px] drop-shadow-md" />
                    </a>
                  )}

                  {host.socials.linkedin && (
                    <a
                      href={host.socials.linkedin}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`${host.name} on LinkedIn`}
                      className="group relative w-9 h-9 rounded-2xl bg-gradient-to-br from-blue-400 via-blue-600 to-blue-800 text-white flex items-center justify-center shadow-lg shadow-blue-600/15 border border-white/25 overflow-hidden transition-all duration-300 hover:scale-110 hover:-translate-y-0.5 hover:shadow-blue-600/30"
                    >
                      {/* 3D Glossy reflection layer */}
                      <span className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/15 to-white/0 transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                      <Icon icon="fluent:logo-linkedin-24-filled" className="w-[18px] h-[18px] drop-shadow-md" />
                    </a>
                  )}

                  {host.socials.instagram && (
                    <a
                      href={host.socials.instagram}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`${host.name} on Instagram`}
                      className="group relative w-9 h-9 rounded-2xl bg-gradient-to-br from-pink-500 via-red-500 to-yellow-500 text-white flex items-center justify-center shadow-lg shadow-pink-500/15 border border-white/25 overflow-hidden transition-all duration-300 hover:scale-110 hover:-translate-y-0.5 hover:shadow-pink-500/30"
                    >
                      {/* 3D Glossy reflection layer */}
                      <span className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/15 to-white/0 transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                      <Icon icon="fluent:logo-instagram-24-filled" className="w-[18px] h-[18px] drop-shadow-md" />
                    </a>
                  )}

                  {host.socials.website && (
                    <a
                      href={host.socials.website}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`${host.name} Website`}
                      className="group relative w-9 h-9 rounded-2xl bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 text-white flex items-center justify-center shadow-lg shadow-teal-500/15 border border-white/25 overflow-hidden transition-all duration-300 hover:scale-110 hover:-translate-y-0.5 hover:shadow-teal-500/30"
                    >
                      {/* 3D Glossy reflection layer */}
                      <span className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/15 to-white/0 transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                      <Icon icon="fluent:globe-24-filled" className="w-[18px] h-[18px] drop-shadow-md" />
                    </a>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default OrganizerSocials;
