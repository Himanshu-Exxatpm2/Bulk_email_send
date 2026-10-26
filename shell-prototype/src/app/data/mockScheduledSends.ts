// Scheduled sends that have not yet fired — future sendAt timestamps.
// The UI shows View / Edit / Cancel actions on these rows.
// A canceled send is removed from this array and MUST NOT appear in email history.
import { type AudienceType } from './mockEmailTemplates';

export interface ScheduledSendRecipient {
  id: string;
  name: string;
  email: string | null;
  meta?: string;
}

export interface ScheduledSend {
  id: string;
  recipientName: string;        // human-readable batch label
  recipientEmail: string;       // '— batch send —' for multi-recipient
  subject: string;
  from: string;
  sentBy: string;               // Exxat One user who scheduled the send
  sendAt: string;               // ISO 8601 — always in the future relative to 2026-06-29
  sourceSurface: string;
  portal: 'site' | 'school';   // drives footer in History preview and branding in Edit wizard
  audienceType: AudienceType;   // drives merge fields and template set when editing
  recipientCount: number;
  templateName: string;
  body?: string;                // HTML body for Edit pre-fill and View preview
  sampleRecipients?: ScheduledSendRecipient[]; // representative recipients for Edit wizard
}

// All sendAt values are after 2026-06-29 (platform baseline "today").
export const mockScheduledSends: ScheduledSend[] = [
  {
    id: 'ss-001',
    portal: 'site',
    recipientName: 'Bowie State BSN Fall 2026 Cohort (229 students)',
    recipientEmail: '— batch send —',
    subject: 'Welcome! Complete your onboarding for MedStar ICU – Fall 2026',
    from: 'MedStar Health Clinical Education',
    sentBy: 'Alicia Ruiz',
    sendAt: '2026-07-01T08:00:00Z',
    sourceSurface: 'Onboarding',
    audienceType: 'Student',
    recipientCount: 229,
    templateName: 'Welcome to Onboarding',
    body: '<p>Dear {{first_name}},</p><p>Welcome to MedStar Health Clinical Education! Your Fall 2026 rotation is confirmed and you must complete onboarding within <strong>14 days</strong>.</p><p><a href="{{login_url}}">Log in to Exxat One</a> to access your checklist: background check, vaccines, HIPAA training, and badge authorization.</p><p>Contact your placement coordinator if you have questions.</p><p>Best,<br><strong>Alicia Ruiz</strong><br>MedStar Health Clinical Education</p>',
    sampleRecipients: [
      { id: 'ss-001-r1', name: 'Aaliyah Washington', email: 'a.washington@bowiestate.edu', meta: 'BSN Fall 2026 · Bowie State' },
      { id: 'ss-001-r2', name: 'Marcus Okafor', email: 'm.okafor@bowiestate.edu', meta: 'BSN Fall 2026 · Bowie State' },
      { id: 'ss-001-r3', name: 'Destiny Robinson', email: 'd.robinson@bowiestate.edu', meta: 'BSN Fall 2026 · Bowie State' },
    ],
  },
  {
    id: 'ss-002',
    portal: 'site',
    recipientName: 'All Active School Partners (12 contacts)',
    recipientEmail: '— batch send —',
    subject: 'Important announcement from MedStar Health Clinical Education – July 2026',
    from: 'MedStar Health Clinical Education',
    sentBy: 'George Mercer',
    sendAt: '2026-07-07T09:00:00Z',
    sourceSurface: 'General',
    audienceType: 'School Contact',
    recipientCount: 12,
    templateName: 'System Announcement',
    body: '<p>Dear {{first_name}},</p><p>We have an important update from MedStar Health Clinical Education regarding the Fall 2026 rotation cycle. Please review the updated partnership guidelines attached to this message.</p><p>If you have questions, contact your dedicated relationship manager.</p><p>Best regards,<br><strong>George Mercer</strong><br>MedStar Health Clinical Education</p>',
    sampleRecipients: [
      { id: 'ss-002-r1', name: 'Dr. Renee Blackwell', email: 'r.blackwell@bowiestate.edu', meta: 'Bowie State University' },
      { id: 'ss-002-r2', name: 'Prof. Linda Marsh', email: 'l.marsh@baylor.edu', meta: 'Baylor University' },
      { id: 'ss-002-r3', name: 'Marco Sullivan', email: 'm.sullivan@eastwoodstate.edu', meta: 'Eastwood State' },
    ],
  },
  {
    id: 'ss-003',
    portal: 'site',
    recipientName: 'Non-Compliant Students – Onboarding Deadline Approaching',
    recipientEmail: '— batch send —',
    subject: 'Action required: 7 days left to complete onboarding for MedStar Fall Rotations',
    from: 'MedStar Health Clinical Education',
    sentBy: 'Alicia Ruiz',
    sendAt: '2026-07-10T08:00:00Z',
    sourceSurface: 'Onboarding',
    audienceType: 'Student',
    recipientCount: 47,
    templateName: 'Incomplete Documents Reminder',
    body: '<p>Dear {{first_name}},</p><p>Your onboarding for the MedStar Fall 2026 rotation is <strong>not yet complete</strong>. You have <strong>7 days</strong> remaining to submit all required documents.</p><p>Outstanding items on your checklist:</p><ul><li>Background check authorization</li><li>Immunization records</li><li>HIPAA training certificate</li></ul><p><a href="{{login_url}}">Complete your onboarding now</a> to avoid losing your rotation slot.</p><p>Best,<br><strong>Alicia Ruiz</strong><br>MedStar Health Clinical Education</p>',
    sampleRecipients: [
      { id: 'ss-003-r1', name: 'Jerome Bailey', email: 'j.bailey@bowiestate.edu', meta: 'BSN Fall 2026 · Non-Compliant' },
      { id: 'ss-003-r2', name: 'Keisha Thompson', email: 'k.thompson@bowiestate.edu', meta: 'BSN Fall 2026 · Non-Compliant' },
    ],
  },
  {
    id: 'ss-004',
    portal: 'site',
    recipientName: 'ATI Fall 2026 Rotation Students',
    recipientEmail: '— batch send —',
    subject: 'Reminder: your ATI Physical Therapy rotation begins in 14 days',
    from: 'ATI Physical Therapy',
    sentBy: 'Paul Greenwald',
    sendAt: '2026-07-18T08:30:00Z',
    sourceSurface: 'Schedules',
    audienceType: 'Student',
    recipientCount: 34,
    templateName: 'Rotation Starting Soon',
    body: '<p>Dear {{first_name}},</p><p>This is a reminder that your clinical rotation at <strong>ATI Physical Therapy</strong> begins in 14 days on <strong>{{rotation_start_date}}</strong>.</p><p>Please ensure you have:</p><ul><li>Completed all onboarding requirements</li><li>Confirmed your schedule with your supervisor, {{supervisor_name}}</li><li>Reviewed the site location at {{site_name}}</li></ul><p>See you soon!<br><strong>Paul Greenwald</strong><br>ATI Physical Therapy</p>',
    sampleRecipients: [
      { id: 'ss-004-r1', name: 'Sofia Reyes', email: 's.reyes@baylor.edu', meta: 'OT Program · Baylor' },
      { id: 'ss-004-r2', name: 'Nathan Pryce', email: 'n.pryce@baylor.edu', meta: 'OT Program · Baylor' },
    ],
  },
  {
    id: 'ss-005',
    portal: 'site',
    recipientName: 'Open Candidate Pool – ICU Roles',
    recipientEmail: '— batch send —',
    subject: "New ICU openings at MedStar Health – we'd love to hear from you",
    from: 'MedStar Health Talent Acquisition',
    sentBy: 'Patricia Nguyen',
    sendAt: '2026-07-21T10:00:00Z',
    sourceSurface: 'Jobs',
    audienceType: 'Candidate',
    recipientCount: 83,
    templateName: 'Application Received',
    body: "<p>Dear {{first_name}},</p><p>We have exciting new <strong>ICU nursing openings</strong> at MedStar Health and your profile is a great match!</p><p>We'd love to reconnect. If you're still exploring opportunities, reply to this email or visit your candidate portal to apply:</p><p><a href=\"{{jobs_portal_url}}\">View open positions →</a></p><p>Best,<br><strong>{{recruiter_name}}</strong><br>MedStar Health Talent Acquisition</p>",
    sampleRecipients: [
      { id: 'ss-005-r1', name: 'Sarah Johnson', email: 'sarah.j.1@example.com', meta: 'RN – ICU applicant' },
      { id: 'ss-005-r2', name: 'Michael Davis', email: 'michael.d.2@example.com', meta: 'NP – Family Medicine' },
      { id: 'ss-005-r3', name: 'Jennifer Brown', email: 'jennifer.b.3@example.com', meta: 'PT applicant · ATI' },
    ],
  },
  {
    id: 'ss-006',
    portal: 'site',
    recipientName: 'Hendrick Fall 2026 Confirmed Students',
    recipientEmail: '— batch send —',
    subject: 'Clinical rotation confirmed – Hendrick Medical Center Fall 2026',
    from: 'Hendrick Health Clinical Education',
    sentBy: 'Bobby Whitfield',
    sendAt: '2026-08-01T09:00:00Z',
    sourceSurface: 'Schedules',
    audienceType: 'Student',
    recipientCount: 61,
    templateName: 'Schedule Confirmed',
    body: '<p>Dear {{first_name}},</p><p>Your clinical rotation at <strong>{{site_name}}</strong> has been confirmed for Fall 2026.</p><ul><li><strong>Start Date:</strong> {{rotation_start_date}}</li><li><strong>End Date:</strong> {{rotation_end_date}}</li><li><strong>Supervisor:</strong> {{supervisor_name}}</li></ul><p>Complete your onboarding at <a href="{{login_url}}">Exxat One</a> if you have not already done so.</p><p>Best,<br><strong>Bobby Whitfield</strong><br>Hendrick Health Clinical Education</p>',
    sampleRecipients: [
      { id: 'ss-006-r1', name: 'Emily Chen', email: 'e.chen@eastwoodstate.edu', meta: 'BSN Fall 2026 · Eastwood State' },
      { id: 'ss-006-r2', name: 'Carlos Mendez', email: 'c.mendez@eastwoodstate.edu', meta: 'BSN Fall 2026 · Eastwood State' },
    ],
  },
  {
    id: 'ss-007',
    portal: 'site',
    recipientName: 'School Coordinators – Fall 2026 Pending Requests',
    recipientEmail: '— batch send —',
    subject: 'Follow-up: slot requests still pending for Fall 2026 rotations',
    from: 'MedStar Health Clinical Education',
    sentBy: 'Raymond Castillo',
    sendAt: '2026-08-05T11:00:00Z',
    sourceSurface: 'Slot Requests',
    audienceType: 'School Contact',
    recipientCount: 8,
    templateName: 'Additional Info Needed',
    body: '<p>Dear {{first_name}},</p><p>We noticed that your Fall 2026 slot requests are still pending review. To expedite processing, please provide any outstanding information via your school portal.</p><p>Pending requests will be automatically closed on <strong>August 15, 2026</strong> if not completed.</p><p><a href="{{contact_portal_url}}">View your pending requests →</a></p><p>Best,<br><strong>Raymond Castillo</strong><br>MedStar Health Clinical Education</p>',
    sampleRecipients: [
      { id: 'ss-007-r1', name: 'Marco Sullivan', email: 'm.sullivan@eastwoodstate.edu', meta: 'Eastwood State' },
      { id: 'ss-007-r2', name: 'Trina Hoffman', email: 't.hoffman@lakewood.edu', meta: 'Lakewood University' },
    ],
  },
  {
    id: 'ss-008',
    portal: 'school',
    recipientName: 'Bowie State BSN Fall 2026 — Remaining Pending-Login Students',
    recipientEmail: '— batch send —',
    subject: 'Final reminder: log in to Exxat One before your rotation begins',
    from: 'Bowie State University Clinical Placement Office',
    sentBy: 'Dr. Angela Chen',
    sendAt: '2026-07-15T09:00:00Z',
    sourceSurface: 'School Dashboard',
    audienceType: 'Student',
    recipientCount: 174,
    templateName: 'First Login Reminder',
    body: '<p>Dear {{first_name}},</p><p>This is your final reminder from the Bowie State University Clinical Placement Office. Your Fall 2026 rotation at MedStar Health begins in <strong>less than 6 weeks</strong> and you have still not logged in to Exxat One.</p><p>You cannot complete your onboarding — background check, immunization records, HIPAA training — until you log in. Missing these requirements may result in loss of your rotation placement.</p><p><a href="{{login_url}}">Log in to Exxat One now →</a></p><p>Contact our office immediately if you are having trouble accessing your account.</p><p>Best,<br><strong>Dr. Angela Chen</strong><br>Bowie State University Clinical Placement Office</p>',
    sampleRecipients: [
      { id: 'ss-008-r1', name: 'Aaliyah Washington', email: 'a.washington@bowiestate.edu', meta: 'BSN Fall 2026 · Never logged in' },
      { id: 'ss-008-r2', name: 'Marcus Okafor', email: 'm.okafor@bowiestate.edu', meta: 'BSN Fall 2026 · Never logged in' },
      { id: 'ss-008-r3', name: 'Destiny Robinson', email: 'd.robinson@bowiestate.edu', meta: 'BSN Fall 2026 · Never logged in' },
    ],
  },
];
