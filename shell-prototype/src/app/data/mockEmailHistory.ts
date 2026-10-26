// One row per recipient per send — never rolled up.
// A few Failed rows are seeded so the Resend action in the History UI has something to act on.

import type { AudienceType } from './mockEmailTemplates';
import { renderMessage } from './messageMerge';
import { seedBodyFor } from './seedHistoryBodies';

export type EmailStatus = 'Sent' | 'Failed';

export interface EmailHistoryRow {
  id: string;
  recipientName: string;
  recipientEmail: string;
  subject: string;
  status: EmailStatus;
  from: string;               // display name of sender org / user
  sentBy: string;             // Exxat One user who triggered the send
  sentAt: string;             // ISO 8601 timestamp
  sourceSurface: string;      // module / section that triggered the email
  portal: 'site' | 'school'; // which portal this send originated from — drives footer in History preview
  audienceType?: AudienceType; // recipient type of this row — set by live sends, backfilled once on seed rows below
  body?: string;              // HTML body — available for rows that store the original content
  attachments?: { name: string; size: string }[];
}

// ── Hand-written rows ────────────────────────────────────────────────────────
// 25 representative site-portal records + 4 school-portal records added in round 2.
// Dates are in June 2026 to match the platform baseline (today = 2026-06-29).

export const mockEmailHistory: EmailHistoryRow[] = [
  // ── Slot Requests (site portal) ────────────────────────────────────────────
  { id: 'eh-001', portal: 'site', recipientName: 'Dr. Renee Blackwell', recipientEmail: 'r.blackwell@bowiestate.edu', subject: 'Your slot request for MedStar ICU – Spring Session #2 2026 has been approved', status: 'Sent', from: 'MedStar Health Clinical Education', sentBy: 'Sandra Okonkwo', sentAt: '2026-06-02T09:14:00Z', sourceSurface: 'Slot Requests' },
  { id: 'eh-002', portal: 'site', recipientName: 'Prof. Linda Marsh', recipientEmail: 'l.marsh@baylor.edu', subject: 'Your slot request for ATI Physical Therapy Rotation-2026 has been approved', status: 'Sent', from: 'ATI Physical Therapy', sentBy: 'Paul Greenwald', sentAt: '2026-06-03T10:22:00Z', sourceSurface: 'Slot Requests' },
  { id: 'eh-003', portal: 'site', recipientName: 'Marco Sullivan', recipientEmail: 'm.sullivan@eastwoodstate.edu', subject: 'Update on your slot request for MedStar OT – Spring Session #1 2025', status: 'Sent', from: 'MedStar Health Clinical Education', sentBy: 'Sandra Okonkwo', sentAt: '2026-06-03T11:05:00Z', sourceSurface: 'Slot Requests' },
  { id: 'eh-004', portal: 'site', recipientName: 'Angela Pierce', recipientEmail: 'a.pierce@capitolnursing.edu', subject: 'Action required: additional information for MedStar NICU – Fall Session #1 2026', status: 'Failed', from: 'MedStar Health Clinical Education', sentBy: 'Raymond Castillo', sentAt: '2026-06-04T08:45:00Z', sourceSurface: 'Slot Requests' },
  { id: 'eh-005', portal: 'site', recipientName: 'Trina Hoffman', recipientEmail: 't.hoffman@lakewood.edu', subject: 'Update on your slot request for Hendrick Medical Center Nursing Practicum 2026-27', status: 'Sent', from: 'Hendrick Health Clinical Education', sentBy: 'Bobby Whitfield', sentAt: '2026-06-05T13:30:00Z', sourceSurface: 'Slot Requests' },

  // ── Schedules (site portal) ────────────────────────────────────────────────
  { id: 'eh-006', portal: 'site', recipientName: 'Aaliyah Washington', recipientEmail: 'a.washington@bowiestate.edu', subject: 'Clinical rotation confirmed: Aaliyah Washington – MedStar ICU Spring Session #2 2026', status: 'Sent', from: 'MedStar Health Clinical Education', sentBy: 'Sandra Okonkwo', sentAt: '2026-06-06T09:00:00Z', sourceSurface: 'Schedules' },
  { id: 'eh-007', portal: 'site', recipientName: 'Marcus Okafor', recipientEmail: 'm.okafor@bowiestate.edu', subject: 'Clinical rotation confirmed: Marcus Okafor – MedStar ICU Spring Session #2 2026', status: 'Sent', from: 'MedStar Health Clinical Education', sentBy: 'Sandra Okonkwo', sentAt: '2026-06-06T09:01:00Z', sourceSurface: 'Schedules' },
  { id: 'eh-008', portal: 'site', recipientName: 'Destiny Robinson', recipientEmail: 'd.robinson@bowiestate.edu', subject: 'Clinical rotation confirmed: Destiny Robinson – MedStar ICU Spring Session #2 2026', status: 'Sent', from: 'MedStar Health Clinical Education', sentBy: 'Sandra Okonkwo', sentAt: '2026-06-06T09:02:00Z', sourceSurface: 'Schedules' },
  { id: 'eh-009', portal: 'site', recipientName: 'Sofia Reyes', recipientEmail: 's.reyes@baylor.edu', subject: 'Clinical rotation confirmed: Sofia Reyes – ATI Occupational Therapy-H1 2027', status: 'Sent', from: 'ATI Physical Therapy', sentBy: 'Paul Greenwald', sentAt: '2026-06-07T10:15:00Z', sourceSurface: 'Schedules' },
  { id: 'eh-010', portal: 'site', recipientName: 'Nathan Pryce', recipientEmail: 'n.pryce@baylor.edu', subject: 'Important update to your clinical rotation schedule', status: 'Failed', from: 'ATI Physical Therapy', sentBy: 'Michelle Tran', sentAt: '2026-06-08T14:22:00Z', sourceSurface: 'Schedules' },

  // ── Onboarding (site portal) ───────────────────────────────────────────────
  { id: 'eh-011', portal: 'site', recipientName: 'Aaliyah Washington', recipientEmail: 'a.washington@bowiestate.edu', subject: 'Welcome! Complete your onboarding for MedStar ICU Spring Session #2 2026', status: 'Sent', from: 'MedStar Health Clinical Education', sentBy: 'Alicia Ruiz', sentAt: '2026-06-09T08:00:00Z', sourceSurface: 'Onboarding', attachments: [{ name: 'Onboarding_Checklist_MedStar_ICU_Spring2026.pdf', size: '156 KB' }] },
  { id: 'eh-012', portal: 'site', recipientName: 'Marcus Okafor', recipientEmail: 'm.okafor@bowiestate.edu', subject: 'Action required: 14 days left to complete onboarding', status: 'Sent', from: 'MedStar Health Clinical Education', sentBy: 'Alicia Ruiz', sentAt: '2026-06-15T08:00:00Z', sourceSurface: 'Onboarding' },
  { id: 'eh-013', portal: 'site', recipientName: 'Jerome Bailey', recipientEmail: 'j.bailey@bowiestate.edu', subject: 'Action required: 14 days left to complete onboarding', status: 'Sent', from: 'MedStar Health Clinical Education', sentBy: 'Alicia Ruiz', sentAt: '2026-06-15T08:01:00Z', sourceSurface: 'Onboarding' },
  { id: 'eh-014', portal: 'site', recipientName: 'Keisha Thompson', recipientEmail: 'k.thompson@bowiestate.edu', subject: 'Action required: 14 days left to complete onboarding', status: 'Failed', from: 'MedStar Health Clinical Education', sentBy: 'Alicia Ruiz', sentAt: '2026-06-15T08:02:00Z', sourceSurface: 'Onboarding' },
  { id: 'eh-015', portal: 'site', recipientName: 'Imani Jackson', recipientEmail: 'i.jackson@bowiestate.edu', subject: "You're cleared! Onboarding complete for MedStar ICU Spring Session #2 2026", status: 'Sent', from: 'MedStar Health Clinical Education', sentBy: 'Alicia Ruiz', sentAt: '2026-06-16T10:30:00Z', sourceSurface: 'Onboarding' },

  // ── Jobs (site portal) ─────────────────────────────────────────────────────
  { id: 'eh-016', portal: 'site', recipientName: 'Sarah Johnson', recipientEmail: 'sarah.j.1@example.com', subject: 'We received your application for Registered Nurse – ICU at MedStar Health', status: 'Sent', from: 'MedStar Health Talent Acquisition', sentBy: 'Patricia Nguyen', sentAt: '2026-06-10T11:00:00Z', sourceSurface: 'Jobs', body: '<p>Dear {{first_name}},</p><p>Thank you for applying for the <strong>Registered Nurse – ICU</strong> position at MedStar Health. We have received your application and our team is reviewing it.</p><p>We will be in touch within 5–7 business days regarding next steps. In the meantime, feel free to explore other openings on our <a href="{{jobs_portal_url}}">careers portal</a>.</p><p>Best regards,<br><strong>Patricia Nguyen</strong><br>MedStar Health Talent Acquisition</p>' },
  { id: 'eh-017', portal: 'site', recipientName: 'Michael Davis', recipientEmail: 'michael.d.2@example.com', subject: 'Interview invitation: Nurse Practitioner – Family Medicine at MedStar Health', status: 'Sent', from: 'MedStar Health Talent Acquisition', sentBy: 'Patricia Nguyen', sentAt: '2026-06-11T09:45:00Z', sourceSurface: 'Jobs', body: '<p>Dear {{first_name}},</p><p>We are pleased to invite you to interview for the <strong>Nurse Practitioner – Family Medicine</strong> position at MedStar Health.</p><ul><li><strong>Date:</strong> {{interview_date}}</li><li><strong>Format:</strong> Video call (link will follow)</li><li><strong>Duration:</strong> 45 minutes</li></ul><p>Please reply to confirm your availability or suggest an alternative time.</p><p>Best regards,<br><strong>Patricia Nguyen</strong><br>MedStar Health Talent Acquisition</p>' },
  { id: 'eh-018', portal: 'site', recipientName: 'Jennifer Brown', recipientEmail: 'jennifer.b.3@example.com', subject: 'We received your application for Physical Therapist at ATI Physical Therapy', status: 'Sent', from: 'ATI Physical Therapy Talent Acquisition', sentBy: 'Michelle Tran', sentAt: '2026-06-12T14:00:00Z', sourceSurface: 'Jobs', body: '<p>Dear {{first_name}},</p><p>Thank you for your interest in the <strong>Physical Therapist</strong> role at ATI Physical Therapy. Your application has been received and is under review.</p><p>Our team typically responds within one week. You can track your application status at any time via your candidate portal: <a href="{{jobs_portal_url}}">{{jobs_portal_url}}</a>.</p><p>Best,<br><strong>Michelle Tran</strong><br>ATI Physical Therapy Talent Acquisition</p>' },
  { id: 'eh-019', portal: 'site', recipientName: 'David Garcia', recipientEmail: 'david.g.4@example.com', subject: 'Offer of employment: Registered Nurse – ICU at MedStar Health', status: 'Sent', from: 'MedStar Health Human Resources', sentBy: 'Patricia Nguyen', sentAt: '2026-06-13T15:30:00Z', sourceSurface: 'Jobs', body: '<p>Dear {{first_name}},</p><p>We are delighted to extend an offer of employment for the position of <strong>Registered Nurse – ICU</strong> at MedStar Health, effective pending your formal acceptance.</p><p>Please review the attached offer letter and complete the acceptance process by <strong>{{offer_expiry_date}}</strong>. Contact HR with any questions.</p><p>We look forward to welcoming you to the team!</p><p>Warm regards,<br><strong>MedStar Health Human Resources</strong></p>', attachments: [{ name: 'Offer_Letter_MedStar_RN_ICU_2026.pdf', size: '284 KB' }] },
  { id: 'eh-020', portal: 'site', recipientName: 'Emily Martinez', recipientEmail: 'emily.m.5@example.com', subject: 'Interview invitation: Physical Therapist at ATI Physical Therapy', status: 'Failed', from: 'ATI Physical Therapy Talent Acquisition', sentBy: 'Paul Greenwald', sentAt: '2026-06-14T10:00:00Z', sourceSurface: 'Jobs', body: '<p>Dear {{first_name}},</p><p>We would like to invite you to interview for the <strong>Physical Therapist</strong> position at ATI Physical Therapy.</p><p>Please reply to this email to schedule a time that works for you.</p><p>Best,<br><strong>Paul Greenwald</strong><br>ATI Physical Therapy Talent Acquisition</p>' },

  // ── General (site portal) ──────────────────────────────────────────────────
  { id: 'eh-021', portal: 'site', recipientName: 'Dr. Renee Blackwell', recipientEmail: 'r.blackwell@bowiestate.edu', subject: 'Important announcement from MedStar Health Clinical Education', status: 'Sent', from: 'MedStar Health Clinical Education', sentBy: 'George Mercer', sentAt: '2026-06-17T08:00:00Z', sourceSurface: 'General' },
  { id: 'eh-022', portal: 'site', recipientName: 'Prof. Linda Marsh', recipientEmail: 'l.marsh@baylor.edu', subject: 'Important announcement from MedStar Health Clinical Education', status: 'Sent', from: 'MedStar Health Clinical Education', sentBy: 'George Mercer', sentAt: '2026-06-17T08:00:00Z', sourceSurface: 'General' },
  { id: 'eh-023', portal: 'site', recipientName: 'Marco Sullivan', recipientEmail: 'm.sullivan@eastwoodstate.edu', subject: 'Important announcement from MedStar Health Clinical Education', status: 'Sent', from: 'MedStar Health Clinical Education', sentBy: 'George Mercer', sentAt: '2026-06-17T08:00:00Z', sourceSurface: 'General' },
  { id: 'eh-024', portal: 'site', recipientName: 'Linda Swanson', recipientEmail: 'l.swanson@hendrickhealth.org', subject: 'Staff update: Fall 2026 onboarding deadline changes', status: 'Sent', from: 'Hendrick Health Clinical Education', sentBy: 'Bobby Whitfield', sentAt: '2026-06-20T09:15:00Z', sourceSurface: 'General' },
  { id: 'eh-025', portal: 'site', recipientName: 'Craig Patel', recipientEmail: 'c.patel@hendrickhealth.org', subject: 'Staff update: Fall 2026 onboarding deadline changes', status: 'Sent', from: 'Hendrick Health Clinical Education', sentBy: 'Bobby Whitfield', sentAt: '2026-06-20T09:15:00Z', sourceSurface: 'General' },

  // ── School portal rows — added so History preview can show Bowie State footer ─
  // Source: SchoolDashboard's pending-login cohort (229 students) and SchoolSchedulesPage.
  // from matches tenantEmailConfig.school.displayName exactly.
  { id: 'eh-026', portal: 'school', recipientName: 'Aaliyah Washington', recipientEmail: 'a.washington@bowiestate.edu', subject: 'Action required: log in to Exxat One before your Fall 2026 rotation begins', status: 'Sent', from: 'Bowie State University Clinical Placement Office', sentBy: 'Dr. Angela Chen', sentAt: '2026-06-22T10:00:00Z', sourceSurface: 'School Dashboard', body: '<p>Dear Aaliyah,</p><p>Your Fall 2026 clinical rotation at MedStar Health begins in 9 weeks and you have not yet logged in to Exxat One. You must log in and complete your onboarding checklist before your start date.</p><p><a href="{{login_url}}">Log in to Exxat One →</a></p><p>If you have trouble accessing your account, reply to this email or contact the placement office directly.</p><p>Best,<br><strong>Dr. Angela Chen</strong><br>Bowie State University Clinical Placement Office</p>', attachments: [{ name: 'Exxat_One_Student_Login_Guide.pdf', size: '89 KB' }, { name: 'BSN_Fall2026_Clinical_Schedule.pdf', size: '412 KB' }] },
  { id: 'eh-027', portal: 'school', recipientName: 'Marcus Okafor', recipientEmail: 'm.okafor@bowiestate.edu', subject: 'Action required: log in to Exxat One before your Fall 2026 rotation begins', status: 'Sent', from: 'Bowie State University Clinical Placement Office', sentBy: 'Dr. Angela Chen', sentAt: '2026-06-22T10:01:00Z', sourceSurface: 'School Dashboard', body: '<p>Dear Marcus,</p><p>Your Fall 2026 clinical rotation at MedStar Health begins in 9 weeks and you have not yet logged in to Exxat One. You must log in and complete your onboarding checklist before your start date.</p><p><a href="{{login_url}}">Log in to Exxat One →</a></p><p>If you have trouble accessing your account, reply to this email or contact the placement office directly.</p><p>Best,<br><strong>Dr. Angela Chen</strong><br>Bowie State University Clinical Placement Office</p>' },
  { id: 'eh-028', portal: 'school', recipientName: 'Destiny Robinson', recipientEmail: 'd.robinson@bowiestate.edu', subject: 'Action required: log in to Exxat One before your Fall 2026 rotation begins', status: 'Failed', from: 'Bowie State University Clinical Placement Office', sentBy: 'Dr. Angela Chen', sentAt: '2026-06-22T10:02:00Z', sourceSurface: 'School Dashboard', body: '<p>Dear Destiny,</p><p>Your Fall 2026 clinical rotation at MedStar Health begins in 9 weeks and you have not yet logged in to Exxat One. You must log in and complete your onboarding checklist before your start date.</p><p><a href="{{login_url}}">Log in to Exxat One →</a></p><p>Best,<br><strong>Dr. Angela Chen</strong><br>Bowie State University Clinical Placement Office</p>' },
  { id: 'eh-029', portal: 'school', recipientName: 'Jerome Bailey', recipientEmail: 'j.bailey@bowiestate.edu', subject: 'Reminder: your MedStar ICU rotation starts in 14 days — onboarding still incomplete', status: 'Sent', from: 'Bowie State University Clinical Placement Office', sentBy: 'Ms. Patricia Osei', sentAt: '2026-06-25T09:00:00Z', sourceSurface: 'School Schedules', body: '<p>Dear Jerome,</p><p>Your clinical rotation at <strong>MedStar Health – ICU</strong> begins on <strong>{{rotation_start_date}}</strong> — 14 days from now — and your onboarding checklist is still incomplete.</p><p>Outstanding items: background check, immunization records, HIPAA training certificate.</p><p><a href="{{login_url}}">Complete your onboarding now →</a></p><p>Failure to complete onboarding may result in loss of your rotation placement.</p><p>Best,<br><strong>Ms. Patricia Osei</strong><br>Bowie State University Clinical Placement Office</p>' },
];

