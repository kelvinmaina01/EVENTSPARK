import { Link, useParams } from "react-router-dom";
import PublicHeader from "@/components/PublicHeader";
import Footer from "@/components/layout/Footer";

function titleize(slug = "events") {
  return slug.replace(/[-_]+/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function SeoLandingPage({ type }: { type: "city" | "category" }) {
  const params = useParams();
  const name = titleize(type === "city" ? params.citySlug : params.categorySlug);
  const heading = type === "city" ? `${name} events` : `${name} events`;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PublicHeader />
      <main className="max-w-5xl mx-auto px-6 py-20 space-y-10">
        <section className="space-y-5 max-w-3xl">
          <p className="text-sm font-semibold text-primary">{type === "city" ? "City events" : "Event category"}</p>
          <h1 className="text-4xl sm:text-6xl font-display font-bold">{heading} on Hostquill</h1>
          <p className="text-lg text-muted-foreground">
            Discover {name.toLowerCase()} events on Hostquill. Browse organizers, event calendars, registration pages, tickets, and attendee details from one event platform.
          </p>
        </section>
        <section className="rounded-lg border bg-card p-6">
          <h2 className="font-display text-2xl font-bold">Explore related event pages</h2>
          <p className="mt-3 text-muted-foreground">
            Hostquill links events with organizer profiles, public calendars, city pages, category pages, and guides so people and AI systems can understand how events are related.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link className="text-sm font-semibold text-primary hover:underline" to="/events">All events</Link>
            <Link className="text-sm font-semibold text-primary hover:underline" to="/calendars">Organizer calendars</Link>
            <Link className="text-sm font-semibold text-primary hover:underline" to="/features">Features</Link>
            <Link className="text-sm font-semibold text-primary hover:underline" to="/blog">Event guides</Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
