# Trancense post-login workspace guide

After sign-in and onboarding, Trancense opens the protected audit workspace. The main navigation is intentionally small; less-frequently used tools are grouped under **More tools**.

## Primary tabs

### Dashboard

The starting point for the active audit. It shows the next recommended step, approved energy totals, historical-baseline readiness, action progress, and recent audit activity.

Use it to understand what needs attention before moving through the audit.

### Data

The monthly energy-entry and review workspace. Add one bill or meter reading at a time with the month, original quantity, unit, energy type, optional cost, provider, notes, and supporting file.

New readings remain drafts. Reviewers can approve or reject them, and only approved compatible readings enter trusted calculations.

### Analyse

Shows approved-energy totals, historical baseline readiness, review progress, and calculation provenance.

Use **Generate calculation snapshot** after reviewing inputs. Each snapshot records its formula, included records, excluded records, assumptions, warnings, and quality state.

### Actions

Combines findings and recommendations. Create evidence-backed findings, send them for review, and turn reviewed findings into recommendations.

Recommendations move through controlled states such as draft, review, approved, planned, in progress, completed, and verified.

### Reports

Generates and lists draft audit report exports from authorized persisted data.

Reports label unavailable, estimated, draft, and unverified information. Completed exports can be downloaded through a scoped private route.

## More tools

### Import data

Bulk-import monthly energy readings from a CSV. The import accepts a `month` (or `billing_month`) and `quantity` (or `kwh`) column, plus optional `source`, `unit`, `cost`, `provider`, and `notes` columns.

The original CSV is retained as private evidence, while each imported row is created as a draft for review. Imports are limited to 500 data rows at a time.

### Equipment

Maintains the facility equipment register. Add systems such as chillers, pumps, compressors, or lighting equipment, with optional category, location, quantity, capacity, operating hours, condition, and notes.

Equipment values are marked as user-entered until supported by source evidence and review.

### Documents

Indexes private evidence files uploaded for the audit. Uploads do not become trusted automatically; reviewers connect evidence to approved data or reviewed findings.

Authorized users can open files through secure, scoped download routes.

### Solar planning

Creates preliminary rooftop-solar scenarios using roof area, exclusions, module assumptions, yield, losses, self-consumption, tariff, capital cost, operating cost, project life, discount rate, and degradation.

Saved scenarios retain their inputs, assumptions, and calculated outputs. They are planning estimates, not design, procurement, or guaranteed-savings results.

### Assistant

Provides a small workspace-grounded guide for questions about next steps, energy inputs, equipment, findings, actions, and reports.

Responses use counts and values currently stored in the active workspace. The assistant does not approve records, create findings, or replace reviewer decisions.

### Settings

Reserved for workspace preferences and administration as those controls are enabled. Authentication, onboarding, and account security remain separate from the audit navigation.

## Recommended sequence

1. Add or import energy data.
2. Review draft readings and supporting evidence.
3. Generate a calculation snapshot in Analyse.
4. Record findings and create recommendations in Actions.
5. Generate a draft report.

Equipment, Documents, Solar planning, and Assistant can be used alongside this sequence whenever they help clarify the audit.
