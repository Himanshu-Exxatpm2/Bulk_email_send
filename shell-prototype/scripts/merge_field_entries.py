# Master table of merge fields. build-merge-field-catalog.py turns this into
# src/app/data/mergeFieldCatalog.ts (what the app reads) and the Excel workbook,
# so the two can never disagree.
#
# E(token, label, group, audiences, portal, prod, example, how, kind, description, insert)
#   audiences  letters: S Student, C School Contact, P Partner Contact, F Staff-Personnel,
#              J Candidate, R Preceptor, L Placement Faculty/CI, or "*" for everyone
#   portal     "b" both portals, "s" site only, "c" school only
#   prod       where the value lives on one.exxat.com (page -> column / field)
#   how        record   read from the recipient's own record or a record it links to
#              derived  computed from records (dates, counts, durations)
#              sample   prototype has no data for it; a labelled sample value is used
#              tenant   sender / platform constant
#              author   written by the sender, never auto-filled
#   kind       text | date | number | link | list

ALL = "SCPFJRL"

ENTRIES = []


def E(token, label, group, aud, portal, prod, example, how, kind="text", desc="", insert=None):
    ENTRIES.append(dict(token=token, label=label, group=group, aud=ALL if aud == "*" else aud,
                        portal=portal, prod=prod, example=example, how=how, kind=kind,
                        desc=desc, insert=insert))


# ── Recipient ────────────────────────────────────────────────────────────────
G = "Recipient"
E("firstName", "First Name", G, "*", "b", "Any profile: First name", "Sandra", "record", desc="Recipient's first name.")
E("lastName", "Last Name", G, "*", "b", "Any profile: Last name", "Okonkwo", "record", desc="Recipient's last name.")
E("recipientName", "Full Name", G, "*", "b", "Any profile: First + Last name", "Sandra Okonkwo", "record", desc="Recipient's full name.")
E("email", "Email", G, "*", "b", "Personnel > Email; Program Contacts > Email; Student email", "s.okonkwo@medstarhealth.org", "record", "link", "Recipient's own email address.")

# ── Sender & organization ────────────────────────────────────────────────────
G = "Sender & Organization"
E("senderName", "Sender Name", G, "*", "b", "Signed-in user (top-right profile)", "Kierra Mango", "tenant", desc="The person sending the email.")
E("senderOrganization", "Sender Organization", G, "*", "b", "Site / School name in the header (e.g. Bedlam-Hospital)", "MedStar Health Clinical Education", "tenant", desc="Name of the sending site or school, as set in Email Setup.")
E("hospitalName", "Site / Hospital Name", G, "*", "b", "Locations > Parent; Site header", "MedStar Health", "tenant", desc="Hospital or health system. For a placed student it is where they rotate.")
E("loginUrl", "Login URL", G, "*", "b", "https://one.exxat.com/login", "https://one.exxat.com/login", "tenant", "link", "Sign-in link for Exxat One.")
E("portalUrl", "Portal URL", G, "*", "b", "https://one.exxat.com", "https://one.exxat.com", "tenant", "link", "Link to the Exxat One portal.")
E("today", "Today's Date", G, "*", "b", "System date", "October 22, 2026", "derived", "date", "Date the email is sent.")

# ── Links (deep links into the portal) ───────────────────────────────────────
G = "Links"
E("scheduleDetailLink", "Schedule detail", G, "*", "b", "Schedules > a schedule", "https://one.exxat.com/schedules/6427314", "tenant", "link", "Opens the schedule in Exxat One.")
E("requestDetailLink", "Request detail", G, "*", "b", "Slot Requests > a request", "https://one.exxat.com/requests/3558157000", "tenant", "link", "Opens the slot request in Exxat One.")
E("placementDetailLink", "Placement detail", G, "*", "b", "Schedules > a placement", "https://one.exxat.com/placements", "tenant", "link", "Opens the placement in Exxat One.")
E("requirementDetailLink", "Requirement detail", G, "*", "b", "Onboarding > a requirement", "https://one.exxat.com/onboarding", "tenant", "link", "Opens the onboarding requirement in Exxat One.")
E("exxatOneHomeLink", "Exxat One home", G, "*", "b", "https://one.exxat.com", "https://one.exxat.com", "tenant", "link", "Opens the Exxat One home page.")

