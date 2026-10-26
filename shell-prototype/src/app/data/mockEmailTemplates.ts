// Audience types drive which merge fields a template can use.
export type AudienceType =
  | 'Student'
  | 'School Contact'
  | 'Partner Contact'
  | 'Staff-Personnel'
  | 'Candidate'
  | 'Preceptor'
  | 'Placement Faculty/CI';

// Site portal sections (locked — 5)
// School portal sections (locked — 3, no Jobs)
export type SiteSection = 'Slot Requests' | 'Schedules' | 'Onboarding' | 'Jobs' | 'General';
export type SchoolSection = 'Requests' | 'Schedules & Onboarding' | 'General';
export type EmailSection = SiteSection | SchoolSection;

export type PortalType = 'site' | 'school';

// SOURCE_BADGE resolution for a send (PRD 5.3). A screen that can plausibly be
// attributed to more than one badge — Schedules & Onboarding covers both — lists
// them as `candidates`; the send takes the badge matching its own template's
// section tag. No template, or a section outside the candidates (including an
// unset section), falls back to the screen's default badge.
export function resolveSourceSurface(
  fallback: string,
  candidates: readonly string[] | undefined,
  template: { section?: string } | null | undefined,
): string {
  const section = template?.section;
  return section && candidates?.includes(section) ? section : fallback;
}

export interface EmailTemplate {
  id: string;
  portal: PortalType;
  section: EmailSection;
  category: string;
  name: string;
  subject: string;
  body: string;           // HTML string rendered by the editor
  attachments: string[];  // mock filenames only — no actual files
  replyToOverride: string | null;
  audienceType: AudienceType;
  /** Bulk Email screens this template is offered on. Unset = every screen (templates users save). [] = kept in Email Setup but not offered in Bulk Email. */
  surfaces?: string[];
}

// ── SITE PORTAL TEMPLATES ───────────────────────────────────────────────────

// Slot Requests
const siteSlotRequestTemplates: EmailTemplate[] = [
  {
    id: 'tmpl-sr-001',
    surfaces: [],
    portal: 'site',
    section: 'Slot Requests',
    category: 'Approval',
    name: 'Slot Request Approved',
    subject: 'Your slot request for {{availabilityName}} has been approved',
    body: `<p>Dear {{schoolContactName}},</p>
<p>We are pleased to inform you that <strong>{{schoolName}}</strong>'s slot request for the following rotation has been <strong>approved</strong>:</p>
<ul>
  <li><strong>Rotation:</strong> {{availabilityName}}</li>
  <li><strong>Location:</strong> {{locationName}}</li>
  <li><strong>Dates:</strong> {{startDate}} – {{endDate}}</li>
  <li><strong>Slots Approved:</strong> {{approvedSlotCount}}</li>
</ul>
<p>Next steps: Please ensure all assigned students complete onboarding requirements at least two weeks before the rotation start date.</p>
<p>Questions? Reply to this email or contact your placement coordinator directly.</p>
<p>Best regards,<br><strong>{{senderName}}</strong><br>{{hospitalName}} Clinical Education Team</p>`,
    attachments: ['Onboarding_Checklist_MedStar.pdf'],
    replyToOverride: 'clinical.placements@medstarhealth.org',
    audienceType: 'School Contact',
  },
  {
    id: 'tmpl-sr-002',
    surfaces: [],
    portal: 'site',
    section: 'Slot Requests',
    category: 'Rejection',
    name: 'Slot Request Declined',
    subject: 'Update on your slot request for {{availabilityName}}',
    body: `<p>Dear {{schoolContactName}},</p>
<p>Thank you for submitting a slot request for <strong>{{availabilityName}}</strong>. After review, we are unable to accommodate this request at this time due to capacity constraints.</p>
<p>We encourage you to:</p>
<ul>
  <li>Review other available rotations in the <strong>Discover &amp; Engage</strong> section</li>
  <li>Submit a new request for the next available session</li>
  <li>Contact us directly if you have specific scheduling needs</li>
</ul>
<p>We value our partnership with {{schoolName}} and look forward to placing your students in future rotations.</p>
<p>Best regards,<br><strong>{{senderName}}</strong><br>{{hospitalName}} Clinical Education Team</p>`,
    attachments: [],
    replyToOverride: null,
    audienceType: 'School Contact',
  },
  {
    id: 'tmpl-sr-003',
    surfaces: [],
    portal: 'site',
    section: 'Slot Requests',
    category: 'Information Request',
    name: 'Additional Info Needed',
    subject: 'Action required: additional information for {{availabilityName}} request',
    body: `<p>Dear {{schoolContactName}},</p>
<p>We have received your slot request for <strong>{{availabilityName}}</strong> and are currently reviewing it. Before we can proceed, we need the following information:</p>
<ul>
  <li>Confirmation of student count and program year</li>
  <li>Faculty supervisor contact information</li>
  <li>Any special scheduling accommodations required</li>
</ul>
<p>Please reply to this email with the requested details within <strong>5 business days</strong> to avoid expiration of this request.</p>
<p>Best regards,<br><strong>{{senderName}}</strong><br>{{hospitalName}}</p>`,
    attachments: [],
    replyToOverride: null,
    audienceType: 'School Contact',
  },
];

