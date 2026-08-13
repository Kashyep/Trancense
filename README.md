# Trancense Audit Workspace Pilot v0.1

Evidence-first energy-audit software for Indian audit teams. Trancense is decision support: it does not certify an audit, determine compliance, or guarantee savings.

## Product workflow

After sign-in and onboarding, the workspace is organized around a short audit loop:

1. Add a monthly bill or meter reading in one form, or import up to 500 monthly rows from a CSV.
2. Review draft readings before they enter trusted calculations.
3. Use approved data in analysis, findings, recommendations, and draft reports.
4. Add supporting evidence, equipment, and preliminary solar scenarios as the audit progresses.

The post-login navigation keeps the primary workflow visible—Dashboard, Data, Analyse, Actions, and Reports. Secondary tools are grouped under “More tools” so the workspace stays focused on the next audit decision.

CSV imports retain the original file as private evidence. Supported columns include `month` (or `billing_month`), `quantity` (or `kwh`), and optional `source`, `unit`, `cost`, `provider`, and `notes`.

## Local setup

1. Use Node 22 LTS for local verification and deployment. The checked-in Supabase CLI version requires Node 22; some lint and browser tooling also no longer supports Node 18.
2. Copy `.env.example` to `.env.local` and set:

   ```text
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

   `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` must match the application variable name. Keep `SUPABASE_SERVICE_ROLE_KEY` server-only; never expose it in browser code or commit it.
3. Log in to the Supabase CLI, link the project, and apply migrations in timestamp order:

   ```bash
   supabase login
   supabase link
   supabase db push
   ```

4. In Supabase Auth, enable email/password and add these Redirect URLs for local and production domains:
   - `http://localhost:3000/auth/callback?flow=signup`
   - `http://localhost:3000/reset-password`
   - `https://trancense.vercel.app/auth/callback?flow=signup`
   - `https://trancense.vercel.app/reset-password`
5. Start the app with `npm run dev` and open `http://localhost:3000`.

## Fictional jury demo

The seed creates a fictional Meridian Components audit with approved electricity records, an excluded diesel record with a missing conversion factor, a reviewed finding, and a recommendation in review.

1. Create and confirm `kashyap.arnav2005@gmail.com` in Supabase Auth. Use a password that is never stored in this repository.
2. Run `supabase/seed/jury_demo.sql` in the Supabase SQL Editor.
3. Sign in at `/sign-in`.
4. Upload `demo/fixtures/jury-energy-register.csv` at `/app/evidence` or use `/app/import` to exercise the bulk monthly import flow.
5. Walk through `/app/energy`, `/app/analysis`, `/app/findings`, `/app/recommendations`, and `/app/reports`.

For the complete presentation sequence, see [JURY_DEMO_RUNBOOK.md](JURY_DEMO_RUNBOOK.md).

For a plain-language explanation of every post-login tab, see [POST_LOGIN_WORKSPACE_GUIDE.md](POST_LOGIN_WORKSPACE_GUIDE.md).

## Vercel deployment

The GitHub repository is `Kashyep/Trancense`. Configure the Vercel Production Branch intentionally for the active release branch.

1. In **Settings → Environment Variables**, set these Production values:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `NEXT_PUBLIC_APP_URL=https://trancense.vercel.app`
   - `NEXT_SERVER_ACTIONS_ALLOWED_ORIGINS=trancense.vercel.app`
2. Redeploy after environment changes; `NEXT_PUBLIC_*` variables are embedded at build time.
3. Test sign-up confirmation, password reset, `/sign-in`, and protected `/app` routes after deployment is Ready.

Never commit `.env.local`, Supabase service-role keys, reset links, or passwords.

## Theme, authentication, and onboarding

The UI uses Exo 2 for headings, Open Sans for detailed UI, and Kanit for labels with semantic light/dark tokens. Theme selection is manual only: the `next-themes` provider defaults to light, stores the explicit choice under `trancense-theme`, and never follows the operating system.

Email/password users receive a confirmation route at `/account-verified` after a successful sign-up confirmation. Users without a completed audit route to the protected, two-step workspace and boundary setup flow. Google OAuth is intentionally not rendered until provider configuration exists.

## Commands

```bash
npm install
npm test
npm run typecheck
npm run lint
npm run build
npm run dev
```

## Structure

- `src/app`: public, auth, onboarding, and protected App Router routes plus server actions.
- `src/components`: shared UI, minimal post-login navigation, theme, data-entry, import, equipment, solar, and review workflow forms.
- `src/domain`: deterministic calculation, monthly-period, CSV-import, solar-model, and recommendation workflow rules.
- `src/lib/supabase`: SSR/browser clients and session refresh helpers.
- `supabase/migrations`: schema, RLS, private bucket, Storage policies, and workflow hardening.
- `supabase/seed`: fictional jury-demo data.
- `demo/fixtures`: uploadable fictional source register.

## Security and operating notes

All tenant records are workspace-scoped. RLS resolves access through `workspace_memberships`, never editable profile metadata. Evidence and reports remain in private buckets; authorized download routes issue 60-second signed URLs only after a scoped metadata check. Permanent public URLs are not used. Only approved normalized records enter trusted calculations, and missing factors produce an unavailable state rather than zero.

The P0 pilot limit is one workspace per account. Preserve existing data and direct expansion requests to `/contact`.

Before deployment, follow [PRE_DEPLOYMENT_CHECKLIST.md](PRE_DEPLOYMENT_CHECKLIST.md), execute [SECURITY_TEST_PLAN.md](SECURITY_TEST_PLAN.md) against a disposable Supabase project, and review [SECURITY_AUDIT.md](SECURITY_AUDIT.md).

## Brand and content handoff

Supply factual identity, legal, pilot, and proof material in [CONTENT_REQUIRED.md](CONTENT_REQUIRED.md) before public launch. [PITCH_READINESS.md](PITCH_READINESS.md) separates implementation claims that can be demonstrated today from claims requiring evidence.
