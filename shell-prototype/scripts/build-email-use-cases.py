#!/usr/bin/env python3
"""Builds Bulk_Email_Use_Cases.xlsx from the reviewed set (scripts/email_use_cases.py)
and the review of the first draft (scripts/review_v1.py, scripts/email_use_cases_v1.py).

Every merge field in every template is checked against the merge-field catalogue
(src/app/data/mergeFieldCatalog.ts) for that screen's portal and recipient type; the build
stops if one is not available there.

Run from the project root (needs openpyxl):  python3 scripts/build-email-use-cases.py
"""
import json
import re
import sys
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(Path(__file__).resolve().parent))
from email_use_cases import SURFACES, UC  # noqa: E402
from email_use_cases_v1 import UC as V1  # noqa: E402
from review_v1 import REVIEW  # noqa: E402

norm = lambda t: re.sub(r"[^a-z0-9]", "", t.lower())

# ── catalogue ────────────────────────────────────────────────────────────────
src = (ROOT / "src/app/data/mergeFieldCatalog.ts").read_text()
CAT = [json.loads(l.strip().rstrip(",")) for l in src.splitlines() if l.startswith('  {"token"')]
BY_TOKEN = {}
for f in CAT:
    BY_TOKEN.setdefault(norm(f["token"]), []).append(f)


def field_for(token, persona, portal):
    for f in BY_TOKEN.get(norm(token), []):
        if persona in f["audiences"] and portal in f["portals"]:
            return f
    return None


TOKEN_RE = re.compile(r"\{\{\s*([^#/}][^}]*?)\s*\}\}")
EACH_RE = re.compile(r"\{\{#each\s+([^}\s]+)\s*\}\}")


def tokens_in(text):
    toks = [t for t in TOKEN_RE.findall(text) if t.strip() != "this"]
    return list(dict.fromkeys(toks + EACH_RE.findall(text)))


# ── validate ─────────────────────────────────────────────────────────────────
problems, per_surface = [], {}
for u in UC:
    meta = SURFACES[u["surface"]]
    u["used"], u["sender"] = [], []
    for t in tokens_in(u["subject"] + "\n" + u["body"]):
        f = field_for(t, u["persona"], meta["portal"])
        if not f:
            problems.append(f'{u["surface"]} / {u["name"]}: {{{{{t}}}}} is not available for {u["persona"]} on the {meta["portal"]} portal')
            continue
        (u["sender"] if f["source"] == "author" else u["used"]).append(f)
    per_surface.setdefault(u["surface"], []).append(u)
assert set(per_surface) == set(SURFACES), set(SURFACES) ^ set(per_surface)
for s, items in per_surface.items():
    if not 3 <= len(items) <= 4:
        problems.append(f"{s}: {len(items)} use cases (want 3 or 4)")
if problems:
    print("\n".join(problems))
    sys.exit(1)
print("validated", len(UC), "templates across", len(SURFACES), "screens")

# ── numbers for the summary ──────────────────────────────────────────────────
kept = sum(1 for u in UC if u["change"] == "Kept as drafted")
sharp = sum(1 for u in UC if u["change"] == "Sharpened")
new_ = sum(1 for u in UC if u["change"].startswith("New"))
verdicts = Counter(v[1] for v in REVIEW.values())
mean_before = sum(sum(v[0]) for v in REVIEW.values()) / len(REVIEW)
mean_after = sum(u["score"] for u in UC) / len(UC)

