import type { Metadata } from "next";
import { Exo_2, Kanit, Open_Sans } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { canonicalOrigin } from "@/lib/site-url";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: canonicalOrigin(),
  title: { default: "Trancense — evidence-first energy audits", template: "%s | Trancense" },
  description: "Traceable energy-audit workspace for Indian audit teams.",
  applicationName: "Trancense",
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "Trancense",
    title: "Trancense — evidence-first energy audits",
    description: "Traceable energy-audit workspace for Indian audit teams.",
  },
  twitter: {
    card: "summary",
    title: "Trancense — evidence-first energy audits",
    description: "Traceable energy-audit workspace for Indian audit teams.",
  },
};

const exo = Exo_2({ subsets: ["latin"], variable: "--font-exo", display: "swap" });
const openSans = Open_Sans({ subsets: ["latin"], variable: "--font-open-sans", display: "swap" });
const kanit = Kanit({ subsets: ["latin"], variable: "--font-kanit", weight: ["400", "500"], display: "swap" });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en-IN" suppressHydrationWarning><body className={`${exo.variable} ${openSans.variable} ${kanit.variable}`}><ThemeProvider>{children}</ThemeProvider></body></html>;
}
