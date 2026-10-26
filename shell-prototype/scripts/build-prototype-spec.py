#!/usr/bin/env python3
"""Builds Exxat_One_Prototype_Spec.html: a compact written spec of the whole prototype
(small enough to paste into a chat). Facts come from the prototype's own code and data:
scripts/email_use_cases_v1.py (the ten Bulk Email screens) and a JSON dump of the
notification store (see the note at DATA below).

Run from the project root:  python3 scripts/build-prototype-spec.py
"""
import json
import sys
from html import escape as e
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(Path(__file__).resolve().parent))
from email_use_cases_v1 import SURFACES  # noqa: E402

# DATA is produced by bundling src/app/data/notificationStore.ts and mergeFieldCatalog.ts with esbuild
# and dumping EVENTS, ROLES, bulk template groups and catalogue counts to JSON.
DATA = json.loads(Path(sys.argv[1]).read_text()) if len(sys.argv) > 1 else None
assert DATA, "usage: build-prototype-spec.py <data.json>"

CSS = """
:root{--bg:#fff;--fg:#111827;--mut:#4b5563;--line:#d1d5db;--soft:#f3f4f6;--accent:#1f3a8a;--ref:#4338ca;--new:#047857;--ours:#4b5563}
@media (prefers-color-scheme:dark){:root{--bg:#0f172a;--fg:#e5e7eb;--mut:#9ca3af;--line:#334155;--soft:#1e293b;--accent:#93c5fd;--ref:#a5b4fc;--new:#6ee7b7;--ours:#9ca3af}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--fg);font:15px/1.55 Inter,system-ui,sans-serif}
main{max-width:1040px;margin:0 auto;padding:32px 20px 80px}h1{font-size:28px;margin:0 0 4px;color:var(--accent)}
h2{font-size:21px;margin:40px 0 8px;padding-top:8px;border-top:2px solid var(--line);color:var(--accent)}h3{font-size:16px;margin:24px 0 6px}
p{margin:6px 0}ul{margin:6px 0 6px 20px;padding:0}li{margin:2px 0}code{background:var(--soft);padding:1px 5px;border-radius:4px;font-size:13px}
table{border-collapse:collapse;width:100%;margin:8px 0 16px;font-size:13.5px;display:block;overflow-x:auto}
th,td{border:1px solid var(--line);padding:6px 9px;text-align:left;vertical-align:top}th{background:var(--soft);white-space:nowrap}
.sub{color:var(--mut)}.tag{display:inline-block;font-size:11px;font-weight:600;border:1px solid currentColor;border-radius:99px;padding:0 7px;margin-left:4px;white-space:nowrap}
.ref{color:var(--ref)}.new{color:var(--new)}.ours{color:var(--ours)}.note{background:var(--soft);border-left:4px solid var(--accent);padding:8px 12px;margin:10px 0;border-radius:4px}
nav.toc{background:var(--soft);padding:10px 16px;border-radius:8px;margin:14px 0}nav.toc a{color:var(--accent);margin-right:14px;white-space:nowrap}
"""


def tag(kind, text=None):
    names = {"ref": "From reference", "new": "New", "ours": "Ours"}
    return f'<span class="tag {kind}">{e(text or names[kind])}</span>'


def table(headers, rows):
    head = "".join(f"<th>{e(h)}</th>" for h in headers)
    body = "".join("<tr>" + "".join(f"<td>{c if isinstance(c, str) and c.startswith('<') else e(str(c))}</td>" for c in r) + "</tr>" for r in rows)
    return f"<table><thead><tr>{head}</tr></thead><tbody>{body}</tbody></table>"


def ul(items):
    return "<ul>" + "".join(f"<li>{i}</li>" for i in items) + "</ul>"


parts = []
add = parts.append

# ── Title ────────────────────────────────────────────────────────────────────
add(f"""<h1>Exxat One prototype: handoff spec</h1>
<p class="sub">The whole prototype in one document: what is built, how it behaves, the rules, the data, and how it differs from the two prototypes it was measured against. Built October 2026 from the working prototype in <code>design-system/exxat-one-shell-bulk-email</code>.</p>
<nav class="toc"><a href="#s1">1 What it is</a><a href="#s2">2 Screens</a><a href="#s3">3 Bulk Email</a><a href="#s4">4 Screen behaviour</a><a href="#s5">5 Email &amp; Notification configuration</a><a href="#s6">6 Differences</a><a href="#s7">7 Open items</a><a href="#s8">8 Files</a></nav>
<p>Tags used throughout: {tag('ref')} taken from the notifications reference prototype (https://exxat-notifications.pages.dev/), {tag('new')} added in this prototype, {tag('ours')} already ours before the notification work and kept.</p>""")