# What replaced what (draft use case -> final), for the Replaced & Removed sheet.
REPLACED = [
    ("Site - Location Schedules", "Briefing for the people at the location", "Merged into 'Upcoming students: coverage heads-up' on Site - Location Personnel", "Site - Location Personnel", "Upcoming students: coverage heads-up"),
    ("Site - Location Schedules", "Location notice to placed students", "Invite finishing students to apply", "Site - Location Schedules", "Invite finishing students to apply"),
    ("Site - Partner Schedules", "Students who have not signed in", "Students not cleared to start (widened)", "Site - Partner Schedules", "Students not cleared to start"),
    ("Site - Partner Schedules", "Clinical instructor roster coordination", "Not replaced: three strong use cases beat four with a filler", None, None),
    ("Site - Location Personnel", "Announcement or policy update", "Requests waiting for your decision", "Site - Location Personnel", "Requests waiting for your decision"),
    ("Site - Location Personnel", "Sign in to Exxat One", "Not replaced: Resend Invite already covers sign-in for every persona", None, None),
    ("Site - Personnel", "Sign-in nudge for staff who have not logged in", "Confirm your capacity for the next block", "Site - Personnel", "Confirm your capacity for the next block"),
    ("School - Schedules", "First sign-in nudge", "Schedule change or cancellation notice", "School - Schedules", "Schedule change or cancellation notice"),
    ("Site - Personnel", "Confirm your details and locations", "Not replaced: data hygiene belongs in a product flow", None, None),
    ("Site - School Partners", "Open requests waiting on the school", "Status of your requests", "Site - School Partners", "Status of your requests"),
    ("Site - School Partners", "Partner announcement or term update", "Not replaced: a System Announcement template already exists", None, None),
    ("Site - Partner Contacts", "Contract renewal for this school", "Request not approved: reason and next steps", "Site - Partner Contacts", "Request not approved: reason and next steps"),
    ("Site - Partner Contacts", "Placement activity check-in", "Request not approved: reason and next steps", "Site - Partner Contacts", "Request not approved: reason and next steps"),
    ("Site - Jobs Candidates", "Offer", "Offer expiring soon: reminder", "Site - Jobs Candidates", "Offer expiring soon: reminder"),
    ("School - Schedules", "Heads-up to the site about incoming students", "Brief your clinical instructors", "School - Schedules", "Brief your clinical instructors"),
    ("School - Requests", "Request to change dates", "Withdraw requests we no longer need", "School - Requests", "Withdraw requests we no longer need"),
]
FINAL = {(u["surface"], u["name"]): u for u in UC}

# How we would know each one worked: one measurable signal per use case.
METRIC = {
    "Onboarding reminder": "Share of recipients Compliant within 7 days of the send.",
    "Rotation starting soon: where to go and who to see": "Fewer 'where / who' replies to coordinators in the 14 days before start.",
    "Preceptor heads-up for an incoming student": "Share of students with a confirmed, informed preceptor on day one.",
    "Schedule change or cancellation notice": "No-shows among affected students.",
    "Preceptor assignment confirmation": "Share of preceptors confirmed 5 days before the block.",
    "Day-one logistics for this location": "Day-one 'where do I go' calls to the location.",
    "Invite finishing students to apply": "Applications to jobs at the location from recipients; first hires from the cohort.",
    "Confirmed placements for the school": "School queries asking for a placement list.",
    "Students not cleared to start": "Share of listed students Compliant a week later; students who miss a start for onboarding.",
    "Placement change notice to the school": "Schools reporting they learned of a change from the student first.",
    "Upcoming students: coverage heads-up": "Coverage conflicts raised after the block starts.",
    "Action needed: assign preceptors and review placements": "Placements with no preceptor 7 days before start.",
    "Requests waiting for your decision": "Median days from request to decision; size of the pending backlog.",
    "Confirm your capacity for the next block": "Share of staff who reply before availabilities are posted; availabilities opened on time.",
    "Policy or compliance announcement (structured)": "Share of staff completing the stated action by the date.",
    "Start-of-term responsibilities refresher": "Requests decided and placements assigned in the first two weeks of term.",
    "Contract expiring: renewal reminder": "Contracts renewed before expiry; placements blocked by a lapsed contract.",
    "Status of your requests": "Fewer status-chasing emails and calls from schools.",
    "Confirm the program contacts on file": "Contacts corrected; recipients with no program contact.",
    "Request needs more information": "Days from 'info requested' to the school's reply.",
    "Request approved: next steps": "Days from approval to students being scheduled.",
    "Request not approved: reason and next steps": "Share of declined schools that submit a new request next term.",
    "Application received": "Applicants contacting recruiters to ask 'did you get my application'.",
    "Interview invitation": "Interview confirmation rate within 48 hours.",
    "Application status update": "Applicant complaints; reapplication rate.",
    "Offer expiring soon: reminder": "Offers accepted or answered before expiry.",
    "Remind students to onboard": "Share of recipients Compliant within 7 days of the send.",
    "Placement confirmed: what to expect": "Students arriving prepared; onboarding completed before the deadline.",
    "Brief your clinical instructors": "Instructors contacting not-cleared students before the start.",
    "Follow up on a pending request": "Days to decision on the requests chased.",
    "Responding to a request for more information": "Days from info request to reply.",
    "Withdraw requests we no longer need": "Slots released early; dead requests cleared from the backlog.",
    "Approved: thank you and next steps": "Days from approval to student details submitted.",
}
for u in UC:
    assert u["name"] in METRIC, u["name"]