// ── Loop-generated rows ──────────────────────────────────────────────────────
// Deterministic counter — extends history to give the list page enough rows to paginate.
// All loop rows are site-portal sends.
const LOOP_SURFACES = ['Onboarding', 'Schedules', 'Slot Requests', 'Jobs', 'General'] as const;
const LOOP_SENDERS = ['Sandra Okonkwo', 'Alicia Ruiz', 'Paul Greenwald', 'Bobby Whitfield', 'Patricia Nguyen'];
const LOOP_FROM = [
  'MedStar Health Clinical Education',
  'MedStar Health Clinical Education',
  'ATI Physical Therapy',
  'Hendrick Health Clinical Education',
  'MedStar Health Talent Acquisition',
];
const LOOP_FIRST = ['Jordan', 'Taylor', 'Morgan', 'Riley', 'Casey', 'Quinn', 'Avery', 'Cameron', 'Skyler', 'Drew'];
const LOOP_LAST = ['Mitchell', 'Bennett', 'Russell', 'Coleman', 'Brooks', 'Rivera', 'Reed', 'Cooper', 'Hayes', 'Bell'];
const LOOP_SUBJECTS = [
  'Reminder: your clinical rotation begins in 7 days',
  'Action required: 7 days left to complete onboarding',
  'Clinical rotation confirmed',
  'We received your application',
  'Program update from Clinical Education',
];

