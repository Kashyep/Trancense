# Trancense Audit Workspace

Pilot v0.1 for energy auditors and energy-audit consultants. Trancense turns scattered energy evidence into traceable analysis, prioritized actions, and professional draft reports.

The pilot deliberately keeps three layers separate:

1. **Evidence** — private source documents, utility records, equipment, and observations.
2. **Analysis** — approved values, normalized energy, baselines, KPIs, factors, and warnings.
3. **Decisions** — findings, recommendations, owners, status transitions, and reports.

## What is implemented

- Responsive public landing page and authenticated-workspace entry points.
- Supabase Auth client/server integration with graceful configuration detection.
- Pilot workspace UI for site, facility, audit boundary, evidence, energy records, equipment, analysis, findings, recommendations, settings, and reports.
- Clearly labelled deterministic demo workspace for local demonstrations; demo data is not presented as customer data.
- Typed server-side calculation modules for total energy, historical baseline, energy intensity, cost, emissions, and payback.
- Calculation detail view showing formula version, inputs, boundary, factors, timestamps, and warnings.
- PDF draft-report route with data-quality statements, assumptions, factor caveats, limitations, and evidence index.
- Supabase migration for the workspace-scoped data model, RLS policies, and private evidence bucket policies.
- Health endpoint at `/api/health`.
- Unit tests for calculation behavior and missing-input handling.

OCR, bill extraction, live meters, BMS/IoT integrations, advanced regression, subscriptions, autonomous recommendations, and regulatory submissions are intentionally deferred.

## Local setup

Requirements: Node.js 20+, npm, and (for real persistence) a Supabase project.

```bash
npm install
copy .env.example .env.local
npm run dev
```

Without Supabase credentials, the app opens a clearly labelled local demo workspace. This is useful for design review only; it is not real authentication or persistence.

## Environment variables

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
AI_PROVIDER=
AI_API_KEY=
AI_MODEL=
DEMO_MODE_ENABLED=true
```

Never commit real values. Service-role and AI keys must remain server-side.

## Supabase setup

1. Create a Supabase project.
2. Configure email/password Auth and set the local, preview, and production site URLs and redirect URLs.
3. Apply `supabase/migrations/202608020001_initial_schema.sql` through the Supabase SQL editor or Supabase CLI.
4. Confirm the private `evidence` storage bucket and storage policies were created.
5. Copy the project URL and anon key into the target environment.
6. Run the sign-up → onboarding → workspace → evidence → analysis flow with a real user.
7. Test cross-workspace read, mutation, storage, and report-export attempts before onboarding customer data.

The migration uses workspace-scoped records and database policies. Client-side filtering is not an authorization mechanism.

## Vercel deployment

1. Import the repository into Vercel.
2. Add environment variables separately for Preview and Production.
3. Set `NEXT_PUBLIC_SITE_URL` to the corresponding deployment URL.
4. Add the Preview and Production callback URLs in Supabase Auth.
5. Deploy and verify `/api/health`, sign-in, workspace creation, private evidence access, and PDF generation.

Do not claim external services are configured until the credentials and policies have been verified in that environment.

## Verification commands

```bash
npm run lint
npm run typecheck
npm test
npm run build
npm run e2e
```

`npm run e2e` performs a smoke check against the production build when `E2E_BASE_URL` is provided. Without that variable it verifies the required pilot routes and migration/reporting artifacts are present and explains the remaining external setup.

## Pilot acceptance flow

With Supabase configured, validate:

1. Sign up and sign in.
2. Route a user with no workspace to onboarding.
3. Create one workspace, site, facility, and active audit.
4. Upload a private bill and enter three monthly records.
5. Approve the records and inspect the calculation details.
6. Add equipment, finding, recommendation, owner, due date, and status.
7. Generate and download the draft PDF.
8. Sign out, sign in again, and confirm state remains available.
9. Confirm Viewer cannot mutate and User A cannot access User B's evidence or report.

## Known limitations

- The no-credential demo adapter stores demo state in browser local storage and is not a substitute for Supabase persistence.
- The current PDF route uses the deterministic pilot fixture. A configured Supabase report service should hydrate the same template from an authorized audit before customer use.
- AI is intentionally optional and only has a configuration/feature boundary in this pilot; grounded generation should be added behind server-side retrieval after the core persistence flow is connected.
- Emissions factors shown in demo mode are explicitly labelled examples and must be replaced with approved CEA/BEE or other documented factors.
- Retention period, factor hierarchy, tariff sources, and customer privacy terms remain deployment decisions before onboarding real customer data.