MOMENTS = [
    ("Onboarding and access", ["Onboarding reminder", "Remind students to onboard", "Students not cleared to start", "Brief your clinical instructors"]),
    ("Before the rotation starts", ["Rotation starting soon: where to go and who to see", "Day-one logistics for this location", "Placement confirmed: what to expect", "Confirmed placements for the school", "Preceptor heads-up for an incoming student", "Upcoming students: coverage heads-up"]),
    ("Assignment and decisions", ["Confirm your capacity for the next block", "Preceptor assignment confirmation", "Action needed: assign preceptors and review placements", "Requests waiting for your decision"]),
    ("Change or cancellation", ["Schedule change or cancellation notice", "Placement change notice to the school"]),
    ("Requests", ["Request needs more information", "Request approved: next steps", "Request not approved: reason and next steps", "Status of your requests", "Follow up on a pending request", "Responding to a request for more information", "Withdraw requests we no longer need", "Approved: thank you and next steps"]),
    ("Contracts and contacts", ["Contract expiring: renewal reminder", "Confirm the program contacts on file"]),
    ("Staff communication", ["Policy or compliance announcement (structured)", "Start-of-term responsibilities refresher"]),
    ("Hiring and pipeline", ["Invite finishing students to apply", "Application received", "Interview invitation", "Application status update", "Offer expiring soon: reminder"]),
]

# ── workbook ─────────────────────────────────────────────────────────────────
from openpyxl import Workbook  # noqa: E402
from openpyxl.styles import Alignment, Border, Font, PatternFill, Side  # noqa: E402
from openpyxl.utils import get_column_letter  # noqa: E402

HEAD = PatternFill("solid", fgColor="1F3A8A")
GREEN = PatternFill("solid", fgColor="DCFCE7")
AMBER = PatternFill("solid", fgColor="FEF3C7")
RED = PatternFill("solid", fgColor="FEE2E2")
thin = Side(style="thin", color="D1D5DB")
BORDER = Border(top=thin, bottom=thin, left=thin, right=thin)
WRAP = Alignment(wrap_text=True, vertical="top")
MONO = Font(name="Consolas", size=10)


def head(ws, row, headers):
    for i, h in enumerate(headers, 1):
        c = ws.cell(row=row, column=i, value=h)
        c.font = Font(bold=True, color="FFFFFF")
        c.fill = HEAD
        c.border = BORDER
        c.alignment = Alignment(wrap_text=True, vertical="center")


def widths(ws, w):
    for i, x in enumerate(w, 1):
        ws.column_dimensions[get_column_letter(i)].width = x


def body_rows(ws, first_row):
    for row in ws.iter_rows(min_row=first_row):
        for c in row:
            c.alignment = WRAP
            c.border = BORDER


def tokens(fs):
    return "\n".join("{{%s}}  %s" % (f["token"], f["label"]) for f in fs) if fs else "—"


def score_text(u):
    return "V%d I%d F%d D%d R%d" % u["scores"] if u.get("scores") else "re-scored after the change"


wb = Workbook()