# ── 1 ────────────────────────────────────────────────────────────────────────
add("""<h2 id="s1">1. What it is</h2>
<p>A clickable prototype of Exxat One inside the design team's new UI shell (login, product chooser, then a Site or School portal). It adds two bodies of work on top of the shell:</p>
<ul><li><b>Bulk Email</b>: send one message to many people from ten screens, with templates, merge fields, scheduling and a history.</li>
<li><b>Email &amp; Notification configuration</b>: the Configuration area where a site or school sets up how its emails look, manages templates, and decides who gets which notification.</li></ul>
<p><b>Run it.</b> Open <code>Exxat_One_Prototype.html</code> (one self-contained file; needs internet only for the web fonts and the icon kit), or in the project run <code>npm install</code> then <code>npm run dev</code> (port 5177). Sign in with the mock login: click Continue, choose As Site or As School, then pick a site or school. Data is in memory and resets on reload.</p>""")

# ── 2 ────────────────────────────────────────────────────────────────────────
add("""<h2 id="s2">2. Screens</h2>
<p>Routes are under <code>/site/:siteId/</code> and <code>/school/:schoolId/</code> (the single-file build uses <code>#/</code> before the path).</p>""")
add(table(["Portal", "Route", "Screen", "Status"], [
    ["Site", "dashboard", "Site dashboard", "Existing shell"],
    ["Site", "locations, locations/:id", "Locations list; location detail with tabs About, Personnel, Contracts, Requests, Schedules, Availability", "Built (Personnel and Schedules tabs carry Bulk Email); Availability tab is a placeholder"],
    ["Site", "personnel", "Personnel list", "Built with Bulk Email"],
    ["Site", "partners, partners/:id", "School Partners list; partner detail with tabs About, Requests, Schedules, Contracts", "Built with Bulk Email"],
    ["Site", "schedules", "Schedules and Onboarding (Overview, Schedules List, Calendar, Report tabs)", "Schedules List built with Bulk Email; Overview built; Calendar and Report are placeholders"],
    ["Site", "availability/*, jobs/*", "Availability and Jobs", "Existing shell (the Bulk Clone work is a separate prototype); no Bulk Email button on Jobs yet"],
    ["Site", "slot-requests, reports", "Slot Requests, Reports", "Placeholder pages"],
    ["Site", "site-configuration/notification/*", "Email Setup, Email Templates (+ editor), Attachment Templates, Notification Configuration, My Notifications", "Built"],
    ["School", "dashboard", "School dashboard", "Existing shell"],
    ["School", "schedules", "Schedules and Onboarding", "Built with Bulk Email"],
    ["School", "requests", "Requests", "Built with Bulk Email"],
    ["School", "school-configuration/notification/*", "Email Setup, Email Templates (+ editor), Notification Configuration, My Notifications", "Built (no Attachment Templates)"],
    ["School", "explore, reports", "Explore and apply, Reports", "Placeholder pages"],
]))

# ── 3 Bulk Email ─────────────────────────────────────────────────────────────
add("""<h2 id="s3">3. Bulk Email</h2>
<h3>3.1 Where it appears</h3>
<p>Ten places. On each, a toolbar above the table shows "Select rows to email &lt;people&gt;" until rows are ticked, then "N selected", and a <b>Bulk Email</b> button on the right.</p>""")
rows = []
for name, m in SURFACES.items():
    rows.append([m["portal"].capitalize() + ": " + m["screen"], m["where"], m["personas"], m["selection"], m["note"] if "note" in m else ""])
