import PublicHeader from "@/components/PublicHeader";
import Footer from "@/components/layout/Footer";
import { Cpu } from "lucide-react";

export default function AgentGuide() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <PublicHeader />
      <main className="mx-auto max-w-5xl px-6 py-20 lg:px-8">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
            <Cpu className="h-4 w-4" />
            Agent Implementation Guide
          </div>

          <div className="space-y-4">
            <h1 className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-6xl">Privacy & Terms — Agent Guide</h1>
            <p className="max-w-3xl text-lg leading-8 text-muted-foreground">Guidelines for programmatically maintaining and presenting Hostquill legal documents.</p>
          </div>

          <div className="rounded-lg border bg-card p-6">
            <h2 className="font-display text-2xl font-bold">Purpose</h2>
            <p className="mt-4 text-base leading-7 text-muted-foreground">This guide instructs developers and automation agents how to keep the Privacy Policy and Terms of Service synchronized, accessible, and ready for legal review and publication.</p>

            <h3 className="mt-6 text-lg font-semibold">Files & Routes</h3>
            <ul className="mt-3 list-inside list-disc text-muted-foreground">
              <li>Rendered pages: <span className="font-semibold">/terms</span> -> <span className="font-mono">src/pages/TermsOfService.tsx</span>, <span className="font-semibold">/privacy</span> -> <span className="font-mono">src/pages/PrivacyPolicy.tsx</span></li>
              <li>Public markdown copies: <span className="font-mono">public/terms-of-service.md</span>, <span className="font-mono">public/agent-implementation-guide.md</span></li>
            </ul>

            <h3 className="mt-6 text-lg font-semibold">Agent Rules</h3>
            <ul className="mt-3 list-inside list-disc text-muted-foreground">
              <li>Do not modify legal wording without human review and legal sign-off.</li>
              <li>Keep placeholders in square brackets (e.g. <span className="font-mono">[DATE]</span>, <span className="font-mono">[JURISDICTION]</span>) for manual fill-in.</li>
              <li>When updating effective dates, ensure the header and the markdown copy are both updated.</li>
              <li>Preserve formatting and accessibility landmarks (headings, anchors, table captions).</li>
            </ul>

            <h3 className="mt-6 text-lg font-semibold">Publishing Workflow</h3>
            <ol className="mt-3 list-inside list-decimal text-muted-foreground">
              <li>Prepare draft in markdown in <span className="font-mono">public/</span>.</li>
              <li>Open a pull request with changes to <span className="font-mono">src/pages/</span> and the markdown file.</li>
              <li>Request legal review; add reviewers in PR description.</li>
              <li>After approval, merge and update the Effective Date before release.</li>
            </ol>

            <h3 className="mt-6 text-lg font-semibold">Accessibility & SEO</h3>
            <p className="mt-3 text-muted-foreground">Ensure headings use semantic H1/H2 and each numbered section has an anchor id for deep linking. Keep metadata (title, description) updated in the app router where applicable.</p>

            <h3 className="mt-6 text-lg font-semibold">Contact</h3>
            <p className="mt-3 text-muted-foreground">For legal questions or to request changes, contact <span className="font-semibold">legal@hostquill.com</span>. For developer/integration questions, contact the platform engineering team.</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
