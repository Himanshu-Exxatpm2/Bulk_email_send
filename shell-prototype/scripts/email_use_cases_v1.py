# FIRST DRAFT (40 use cases), kept so the review can show what was judged. The current set is email_use_cases.py.
# build-email-use-cases.py validates every merge field against the merge-field catalogue
# for that screen's portal and recipient type, then writes Bulk_Email_Use_Cases.xlsx.
#
# Rules used to choose and write them:
#  1. Pick moments in the placement lifecycle that repeat every term for many people at once
#     (onboarding, start of rotation, assignment, change, contract, request follow-up, access, hiring).
#  2. One recipient type per template (templates, merge fields and history are per type).
#  3. Only merge fields the screen really offers for that recipient type.
#  4. Greet with {{firstName}}. On request screens the school-contact name field points at the
#     school's primary contact, which is wrong when the recipient is someone else.
#  5. Where a school contact is emailed from a Schedules screen, per-student detail comes from the
#     {{studentSchedules}} list, never {{locationName}} / {{rotationName}}, which resolve from the
#     school's latest request and can belong to a different placement.

SIGN = "\n\nThank you,\n{{senderName}}\n{{senderOrganization}}"

SURFACES = {
    "Site - Schedules": dict(portal="site", screen="Schedules (Group and Individual views)", where="Schedules > Schedules List",
        personas="Students, Preceptors, Site Personnel, School contacts, Placement Faculty / CI",
        selection="Filter the list (status, onboarding, discipline, school), tick the rows, then Bulk Email > Compose Email. Tick one or more personas on the left; their recipients are added from the selected schedules.",
        thinking="This is the busiest screen: one row per student placement. The emails that go out in volume are the ones tied to a student's journey: onboarding chase, start-of-rotation details, the preceptor's heads-up, and change notices. Bulk Email is hidden under All Schedules, so every use case starts from Group or Individual."),
    "Site - Location Schedules": dict(portal="site", screen="Location > Schedules tab", where="Locations > a location > Schedules",
        personas="Students, Preceptors, Site Personnel, School contacts, Placement Faculty / CI",
        selection="Same list as the Schedules screen, already narrowed to one location. Tick rows, Bulk Email > Compose Email, tick personas.",
        thinking="Scoped to one location, so the natural emails are location-wide: arrival instructions, a briefing to the people at that location, preceptor confirmation and location notices. These differ from the Schedules screen by speaking for the location, not the individual placement."),
    "Site - Partner Schedules": dict(portal="site", screen="School Partner > Schedules tab", where="School Partners > a school > Schedules",
        personas="Students, Preceptors, Site Personnel, School contacts, Placement Faculty / CI",
        selection="Same list as the Schedules screen, narrowed to one school. Tick rows, Bulk Email > Compose Email, tick personas.",
        thinking="Scoped to one school, so the emails are about that school's cohort: confirming placements to the school, chasing first logins, coordinating the school's clinical instructors, and telling the school about a change."),
    "Site - Location Personnel": dict(portal="site", screen="Location > Personnel tab", where="Locations > a location > Personnel",
        personas="Site Personnel",
        selection="Bulk Email > Compose Email opens a person picker with role chips. Nothing is pre-selected; tick the people (or a role chip's worth) you want.",
        thinking="The audience is the staff at one location, including coordinators and preceptors. They need to know who is coming, be asked to act on placements, hear policy news, and be reminded to sign in."),
    "Site - Personnel": dict(portal="site", screen="Personnel (list)", where="Site Details > Personnel",
        personas="Site Personnel",
        selection="Filter by Role, Status, Designation or System Access, tick staff, then Bulk Email > Compose Email.",
        thinking="Site-wide staff list. The filters decide the audience, so the emails are about the staff as a group: getting people signed in, announcements, a start-of-term responsibilities refresher, and a contact check."),
    "Site - School Partners": dict(portal="site", screen="School Partners (list)", where="Site Details > School Partners",
        personas="School contacts (every program contact of each ticked school)",
        selection="Filter by State, Category, Contract Status or Discipline, tick schools, then Bulk Email > Compose Email. Every program contact of each ticked school is added.",
        thinking="Relationship screen. The recurring emails are contract renewal, confirming who the program contacts are, chasing open requests, and partner announcements."),
    "Site - Partner Contacts": dict(portal="site", screen="School Partner > About > Program Contacts", where="School Partners > a school > About",
        personas="School contacts",
        selection="Tick contacts in the Program Contacts table, then Bulk Email > Compose Email.",
        thinking="Writing to specific people at one school about that school's business: a request that needs information, an approval and next steps, the contract, and a periodic check-in. Request fields come from the school's latest request."),
    "Site - Jobs Candidates": dict(portal="site", screen="Jobs > Candidates (not wired in this prototype)", where="Jobs > a job > Applicants",
        personas="Candidates",
        selection="Tick applicants for a job, then Bulk Email > Compose Email. The Bulk Email button on the candidate list is not built in this prototype yet.",
        thinking="Hiring has a fixed sequence that every applicant moves through in bulk: acknowledgement, interview, offer, and status update. The Jobs template section already exists."),
    "School - Schedules": dict(portal="school", screen="Schedules & Onboarding", where="School portal > Schedules",
        personas="Students, Site Personnel, Placement Faculty / CI, School Program Contacts",
        selection="Filter, tick rows, then Bulk Email > Compose Email and tick personas. Mirrors the portal's Remind to Onboard and Confirm Students actions.",
        thinking="The school's job is to get students ready and in place. The volume emails are the onboarding reminder, the first-login nudge, placement confirmation with what to expect, and a heads-up to the site."),
    "School - Requests": dict(portal="school", screen="Requests", where="School portal > Requests",
        personas="The site contact for each ticked request",
        selection="Tick requests, then Bulk Email > Compose Email. Each request goes to the site contact for that request.",
        thinking="Schools write to sites about requests in four situations: following up when nothing has moved, answering a request for more information, asking to change dates, and the next steps after approval."),
}

