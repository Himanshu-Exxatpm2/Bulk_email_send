# Head-of-Product review of the first draft (40 use cases).
#
# Scores are 1 to 5 on five tests. They are judgement, not measured data, and are written to be argued with.
#   V  Volume and recurrence   how many recipients, how often (a term, a block, a week)
#   I  Impact if not sent       placement at risk, revenue or renewal at risk, trust lost
#   F  Fit for bulk             one message, many people. Low when each send needs individual terms or text,
#                               or when the platform already does it natively (for example Resend Invite)
#   D  Distinct                 not the same email as one on another screen, and not a feature the portal already has
#   R  Ready                    merge fields exist, are reliable, and do not hold back the people who need it most
# Total out of 25. Bar to stay: 18. Entry format: (scores V,I,F,D,R), verdict, score after the change (or None), argument, outcome.
#
# Evidence used (May 2026 baseline in the project notes unless stated):
#   168 requests pending approval, 47% approval rate (86 of 183), 792 ongoing schedules, 196 open availabilities,
#   229 Bowie State students not yet signed in, faculty assignment fully manual, no unified inbox,
#   Jobs launched but needs growth (the live dashboard banner reads "Turn today's students into tomorrow's hires").
#   Live portal survey (Oct 2026): schedule rows often show no preceptor or clinical instructor ("-", "N/A"),
#   requests carry statuses Approved / In Progress / Request Pending / Info Requested, and the one Site tenant
#   surveyed showed 0 jobs on the Jobs tab.

K, S, R = "Keep", "Keep and sharpen", "Replace"

