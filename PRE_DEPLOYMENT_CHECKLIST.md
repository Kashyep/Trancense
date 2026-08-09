# Pre-deployment checklist

## Required configuration

- Vercel environment variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_APP_URL`, `NEXT_SERVER_ACTIONS_ALLOWED_ORIGINS`; `SUPABASE_SERVICE_ROLE_KEY` only if a future server-only task genuinely requires it.
- Use Node 20 LTS in Vercel. Keep public variables non-secret.
- Apply `20260809000000_trancense_pilot.sql` then `20260809000001_security_hardening.sql` to a disposable Supabase project before any production project.
- Add exact local, preview, and production `/auth/callback` and reset-password URLs to Supabase Auth Redirect URLs. Enable email confirmation, configure SMTP, password policy, CAPTCHA/rate limits, and supported session lifetime.
- Verify both buckets are private and all RLS/Storage policies are present. Do not use service-role keys in browser code.

## Required operational controls

- Enforce platform WAF/rate limits for auth, uploads, reports, and any future AI endpoint; add per-workspace quotas and report-generation idempotency/queueing before pilot scale.
- Keep security headers enabled. Use Vercel HTTPS; evaluate HSTS only with confirmed domain/TLS ownership and rollback plan.
- Configure structured error tracking with request correlation. Exclude tokens, cookies, password-reset links, evidence bodies/filenames, signed URLs, and AI prompts. Alert on auth failure spikes, 403/tenant-denial anomalies, upload failures, report failures, and 5xx rate.
- Back up Postgres, test restore, define Storage retention, and document export recovery.

## Initial SLOs and incident response

Targets: 99.5% authenticated-app availability; 99% calculation mutation success; 99% upload acceptance under 30 seconds for a 10 MB object; 99% report generation under 60 seconds. Runbooks must cover Auth outage (disable mutations and communicate), database/RLS failure (halt deployment, restore known-good migration), Storage failure (retain metadata/retry safely), report failure (record status and retry idempotently), and suspected tenant exposure (revoke sessions/signed URLs, preserve audit data, investigate, notify per policy).

## No-go conditions

Do not deploy if `npm audit --omit=dev` reports high/critical vulnerabilities, migrations/RLS/Storage have not passed disposable-project adversarial testing, action origins are unset for deployed domains, secrets appear in source/build output, Auth redirects are broad/wildcarded, private buckets are public, or monitoring/backup ownership is absent.