// Schedules
const siteScheduleTemplates: EmailTemplate[] = [
  {
    id: 'tmpl-sch-001',
    surfaces: [],
    portal: 'site',
    section: 'Schedules',
    category: 'Confirmation',
    name: 'Schedule Confirmed',
    subject: 'Clinical rotation confirmed: {{studentName}} – {{rotationName}}',
    body: `<p>Dear {{studentName}},</p>
<p>Your clinical rotation has been confirmed. Please review the details below:</p>
<table style="border-collapse:collapse;width:100%;">
  <tr><td style="padding:6px;border:1px solid #e5e7eb;font-weight:600;">Rotation</td><td style="padding:6px;border:1px solid #e5e7eb;">{{rotationName}}</td></tr>
  <tr><td style="padding:6px;border:1px solid #e5e7eb;font-weight:600;">Site</td><td style="padding:6px;border:1px solid #e5e7eb;">{{locationName}}</td></tr>
  <tr><td style="padding:6px;border:1px solid #e5e7eb;font-weight:600;">Start Date</td><td style="padding:6px;border:1px solid #e5e7eb;">{{startDate}}</td></tr>
  <tr><td style="padding:6px;border:1px solid #e5e7eb;font-weight:600;">End Date</td><td style="padding:6px;border:1px solid #e5e7eb;">{{endDate}}</td></tr>
  <tr><td style="padding:6px;border:1px solid #e5e7eb;font-weight:600;">Preceptor</td><td style="padding:6px;border:1px solid #e5e7eb;">{{preceptorName}}</td></tr>
</table>
<p>Please log in to complete your onboarding checklist before <strong>{{onboardingDeadline}}</strong>.</p>
<p>We look forward to welcoming you to {{hospitalName}}.</p>
<p>Best regards,<br><strong>{{senderName}}</strong><br>Clinical Education Office</p>`,
    attachments: ['Parking_and_Directions_MedStar.pdf', 'Student_Orientation_Guide.pdf'],
    replyToOverride: null,
    audienceType: 'Student',
  },
  {
    id: 'tmpl-sch-002',
    surfaces: [],
    portal: 'site',
    section: 'Schedules',
    category: 'Change Notification',
    name: 'Schedule Updated',
    subject: 'Important update to your clinical rotation schedule',
    body: `<p>Dear {{studentName}},</p>
<p>We need to inform you of a change to your upcoming clinical rotation at <strong>{{hospitalName}}</strong>.</p>
<p><strong>What changed:</strong> {{changeDescription}}</p>
<p><strong>New details:</strong></p>
<ul>
  <li>Updated start date: <strong>{{newStartDate}}</strong></li>
  <li>Updated end date: <strong>{{newEndDate}}</strong></li>
  <li>Location: {{locationName}}</li>
</ul>
<p>If you have any concerns or conflicts with these new dates, please contact your school coordinator or reply to this email immediately.</p>
<p>We apologize for any inconvenience and appreciate your flexibility.</p>
<p>Best regards,<br><strong>{{senderName}}</strong></p>`,
    attachments: [],
    replyToOverride: null,
    audienceType: 'Student',
  },
  {
    id: 'tmpl-sch-003',
    surfaces: [],
    portal: 'site',
    section: 'Schedules',
    category: 'Reminder',
    name: 'Rotation Starting Soon',
    subject: 'Reminder: your clinical rotation begins {{daysUntilStart}} days from now',
    body: `<p>Dear {{studentName}},</p>
<p>This is a friendly reminder that your clinical rotation at <strong>{{hospitalName}}</strong> begins on <strong>{{startDate}}</strong> — just {{daysUntilStart}} days away.</p>
<p>Before you arrive, please make sure you have:</p>
<ul>
  <li>Completed all onboarding checklist items in Exxat One</li>
  <li>Uploaded required documents (immunization records, background check, etc.)</li>
  <li>Reviewed the orientation materials provided</li>
  <li>Confirmed your schedule with your school coordinator</li>
</ul>
<p>Your onboarding completion status: <strong>{{onboardingStatus}}</strong></p>
<p>Questions? Contact {{preceptorName}} at {{preceptorEmail}}.</p>
<p>Best regards,<br><strong>{{senderName}}</strong></p>`,
    attachments: [],
    replyToOverride: null,
    audienceType: 'Student',
  },
];

