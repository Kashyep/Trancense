# Trancense Audit Workspace Pilot v0.1

Evidence-first energy-audit software for Indian audit teams. Trancense is decision support: it does not certify an audit, determine compliance, or guarantee savings.

## Local setup

1. Use Node 20 LTS for deployment. Node 18.18+ is supported by this checked-in build.
2. Copy `.env.example` to `.env.local` and set the values below:

   ```text
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

   `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` must be the exact variable name used by the app. Keep `SUPABASE_SERVICE_ROLE_KEY` server-only; never expose it in browser code or commit it.
3. Log in to the Supabase CLI and link the project:

   ```bash
   supabase login
   supabase link
   ```

4. Apply the migrations in timestamp order:

   ```bash
   supabase db push
   ```

   The migrations create the pilot schema, RLS and Storage policies, review workflow, and the cross-workspace trigger fix.
5. In Supabase Auth, enable email/password and add these Redirect URLs:
   - `http://localhost:3000/auth/callback`
   - `https://trancense.vercel.app/auth/callback`
6. Start the app:

   ```bash
   npm run dev
   ```

   Open `http://localhost:3000`.

## Fictional jury demo

The seed creates a fictional Meridian Components audit with approved electricity records, an excluded diesel record with a missing conversion factor, a reviewed finding, and a recommendation in the review state.

1. Create and confirm `kashyap.arnav2005@gmail.com` in Supabase Auth. Use the password you set for the account; do not store it in this repository.
2. Run the complete `supabase/seed/jury_demo.sql` in the Supabase SQL Editor.
3. Sign in at `/sign-in`.
4. Upload `demo/fixtures/jury-energy-register.csv` at `/app/evidence`.
5. Walk through `/app/energy`, `/app/analysis`, `/app/findings`, `/app/recommendations`, and `/app/reports`.

For the complete five-minute presentation sequence, see [JURY_DEMO_RUNBOOK.md](JURY_DEMO_RUNBOOK.md).

## Vercel deployment

The GitHub repository is `Kashyep/Trancense`. The current demo production branch is `agent/build-pilotable-trancense`; a standard team workflow can use `main` instead.

In the Vercel project serving `https://trancense.vercel.app`:

1. Set the Production Branch under **Settings → Environments → Production → Branch Tracking**.
2. Add these variables under **Settings → Environment Variables** with the **Production** environment enabled:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `NEXT_PUBLIC_APP_URL=https://trancense.vercel.app`
   - `NEXT_SERVER_ACTIONS_ALLOWED_ORIGINS=trancense.vercel.app`
3. Redeploy after changing environment variables. `NEXT_PUBLIC_*` values are embedded during the build and are not added to previous deployments.
4. Test `/sign-in` and the protected `/app` routes after the deployment is Ready.

Never commit `.env.local`, Supabase secret/service-role keys, or passwords.

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
- `src/components`: reusable UI and review workflow forms.
- `src/domain`: deterministic calculation and recommendation workflow rules.
- `src/lib/supabase`: SSR/browser clients and session refresh helpers.
- `supabase/migrations`: schema, RLS, private bucket, Storage policies, and workflow hardening.
- `supabase/seed`: fictional jury-demo data.
- `demo/fixtures`: uploadable fictional source register.

## Security and operating notes

All tenant records are workspace-scoped. RLS resolves access through `workspace_memberships`, never editable profile metadata. Evidence and reports are stored in private buckets; authorized download routes issue a 60-second signed URL only after the requesting user's RLS query finds scoped metadata. Permanent public URLs are not used. Only approved normalized records may enter trusted calculations. Missing factors produce an unavailable state rather than zero.

The P0 pilot limit is one workspace per account. Preserve existing data and direct expansion requests to `/contact`.

Before deployment, follow [PRE_DEPLOYMENT_CHECKLIST.md](PRE_DEPLOYMENT_CHECKLIST.md), execute [SECURITY_TEST_PLAN.md](SECURITY_TEST_PLAN.md) against a disposable Supabase project, and review the residual risks in [SECURITY_AUDIT.md](SECURITY_AUDIT.md).
