# Trancense Essential Dummy Data

This file contains the minimum fictional dataset required for the Trancense jury demo.

Trancense is decision-support software. These records are fictional and must not be presented as real customer, regulatory, or certified audit data.

## Demo account

- Email: a dedicated confirmed demo-only account, supplied through `app.demo_email` before running the seed
- Password: create or use the password configured in Supabase Auth; never store it in the repository
- Role: `owner`

Never share the password in this file or commit it to GitHub. In the Supabase SQL Editor, run `select set_config('app.demo_email', 'confirmed-demo-account@example.com', false);` with the dedicated account before running `supabase/seed/jury_demo.sql`.

## Workspace

| Field | Value |
|---|---|
| Name | Meridian Components - Jury Demo |
| Country | India |
| Country code | IN |
| Currency | INR |
| Timezone | Asia/Kolkata |

## Site

| Field | Value |
|---|---|
| Name | Meridian Components Campus |
| City | Pune |
| State | Maharashtra |
| Country | India |

## Facility

| Field | Value |
|---|---|
| Name | Main Manufacturing Block |
| Facility type | Manufacturing |
| Floor area | 1200 |
| Area unit | m² |

## Audit

| Field | Value |
|---|---|
| Name | FY26 Energy Audit |
| Objective | Establish a defensible energy baseline and identify reviewed opportunities. |
| Period start | 2026-01-01 |
| Period end | 2026-03-31 |
| Status | Active |

## Reporting boundary

| Field | Value |
|---|---|
| Name | Whole facility |
| Scope | Main manufacturing block; exclude leased retail unit. |
| Frequency | Monthly |
| Period start | 2026-01-01 |
| Period end | 2026-03-31 |
| Area | 1200 m² |
| Active | Yes |

## Evidence file

Upload this file through `/app/evidence`:

`jury-energy-register.csv`

Evidence metadata:

- Source/provider: `Internal energy audit register - fictional`
- Notes: `Monthly electricity register with one diesel record awaiting an approved conversion factor.`
- Initial review state: `draft`

The current application stores the CSV as private evidence; it does not automatically import the rows. The energy records below must already be seeded or entered through `/app/energy`.

### CSV contents

```csv
period_start,period_end,source,quantity,unit,cost_inr,notes
2026-01-01,2026-01-31,electricity,120000,kWh,840000,Fictional jury-demo source register
2026-02-01,2026-02-28,electricity,118000,kWh,826000,Fictional jury-demo source register
2026-03-01,2026-03-31,electricity,125000,kWh,875000,Fictional jury-demo source register
2026-03-15,2026-03-31,diesel,4200,L,,Missing approved factor; should remain excluded
```

## Energy records

| Period | Source | Raw quantity | Raw unit | Normalized kWh | Conversion status | Cost INR | Quality state | Review state | Notes |
|---|---|---:|---|---:|---|---:|---|---|---|
| 2026-01-01 to 2026-01-31 | electricity | 120000 | kWh | 120000 | native | 840000 | source_documented | approved | Fictional jury-demo record. |
| 2026-02-01 to 2026-02-28 | electricity | 118000 | kWh | 118000 | native | 826000 | source_documented | approved | Fictional jury-demo record. |
| 2026-03-01 to 2026-03-31 | electricity | 125000 | kWh | 125000 | native | 875000 | source_documented | approved | Fictional jury-demo record. |
| 2026-03-15 to 2026-03-31 | diesel | 4200 | L | unavailable | missing_factor | — | needs_review | draft | Fictional excluded record: no approved conversion factor. |

## Finding

| Field | Value |
|---|---|
| Title | Compressed-air leakage during idle hours |
| Category | Operations |
| Confidence | Medium |
| Review state | Approved |
| AI assisted | No |

Observation:

> The fictional source register indicates compressed-air demand continues during the recorded idle window. Confirm the observation on site before estimating savings.

## Recommendation

| Field | Value |
|---|---|
| Intervention | Repair leaks and add an idle-period shutdown check |
| Related finding | Compressed-air leakage during idle hours |
| Affected system | Compressed air |
| Priority | High |
| Estimated annual savings | 7200 kWh |
| Implementation cost | 180000 INR |
| Confidence | Medium |
| Initial state | review |

Assumptions:

> Savings remain indicative until measured verification.

Risks/dependencies:

> Requires a maintenance window and production-owner review.

For the demonstration, move the recommendation through:

`review → approved → planned → in_progress → completed → verified`

Explain that `completed` does not mean savings have been independently verified.

## Expected calculation results

After approving the three electricity records and generating a calculation snapshot:

| Metric | Expected result |
|---|---:|
| Approved energy total | 363000 kWh |
| Approved monthly periods | 3 |
| Historical monthly baseline | 121000 kWh |
| Total electricity cost | 2541000 INR |
| Average monthly cost | 847000 INR |
| Included records | 3 |
| Excluded records | 1 |
| Formula name | total_approved_energy_v1 |
| Formula version | 1.0 |
| Quality state | reviewable |

Expected warning:

> One draft, rejected, or unavailable record was excluded.

## Demo sequence

1. Sign in with the Supabase Auth account.
2. Open the Meridian Components audit and Whole facility boundary.
3. Open `/app/evidence` and upload `jury-energy-register.csv`.
4. Open `/app/energy` and show the three approved electricity rows plus the excluded diesel row.
5. Open `/app/analysis` and generate the calculation snapshot.
6. Open `/app/findings` and show the approved compressed-air finding.
7. Open `/app/recommendations` and advance the recommendation through its states.
8. Open `/app/reports` and generate/download the draft report.

## Not required for the basic demo

These tables are not needed to demonstrate the current main workflow:

- Equipment records
- Tariff assumptions
- Conversion-factor records
- Additional team members
- Pre-created report exports

The current Equipment, Settings, and Account screens are not yet populated with full management interfaces.