// Onboarding
const siteOnboardingTemplates: EmailTemplate[] = [
  {
    id: 'tmpl-ob-001',
    surfaces: [],
    portal: 'site',
    section: 'Onboarding',
    category: 'Welcome',
    name: 'Welcome to Onboarding',
    subject: 'Welcome! Complete your onboarding for {{rotationName}}',
    body: `<p>Dear {{studentName}},</p>
<p>Welcome to <strong>{{hospitalName}}</strong>! We're excited to have you join us for your clinical rotation.</p>
<p>To get started, please log in to Exxat One and complete your onboarding checklist. You'll need to provide:</p>
<ul>
  <li>Proof of immunizations (Flu, MMR, Hepatitis B, Varicella, TB)</li>
  <li>Background check authorization</li>
  <li>Drug screen consent</li>
  <li>CPR/BLS certification (current)</li>
  <li>Health insurance documentation</li>
</ul>
<p>Please complete all requirements by <strong>{{onboardingDeadline}}</strong>. Students who are not compliant by the deadline may not be permitted to begin their rotation.</p>
<p><a href="{{loginUrl}}" style="background:var(--color-blue-500);color:#fff;padding:8px 16px;border-radius:4px;text-decoration:none;">Complete Onboarding</a></p>
<p>Best regards,<br><strong>{{senderName}}</strong><br>{{hospitalName}} Clinical Education</p>`,
    attachments: ['Onboarding_Requirements_2026.pdf'],
    replyToOverride: 'onboarding@medstarhealth.org',
    audienceType: 'Student',
  },
  {
    id: 'tmpl-ob-002',
    surfaces: [],
    portal: 'site',
    section: 'Onboarding',
    category: 'Reminder',
    name: 'Incomplete Documents Reminder',
    subject: 'Action required: {{daysUntilDeadline}} days left to complete onboarding',
    body: `<p>Dear {{studentName}},</p>
<p>Your onboarding for <strong>{{rotationName}}</strong> at {{hospitalName}} is not yet complete. Your deadline is <strong>{{onboardingDeadline}}</strong>.</p>
<p>The following items are still outstanding:</p>
<ul>{{#each outstandingItems}}<li>{{this}}</li>{{/each}}</ul>
<p>Students who do not meet the compliance deadline will not be cleared to start their rotation. Please log in now and upload any missing documents.</p>
<p><a href="{{loginUrl}}" style="background:var(--color-blue-500);color:#fff;padding:8px 16px;border-radius:4px;text-decoration:none;">Go to My Onboarding</a></p>
<p>Best regards,<br><strong>{{senderName}}</strong></p>`,
    attachments: [],
    replyToOverride: null,
    audienceType: 'Student',
  },
  {
    id: 'tmpl-ob-003',
    surfaces: [],
    portal: 'site',
    section: 'Onboarding',
    category: 'Compliance Cleared',
    name: 'Onboarding Complete – Cleared to Start',
    subject: 'You\'re cleared! Onboarding complete for {{rotationName}}',
    body: `<p>Dear {{studentName}},</p>
<p>Great news — you have successfully completed all onboarding requirements for your rotation at <strong>{{hospitalName}}</strong>. You are now <strong>cleared to begin</strong> on {{startDate}}.</p>
<p>What to bring on your first day:</p>
<ul>
  <li>Government-issued photo ID</li>
  <li>School ID / badge</li>
  <li>Printed copy of your schedule confirmation</li>
  <li>Appropriate clinical attire per {{hospitalName}} dress code</li>
</ul>
<p>We look forward to seeing you on <strong>{{startDate}}</strong> at <strong>{{reportingLocation}}</strong>.</p>
<p>Best regards,<br><strong>{{senderName}}</strong><br>{{hospitalName}} Clinical Education</p>`,
    attachments: ['First_Day_Instructions_MedStar.pdf'],
    replyToOverride: null,
    audienceType: 'Student',
  },
];

// Jobs
const siteJobsTemplates: EmailTemplate[] = [
  {
    id: 'tmpl-jb-001',
    surfaces: ['site.jobCandidates'],
    portal: 'site',
    section: 'Jobs',
    category: 'Application Received',
    name: 'Application Received',
    subject: 'We received your application for {{jobTitle}} at {{hospitalName}}',
    body: `<p>Dear {{candidateName}},</p>
<p>Thank you for applying for the <strong>{{jobTitle}}</strong> position at <strong>{{hospitalName}}</strong>. We have received your application and our team is reviewing it.</p>
<p>Here's what happens next:</p>
<ol>
  <li>Our recruiting team reviews your application (typically within 5–7 business days)</li>
  <li>Qualified candidates are contacted for a phone screen</li>
  <li>Selected candidates are invited for an on-site or virtual interview</li>
</ol>
<p>You can track your application status at any time through the candidate portal.</p>
<p>Thank you for your interest in joining {{hospitalName}}. We'll be in touch soon.</p>
<p>Best regards,<br><strong>{{senderName}}</strong><br>{{hospitalName}} Talent Acquisition</p>`,
    attachments: [],
    replyToOverride: 'recruiting@medstarhealth.org',
    audienceType: 'Candidate',
  },
  {
    id: 'tmpl-jb-002',
    surfaces: ['site.jobCandidates'],
    portal: 'site',
    section: 'Jobs',
    category: 'Interview',
    name: 'Interview Invitation',
    subject: 'Interview invitation: {{jobTitle}} at {{hospitalName}}',
    body: `<p>Dear {{candidateName}},</p>
<p>We were impressed with your background and would like to invite you to interview for the <strong>{{jobTitle}}</strong> role at {{hospitalName}}.</p>
<p><strong>Interview Details:</strong></p>
<ul>
  <li><strong>Date:</strong> {{interviewDate}}</li>
  <li><strong>Time:</strong> {{interviewTime}}</li>
  <li><strong>Format:</strong> {{interviewFormat}}</li>
  <li><strong>Interviewer:</strong> {{interviewerName}}, {{interviewerTitle}}</li>
</ul>
<p>Please confirm your availability by replying to this email by <strong>{{confirmationDeadline}}</strong>.</p>
<p>Best regards,<br><strong>{{senderName}}</strong><br>{{hospitalName}} Talent Acquisition</p>`,
    attachments: [],
    replyToOverride: null,
    audienceType: 'Candidate',
  },
  {
    id: 'tmpl-jb-003',
    surfaces: ['site.jobCandidates'],
    portal: 'site',
    section: 'Jobs',
    category: 'Offer',
    name: 'Offer Letter',
    subject: 'Offer of employment: {{jobTitle}} at {{hospitalName}}',
    body: `<p>Dear {{candidateName}},</p>
<p>On behalf of <strong>{{hospitalName}}</strong>, I am pleased to extend an offer of employment for the position of <strong>{{jobTitle}}</strong>.</p>
<p><strong>Offer Summary:</strong></p>
<ul>
  <li><strong>Position:</strong> {{jobTitle}}</li>
  <li><strong>Department:</strong> {{department}}</li>
  <li><strong>Start Date:</strong> {{proposedStartDate}}</li>
  <li><strong>Compensation:</strong> {{compensation}}</li>
</ul>
<p>Please review the attached offer letter and return a signed copy by <strong>{{offerExpirationDate}}</strong>.</p>
<p>We are excited to have you join our team!</p>
<p>Best regards,<br><strong>{{senderName}}</strong><br>{{hospitalName}} Human Resources</p>`,
    attachments: ['Offer_Letter_Template.pdf', 'Benefits_Overview_2026.pdf'],
    replyToOverride: 'hr@medstarhealth.org',
    audienceType: 'Candidate',
  },
];