UC = []


def uc(surface, name, persona, section, when, recipients, how, why, subject, body, notes=""):
    UC.append(dict(surface=surface, name=name, persona=persona, section=section, when=when, recipients=recipients,
                   how=how, why=why, subject=subject, body=body, notes=notes))


# ═════════════════════════ SITE: SCHEDULES ═════════════════════════
S = "Site - Schedules"
uc(S, "Onboarding reminder", "Student", "Onboarding",
   "Weeks before a rotation starts, for students who are not yet Compliant.",
   "Students on the selected schedules whose onboarding is Non-Compliant, Pending or Not Started.",
   "Schedules > Group or Individual > filter Onboarding Status (Non-Compliant, Pending, Not Started) > Select all > Bulk Email > Compose Email > tick Students.",
   "Every rotation has an onboarding deadline and a long tail of students who miss it. This is the most repeated email on the screen.",
   "Action needed: finish onboarding for {{rotationName}} by {{onboardingDeadline}}",
   """Hi {{firstName}},

Your clinical rotation, {{rotationName}} at {{locationName}}, starts on {{startDate}}. Your onboarding must be complete by {{onboardingDeadline}} ({{daysUntilDeadline}} days from today) so you can start on time.

Current status: {{onboardingStatus}}

Still outstanding:
{{#each outstandingItems}}• {{this}}<br>{{/each}}

Sign in to finish these items: {{loginUrl}}

If you have already submitted something, please allow a few business days for review. Reply to this email if you need help.""" + SIGN,
   "Filter to students who are not Compliant first; a Compliant student would get an empty outstanding list. A student already past the deadline is held back by the days-until rule: send those a separate overdue notice.")
uc(S, "Rotation starting soon: where to go and who to see", "Student", "Schedules",
   "One to two weeks before the start date.",
   "Students on the selected Upcoming schedules.",
   "Schedules > Individual or Group > Upcoming tab > Select all > Bulk Email > Compose Email > tick Students.",
   "Every placement needs a reporting-details message; sending it in bulk per start date saves coordinators from answering the same questions one by one.",
   "Your rotation starts in {{daysUntilStart}} days: {{rotationName}}",
   """Hi {{firstName}},

Your rotation starts in {{daysUntilStart}} days. Here is what you need.

Dates: {{scheduleDateRange}}
Shift: {{shift}} on {{daysOfWeek}}
Where: {{locationName}}, {{locationDepartment}}
Address: {{locationAddress}}
Front desk: {{locationPhone}}

Your preceptor: {{preceptorName}} ({{preceptorEmail}})
Site coordinator: {{locationCoordinators}} ({{locationCoordinatorEmail}})

Please arrive 15 minutes early on your first day and bring photo ID.""" + SIGN,
   "Shift and days of week are sample values in the prototype; production reads them from the schedule. Once a rotation has started the days-until countdown is blank and the student is held back.")