add(table(["Screen", "Where", "Who can be emailed", "How selection works"], [r[:4] for r in rows]))
add("""<h3>3.2 The Bulk Email button</h3>
<p>One outlined blue split button, label "Bulk Email" with a chevron. Its menu has two items with an icon each: <b>Compose Email</b> (disabled until at least one row is ticked, except on a location's Personnel tab where people are picked inside the panel) and <b>Email History</b> (always available). On the main Schedules screen the button and the row checkboxes are hidden under the All Schedules segment and appear under Group and Individual.</p>
<h3>3.3 Compose panel (three steps)</h3>
<p>A full-height drawer titled "Bulk Email" with a step bar (Recipients, Compose, Preview), "Cancel — discard draft" bottom left, Back and Next bottom right.</p>
<p><b>Step 1, Recipients.</b></p>""")
add(ul([
    "<b>Persona list</b> (Schedules screens and the School portal's Schedules): a left column, \"Who should receive this?\", with one tick box per persona (Students, Preceptors, Site Personnel, Schools, Placement Faculty / CI on the Site portal; Students, Site Personnel, Placement Faculty / CI, School Program Contacts on the School portal). Each shows how many unique people it covers. Nothing is pre-ticked. Ticking a persona adds everyone tied to the selected schedules: the students, the preceptors and site staff at their locations, the school's program contacts and placement faculty.",
    "<b>Person picker</b> (a location's Personnel tab): search, role chips with counts (for example Clinical Coordinator 2), \"Select all shown\", and one tick box per person with a role badge. Nothing is pre-ticked.",
    "<b>Recipient list</b> (middle): name, email, details (a persona badge appears when several personas are possible), and an X to remove one person. A removed person stays removed when another persona is ticked.",
    "<b>Routing</b> (right): Override Recipient's Email (every email goes to this address instead, for testing), Reply to (required, defaults to the tenant reply-to), CC, BCC.",
    "<b>Rules:</b> duplicates by email are merged. Site personnel with Receive Notifications off are listed as \"notifications off — excluded\". School program contacts with no email are skipped quietly. Next is enabled when at least one valid recipient exists.",
]))
add("<p><b>Step 2, Compose.</b></p>")
add(ul([
    "A switch, \"Continue without picking a template\".",
    "<b>Template mode:</b> a \"Pick a template\" dropdown of the templates for the audience(s) in the send, labelled \"[Section] Name\" plus the audience when several personas are ticked; then Subject and Email Content.",
    "<b>No-template mode:</b> two columns. Left: Subject and Email Content. Right: \"Header and footer layout\", five radios: No logos; Site logo on the header; Exxat logo on the footer; Site logo on the header and Exxat logo on the footer; Share profile site logo on the header and Exxat logo on the footer (\"University\" on the School portal). The header shows the logo uploaded in Email Setup, or the display name until one is uploaded.",
    "<b>Email Content</b> is a rich-text editor (bold, italic, underline, numbered and bullet lists, link, clear formatting).",
    "<b>Insert Merge Field</b> opens a searchable list grouped by Recipient, Sender &amp; Organization, Student, Schedule, Location, Availability, Slot Request, School / Partner, Contract, Site Personnel, Preceptor, Placement Faculty / CI, Candidate &amp; Job, Schedules List, Links and Written by Sender. When several personas are ticked it offers the union of their fields. Scrolling works inside the drawer.",
    "<b>Attachments:</b> Add file (PDF, DOCX, XLSX, PNG, JPG; 10 MB each; up to 3) and Generate document (a document built per recipient from the Attachment Templates).",
]))
add("<p><b>Step 3, Preview.</b></p>")
add(ul([
    "\"Previewing as\" a recipient dropdown; the email shows subject and body with that person's own values filled in, in the chosen header and footer.",
    "Anyone whose message cannot be fully filled (a merge field with no value for them) is held back and flagged with the field name. A dynamic attachment that cannot be generated for someone is left off for that person only. Both appear as red-triangle exclusion lines.",
    "Delivery: \"Send email now\" or \"Send email at specific date and time\" (date and time pickers; a past time is rejected).",
    "Send opens \"Confirm bulk email — You are about to email N recipients. This action cannot be undone.\" with Cancel and \"Confirm — Send to N\".",
    "Result toasts: \"Email sent successfully to N recipients.\" or \"Email scheduled successfully…\"; with exclusions, a warning that lists them; with failures (simulated, deterministic by address), \"X of N succeeded, Y failed — see Email History to retry.\"",
]))
add("""<p><b>Mixed personas.</b> One message goes to every ticked persona. Each recipient is resolved from their own record, so {{studentName}} fills for students and {{preceptorName}} for preceptors; a field that does not apply to someone holds that person back. The history records each recipient under their own audience.</p>
<h3>3.4 Email History</h3>
<p>"Email History" opens a side sheet with two tabs. <b>History</b>: every send row by row (recipient, subject, status Sent or Failed, source screen, who sent it, when), a status filter, a detail view with the email body as sent (including the header and footer chosen), and a retry action on Failed rows. <b>Scheduled</b>: sends waiting for their time; view, edit (reopens the compose panel in edit mode) or cancel (the canceled send does not appear in history).</p>
<h3>3.5 Merge fields and the engine</h3>""")
groups = DATA["catalogGroups"]
add(f"<p><b>{DATA['catalogTotal']} fields</b> in one catalogue shared by the compose panel, both template editors and the merge engine. Counts by group:</p>")
add(table(["Group", "Fields"], [[g, c] for g, c in groups.items()]))
add(ul([
    "<b>Spelling does not matter:</b> <code>{{first_name}}</code>, <code>{{firstName}}</code> and <code>{{First Name}}</code> are one field.",
    "<b>Never sent blank.</b> A field with no value is left visible, flagged on the Preview step, and that recipient is held back.",
    "<b>Values are HTML-escaped</b> in the body (live data can contain HTML or script text).",
    "<b>Sources:</b> a record (the recipient's own, or one it links to), derived (dates, counts, durations), sender or platform (name, organisation, links, today), sample (the live product has the field, the prototype has no data, so a labelled example fills in), or written by the sender (for example <code>{{messageBody}}</code>).",
    "<b>List blocks</b> repeat one line per item: <code>{{#each studentSchedules}}• {{this}}&lt;br&gt;{{/each}}</code>. Lists: outstanding onboarding items, student schedules, students not cleared to start, open requests, request status summary, program contacts.",
    "<b>Deep links</b> (new): schedule detail, request detail, placement detail, requirement detail, Exxat One home.",
    "Where a school contact is emailed from a Schedules screen, per-student detail comes from the student list, not <code>{{locationName}}</code> or <code>{{rotationName}}</code>, which resolve from the school's latest request.",
]))
add("<p>The full field list (token, label, description, where it lives in the live product, example) is in <code>Merge_Fields_Catalog.xlsx</code>, with one sheet per Bulk Email screen. Ready-to-use emails for each screen are in <code>Bulk_Email_Use_Cases.xlsx</code> (34 use cases) and a shorter leadership version, <code>Bulk_Email_Use_Cases_Leadership_Review.xlsx</code>.</p>")