# ── Student ──────────────────────────────────────────────────────────────────
G = "Student"
E("studentName", "Student Name", G, "S", "b", "Schedules > Student", "Aaliyah Washington", "record", desc="Student's full name.")
E("school", "School", G, "S", "b", "Schedules > School Name", "Bowie State University", "record", desc="Student's school.")
E("program", "Program", G, "S", "b", "Schedules > Program Type (full program name)", "BSN Pre-Licensure Nursing", "record", desc="Student's program.")
E("programType", "Program Type", G, "SCRFL", "b", "Schedules / Requests > Program Type", "BSN", "record", desc="Academic credential type, e.g. BSN, DPT.")
E("cohort", "Cohort", G, "S", "b", "Learner profile", "Fall 2026", "record", desc="Student's cohort.")
E("onboardingStatus", "Onboarding Status", G, "SCRFL", "b", "Schedules > Onboarding Status", "Non-Compliant", "record", desc="Compliant, Non-Compliant, Pending or Not Started.")
E("onboardingDeadline", "Onboarding Deadline", G, "SCRFL", "b", "Derived: two weeks before the rotation starts", "August 18, 2026", "derived", "date", "Date onboarding must be complete.")
E("daysUntilDeadline", "Days Until Onboarding Deadline", G, "SCRFL", "b", "Derived", "27", "derived", "number", "Whole days left to the onboarding deadline.")
E("outstandingItems", "Outstanding Onboarding Items", G, "SCRFL", "b", "Onboarding checklist", "Background check; CPR certification", "derived", "list", "Checklist items still open, one per line.", "{{#each outstandingItems}}• {{this}}<br>{{/each}}")
E("studentLoginStatus", "Student Login Status", G, "S", "c", "School Schedules > Student Login Status filter", "Pending first login", "record", desc="Whether the student has logged in yet.")

# ── Schedule ─────────────────────────────────────────────────────────────────
G = "Schedule"
E("scheduleId", "Schedule ID", G, "SCRFL", "b", "Schedules > Schedule ID", "6427314", "record", desc="Schedule identifier.")
E("scheduleStatus", "Schedule Status", G, "SCRFL", "b", "Schedules > Schedule Status", "Upcoming", "record", desc="Upcoming, Active, Completed, To be Scheduled or Canceled.")
E("cancellationReason", "Cancellation Reason", G, "SR", "b", "Schedules > Schedule Status (Canceled: reason)", "School: Student withdrew/ineligible", "sample", desc="Why a schedule was canceled.")
E("rotationName", "Rotation Name", G, "SC", "b", "Schedules > Availability", "MedStar ICU – Fall 2026", "record", desc="Name of the rotation or availability.")
E("startDate", "Schedule Start Date", G, "SC", "b", "Schedules > Schedule Duration (start)", "September 1, 2026", "record", "date", "Rotation start date.")
E("endDate", "Schedule End Date", G, "SC", "b", "Schedules > Schedule Duration (end)", "December 15, 2026", "record", "date", "Rotation end date.")
E("scheduleDateRange", "Schedule Date Range", G, "SCRFL", "b", "Schedules > Schedule Duration", "Sep 1 – Dec 15, 2026", "derived", desc="Start and end together.")
E("daysUntilStart", "Days Until Start", G, "SCRFL", "b", "Derived", "10", "derived", "number", "Whole days until the rotation starts.")
E("shift", "Shift", G, "SCRFL", "b", "Schedules > Shift", "Day Shift (07:00 – 15:30)", "sample", desc="Shift worked. For a preceptor it is their own shift.")
E("daysOfWeek", "Days of Week", G, "SCRFL", "b", "Schedules > Days of Week", "Mon, Tue, Wed, Thu, Fri", "sample", desc="Days the student attends.")
E("disciplineSpecialization", "Discipline / Specialization", G, "SR", "b", "Schedules > Discipline / Specialization", "Nursing", "derived", desc="Discipline of the placement.")
E("preceptorName", "Preceptor Name", G, "SR", "b", "Schedules > Preceptor", "Sandra Okonkwo", "record", desc="For a student: their assigned preceptor. For a preceptor: their own name.")
E("preceptorEmail", "Preceptor Email", G, "S", "b", "Personnel > Email", "s.okonkwo@medstarhealth.org", "record", "link", "Preceptor's email.")
E("clinicalInstructorName", "Clinical Instructor", G, "SR", "b", "Schedules > Clinical Instructor", "Denise Carrington", "derived", desc="School's clinical instructor for the placement.")

