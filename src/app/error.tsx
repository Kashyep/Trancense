"use client";

import Link from "next/link";

export default function RootError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="recovery-page">
      <section className="recovery-card" aria-labelledby="recovery-title">
        <p className="kicker">Something went wrong</p>
        <h1 id="recovery-title" className="mt-3">We could not load this page.</h1>
        <p className="mt-4 muted">No audit data has been changed. Try again, or return to a safe starting point.</p>
        <div className="mt-7 flex flex-wrap gap-3">
          <button type="button" className="button button-primary" onClick={reset}>Try again</button>
          <Link className="button button-secondary" href="/">Return home</Link>
        </div>
      </section>
    </main>
  );
}