# seeded bulk templates
add("<h3>3.6 Seeded Bulk Email templates</h3><p>25 templates ship, grouped by section then category. In the new Email Templates page they are Standard (read-only; clone to customize).</p>")
rows = []
for portal in ("site", "school"):
    for g in DATA["bulk"][portal]:
        for t in g["templates"]:
            rows.append([portal.capitalize(), g["section"], g["category"], t["name"], t["audience"]])
add(table(["Portal", "Section", "Category", "Template", "Audience"], rows))

# ── 4 Screen behaviour ───────────────────────────────────────────────────────
add("""<h2 id="s4">4. Screen behaviour</h2>
<h3>4.1 Schedules list (one component, three places)</h3>
<p>Used on the Schedules screen, a location's Schedules tab and a partner's Schedules tab (the last two pass in only that location's or school's schedules).</p>""")
add(ul([
    "<b>Segmented control:</b> All Schedules, Group, Individual. Group means a rotation shared by more than one student; Individual means one student.",
    "<b>Time tabs:</b> All, Upcoming, Current, Completed (Current maps to status Active).",
    "<b>Needs Attention card:</b> counts To be Scheduled, Not Compliant and Canceled.",
    "<b>Filters:</b> search (student, school, location), Discipline, School (hidden on a school's own tab), Onboarding Status (Compliant, Non-Compliant, Pending, Not Started). \"N shown\" at the right.",
    "<b>Columns:</b> Student (name and email), School, Program, Location, Rotation Dates, Onboarding (coloured badge).",
    "Changing the segment or a time tab clears the row selection; changing a filter narrows it. Bulk Email and the checkboxes appear under Group and Individual only.",
]))
add("""<h3>4.2 School Partners</h3>
<p><b>List:</b> title "School Partners" with "+ Add Partner" (a coming-soon message), a filter bar (Search; State, Category, Contract Status, Program Contact Details, Discipline chips; reset; export), the table, and a footer "Rows per page [50]  Page 1 of 1 (n items)" with first, previous, next, last. Columns: checkbox, School Name (link), Website, Address, Category, Contracts (green "N Active" pill over an amber "N Expired" pill), Program Contact (first contact, "+N", "View All"), Associated Discipline (derived from program types), Actions (edit, delete: coming-soon messages). Selecting schools and choosing Compose Email adds <b>every</b> program contact of each school.</p>
<p><b>Detail:</b> header with the school, contract pills and contact; tabs About (basic information, Program Contacts table with row selection and Bulk Email), Requests, Schedules (the shared list scoped to the school), Contracts (counts only; contract records are not in the prototype).</p>
<h3>4.3 Locations, Personnel</h3>
<p>Location detail: Personnel tab is a list of people with "Personnel Affiliation" and a Bulk Email button whose compose panel opens the person picker; Schedules tab is the shared list. The Personnel list sends to staff; staff with Receive Notifications off are excluded.</p>
<h3>4.4 School portal</h3>
<p><b>Schedules and Onboarding</b>: the shared pattern with filters (search, onboarding status) and personas Students, Site Personnel, Placement Faculty / CI, School Program Contacts. <b>Requests</b>: a table of the school's requests; Compose Email goes to the site contact for each ticked request.</p>""")