# 1 Summary
ws = wb.active
ws.title = "Summary"
ws["A1"] = "Bulk Email: the best 3 to 4 use cases for each place it appears"
ws["A1"].font = Font(bold=True, size=16, color="1F3A8A")
lines = [
    f"A first draft of {len(V1)} use cases was reviewed one by one against five tests. {kept} stand as drafted, {sharp} stand with a sharper template, and {len(REVIEW) - kept - sharp} were dropped or merged. {new_} new use cases, each scoring higher than what it replaced, took their place. The final set is {len(UC)} templates: 3 or 4 on each of the 10 screens.",
    f"Average score out of 25 rose from {mean_before:.1f} (first draft) to {mean_after:.1f} (final). Scores are judgement, not measured data; the How I Judged sheet says what would change them.",
    "",
    "What changed and why, in one line each",
    "• Two sign-in emails were removed because Resend Invite already exists in the portal for every persona. I had scored the first sign-in nudge 25 of 25 and called it the best use case: that judged the size of the problem, not whether Bulk Email is the right tool. The scoring now treats a native feature as a failure of Fit and Distinct.",
    "• Every use case that depended on a countdown field (days until start, days until deadline) lost it, because those fields go blank for the students already late, who are the people the email is for.",
    "• Three emails that were only a blank {{messageBody}} were removed or restructured: a template that is an empty box adds nothing.",
    "• Offers, date changes and contract renewals sent from the wrong screen were replaced: they are individual, negotiated or duplicated elsewhere.",
    "• 'Open requests waiting on the school' was framed backwards: Pending requests wait on the site (168 pending approvals), not the school. It became a status digest for the school, and a separate nudge went to the site's own coordinators.",
    "• New use cases connect the product's loops: finishing students are invited to apply (Jobs), not-cleared students are listed for schools and instructors (onboarding), and supervising staff are asked for capacity before availabilities are posted.",
    "",
    "How to read the workbook",
    "• How I Judged: the five tests, the bar, the evidence used, and what would change the scores.",
    "• Review Verdicts: all 40 first-draft use cases with their five scores, a verdict, and the argument.",
    "• Replaced & Removed: every use case that went, why, and what replaced it.",
    "• Final Set: the 34 that remain, with their score, what changed, and the existing prototype template each maps to.",
    "• Lifecycle Map: the moments in a placement that the final set covers.",
    "• One sheet per screen: the use cases with the argument for each, the exact clicks, the measure of success, and a paste-ready subject and body.",
    "",
    "Things to know",
    "• The prototype already ships 25 templates. Where a use case is the bulk form of one, the sheet names it; where it is new, it says so.",
    "• Two small merge-field additions support the new use cases: a 'students not cleared' list and a 'request status' list, plus open requests for site staff and the Jobs link for students.",
    "• Every merge field in every template was checked against the pruned merge-field list for that screen and recipient type, and every template was rendered against sample records.",
    "• The Jobs sheet covers a screen whose Bulk Email button is not built in this prototype yet.",
]
for i, t in enumerate(lines, 3):
    c = ws.cell(row=i, column=1, value=t)
    c.alignment = Alignment(wrap_text=True, vertical="top")
    if t in ("What changed and why, in one line each", "How to read the workbook", "Things to know"):
        c.font = Font(bold=True)
ws.column_dimensions["A"].width = 160

# 2 How I Judged
ws = wb.create_sheet("How I Judged")
head(ws, 1, ["Test", "The question", "Scores 1 when", "Scores 5 when"])
tests = [
    ("V  Volume and recurrence", "How many people receive it, and how often?", "A handful of recipients, once a year.", "Hundreds of recipients, every term or block."),
    ("I  Impact if not sent", "What goes wrong if this email is never sent?", "Nothing much.", "A placement fails, a contract lapses, a hire is lost, or a school leaves."),
    ("F  Fit for bulk", "Is it one message to many people, and is Bulk Email the right tool?", "Each send needs individual terms or text, or the portal already does it natively (for example Resend Invite).", "Same message, same structure, many people at once."),
    ("D  Distinct", "Is it a different email from one on another screen, and not a feature the portal already has?", "A copy of an email that already exists elsewhere, or of a native feature.", "Only makes sense on this screen."),
    ("R  Ready", "Do its merge fields exist, and do they work for the people who need it most?", "Depends on fields that are missing or go blank for the neediest recipients.", "Every field is real and reliable."),
]
for t in tests:
    ws.append(list(t))