REVIEW = {
 # ── Site - Schedules ───────────────────────────────────────────────────────
 ("Site - Schedules", "Onboarding reminder"): ((5,5,5,4,4), S, 24,
   "The core bulk email of the product: onboarding gates every start, and a large group of students is always behind on it. Flaw: the draft used {{daysUntilDeadline}}, which is blank once the deadline has passed, so the students most in need are the ones the system holds back. Removed the countdown and added wording for overdue students.", ""),
 ("Site - Schedules", "Rotation starting soon: where to go and who to see"): ((5,4,5,3,3), S, 21,
   "Highest recipient volume on the screen and the answer to the most repeated student question. Flaw: the subject depended on {{daysUntilStart}}, which is blank after the start date. Subject now uses the start date. Shift and days of week are sample values in the prototype and need a live source.", ""),
 ("Site - Schedules", "Preceptor heads-up for an incoming student"): ((4,5,4,4,4), S, 22,
   "Live schedule rows often show no preceptor, and an unprepared preceptor is the commonest day-one failure. Same countdown flaw as above; removed.", ""),
 ("Site - Schedules", "Schedule change or cancellation notice"): ((3,5,4,4,4), K, None,
   "Changes arrive in clusters (a unit closes, a preceptor leaves) and the cost of a student not knowing is a no-show. Live data shows Canceled schedules with reasons, so the status is real.", ""),
 # ── Site - Location Schedules ──────────────────────────────────────────────
 ("Site - Location Schedules", "Arrival-day instructions for everyone placed at the location"): ((4,3,4,2,4), S, 19,
   "As drafted it duplicated the starting-soon email on the Schedules screen, field for field. It earns its place only for what the all-site screen cannot hold: location-specific content (badge pick-up, parking, EHR access, dress code) that a coordinator types for their own location. Reframed as day-one logistics.", ""),
 ("Site - Location Schedules", "Briefing for the people at the location"): ((4,4,4,2,3), R, None,
   "Sends staff the same placements list as the coverage heads-up on the Location Personnel screen. The list is built from the location, not from the rows ticked, so the selection step on this screen adds nothing. One home for it is enough, and Personnel is where the audience is chosen.", "Merged into 'Upcoming students: coverage heads-up' (Site - Location Personnel)."),
 ("Site - Location Schedules", "Preceptor assignment confirmation"): ((3,5,4,4,4), K, None,
   "Unconfirmed assignments are the main reason a student arrives to nobody expecting them, and the live schedule list shows many rows with no preceptor.", ""),
 ("Site - Location Schedules", "Location notice to placed students"): ((2,3,3,2,4), R, None,
   "Location-wide changes are rare, and when one happens the schedule change notice on the Schedules screen already reaches the same students.", "Replaced by 'Invite finishing students to apply' (hire from your pipeline)."),
 # ── Site - Partner Schedules ───────────────────────────────────────────────
 ("Site - Partner Schedules", "Confirmed placements for the school"): ((4,3,5,3,3), K, None,
   "Schools plan around confirmed placements and the message is identical for every contact. Moderate impact because the platform already notifies on confirmation; it stays as a per-term roll-up.", ""),
 ("Site - Partner Schedules", "Students who have not signed in"): ((5,5,5,4,3), S, 23,
   "Sign-in is already handled by Resend Invite, which exists for every persona, so this was the wrong tool. The real gap is wider: a signed-in student can still be non-compliant and unable to start. The school needs one list of everyone not cleared, with status.", "Upgraded to 'Students not cleared to start', which covers not signed in and every other onboarding gap."),
 ("Site - Partner Schedules", "Clinical instructor roster coordination"): ((3,3,4,3,3), R, None,
   "Tells instructors what their own school already knows, so a site sending it adds little. The real gap (faculty assignment is fully manual) is asking the school to assign an instructor, which needs a per-schedule instructor field the prototype does not hold.", "Removed. Proposed for later once per-schedule clinical instructor data exists."),
 ("Site - Partner Schedules", "Placement change notice to the school"): ((3,5,4,4,4), K, None,
   "The school must hear about a change before its students do, or it cannot support them.", ""),
 # ── Site - Location Personnel ──────────────────────────────────────────────
 ("Site - Location Personnel", "Upcoming students: coverage heads-up"): ((4,4,4,3,4), K, None,
   "Staff need advance notice to plan capacity; it recurs every block. Absorbs the briefing from the Location Schedules screen.", ""),
 ("Site - Location Personnel", "Action needed: assign preceptors and review placements"): ((4,5,4,4,3), S, 21,
   "Assignment is the step most often left to the last week, and live rows show many with no preceptor. The list cannot filter to unassigned placements, so the wording now asks the coordinator to review the whole list.", ""),
 ("Site - Location Personnel", "Announcement or policy update"): ((4,2,2,2,2), R, None,
   "A template that is only {{messageBody}} adds nothing: the sender writes the whole email anyway. It belongs on the Personnel list as a structured announcement.", "Replaced by 'Requests waiting for your decision'."),
 ("Site - Location Personnel", "Sign in to Exxat One"): ((3,3,2,1,5), R, None,
   "Resend Invite already exists in the portal for every persona, so a bulk sign-in email adds nothing.", "Removed; Resend Invite covers it."),
 # ── Site - Personnel ───────────────────────────────────────────────────────
 ("Site - Personnel", "Sign-in nudge for staff who have not logged in"): ((4,4,2,1,5), R, None,
   "Resend Invite already exists in the portal for every persona, which is exactly this job. I scored the size of the activation gap, not whether Bulk Email is the right tool for it. A bulk sign-in email adds a second way to do something the product already does.", "Replaced by 'Confirm your capacity for the next block'."),
 ("Site - Personnel", "Policy or compliance announcement"): ((4,3,3,3,3), S, 18,
   "The most common general email, but a bare {{messageBody}} is not a template. Restructured into what changed, what you must do, and by when, so staff can act on it.", ""),
 ("Site - Personnel", "Start-of-term responsibilities refresher"): ((3,3,4,3,4), S, 18,
   "Roles change and staff join each term. Added the two actions that matter (review requests waiting, make sure each placement has a preceptor) so it is a prompt to act, not a reminder to read.", ""),
 ("Site - Personnel", "Confirm your details and locations"): ((2,3,4,3,4), R, None,
   "Data hygiene by email creates manual work: every correction comes back as a reply that someone must re-key. Better as a profile-review flow in the product than as a bulk email.", "Removed, not replaced: three strong use cases beat four with a weak one."),
 # ── Site - School Partners ─────────────────────────────────────────────────
 ("Site - School Partners", "Contract expiring: renewal reminder"): ((4,5,5,5,3), K, None,
   "The strongest relationship email: an expired contract blocks placements and renewal is revenue. It runs on a calendar (90, 60, 30 days), so volume is predictable. Contract name and expiry are sample values here.", ""),
 ("Site - School Partners", "Confirm the program contacts on file"): ((3,4,5,4,5), K, None,
   "Stale contacts are the root of missed emails, and verified contacts reduce how often the no-program-contact fallback is needed.", ""),
 ("Site - School Partners", "Open requests waiting on the school"): ((3,3,4,2,4), R, None,
   "Wrongly framed. Requests that are Pending are waiting on the site (168 pending approvals), not on the school; only Info Requested ones wait on the school. Schools do not need chasing about the site's backlog; they need to see where each request stands.", "Replaced by 'Status of your requests' (digest)."),
 ("Site - School Partners", "Partner announcement or term update"): ((3,2,2,2,2), R, None,
   "Another bare {{messageBody}}. A System Announcement template already exists for partner contacts.", "Removed."),
 # ── Site - Partner Contacts ────────────────────────────────────────────────
 ("Site - Partner Contacts", "Request needs more information"): ((4,5,4,4,4), K, None,
   "The most common reason a request does not move is a missing answer; an Additional Info Needed template already exists, so this is the bulk form of a proven need.", ""),
 ("Site - Partner Contacts", "Request approved: next steps"): ((4,4,4,3,4), K, None,
   "Every approval is followed by the school scheduling students; a next-steps note speeds that. Maps to the existing Slot Request Approved template.", ""),
 ("Site - Partner Contacts", "Contract renewal for this school"): ((2,4,5,1,3), R, None,
   "A copy of the renewal reminder on the School Partners screen, where renewals are actually run. Targeting one school adds nothing.", "Replaced by 'Request not approved: reason and next steps'."),
 ("Site - Partner Contacts", "Placement activity check-in"): ((2,2,3,2,4), R, None,
   "Vague. A check-in with counts invites no action, and nobody can say when it should be sent.", "Replaced by 'Request not approved: reason and next steps'."),
 # ── Site - Jobs Candidates ─────────────────────────────────────────────────
 ("Site - Jobs Candidates", "Application received"): ((4,3,5,3,5), K, None,
   "Every applicant should hear back at once; an Application Received template already exists. Low risk, high recipient count.", ""),
 ("Site - Jobs Candidates", "Interview invitation"): ((4,5,4,4,4), K, None,
   "Interviews run in rounds and a missed invitation loses a hire. Interview Invitation template already exists.", ""),
 ("Site - Jobs Candidates", "Offer"): ((2,5,2,2,3), R, None,
   "Offers carry individual terms and legal weight; sending compensation in bulk is the wrong default, and an Offer Letter template already exists for individual sends. What is genuinely bulk is chasing outstanding offers before they expire.", "Replaced by 'Offer expiring soon: reminder'."),
 ("Site - Jobs Candidates", "Application status update"): ((5,4,5,4,5), K, None,
   "The highest-volume hiring email: most applicants for any job are not hired, and silence damages the employer brand. Truly bulk, same message, no individual terms.", ""),
 # ── School - Schedules ─────────────────────────────────────────────────────
 ("School - Schedules", "Remind students to onboard"): ((5,5,5,4,5), K, None,
   "Mirrors the portal's Remind to Onboard action and targets the school's main blocker. No countdown fields, so overdue students are not held back.", ""),
 ("School - Schedules", "First sign-in nudge"): ((4,4,2,1,5), R, None,
   "Resend Invite already exists for every persona, including students. I first scored this 25 of 25 and called it the best use case, because the activation gap is real (229 Bowie State students not signed in at the May baseline). That judged the problem's size, not the tool. Resend Invite is the right tool, so a bulk email duplicates it.", "Replaced by 'Schedule change or cancellation notice' from the school."),
 ("School - Schedules", "Placement confirmed: what to expect"): ((4,4,5,3,4), K, None,
   "Every confirmed student needs the same details in one message; matches the Student Placed template and the Confirm Students action.", ""),
 ("School - Schedules", "Heads-up to the site about incoming students"): ((3,3,4,3,4), R, None,
   "The site already sees its schedules, so the school telling it adds little. The school's blind spot is its own instructors, who need to know which of their students are not cleared.", "Replaced by 'Brief your clinical instructors'."),
 # ── School - Requests ──────────────────────────────────────────────────────
 ("School - Requests", "Follow up on a pending request"): ((4,5,5,5,5), K, None,
   "With 168 requests pending approval and a 47% approval rate, schools wait on decisions that gate their whole term. A Pending Request Follow-up template already exists; this is its bulk form.", ""),
 ("School - Requests", "Responding to a request for more information"): ((3,5,3,4,4), K, None,
   "Info Requested is a live status and the request stalls until the school answers, so the reply is time-sensitive. Fit for bulk is moderate because the answer is written per request.", ""),
 ("School - Requests", "Request to change dates"): ((2,3,3,3,4), R, None,
   "Date changes are negotiated one request at a time. What is genuinely bulk is withdrawing requests a school no longer needs when a term changes.", "Replaced by 'Withdraw requests we no longer need'."),
 ("School - Requests", "Approved: thank you and next steps"): ((3,3,4,3,4), S, 18,
   "Maps to the existing Request Approved template. Sharpened so it commits the school to a date for student details, which is what the site wants from it.", ""),
}