uc(S, "Preceptor heads-up for an incoming student", "Preceptor", "Schedules",
   "Before a student's first day, for each preceptor with a new student.",
   "Preceptors assigned to the selected schedules.",
   "Schedules > Upcoming > tick the schedules > Bulk Email > Compose Email > tick Preceptors.",
   "Preceptors are the most common source of 'nobody told me' problems. A heads-up per student start removes them.",
   "Student assigned to you from {{scheduleDateRange}}: {{assignedStudentName}}",
   """Hi {{firstName}},

{{assignedStudentName}} from {{assignedStudentSchool}} will start with you in {{daysUntilStart}} days ({{assignedScheduleRef}}).

Schedule: {{scheduleDateRange}}, {{shift}} on {{daysOfWeek}}
Where: {{locationName}}, {{locationDepartment}}
Clinical instructor: {{clinicalInstructorName}}

All your current students:
{{#each studentSchedules}}• {{this}}<br>{{/each}}

Questions or a conflict? Contact {{locationCoordinators}} at {{locationCoordinatorEmail}}.""" + SIGN)
uc(S, "Schedule change or cancellation notice", "Student", "Schedules",
   "When a placement is moved, shortened, or canceled.",
   "Students on the schedules that changed.",
   "Schedules > filter to the affected schedules (for example Schedule Status = Canceled) > Select all > Bulk Email > Compose Email > tick Students.",
   "Changes arrive in clusters (a unit closes, a preceptor leaves). The same message goes to everyone affected, so it is bulk by nature.",
   "Update to your clinical schedule: {{rotationName}}",
   """Hi {{firstName}},

There is a change to your placement, {{rotationName}} at {{locationName}}.

What changed:
{{changeDescription}}

Current status: {{scheduleStatus}}

If this affects your plans, please reply to this email or contact {{locationCoordinators}} at {{locationCoordinatorEmail}}. We will confirm any new details as soon as they are final.""" + SIGN,
   "{{changeDescription}} is written by the sender at send time. Put new dates inside it when a placement is rescheduled.")

# ═════════════════════════ SITE: LOCATION SCHEDULES ═════════════════════════
S = "Site - Location Schedules"
uc(S, "Arrival-day instructions for everyone placed at the location", "Student", "Schedules",
   "Once per intake, before the first students arrive.",
   "Every student scheduled at this location.",
   "Locations > open the location > Schedules > Upcoming > Select all > Bulk Email > Compose Email > tick Students.",
   "A location receives students in waves; one orientation note per wave replaces repeated individual replies about parking, badges and who to ask for.",
   "Reporting to {{locationName}}: what to know before day one",
   """Hi {{firstName}},

Welcome to {{locationName}}. You start on {{startDate}}.

Report to: {{locationDepartment}}
Address: {{locationAddress}}
Phone: {{locationPhone}}
Your hours: {{shift}} on {{daysOfWeek}}
Site coordinator: {{locationCoordinators}} ({{locationCoordinatorEmail}})
Your preceptor: {{preceptorName}}

[Add parking, badge pick-up and dress code here]""" + SIGN,
   "The bracketed line is plain text for the sender to edit; it is not a merge field.")
uc(S, "Briefing for the people at the location", "Staff-Personnel", "Schedules",
   "At the start of each rotation block.",
   "Site personnel at this location.",
   "Locations > open the location > Schedules > select the schedules > Bulk Email > Compose Email > tick Site Personnel.",
   "Coordinators and unit staff need one list of who is coming, in one place, before each block.",
   "Students arriving at {{locationName}}: overview for {{today}}",
   """Hi {{firstName}},

These students are scheduled at {{locationName}} ({{locationDepartment}}):

{{#each studentSchedules}}• {{this}}<br>{{/each}}

Please make sure each student has a preceptor and a work area. You can see the full detail and update assignments in Exxat One: {{portalUrl}}""" + SIGN,
   "The list shows up to 12 placements; the full list is in Exxat One.")
uc(S, "Preceptor assignment confirmation", "Preceptor", "Schedules",
   "When a student has been assigned to a preceptor and the preceptor has not yet confirmed.",
   "Preceptors at this location with students assigned.",
   "Locations > open the location > Schedules > filter to the schedules without confirmation > Bulk Email > Compose Email > tick Preceptors.",
   "Unconfirmed assignments are the main reason a student arrives with no one expecting them.",
   "Please confirm: {{assignedStudentName}} starts {{scheduleDateRange}}",
   """Hi {{firstName}},

You are assigned to supervise {{assignedStudentName}} from {{assignedStudentSchool}} at {{locationName}}.

Dates: {{scheduleDateRange}}
Hours: {{shift}} on {{daysOfWeek}}
Rotation: {{assignedScheduleRef}}

Please reply to confirm within three business days, or tell us if you cannot take this student so we can reassign. Contact {{locationCoordinators}} at {{locationCoordinatorEmail}} with questions.""" + SIGN)
uc(S, "Location notice to placed students", "Student", "Schedules",
   "When something at the location changes for everyone placed there (unit move, closure, policy).",
   "Students scheduled at this location.",
   "Locations > open the location > Schedules > Select all > Bulk Email > Compose Email > tick Students.",
   "A location-level change always affects a group; one message avoids contradictory replies.",
   "Notice for students at {{locationName}}",
   """Hi {{firstName}},

A notice for students placed at {{locationName}}:

{{changeDescription}}

Your placement dates are unchanged unless we tell you otherwise: {{scheduleDateRange}}.

For questions, contact {{locationCoordinators}} at {{locationCoordinatorEmail}} or {{locationPhone}}.""" + SIGN,
   "{{changeDescription}} is written by the sender at send time.")