ws.append([])
ws.append(["The bar", "A use case stays at 18 of 25 or above. Below that it is replaced, or removed if nothing better exists for the screen.", "", ""])
ws.append(["Sharpened", "A use case that clears the bar only after a template change is re-scored after the change and the change is stated.", "", ""])
ws.append(["Replacement rule", "Nothing is removed unless something stronger takes its place, or the screen is left with three strong use cases rather than four with a filler.", "", ""])
ws.append([])
ws.append(["Evidence used", "", "", ""])
for e in [
    "May 2026 baseline in the project notes: 168 requests pending approval, 47% approval rate (86 of 183), 792 ongoing schedules, 196 open availabilities.",
    "Native features that rule a use case out: Resend Invite for login exists for every persona. Known product gaps: faculty assignment is fully manual; there is no unified messaging inbox; Jobs launched but needs growth and is not integrated with rotation data.",
    "Live Site and School portals (surveyed October 2026): schedule rows often show no preceptor or clinical instructor; requests carry the statuses Approved, In Progress, Request Pending and Info Requested; the dashboard banner reads 'Turn today's students into tomorrow's hires'.",
    "The prototype's 25 seeded templates, to avoid proposing as new what already exists.",
]:
    ws.append(["", e, "", ""])
ws.append([])
ws.append(["Limits", "", "", ""])
for e in [
    "Scores are judgement. No send-volume data per use case exists yet, so Volume is reasoned from the placement lifecycle, not counted.",
    "The live survey covered one Site tenant and one School tenant, and the Jobs tab showed no jobs there. Jobs volume is therefore an assumption.",
    "To turn judgement into data: instrument Bulk Email so every send records its use case, then compare against the 'How we will know it worked' measure on each sheet.",
]:
    ws.append(["", e, "", ""])
for r in ws.iter_rows(min_row=2):
    for c in r:
        c.alignment = WRAP
for r in (1,):
    pass
for cell in ws["A"]:
    if cell.value in ("The bar", "Sharpened", "Replacement rule", "Evidence used", "Limits"):
        cell.font = Font(bold=True)
widths(ws, [28, 90, 44, 44])

# 3 Review Verdicts (first draft)
ws = wb.create_sheet("Review Verdicts")
head(ws, 1, ["Screen", "First-draft use case", "Recipient", "V", "I", "F", "D", "R", "Total /25", "Verdict", "Score after change", "The argument", "What happened"])
for u in V1:
    sc, verdict, after, arg, outc = REVIEW[(u["surface"], u["name"])]
    outcome = {"Keep": "Stays as drafted.", "Keep and sharpen": "Stays; template changed (see the screen's sheet)."}.get(verdict, outc)
    ws.append([u["surface"], u["name"], u["persona"], *sc, sum(sc), verdict, after if after else "—", arg, outcome])
    fill = {"Keep": GREEN, "Keep and sharpen": AMBER, "Replace": RED}[verdict]
    ws.cell(row=ws.max_row, column=10).fill = fill
body_rows(ws, 2)
for r in ws.iter_rows(min_row=2, min_col=4, max_col=9):
    for c in r:
        c.alignment = Alignment(horizontal="center", vertical="top")
widths(ws, [26, 44, 20, 4, 4, 4, 4, 4, 9, 16, 11, 100, 52])
ws.freeze_panes = "C2"
ws.auto_filter.ref = ws.dimensions
ws.append([])
ws.append(["", f"Verdicts: {verdicts['Keep']} kept, {verdicts['Keep and sharpen']} sharpened, {verdicts['Replace']} replaced. Average first-draft score {mean_before:.1f} of 25."])

# 4 Replaced & Removed
ws = wb.create_sheet("Replaced & Removed")
head(ws, 1, ["Screen", "Removed", "Its score", "Why it went", "Replaced by", "Replacement score", "Why the replacement is better"])
for surface, name, repl_text, rs, rn in REPLACED:
    sc, verdict, after, arg, outc = REVIEW[(surface, name)]
    if rs:
        f = FINAL[(rs, rn)]
        better = f["argument"]
        ws.append([surface, name, sum(sc), arg, f"{rn} ({rs})" if rs != surface else rn, f["score"], better])
    else:
        ws.append([surface, name, sum(sc), arg, repl_text, "—", "Nothing stronger exists for this screen, so it keeps three strong use cases."])
body_rows(ws, 2)
widths(ws, [26, 44, 9, 90, 48, 12, 100])
ws.freeze_panes = "C2"

