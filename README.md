# Trancense Audit Workspace Pilot v0.1

Evidence-first energy-audit software for Indian audit teams. It is decision support: it does not certify an audit, determine compliance, or guarantee savings.

## Local setup

1. Use Node 20 LTS for deployment (Node 18.18+ also runs this checked-in local build).
2. Copy `.env.example` to `.env.local` and add a Supabase project URL and publishable key. Keep the service-role key server-only; this pilot does not expose it to the browser.
3. Apply `supabase/migrations/20260809000000_trancense_pilot.sql` with the Supabase CLI or SQL editor.
4. In Supabase Auth, add `http://localhost:3000/auth/callback` and your production `/auth/callback` URL to Redirect URLs; enable email/password and configure email templates/SMTP as appropriate.
5. Run `npm run dev`.

## Commands

```bash
npm test
npm run typecheck
npm run build
npm run dev
```

## Structure

- `src/app`: public, auth, onboarding, and protected App Router routes plus server actions.
- `src/domain`: deterministic, independently tested calculation rules.
- `src/lib/supabase`: SSR/browser client and session refresh helpers.
- `supabase/migrations`: schema, RLS, private bucket, and Storage policies.

## Security and operating notes

All tenant records are workspace-scoped. RLS resolves access through `workspace_memberships`, never editable profile metadata. Evidence and reports are stored in private buckets; the authorized download routes issue a 60-second signed URL only after the requesting user's RLS query finds the scoped metadata. Permanent public URLs are not used. Only approved normalized records may enter trusted calculations. Missing factors produce an unavailable state rather than zero. Configure and test policies in a non-production Supabase project before release.

The P0 pilot limit is one workspace per account. Preserve existing data and direct expansion requests to `/contact`.

Before deployment, follow [PRE_DEPLOYMENT_CHECKLIST.md](PRE_DEPLOYMENT_CHECKLIST.md), execute [SECURITY_TEST_PLAN.md](SECURITY_TEST_PLAN.md) against a disposable Supabase project, and review the residual risks in [SECURITY_AUDIT.md](SECURITY_AUDIT.md).
