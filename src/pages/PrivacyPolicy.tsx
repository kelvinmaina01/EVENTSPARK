import PublicHeader from "@/components/PublicHeader";
import Footer from "@/components/layout/Footer";
import { ShieldCheck } from "lucide-react";

const sections = [
  "Who We Are",
  "Data We Collect",
  "How We Use It",
  "Legal Basis (GDPR/DPA)",
  "Sharing & Disclosure",
  "Cookies & Tracking",
  "Data Retention",
  "Your Rights",
  "International Transfers",
  "Children's Privacy",
  "Security",
  "Changes to Policy",
  "Contact Us",
];

const personalDataRows = [
  ["Account Data", "Full name, email address, password (hashed), profile photo, location", "Sign-up", "Required"],
  ["Identity Verification", "Age confirmation, date of birth (optional)", "Sign-up", "Required"],
  ["Event Data", "Events created, RSVPs, attendance history, tickets purchased", "Platform use", "Required"],
  ["Payment Data", "Card last 4 digits, billing address, transaction IDs (full card data stored by payment processor, not us)", "Purchases", "Conditional"],
  ["Communications", "Messages sent to hosts/attendees, support tickets, email replies", "Platform use", "Optional"],
  ["Device & Usage Data", "IP address, browser type, OS, pages visited, session duration, click-stream data", "Automatically", "Required"],
  ["Location Data", "City/region (from profile or IP inference) - no GPS tracking", "Sign-up / Automatically", "Conditional"],
];

const legalBasisRows = [
  ["Account creation and platform operation", "Performance of a contract"],
  ["Payment processing", "Performance of a contract"],
  ["Marketing emails", "Consent (withdrawable)"],
  ["Fraud prevention and safety", "Legitimate interests"],
  ["Analytics (anonymised)", "Legitimate interests"],
  ["Legal compliance", "Legal obligation"],
];

const cookieRows = [
  ["Essential", "Login session, security tokens, CSRF protection", "No"],
  ["Functional", "Remember preferences, saved search filters", "Yes"],
  ["Analytics", "Page view counts, feature usage (anonymised)", "Yes"],
  ["Marketing", "Not used - Hostquill serves no ads", "N/A"],
];