# ── 5 Configuration ──────────────────────────────────────────────────────────
add(f"""<h2 id="s5">5. Email &amp; Notification configuration</h2>
<p>Opened from the gear at the bottom of the left sidebar (Site Configuration, School Configuration). A second panel lists the Notification group: <b>Email Setup</b>, <b>Email Templates</b>, <b>Attachment Templates</b> (Site only), <b>Notification Configuration</b>, <b>My Notifications</b>. A "Show changes" switch and a "What changed" button sit under it; they are a review aid (tags {tag('ref')} {tag('new')} {tag('ours')}) and are not part of the product.</p>
<h3>5.1 Email Setup {tag('ours')} {tag('ref', 'Display name: from reference')}</h3>
<p>Email Display Name (what recipients see as the sender); Default Reply-To (chips, add with Enter or comma, validated, duplicates rejected; templates can override it); Tenant Branding: logo upload (PNG, JPG or SVG, 2 MB max) and Footer / Disclaimer text (character count, appended to every outgoing email).</p>
<h3>5.2 Email Templates {tag('ref')}</h3>
<p><b>Two groups</b> in one list {tag('new')}: <i>Automated notifications</i> (emails the system sends when an event happens) and <i>Bulk Email</i> (templates people send by hand). Group bars are dark; under each, a category row (icon, label) then event rows with a count pill; the selected event is bold. The selection is in the URL (<code>?group=&amp;category=&amp;event=</code>).</p>
<p><b>Template cards</b> for the selected event, default first: name; badges Customized (indigo), Standard (outline), Default (green), and for Bulk the audience; the subject; actions Set as default (text link, hidden on the default), Preview (eye), Clone, Edit (pencil), Delete (trash); and a "Last updated by … · date" strip that expands the Edit history (Created, Edited, Set as default, Cloned from "…", with who and when).</p>
<p><b>Rules:</b></p>""")
add(ul([
    "Standard templates cannot be edited (tooltip: \"Standard templates cannot be edited. Clone to customize.\") or deleted (\"Standard templates cannot be deleted.\").",
    "A default cannot be deleted while others exist (\"Set another template as default before deleting this one.\").",
    "Set as default applies at once with the toast \"Default template updated.\"; the default moves to the top.",
    "<b>Add template</b> opens a dialog: \"Start from scratch\" or \"Or pick a template\" (a list of the event's templates as a base). \"Nothing is added until you save.\"",
    "<b>Clone</b> opens \"Clone template — Name the copy. Nothing is created until you confirm.\" with the name prefilled \"&lt;template name&gt; copy\" and Cancel / Clone; toast \"Template cloned.\"",
    "<b>Delete</b> asks \"Delete this template?\" with Cancel / Delete; toast \"Template deleted.\"",
    "<b>Preview</b> opens a dialog: \"Preview email. &lt;name&gt;. Sample values are filled in. Highlighted text comes from merge fields.\" The email is shown in the chosen header and footer with merged values highlighted yellow. Bulk templates are previewed through the merge engine with a sample recipient {tag('new')}.",
]))
add(f"""<p>Seeded Bulk Email templates are Standard; anything created or cloned is Customized. Edits to Bulk Email templates reach the compose panel {tag('new')}.</p>
<h3>5.3 Template editor {tag('ref', 'Full page: from reference')}</h3>
<p>A full page, not a modal. Header: back arrow, "Create template" / "Edit template" / "Template" (Standard, read-only with a banner), a Customized or Standard badge, <b>Preview</b>, <b>Save</b>, and a ⋮ menu with Delete. Then:</p>""")
add(ul([
    "<b>Template name</b> (new templates prefill \"&lt;Event&gt; template\") and a read-only <b>Category</b> (\"&lt;Category&gt; · &lt;Event&gt;\").",
    "<b>Bulk Email only</b> {tag('ours')}: Audience type (seven types) and Reply-to override (optional).".replace("{tag('ours')}", tag('ours')),
    "<b>The email frame:</b> the tenant header (logo or icon, display name) and the Exxat footer, per the chosen layout, around <b>Subject</b> and <b>Body</b> (rich text).",
    "<b>Type @</b> in the subject or body to open a floating list of merge fields, filtered as you type; picking one inserts <code>{{token}}</code> in place of the @ text.",
    "<b>Attachments:</b> drop zone or browse; PDF, DOC or image files, up to 10 MB each, up to 5 per template; file chips with remove. (The prototype keeps file names only.)",
    "<b>Template settings:</b> \"Set as default\" switch (on and disabled when already the default), and \"Header and footer layouts\" (five radios).",
    "<b>Merge fields:</b> for an automated email, the event's own fields as a two-column list with the <code>@token</code> shown; for Bulk Email, the full searchable catalogue {tag('new')}.",
    "<b>Links:</b> deep links as a list; they become hyperlinks in preview.",
    "<b>Edit history</b> at the bottom.",
    "Save needs a name, a subject and a body (\"Add a name, a subject and a body.\"); success toasts \"Template created.\" or \"Template saved.\" and returns to the list on the same event.",
]).replace("{tag('new')}", tag('new')))
add(f"""<h3>5.4 Notification Configuration {tag('ref')}</h3>
<p>Admin matrix. Title and subtitle "Configure in-app and email notifications for users." A <b>User</b> dropdown (role) and, at the right, <b>Recipients: &lt;summary&gt;</b> with an Edit link (for example "3 site admins, 1 external"). Table columns: Event, In app, Email, Preview. Category rows (icon, name) carry two channel checkboxes that set the whole category (indeterminate when mixed) and a lock control. <b>Messages</b> is permanently locked (a "Locked" badge, ticked and disabled). Other categories show an open or closed padlock; a locked category cannot be turned off by users in My Notifications. Event rows have the two checkboxes and an eye. Footer: "We may still send you important notifications about your account outside of the notification settings." and <b>Save Now</b> (toast "Notification settings saved.").</p>
<p><b>Recipients drawer:</b> right-hand sheet "Recipients — Who receives &lt;role&gt; notifications." with search, "Add external recipient" (email field and Add; validates; rejects duplicates), a checklist (external ones carry an "External recipient" badge; a user who has blocked all notifications is unticked, disabled and labelled), Cancel and Save (toast "Recipients updated.").</p>
<p><b>Notification preview:</b> eye opens "Notification preview" with the event name, a Standard or Customized badge, and two tabs. <i>In app</i>: a card with an "Update" label, avatar, sender, time and the title. <i>Email</i>: the default template for the event, rendered with sample values and highlights.</p>
<h3>5.5 My Notifications {tag('ref')}</h3>
<p>Personal version: "Control how you receive notifications. These preferences apply only to your account." Same categories and events with a one-line description each and In app and Email checkboxes; category rows carry the select-all checkboxes. A category an admin has locked shows a "Locked" badge ("These notifications are locked. You cannot turn them off.") with its boxes ticked and disabled; the lock state follows what the admin sets in Notification Configuration. <b>Save preferences</b> (toast "Preferences saved.").</p>
<h3>5.6 Attachment Templates {tag('ours')}</h3>
<p>Our existing screen, unchanged: dynamic documents (an editor with merge fields, validation that every field exists for the chosen audience) that the compose panel can generate per recipient. Site only.</p>
<h3>5.7 Roles, events and templates</h3>""")
roles = DATA["roles"]
add(table(["Portal", "Roles in the User dropdown"], [["Site", ", ".join(roles["site"]) + " (Preceptor sees one event)"], ["School " + "(new)", ", ".join(roles["school"]) + " (Clinical Instructor sees none of the limited set)"]]))
cats = {p: {c["id"]: c["label"] for c in DATA["categories"][p]} for p in ("site", "school")}
for portal in ("site", "school"):
    rows = []
    for ev in DATA["events"][portal]:
        who = ", ".join(ev["roles"]) if ev["roles"] else "All roles except " + ", ".join(DATA["limited"][portal])
        rows.append([cats[portal][ev["category"]], ev["label"], ev["description"], "Matrix + template" if ev["matrix"] else "Template only", who, ev["subject"]])
    add(f"<p><b>{portal.capitalize()} portal events</b> ({len(rows)}). \"Template only\" events have email templates but no row in the matrix (they are sent to the other party).</p>")
    add(table(["Category", "Event", "When", "Where it appears", "Receives", "Default subject"], rows))
