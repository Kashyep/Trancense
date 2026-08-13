# Trancense deployment readiness — local gate

Assessment date: 2026-08-13. Scope: repository-only verification in the checked-out application. No Vercel deployment, remote Supabase project, DNS, email provider, analytics, or monitoring service was accessed or changed.

## Gate decision

**NO-GO for a public or customer-pilot deployment.** The code-owned fixes below are complete and locally verified, but launch still requires the named business, legal, operational, and remote-environment controls. This is not a statement that the deployed product is secure or production-ready.

## Local verification completed

| Area | Status | Evidence |
| --- | --- | --- |
| Public/app route recovery | Pass | Custom `not-found.tsx`, root and global error boundaries, and route loading states provide actionable recovery without exposing exception details. |
| Navigation and deep-link implementation | Pass by static route review | Public header, compact menu, workspace links, and the new mobile bottom navigation target existing routes. Browser/device verification remains required. |
| Crawl controls and metadata | Pass with condition | Public pages have canonical metadata; `/robots.txt` and `/sitemap.xml` exist; authenticated/auth routes are noindex. `NEXT_PUBLIC_APP_URL` must be the final HTTPS canonical domain before build. |
| Theme, reduced motion, focus | Pass by code inspection | Semantic light/dark tokens, manual theme provider, focus-visible rules, and reduced-motion rules are present. Visual QA remains required. |
| Secrets and repository hygiene | Pass | No secret-like source literals were found; `.env` and `.env.*` are ignored except the safe `.env.example`; current app code does not require a service-role key. |
| Authentication/session route hardening | Pass locally | Confirmation callback clears its temporary session and routes to `/account-verified`; sign-out POST rejects a missing/cross-site Origin; checks are regression-tested. |
| RLS/Storage/migration source review | Pass locally, remote proof required | Versioned migrations enable RLS, define private bucket policies, scope rows through memberships, and include child-scope/transition triggers. Apply and adversarially test them in a disposable project before pilot. |
| Dependency audit | Pass | `npm audit --omit=dev --audit-level=high` reported 0 vulnerabilities. |
| CI gate | Added | `.github/workflows/verify.yml` pins Node 22 and runs frozen install, production audit, typecheck, lint, tests, and build. It has not run remotely in this assessment. |
| Demo-data hygiene | Pass | The fictional jury seed now requires a session-provided `app.demo_email`; no personal demo account is embedded. The illustrative landing chart remains visibly labelled and must not be presented as customer data. |

## Required no-go conditions

Do not deploy until every item below has a named owner and recorded evidence.

1. **Monitored pilot contact path:** replace the provisional `/contact` copy with a real, monitored email address or form workflow, a response owner, and a privacy notice. Do not publish a CTA that cannot receive a response.
2. **Approved public identity and legal material:** final domain, company/legal name, support/security contacts, approved logo/OG image, privacy policy, terms, cookie position, jurisdiction/address, and data-deletion process. See `CONTENT_REQUIRED.md`.
3. **Canonical production configuration:** set an HTTPS `NEXT_PUBLIC_APP_URL` to the final domain and confirm that rendered canonical, sitemap, robots, Open Graph, and favicon URLs contain neither localhost nor a preview domain.
4. **Supabase disposable-project proof:** apply all migrations; test unauthenticated, Viewer, Editor, Reviewer, Owner, and cross-workspace Data API/Storage access according to `SECURITY_TEST_PLAN.md`; record private-bucket and signed-URL expiry evidence.
5. **Auth production configuration:** exact callback/reset URLs only (no wildcards), email confirmation, SMTP, password policy, CAPTCHA/rate-limit settings, supported session lifetime, and any configured OAuth callback. Exercise expiry/reset/verification flows in preview.
6. **Rate limits and quotas:** configure Vercel/WAF limits for auth, upload, report generation, and Server Actions. Define per-workspace upload/report quotas, a report idempotency/retry strategy, and an owner. The repository has no distributed limiter or queue.
7. **Observability and incident readiness:** configure structured error tracking, safe request correlation, uptime checks, 4xx/5xx/auth/upload/report alerts, log redaction, incident contacts, runbooks, and an escalation process. Never log credentials, tokens, reset links, signed URLs, evidence contents, or prompt bodies.
8. **Data operations:** enable backups, conduct and record a restore test, define evidence/report retention and deletion, verify recovery procedures, and identify the database/storage owners.
9. **Deployment and rollback:** configure Vercel production branch, DNS and canonical/www behavior, HTTPS, production environment values, preview gate, known-good rollback deployment, and migration rollback/restore plan.
10. **Manual browser and external checks:** verify the public and authenticated flows on Chrome, Firefox, Safari where applicable, Edge, mobile/tablet/desktop widths, 200% zoom, keyboard-only navigation, slow network, and preview browser consoles/network responses. Capture the final production screenshot only after deployment.

## Checklist disposition

### Locally verifiable, completed

- Home, internal navigation targets, route loading/recovery, custom 404, private-route noindex controls, canonical/sitemap/robots implementation, favicon, semantic theme/focus/reduced-motion code, server-side validation/RLS source review, private evidence/report routes, error sanitisation, `npm audit`, source secret scan, lint, typecheck, unit tests, and production build.

### Intentionally not claimed from a local repository check

- Real form/contact delivery, auth email delivery, sign-up/login/reset/session expiry against a real provider, RLS/Storage runtime enforcement, signed-URL expiry, external OAuth, HTTPS/DNS/CDN/compression, source-map exposure, browser console/network health, Lighthouse/Core Web Vitals, analytics/error monitoring, backup/restore, production migration, domain/certificate/redirect behavior, Search Console/Bing, social preview, and rollback execution.

### Not applicable until product scope changes

- PWA/service-worker install/offline behavior, video/audio handling, payment/refund policy, webhooks/background jobs, and AI-provider checks. Optional AI is not configured in this repository.

## Required pre-deployment command sequence

Use Node 22 LTS in a clean checkout:

```bash
npm ci --ignore-scripts
npm audit --omit=dev --audit-level=high
npm run typecheck
npm run lint
npm test
npm run build
```

Then complete the disposable Supabase and Vercel preview checklists before any production promotion. See `PRE_DEPLOYMENT_CHECKLIST.md` and `SECURITY_TEST_PLAN.md` for the exact controls.