# 5 Final Set
ws = wb.create_sheet("Final Set")
head(ws, 1, ["Screen", "#", "Use case", "Recipient", "Template section", "Change vs first draft", "Score /25", "Maps to prototype template", "How we will know it worked", "Subject", "Sheet"])
for s, items in per_surface.items():
    for n, u in enumerate(items, 1):
        ws.append([s, n, u["name"], u["persona"], u["section"], u["change"], u["score"], u["maps_to"], METRIC[u["name"]], u["subject"], s])
        ws.cell(row=ws.max_row, column=11).hyperlink = f"#'{s}'!A1"
        ws.cell(row=ws.max_row, column=11).font = Font(color="1D4ED8", underline="single")
body_rows(ws, 2)
widths(ws, [26, 4, 46, 22, 22, 30, 9, 52, 52, 66, 26])
ws.freeze_panes = "D2"
ws.auto_filter.ref = ws.dimensions

# 6 Lifecycle Map
ws = wb.create_sheet("Lifecycle Map")
head(ws, 1, ["Moment", "Use case", "Screen", "Recipient"])
seen = set()
for moment, names in MOMENTS:
    for name in names:
        for u in UC:
            if u["name"] == name:
                seen.add((u["surface"], name))
                ws.append([moment, name, u["surface"], u["persona"]])
assert len(seen) == len(UC), [(u["surface"], u["name"]) for u in UC if (u["surface"], u["name"]) not in seen]
body_rows(ws, 2)
widths(ws, [28, 56, 28, 22])
ws.freeze_panes = "A2"
ws.auto_filter.ref = ws.dimensions

# 7 Per-screen sheets
COLS = ["#", "Use case", "Change vs first draft", "Score /25", "Why it earns its place", "Maps to prototype template",
        "When it is used", "Who receives it", "How to use it in Bulk Email", "How we will know it worked",
        "Template section", "Recipient type", "Subject", "Body", "Merge fields used", "Sender fills in", "Notes"]
COL_W = [4, 28, 22, 10, 70, 38, 28, 28, 46, 36, 16, 18, 44, 70, 42, 30, 44]
for s, items in per_surface.items():
    meta = SURFACES[s]
    ws = wb.create_sheet(s)
    ws.append([meta["screen"]])
    ws["A1"].font = Font(bold=True, size=14, color="1F3A8A")
    for label, val in (("Portal", meta["portal"].capitalize()), ("Where", meta["where"]), ("Who can be emailed", meta["personas"]),
                       ("How selection works", meta["selection"]), ("Why these are the best", meta["final_logic"])):
        ws.append([label, val])
        ws.cell(row=ws.max_row, column=1).font = Font(bold=True)
        ws.merge_cells(start_row=ws.max_row, start_column=2, end_row=ws.max_row, end_column=6)
        ws.cell(row=ws.max_row, column=2).alignment = WRAP
        ws.row_dimensions[ws.max_row].height = 62 if label == "Why these are the best" else (34 if label == "How selection works" else 18)
    ws.append([])
    hr = ws.max_row + 1
    head(ws, hr, COLS)
    for n, u in enumerate(items, 1):
        ws.append([n, u["name"], u["change"], u["score"], u["argument"], u["maps_to"], u["when"], u["recipients"], u["how"], METRIC[u["name"]],
                   u["section"], u["persona"], u["subject"], u["body"], tokens(u["used"]), tokens(u["sender"]), u["notes"] or "—"])
        for c in ws[ws.max_row]:
            c.alignment = WRAP
            c.border = BORDER
        ws.cell(row=ws.max_row, column=13).font = Font(bold=True)
        for col in (14, 15, 16):
            ws.cell(row=ws.max_row, column=col).font = MONO
        ws.cell(row=ws.max_row, column=3).fill = GREEN if u["change"] == "Kept as drafted" else (AMBER if u["change"] == "Sharpened" else PatternFill("solid", fgColor="DBEAFE"))
    widths(ws, COL_W)
    ws.freeze_panes = ws.cell(row=hr + 1, column=3)

order = ["Summary", "How I Judged", "Review Verdicts", "Replaced & Removed", "Final Set", "Lifecycle Map"] + list(per_surface)
wb._sheets = [wb[n] for n in order]
wb.active = 0
out = ROOT / "Bulk_Email_Use_Cases.xlsx"
wb.save(out)
print("workbook ->", out.name, f"| kept {kept}, sharpened {sharp}, new {new_}, final {len(UC)}")
