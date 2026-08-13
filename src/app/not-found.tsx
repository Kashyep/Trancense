import type { Metadata } from "next";
import Link from "next/link";
import { PublicPage } from "@/components/public-page";
import { ActionLink } from "@/components/ui";

export const metadata: Metadata = {
  title: "Page not found",
  description: "The requested Trancense page could not be found.",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <PublicPage>
      <section className="shell section">
        <p className="kicker">404</p>
        <h1 className="mt-4 max-w-2xl">That page is not available.</h1>
        <p className="mt-6 max-w-xl text-lg muted">It may have moved, or the address may be incomplete. Return to the overview or continue to the platform.</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <ActionLink href="/">Return home</ActionLink>
          <ActionLink href="/product" variant="secondary">Explore the platform</ActionLink>
        </div>
        <p className="mt-8 text-sm muted">Need help with access? <Link className="text-link" href="/sign-in">Go to sign in</Link>.</p>
      </section>
    </PublicPage>
  );
}