# ── Location ─────────────────────────────────────────────────────────────────
G = "Location"
E("locationName", "Location Name", G, "SCFRL", "b", "Locations > Location", "MedStar Washington Hospital Center – ICU", "record", desc="Clinical location.")
E("locationAddress", "Location Address", G, "SRC", "b", "Locations > Location Address", "110 Irving St NW, Washington, DC 20010", "record", desc="Full address.")
E("locationPhone", "Location Phone", G, "SRC", "b", "Locations > About > Phone", "(202) 555-0300", "record", desc="Location phone number.")
E("locationDepartment", "Department / Unit", G, "SFRC", "b", "Locations > Departments & Units", "ICU", "record", desc="Department or unit.")
E("locationCoordinators", "Location Coordinators", G, "SRC", "b", "Locations > Location Coordinators", "Raymond Castillo, Alicia Ruiz", "record", desc="Coordinators at the location.")
E("locationCoordinatorEmail", "Primary Coordinator Email", G, "SRC", "b", "Personnel > Email (coordinator)", "r.castillo@medstarhealth.org", "record", "link", "First coordinator's email.")
E("siteName", "Site Name", G, "SR", "b", "Locations > Parent", "MedStar Health", "record", desc="Site where the placement happens.")

# ── Availability ─────────────────────────────────────────────────────────────
G = "Availability"
E("availabilityName", "Availability Name", G, "C", "b", "Availability > Availability Name", "MedStar ICU – Fall 2026", "record", desc="Name of the availability.")
E("experienceType", "Experience Type", G, "C", "b", "Availability / Requests > Experience Type", "Group", "derived", desc="Group or Individual.")
E("dueOn", "Request Due Date", G, "C", "s", "Availability > Publish Options > Due On", "November 1, 2026", "sample", "date", "Last date schools can request.")

# ── Slot request ─────────────────────────────────────────────────────────────
G = "Slot Request"
E("requestId", "Request ID", G, "C", "b", "Slot Requests > Request ID", "3558157000", "record", desc="Request identifier.")
E("slotStatus", "Request Status", G, "C", "b", "Slot Requests > Status", "Approved", "record", desc="Pending, Approved, Declined or Info Requested.")
E("requestedSlots", "Requested Slots", G, "C", "b", "Slot Requests > Requested Slots", "2", "record", "number", "Slots the school asked for.")
E("approvedSlotCount", "Approved Slot Count", G, "C", "b", "Slot Requests > Approved Info", "2", "record", "number", "Slots approved.")
E("submittedDate", "Requested Date", G, "C", "b", "Slot Requests > Requested Date", "October 13, 2026", "record", "date", "Date the request was raised.")
E("requestedDuration", "Requested Duration", G, "C", "b", "Slot Requests > Requested Duration", "15 weeks", "derived", desc="Length requested.")
E("requestPendingDays", "Request Pending (Days)", G, "C", "b", "Slot Requests > Request Pending Duration (Days)", "12", "derived", "number", "Days since the request was raised.")
E("requestedBy", "Requested By", G, "C", "b", "Slot Requests > Requested By (name)", "Dr. Renee Blackwell", "record", desc="Person who raised the request.")
E("requestedByEmail", "Requested By Email", G, "C", "b", "Slot Requests > Requested By (email)", "r.blackwell@bowiestate.edu", "record", "link", "Email of the person who raised the request. Also the fallback recipient when a school has no program contacts.")
E("requestedLocation", "Requested Location", G, "C", "b", "Slot Requests > Requested Location", "MedStar Washington Hospital Center – ICU", "record", desc="Location the request is for.")
E("openRequests", "Open Requests (list)", G, "CF", "b", "Slot Requests list (Pending / In Progress)", "Req 3558157000 – ICU – Pending", "derived", "list", "Requests still waiting on a decision or more information, one per line. For a school: its own requests. For site staff: requests at their location.", "{{#each openRequests}}• {{this}}<br>{{/each}}")

# ── School / Partner ─────────────────────────────────────────────────────────
G = "School / Partner"
E("schoolName", "School Name", G, "CPLS", "b", "School Partners > School Name", "Bowie State University", "record", desc="Partner school.")
E("schoolContactName", "Contact Name", G, "C", "b", "School Partners > Program Contacts > Name", "Dr. Renee Blackwell", "record", desc="The contact being emailed.")
E("programContacts", "Program Contacts (list)", G, "CP", "b", "School Partners > Program Contacts", "Dr. Renee Blackwell — r.blackwell@bowiestate.edu", "record", "list", "All program contacts, one per line.", "{{#each programContacts}}• {{this}}<br>{{/each}}")
E("scheduleCount", "Active Schedule Count", G, "C", "b", "School Partners > Schedules", "229", "record", "number", "Schedules currently running for the school.")

