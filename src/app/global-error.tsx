"use client";

import Link from "next/link";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en-IN">
      <body>
        <main className="recovery-page">
          <section className="recovery-card" aria-labelledby="global-recovery-title">
            <p className="kicker">Service unavailable</p>
            <h1 id="global-recovery-title" className="mt-3">Trancense could not start this page.</h1>
            <p className="mt-4 muted">Try again. If the issue continues, use the approved support channel for your pilot.</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <button type="button" className="button button-primary" onClick={reset}>Try again</button>
              <Link className="button button-secondary" href="/">Return home</Link>
            </div>
          </section>
        </main>
      </body>
    </html>
  );
}