function LegalTable({
  caption,
  headers,
  rows,
}: {
  caption: string;
  headers: string[];
  rows: string[][];
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <caption className="bg-[#19192E] px-5 py-3 text-left text-sm font-bold text-white">
            {caption}
          </caption>
          <thead className="bg-muted/70 text-xs uppercase text-muted-foreground">
            <tr>
              {headers.map((header) => (
                <th key={header} className="px-5 py-3 font-bold">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((row) => (
              <tr key={row.join("-")} className="align-top">
                {row.map((cell, index) => (
                  <td key={cell} className={`px-5 py-4 leading-relaxed ${index === 0 ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function NumberedSection({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")} className="scroll-mt-24 border-t border-border/70 pt-10">
      <div className="flex items-start gap-4">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
          {number}
        </div>
        <div className="min-w-0 flex-1 space-y-5">
          <h2 className="font-display text-2xl font-bold text-foreground sm:text-3xl">{title}</h2>
          <div className="space-y-5 text-base leading-8 text-muted-foreground">{children}</div>
        </div>
      </div>
    </section>
  );
}

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <PublicHeader />
      <main>
        <section className="border-b border-border/70 bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.16),transparent_32rem)]">
          <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-20">
            <div className="max-w-4xl space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
                <ShieldCheck className="h-4 w-4" />
                Privacy & Terms - Full Content + Agent Guide
              </div>
              <div className="space-y-4">
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-primary">Privacy Policy</p>
                <h1 className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
                  Hostquill Privacy Policy
                </h1>
                <p className="max-w-3xl text-lg leading-8 text-muted-foreground">
                  Complete clauses for both documents · Hostquill theme · Structured for implementation
                </p>
              </div>
              <div className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg border bg-card px-4 py-3">
                  <span className="block font-semibold text-foreground">Effective Date</span>
                  [DATE]
                </div>
                <div className="rounded-lg border bg-card px-4 py-3">
                  <span className="block font-semibold text-foreground">Last Updated</span>
                  [DATE]
                </div>
                <div className="rounded-lg border bg-card px-4 py-3">
                  <span className="block font-semibold text-foreground">Version</span>
                  1.0
                </div>
                <div className="rounded-lg border bg-card px-4 py-3">
                  <span className="block font-semibold text-foreground">Governed By</span>
                  Kenya Data Protection Act 2019 and GDPR where applicable.
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-10 px-6 py-12 lg:grid-cols-[280px_1fr] lg:px-8 lg:py-16">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-lg border bg-card p-5 shadow-sm">
              <h2 className="font-display text-lg font-bold">Table of Contents</h2>
              <nav className="mt-4 space-y-1">
                {sections.map((section, index) => (
                  <a
                    key={section}
                    href={`#${section.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`}
                    className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    <span className="w-5 text-xs font-bold text-primary">{index + 1}</span>
                    {section}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          <article className="space-y-12">
            <NumberedSection number="1" title="Who We Are">
              <p>
                Hostquill ("[COMPANY LEGAL NAME]", "we", "us", "our") operates the event management platform accessible at hostquill.com and related mobile applications. We are registered under the laws of [JURISDICTION] with registration number [REG NO].
              </p>
              <p>
                This Privacy Policy explains how we collect, use, share, and protect information about you when you use our services. By creating an account or attending an event through Hostquill, you agree to this policy.
              </p>
            </NumberedSection>

            <NumberedSection number="2" title="Data We Collect">
              <p>We collect data in three ways:</p>
              <LegalTable
                caption="Categories of Personal Data"
                headers={["Category", "Specific Data", "Collected When", "Required?"]}
                rows={personalDataRows}
              />
              <p>
                We do not collect sensitive personal data (health, race, religion, political views) unless explicitly required by an event organiser's custom registration form, in which case separate consent is obtained.
              </p>
            </NumberedSection>

            <NumberedSection number="3" title="How We Use Your Data">
              {[
                "Provide and operate the Hostquill platform - registration, ticketing, event discovery, and attendee management.",
                "Personalise your experience - recommend events in your city, surface relevant communities, and remember your preferences.",
                "Process payments and issue receipts or refunds where applicable.",
                "Send transactional communications - confirmation emails, reminders, ticket PDFs, and service notices.",
                "Send marketing communications - event recommendations, platform updates, and promotional offers. You may opt out at any time.",
                "Ensure safety and prevent fraud - detect abuse, enforce our policies, and protect users from harm.",
                "Comply with legal obligations - respond to lawful requests from courts, regulators, or law enforcement.",
                "Analytics and product improvement - understand how the platform is used to improve features and fix bugs. This is performed on aggregated or anonymised data where possible.",
              ].map((item, index) => (
                <p key={item}>
                  <span className="font-bold text-foreground">3.{index + 1}</span> {item}
                </p>
              ))}
            </NumberedSection>

            <NumberedSection number="4" title="Legal Basis for Processing">
              <p>
                We rely on the following legal bases under the Kenya Data Protection Act 2019 and GDPR (for users in the EEA/UK):
              </p>
              <LegalTable
                caption="Processing Basis by Purpose"
                headers={["Purpose", "Legal Basis"]}
                rows={legalBasisRows}
              />
            </NumberedSection>

            <NumberedSection number="5" title="Sharing & Disclosure">
              <p>We do not sell your personal data. We share it only in these circumstances:</p>
              {[
                ["5.1", "Event Organisers: When you RSVP or purchase a ticket, your name and email are shared with the relevant event organiser so they can manage attendance. Organisers are bound by our Data Processing Agreement."],
                ["5.2", "Service Providers: We use third-party vendors (cloud hosting, payment processors, email delivery, analytics) who process data on our behalf under strict data processing agreements."],
                ["5.3", "Legal Requests: We may disclose data if required by law, court order, or to protect the rights, property, or safety of Hostquill or others."],
                ["5.4", "Business Transfers: If Hostquill is acquired or merges with another entity, your data may transfer as part of that transaction. We will notify you before that occurs."],
              ].map(([label, text]) => (
                <p key={label}>
                  <span className="font-bold text-foreground">{label}</span> {text}
                </p>
              ))}
              <p className="rounded-lg border-l-4 border-primary bg-primary/10 px-5 py-4 text-foreground">
                We never share your data with advertisers or data brokers. Hostquill is ad-free and does not monetise user data.
              </p>
            </NumberedSection>

            <NumberedSection number="6" title="Cookies & Tracking">
              <LegalTable
                caption="Cookie Categories"
                headers={["Type", "Purpose", "Can Be Disabled?"]}
                rows={cookieRows}
              />
              <p>You can manage cookie preferences via the Cookie Settings link in the footer at any time.</p>
            </NumberedSection>

            <NumberedSection number="7" title="Data Retention">
              {[
                "Active account data is retained for the lifetime of your account plus 90 days after deletion to allow recovery.",
                "Financial transaction records are retained for 7 years to comply with tax and accounting regulations.",
                "Event data (RSVPs, attendance) is retained for 3 years after the event date.",
                "Anonymised analytics data may be retained indefinitely as it no longer identifies individuals.",
              ].map((item, index) => (
                <p key={item}>
                  <span className="font-bold text-foreground">7.{index + 1}</span> {item}
                </p>
              ))}
            </NumberedSection>

            <NumberedSection number="8" title="Your Rights">
              <p>
                Under the Kenya Data Protection Act 2019 and GDPR (where applicable) you have the right to:
              </p>
              {[
                "Access - request a copy of your personal data we hold.",
                "Rectification - correct inaccurate or incomplete data.",
                "Erasure (\"right to be forgotten\") - request deletion of your data, subject to legal retention obligations.",
                "Portability - receive your data in a structured, machine-readable format.",
                "Object - object to processing based on legitimate interests or for direct marketing.",
                "Restrict processing - ask us to pause processing while a dispute is resolved.",
                "Withdraw consent - where processing is based on consent, withdraw it at any time without affecting prior processing.",
              ].map((item, index) => (
                <p key={item}>
                  <span className="font-bold text-foreground">8.{index + 1}</span> {item}
                </p>
              ))}
              <p>
                To exercise any right, email privacy@hostquill.com. We will respond within 30 days. You may also escalate to the Office of the Data Protection Commissioner of Kenya.
              </p>
            </NumberedSection>

            <NumberedSection number="9" title="International Data Transfers">
              <p>
                Our servers are hosted in [SERVER REGION]. If your data is transferred outside Kenya or the EEA, we ensure adequate safeguards are in place including Standard Contractual Clauses (SCCs) or adequacy decisions. By using Hostquill you acknowledge your data may be processed outside your country of residence.
              </p>
            </NumberedSection>

            <NumberedSection number="10" title="Children's Privacy">
              <p>
                Hostquill is not directed at individuals under 18. We do not knowingly collect data from minors. If we discover we have collected data from a minor, we will delete it immediately. Report concerns to privacy@hostquill.com.
              </p>
            </NumberedSection>

            <NumberedSection number="11" title="Security">
              <p>
                We implement industry-standard safeguards including TLS encryption in transit, AES-256 encryption at rest, regular penetration testing, access controls and audit logs, and two-factor authentication options for all accounts. No system is 100% secure; in the event of a data breach affecting your rights, we will notify you and the relevant regulator within 72 hours.
              </p>
            </NumberedSection>

            <NumberedSection number="12" title="Changes to This Policy">
              <p>
                We may update this policy from time to time. Material changes will be communicated via email and a prominent in-app notice at least 14 days before they take effect. Continued use of Hostquill after that date constitutes acceptance of the revised policy.
              </p>
            </NumberedSection>

            <NumberedSection number="13" title="Contact Us">
              {[
                "Data Controller: [COMPANY LEGAL NAME], [REGISTERED ADDRESS]",
                "Data Protection Officer: [NAME / TBC], privacy@hostquill.com",
                "Regulator: Office of the Data Protection Commissioner of Kenya - www.odpc.go.ke",
              ].map((item, index) => (
                <p key={item}>
                  <span className="font-bold text-foreground">13.{index + 1}</span> {item}
                </p>
              ))}
              <p className="rounded-lg border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-7 text-amber-900">
                This Privacy Policy is a starting point and should be reviewed by a qualified data protection attorney before publication. Ensure you fill in all [BRACKETED PLACEHOLDERS].
              </p>
            </NumberedSection>
          </article>
        </section>
      </main>
      <Footer />
    </div>
  );
}