E("requestStatuses", "Request Status Summary (list)", "Slot Request", "C", "b", "Slot Requests list (all statuses for the school)", "Request 3558157000 – MedStar ICU – Fall 2026 – Approved", "derived", "list", "Every request the school has, with its status, one per line.", "{{#each requestStatuses}}• {{this}}<br>{{/each}}")

# ── Contract ─────────────────────────────────────────────────────────────────
G = "Contract"
E("pendingStudents", "Pending Students", "School / Partner", "C", "b", "School Dashboard > Student Scheduling and Confirmation Pending", "5", "derived", "number", "Students from the school still waiting on first login.")
E("organizationName", "Organization Name", "School / Partner", "CP", "b", "School Partners > School Name", "Bowie State University", "record", desc="Same as Organization.")
E("contractName", "Contract Name and Number", G, "CP", "s", "Contracts > Name and Number", "Master Affiliation Agreement", "sample", desc="Name of the contract.")
E("contractExpirationDate", "Contract Expiration Date", G, "CP", "s", "Contracts > Expiration Date", "May 20, 2027", "sample", "date", "Contract expiry.")
E("daysToContractExpiry", "Days To Contract Expiry", G, "CP", "s", "Derived from Expiration Date", "210", "derived", "number", "Whole days until the contract expires.")

# ── Site personnel ───────────────────────────────────────────────────────────
G = "Site Personnel"
E("staffName", "Staff Name", G, "F", "b", "Personnel > Name", "Sandra Okonkwo", "record", desc="Staff member's full name.")
E("role", "Role", G, "F", "b", "Personnel > Role & Access", "Nurse Manager", "record", desc="Role at the site.")
E("department", "Department", G, "FJ", "b", "Personnel > Associated locations; Jobs > Discipline", "ICU", "record", desc="Staff member's department, or the department a job sits in.")
E("associatedLocations", "Associated Locations", G, "FR", "b", "Personnel > Associated locations", "MedStar Washington Hospital Center – ICU", "record", desc="Locations the person is linked to.")

# ── Preceptor ────────────────────────────────────────────────────────────────
G = "Preceptor"
E("assignedScheduleRef", "Assigned Schedule Reference", G, "R", "b", "Schedules > Availability", "MedStar ICU – Fall 2026", "record", desc="Rotation the preceptor is assigned to.")
E("assignedStudentName", "Assigned Student", G, "R", "b", "Schedules > Student", "Aaliyah Washington", "derived", desc="Student assigned to the preceptor.")
E("assignedStudentSchool", "Assigned Student School", G, "R", "b", "Schedules > School Name", "Bowie State University", "derived", desc="Assigned student's school.")

# ── Placement faculty ────────────────────────────────────────────────────────
G = "Placement Faculty / CI"
E("facultyName", "Faculty Name", G, "L", "b", "Schedules > Clinical Instructor", "Denise Carrington", "record", desc="Faculty member's full name.")
E("studentRosterRef", "Student Roster Reference", G, "L", "b", "Placement faculty roster", "Bowie BSN – Fall 2026", "record", desc="Roster the faculty member supervises.")

# ── Candidate / Jobs ─────────────────────────────────────────────────────────
G = "Candidate & Job"
E("candidateName", "Candidate Name", G, "J", "s", "Jobs > Applicants", "Priya Raman", "record", desc="Candidate's full name.")
E("jobTitle", "Job Title", G, "J", "s", "Jobs > Title", "ICU Registered Nurse", "record", desc="Job applied for.")
E("jobLocation", "Job Location", G, "J", "s", "Jobs > Location", "Washington, DC", "record", desc="Where the job is.")
E("compensation", "Compensation", G, "J", "s", "Jobs > Compensation", "$78,000 – 96,000", "record", desc="Salary range.")
E("stage", "Application Stage", G, "J", "s", "Jobs > Applications", "Under Review", "record", desc="Stage in the hiring process.")
E("applicationDate", "Application Date", G, "J", "s", "Jobs > Applications", "September 20, 2026", "record", "date", "Date they applied.")
E("jobsPortalUrl", "Jobs Portal URL", G, "JS", "s", "https://one.exxat.com/jobs", "https://one.exxat.com/jobs", "tenant", "link", "Link to the jobs portal.")

# ── Lists ────────────────────────────────────────────────────────────────────
G = "Schedules List"
E("studentsNotCleared", "Students Not Cleared to Start (list)", "Schedules List", "CL", "b", "Schedules list > Onboarding Status (not Compliant), upcoming or current",
  "Henry Caville — MedStar ICU — starts September 1, 2026 — Not Started", "derived", "list",
  "Students with an upcoming or current placement who have not finished onboarding: name, location, start date and status, one per line.",
  "{{#each studentsNotCleared}}• {{this}}<br>{{/each}}")
