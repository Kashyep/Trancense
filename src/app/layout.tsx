import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "Trancense — evidence-first energy audits", description: "Traceable energy-audit workspace for Indian audit teams." };
export default function RootLayout({children}:{children:React.ReactNode}) { return <html lang="en-IN"><body>{children}</body></html>; }