// Site General
const siteGeneralTemplates: EmailTemplate[] = [
  {
    id: 'tmpl-sg-001',
    surfaces: [],
    portal: 'site',
    section: 'General',
    category: 'Announcement',
    name: 'System Announcement',
    subject: 'Important announcement from {{hospitalName}} Clinical Education',
    body: `<p>Dear {{recipientName}},</p>
<p>We have an important update to share with our school partners and students.</p>
<p>{{announcementBody}}</p>
<p>If you have any questions, please don't hesitate to reach out.</p>
<p>Best regards,<br><strong>{{senderName}}</strong><br>{{hospitalName}} Clinical Education</p>`,
    attachments: [],
    replyToOverride: null,
    audienceType: 'Partner Contact',
  },
  {
    id: 'tmpl-sg-002',
    surfaces: [],
    portal: 'site',
    section: 'General',
    category: 'Staff Communication',
    name: 'Staff Notification',
    subject: 'Staff update: {{subject}}',
    body: `<p>Dear {{staffName}},</p>
<p>This is a notification from the Clinical Education team regarding: <strong>{{subject}}</strong>.</p>
<p>{{messageBody}}</p>
<p>Please acknowledge receipt by replying to this email.</p>
<p>Best regards,<br><strong>{{senderName}}</strong></p>`,
    attachments: [],
    replyToOverride: null,
    audienceType: 'Staff-Personnel',
  },
];

// ── SCHOOL PORTAL TEMPLATES ─────────────────────────────────────────────────

// Requests (school-side mirror of site's Slot Requests)
const schoolRequestTemplates: EmailTemplate[] = [
  {
    id: 'tmpl-req-001',
    surfaces: [],
    portal: 'school',
    section: 'Requests',
    category: 'Status Update',
    name: 'Request Approved – Notify Coordinator',
    subject: 'Great news: slot request approved for {{availabilityName}}',
    body: `<p>Dear {{coordinatorName}},</p>
<p>Your slot request for <strong>{{availabilityName}}</strong> at <strong>{{hospitalName}}</strong> has been <strong>approved</strong>.</p>
<p><strong>Approved Details:</strong></p>
<ul>
  <li>Slots approved: {{approvedSlotCount}}</li>
  <li>Rotation dates: {{startDate}} – {{endDate}}</li>
  <li>Location: {{locationName}}</li>
</ul>
<p>Next steps: assign students to this rotation in Exxat One and ensure they complete onboarding by the site's deadline.</p>
<p>Best regards,<br><strong>{{senderName}}</strong><br>{{schoolName}} Clinical Education</p>`,
    attachments: [],
    replyToOverride: null,
    audienceType: 'School Contact',
  },
  {
    id: 'tmpl-req-002',
    surfaces: [],
    portal: 'school',
    section: 'Requests',
    category: 'Status Update',
    name: 'Request Declined – Notify Coordinator',
    subject: 'Slot request update for {{availabilityName}}',
    body: `<p>Dear {{coordinatorName}},</p>
<p>We received notice that your slot request for <strong>{{availabilityName}}</strong> at <strong>{{hospitalName}}</strong> was not approved at this time.</p>
<p>We recommend:</p>
<ul>
  <li>Searching for alternative availabilities via Discover &amp; Engage</li>
  <li>Reaching out directly to the site contact to discuss future opportunities</li>
  <li>Submitting requests for upcoming sessions in advance</li>
</ul>
<p>Best regards,<br><strong>{{senderName}}</strong><br>{{schoolName}}</p>`,
    attachments: [],
    replyToOverride: null,
    audienceType: 'School Contact',
  },
  {
    id: 'tmpl-req-003',
    surfaces: ['school.requests'],
    portal: 'school',
    section: 'Requests',
    category: 'Reminder',
    name: 'Follow up on pending requests',
    subject: 'Follow-up: request {{requestId}} for {{availabilityName}} is still pending',
    body: `<p>Dear {{siteContactFirstName}},</p>
<p>This is a follow-up on our request for <strong>{{availabilityName}}</strong> at {{requestedLocation}}, which is still <strong>{{slotStatus}}</strong>. The details are below.</p>
{{requestTable}}
<p>If you need any more information from us, please reply to this email or open the request in Exxat One: {{requestDetailLink}}</p>
<p>Best regards,<br><strong>{{senderName}}</strong></p>`,
    attachments: [],
    replyToOverride: null,
    audienceType: 'School Contact',
  },
];