// One body per loop surface, matched to that row's subject and audience. The loop's
// recipients are filler people with no records, so these carry no record-specific detail.
const LOOP_BODIES: ((first: string, sender: string, from: string) => string)[] = [
  // Onboarding / Student — "Reminder: your clinical rotation begins in 7 days"
  (first, sender, from) => `<p>Dear ${first},</p><p>This is a friendly reminder that your clinical rotation begins in <strong>7 days</strong>. Before you arrive, please make sure you have completed every item on your onboarding checklist in Exxat One and uploaded any required documents.</p><p>If you have questions about your start date or reporting location, reply to this email and we'll help.</p><p>Best regards,<br><strong>${sender}</strong><br>${from}</p>`,
  // Schedules / Student — "Action required: 7 days left to complete onboarding"
  (first, sender, from) => `<p>Dear ${first},</p><p>You have <strong>7 days left</strong> to complete your onboarding requirements. Please log in to Exxat One, review your checklist, and upload any documents that are still outstanding.</p><p>Students who have not completed onboarding by the deadline cannot be cleared to start their rotation.</p><p>Best regards,<br><strong>${sender}</strong><br>${from}</p>`,
  // Slot Requests / School Contact — "Clinical rotation confirmed"
  (first, sender, from) => `<p>Dear ${first},</p><p>We're pleased to confirm the clinical rotation placements for your students. Schedule details and onboarding requirements are now available in Exxat One.</p><p>Please encourage students to complete onboarding at least two weeks before their start date.</p><p>Best regards,<br><strong>${sender}</strong><br>${from}</p>`,
  // Jobs / Candidate — "We received your application"
  (first, sender, from) => `<p>Dear ${first},</p><p>Thank you for applying. We have received your application and our recruiting team is reviewing it. If your background matches the role, we will contact you about next steps.</p><p>You can check the status of your application in the Jobs portal at any time.</p><p>Best regards,<br><strong>${sender}</strong><br>${from}</p>`,
  // General / School Contact — "Program update from Clinical Education"
  (first, sender, from) => `<p>Dear ${first},</p><p>Here is the latest program update from Clinical Education: placement calendars for the coming term are now published, and site orientation dates have been added.</p><p>Please review them in Exxat One and share them with your students and faculty.</p><p>Best regards,<br><strong>${sender}</strong><br>${from}</p>`,
];

