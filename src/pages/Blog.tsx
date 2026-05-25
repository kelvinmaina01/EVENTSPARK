import PublicHeader from "@/components/PublicHeader";
import Footer from "@/components/layout/Footer";

const posts = [
  "How to Host a Successful Event in Nairobi",
  "How to Sell More Event Tickets Online",
  "Best Event Venues in Kenya",
  "How to Market Campus Events",
  "Event Planning Checklist for First-Time Organizers",
];

export default function Blog() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <PublicHeader />
      <main className="max-w-5xl mx-auto px-6 py-20 space-y-10">
        <section className="max-w-3xl space-y-5">
          <p className="text-sm font-semibold text-primary">Event guides</p>
          <h1 className="text-4xl sm:text-6xl font-display font-bold">Practical guides for event organizers</h1>
          <p className="text-lg text-muted-foreground">Hostquill publishes clear guides about planning events, selling tickets, marketing events, and improving attendee operations.</p>
        </section>
        <section className="grid gap-4">
          {posts.map((title) => (
            <article key={title} className="rounded-lg border bg-card p-6">
              <h2 className="font-display text-xl font-bold">{title}</h2>
              <p className="mt-3 text-sm text-muted-foreground">A Hostquill guide for organizers who want better event pages, registrations, promotion, check-in, and post-event analytics.</p>
            </article>
          ))}
        </section>
      </main>
      <Footer />
    </div>
  );
}