// Schedules & Onboarding (school side)
const schoolSchedulesOnboardingTemplates: EmailTemplate[] = [
  {
    id: 'tmpl-so-001',
    surfaces: [],
    portal: 'school',
    section: 'Schedules & Onboarding',
    category: 'Student Notification',
    name: 'Student Placed – Start Onboarding',
    subject: 'You\'ve been placed! Begin onboarding for {{rotationName}}',
    body: `<p>Dear {{studentName}},</p>
<p>You have been assigned to the following clinical rotation. Please log in to Exxat One immediately to begin your onboarding process.</p>
<p><strong>Your Rotation:</strong></p>
<ul>
  <li><strong>Site:</strong> {{hospitalName}}</li>
  <li><strong>Location:</strong> {{locationName}}</li>
  <li><strong>Dates:</strong> {{startDate}} – {{endDate}}</li>
  <li><strong>Onboarding Deadline:</strong> <span style="color:#dc2626;">{{onboardingDeadline}}</span></li>
</ul>
<p>You must be fully compliant before your rotation begins. Missing the deadline may result in removal from this placement.</p>
<p><a href="{{loginUrl}}" style="background:var(--color-blue-500);color:#fff;padding:8px 16px;border-radius:4px;text-decoration:none;">Log in to Exxat One</a></p>
<p>Best regards,<br><strong>{{senderName}}</strong><br>{{schoolName}} Clinical Education</p>`,
    attachments: [],
    replyToOverride: null,
    audienceType: 'Student',
  },
  {
    id: 'tmpl-so-002',
    surfaces: [],
    portal: 'school',
    section: 'Schedules & Onboarding',
    category: 'Compliance Alert',
    name: 'Non-Compliant Student Alert',
    subject: 'Action required: {{studentName}} is non-compliant for {{rotationName}}',
    body: `<p>Dear {{coordinatorName}},</p>
<p>This is an alert that <strong>{{studentName}}</strong> is currently <strong>non-compliant</strong> for their upcoming rotation at <strong>{{hospitalName}}</strong> ({{startDate}}).</p>
<p><strong>Outstanding Items:</strong></p>
<ul>{{#each outstandingItems}}<li>{{this}}</li>{{/each}}</ul>
<p>The student has been notified directly. If they do not achieve compliance by <strong>{{onboardingDeadline}}</strong>, they may be removed from the rotation.</p>
<p>Please follow up with the student directly if needed.</p>
<p>Best regards,<br><strong>{{senderName}}</strong><br>{{schoolName}} Clinical Placement Office</p>`,
    attachments: [],
    replyToOverride: null,
    audienceType: 'School Contact',
  },
];

// School General
const schoolGeneralTemplates: EmailTemplate[] = [
  {
    id: 'tmpl-scg-001',
    surfaces: [],
    portal: 'school',
    section: 'General',
    category: 'Program Update',
    name: 'Program Policy Update',
    subject: 'Program update from {{schoolName}} Clinical Education',
    body: `<p>Dear {{recipientName}},</p>
<p>We have an important update regarding clinical education policies at <strong>{{schoolName}}</strong>.</p>
<p>{{updateBody}}</p>
<p>Please review and acknowledge this update by <strong>{{acknowledgeByDate}}</strong>.</p>
<p>Best regards,<br><strong>{{senderName}}</strong><br>{{schoolName}}</p>`,
    attachments: [],
    replyToOverride: null,
    audienceType: 'Student',
  },
  {
    id: 'tmpl-scg-002',
    surfaces: [],
    portal: 'school',
    section: 'General',
    category: 'General Notice',
    name: 'General Student Notice',
    subject: '{{schoolName}} Clinical Education: {{subject}}',
    body: `<p>Dear {{studentName}},</p>
<p>{{messageBody}}</p>
<p>If you have any questions, please contact the Clinical Education office.</p>
<p>Best regards,<br><strong>{{senderName}}</strong><br>{{schoolName}} Clinical Education</p>`,
    attachments: [],
    replyToOverride: null,
    audienceType: 'Student',
  },
];

// Preceptor + Placement Faculty/CI (PRD 5.2 audiences). Tokens are the ones in each
// audience's merge-field table (Email Configuration), nothing else.
const siteNewAudienceTemplates: EmailTemplate[] = [
  {
    id: 'tmpl-prec-001',
    surfaces: [],
    portal: 'site',
    section: 'General',
    category: 'Availability',
    name: 'Request Availability',
    subject: 'Please confirm your availability at {{locationName}}',
    body: `<p>Dear {{preceptorName}},</p>
<p>We're planning upcoming clinical rotations at <strong>{{siteName}}</strong>, {{locationName}}, and would like to confirm your availability to precept students on the <strong>{{shift}}</strong> shift.</p>
<p>Please reply with the dates you can host a student, or let us know if anything has changed.</p>
<p>Thank you for everything you do for our students.<br><strong>Clinical Education Team</strong></p>`,
    attachments: [],
    replyToOverride: null,
    audienceType: 'Preceptor',
  },
  {
    id: 'tmpl-prec-002',
    surfaces: [],
    portal: 'site',
    section: 'Schedules',
    category: 'Schedule Published',
    name: 'Schedule Published — Preceptor Assignment',
    subject: 'Your student schedule is published: {{assignedScheduleRef}}',
    body: `<p>Dear {{preceptorName}},</p>
<p>The schedule <strong>{{assignedScheduleRef}}</strong> has been published, and you are assigned as preceptor at {{locationName}} ({{siteName}}) on the <strong>{{shift}}</strong> shift.</p>
<p>Please review the schedule and reach out if you see a conflict.</p>
<p>Best regards,<br><strong>Clinical Education Team</strong></p>`,
    attachments: [],
    replyToOverride: null,
    audienceType: 'Preceptor',
  },
  {
    id: 'tmpl-fac-001',
    surfaces: [],
    portal: 'site',
    section: 'Schedules',
    category: 'Schedule Published',
    name: 'Rotation Schedule Published — Faculty',
    subject: 'Rotation schedule published for {{studentRosterRef}}',
    body: `<p>Dear {{facultyName}},</p>
<p>Clinical placements for <strong>{{studentRosterRef}}</strong> at {{schoolName}} have been scheduled and are now visible in Exxat One.</p>
<p>Please review your students' rotation dates and locations, and let us know if anything needs to change.</p>
<p>Best regards,<br><strong>Clinical Education Team</strong></p>`,
    attachments: [],
    replyToOverride: null,
    audienceType: 'Placement Faculty/CI',
  },
  {
    id: 'tmpl-fac-002',
    surfaces: [],
    portal: 'site',
    section: 'General',
    category: 'Placement Update',
    name: 'Clinical Placement Update — Faculty',
    subject: 'Clinical placement update for {{studentRosterRef}}',
    body: `<p>Dear {{facultyName}},</p>
<p>We have an update on clinical placements for <strong>{{studentRosterRef}}</strong> from {{schoolName}}.</p>
<p>Please review the details in Exxat One and contact the Clinical Education team with any questions.</p>
<p>Thank you,<br><strong>Clinical Education Team</strong></p>`,
    attachments: [],
    replyToOverride: null,
    audienceType: 'Placement Faculty/CI',
  },
];

