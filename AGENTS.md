# Trancense repository guidance

- Run `npm test`, `npm run typecheck`, and `npm run build` before handoff.
- Keep all workspace data RLS-protected and validate authorization again in server actions/routes.
- Never place service-role keys, private storage paths, or signed URLs in client code or logs.
- Add schema changes as Supabase migrations; preserve raw evidence and raw energy units.
- Domain calculations belong in `src/domain` with tests before behavior changes.
