import Link from "next/link";
import { ArrowUpRight, CheckCircle2, FileCheck2, Sigma } from "lucide-react";
import { GradientWaves } from "@/components/gradient-waves";
import { PublicFooter, PublicHeader } from "@/components/public-header";
import { ActionLink } from "@/components/ui";
import { pitchContent } from "@/content/pitch";
import { productContent } from "@/content/product";
import { siteContent } from "@/content/site";

function Observatory() {
  return <figure className="observatory-card" aria-labelledby="observatory-title">
    <figcaption><div><p className="kicker">Evidence observatory</p><h2 id="observatory-title">Audit readiness, at a glance.</h2></div><span className="status-chip"><i />Illustrative</span></figcaption>
    <div className="chart-area"><div className="axis-label">Approved kWh records</div><svg viewBox="0 0 480 190" role="img" aria-label="Illustrative approved energy trend increasing and then declining"><path d="M10 166H470" className="chart-grid"/><path d="M10 119H470" className="chart-grid"/><path d="M10 70H470" className="chart-grid"/><path d="M13 144 C70 126,92 141,145 104 S245 128,296 74 S385 83,465 38" className="chart-line"/><circle cx="465" cy="38" r="6" className="chart-point"/></svg></div>
    <dl className="signal-grid"><div><dt>Approved periods</dt><dd>3 <span>/ 3</span></dd></div><div><dt>Baseline</dt><dd className="small-value">Ready to review</dd></div><div><dt>Open actions</dt><dd>2</dd></div></dl>
    <p className="chart-note">{pitchContent.demoLabel}. It does not represent a customer result.</p>
  </figure>;
}

export default function Home() {
  return <main><PublicHeader />
    <section className="hero shell"><GradientWaves className="hero-waves" horizonColor="#edf0f6" waveColor="#66719a" crestColor="#ffffff" /><div className="hero-copy"><p className="kicker">{siteContent.hero.eyebrow}</p><h1>{siteContent.hero.title}</h1><p>{siteContent.hero.body}</p><div className="hero-actions"><ActionLink href="/contact">{siteContent.hero.primary} <ArrowUpRight size={16} /></ActionLink><ActionLink href="/product" variant="secondary">{siteContent.hero.secondary}</ActionLink></div><p className="mt-5 max-w-lg text-sm muted">For consultants, auditors, and facility teams working with evidence-heavy energy decisions.</p></div><Observatory /></section>
    <section className="section-band"><div className="shell section"><div className="section-intro"><p className="kicker">Who it is for</p><h2>A shared record for the people who investigate, review, and act.</h2></div><div className="mt-12 grid gap-5 md:grid-cols-3">{siteContent.audiences.map(([title, body]) => <article className="data-card p-6" key={title}><h3>{title}</h3><p className="mt-3 muted">{body}</p></article>)}</div></div></section>
    <section className="section-band section-band-muted"><div className="shell section"><div className="section-intro"><p className="kicker">The work, made traceable</p><h2>Keep the path from source evidence to measured verification visible.</h2></div><ol className="chain-grid">{siteContent.chain.map((item, index) => <li key={item}><span>0{index + 1}</span><h3>{item}</h3><p>{["Keep the original source and context.", "Separate compatible, reviewed records.", "Record formulas, factors, and exclusions.", "Link observations to evidence and review.", "Assign accountable work without overclaiming.", "Keep completion distinct from measured verification."][index]}</p></li>)}</ol></div></section>
    <section className="shell section platform-intro"><div><p className="kicker">The platform</p><h2>Structure evidence before it becomes a claim.</h2></div><p>Trancense is decision-support software for careful audit teams. It makes input quality, review, and limitations legible throughout the workflow.</p></section>
    <section className="section-band"><div className="shell section feature-list">{productContent.features.map(([title, body], index) => <article key={title}><span>0{index + 1}</span><div><h3>{title}</h3><p>{body}</p></div><Link href="/product" aria-label={`Learn about ${title}`}><ArrowUpRight size={19} /></Link></article>)}</div></section>
    <section className="shell section split-feature"><div><p className="kicker">Human review stays central</p><h2>Professional judgement is not hidden behind automation.</h2><p>Trancense does not certify audits, guarantee savings, determine compliance, or replace qualified energy auditors.</p><Link className="text-link" href="/security">How private evidence and review work <ArrowUpRight size={15} /></Link></div><aside><FileCheck2 size={28} aria-hidden="true"/><p className="kicker">A defensible report starts here</p><h3>Inputs, factors, assumptions, and warnings travel with the work.</h3><div className="mini-rule"/><p><Sigma size={16} /> Calculation detail stays linked to the boundary and approved records.</p><p><CheckCircle2 size={16} /> Findings and recommendations remain reviewable until a human approves them.</p></aside></section>
    <section className="section-band section-band-muted"><div className="shell section"><div className="section-intro"><p className="kicker">Questions before a pilot?</p><h2>Start with the context behind the work.</h2></div><div className="mt-10 divide-y divide-[var(--border)] border-y border-[var(--border)]">{siteContent.faqs.map(([question, answer]) => <details className="py-5" key={question}><summary className="cursor-pointer pr-8 font-medium">{question}</summary><p className="mt-3 max-w-2xl muted">{answer}</p></details>)}</div><ActionLink href="/contact" className="mt-8">Request a pilot conversation</ActionLink></div></section>
    <section className="pilot-band"><div className="shell"><p className="kicker">Pilot conversations</p><h2>Start with the energy evidence you already have.</h2><p>Discuss a bounded, human-reviewed pilot and the conditions needed for a useful first audit workspace.</p><ActionLink href="/contact">Request a pilot <ArrowUpRight size={16} /></ActionLink></div></section>
    <PublicFooter />
  </main>;
}
