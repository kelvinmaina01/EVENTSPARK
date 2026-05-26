import PublicHeader from "@/components/PublicHeader";
import Footer from "@/components/layout/Footer";
import { FileText } from "lucide-react";

const sections = [
  "Acceptance",
  "Definitions",
  "Account Registration",
  "Organiser Obligations",
  "Attendee Obligations",
  "Payments & Fees",
  "Cancellations & Refunds",
  "Prohibited Conduct",
  "Intellectual Property",
  "Disclaimers",
  "Limitation of Liability",
  "Indemnification",
  "Termination",
  "Governing Law & Disputes",
  "General Provisions",
];

function NumberedSection({ number, title, children }: { number: string; title: string; children: React.ReactNode }) {
  return (
    <section id={title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")} className="scroll-mt-24 border-t border-border/70 pt-10">
      <div className="flex items-start gap-4">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground">{number}</div>
        <div className="min-w-0 flex-1 space-y-5">
          <h2 className="font-display text-2xl font-bold text-foreground sm:text-3xl">{title}</h2>
          <div className="space-y-5 text-base leading-8 text-muted-foreground">{children}</div>
        </div>
      </div>
    </section>
  );
}

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <PublicHeader />
      <main>
        <section className="border-b border-border/70 bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.16),transparent_32rem)]">
          <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-20">
            <div className="max-w-4xl space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
                <FileText className="h-4 w-4" />
                Terms of Service
              </div>
              <div className="space-y-4">
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-primary">Hostquill Legal</p>
                <h1 className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-6xl">Terms of Service</h1>
                <p className="max-w-3xl text-lg leading-8 text-muted-foreground">Effective Date: [DATE] · These Terms form a binding legal agreement between you and Hostquill. Please read them carefully before using the platform.</p>
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
                  <a key={section} href={`#${section.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`} className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                    <span className="w-5 text-xs font-bold text-primary">{index + 1}</span>
                    {section}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          <article className="space-y-12">
            <NumberedSection number="1" title="Acceptance">
              <p>
                By accessing or using Hostquill — whether as an event organiser, attendee, or visitor — you agree to be bound by these Terms of Service ("Terms"), our Privacy Policy, and any additional guidelines incorporated by reference. If you do not agree, you must not use Hostquill.
              </p>
              <p>
                If you are using Hostquill on behalf of an organisation, you represent that you have authority to bind that organisation to these Terms.
              </p>
            </NumberedSection>

            <NumberedSection number="2" title="Definitions">
              <p>"Platform" means the Hostquill website, mobile apps, APIs, and all related services.</p>
              <p>"Organiser" means a registered user who creates, hosts, or manages events on the Platform.</p>
              <p>"Attendee" means a registered user who RSVPs, registers for, or purchases tickets to an event.</p>
              <p>"Content" means any text, images, video, data, or other material submitted by users to the Platform.</p>
              <p>"Event" means any gathering, conference, workshop, or community activity listed on the Platform.</p>
              <p>"Fees" means the service charges Hostquill levies on paid ticket transactions as per our current Fee Schedule.</p>
            </NumberedSection>

            <NumberedSection number="3" title="Account Registration">
              <p>3.1 You must be at least 18 years old to create an account. By registering you confirm this.</p>
              <p>3.2 You must provide accurate, current, and complete information during registration and keep it updated.</p>
              <p>3.3 You are responsible for maintaining the confidentiality of your password. You must notify us immediately at security@hostquill.com if you suspect unauthorised access.</p>
              <p>3.4 One person may not maintain more than one active account. Duplicate accounts may be suspended.</p>
            </NumberedSection>

            <NumberedSection number="4" title="Organiser Obligations">
              <p>4.1 Organisers are solely responsible for the events they create, including accuracy of event details, venue suitability, health and safety, and obtaining any required permits or licences.</p>
              <p>4.2 Organisers must honour the event as described. Material changes (date, location, cancellation) must be communicated to attendees promptly.</p>
              <p>4.3 Organisers are responsible for processing refunds to attendees in the event of cancellation, subject to their stated refund policy.</p>
              <p>4.4 Organisers must comply with all applicable laws including consumer protection, data privacy, and anti-discrimination legislation.</p>
              <p className="rounded-lg border-l-4 border-primary bg-primary/10 px-5 py-4 text-foreground">
                Hostquill is a platform, not a co-organiser. We are not liable for the acts or omissions of event organisers. Attendees should verify event details independently before travelling or purchasing tickets.
              </p>
            </NumberedSection>

            <NumberedSection number="5" title="Attendee Obligations">
              <p>5.1 Attendees must comply with the organiser's event rules, venue policies, and all applicable laws during events.</p>
              <p>5.2 Tickets are non-transferable unless the organiser explicitly enables ticket transfers. Resale above face value is prohibited.</p>
              <p>5.3 Attendees agree not to record, photograph, or stream events without the organiser's permission.</p>
            </NumberedSection>

            <NumberedSection number="6" title="Payments & Fees">
              <p>6.1 Hostquill charges Organisers a service fee on paid ticket transactions. The current fee schedule is published at hostquill.com/pricing and may be updated with 30 days' notice.</p>
              <p>6.2 All payments are processed by our third-party payment processor. Hostquill does not store full payment card data.</p>
              <p>6.3 Organiser payouts are processed within [X] business days after the event date, subject to fraud checks and our payout policy.</p>
              <p>6.4 All prices displayed are inclusive of applicable taxes unless stated otherwise.</p>
              <p className="font-semibold">Free events do not attract a Hostquill service fee. Fees only apply to paid ticket transactions.</p>
            </NumberedSection>

            <NumberedSection number="7" title="Cancellations & Refunds">
              <p>7.1 By Organiser: If an organiser cancels an event, attendees are entitled to a full refund of the ticket price. Hostquill's service fee is non-refundable.</p>
              <p>7.2 By Attendee: Attendee refund eligibility is governed by the organiser's stated refund policy at the time of purchase. Where no policy is stated, no refund is available.</p>
              <p>7.3 Force Majeure: Neither party is liable for cancellations caused by events beyond reasonable control (natural disasters, government orders, etc.). Hostquill will facilitate resolution but is not financially responsible.</p>
            </NumberedSection>

            <NumberedSection number="8" title="Prohibited Conduct">
              <p>You must not use Hostquill to:</p>
              <ul className="list-inside list-disc">
                <li>Create events that promote violence, hatred, discrimination, or illegal activity.</li>
                <li>Harvest user data, send spam, or conduct phishing activities.</li>
                <li>Use automated bots, scrapers, or scripts without written permission.</li>
                <li>Impersonate another person, organisation, or public figure.</li>
                <li>Circumvent security measures or attempt to gain unauthorised access to any part of the Platform.</li>
                <li>Create fraudulent events or misrepresent event details to collect payments.</li>
              </ul>
              <p>Violations may result in immediate account suspension, forfeiture of pending payouts, and referral to law enforcement authorities.</p>
            </NumberedSection>

            <NumberedSection number="9" title="Intellectual Property">
              <p>9.1 Hostquill IP: All Platform code, design, trademarks, and branding are owned by Hostquill. You receive a limited, non-exclusive licence to use the Platform for its intended purpose. No other rights are granted.</p>
              <p>9.2 Your Content: You retain ownership of Content you submit. You grant Hostquill a worldwide, royalty-free licence to display, distribute, and promote your Content solely for the purpose of operating the Platform (e.g. showing your event listing to potential attendees).</p>
              <p>9.3 Feedback: Any feedback or suggestions you provide may be used by Hostquill without obligation or compensation to you.</p>
            </NumberedSection>

            <NumberedSection number="10" title="Disclaimers">
              <p>The Platform is provided "as is" and "as available" without warranties of any kind, express or implied. Hostquill does not warrant that the Platform will be uninterrupted, error-free, or free from viruses or other harmful components.</p>
              <p>Hostquill is a technology platform connecting event organisers and attendees. We do not vet, endorse, or guarantee the quality, safety, legality, or accuracy of events listed by Organisers.</p>
            </NumberedSection>

            <NumberedSection number="11" title="Limitation of Liability">
              <p>To the maximum extent permitted by law, Hostquill's total liability to you for any claim arising from these Terms or use of the Platform shall not exceed the greater of (a) the total fees paid by you to Hostquill in the 12 months preceding the claim, or (b) USD 100. Hostquill shall not be liable for indirect, incidental, consequential, or punitive damages.</p>
              <p>Some jurisdictions do not allow limitation of liability for certain damages. In such cases, Hostquill's liability is limited to the fullest extent permitted by applicable law.</p>
            </NumberedSection>

            <NumberedSection number="12" title="Indemnification">
              <p>You agree to indemnify, defend, and hold harmless Hostquill, its officers, employees, and agents from any claims, losses, damages, or expenses (including reasonable legal fees) arising from: (a) your use of the Platform; (b) your Content; (c) your violation of these Terms; or (d) your violation of any applicable law or third-party right.</p>
            </NumberedSection>

            <NumberedSection number="13" title="Termination">
              <p>13.1 You may delete your account at any time from your account settings. Pending payouts and upcoming event obligations must be resolved before deletion.</p>
              <p>13.2 Hostquill may suspend or terminate your account without notice if you violate these Terms or engage in conduct harmful to other users or the Platform.</p>
              <p>13.3 Clauses that by nature survive termination (Intellectual Property, Limitation of Liability, Indemnification, Governing Law) shall continue to apply after your account is closed.</p>
            </NumberedSection>

            <NumberedSection number="14" title="Governing Law & Disputes">
              <p>14.1 These Terms are governed by the laws of [JURISDICTION] without regard to conflict-of-law principles.</p>
              <p>14.2 Informal Resolution: Before initiating formal proceedings, parties agree to attempt good-faith negotiation for at least 30 days.</p>
              <p>14.3 Arbitration: Disputes not resolved informally shall be referred to binding arbitration at the Nairobi Centre for International Arbitration (NCIA) under its rules, conducted in English.</p>
              <p>14.4 Class Action Waiver: You agree to resolve disputes individually and waive the right to participate in a class action.</p>
            </NumberedSection>

            <NumberedSection number="15" title="General Provisions">
              <p>15.1 Entire Agreement: These Terms, the Privacy Policy, and any applicable Fee Schedule constitute the entire agreement between you and Hostquill regarding the Platform.</p>
              <p>15.2 Severability: If any provision is found unenforceable, the remainder of the Terms continues in full force.</p>
              <p>15.3 No Waiver: Failure by Hostquill to enforce any right does not constitute a waiver of that right.</p>
              <p>15.4 Updates: We may update these Terms with 14 days' notice for material changes. Continued use constitutes acceptance.</p>
              <p>15.5 Contact: legal@hostquill.com | [COMPANY ADDRESS]</p>
              <p className="rounded-lg border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-7 text-amber-900">
                These Terms of Service are a starting point and should be reviewed by a qualified attorney before publication. Fill in all [BRACKETED PLACEHOLDERS] before going live.
              </p>
            </NumberedSection>
          </article>
        </section>
      </main>
      <Footer />
    </div>
  );
}