fields = {}
for portal in ("site", "school"):
    for ev in DATA["events"][portal]:
        for f in ev["fields"] + ev["links"]:
            fields[f["token"]] = (f["label"], f["sample"])
add("<p><b>Merge fields for automated emails</b> (each event offers its own subset; sample value shown in previews):</p>")
add(table(["Token", "Label", "Sample value"], [["{{%s}}" % t, v[0], v[1]] for t, v in sorted(fields.items())]))

# ── 6 Differences ────────────────────────────────────────────────────────────
add(f"""<h2 id="s6">6. Differences</h2>
<h3>6.1 Notification area compared with the reference prototype</h3>
<p>The reference is https://exxat-notifications.pages.dev/ (Site portal only).</p>""")
add(table(["Area", "Reference", "This prototype", "Type"], [
    ["Configuration sidebar", "Full Configuration sidebar (Site Details, Availability Details, Program Partners and so on) around the Notification group, with NEW pills", "Notification group only; adds Attachment Templates; no NEW pills; a Show changes panel", "Changed"],
    ["Email Setup", "Display name only", "Display name plus default reply-to chips, tenant logo upload and footer text", tag('ours')],
    ["Notification Configuration", "Five roles; categories with lock and bulk toggles; Recipients drawer; In app and Email preview; Save Now", "Same", "Same"],
    ["Recipients drawer footer", "Save at the top right", "Cancel and Save in a footer", "Changed"],
    ["My Notifications", "Personal matrix with locked categories", "Same; lock state is read live from Notification Configuration", "Same"],
    ["Email Templates: events listed", "Four events (Slot Request Approved by Site, Slot Request Rejected by Site, Slots Assigned Directly by Site to School, Direct Schedule)", "Every notification event (Site 19, School 11) so each email has a template", "Changed"],
    ["Email Templates: layout", "Event list above the template cards", "Two columns on wide screens (list left, cards right); stacked on narrow", "Changed"],
    ["Email Templates: groups", "One list", "Two groups: Automated notifications and Bulk Email", tag('new')],
    ["Bulk Email templates", "Not present", "Same cards, rules, clone, default and history; seeded ones are Standard; edits reach the compose panel", tag('new')],
    ["Clone name", "Prefilled \"<event> copy\"", "Prefilled \"<template name> copy\"", "Changed"],
    ["Merge field display", "Fields appear inline as @FirstName", "Fields appear as {{firstName}} text; typing @ inserts the {{ }} form", "Changed (design to decide)"],
    ["Editor toolbar", "Paragraph style, bold, italic, underline, alignment, link, lists, indent, quote, undo, redo, image", "Bold, italic, underline, numbered and bullet lists, link, clear formatting", "Gap"],
    ["Bulk Email editor fields", "Not present", "Audience type, reply-to override, 106-field catalogue with search and groups, five deep links", tag('new')],
    ["Preview", "Sample values highlighted", "Same; Bulk templates use real sample records through the merge engine", "Same + " + "new"],
    ["Attachments", "Drop zone, 5 files, 10 MB", "Same limits; file names only (no real upload)", "Same"],
    ["School portal", "Not present", "All four sections with School events and roles", tag('new')],
]))
add("""<h3>6.2 School Partners compared with the design team's build</h3>
<p>Checked against https://exxat-shell-part1-1a.pages.dev/site/bedlam-hospital/partners. <b>In the design, not here:</b> Category as several chips with "+N more" (multi-select Partner Category); Edit opens an "Edit Category" panel with university name, alias and address read-only, a multi-select Partner Category and an Update button that enforces at least one category ("Select at least one category to save"); clicking the program contact or "+N" opens an "All Contacts" dialog with name, phone and email; a "4 categories" chip in the detail header; detail tabs About, Contracts, Engagement Log, Requests, Schedules (theirs other than About are placeholders). <b>Here, not in the design:</b> row checkboxes, the selection bar and Bulk Email; working filters (theirs are static); built Requests and Schedules tabs. <b>Smaller:</b> filter chip style, sample data, and Delete (here a coming-soon message, there nothing).</p>""")

