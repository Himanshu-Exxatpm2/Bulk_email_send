# The reviewed set: the best 3 to 4 Bulk Email use cases for each of the 10 screens.
#
# Built on the first draft (email_use_cases_v1.py) after the review in review_v1.py:
#   keep      the draft stands as written
#   sharpen   same use case, template changed (the change is stated)
#   new       replaces weaker draft use cases (scores in the review show it is stronger)
#
# Each entry also carries: why it earns its place, the prototype template it maps to (or "net new"),
# and a judgement score out of 25 (V volume, I impact, F fit for bulk, D distinct, R ready).
# Rules for what makes a use case stay: see review_v1.py.

from email_use_cases_v1 import SURFACES as _S, UC as V1
from review_v1 import REVIEW

SIGN = "\n\nThank you,\n{{senderName}}\n{{senderOrganization}}"
SURFACES = {k: dict(v) for k, v in _S.items()}

# What the final three or four on each screen are, and what was dropped.
SURFACES["Site - Schedules"]["final_logic"] = "All four first-draft use cases passed the bar. The screen is the product's busiest, and these four cover a student's whole path: get cleared, know where to go, have a prepared preceptor, hear about changes. Three templates were sharpened so they no longer depend on a countdown that goes blank for the people who most need the email."
SURFACES["Site - Location Schedules"]["final_logic"] = "Two of four dropped as duplicates (a staff briefing already on the Personnel screen, and a location notice that the schedule change notice already covers). Arrival logistics stay because only a location coordinator can write their own parking and badge details. The new third use case turns finishing students into applicants, which is the Jobs module's whole pitch."
SURFACES["Site - Partner Schedules"]["final_logic"] = "The weakest draft (instructor roster) went. 'Students who have not signed in' was widened into 'not cleared to start', because a signed-in student can still be blocked. Three strong use cases rather than four with a filler."
SURFACES["Site - Location Personnel"]["final_logic"] = "A bare announcement and a sign-in email (Resend Invite already covers sign-in) went. They were replaced by the single email that addresses the site's biggest operational problem: requests waiting for a decision, the backlog schools feel most."
SURFACES["Site - Personnel"]["final_logic"] = "The sign-in nudge went: Resend Invite already exists for every persona, so it duplicated the product. In its place is a per-term capacity request, the email that starts the whole workflow (no supervisor commitment, no availability). The announcement was restructured so it is a template, not an empty box, and the refresher now asks staff to act. 'Confirm your details' was removed and not replaced: data hygiene belongs in a product flow."
SURFACES["Site - School Partners"]["final_logic"] = "Contract renewal and contact verification stay. The draft's 'open requests waiting on the school' was wrongly framed (pending requests wait on the site), so it became a status digest the school can actually use. The bare announcement was removed."
SURFACES["Site - Partner Contacts"]["final_logic"] = "Two request emails stay. A duplicate renewal and a vague check-in were replaced by the email that matters most when 53% of requests are not approved: explaining a decline and what to try next."
SURFACES["Site - Jobs Candidates"]["final_logic"] = "Application received, interview invitation and status update are the true bulk emails of hiring. 'Offer' was replaced because offers carry individual terms; what is bulk is chasing offers that are about to expire."
SURFACES["School - Schedules"]["final_logic"] = "The first sign-in nudge went: Resend Invite already covers sign-in for every persona, so it duplicated the product (I had scored the size of the problem, not the right tool). The remaining two student emails attack onboarding and placement details directly, and a change notice replaces the sign-in email. 'Heads-up to the site' was replaced by briefing the school's own clinical instructors on who is not cleared, which is the school's real blind spot."
SURFACES["School - Requests"]["final_logic"] = "Follow-up on pending requests is the strongest, tied to the 168-request backlog. Date changes were replaced by withdrawing requests no longer needed, which is genuinely bulk at the end of a term."

_base = {(u["surface"], u["name"]): u for u in V1}
UC = []