# ═════════════════════════ SITE: PARTNER SCHEDULES ═════════════════════════
S = "Site - Partner Schedules"
uc(S, "Confirmed placements for the school", "School Contact", "Schedules",
   "After placements are confirmed, and before each term.",
   "The school's program contacts.",
   "School Partners > open the school > Schedules > Upcoming > Select all > Bulk Email > Compose Email > tick Schools.",
   "Schools plan around confirmed placements. This is the closing step after approvals, sent every term.",
   "Confirmed clinical placements for {{schoolName}}",
   """Hi {{firstName}},

Here are the clinical placements confirmed for {{schoolName}} students:

{{#each studentSchedules}}• {{this}}<br>{{/each}}

You have {{scheduleCount}} active placements in total. The full list, with shifts and preceptors, is in Exxat One: {{portalUrl}}

Please let us know if anything looks wrong.""" + SIGN,
   "Detail per student comes from the list so each line carries its own location and dates. The list shows up to 12 placements.")
uc(S, "Students who have not signed in", "School Contact", "Onboarding",
   "A few weeks before a rotation block, when students have not activated their accounts.",
   "The school's program contacts.",
   "School Partners > open the school > Schedules > Upcoming > Bulk Email > Compose Email > tick Schools.",
   "Students not signing in is a known, large gap. The school is the only party who can reach them quickly.",
   "Action needed: {{pendingStudents}} {{schoolName}} students have not signed in",
   """Hi {{firstName}},

{{pendingStudents}} of your students have not signed in to Exxat One yet, so we cannot track their onboarding for the placements below:

{{#each studentSchedules}}• {{this}}<br>{{/each}}

Could you remind them to sign in at {{loginUrl}}? Onboarding cannot start until they do.""" + SIGN)
uc(S, "Clinical instructor roster coordination", "Placement Faculty/CI", "Schedules",
   "At the start of a block, for each school's clinical instructors.",
   "The school's placement faculty and clinical instructors.",
   "School Partners > open the school > Schedules > select the schedules > Bulk Email > Compose Email > tick Placement Faculty / CI.",
   "Clinical instructors are the school-side link to students on site and need the roster and the sites together.",
   "Your student roster at {{hospitalName}}: {{studentRosterRef}}",
   """Hi {{firstName}},

Here are the students on your roster ({{studentRosterRef}}) placed at {{hospitalName}}:

{{#each studentSchedules}}• {{this}}<br>{{/each}}

Please coordinate with your students on onboarding and arrival. If a student needs to change placement, contact us through Exxat One: {{portalUrl}}""" + SIGN)
uc(S, "Placement change notice to the school", "School Contact", "Schedules",
   "When a placement for the school's students changes or is canceled.",
   "The school's program contacts.",
   "School Partners > open the school > Schedules > filter to the affected schedules > Bulk Email > Compose Email > tick Schools.",
   "The school must hear about any change before its students do, or it cannot support them.",
   "Placement update for {{schoolName}} students",
   """Hi {{firstName}},

There is a change to placements for {{schoolName}}:

{{changeDescription}}

Affected students:
{{#each studentSchedules}}• {{this}}<br>{{/each}}

We will confirm updated details as soon as they are final. Contact us at {{portalUrl}} with any questions.""" + SIGN,
   "{{changeDescription}} is written by the sender at send time.")

# ═════════════════════════ SITE: LOCATION PERSONNEL ═════════════════════════
S = "Site - Location Personnel"
uc(S, "Upcoming students: coverage heads-up", "Staff-Personnel", "Schedules",
   "Two to three weeks before a rotation block at the location.",
   "Staff at the location (ticked in the picker, or a whole role chip).",
   "Locations > open the location > Personnel > Bulk Email > Compose Email > tick the people or choose a role chip.",
   "Staff need advance notice to plan capacity; this goes out each block.",
   "Students coming to {{locationName}}: please plan coverage",
   """Hi {{firstName}},

These placements are scheduled at {{locationName}}:

{{#each studentSchedules}}• {{this}}<br>{{/each}}

Please check that your area ({{department}}) has capacity and let the coordinator know about any conflicts.""" + SIGN)
uc(S, "Action needed: assign preceptors and review placements", "Staff-Personnel", "Schedules",
   "When placements at the location still need a preceptor or a review.",
   "Coordinators at the location.",
   "Locations > open the location > Personnel > tick the Clinical Coordinator and Placement Coordinator chips > Bulk Email > Compose Email.",
   "Assignments are the step most often left until the last week.",
   "Action needed: review placements at {{locationName}}",
   """Hi {{firstName}},

As {{role}} for {{locationName}}, please review and assign preceptors for these placements:

{{#each studentSchedules}}• {{this}}<br>{{/each}}

You can assign preceptors and see details in Exxat One: {{portalUrl}}""" + SIGN,
   "The list shows the placements at the location; it does not filter to unassigned ones.")
