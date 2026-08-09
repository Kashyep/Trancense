# Security audit — Trancense Pilot v0.1

## Executive summary

Repository-only assessment completed on 2026-08-09. Static review, local tests, lint, typecheck, production build, secret-pattern search, dependency audit, and bounded scanner availability check were performed. `@openai/codex-security` could not start because the local `npx` registry wrapper was incomplete; no scanner finding was relied on. No remote Vercel, Supabase, or customer system was accessed.

**Deployment gate: NO-GO** until the required disposable Supabase RLS/Storage adversarial test and Vercel-preview verification in `SECURITY_TEST_PLAN.md` pass. This is an evidence limitation, not a claim of a confirmed remote misconfiguration.

## Attack surface inventory

Public routes: landing/auth/reset/contact and `/api/health`. Protected surfaces: Server Actions for onboarding, energy, evidence, review, and reports; `/api/evidence/[id]` and `/api/reports/[id]`; Supabase browser/Data API; private Storage; migrations/functions/policies. No AI, OCR, arbitrary URL fetch, webhooks, raw HTML renderer, or file parser exists.

## [SEC-001] Editor could approve energy records directly through the Data API

- Severity: High
- CVSS 3.1: CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:U/C:L/I:H/A:N (7.1)
- Affected component: `20260809000000_trancense_pilot.sql` generic `update editor energy_records` policy
- Attack preconditions: Authenticated Editor in a workspace; publishable Supabase client.
- Evidence: Generic editor update policy accepted any values, including `review_state`, `reviewed_by`, and `reviewed_at`. The server action’s role check did not protect direct Data API calls.
- Impact: An Editor could make unreviewed data enter trusted calculations and reports.
- Fix: `20260809000001_security_hardening.sql` replaces generic energy policies with draft-only Editor policies and reviewer-only approval/rejection policy bound to `auth.uid()`.
- Regression test: Disposable-project step 4 in `SECURITY_TEST_PLAN.md`; calculation tests retain approved-only behavior.
- Detection/monitoring: Alert on direct approval state transitions where actor lacks Reviewer/Owner role; audit all approval events.
- Status: fixed in migration; remote verification required before deployment.

## [SEC-002] Audit history was directly forgeable or mutable by Editors

- Severity: High
- CVSS 3.1: CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:U/C:L/I:H/A:N (7.1)
- Affected component: generic policies on `public.audit_events`; `src/app/actions.tsx`
- Attack preconditions: Authenticated Editor in a workspace.
- Evidence: Initial generic policies allowed editor insert/update and owner delete against `audit_events`; client-side action behavior was not a database boundary.
- Impact: Tampered provenance undermines reviewability and incident investigation.
- Fix: Security migration removes direct mutation policies, creates constrained `record_audit_event` RPC with actor derived from `auth.uid()`, and actions call the RPC.
- Regression test: Disposable-project step 4 proves direct mutations fail and action-generated events retain actor.
- Detection/monitoring: Alert on failed audit RPCs and anomalous event rates; retain database audit logs.
- Status: fixed in migration; remote verification required before deployment.

## [SEC-003] Child records could reference another workspace’s parent UUID

- Severity: High
- CVSS 3.1: CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:U/C:L/I:H/A:N (7.1)
- Affected component: workspace-scoped tables in `20260809000000_trancense_pilot.sql`
- Attack preconditions: Authenticated member knows/obtains another valid child UUID.
- Evidence: Foreign keys guaranteed existence but did not require `workspace_id` equality for facility/site, audit/facility, energy/boundary, evidence/audit, and related records.
- Impact: Cross-tenant reference pollution and misleading provenance; possible indirect disclosure in future joins.
- Fix: `assert_same_workspace` trigger validates parent workspace and specific audit/boundary/finding relationships on insert/update; pilot uniqueness constraints prevent repeated setup records.
- Regression test: Disposable-project step 5 deliberately supplies foreign-workspace IDs.
- Detection/monitoring: Monitor trigger rejections and treat repeated attempts as tenant-isolation probes.
- Status: fixed in migration; remote verification required before deployment.

## [SEC-004] Evidence validation trusted client MIME metadata