def keep(surface, draft, why, maps_to, **override):
    """A first-draft use case, unchanged or sharpened. `why` is the argument for keeping it."""
    u = dict(_base[(surface, draft)])
    scores, verdict, after, _arg, _out = REVIEW[(surface, draft)]
    u.update(override)
    u.pop("why", None)  # the draft's usage line; the argument below replaces it
    u.update(argument=why, maps_to=maps_to, change="Kept as drafted" if verdict == "Keep" else "Sharpened",
             score=sum(scores) if verdict == "Keep" else after, scores=scores if verdict == "Keep" else None, first_draft=draft)
    UC.append(u)


def new(surface, name, persona, section, when, recipients, how, why, maps_to, replaces, scores, subject, body, notes=""):
    """A use case that replaces weaker draft ones. `why` is the argument for including it."""
    UC.append(dict(surface=surface, name=name, persona=persona, section=section, when=when, recipients=recipients, how=how,
                   argument=why, maps_to=maps_to, change="New, replaces " + replaces, score=sum(scores), scores=scores,
                   first_draft=None, subject=subject, body=body, notes=notes))


# Template wording changes used in more than one place.
_S1_BODY = """Hi {{firstName}},

Your clinical rotation, {{rotationName}} at {{locationName}}, starts on {{startDate}}. Your onboarding must be complete by {{onboardingDeadline}} so you can start on time.

Current status: {{onboardingStatus}}

Still outstanding:
{{#each outstandingItems}}• {{this}}<br>{{/each}}

Sign in to finish these items: {{loginUrl}}

If that date has already passed, please finish as soon as you can and reply to this email so we can confirm your start date. If you have already submitted something, allow a few business days for review.""" + SIGN

# ═════════════════════════ SITE: SCHEDULES ═════════════════════════
S = "Site - Schedules"
keep(S, "Onboarding reminder",
     "Onboarding gates every start, and a large group of students is always behind on it. Same message to everyone behind, so it is bulk by nature, and the cost of silence is a student who cannot start.",
     "Incomplete Documents Reminder (Onboarding). This adds the personalised outstanding list the template lacks.",
     body=_S1_BODY,
     notes="Filter to students who are not Compliant first; a Compliant student would get an empty outstanding list. No countdown, so students past the deadline are not held back.")
keep(S, "Rotation starting soon: where to go and who to see",
     "Highest recipient count on the screen: every placement needs it, per start date. It removes the most repeated student question (where, when, who). Bulk per start date saves coordinators from answering one by one.",
     "Rotation Starting Soon (Schedules). This fills in shift, address, preceptor and coordinator.",
     subject="Your rotation starts {{startDate}}: {{rotationName}}",
     body="""Hi {{firstName}},

Your rotation starts on {{startDate}}. Here is what you need.

Dates: {{scheduleDateRange}}
Shift: {{shift}} on {{daysOfWeek}}
Where: {{locationName}}, {{locationDepartment}}
Address: {{locationAddress}}
Front desk: {{locationPhone}}

Your preceptor: {{preceptorName}} ({{preceptorEmail}})
Site coordinator: {{locationCoordinators}} ({{locationCoordinatorEmail}})

Please arrive 15 minutes early on your first day and bring photo ID.""" + SIGN,
     notes="Subject and body use the start date, not a countdown, so the email still works for students who have just started. Shift and days of week are sample values in the prototype; production reads them from the schedule.")
keep(S, "Preceptor heads-up for an incoming student",
     "Live schedule rows often show no preceptor, and an unprepared preceptor is the commonest day-one failure. One heads-up per student start removes the 'nobody told me' problem, and it is the same message for every preceptor.",
     "Schedule Published — Preceptor Assignment (Schedules). This adds the student, dates and the preceptor's current students.",
     subject="Student assigned to you from {{scheduleDateRange}}: {{assignedStudentName}}",
     body="""Hi {{firstName}},

{{assignedStudentName}} from {{assignedStudentSchool}} will start with you on {{scheduleDateRange}} ({{assignedScheduleRef}}).

Schedule: {{shift}} on {{daysOfWeek}}
Where: {{locationName}}, {{locationDepartment}}
Clinical instructor: {{clinicalInstructorName}}

All your current students:
{{#each studentSchedules}}• {{this}}<br>{{/each}}

Questions or a conflict? Contact {{locationCoordinators}} at {{locationCoordinatorEmail}}.""" + SIGN)
keep(S, "Schedule change or cancellation notice",
     "Changes come in clusters (a unit closes, a preceptor leaves), so the same message goes to many students. The cost of one student not knowing is a no-show at a clinical site. Live data shows Canceled schedules with reasons.",
     "Schedule Updated (Schedules).")

