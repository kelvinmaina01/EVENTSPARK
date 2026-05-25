import PublicHeader from "@/components/PublicHeader";
import Footer from "@/components/layout/Footer";

const comparisons = [
  ["Hostquill vs Eventbrite", "Hostquill focuses on branded event pages, organizer dashboards, registration flows, check-in, and analytics for teams that want a flexible event hub."],
  ["Hostquill vs Meetup", "Hostquill is built for organizers who need stronger registration forms, event pages, attendee management, and business-friendly event workflows."],
  ["Hostquill vs Humanitix", "Hostquill gives organizers a modern event creation experience with public calendars, analytics, and registration tools in one dashboard."],
];

export default function Compare() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <PublicHeader />
      <main className="max-w-5xl mx-auto px-6 py-20 space-y-10">
        <section className="max-w-3xl space-y-5">
          <p className="text-sm font-semibold text-primary">Compare Hostquill</p>
          <h1 className="text-4xl sm:text-6xl font-display font-bold">Compare Hostquill with event platforms</h1>
          <p className="text-lg text-muted-foreground">Hostquill helps organizers create events, collect registrations, manage attendees, and analyze performance from one platform.</p>
        </section>
        <section className="space-y-4">
          {comparisons.map(([title, body]) => (
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