- Severity: Medium
- CVSS 3.1: CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:U/C:L/I:L/A:L (5.4)
- Affected component: `src/app/actions.tsx` upload action
- Attack preconditions: Authorized uploader submits a type-spoofed file.
- Evidence: Initial logic checked only `File.type`, name, and size.
- Impact: A mislabeled binary could be retained as evidence and later become dangerous if a parser/preview is added.
- Fix: `src/domain/upload-validation.ts` checks permitted MIME/extension combinations and PDF/PNG/JPEG/XLSX signatures; CSV rejects NUL/binary prefixes. No uploaded format is parsed or executed.
- Regression test: `src/domain/upload-validation.test.ts`.
- Detection/monitoring: Record rejected type/signature attempts without filename/content; alert on volume spikes.
- Status: fixed.

## [SEC-005] Missing browser security header baseline and explicit action-origin policy

- Severity: Medium
- CVSS 3.1: not scored
- Affected component: `next.config.ts`, Server Actions
- Attack preconditions: Browser access or cross-origin form/action attempt.
- Evidence: No security headers were configured and action origin policy was implicit.
- Impact: Larger XSS/clickjacking/CSRF blast radius.
- Fix: Global CSP, frame blocking, nosniff, referrer, and permissions headers; same-origin action check and configured `allowedOrigins` environment option.
- Regression test: Production build succeeds; preview test plan verifies headers and cross-origin rejection.
- Detection/monitoring: CSP/reporting endpoint is deferred until an owned reporting collector exists; monitor 4xx action-origin failures.
- Status: mitigated; CSP uses `unsafe-inline` for current Next runtime compatibility, so nonce-based CSP is a pre-pilot improvement.

## [SEC-006] Known vulnerable production dependency paths

- Severity: High
- CVSS 3.1: advisory-dependent; `npm audit` reported Next.js/PostCSS/Sharp paths
- Affected component: `package.json`, `package-lock.json`
- Attack preconditions: Deployed vulnerable dependency path.
- Evidence: Baseline `npm audit --omit=dev` reported three high dependency paths. 
- Impact: Framework/build-path information disclosure or denial of service.
- Fix: Updated Next.js to `15.5.21`, pinned/overrode PostCSS to patched `8.5.26`, and Sharp to `0.35.0` through the lockfile override.
- Regression test: Final production-only audit reports **0 high and 0 critical** findings.
- Detection/monitoring: Run production dependency audit in CI and block high/critical findings.
- Status: fixed.

## [SEC-007] Findings and recommendations could bypass review state machines

- Severity: High
- CVSS 3.1: CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:U/C:L/I:H/A:N (7.1)
- Affected component: generic `findings` and `recommendations` RLS policies in the pilot migration
- Attack preconditions: Authenticated Editor in a workspace.
- Evidence: Generic editor policies did not constrain `findings.review_state` or `recommendations.state`; direct Data API mutation could self-approve a finding or jump a recommendation to `verified`.
- Impact: Unreviewed conclusions could be represented as approved or verified.
- Fix: Security migration adds draft-only finding policies, reviewer-only finding review, and a database trigger enforcing the exact recommendation transition sequence and Reviewer/Owner-only verification.
- Regression test: `src/domain/security-migration.test.ts` plus disposable-project transition tests.
- Detection/monitoring: Alert on rejected transition triggers and review/verification events without expected actor role.
- Status: fixed in migration; remote verification required before deployment.

## Deferred risks and limits

- Low Supabase SDK advisory remains because the current `@supabase/supabase-js@2.49.8` transitively includes `@supabase/auth-js <=2.69.1`. Upgrade to a current Supabase SDK on Node 20 LTS in a compatibility-tested change before pilot; it is not a high/critical release blocker in the final production audit.
- No application-level distributed rate limiter, idempotency store, background queue, malware scanning, or report/AI quota exists. Vercel/Supabase limits plus a controlled pilot are required; add durable controls before scale.
- Runtime Supabase policies, bucket privacy, Auth redirect allowlist, SMTP/CAPTCHA, Vercel headers, and cache behavior cannot be validated without a disposable remote project/preview.
- Optional AI is absent. Any future AI integration must receive only authorized approved/snapshotted context, use strict size/time/rate limits, and never log evidence/prompt bodies.