# ═════════════════════════ SITE: LOCATION SCHEDULES ═════════════════════════
S = "Site - Location Schedules"
keep(S, "Preceptor assignment confirmation",
     "Unconfirmed assignments are the main reason a student arrives to nobody expecting them. A single confirm-by-reply request to all preceptors at a location closes the gap before the block starts.",
     "Net new (closest: Schedule Published — Preceptor Assignment).")
keep(S, "Arrival-day instructions for everyone placed at the location",
     "Every location has its own parking, badge and dress-code rules, and only its coordinator can write them. This is the one email the all-site screen cannot send, because the practical details differ by location.",
     "Net new (location-specific; Rotation Starting Soon covers the generic details).",
     name="Day-one logistics for this location",
     subject="Day one at {{locationName}}: what to know before you arrive",
     body="""Hi {{firstName}},

Welcome to {{locationName}}. You start on {{startDate}} with {{preceptorName}}.

Report to: {{locationDepartment}}, {{locationAddress}}
Your hours: {{shift}} on {{daysOfWeek}}
Site coordinator: {{locationCoordinators}} ({{locationCoordinatorEmail}})

Before you arrive, please have ready:
[Add badge pick-up, parking, dress code and EHR access details for this location]

If anything blocks you on the day, call {{locationPhone}}.""" + SIGN,
     notes="The bracketed line is plain text for the coordinator to complete; it is the reason this email lives on the location screen.")
new(S, "Invite finishing students to apply", "Student", "Jobs",
    "As placements end, to students who worked at the location.",
    "Students on completed (or ending) schedules at this location.",
    "Locations > open the location > Schedules > Completed tab > Select all > Bulk Email > Compose Email > tick Students.",
    "The product's own pitch is 'turn today's students into tomorrow's hires', but nothing connects a finished placement to an open job. Students who have already worked on the unit are the cheapest, best-fit hires, and the Jobs module launched but needs growth. One email per cohort ending turns placements into a hiring pipeline. Jobs is not yet integrated with rotation data (a known gap), so this is how the two are joined today.",
    "Net new (Jobs section; nothing in the prototype links students to jobs).",
    "'Location notice to placed students'", (3, 5, 5, 5, 4),
    "Your rotation at {{locationName}} is ending: consider joining us",
    """Hi {{firstName}},

Thank you for your work during {{rotationName}} at {{locationName}}, which ends on {{endDate}}. {{preceptorName}} and the team enjoyed having you with us.

{{hospitalName}} is hiring, and as a student who has already worked with our teams you can apply directly.

See open roles and apply: {{jobsPortalUrl}}

If you have questions about working at {{locationName}}, reply to this email.""" + SIGN,
    "Pair with a live job posting. The Jobs tab on the surveyed Site tenant showed no jobs, so check there is at least one open role before sending.")

# ═════════════════════════ SITE: PARTNER SCHEDULES ═════════════════════════
S = "Site - Partner Schedules"
keep(S, "Confirmed placements for the school",
     "Schools plan staffing and term calendars around confirmed placements, and the message is identical for every contact. It acts as a per-term roll-up on top of the platform's own confirmations.",
     "Schedule Confirmed (Schedules), sent to the school as a roll-up.")
