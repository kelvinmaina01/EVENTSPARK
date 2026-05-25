import PublicHeader from "@/components/PublicHeader";
import Footer from "@/components/layout/Footer";

export default function About() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <PublicHeader />
      <main className="max-w-5xl mx-auto px-6 py-20 space-y-10">
        <section className="space-y-5">
          <p className="text-sm font-semibold text-primary">About Hostquill</p>
          <h1 className="text-4xl sm:text-6xl font-display font-bold">Event hosting software for modern organizers</h1>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl">
            Hostquill is an event management and ticketing platform that helps organizers create, manage, market, and sell tickets for events.
          </p>
        </section>
        <section className="grid md:grid-cols-3 gap-5">
          {[
            ["Who it serves", "Event organizers, conference planners, communities, brands, schools, creators, and businesses use Hostquill to run events."],
            ["What it solves", "Hostquill combines event creation, registration forms, attendee management, check-in, promotion, and analytics in one place."],
            ["Why it exists", "Organizers should be able to launch polished event pages and understand their audience without stitching together separate tools."],
          ].map(([title, body]) => (
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
