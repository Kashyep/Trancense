import Link from "next/link";
import { MobileAppNav } from "@/components/mobile-app-nav";
import { ThemeToggle } from "@/components/theme-toggle";

const primaryLinks = [["Dashboard", "/app"], ["Data", "/app/energy"], ["Analyse", "/app/analysis"], ["Actions", "/app/findings"], ["Reports", "/app/reports"]];
const toolLinks = [["Import data", "/app/import"], ["Equipment", "/app/equipment"], ["Documents", "/app/evidence"], ["Solar planning", "/app/solar"], ["Assistant", "/app/assistant"], ["Settings", "/app/settings"]];

export function AppShell({ children, workspace, role }: { children: React.ReactNode; workspace: string; role: string }) {
  return <div className="app-grid md:grid md:grid-cols-[218px_minmax(0,1fr)]">
    <aside className="desktop-nav editorial-rail p-5">
      <Link href="/" className="brand">Trancense<span>.</span></Link>
      <nav aria-label="Workspace" className="mt-10 space-y-1">{primaryLinks.map(([label, href]) => <Link key={href} href={href} className="app-nav-link block px-3 py-2 text-sm">{label}</Link>)}</nav>
      <details className="app-tools mt-5"><summary>More tools</summary><nav aria-label="More workspace tools" className="mt-2 space-y-1">{toolLinks.map(([label, href]) => <Link key={href} href={href} className="app-nav-link block px-3 py-2 text-sm">{label}</Link>)}</nav></details>
    </aside>
    <div className="app-main min-w-0"><header className="app-header"><div className="app-context"><strong>{workspace}</strong><span className="ml-2">Private audit workspace</span></div><div className="flex items-center gap-3"><ThemeToggle /><form action="/auth/signout" method="post"><button className="button button-secondary min-h-9 px-3 text-sm">Sign out</button></form></div></header>{children}</div>
    <MobileAppNav />
  </div>;
}
