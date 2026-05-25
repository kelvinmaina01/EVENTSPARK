import PublicHeader from "@/components/PublicHeader";
import Footer from "@/components/layout/Footer";

const useCases = [
  "Conferences",
  "Weddings",
  "Meetups",
  "Church events",
  "Festivals",
  "Campus events",
  "Workshops",
  "Business events",
];

export default function UseCases() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <PublicHeader />
      <main className="max-w-6xl mx-auto px-6 py-20 space-y-10">
        <section className="max-w-3xl space-y-5">
          <p className="text-sm font-semibold text-primary">Use cases</p>
          <h1 className="text-4xl sm:text-6xl font-display font-bold">Hostquill works for many kinds of events</h1>
          <p className="text-lg text-muted-foreground">Use Hostquill to publish event pages, accept registrations, communicate details, and manage attendees across event formats.</p>
        </section>
        <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {useCases.map((name) => (
            <article key={name} className="rounded-lg border bg-card p-5">
              <h2 className="font-display text-lg font-bold">{name}</h2>
              <p className="mt-2 text-sm text-muted-foreground">Create a public page, collect RSVPs, manage attendees, and track registrations for {name.toLowerCase()}.</p>
            </article>
          ))}
        </section>
      </main>
      <Footer />
    </div>
  );
}
