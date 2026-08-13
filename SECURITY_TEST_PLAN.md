# Security test plan

## Local regression suite

- `src/domain/upload-validation.test.ts`: mismatched MIME/extension/magic bytes, path-like names, binary CSV, and over-size rejection.
- `src/lib/security.test.ts` and `src/app/auth/signout/route.test.ts`: same-origin POST enforcement for sign-out, including missing and malformed Origin headers.
- `src/app/auth/callback/route.test.ts`: email confirmation clears the temporary session and routes to the dedicated verified-account screen.
- `src/lib/site-url.test.ts`: canonical origin rejects non-local HTTP and strips unsafe path/query/fragment components before sitemap/robots/metadata use.
- `src/domain/calculations.test.ts`: only approved normalized records enter totals; missing factor/payback states remain unavailable.
- Static migration review: every workspace table enables RLS; security migration removes generic energy/audit-event writes and adds scope triggers.
- Build inspection: `rg` checks for secret-like literals, raw HTML sinks, dynamic evaluation, and arbitrary server fetches.

## Disposable Supabase verification (required before pilot)

1. Apply both migrations to an empty disposable project and enable email/password Auth.
2. Create users for unauthenticated, Viewer, Editor, Reviewer, Owner, and a second workspace Owner.
3. Use the publishable key/Data API to attempt select/insert/update/delete on every workspace table using same- and cross-workspace UUIDs.
4. Prove Viewer cannot mutate, Editor cannot set `review_state`, Reviewer can approve/reject only draft records, and direct `audit_events` insert/update/delete fails.
5. Attempt child records with a foreign workspace site/facility/audit/boundary/finding ID; triggers must reject them.
6. Attempt private Storage list/get/upload outside the caller workspace and arbitrary signed URL signing; all must fail. Verify authorized signed URLs expire.
7. Run the complete authenticated flow with three approved months and an authorized report export.

## Vercel preview checklist

- Confirm production headers, CSP, no-store behavior for authenticated/API responses, and source maps are not publicly served.
- Configure `NEXT_SERVER_ACTIONS_ALLOWED_ORIGINS` for the preview origin; cross-origin Server Action posts must fail.
- Confirm `/api/health` reveals only status/version, not configuration or secrets.
- Exercise sign-in/reset redirect URLs, expired sessions, document/report authorization, upload limit, and report generation timeouts.

## Regressions for every future mutation

Add a unit test for validation, a role/cross-tenant integration case, and an audit-provenance assertion. Run `npm test`, `npm run lint`, `npm run typecheck`, `npm run build`, and `npm audit --omit=dev` in CI.