(function seedLoopHistory() {
  for (let i = 0; i < 25; i++) {
    const surfaceIdx = i % LOOP_SURFACES.length;
    const first = LOOP_FIRST[i % LOOP_FIRST.length];
    const last = LOOP_LAST[i % LOOP_LAST.length];
    const day = String(1 + (i % 28)).padStart(2, '0');
    const hour = String(8 + (i % 10)).padStart(2, '0');
    mockEmailHistory.push({
      id: `eh-${String(100 + i).padStart(3, '0')}`,
      portal: 'site',
      recipientName: `${first} ${last}`,
      recipientEmail: `${first.toLowerCase()}.${last.toLowerCase()}${100 + i}@example.com`,
      subject: LOOP_SUBJECTS[surfaceIdx],
      status: i % 10 === 0 ? 'Failed' : 'Sent',
      from: LOOP_FROM[surfaceIdx],
      sentBy: LOOP_SENDERS[surfaceIdx],
      sentAt: `2026-06-${day}T${hour}:00:00Z`,
      sourceSurface: LOOP_SURFACES[surfaceIdx],
      body: LOOP_BODIES[surfaceIdx](first, LOOP_SENDERS[surfaceIdx], LOOP_FROM[surfaceIdx]),
    });
  }
})();

// Seed rows predate the audienceType field. Fill it once here, at load, so every
// consumer (notification labels, filtering, rendering) reads it directly instead
// of re-deriving it from the source surface or the recipient's email domain.
const SITE_STAFF_DOMAINS = ['medstarhealth.org', 'atipt.com', 'hendrickhealth.org'];
function seedAudience(row: EmailHistoryRow): AudienceType {
  switch (row.sourceSurface) {
    case 'Slot Requests':
    case 'School Requests':
      return 'School Contact';
    case 'Schedules':
    case 'Onboarding':
    case 'School Dashboard':
    case 'School Schedules':
      return 'Student';
    case 'Jobs':
      return 'Candidate';
    case 'Availability':
      return 'Preceptor';
    default:
      return SITE_STAFF_DOMAINS.includes(row.recipientEmail.split('@')[1]?.toLowerCase() ?? '') ? 'Staff-Personnel' : 'School Contact';
  }
}
for (const row of mockEmailHistory) row.audienceType ??= seedAudience(row);