E("studentSchedules", "Student Schedules (list)", G, "CFRL", "b", "Schedules list, filtered to the recipient's school or location",
  "Henry Caville — MedStar ICU — Sep 1 – Dec 15, 2026", "derived", "list",
  "The student placements relevant to the recipient, one per line: student, location, dates.",
  "{{#each studentSchedules}}• {{this}}<br>{{/each}}")

# ── Written by the sender (never auto-filled) ────────────────────────────────
G = "Written by Sender"
for tok, lab, aud in [
    ("messageBody", "Message Body", "FCP"), ("subject", "Subject", "F"),
    ("announcementBody", "Announcement Body", "P"), ("updateBody", "Update Body", "P"),
    ("acknowledgeByDate", "Acknowledge By Date", "P"), ("changeDescription", "Change Description", "SC"),
    ("offerExpiryDate", "Offer Expiry Date", "J"), ("newStartDate", "New Start Date", "SC"), ("newEndDate", "New End Date", "SC"), ("confirmationDeadline", "Confirmation Deadline", "SC"), ("interviewerTitle", "Interviewer Title", "J"), ("interviewDate", "Interview Date", "J"), ("interviewTime", "Interview Time", "J"),
    ("interviewFormat", "Interview Format", "J"), ("interviewerName", "Interviewer Name", "J"),
    ("offerExpirationDate", "Offer Expiration Date", "J"), ("proposedStartDate", "Proposed Start Date", "J"),
    ("recruiterName", "Recruiter Name", "J"),
]:
    E(tok, lab, G, aud, "b", "Typed by the sender when composing", "", "author", desc="Written by the sender at send time; not filled from a record.")


# ── Review pass: fields taken out after a screen-by-screen read ──────────────────
# token -> [category, reason, label, group]. Kept so the workbook can show what was removed and why.

# ── Added 2026-10-27 from Harshavardhan Martur's Bulk Email field lists ─────────────
G = "Recipient"
E("phone", "Phone Number", G, "*", "b", "Program Contacts > Phone; Personnel > Phone", "(202) 555-0142", "record", desc="Recipient's phone number.")

G = "Student"
E("studentFirstName", "Student First Name", G, "SCRFL", "b", "Schedules > Student", "Aaliyah", "record", desc="First name of the student on the placement.")
E("studentLastName", "Student Last Name", G, "SCRFL", "b", "Schedules > Student", "Washington", "record", desc="Last name of the student on the placement.")

G = "Schedule"
E("discipline", "Discipline", G, "SCRFL", "b", "Schedules / Requests > Discipline", "Nursing", "derived", desc="Discipline of the placement or request.")
E("specialization", "Specialization", G, "SCRFL", "b", "Schedules / Requests > Specialization", "Critical Care", "sample", desc="Specialization of the placement or request.")
E("preceptorFirstName", "Preceptor First Name", G, "SCRFL", "b", "Schedules > Preceptor", "Sandra", "record", desc="First name of the assigned preceptor.")
E("preceptorLastName", "Preceptor Last Name", G, "SCRFL", "b", "Schedules > Preceptor", "Okonkwo", "record", desc="Last name of the assigned preceptor.")
E("ciFirstName", "CI First Name", G, "SCRFL", "b", "Schedules > Clinical Instructor", "Denise", "derived", desc="First name of the school's clinical instructor.")
E("ciLastName", "CI Last Name", G, "SCRFL", "b", "Schedules > Clinical Instructor", "Carrington", "derived", desc="Last name of the school's clinical instructor.")
E("schoolContactFirstName", "School Contact First Name", G, "SCRFL", "b", "Slot Requests > Requested By; for a direct assignment, the school contact", "Renee", "record", desc="First name of the person who raised the request. For a directly assigned schedule, the school contact.")
E("schoolContactLastName", "School Contact Last Name", G, "SCRFL", "b", "Slot Requests > Requested By; for a direct assignment, the school contact", "Blackwell", "record", desc="Last name of the person who raised the request. For a directly assigned schedule, the school contact.")
E("scheduleTable", "Schedule Table", G, "SCRFL", "b", "Schedules list, selected columns", "Table: Schedule ID, Student, Location, Dates, Shift, Onboarding", "derived", "table", "A table of the placement: schedule ID, student, location, dates, shift and onboarding status.")