new(S, "Students not cleared to start", "School Contact", "Onboarding",
    "A few weeks before a block, and again a week before.",
    "The school's program contacts.",
    "School Partners > open the school > Schedules > Upcoming > Bulk Email > Compose Email > tick Schools.",
    "Onboarding is the single biggest cause of a student not starting, and the school is the only party who can chase its students. Sign-in is already handled by Resend Invite, and a signed-in student can still be non-compliant, so the draft's 'not signed in' email missed most of the problem. One list of every blocked student with their status gives the school exactly what to chase.",
    "Non-Compliant Student Alert (Schedules & Onboarding, school side). This is its site-to-school counterpart.",
    "'Students who have not signed in' (widened)", (5, 5, 5, 4, 4),
    "{{schoolName}}: students not cleared to start",
    """Hi {{firstName}},

These {{schoolName}} students have an upcoming or current placement but have not finished onboarding. They cannot start until they are cleared:

{{#each studentsNotCleared}}• {{this}}<br>{{/each}}

Could you follow up with them? They can complete what is left at {{loginUrl}}.""" + SIGN,
    "The list shows up to 12 students; the full list is in Exxat One.")
keep(S, "Placement change notice to the school",
     "The school must hear about a change before its students do, or it cannot support them. Changes cluster, so one message covers many students.",
     "Net new for schools (Schedule Updated goes to students).")

# ═════════════════════════ SITE: LOCATION PERSONNEL ═════════════════════════
S = "Site - Location Personnel"
keep(S, "Upcoming students: coverage heads-up",
     "Staff need advance notice to plan capacity, it recurs every block, and the same list goes to every person at the location. It also absorbs the staff briefing the Location Schedules screen used to carry.",
     "Staff Notification (General), with the student list added.")
keep(S, "Action needed: assign preceptors and review placements",
     "Assignment is the step most often left to the last week, and live schedule rows show many with no preceptor. A coordinator-targeted prompt is the lever that fixes it before the block starts.",
     "Net new (closest: Staff Notification).",
     notes="The list shows the placements at the location; it cannot filter to unassigned ones, so the wording asks the coordinator to review all of them.")
new(S, "Requests waiting for your decision", "Staff-Personnel", "Slot Requests",
    "Weekly, or whenever requests have been open for several days.",
    "Coordinators at the location (use the role chips).",
    "Locations > open the location > Personnel > tick the coordinator chips > Bulk Email > Compose Email.",
    "The site's biggest operational backlog is its own: 168 requests pending approval and a 47% approval rate at the May baseline. Every one of those is a school waiting on a coordinator. A weekly list to the people who can decide, showing exactly what is waiting at their location, is the highest-leverage nudge a site can send, and it directly shortens the schools' wait that School - Requests tries to chase from the other side.",
    "Net new (no site-side template covers it).",
    "'Announcement or policy update' and 'Sign in to Exxat One' (Resend Invite covers sign-in)", (4, 5, 5, 5, 4),
    "Action needed: requests waiting for a decision at {{locationName}}",
    """Hi {{firstName}},

As {{role}} for {{locationName}}, these slot requests from schools are waiting for a decision:

{{#each openRequests}}• {{this}}<br>{{/each}}

Pending requests hold up a school's whole term. Please approve, decline or ask for more information: {{portalUrl}}""" + SIGN,
    "The list shows up to 12 requests at the location; it covers Pending and Info Requested.")

# ═════════════════════════ SITE: PERSONNEL ═════════════════════════
S = "Site - Personnel"
new(S, "Confirm your capacity for the next block", "Staff-Personnel", "General",
    "A few weeks before each rotation block or term, before availabilities are posted.",
    "Preceptors and coordinators, filtered by Role.",
    "Personnel > filter Role = Clinical Preceptor or Clinical Coordinator > Select all > Bulk Email > Compose Email.",
    "Everything in Exxat One starts with a site posting an availability, and an availability only works if a named person has committed to supervise. Asking staff for their capacity is a per-term chore that falls on whoever builds the next block, with no feature behind it today (a Request Availability template exists but only as a manual send). The answer decides how many of the 196 open availabilities can be filled, so an unanswered request means placements the site never offers.",
    "Request Availability (General, Preceptor). This is its bulk form for all supervising staff.",
    "'Sign-in nudge for staff who have not logged in' (Resend Invite already covers sign-in)", (4, 5, 5, 4, 4),
    "Can you supervise students next block? Please confirm",
    """Hi {{firstName}},

We are planning the next rotation block at {{senderOrganization}}. You are listed as {{role}} in {{department}}, linked to:

{{associatedLocations}}

Please reply with:
• Whether you can take students next block, and how many
• Any dates you are unavailable
• Anything that has changed at your location or unit

We use your answers to open availabilities for schools, so a quick reply helps us fill the block.""" + SIGN,
    "Replies come by email; the product has no unified inbox, so name one person to collect them.")
