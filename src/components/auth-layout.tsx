import Link from "next/link";
import { GradientWaves } from "@/components/gradient-waves";
import { ThemeToggle } from "@/components/theme-toggle";

export function AuthLayout({ children, eyebrow = "Secure access" }: { children: React.ReactNode; eyebrow?: string }) {
  return <main className="auth-page">
    <GradientWaves className="auth-waves" horizonColor="#e8ebf2" waveColor="#4a536d" crestColor="#d7b387" />
    <header className="auth-header"><Link href="/" className="brand">Trancense<span aria-hidden="true">.</span></Link><ThemeToggle /></header>
    <section className="auth-stage"><p className="kicker">{eyebrow}</p>{children}</section>
  </main>;
}