uc(S, "Announcement or policy update", "Staff-Personnel", "General",
   "Policy changes, training dates, system notices.",
   "Staff at the location.",
   "Locations > open the location > Personnel > Bulk Email > Compose Email > tick the people.",
   "A standing channel from the site to its own staff; used throughout the year.",
   "Update for {{locationName}} staff from {{senderOrganization}}",
   """Hi {{firstName}},

{{messageBody}}

If you have questions, reply to this email.""" + SIGN,
   "{{messageBody}} is written by the sender at send time.")
uc(S, "Sign in to Exxat One", "Staff-Personnel", "General",
   "After new staff are added, or at the start of a term.",
   "Staff at the location who have not signed in.",
   "Locations > open the location > Personnel > tick staff who have not signed in > Bulk Email > Compose Email.",
   "Unused accounts mean coordinators miss notifications.",
   "Please sign in to Exxat One, {{firstName}}",
   """Hi {{firstName}},

You have an Exxat One account as {{role}} at {{senderOrganization}}. Sign in to see students placed at {{locationName}}, assign preceptors and receive notifications:

{{loginUrl}}

If you cannot sign in, reply to this email and we will help.""" + SIGN)

# ═════════════════════════ SITE: PERSONNEL ═════════════════════════
S = "Site - Personnel"
uc(S, "Sign-in nudge for staff who have not logged in", "Staff-Personnel", "General",
   "After invites go out, and again at the start of each term.",
   "Staff with System Access who have not logged in.",
   "Personnel > filter System Access = Has access and Status = Active > tick staff with no recent login > Bulk Email > Compose Email.",
   "Resend Invite handles single cases; a nudge covers a whole group at once.",
   "Please sign in to Exxat One, {{firstName}}",
   """Hi {{firstName}},

You have an Exxat One account at {{senderOrganization}} as {{role}} ({{department}}).

Sign in here: {{loginUrl}}

Signing in lets you receive placement notifications and manage students at your location. Reply to this email if you need help.""" + SIGN)
uc(S, "Policy or compliance announcement", "Staff-Personnel", "General",
   "New policy, a compliance deadline, a system downtime.",
   "A role or the whole personnel list.",
   "Personnel > filter by Role or Designation > Select all > Bulk Email > Compose Email.",
   "The most general site-to-staff message; used across the year.",
   "Important update from {{senderOrganization}}",
   """Hi {{firstName}},

{{messageBody}}

Thank you for your attention.""" + SIGN,
   "{{messageBody}} is written by the sender at send time.")
uc(S, "Start-of-term responsibilities refresher", "Staff-Personnel", "General",
   "Before each term, for coordinators and preceptors.",
   "Staff filtered by Role.",
   "Personnel > filter Role = Clinical Coordinator or Clinical Preceptor > Select all > Bulk Email > Compose Email.",
   "Roles change and new staff join; a short reminder before each term keeps expectations aligned.",
   "Your role this term: {{role}} at {{associatedLocations}}",
   """Hi {{firstName}},

A reminder before the new term. You are set up as {{role}} in {{department}}, linked to:

{{associatedLocations}}

Please keep student assignments and onboarding status up to date in Exxat One: {{portalUrl}}""" + SIGN)
uc(S, "Confirm your details and locations", "Staff-Personnel", "General",
   "A periodic data-quality check, or after a reorganisation.",
   "Active staff.",
   "Personnel > filter Status = Active > Select all > Bulk Email > Compose Email.",
   "Wrong location links send notifications to the wrong people.",
   "Please confirm your role and locations, {{firstName}}",
   """Hi {{firstName}},

We are checking staff records. Our records show:

Role: {{role}}
Department: {{department}}
Locations: {{associatedLocations}}

Please reply if anything is wrong, or update it in Exxat One: {{portalUrl}}""" + SIGN)

# ═════════════════════════ SITE: SCHOOL PARTNERS ═════════════════════════
S = "Site - School Partners"
uc(S, "Contract expiring: renewal reminder", "School Contact", "General",
   "Ninety, sixty and thirty days before a contract expires.",
   "Program contacts of schools whose contract is expiring.",
   "School Partners > filter Contract Status = Expired (or expiring) > Select all > Bulk Email > Compose Email.",
   "An expired contract blocks placements, so renewals are chased on a calendar.",
   "Your agreement with {{senderOrganization}} expires in {{daysToContractExpiry}} days",
   """Hi {{firstName}},

Our records show that your contract, {{contractName}}, expires on {{contractExpirationDate}} ({{daysToContractExpiry}} days from today).

To keep placements for {{schoolName}} students running without a gap, please send us your renewal paperwork or tell us who we should work with.

You can see your agreements here: {{portalUrl}}""" + SIGN,
   "Contract name and expiry are sample values in the prototype. Production reads them from the school's contract record.")
