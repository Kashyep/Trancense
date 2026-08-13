"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  ["Dashboard", "/app"],
  ["Data", "/app/energy"],
  ["Analyse", "/app/analysis"],
  ["Actions", "/app/findings"],
  ["Reports", "/app/reports"],
] as const;

export function MobileAppNav() {
  const pathname = usePathname();
  return (
    <nav className="mobile-nav" aria-label="Workspace navigation">
      {links.map(([label, href]) => {
        const current = href === "/app" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
        return <Link key={href} href={href} className="mobile-nav-link" aria-current={current ? "page" : undefined}>{label}</Link>;
      })}
    </nav>
  );
}
