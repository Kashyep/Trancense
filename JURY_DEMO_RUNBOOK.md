# Trancense Jury Demo Runbook

This runbook is for a controlled five-minute demonstration using fictional data. Trancense is decision support; it does not certify audits, determine compliance, or guarantee savings.

## One-time setup

1. Apply the migrations in order:
   - `supabase/migrations/20260809000000_trancense_pilot.sql`
   - `supabase/migrations/20260809000001_security_hardening.sql`
   - `supabase/migrations/20260810000000_jury_demo_workflow.sql`
2. Create and confirm a dedicated demo-only account in Supabase Auth. Use the password you set for that account; do not store it in this repository.
3. In the same SQL Editor session, run `select set_config('app.demo_email', 'confirmed-demo-account@example.com', false);`, replacing the example with that account’s email.
4. Run `supabase/seed/jury_demo.sql` in the Supabase SQL editor.
5. Start the app with `npm run dev`.
6. Sign in at `/sign-in` and upload `demo/fixtures/jury-energy-register.csv` at `/app/evidence`.
7. Confirm the demo account can access `/app`, `/app/energy`, `/app/analysis`, `/app/findings`, `/app/recommendations`, and `/app/reports`.

## Five-minute story

1. **Problem — 30 seconds:** Energy-audit work is often spread across files and spreadsheets. The product keeps the reasoning connected from evidence to verification.
2. **Boundary — 45 seconds:** Show the Meridian Components audit and its Whole facility boundary.
3. **Evidence and data — 60 seconds:** Show the source register and the energy review queue. Point out the raw values, normalized kWh, and the diesel row with a missing factor.
4. **Review and calculation — 60 seconds:** Approve a draft record, open Analysis, and generate a calculation snapshot. Show the formula, included records, excluded records, and warning.
5. **Finding and action — 60 seconds:** Create or open the compressed-air finding, then move the recommendation one state at a time. Explain that completed is not verified savings.
6. **Report — 45 seconds:** Generate the draft PDF, open Export history, and download it securely.

## Do not claim

- Customer adoption, savings, regulatory compliance, certification, AI capability, security certification, integrations, uptime, or market traction.
- That a draft or completed action is verified savings.
- That a private evidence upload is automatically trusted data.

## Fallback

Keep the localhost app open and have the generated PDF plus two screenshots available offline. Do not depend on live sign-up, email delivery, or a live upload during the presentation.
