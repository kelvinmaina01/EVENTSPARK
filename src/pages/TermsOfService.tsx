import { Link } from "react-router-dom";
import PublicHeader from "@/components/PublicHeader";
import Footer from "@/components/layout/Footer";
import { FileText } from "lucide-react";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <PublicHeader />
      <main className="border-b border-border/70 bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.16),transparent_32rem)]">
        <section className="mx-auto max-w-5xl px-6 py-20 lg:px-8">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
              <FileText className="h-4 w-4" />
              Terms of Service
            </div>
            <div className="space-y-4">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-primary">Hostquill Legal</p>
              <h1 className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
                Terms of Service
              </h1>
              <p className="max-w-3xl text-lg leading-8 text-muted-foreground">
                The exact Terms of Service content was not included in the provided implementation brief.
              </p>
            </div>
          </div>

          <div className="mt-10 rounded-lg border bg-card p-6 shadow-sm sm:p-8">
            <h2 className="font-display text-2xl font-bold">Content needed</h2>
            <p className="mt-4 leading-8 text-muted-foreground">
              Paste the Terms of Service clauses and this page can be filled using the same Hostquill legal document layout without changing the wording.
            </p>
            <Link
              to="/privacy"
              className="mt-6 inline-flex h-11 items-center rounded-full bg-[#19192E] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#19192E]/90"
            >
              View Privacy Policy
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
