import { Link } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { Instagram, Twitter, Youtube, Mail, Sparkles } from "lucide-react";

const sections: { title: string; links: { label: string; to: string; external?: boolean }[] }[] = [
  {
    title: "Product",
    links: [
      { label: "Discover", to: "/discover" },
      { label: "Events", to: "/events" },
      { label: "Create event", to: "/dashboard/events/create" },
      { label: "Pricing", to: "/#pricing" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", to: "/#about" },
      { label: "Careers", to: "/#careers" },
      { label: "Brand", to: "/#brand" },
      { label: "Contact", to: "/#contact" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Help center", to: "/#help" },
      { label: "Guides", to: "/#guides" },
      { label: "Changelog", to: "/#changelog" },
      { label: "Status", to: "/#status" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", to: "/#privacy" },
      { label: "Terms", to: "/#terms" },
      { label: "Cookies", to: "/#cookies" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-foreground text-background mt-12">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-14">
        {/* Top: logo + tagline + nav */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8">
          <div className="col-span-2">
            <Logo size="md" className="[&_span]:!text-background" />
            <p className="mt-4 text-sm text-background/60 max-w-xs leading-relaxed">
              Delightful event pages, registrations, and reminders — built for
              builders, communities and humans who throw great gatherings.
            </p>
            <div className="mt-5 flex items-center gap-2">
              <a aria-label="Instagram" href="#" className="w-10 h-10 grid place-items-center rounded-full bg-background/10 hover:bg-primary transition-colors"><Instagram className="w-4 h-4" /></a>
              <a aria-label="Twitter" href="#" className="w-10 h-10 grid place-items-center rounded-full bg-background/10 hover:bg-primary transition-colors"><Twitter className="w-4 h-4" /></a>
              <a aria-label="YouTube" href="#" className="w-10 h-10 grid place-items-center rounded-full bg-background/10 hover:bg-primary transition-colors"><Youtube className="w-4 h-4" /></a>
              <a aria-label="Email" href="#" className="w-10 h-10 grid place-items-center rounded-full bg-background/10 hover:bg-primary transition-colors"><Mail className="w-4 h-4" /></a>
            </div>
          </div>

          {sections.map((s) => (
            <div key={s.title}>
              <h4 className="text-sm font-semibold mb-4 text-background">{s.title}</h4>
              <ul className="space-y-2.5">
                {s.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      to={l.to}
                      className="text-sm text-background/60 hover:text-primary transition-colors"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter strip */}
        <div className="mt-12 grid md:grid-cols-2 gap-6 items-center bg-background/5 rounded-2xl p-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-primary grid place-items-center shrink-0">
              <Sparkles className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <h4 className="text-base font-semibold">Get the eventspark digest</h4>
              <p className="text-sm text-background/60">Curated upcoming events near you, weekly.</p>
            </div>
          </div>
          <form
            className="flex gap-2 w-full"
            onSubmit={(e) => { e.preventDefault(); /* TODO: POST /api/subscribe */ }}
          >
            <input
              type="email"
              required
              placeholder="you@example.com"
              className="flex-1 h-11 rounded-full bg-background text-foreground px-5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              type="submit"
              className="h-11 px-5 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
            >
              Subscribe
            </button>
          </form>
        </div>

        {/* Bottom strip */}
        <div className="mt-10 pt-6 border-t border-background/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs text-background/50">
          <p>© {new Date().getFullYear()} eventspark. Built with care.</p>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-background transition-colors">English</a>
            <a href="#" className="hover:text-background transition-colors">Get the App</a>
            <a href="#" className="hover:text-background transition-colors">Help</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
