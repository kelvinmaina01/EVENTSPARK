import PublicHeader from "@/components/PublicHeader";
import Footer from "@/components/layout/Footer";

const features = [
  ["Event creation", "Create branded event pages with descriptions, dates, locations, images, forms, and registration limits."],
  ["Ticket selling", "Set paid or free event access and prepare the platform for payment provider integrations."],
  ["Registration forms", "Collect attendee information with custom fields and store registrations in your organizer dashboard."],
  ["Check-in", "Use attendee lists, manual search, and QR-friendly workflows to manage arrivals at the venue."],
  ["Analytics", "Track page views, registrations, sources, and conversion rates for better event marketing decisions."],
  ["Organizer calendars", "Group related events under public organizer calendars and profiles for better discovery."],
];

export default function Features() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <PublicHeader />
      <main className="max-w-6xl mx-auto px-6 py-20 space-y-10">
        <section className="max-w-3xl space-y-5">
          <p className="text-sm font-semibold text-primary">Features</p>
          <h1 className="text-4xl sm:text-6xl font-display font-bold">Everything organizers need to launch and manage events</h1>
          <p className="text-lg text-muted-foreground">Hostquill helps teams create event pages, sell tickets, collect registrations, manage attendees, and measure event performance.</p>
        </section>
        <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map(([title, body]) => (
            <article key={title} className="rounded-lg border bg-card p-6">
              <h2 className="font-display text-xl font-bold">{title}</h2>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{body}</p>
            </article>
          ))}
        </section>
      </main>
      <Footer />
    </div>
  );
}
