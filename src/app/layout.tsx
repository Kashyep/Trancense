import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Trancense — Audit Workspace',
  description: 'Turn energy evidence into traceable analysis, prioritized actions, and professional reports.',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en-IN"><body>{children}</body></html>
}