keep(S, "Policy or compliance announcement",
     "The most common general email a site sends. Restructured so it is a template, not an empty box: what changed, what you must do, by when. That structure is what makes staff act on it.",
     "Staff Notification (General), with structure added.",
     name="Policy or compliance announcement (structured)",
     subject="[Topic]: update from {{senderOrganization}}",
     body="""Hi {{firstName}},

What has changed:
{{messageBody}}

What you need to do:
[Add the action]

By when:
[Add the date]

If you have questions, reply to this email.""" + SIGN,
     notes="{{messageBody}} is written by the sender; the bracketed lines are plain text to complete.")
keep(S, "Start-of-term responsibilities refresher",
     "Roles change and new staff join every term. Sharpened to ask for the two actions that matter, so it is a prompt to act rather than a reminder to read.",
     "Net new.",
     body="""Hi {{firstName}},

A reminder before the new term. You are set up as {{role}} in {{department}}, linked to:

{{associatedLocations}}

Please do two things this term:
• Review requests waiting for your decision
• Make sure every placement has a preceptor

You can do both in Exxat One: {{portalUrl}}""" + SIGN)

# ═════════════════════════ SITE: SCHOOL PARTNERS ═════════════════════════
S = "Site - School Partners"
keep(S, "Contract expiring: renewal reminder",
     "The strongest relationship email. An expired contract blocks placements, and renewal is revenue, so losing one to a missed date is expensive. It runs on a calendar (90, 60, 30 days), so volume is predictable and the message is identical.",
     "Net new (closest: System Announcement).")
new(S, "Status of your requests", "School Contact", "Slot Requests",
    "Every term, or on request from the school.",
    "Program contacts of schools with recent requests.",
    "School Partners > tick schools > Bulk Email > Compose Email > tick Schools.",
    "Schools do not need chasing about the site's backlog; they need to know where each of their requests stands. With 47% of requests not approved at the May baseline, schools are often guessing. One digest with every request and its status (approved, pending, info requested, declined) answers the question that otherwise arrives as dozens of individual emails and calls, and there is no unified inbox to absorb them.",
    "Net new (closest: Pending Request Follow-up, which is school-to-site).",
    "'Open requests waiting on the school'", (4, 5, 5, 4, 4),
    "Status of {{schoolName}}'s requests with {{senderOrganization}}",
    """Hi {{firstName}},

Here is where each of {{schoolName}}'s requests stands:

{{#each requestStatuses}}• {{this}}<br>{{/each}}

Requests marked Info Requested need a reply from you. Pending requests are with our team and we will update you as decisions are made. You can open any request in Exxat One: {{portalUrl}}""" + SIGN,
    "The list shows up to 12 requests.")
keep(S, "Confirm the program contacts on file",
     "Stale contacts are the root of missed emails, and every Bulk Email on this screen depends on them. Verified contacts also reduce how often the no-program-contact fallback is needed.",
     "Net new.")

# ═════════════════════════ SITE: PARTNER CONTACTS ═════════════════════════
S = "Site - Partner Contacts"
keep(S, "Request needs more information",
     "The most common reason a request does not move is a missing answer. Info Requested is a live status, and an Additional Info Needed template already exists, so this is the proven bulk form.",
     "Additional Info Needed (Slot Requests).")
keep(S, "Request approved: next steps",
     "Every approval is followed by the school scheduling students, and a next-steps note speeds that. Same structure for every approval.",
     "Slot Request Approved (Slot Requests).")