uc(S, "Confirm the program contacts on file", "School Contact", "General",
   "Start of the year, or after staffing changes at schools.",
   "Program contacts of the ticked schools.",
   "School Partners > Select all > Bulk Email > Compose Email.",
   "Stale contacts are the root of missed emails; verifying them once a year is routine.",
   "Please confirm your program contacts for {{schoolName}}",
   """Hi {{firstName}},

These are the program contacts we have on file for {{schoolName}}:

{{#each programContacts}}• {{this}}<br>{{/each}}

Please reply to tell us about anyone to add or remove, so placement emails reach the right people.""" + SIGN)
uc(S, "Open requests waiting on the school", "School Contact", "Slot Requests",
   "When requests have sat open for a week or more.",
   "Program contacts of schools with Pending or Info Requested requests.",
   "School Partners > tick schools with open requests > Bulk Email > Compose Email.",
   "Open requests stall placements; a single chaser per school beats one per request.",
   "Your open slot requests with {{senderOrganization}}",
   """Hi {{firstName}},

{{schoolName}} has requests that are still open:

{{#each openRequests}}• {{this}}<br>{{/each}}

Please check them in Exxat One and reply with anything we asked for: {{portalUrl}}""" + SIGN,
   "Select only schools with open requests; a school with none gets an empty list.")
uc(S, "Partner announcement or term update", "School Contact", "General",
   "New term, new availability, process changes.",
   "Program contacts of the ticked schools.",
   "School Partners > filter by State, Category or Discipline > Select all > Bulk Email > Compose Email.",
   "The site's one-to-many channel to its partner schools.",
   "News from {{senderOrganization}} for {{schoolName}}",
   """Hi {{firstName}},

{{messageBody}}

You can see current availability and manage requests at {{portalUrl}}.""" + SIGN,
   "{{messageBody}} is written by the sender at send time.")

# ═════════════════════════ SITE: PARTNER CONTACTS ═════════════════════════
S = "Site - Partner Contacts"
uc(S, "Request needs more information", "School Contact", "Slot Requests",
   "When a request is held up pending details from the school.",
   "The contacts who need to respond.",
   "School Partners > open the school > About > tick contacts > Bulk Email > Compose Email.",
   "The most common reason a request does not move is a missing answer.",
   "Additional information needed for request {{requestId}}",
   """Hi {{firstName}},

We need more information before we can decide request {{requestId}} for {{programType}} at {{requestedLocation}} ({{requestedSlots}} slots, submitted {{submittedDate}}).

{{messageBody}}

Please reply or update the request in Exxat One: {{portalUrl}}""" + SIGN,
   "Request details come from the school's latest request. {{messageBody}} is written by the sender.")
uc(S, "Request approved: next steps", "School Contact", "Slot Requests",
   "Right after a request is approved.",
   "The contacts for that school.",
   "School Partners > open the school > About > tick contacts > Bulk Email > Compose Email.",
   "Every approval needs a next-steps note: who to schedule, by when, where to go.",
   "Approved: {{approvedSlotCount}} slots at {{requestedLocation}}",
   """Hi {{firstName}},

Your request {{requestId}} is {{slotStatus}}. {{approvedSlotCount}} slots at {{requestedLocation}}, {{startDate}} to {{endDate}}.

Next steps: add your students to the schedule in Exxat One, and start their onboarding. Questions can go to {{locationCoordinators}} at {{locationCoordinatorEmail}}.

{{portalUrl}}""" + SIGN)
uc(S, "Contract renewal for this school", "School Contact", "General",
   "As the school's contract approaches expiry.",
   "The contacts who handle contracts.",
   "School Partners > open the school > About > tick contacts > Bulk Email > Compose Email.",
   "Targeted version of the renewal reminder when only certain people at the school handle contracts.",
   "Contract renewal: {{contractName}} expires {{contractExpirationDate}}",
   """Hi {{firstName}},

{{contractName}} with {{schoolName}} expires on {{contractExpirationDate}} ({{daysToContractExpiry}} days from today).

Please send renewal paperwork, or tell us who should handle it on your side.""" + SIGN,
   "Contract name and expiry are sample values in the prototype.")
uc(S, "Placement activity check-in", "School Contact", "General",
   "A periodic check-in with a school's main contacts.",
   "The main contacts at the school.",
   "School Partners > open the school > About > tick contacts > Bulk Email > Compose Email.",
   "Gives the school a quick status view and invites a conversation.",
   "Placement check-in for {{schoolName}}",
   """Hi {{firstName}},

A quick check-in on {{schoolName}}'s placements with {{senderOrganization}}:

Active placements: {{scheduleCount}}
Students who have not signed in: {{pendingStudents}}

Open requests:
{{#each openRequests}}• {{this}}<br>{{/each}}

Is there anything we can do to help? Reply to this email.""" + SIGN)

