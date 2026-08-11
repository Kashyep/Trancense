import Link from "next/link";
import { ActionLink } from "@/components/ui";
import { StaggeredMenu } from "@/components/staggered-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { siteContent } from "@/content/site";

export function PublicHeader() {
  return <header className="site-header">
    <div className="site-header-inner shell">
      <Link href="/" className="brand" aria-label="Trancense home">Trancense<span aria-hidden="true">.</span></Link>
      <nav className="public-links" aria-label="Main navigation">
        {siteContent.nav.map((item) => <Link key={item.href} href={item.href}>{item.label}</Link>)}
      </nav>
      <div className="public-actions">
        <ThemeToggle />
        <Link href="/sign-in" className="sign-in-link">Sign in</Link>
        <ActionLink href="/contact">Request pilot</ActionLink>
      </div>
      <div className="compact-nav"><ThemeToggle /><StaggeredMenu items={[...siteContent.nav, { label: "Sign in", href: "/sign-in" }, { label: "Request a pilot", href: "/contact" }]} /></div>
    </div>
  </header>;
}

export function PublicFooter() {
  return <footer className="site-footer"><div className="shell site-footer-inner">
    <p className="brand">Trancense<span aria-hidden="true">.</span></p>
    <p>Evidence-first energy-audit software. Product and pilot details are subject to approved scope.</p>
    <Link href="/contact">Request a pilot <span aria-hidden="true">↗</span></Link>
  </div></footer>;
}