G = "Slot Request"
E("siteContactFirstName", "Site Contact First Name", G, "SCFRL", "c", "Availability > Added by", "Raymond", "record", desc="First name of the site contact who added the availability.")
E("siteContactLastName", "Site Contact Last Name", G, "SCFRL", "c", "Availability > Added by", "Castillo", "record", desc="Last name of the site contact who added the availability.")
E("requestedShifts", "Requested Shifts", G, "C", "c", "Slot Requests > Requested Shifts", "Day Shift (07:00 – 15:30)", "sample", desc="Shifts the school asked for.")
E("requestedDays", "Requested Days of the Week", G, "C", "c", "Slot Requests > Requested Days", "Mon, Tue, Wed, Thu, Fri", "sample", desc="Days of the week the school asked for.")
E("requestTable", "Request Table", G, "C", "c", "Slot Requests, request details", "Table: request details", "derived", "table", "A table of the request: ID, status, availability, experience type, discipline, specialization, program type, location, slots, duration, shifts and days.")

G = "Site Personnel"
E("associatedDisciplines", "Associated Disciplines", G, "FR", "b", "Personnel > Associated disciplines", "Nursing, Occupational Therapy", "record", desc="Disciplines of the locations the person is linked to.")

G = "Group Placement"
E("groupName", "Group Name", G, "SCRFL", "b", "Group Schedules > Group Name", "MedStar ICU – Fall 2026 Group", "derived", desc="Name of the group placement.")
E("groupId", "Group ID", G, "SCRFL", "b", "Group Schedules > Group ID", "GRP-6428101", "derived", desc="Identifier of the group placement.")
E("schoolProgramName", "School Program Name", G, "SCRFL", "b", "Group Schedules > Program", "BSN Pre-Licensure Nursing", "record", desc="The school program the group belongs to.")
E("groupAvailability", "Availability", G, "SCRFL", "b", "Group Schedules > Availability", "MedStar ICU – Fall 2026", "record", desc="Availability the group is placed in.")
E("groupSlots", "Group Slots", G, "SCRFL", "b", "Group Schedules > Slots", "3", "derived", "number", "Number of slots in the group.")
E("groupMembers", "Group Members", G, "SCRFL", "b", "Group Schedules > Members", "Aaliyah Washington, Marcus Okafor, Destiny Robinson", "derived", desc="Names of the students in the group.")
E("placementTable", "Placement Table", G, "SCRFL", "b", "Group Schedules, placement details", "Table: group placement details", "derived", "table", "A table of the group placement: location, dates, shift, days, discipline, preceptor and clinical instructor.")
E("groupDetailsLink", "Group Details Link", G, "SCRFL", "b", "Group Schedules > a group", "https://one.exxat.com/schedules/group/6428101", "tenant", "link", "Opens the group placement in Exxat One.")
E("groupMembersTable", "Group Members Detailed Table", G, "SCRFL", "b", "Group Schedules > Members", "Table: one row per student", "derived", "table", "A table with one row per student in the group: name, school, onboarding status and schedule status.")