# ═════════════════════════ SITE: JOBS CANDIDATES ═════════════════════════
S = "Site - Jobs Candidates"
uc(S, "Application received", "Candidate", "Jobs",
   "Immediately after applicants apply.",
   "New applicants for a job.",
   "Jobs > open a job > Applicants > tick new applicants > Bulk Email > Compose Email.",
   "Every applicant should hear back at once; recruiters send it in batches.",
   "We received your application for {{jobTitle}}",
   """Hi {{firstName}},

Thank you for applying for {{jobTitle}} ({{department}}) at {{hospitalName}}, {{jobLocation}}. We received your application on {{applicationDate}}.

Our team is reviewing applications and will be in touch. You can track your application at {{jobsPortalUrl}}.""" + SIGN)
uc(S, "Interview invitation", "Candidate", "Jobs",
   "When applicants move to interview.",
   "Applicants shortlisted for interview.",
   "Jobs > open a job > Applicants > filter Stage = Interview > Bulk Email > Compose Email.",
   "Interviews are scheduled in rounds, in volume.",
   "Interview invitation: {{jobTitle}} at {{hospitalName}}",
   """Hi {{firstName}},

We would like to invite you to interview for {{jobTitle}}.

Date: {{interviewDate}}
Time: {{interviewTime}}
Format: {{interviewFormat}}
With: {{interviewerName}}, {{interviewerTitle}}

Please reply to confirm that you can attend.""" + SIGN,
   "Interview date, time, format, interviewer and title are written by the sender at send time.")
uc(S, "Offer", "Candidate", "Jobs",
   "When a hiring decision is made.",
   "Candidates receiving an offer.",
   "Jobs > open a job > Applicants > filter Stage = Offer > Bulk Email > Compose Email.",
   "New-graduate hiring produces many offers at once.",
   "Offer for {{jobTitle}} at {{hospitalName}}",
   """Hi {{firstName}},

Congratulations. We would like to offer you the position of {{jobTitle}} at {{hospitalName}}, {{jobLocation}}.

Compensation: {{compensation}}
Proposed start date: {{proposedStartDate}}

This offer expires on {{offerExpirationDate}}. Please reply to accept or to ask any questions.

{{recruiterName}} is your contact for next steps.""" + SIGN,
   "Start date, expiry and recruiter are written by the sender. Compensation reads the job's salary range and is blank if the job has none.")
uc(S, "Application status update", "Candidate", "Jobs",
   "When applicants are moved on, or not selected.",
   "Applicants at a given stage.",
   "Jobs > open a job > Applicants > filter by Stage > Bulk Email > Compose Email.",
   "Closing the loop with applicants is expected and happens at every stage change.",
   "An update on your application for {{jobTitle}}",
   """Hi {{firstName}},

Thank you for applying for {{jobTitle}} at {{hospitalName}} on {{applicationDate}}. Your application is currently at the {{stage}} stage.

We will contact you when there is more to share. You can follow your application at {{jobsPortalUrl}}.""" + SIGN)