new(S, "Request not approved: reason and next steps", "School Contact", "Slot Requests",
    "When a request is declined or cannot be accommodated.",
    "The contacts at the school that raised the request.",
    "School Partners > open the school > About > tick the contacts > Bulk Email > Compose Email.",
    "At the May baseline 47% of requests were approved, so more than half end without a yes. How a site says no decides whether the school tries again or goes elsewhere, which is renewal risk. A consistent, courteous message that gives the reason and a path forward protects the relationship, and it replaces the vague 'check-in' and duplicate renewal that were here.",
    "Slot Request Declined (Slot Requests). This adds a structured reason and next-step prompt.",
    "'Contract renewal for this school' and 'Placement activity check-in'", (4, 5, 4, 4, 4),
    "Update on request {{requestId}}: not approved this time",
    """Hi {{firstName}},

We were unable to approve request {{requestId}} ({{programType}} at {{requestedLocation}}, {{startDate}} to {{endDate}}).

Reason:
{{messageBody}}

What you can try next:
[Suggest alternative dates, locations or programs]

You can submit a new request in Exxat One: {{portalUrl}}. We value our partnership with {{schoolName}} and want to help find a placement that works.""" + SIGN,
    "{{messageBody}} is written by the sender. Request details come from the school's latest request.")

# ═════════════════════════ SITE: JOBS CANDIDATES ═════════════════════════
S = "Site - Jobs Candidates"
keep(S, "Application received",
     "Every applicant should hear back at once, and recruiters send it in batches after a posting goes live. Low risk, high recipient count, and an Application Received template already exists.",
     "Application Received (Jobs).")
keep(S, "Interview invitation",
     "Interviews run in rounds and a missed invitation loses a hire. The same structure goes to a whole shortlist.",
     "Interview Invitation (Jobs).")
keep(S, "Application status update",
     "The highest-volume hiring email: most applicants for any job are not hired, and silence damages the employer brand. Same message, no individual terms, so it is the purest bulk case in hiring.",
     "Net new (Application Received and Interview Invitation do not cover rejection or progress).")
new(S, "Offer expiring soon: reminder", "Candidate", "Jobs",
    "A few days before outstanding offers expire.",
    "Candidates with an offer that has not yet been accepted.",
    "Jobs > open a job > Applicants > filter Stage = Offer > Bulk Email > Compose Email.",
    "Offers themselves carry individual terms and legal weight, so sending compensation in bulk is the wrong default (an Offer Letter template exists for individual sends). What is genuinely bulk is chasing offers that are about to expire. After a new-graduate hiring wave many offers share an expiry date, and a lapsed offer is a lost hire the employer already paid to recruit.",
    "Net new (Offer Letter is the individual send).",
    "'Offer'", (3, 5, 4, 4, 4),
    "Your offer for {{jobTitle}} expires on {{offerExpirationDate}}",
    """Hi {{firstName}},

A reminder that our offer for {{jobTitle}} at {{hospitalName}}, {{jobLocation}}, expires on {{offerExpirationDate}}.

To accept, or to ask any questions before then, please reply to this email. If your circumstances have changed, let us know and we will do our best to help.

{{recruiterName}} is your contact for next steps.""" + SIGN,
    "Expiry date and recruiter are written by the sender at send time.")

# ═════════════════════════ SCHOOL: SCHEDULES ═════════════════════════
S = "School - Schedules"
keep(S, "Remind students to onboard",
     "The school's main blocker and its most repeated nudge. It mirrors the portal's Remind to Onboard action, goes to every student who is behind, and has no countdown fields, so overdue students are not held back.",
     "Incomplete Documents Reminder (Onboarding).")