// Seed rows were written with their {{tokens}} unrendered. Render them once here, per
// recipient, so History detail and the Notification Preview show what was actually sent.
// Two candidate rows need send-time values no record holds; they get the values those
// (June 2026) sends would have carried.
const SEED_SEND_VALUES = { interview_date: 'July 8, 2026', offer_expiry_date: 'July 15, 2026' };
// Rows written without a body get one built from the template their subject carries
// (seedHistoryBodies.ts); the per-row values it needs travel with the row into the render.
const seedExtras = new Map<string, Record<string, string>>();
for (const row of mockEmailHistory) {
  if (row.body?.trim()) continue;
  const seeded = seedBodyFor(row);
  if (seeded) { row.body = seeded.body; seedExtras.set(row.id, seeded.extra); }
}
for (const row of mockEmailHistory) {
  if (!row.body?.includes('{{') && !row.subject.includes('{{')) continue;
  const m = renderMessage(row.subject, row.body ?? '', row.audienceType!, { id: row.id, name: row.recipientName, email: row.recipientEmail }, { extra: { ...SEED_SEND_VALUES, ...seedExtras.get(row.id) } });
  row.subject = m.subject;
  if (row.body) row.body = m.body;
}

// Date-range filtering on the viewer's own calendar. The From/To pickers hold local
// calendar days ("YYYY-MM-DD"), and rows are shown in local time, so the boundaries
// are turned into local instants — start of the From day, end of the To day — and
// compared with the row's actual moment. Comparing the UTC date slice of `sentAt`
// against a local day mis-buckets any row near midnight for a non-UTC viewer.
export function isWithinLocalDateRange(sentAt: string, from: string, to: string): boolean {
  const t = new Date(sentAt).getTime();
  if (from && t < new Date(`${from}T00:00:00`).getTime()) return false;   // no "Z": parsed as local time
  if (to && t > new Date(`${to}T23:59:59.999`).getTime()) return false;
  return true;
}

// Live sends from ComposeEmailWizard land here so Email History and the
// per-module notification cards reflect them. Newest first, like a real inbox.
export function recordSend(rows: EmailHistoryRow[]): void {
  mockEmailHistory.unshift(...rows);
}
