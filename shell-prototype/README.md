# Exxat One — New UI Shell + Bulk Clone Availabilities

The design team's new UI shell (login → choose products → Site Portal) with the Bulk Clone
Availabilities feature rebuilt inside it. This is a separate project from `exxat-one-base`
(localhost:5173), which is untouched.

## Run

```bash
cd design-system/exxat-one-shell-bulk-clone
npm install
npm run dev
```

Opens on http://localhost:5176 (fixed port, so it can run alongside `exxat-one-base` on 5173).

## Walkthrough

1. Log in with any username or email, then pick a product and a site.
2. Sidebar: **Availability Management → Availability**.
3. Tick 2 or more rows (cap: 25; an advisory appears from 15) and click **Clone N Availabilities**.
   A single row uses the **Clone** icon on its row.
4. Wizard: Naming → Dates → Review → Publish → progress → summary.

## What is in it

- Availability list in the shell's page pattern: tabs (All / Upcoming / Current / Completed), multi-select
  filters, search, selection toolbar, single-row clone.
- Selection cap of 25 with a dismissible advisory at 15 or more.
- Step 1: single-input `@` mention template (`@location`, `@discipline`,
  `@program_type`, `@experience_type`), live preview, `#2`/`#3` suffixes for duplicates, Duplicate Check column.
- Step 2: **Roll Forward** by 3 months, 6 months or 1 year, or **Custom Date** (one start and end date applied to every availability), with per-row edits either way.
- Step 3: review table with a sticky remove column and horizontal scroll.
- Step 4: publish preference — same for all, or default plus per-availability overrides with rotation dates shown.
- Progress screen with field-level draft reasons, then a summary.
- Pre-validation interstitial for flagged availabilities.

## Where things live

- `src/app/components/availability/` — list page, table, publish preference card, wizard (`BulkCloneWizard/`)
- `src/app/data/mockAvailabilities.ts` — mock data
- `src/app/routes.tsx` — the `availability/*` route replaces the shell's placeholder page
- Everything else is the design team's shell, unchanged except one added icon (`circleCheck`).

Styling uses the shell's tokens (Inter, `exxat-tokens.css`, neutral/blue ramps, `bg-card` cards) and its `ui/` components.

## Notes for development

- **Schedules emails to Schools (fallback contact).** When a school has no program contact details on file, the email goes to whoever raised the request from the school side, using that person's email id. This fallback is already defined in the product, so the prototype does not model it; a school with no program contacts simply contributes no recipients here. Preceptors, Site Personnel and Placement Faculty / CI are never expected to lack an email, so the mock data gives all of them one. (Product note from Himanshu, Oct 2026.)

## Merge fields

`Merge_Fields_Catalog.xlsx` lists every merge field. The app reads the same list from `src/app/data/mergeFieldCatalog.ts`, which feeds the compose panel's Insert Merge Field menu, both Email Setup template editors and the merge engine (`src/app/data/messageMerge.ts`). Both files are generated from `scripts/merge_field_entries.py`: edit that table, then run `python3 scripts/build-merge-field-catalog.py` (needs `openpyxl`).

## Notification area (Site and School Configuration)

Site Configuration and School Configuration now open a Notification group with Email Setup, Email Templates, Attachment Templates (Site only), Notification Configuration and My Notifications. It follows the notifications reference prototype (https://exxat-notifications.pages.dev/). The in-app **Show changes** switch marks every part as From reference, New or Ours, and **What changed** lists them.

Code: `src/app/components/notifications/`, shared data in `src/app/data/notificationStore.ts`.

### Taken from the reference prototype

- Navigation: A Notification group in Configuration with Email Setup, Email Templates, Notification Configuration and My Notifications.
- Notification Configuration: Events by In app and Email channels, grouped by category, with a User (role) dropdown.
- Notification Configuration: Lock and unlock a category; Messages is permanently locked; turn a channel on or off for a whole category.
- Notification Configuration: Recipients drawer: search, tick who receives the role's notifications, add an external recipient, and users who have blocked all notifications.
- Notification Configuration: Preview a notification as In app and as Email, with merge values highlighted.
- Notification Configuration: Save Now.
- My Notifications: Personal In app and Email preferences per event, with a one-line description; locked categories cannot be turned off; Save preferences.
- Email Templates: Templates organised by event, with a template count on each event, and a deep-linkable selection.
- Email Templates: Several templates per event: Default badge, Standard (system, read-only) and Customized.
- Email Templates: Card actions: Preview, Clone, Edit, Delete, Set as default (immediate, with a toast), and an expandable Edit history.
- Email Templates: Rules: Standard templates cannot be edited or deleted, only cloned; a default cannot be deleted until another is set.
- Email Templates: Add template: start from scratch or pick an existing template as the base. Clone: name the copy, nothing is created until you confirm.
- Template editor: Full-page editor: name, read-only category, live header and footer around Subject and Body, Preview, Save, overflow menu with Delete.
- Template editor: Attachments (up to 5, 10 MB each), Set as default toggle, header and footer layout options.
- Template editor: Merge fields and Links lists, and typing @ in a field to pick one.

### New in this prototype

- Email Templates: A Bulk Email group beside Automated notifications. Our existing Bulk Email templates get the same cards, rules, clone, default and history.
- Email Templates: Edits to Bulk Email templates now flow to the compose wizard (before, the config page kept its own copy).
- Template editor: Bulk Email templates: audience type, reply-to override, and the full merge-field catalogue with search and groups.
- Template editor: Preview of a Bulk Email template with real sample records through the merge engine, merged values highlighted.
- Template editor: Deep links added to the catalogue (schedule, request, placement, requirement, Exxat One home) for Bulk Email.
- School portal: The same four sections for the School portal, with School events and School roles (School Admin, Program Coordinator, Clinical Instructor).
- This page: Show changes and What changed, so every part is marked From reference, New or Ours.

### Already ours, kept

- Email Setup: Display name plus default reply-to, tenant logo and footer (the reference has display name only).
- Attachment Templates: Dynamic documents generated per recipient, kept as their own section.
- Bulk Email: The existing templates, audience types and merge-field engine that the new pages build on.

Notes: seeded Bulk Email templates are now Standard (read-only; clone to customize). Set as default on a Bulk Email template reorders and labels it; the compose wizard does not yet preselect the default. School roles (School Admin, Program Coordinator, Clinical Instructor) and School events are assumptions to confirm.

## Schedules module (design team's workflow)

Site > Schedules follows the design team's build: Overview, Schedules List (`/schedules/list/all|group|individual`) and the full-width Compose Bulk Email sheet. Code is in `src/app/components/schedules-module/` (page, list, overview, design tokens copied from their build) and the `layout="sheet"` variant of `ComposeEmailWizard`. The Location and School Partner Schedules tabs still use the shared list and the earlier drawer. The single-file build (`node scripts/build-single-file.mjs`) keeps its location in memory and works inside a sandboxed viewer frame.