# ── 7 Open items ─────────────────────────────────────────────────────────────
add("""<h2 id="s7">7. Open items and assumptions</h2>""")
add(ul([
    "<b>Notification Configuration only stores settings;</b> it does not yet decide what the system sends.",
    "<b>\"Set as default\" on a Bulk Email template</b> reorders and labels it; the compose panel does not preselect it yet.",
    "<b>School roles and events</b> (School Admin, Program Coordinator, Clinical Instructor, and the eleven School events) are assumptions to confirm with product.",
    "<b>Inline merge fields:</b> braces versus chips (@Name) needs a design decision. The editor toolbar is also narrower than the reference.",
    "<b>Seeded Bulk Email templates became Standard</b> (read-only; clone to customize). Confirm this is wanted.",
    "<b>Attachments</b> in the template editor keep file names only. Real upload is not built.",
    "<b>Jobs:</b> the Bulk Email button on the candidate list is not built; Jobs templates and a use-case sheet exist.",
    "<b>Contracts:</b> only counts exist per school; no contract records.",
    "<b>Sample-valued merge fields</b> (shift, days of week, cancellation reason, contract name and expiry, and others) need real sources in production; the merge-field workbook marks them.",
    "<b>Data</b> is in memory and resets on reload. Nothing is saved to a server.",
    "<b>Responsive and accessibility:</b> checked at about 1100 px wide; narrow screens and an accessibility pass are not done.",
    "<b>School Partners:</b> the multi-category Partner Category, Edit Category panel, All Contacts dialog, \"N categories\" chip and Engagement Log tab from the design team's build are not yet brought across.",
]))

