# Trancense threat model

## Scope and assets

This repository contains a Next.js App Router application and Supabase SQL migrations for a multi-tenant audit workspace. Primary assets are Supabase sessions/reset links; workspace data and audit provenance; private evidence and generated reports; factors/tariffs/calculation snapshots; environment secrets; and any optional AI context. No external system was contacted for this assessment.

## Attackers and boundaries

Attacker positions considered: unauthenticated internet user; Viewer, Editor, Reviewer, Owner; a user from another workspace; a user manipulating IDs, forms, routes, and signed URL requests; malicious file uploader; prompt-injection author; bot; and an attacker inspecting browser code, logs, or a leaked link.

| Boundary | Trust decision |
| --- | --- |
| Browser ↔ Next.js | All requests/form data/route params are hostile; server action origin and Zod validation required. |
| Browser ↔ Supabase browser client | Publishable key is public; RLS is the authorization boundary. |
| Next.js ↔ Supabase | Server verifies identity again; no service-role key is used by app code. |
| User ↔ workspace / workspace ↔ workspace | Membership plus workspace-scoped rows, RLS, and child-workspace triggers. |
| User content ↔ Storage/PDF/AI | Files are private and untrusted; only allowed types/headers are accepted; no parser, URL fetcher, or AI integration is enabled. |
| Build/deploy ↔ runtime | Public variables must remain non-secret; server-only secrets must not enter bundles/logs. |
| Logs/analytics ↔ customer data | Audit metadata only; never record credentials, signed URLs, evidence bodies, or AI prompts. |

## STRIDE analysis

| Threat | Key abuse case | Required control |
| --- | --- | --- |
| Spoofing | Stolen/expired session or forged server action | Supabase server `getUser`, cookie refresh, same-origin action check, Auth rate limits. |
| Tampering | Editor sets approved status; cross-workspace child ID | RLS role policies, audit RPC, database consistency triggers, immutable raw input/correction flow. |
| Repudiation | User denies approval/export | Append-only audit events generated through constrained RPC; timestamp/actor provenance. |
| Information disclosure | Guessed document/report UUID or cached personalized page | RLS metadata lookup before 60-second signing; dynamic protected routes; no-store health. |
| Denial of service | Oversized uploads or report/server-action flood | 10 MB cap, platform/WAF and application quotas/rate limits required before pilot. |
| Elevation of privilege | Viewer mutation or Editor approval | Server role check and DB policies; role never comes from profile metadata. |

## Assumptions and exclusions

Supabase Auth, Postgres, Storage, Vercel, email delivery, DNS/TLS, and any future AI provider are external trust dependencies. Their runtime configuration cannot be proven locally. OCR, parsing of XLSX/PDF, public URLs, external fetches/webhooks, and AI are absent from this codebase. A disposable Supabase RLS/Storage test is a deployment gate, not an assumption of success.