// ── COMBINED EXPORT ──────────────────────────────────────────────────────────

// Standard templates for the Schedules screens, from Harshavardhan Martur's list of 2026-10-26: five audiences for an
// individual placement and the same five for a group placement. They use only fields on those screens' lists.
// Students get a letter about their own placement; everyone else gets one email with a table of every ticked placement.
const IND_SURFACES = ['site.schedules', 'site.locationSchedules', 'site.partnerSchedules', 'school.schedules'];
const GRP_SURFACES = IND_SURFACES.map((k) => `${k}.group`);
const scheduleStandardTemplates: EmailTemplate[] = [
  {
    id: 'tmpl-std-site-ind-1',
    portal: 'site',
    section: 'Schedules',
    category: 'Reminder',
    name: "Students \u2013 Reminder to complete their onboarding",
    subject: "Reminder: complete your onboarding before your placement",
    body: "<p>Dear {{firstName}},</p><p>This is a reminder to complete your onboarding for your placement at {{locationName}} ({{scheduleDateRange}}). Your onboarding status is currently <strong>{{onboardingStatus}}</strong>, and it needs to be complete by <strong>{{onboardingDeadline}}</strong>.</p><p>Still outstanding:</p><ul>{{#each outstandingItems}}<li>{{this}}</li>{{/each}}</ul><p>View your placement: {{scheduleDetailLink}}</p><p>Best regards,<br>{{senderName}}</p>",
    attachments: [],
    replyToOverride: null,
    audienceType: 'Student',
    surfaces: IND_SURFACES,
  },
  {
    id: 'tmpl-std-site-ind-2',
    portal: 'site',
    section: 'Schedules',
    category: 'Placement Update',
    name: "Preceptor \u2013 Inform about their placement",
    subject: "Your upcoming placements",
    body: "<p>Dear {{firstName}},</p><p>For your information, the following placements have been assigned to you.</p>{{scheduleTable}}<p>Details: {{scheduleDetailLink}}</p><p>Best regards,<br>{{senderName}}</p>",
    attachments: [],
    replyToOverride: null,
    audienceType: 'Preceptor',
    surfaces: IND_SURFACES,
  },
  {
    id: 'tmpl-std-site-ind-3',
    portal: 'site',
    section: 'Schedules',
    category: 'Reminder',
    name: "Schools \u2013 Reminder to complete their onboarding",
    subject: "Reminder: student onboarding for upcoming placements",
    body: "<p>Dear {{firstName}},</p><p>Below is the onboarding status for the placements we are writing about. Please remind any student who has not finished to complete onboarding by the date shown.</p>{{scheduleTable}}<p>Details: {{scheduleDetailLink}}</p><p>Best regards,<br>{{senderName}}</p>",
    attachments: [],
    replyToOverride: null,
    audienceType: 'School Contact',
    surfaces: IND_SURFACES,
  },
  {
    id: 'tmpl-std-site-ind-4',
    portal: 'site',
    section: 'Schedules',
    category: 'Reminder',
    name: "CI \u2013 Reminder to complete their onboarding",
    subject: "Reminder: student onboarding for upcoming placements",
    body: "<p>Dear {{firstName}},</p><p>Below is the onboarding status for your students' placements. Please remind anyone who has not finished to complete onboarding by the date shown.</p>{{scheduleTable}}<p>Details: {{scheduleDetailLink}}</p><p>Best regards,<br>{{senderName}}</p>",
    attachments: [],
    replyToOverride: null,
    audienceType: 'Placement Faculty/CI',
    surfaces: IND_SURFACES,
  },
  {
    id: 'tmpl-std-site-ind-5',
    portal: 'site',
    section: 'Schedules',
    category: 'Placement Update',
    name: "Location Co-ordinators \u2013 Inform about the placements",
    subject: "Upcoming placements at your location",
    body: "<p>Dear {{firstName}},</p><p>For your information, the following placements are coming to your location.</p>{{scheduleTable}}<p>Details: {{scheduleDetailLink}}</p><p>Best regards,<br>{{senderName}}</p>",
    attachments: [],
    replyToOverride: null,
    audienceType: 'Staff-Personnel',
    surfaces: IND_SURFACES,
  },
  {
    id: 'tmpl-std-site-grp-6',
    portal: 'site',
    section: 'Schedules',
    category: 'Reminder',
    name: "Students \u2013 Reminder to complete their onboarding for group placement",
    subject: "Reminder: complete your onboarding for your group placement",
    body: "<p>Dear {{firstName}},</p><p>This is a reminder to complete your onboarding for your group placement at {{locationName}} ({{scheduleDateRange}}). Your onboarding status is currently <strong>{{onboardingStatus}}</strong>, and it needs to be complete by <strong>{{onboardingDeadline}}</strong>.</p><p>Still outstanding:</p><ul>{{#each outstandingItems}}<li>{{this}}</li>{{/each}}</ul><p>View your group placement: {{groupDetailsLink}}</p><p>Best regards,<br>{{senderName}}</p>",
    attachments: [],
    replyToOverride: null,
    audienceType: 'Student',
    surfaces: GRP_SURFACES,
  },
  {
    id: 'tmpl-std-site-grp-7',
    portal: 'site',
    section: 'Schedules',
    category: 'Placement Update',
    name: "Preceptor \u2013 Inform about the group placement",
    subject: "Your upcoming group placements",
    body: "<p>Dear {{firstName}},</p><p>For your information, the following group placements have been assigned to you.</p>{{placementTable}}<p>Members:</p>{{groupMembersTable}}<p>Details: {{groupDetailsLink}}</p><p>Best regards,<br>{{senderName}}</p>",
    attachments: [],
    replyToOverride: null,
    audienceType: 'Preceptor',
    surfaces: GRP_SURFACES,
  },
  {
    id: 'tmpl-std-site-grp-8',
    portal: 'site',
    section: 'Schedules',
    category: 'Reminder',
    name: "Schools \u2013 Reminder to complete their onboarding for group placement",
    subject: "Reminder: onboarding for upcoming group placements",
    body: "<p>Dear {{firstName}},</p><p>Below is the onboarding status for the group placements we are writing about. Please remind any student who has not finished to complete onboarding by the date shown.</p>{{placementTable}}<p>Members:</p>{{groupMembersTable}}<p>Details: {{groupDetailsLink}}</p><p>Best regards,<br>{{senderName}}</p>",
    attachments: [],
    replyToOverride: null,
    audienceType: 'School Contact',
    surfaces: GRP_SURFACES,
  },
  {
    id: 'tmpl-std-site-grp-9',
    portal: 'site',
    section: 'Schedules',
    category: 'Reminder',
    name: "CI \u2013 Reminder to complete their onboarding for group placement",
    subject: "Reminder: onboarding for upcoming group placements",
    body: "<p>Dear {{firstName}},</p><p>Below is the onboarding status for your students' group placements. Please remind anyone who has not finished to complete onboarding by the date shown.</p>{{placementTable}}<p>Members:</p>{{groupMembersTable}}<p>Details: {{groupDetailsLink}}</p><p>Best regards,<br>{{senderName}}</p>",
    attachments: [],
    replyToOverride: null,
    audienceType: 'Placement Faculty/CI',
    surfaces: GRP_SURFACES,
  },
  {
    id: 'tmpl-std-site-grp-10',
    portal: 'site',
    section: 'Schedules',
    category: 'Placement Update',
    name: "Location Co-ordinators \u2013 Inform about the group placements",
    subject: "Upcoming group placements at your location",
    body: "<p>Dear {{firstName}},</p><p>For your information, the following group placements are coming to your location.</p>{{placementTable}}<p>Members:</p>{{groupMembersTable}}<p>Details: {{groupDetailsLink}}</p><p>Best regards,<br>{{senderName}}</p>",
    attachments: [],
    replyToOverride: null,
    audienceType: 'Staff-Personnel',
    surfaces: GRP_SURFACES,
  },
  {
    id: 'tmpl-std-school-ind-11',
    portal: 'school',
    section: 'Schedules & Onboarding',
    category: 'Reminder',
    name: "Students \u2013 Reminder to complete their onboarding",
    subject: "Reminder: complete your onboarding before your placement",
    body: "<p>Dear {{firstName}},</p><p>This is a reminder to complete your onboarding for your placement at {{locationName}} ({{scheduleDateRange}}). Your onboarding status is currently <strong>{{onboardingStatus}}</strong>, and it needs to be complete by <strong>{{onboardingDeadline}}</strong>.</p><p>Still outstanding:</p><ul>{{#each outstandingItems}}<li>{{this}}</li>{{/each}}</ul><p>View your placement: {{scheduleDetailLink}}</p><p>Best regards,<br>{{senderName}}</p>",
    attachments: [],
    replyToOverride: null,
    audienceType: 'Student',
    surfaces: IND_SURFACES,
  },
  {
    id: 'tmpl-std-school-ind-12',
    portal: 'school',
    section: 'Schedules & Onboarding',
    category: 'Placement Update',
    name: "Preceptor \u2013 Inform about their placement",
    subject: "Your upcoming placements",
    body: "<p>Dear {{firstName}},</p><p>For your information, the following placements have been assigned to you.</p>{{scheduleTable}}<p>Details: {{scheduleDetailLink}}</p><p>Best regards,<br>{{senderName}}</p>",
    attachments: [],
    replyToOverride: null,
    audienceType: 'Preceptor',
    surfaces: IND_SURFACES,
  },
  {
    id: 'tmpl-std-school-ind-13',
    portal: 'school',
    section: 'Schedules & Onboarding',
    category: 'Reminder',
    name: "Schools \u2013 Reminder to complete their onboarding",
    subject: "Reminder: student onboarding for upcoming placements",
    body: "<p>Dear {{firstName}},</p><p>Below is the onboarding status for the placements we are writing about. Please remind any student who has not finished to complete onboarding by the date shown.</p>{{scheduleTable}}<p>Details: {{scheduleDetailLink}}</p><p>Best regards,<br>{{senderName}}</p>",
    attachments: [],
    replyToOverride: null,
    audienceType: 'School Contact',
    surfaces: IND_SURFACES,
  },
  {
    id: 'tmpl-std-school-ind-14',
    portal: 'school',
    section: 'Schedules & Onboarding',
    category: 'Reminder',
    name: "CI \u2013 Reminder to complete their onboarding",
    subject: "Reminder: student onboarding for upcoming placements",
    body: "<p>Dear {{firstName}},</p><p>Below is the onboarding status for your students' placements. Please remind anyone who has not finished to complete onboarding by the date shown.</p>{{scheduleTable}}<p>Details: {{scheduleDetailLink}}</p><p>Best regards,<br>{{senderName}}</p>",
    attachments: [],
    replyToOverride: null,
    audienceType: 'Placement Faculty/CI',
    surfaces: IND_SURFACES,
  },
  {
    id: 'tmpl-std-school-ind-15',
    portal: 'school',
    section: 'Schedules & Onboarding',
    category: 'Placement Update',
    name: "Location Co-ordinators \u2013 Inform about the placements",
    subject: "Upcoming placements at your location",
    body: "<p>Dear {{firstName}},</p><p>For your information, the following placements are coming to your location.</p>{{scheduleTable}}<p>Details: {{scheduleDetailLink}}</p><p>Best regards,<br>{{senderName}}</p>",
    attachments: [],
    replyToOverride: null,
    audienceType: 'Staff-Personnel',
    surfaces: IND_SURFACES,
  },
  {
    id: 'tmpl-std-school-grp-16',
    portal: 'school',
    section: 'Schedules & Onboarding',
    category: 'Reminder',
    name: "Students \u2013 Reminder to complete their onboarding for group placement",
    subject: "Reminder: complete your onboarding for your group placement",
    body: "<p>Dear {{firstName}},</p><p>This is a reminder to complete your onboarding for your group placement at {{locationName}} ({{scheduleDateRange}}). Your onboarding status is currently <strong>{{onboardingStatus}}</strong>, and it needs to be complete by <strong>{{onboardingDeadline}}</strong>.</p><p>Still outstanding:</p><ul>{{#each outstandingItems}}<li>{{this}}</li>{{/each}}</ul><p>View your group placement: {{groupDetailsLink}}</p><p>Best regards,<br>{{senderName}}</p>",
    attachments: [],
    replyToOverride: null,
    audienceType: 'Student',
    surfaces: GRP_SURFACES,
  },
  {
    id: 'tmpl-std-school-grp-17',
    portal: 'school',
    section: 'Schedules & Onboarding',
    category: 'Placement Update',
    name: "Preceptor \u2013 Inform about the group placement",
    subject: "Your upcoming group placements",
    body: "<p>Dear {{firstName}},</p><p>For your information, the following group placements have been assigned to you.</p>{{placementTable}}<p>Members:</p>{{groupMembersTable}}<p>Details: {{groupDetailsLink}}</p><p>Best regards,<br>{{senderName}}</p>",
    attachments: [],
    replyToOverride: null,
    audienceType: 'Preceptor',
    surfaces: GRP_SURFACES,
  },
  {
    id: 'tmpl-std-school-grp-18',
    portal: 'school',
    section: 'Schedules & Onboarding',
    category: 'Reminder',
    name: "Schools \u2013 Reminder to complete their onboarding for group placement",
    subject: "Reminder: onboarding for upcoming group placements",
    body: "<p>Dear {{firstName}},</p><p>Below is the onboarding status for the group placements we are writing about. Please remind any student who has not finished to complete onboarding by the date shown.</p>{{placementTable}}<p>Members:</p>{{groupMembersTable}}<p>Details: {{groupDetailsLink}}</p><p>Best regards,<br>{{senderName}}</p>",
    attachments: [],
    replyToOverride: null,
    audienceType: 'School Contact',
    surfaces: GRP_SURFACES,
  },
  {
    id: 'tmpl-std-school-grp-19',
    portal: 'school',
    section: 'Schedules & Onboarding',
    category: 'Reminder',
    name: "CI \u2013 Reminder to complete their onboarding for group placement",
    subject: "Reminder: onboarding for upcoming group placements",
    body: "<p>Dear {{firstName}},</p><p>Below is the onboarding status for your students' group placements. Please remind anyone who has not finished to complete onboarding by the date shown.</p>{{placementTable}}<p>Members:</p>{{groupMembersTable}}<p>Details: {{groupDetailsLink}}</p><p>Best regards,<br>{{senderName}}</p>",
    attachments: [],
    replyToOverride: null,
    audienceType: 'Placement Faculty/CI',
    surfaces: GRP_SURFACES,
  },
  {
    id: 'tmpl-std-school-grp-20',
    portal: 'school',
    section: 'Schedules & Onboarding',
    category: 'Placement Update',
    name: "Location Co-ordinators \u2013 Inform about the group placements",
    subject: "Upcoming group placements at your location",
    body: "<p>Dear {{firstName}},</p><p>For your information, the following group placements are coming to your location.</p>{{placementTable}}<p>Members:</p>{{groupMembersTable}}<p>Details: {{groupDetailsLink}}</p><p>Best regards,<br>{{senderName}}</p>",
    attachments: [],
    replyToOverride: null,
    audienceType: 'Staff-Personnel',
    surfaces: GRP_SURFACES,
  },
];

export const mockEmailTemplates: EmailTemplate[] = [
  ...siteSlotRequestTemplates,
  ...siteScheduleTemplates,
  ...siteOnboardingTemplates,
  ...siteJobsTemplates,
  ...siteGeneralTemplates,
  ...siteNewAudienceTemplates,
  ...schoolRequestTemplates,
  ...schoolSchedulesOnboardingTemplates,
  ...schoolGeneralTemplates,
  ...scheduleStandardTemplates,
];

// Grouped tree: portal → section → templates (for the template library UI)
export type TemplateSectionMap = Record<string, EmailTemplate[]>;
export type TemplatePortalMap = Record<PortalType, TemplateSectionMap>;

export function buildTemplateTree(): TemplatePortalMap {
  const tree: TemplatePortalMap = { site: {}, school: {} };
  for (const t of mockEmailTemplates) {
    if (!tree[t.portal][t.section]) tree[t.portal][t.section] = [];
    tree[t.portal][t.section].push(t);
  }
  return tree;
}