# ── 8 Files ──────────────────────────────────────────────────────────────────
add("""<h2 id="s8">8. Files</h2>""")
add(table(["File", "What it is"], [
    ["Exxat_One_Prototype.html", "The whole working prototype in one file. Rebuild with node scripts/build-single-file.mjs."],
    ["Exxat_One_Prototype_Spec.html", "This document. Rebuild with scripts/build-prototype-spec.py."],
    ["Merge_Fields_Catalog.xlsx", "Every merge field, one sheet per Bulk Email screen."],
    ["Bulk_Email_Use_Cases.xlsx", "34 reviewed use cases with templates, per screen."],
    ["Bulk_Email_Use_Cases_Leadership_Review.xlsx", "Short version for leadership review."],
    ["src/app/components/email/", "Compose panel, history, merge-field list, rich-text editor."],
    ["src/app/components/notifications/", "The Configuration area: layout, pages, editor, previews, Show changes."],
    ["src/app/components/schedules/", "The shared Schedules list."],
    ["src/app/data/", "Mock data, merge engine (messageMerge.ts), merge-field catalogue, notification store."],
]))

html = f"""<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Exxat One prototype: handoff spec</title><style>{CSS}</style></head>
<body><main>
{''.join(parts)}
</main></body></html>
"""
out = ROOT / "Exxat_One_Prototype_Spec.html"
out.write_text(html)
print("wrote", out.name, f"{len(html) / 1000:.0f} KB")