REMOVED = {
 "phone": [
  "Recipient's own data",
  "Nobody emails someone their own phone number.",
  "Phone",
  "Recipient"
 ],
 "supportEmail": [
  "Duplicate",
  "Already printed in every email's footer.",
  "Support Email",
  "Sender & Organization"
 ],
 "contactPortalUrl": [
  "Duplicate",
  "Same link as Portal URL.",
  "Contact Portal URL",
  "Sender & Organization"
 ],
 "currentYear": [
  "Derivable",
  "Today's Date already covers it.",
  "Current Year",
  "Sender & Organization"
 ],
 "studentId": [
  "Internal value",
  "Internal identifier; means nothing to a student.",
  "Student ID",
  "Student"
 ],
 "graduationYearMonth": [
  "Not an email use case",
  "Collected on the request form; an email never states it.",
  "Graduation Year and Month",
  "Student"
 ],
 "profileShared": [
  "Internal value",
  "Internal site/school workflow flag.",
  "Student Profile Shared",
  "Student"
 ],
 "scheduleType": [
  "Internal value",
  "Group vs Individual is how staff filter the list, not something an email says.",
  "Schedule Type (Group / Individual)",
  "Schedule"
 ],
 "rotationStartDate": [
  "Duplicate",
  "Same as Schedule Start Date.",
  "Rotation Start Date",
  "Schedule"
 ],
 "rotationEndDate": [
  "Duplicate",
  "Same as Schedule End Date.",
  "Rotation End Date",
  "Schedule"
 ],
 "scheduleDuration": [
  "Derivable",
  "Schedule Date Range already says it.",
  "Schedule Duration",
  "Schedule"
 ],
 "daysUntilEnd": [
  "Not an email use case",
  "Start-side countdown covers reminders; an end countdown has no template.",
  "Days Until End",
  "Schedule"
 ],
 "supervisorName": [
  "Duplicate",
  "Same as Preceptor Name.",
  "Supervisor Name",
  "Schedule"
 ],
 "clinicalInstructorEmail": [
  "Sensitive",
  "Instructor name is enough; avoids circulating another person's email.",
  "Clinical Instructor Email",
  "Schedule"
 ],
 "rotationCourseDetails": [
  "Not an email use case",
  "No email use case; no confirmed live source.",
  "Rotation & Course Details",
  "Schedule"
 ],
 "prismProcessStatus": [
  "Internal value",
  "Internal workflow state.",
  "PRISM Process Status",
  "Schedule"
 ],
 "schoolRequirementsStatus": [
  "Duplicate",
  "Same information as Onboarding Status.",
  "School Requirements Status",
  "Schedule"
 ],
 "reportingLocation": [
  "Duplicate",
  "Same as Location Name.",
  "Reporting Location",
  "Location"
 ],
 "locationGroup": [
  "Internal value",
  "Internal grouping used for bulk management.",
  "Location Group",
  "Location"
 ],
 "locationStatus": [
  "Internal value",
  "Internal state.",
  "Location Status",
  "Location"
 ],
 "locationType": [
  "Internal value",
  "Internal classification.",
  "Location Type",
  "Location"
 ],
 "locationParent": [
  "Duplicate",
  "Same as Site / Hospital Name.",
  "Parent Organization",
  "Location"
 ],
 "locationDisciplines": [
  "Not an email use case",
  "Not something an email states.",
  "Associated Disciplines",
  "Location"
 ],
 "availabilityId": [
  "Internal value",
  "Availability Name and Request ID identify it.",
  "Availability ID",
  "Availability"
 ],
 "availabilityStatus": [
  "Internal value",
  "Internal state.",
  "Availability Status",
  "Availability"
 ],
 "totalSlots": [
  "Not an email use case",
  "Slot counts belong to the request (requested / approved).",
  "Total Slots",
  "Availability"
 ],
 "pendingRequests": [
  "Internal value",
  "Admin metric.",
  "Pending Requests",
  "Availability"
 ],
 "availabilityDuration": [
  "Duplicate",
  "Same as Start / End Date.",
  "Availability Duration",
  "Availability"
 ],
 "publishedOn": [
  "Internal value",
  "Internal date.",
  "Published On",
  "Availability"
 ],
 "studentYear": [
  "Not an email use case",
  "No email use case.",
  "Student Year",
  "Availability"
 ],
 "confirmedSlots": [
  "Duplicate",
  "Same as Approved Slot Count.",
  "Confirmed Slots",
  "Slot Request"
 ],
 "requestedByPortal": [
  "Internal value",
  "Internal.",
  "Requested By Portal",
  "Slot Request"
 ],
 "requestedShifts": [
  "Not an email use case",
  "Shift and Days of Week cover this once approved.",
  "Requested Shifts",
  "Slot Request"
 ],
 "requestedDaysOfWeek": [
  "Not an email use case",
  "Shift and Days of Week cover this once approved.",
  "Requested Days of Week",
  "Slot Request"
 ],
 "partnerCategory": [
  "Internal value",
  "Internal classification.",
  "Partner Category",
  "Slot Request"
 ],
 "schoolAlias": [
  "Not an email use case",
  "The school knows its own alias.",
  "School Alias",
  "School / Partner"
 ],
 "schoolCategory": [
  "Internal value",
  "Internal classification.",
  "School Category",
  "School / Partner"
 ],
 "schoolWebsite": [
  "Not an email use case",
  "No email use case.",
  "School Website",
  "School / Partner"
 ],
 "schoolAddress": [
  "Not an email use case",
  "The school knows its own address.",
  "School Address",
  "School / Partner"
 ],
 "schoolDisciplines": [
  "Not an email use case",
  "The school knows what it sends.",
  "School Disciplines",
  "School / Partner"
 ],
 "coordinatorName": [
  "Duplicate",
  "Same as Contact Name.",
  "Coordinator Name",
  "School / Partner"
 ],
 "schoolContactEmail": [
  "Recipient's own data",
  "The recipient's own email.",
  "Primary Contact Email",
  "School / Partner"
 ],
 "schoolContactPhone": [
  "Recipient's own data",
  "The recipient's own phone.",
  "Primary Contact Phone",
  "School / Partner"
 ],
 "programContactCount": [
  "Not an email use case",
  "Trivial on its own; the Program Contacts list is the useful form.",
  "Program Contact Count",
  "School / Partner"
 ],
 "partnerSince": [
  "Not an email use case",
  "No email use case.",
  "Partner Since",
  "School / Partner"
 ],
 "activeRequests": [
  "Internal value",
  "Admin metric.",
  "Open Request Count",
  "School / Partner"
 ],
 "contractsActive": [
  "Internal value",
  "A count; contract name and expiry carry the message.",
  "Active Contracts",
  "Contract"
 ],
 "contractsExpired": [
  "Internal value",
  "A count; contract name and expiry carry the message.",
  "Expired Contracts",
  "Contract"
 ],
 "contractType": [
  "Internal value",
  "Admin detail.",
  "Contract Type",
  "Contract"
 ],
 "contractStartDate": [
  "Not an email use case",
  "Expiry is what an email acts on.",
  "Contract Start Date",
  "Contract"
 ],
 "openEndedContract": [
  "Internal value",
  "Admin detail.",
  "Open Ended Contract",
  "Contract"
 ],
 "contractTemplateType": [
  "Internal value",
  "Admin detail.",
  "Contract Template Type",
  "Contract"
 ],
 "agreementExpiryDate": [
  "Duplicate",
  "Same as Contract Expiration Date.",
  "Agreement Expiry Date",
  "Contract"
 ],
 "contractRenewalDate": [
  "Duplicate",
  "Same as Contract Expiration Date.",
  "Contract Renewal Date",
  "Contract"
 ],
 "organization": [
  "Duplicate",
  "Same as School Name.",
  "Organization",
  "School / Partner"
 ],
 "designation": [
  "Duplicate",
  "Same as Role.",
  "Designation",
  "Site Personnel"
 ],
 "credentials": [
  "Not an email use case",
  "No email use case.",
  "Credentials",
  "Site Personnel"
 ],
 "npi": [
  "Sensitive",
  "Provider identifier; never belongs in an email.",
  "National Provider Identifier",
  "Site Personnel"
 ],
 "accessRole": [
  "Internal value",
  "Account-admin state; access emails have their own triggers.",
  "Access Role",
  "Site Personnel"
 ],
 "systemAccess": [
  "Internal value",
  "Account-admin state; access emails have their own triggers.",
  "System Access",
  "Site Personnel"
 ],
 "lastLogin": [
  "Internal value",
  "Account-admin state.",
  "Last Login",
  "Site Personnel"
 ],
 "staffStatus": [
  "Internal value",
  "Account-admin state.",
  "Staff Status",
  "Site Personnel"
 ],
 "associatedDisciplines": [
  "Not an email use case",
  "No email use case.",
  "Associated Disciplines",
  "Site Personnel"
 ],
 "name": [
  "Duplicate",
  "Same as Full Name (older templates only).",
  "Name",
  "Recipient"
 ],
 "assignedStudentEmail": [
  "Sensitive",
  "Name and school are enough.",
  "Assigned Student Email",
  "Preceptor"
 ],
 "facultyTitle": [
  "Not an email use case",
  "Low value.",
  "Faculty Title",
  "Placement Faculty / CI"
 ],
 "rosterCount": [
  "Not an email use case",
  "Low value.",
  "Roster Count",
  "Placement Faculty / CI"
 ],
 "jobType": [
  "Not an email use case",
  "The candidate knows the job; title and location suffice.",
  "Job Type",
  "Candidate & Job"
 ],
 "jobDiscipline": [
  "Not an email use case",
  "The candidate knows the job; title and location suffice.",
  "Job Discipline",
  "Candidate & Job"
 ],
 "jobPostedOn": [
  "Not an email use case",
  "No email use case.",
  "Job Posted On",
  "Candidate & Job"
 ],
 "currentTitle": [
  "Recipient's own data",
  "The candidate's own résumé data; do not echo it back.",
  "Current Title",
  "Candidate & Job"
 ],
 "currentEmployer": [
  "Recipient's own data",
  "The candidate's own résumé data; do not echo it back.",
  "Current Employer",
  "Candidate & Job"
 ],
 "yearsOfExperience": [
  "Recipient's own data",
  "The candidate's own résumé data; do not echo it back.",
  "Years of Experience",
  "Candidate & Job"
 ]
}
