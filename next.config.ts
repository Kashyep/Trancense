import type { NextConfig } from "next";
const scriptSource = process.env.NODE_ENV === "development" ? "'self' 'unsafe-inline' 'unsafe-eval'" : "'self' 'unsafe-inline'";
const securityHeaders = [
  { key: "Content-Security-Policy", value: `default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self'; img-src 'self' data: blob: https:; font-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src ${scriptSource}; connect-src 'self' https://*.supabase.co;` },
  { key: "X-Content-Type-Options", value: "nosniff" }, { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" }, { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
];
const nextConfig: NextConfig = { experimental: { serverActions: { bodySizeLimit: "10mb", allowedOrigins: process.env.NEXT_SERVER_ACTIONS_ALLOWED_ORIGINS?.split(",").filter(Boolean) } }, async headers() { return [{ source: "/(.*)", headers: securityHeaders }]; } };
export default nextConfig;
