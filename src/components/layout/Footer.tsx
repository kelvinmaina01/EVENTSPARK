import { Link } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { Instagram, Twitter, Youtube, Facebook, Apple, Play } from "lucide-react";
import { FaTiktok } from "react-icons/fa"; // Need to install react-icons or use a fallback. We'll use a standard SVG for Tiktok if possible, or just standard lucide icons.
// I'll stick to lucide icons that are available.

const sections = [
  {
    title: "Your account",
    links: [
      { label: "Sign up", to: "/auth" },
      { label: "Log in", to: "/auth" },
      { label: "Help", to: "/#help" },
    ],
  },
  {
    title: "Discover",
    links: [
      { label: "Groups", to: "/calendars" },
      { label: "Events", to: "/events" },
      { label: "Topics", to: "/discover" },
      { label: "Cities", to: "/#cities" },
      { label: "Online events", to: "/#online" },
      { label: "Local guides", to: "/#local-guides" },
      { label: "Make friends", to: "/#friends" },
      { label: "Sitemap", to: "/#sitemap" },
    ],
  },
  {
    title: "Hostquill",
    links: [
      { label: "About", to: "/#about" },
      { label: "Blog", to: "/#blog" },
      { label: "Hostquill Pro", to: "/pricing" },
      { label: "Careers", to: "/#careers" },
      { label: "Apps", to: "/#apps" },
      { label: "Podcast", to: "/#podcast" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-[#19192E] text-white mt-auto">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10">
        
        {/* Top Section: Logo & CTA */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-white/10 pb-8 mb-8">
          <div className="flex items-center gap-2">
            <Logo size="md" className="[&_span]:!text-white" />
            <span className="text-white/80 font-medium tracking-tight mt-1">. The people platform✨</span>
          </div>
          <Link to="/dashboard/events/create" className="text-white font-semibold hover:text-primary transition-colors flex items-center gap-1.5">
            Create your own Hostquill group. Get Started <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>

        {/* Middle Section: Links & Social/Apps */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          {sections.map((s) => (
            <div key={s.title}>
              <h4 className="text-sm font-bold mb-4 text-white">{s.title}</h4>
              <ul className="space-y-2.5">
                {s.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      to={l.to}
                      className="text-sm text-white/70 hover:text-white transition-colors"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="col-span-2 lg:col-span-2 flex flex-col gap-8">
            <div>
              <h4 className="text-sm font-bold mb-4 text-white">Follow us</h4>
              <div className="flex items-center gap-4">
                <a aria-label="Facebook" href="#" className="text-white/70 hover:text-white transition-colors"><Facebook className="w-5 h-5" /></a>
                <a aria-label="Twitter" href="#" className="text-white/70 hover:text-white transition-colors"><Twitter className="w-5 h-5" /></a>
                <a aria-label="YouTube" href="#" className="text-white/70 hover:text-white transition-colors"><Youtube className="w-5 h-5" /></a>
                <a aria-label="Instagram" href="#" className="text-white/70 hover:text-white transition-colors"><Instagram className="w-5 h-5" /></a>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-bold mb-4 text-white">Get the app</h4>
              <div className="flex flex-wrap items-center gap-3">
                <a href="#" className="flex items-center gap-2 bg-white/10 hover:bg-white/20 transition-colors rounded-xl px-4 py-2 border border-white/10">
                  <Play className="w-5 h-5" />
                  <div className="flex flex-col items-start leading-none">
                    <span className="text-[10px] text-white/70">Download on</span>
                    <span className="text-sm font-semibold">Google Play</span>
                  </div>
                </a>
                <a href="#" className="flex items-center gap-2 bg-white/10 hover:bg-white/20 transition-colors rounded-xl px-4 py-2 border border-white/10">
                  <Apple className="w-5 h-5" />
                  <div className="flex flex-col items-start leading-none">
                    <span className="text-[10px] text-white/70">Download on</span>
                    <span className="text-sm font-semibold">App Store</span>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section: Legal */}
        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col lg:flex-row items-center justify-between gap-4 text-xs text-white/60">
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-2">
            <span>© {new Date().getFullYear()} Hostquill Inc.</span>
            <Link to="/terms" className="hover:text-white transition-colors">Terms of service</Link>
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy policy</Link>
            <Link to="/#cookies-settings" className="hover:text-white transition-colors">Cookie Settings</Link>
            <Link to="/#cookies-policy" className="hover:text-white transition-colors">Cookie policy</Link>
            <Link to="/#license" className="hover:text-white transition-colors">License attribution</Link>
            <Link to="/#help" className="hover:text-white transition-colors">Help</Link>
          </div>
          <div className="shrink-0 flex items-center gap-1">
            Made with <span className="text-primary">♥</span> by <span className="font-bold tracking-wider ml-1">MAXKRYIE NETWORKS</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