# ═════════════════════════ SCHOOL: SCHEDULES ═════════════════════════
S = "School - Schedules"
uc(S, "Remind students to onboard", "Student", "Schedules & Onboarding",
   "Before a rotation starts, for students who are not Compliant.",
   "Students on the selected schedules who are not Compliant.",
   "Schedules > filter Onboarding Status (not Compliant) > Select all > Bulk Email > Compose Email > tick Students. (Mirrors Remind to Onboard.)",
   "The school's most repeated nudge: onboarding is its students' main blocker.",
   "Reminder: complete onboarding for {{rotationName}} by {{onboardingDeadline}}",
   """Hi {{firstName}},

Your clinical placement at {{siteName}}, {{rotationName}}, starts on {{startDate}}. Your onboarding must be complete by {{onboardingDeadline}}.

Current status: {{onboardingStatus}}

Still to do:
{{#each outstandingItems}}• {{this}}<br>{{/each}}

Sign in to complete it: {{loginUrl}}

Reply to this email if you are stuck.""" + SIGN)
uc(S, "First sign-in nudge", "Student", "Schedules & Onboarding",
   "When students have a placement but have not signed in.",
   "Students whose Student Login Status shows they have not signed in.",
   "Schedules > filter Student Login Status (pending first login) > Select all > Bulk Email > Compose Email > tick Students.",
   "Students not signing in is a large, known gap, and every other email depends on it.",
   "Sign in to Exxat One to see your placement, {{firstName}}",
   """Hi {{firstName}},

You have a clinical placement ({{rotationName}} at {{siteName}}, {{scheduleDateRange}}), but you have not signed in to Exxat One yet. Your login status is: {{studentLoginStatus}}.

Sign in here: {{loginUrl}}

You will need to sign in before you can complete onboarding. Reply to this email if you have trouble.""" + SIGN)
uc(S, "Placement confirmed: what to expect", "Student", "Schedules & Onboarding",
   "After students are confirmed for a placement.",
   "Students confirmed on the selected schedules.",
   "Schedules > filter Schedule Status = Confirmed (or Upcoming) > Select all > Bulk Email > Compose Email > tick Students. (Pairs with Confirm Students.)",
   "Every confirmed student needs the same set of details in one message.",
   "Your placement is confirmed: {{rotationName}} at {{siteName}}",
   """Hi {{firstName}},

Your placement is confirmed.

Site: {{siteName}}, {{locationName}}
Address: {{locationAddress}}
Dates: {{scheduleDateRange}}
Hours: {{shift}} on {{daysOfWeek}}
Preceptor: {{preceptorName}} ({{preceptorEmail}})
Clinical instructor: {{clinicalInstructorName}}

Please complete onboarding by {{onboardingDeadline}}: {{loginUrl}}""" + SIGN)
uc(S, "Heads-up to the site about incoming students", "Staff-Personnel", "Schedules & Onboarding",
   "Before a block, to the site contacts at each location.",
   "Site personnel at the locations of the selected schedules.",
   "Schedules > select the schedules > Bulk Email > Compose Email > tick Site Personnel.",
   "Schools keep sites informed so students are expected on day one.",
   "Students from {{senderOrganization}} arriving at {{locationName}}",
   """Hi {{firstName}},

These students from {{senderOrganization}} are scheduled at {{locationName}}:

{{#each studentSchedules}}• {{this}}<br>{{/each}}

Please let us know if there is anything the students should complete before they arrive.""" + SIGN)

# ═════════════════════════ SCHOOL: REQUESTS ═════════════════════════
S = "School - Requests"
uc(S, "Follow up on a pending request", "School Contact", "Requests",
   "When a request has had no response for a while.",
   "The site contact on each ticked pending request.",
   "Requests > filter Status = Request Pending or In Progress > tick requests > Bulk Email > Compose Email.",
   "Pending requests hold up a school's whole term; chasing them is routine.",
   "Following up on request {{requestId}}",
   """Hi {{firstName}},

We submitted request {{requestId}} on {{submittedDate}} for {{requestedSlots}} {{programType}} slots at {{requestedLocation}}, {{startDate}} to {{endDate}}. It has been pending for {{requestPendingDays}} days.

Could you let us know the status, or tell us if you need anything from us?""" + SIGN)
uc(S, "Responding to a request for more information", "School Contact", "Requests",
   "When a site asks for more information on a request.",
   "The site contact for each such request.",
   "Requests > filter Status = Info Requested > tick requests > Bulk Email > Compose Email.",
   "Info-requested requests stall until the school replies, so the reply is time-sensitive.",
   "Information for request {{requestId}}",
   """Hi {{firstName}},

Here is the information you asked for on request {{requestId}} ({{programType}} at {{requestedLocation}}):

{{messageBody}}

Please let us know if you need anything else to decide.""" + SIGN,
   "{{messageBody}} is written by the sender at send time.")
uc(S, "Request to change dates", "School Contact", "Requests",
   "When a school's calendar changes.",
   "The site contact for each affected request.",
   "Requests > tick the affected requests > Bulk Email > Compose Email.",
   "Academic calendars shift and affect several requests at once.",
   "Request to change dates for request {{requestId}}",
   """Hi {{firstName}},

We would like to change the dates for request {{requestId}} ({{requestedLocation}}).

Current dates: {{startDate}} to {{endDate}}
Requested dates: {{newStartDate}} to {{newEndDate}}

Reason: {{changeDescription}}

Please let us know whether this works.""" + SIGN,
   "New dates and the reason are written by the sender at send time.")
uc(S, "Approved: thank you and next steps", "School Contact", "Requests",
   "When a request is approved.",
   "The site contact for each approved request.",
   "Requests > filter Status = Approved > tick requests > Bulk Email > Compose Email.",
   "Every approval is followed by sending student details; a standard message speeds it up.",
   "Thank you: request {{requestId}} is approved",
   """Hi {{firstName}},

Thank you for approving request {{requestId}}: {{approvedSlotCount}} {{programType}} slots at {{requestedLocation}}, {{startDate}} to {{endDate}}.

We will send our student details by {{confirmationDeadline}}. Let us know who we should coordinate with at your end.""" + SIGN,
   "The confirmation deadline is written by the sender at send time.")