new(S, "Schedule change or cancellation notice", "Student", "Schedules & Onboarding",
    "When a placement is moved, shortened or canceled.",
    "Students on the schedules that changed.",
    "Schedules > filter to the affected schedules (for example Schedule Status = Canceled) > Select all > Bulk Email > Compose Email > tick Students.",
    "Students hear about changes from their school first, and the live schedule list shows Canceled placements with a reason (for example the student withdrew or was ineligible). A cohort loses a placement together when a site pulls out or a unit closes, so the same message goes to many students. The cost of one student not knowing is a no-show at a clinical site, and nothing else in the school portal's set tells students a placement has changed.",
    "Schedule Updated (Schedules), as the school's version to students.",
    "'First sign-in nudge' (Resend Invite already covers sign-in)", (3, 5, 4, 4, 4),
    "Update to your clinical placement: {{rotationName}}",
    """Hi {{firstName}},

There is a change to your placement at {{siteName}}, {{rotationName}}.

What changed:
{{changeDescription}}

Current status: {{scheduleStatus}}

Your clinical instructor, {{clinicalInstructorName}}, can help with any questions, or reply to this email. We will confirm any new details as soon as they are final.""" + SIGN,
    "{{changeDescription}} is written by the sender at send time. Put new dates inside it when a placement is rescheduled.")
keep(S, "Placement confirmed: what to expect",
     "Every confirmed student needs the same set of details in one message, which is exactly what a bulk send is for. It pairs with the portal's Confirm Students action.",
     "Student Placed — Start Onboarding (Schedules & Onboarding).")
new(S, "Brief your clinical instructors", "Placement Faculty/CI", "Schedules & Onboarding",
    "At the start of each block, to the school's instructors.",
    "The school's placement faculty and clinical instructors.",
    "Schedules > select the schedules > Bulk Email > Compose Email > tick Placement Faculty / CI.",
    "Faculty assignment is fully manual and instructors are the school's link to students on site, yet they have no single view of who is placed and who is blocked. One message with the roster and the students not cleared lets them chase the right people. The draft's 'heads-up to the site' told the site what it already sees on its own schedule list.",
    "Rotation Schedule Published — Faculty (Schedules). This adds who is not cleared.",
    "'Heads-up to the site about incoming students'", (4, 4, 4, 4, 4),
    "Your students this block: who is placed and who is not cleared",
    """Hi {{firstName}},

Your roster ({{studentRosterRef}}) has these placements:

{{#each studentSchedules}}• {{this}}<br>{{/each}}

Not yet cleared to start:
{{#each studentsNotCleared}}• {{this}}<br>{{/each}}

Please check in with these students before they start. Details are in Exxat One: {{portalUrl}}""" + SIGN,
    "Lists show up to 12 students each.")

# ═════════════════════════ SCHOOL: REQUESTS ═════════════════════════
S = "School - Requests"
keep(S, "Follow up on a pending request",
     "With 168 requests pending approval and a 47% approval rate at the May baseline, schools wait on decisions that gate their whole term. A Pending Request Follow-up template already exists, and the same chase applies to many requests at once.",
     "Pending Request Follow-up (Requests).")
keep(S, "Responding to a request for more information",
     "Info Requested is a live status and the request stalls until the school answers, so the reply is time-sensitive and recurs. Fit for bulk is moderate because the answer is written per request.",
     "Net new (Additional Info Needed is the site's ask).")
new(S, "Withdraw requests we no longer need", "School Contact", "Requests",
    "When a term changes and several requests are no longer needed.",
    "The site contact on each request being withdrawn.",
    "Requests > tick the requests to withdraw > Bulk Email > Compose Email.",
    "Date changes (the draft) are negotiated one request at a time and are not bulk. What is bulk is clearing out requests a school no longer needs when a cohort shrinks or a term moves. It frees slots for other schools and removes dead items from the site's 168-request backlog, which helps the site and the school.",
    "Net new.",
    "'Request to change dates'", (3, 4, 4, 5, 4),
    "Withdrawing request {{requestId}}",
    """Hi {{firstName}},

We would like to withdraw request {{requestId}} ({{requestedSlots}} {{programType}} slots at {{requestedLocation}}, {{startDate}} to {{endDate}}).

Reason:
{{messageBody}}

Thank you for considering it. We hope to work with you again next term.""" + SIGN,
    "{{messageBody}} is written by the sender at send time.")
keep(S, "Approved: thank you and next steps",
     "Sharpened so it commits the school to a date for student details, which is what the site wants from it. A request approved is only half done until the students are named.",
     "Request Approved — Notify Coordinator (Requests).")
