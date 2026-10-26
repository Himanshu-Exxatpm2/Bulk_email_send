// Shared store for the Notification area of Site / School Configuration:
// notification events, email templates (automated + Bulk Email), roles, recipients,
// category locks and personal preferences. Every page and the Bulk Email compose
// wizard read from here, so an edit made on one page shows up on the others.
import { useSyncExternalStore } from 'react';
import { mockEmailTemplates, type AudienceType, type EmailTemplate } from './mockEmailTemplates';
import { CURRENT_USER } from './messageMerge';

export type Portal = 'site' | 'school';
export type Group = 'notification' | 'bulk';
export type LayoutId = 'none' | 'own-header' | 'exxat-footer' | 'own-exxat' | 'share-profile-exxat';

export const layoutOptions = (own: string): { value: LayoutId; label: string }[] => [
  { value: 'none', label: 'No logos on header and footer' },
  { value: 'own-header', label: `${own} logo on the header` },
  { value: 'exxat-footer', label: 'Exxat logo on the footer' },
  { value: 'own-exxat', label: `${own} logo on the header and Exxat logo on the footer` },
  { value: 'share-profile-exxat', label: `Share profile ${own.toLowerCase()} logo on the header and Exxat logo on the footer` },
];

// ── Field library for automated notification emails ──────────────────────────
export interface FieldDef { token: string; label: string }
const LIB: Record<string, { label: string; sample: string }> = {
  firstName: { label: 'First name', sample: 'Maya' },
  lastName: { label: 'Last name', sample: 'Chen' },
  siteName: { label: 'Site name', sample: 'Bedlam-Hospital' },
  schoolName: { label: 'School name', sample: 'Eastwood State University' },
  senderName: { label: 'Sender name', sample: 'Jordan Lee' },
  availabilityName: { label: 'Availability name', sample: 'Fall 2026 Rotation' },
  requestedLocation: { label: 'Requested location', sample: 'Concussion Management Unit' },
  requestedDates: { label: 'Requested dates', sample: 'May 1, 2026 – May 12, 2026' },
  approvedSlotCount: { label: 'Count of approved slots', sample: '2' },
  studentName: { label: 'Student name', sample: 'Aaliyah Washington' },
  clinicalInstructorName: { label: 'Clinical instructor name', sample: 'Denise Carrington' },
  requirementName: { label: 'Requirement name', sample: 'Immunization record' },
  scheduleDates: { label: 'Schedule dates', sample: 'Jan 12 – Apr 2, 2027' },
  changeSummary: { label: 'Change summary', sample: 'The start date moved to January 19.' },
  openRequestCount: { label: 'Open requests', sample: '4' },
  upcomingScheduleCount: { label: 'Upcoming schedules', sample: '12' },
  dueDate: { label: 'Due date', sample: 'December 29, 2026' },
  messagePreview: { label: 'Message preview', sample: 'Could we move the start date by a week?' },
  requestDetailsLink: { label: 'Request details', sample: 'https://one.exxat.com/requests/3558157000' },
  scheduleDetailsLink: { label: 'Schedule details', sample: 'https://one.exxat.com/schedules/6427314' },
  placementDetailLink: { label: 'Placement detail', sample: 'https://one.exxat.com/placements' },
  requirementDetailLink: { label: 'Requirement detail', sample: 'https://one.exxat.com/onboarding' },
  exxatOneHomeLink: { label: 'Exxat One home', sample: 'https://one.exxat.com' },
  messagesLink: { label: 'Messages', sample: 'https://one.exxat.com/messages' },
};
export const ALL_LINKS = ['requestDetailsLink', 'scheduleDetailsLink', 'placementDetailLink', 'requirementDetailLink', 'exxatOneHomeLink'];
const isLink = (t: string) => /Link$/.test(t);

export interface NotifEvent {
  id: string;
  category: string;
  label: string;
  description: string;
  subject: string;
  body: string; // plain lines; {{tokens}}; blank line = new paragraph
  fields: string[];
  links: string[];
  audience: AudienceType; // who the sample preview speaks to
  roles?: string[]; // roles that can receive it; default: every role except the limited ones
  matrix?: boolean; // false = has templates but no row in the Notification Configuration matrix
}

export interface NotifCategory { id: string; label: string; icon: string; permanentLock?: boolean }

export const NOTIF_CATEGORIES: Record<Portal, NotifCategory[]> = {
  site: [
    { id: 'messages', label: 'Messages', icon: 'envelope', permanentLock: true },
    { id: 'slot-request', label: 'Slot Request', icon: 'plusCircle' },
    { id: 'schedule-management', label: 'Schedule Management', icon: 'graduationCap' },
    { id: 'onboarding', label: 'Onboarding, Ongoing and Offboarding', icon: 'clipboardCheck' },
    { id: 'digest', label: 'Digest Notifications', icon: 'bell' },
  ],
  school: [
    { id: 'messages', label: 'Messages', icon: 'envelope', permanentLock: true },
    { id: 'slot-request', label: 'Slot Request', icon: 'plusCircle' },
    { id: 'schedule-management', label: 'Schedule Management', icon: 'graduationCap' },
    { id: 'onboarding', label: 'Onboarding', icon: 'clipboardCheck' },
    { id: 'digest', label: 'Digest Notifications', icon: 'bell' },
  ],
};

const ev = (id: string, category: string, label: string, description: string, subject: string, body: string, fields: string[], extra: Partial<NotifEvent> = {}): NotifEvent => ({
  id, category, label, description, subject, body, fields: fields.filter((f) => !isLink(f)), links: fields.filter(isLink), audience: 'Staff-Personnel', ...extra,
});
const PRECEPTOR = ['Preceptor'];

export const EVENTS: Record<Portal, NotifEvent[]> = {
  site: [
    ev('message-received', 'messages', 'Message from schools, students, or clinical instructors', 'When a school, student, or clinical instructor sends you a message.', 'New message from {{senderName}}', 'Hi {{firstName}},\n\n{{senderName}} sent you a message: "{{messagePreview}}"\n\nRead and reply: {{messagesLink}}', ['firstName', 'senderName', 'messagePreview', 'messagesLink']),
    ev('slot-request-new', 'slot-request', 'New slot request from a school', 'When a school submits a new slot request.', 'New slot request from {{schoolName}}', 'Hi {{firstName}},\n\n{{schoolName}} requested slots at {{requestedLocation}} for {{requestedDates}}.\n\nReview the request: {{requestDetailsLink}}', ['firstName', 'lastName', 'schoolName', 'requestedLocation', 'requestedDates', 'availabilityName', 'requestDetailsLink']),
    ev('slot-request-updated', 'slot-request', 'School updates a slot request', 'When dates, counts, or other request details change.', '{{schoolName}} updated a slot request', 'Hi {{firstName}},\n\n{{schoolName}} updated their request for {{requestedLocation}}. Now: {{requestedDates}}.\n\nReview the change: {{requestDetailsLink}}', ['firstName', 'schoolName', 'requestedLocation', 'requestedDates', 'requestDetailsLink']),
    ev('slot-request-revoked', 'slot-request', 'School revokes a slot request', 'When a school withdraws a slot request.', '{{schoolName}} withdrew a slot request', 'Hi {{firstName}},\n\n{{schoolName}} withdrew their request for {{requestedLocation}} ({{requestedDates}}).\n\nSee the request: {{requestDetailsLink}}', ['firstName', 'schoolName', 'requestedLocation', 'requestedDates', 'requestDetailsLink']),
    ev('slot-request-approved', 'slot-request', 'Slot Request Approved by Site', 'Sent to the school when the site approves a request.', '{{siteName}} approved {{approvedSlotCount}} slots for {{schoolName}}', 'Hi {{firstName}} {{lastName}},\n\n{{siteName}} approved a slot request from {{schoolName}} for {{availabilityName}}.\n\nApproved slots: {{approvedSlotCount}}\n\nReview the request: {{requestDetailsLink}}', ['firstName', 'lastName', 'schoolName', 'siteName', 'availabilityName', 'approvedSlotCount', 'requestDetailsLink'], { matrix: false, audience: 'School Contact' }),
    ev('slot-request-rejected', 'slot-request', 'Slot Request Rejected by Site', 'Sent to the school when the site declines a request.', '{{siteName}} could not approve your request', 'Hi {{firstName}},\n\n{{siteName}} was unable to approve your request for {{availabilityName}}.\n\nSee the details: {{requestDetailsLink}}', ['firstName', 'siteName', 'availabilityName', 'requestDetailsLink'], { matrix: false, audience: 'School Contact' }),
    ev('slots-assigned-directly', 'slot-request', 'Slots Assigned Directly by Site to School (no prior request)', 'Sent to the school when the site assigns slots without a request.', '{{siteName}} assigned {{approvedSlotCount}} slots to {{schoolName}}', 'Hi {{firstName}},\n\n{{siteName}} assigned {{approvedSlotCount}} slots to {{schoolName}} at {{requestedLocation}}.\n\nSee the placement: {{placementDetailLink}}', ['firstName', 'siteName', 'schoolName', 'approvedSlotCount', 'requestedLocation', 'placementDetailLink'], { matrix: false, audience: 'School Contact' }),
    ev('schedule-updated', 'schedule-management', 'School updates the schedule details', 'When location, dates, or other schedule details change.', 'Schedule updated: {{studentName}}', 'Hi {{firstName}},\n\n{{schoolName}} updated the schedule for {{studentName}}: {{changeSummary}}\n\nSee the schedule: {{scheduleDetailsLink}}', ['firstName', 'schoolName', 'studentName', 'changeSummary', 'scheduleDetailsLink']),
    ev('schedule-cancelled', 'schedule-management', 'School cancels a schedule', 'When a confirmed schedule is cancelled.', 'Schedule cancelled: {{studentName}}', 'Hi {{firstName}},\n\n{{schoolName}} cancelled the schedule for {{studentName}} ({{scheduleDates}}).\n\nSee the schedule: {{scheduleDetailsLink}}', ['firstName', 'schoolName', 'studentName', 'scheduleDates', 'scheduleDetailsLink']),
    ev('schedule-confirmed', 'schedule-management', 'School confirms a student schedule', 'When a student schedule is confirmed.', 'Schedule confirmed: {{studentName}}', 'Hi {{firstName}},\n\n{{schoolName}} confirmed {{studentName}} for {{scheduleDates}}.\n\nSee the schedule: {{scheduleDetailsLink}}', ['firstName', 'schoolName', 'studentName', 'scheduleDates', 'scheduleDetailsLink']),
    ev('schedule-student-replaced', 'schedule-management', 'School replaces or removes student from schedule', 'When a school replaces or removes a student from a schedule.', 'Student changed on a schedule', 'Hi {{firstName}},\n\n{{schoolName}} replaced or removed a student on the schedule for {{scheduleDates}}.\n\nSee the schedule: {{scheduleDetailsLink}}', ['firstName', 'schoolName', 'scheduleDates', 'scheduleDetailsLink']),
    ev('employee-verified', 'schedule-management', 'Student or Clinical Instructor verified as employee', 'When a student or clinical instructor is verified as an employee.', '{{studentName}} verified as an employee', 'Hi {{firstName}},\n\n{{studentName}} was verified as an employee of {{siteName}}.\n\nSee the placement: {{placementDetailLink}}', ['firstName', 'studentName', 'siteName', 'placementDetailLink']),
    ev('direct-schedule', 'schedule-management', 'Direct Schedule', 'Sent to the school when the site schedules students directly.', '{{siteName}} scheduled {{studentName}}', 'Hi {{firstName}},\n\n{{siteName}} scheduled {{studentName}} for {{scheduleDates}}.\n\nSee the schedule: {{scheduleDetailsLink}}', ['firstName', 'siteName', 'studentName', 'scheduleDates', 'scheduleDetailsLink'], { matrix: false, audience: 'School Contact' }),
    ev('assigned-schedules-30d', 'schedule-management', 'Assigned confirmed schedules starting within 30 days', 'A heads-up for each confirmed schedule you are assigned that starts within 30 days.', 'You have a student starting soon: {{studentName}}', 'Hi {{firstName}},\n\n{{studentName}} starts with you on {{scheduleDates}}.\n\nSee the schedule: {{scheduleDetailsLink}}', ['firstName', 'studentName', 'scheduleDates', 'scheduleDetailsLink'], { roles: PRECEPTOR, audience: 'Preceptor' }),
    ev('onb-student', 'onboarding', 'Student submits first or last onboarding requirement', 'When a student submits a first or last onboarding requirement.', '{{studentName}} submitted an onboarding requirement', 'Hi {{firstName}},\n\n{{studentName}} submitted {{requirementName}}.\n\nReview it: {{requirementDetailLink}}', ['firstName', 'studentName', 'requirementName', 'requirementDetailLink']),
    ev('ongoing-student', 'onboarding', 'Student submits first or last ongoing/offboarding activity', 'When a student submits a first or last ongoing or offboarding activity.', '{{studentName}} submitted an activity', 'Hi {{firstName}},\n\n{{studentName}} submitted {{requirementName}}.\n\nReview it: {{requirementDetailLink}}', ['firstName', 'studentName', 'requirementName', 'requirementDetailLink']),
    ev('onb-ci', 'onboarding', 'Clinical instructor submits first or last onboarding requirement', 'When a clinical instructor submits an onboarding requirement.', '{{clinicalInstructorName}} submitted a requirement', 'Hi {{firstName}},\n\n{{clinicalInstructorName}} submitted {{requirementName}}.\n\nReview it: {{requirementDetailLink}}', ['firstName', 'clinicalInstructorName', 'requirementName', 'requirementDetailLink']),
    ev('onb-school', 'onboarding', 'School submits onboarding requirements', 'When a school submits an onboarding requirement.', '{{schoolName}} submitted onboarding requirements', 'Hi {{firstName}},\n\n{{schoolName}} submitted {{requirementName}}.\n\nReview it: {{requirementDetailLink}}', ['firstName', 'schoolName', 'requirementName', 'requirementDetailLink']),
    ev('weekly-digest', 'digest', 'Weekly Request and Schedule Management Digest', 'A weekly summary of open requests and upcoming schedules.', 'Your weekly summary: {{openRequestCount}} open requests', 'Hi {{firstName}},\n\nThis week at {{siteName}}:\n\nOpen requests: {{openRequestCount}}\nUpcoming schedules: {{upcomingScheduleCount}}\n\nOpen Exxat One: {{exxatOneHomeLink}}', ['firstName', 'siteName', 'openRequestCount', 'upcomingScheduleCount', 'exxatOneHomeLink']),
  ],
  school: [
    ev('message-received-school', 'messages', 'Message from sites', 'When a site sends your school a message.', 'New message from {{siteName}}', 'Hi {{firstName}},\n\n{{siteName}} sent you a message: "{{messagePreview}}"\n\nRead and reply: {{messagesLink}}', ['firstName', 'siteName', 'messagePreview', 'messagesLink'], { audience: 'School Contact' }),
    ev('sr-approved', 'slot-request', 'Site approves a slot request', 'When a site approves one of your requests.', '{{siteName}} approved your slot request', 'Hi {{firstName}},\n\n{{siteName}} approved {{approvedSlotCount}} slots for {{availabilityName}}.\n\nSee the request: {{requestDetailsLink}}', ['firstName', 'siteName', 'approvedSlotCount', 'availabilityName', 'requestDetailsLink'], { audience: 'School Contact' }),
    ev('sr-declined', 'slot-request', 'Site declines a slot request', 'When a site declines one of your requests.', '{{siteName}} could not approve your request', 'Hi {{firstName}},\n\n{{siteName}} was unable to approve your request for {{availabilityName}}.\n\nSee the details: {{requestDetailsLink}}', ['firstName', 'siteName', 'availabilityName', 'requestDetailsLink'], { audience: 'School Contact' }),
    ev('sr-info', 'slot-request', 'Site asks for more information', 'When a site needs more information to decide.', '{{siteName}} needs more information', 'Hi {{firstName}},\n\n{{siteName}} asked for more information on your request for {{availabilityName}}.\n\nReply here: {{requestDetailsLink}}', ['firstName', 'siteName', 'availabilityName', 'requestDetailsLink'], { audience: 'School Contact' }),
    ev('sr-assigned', 'slot-request', 'Site assigns slots directly to your school', 'When a site assigns slots without a request.', '{{siteName}} assigned slots to your school', 'Hi {{firstName}},\n\n{{siteName}} assigned {{approvedSlotCount}} slots at {{requestedLocation}}.\n\nSee the placement: {{placementDetailLink}}', ['firstName', 'siteName', 'approvedSlotCount', 'requestedLocation', 'placementDetailLink'], { audience: 'School Contact' }),
    ev('sch-confirmed', 'schedule-management', 'Site confirms a student schedule', 'When a site confirms a student schedule.', 'Schedule confirmed: {{studentName}}', 'Hi {{firstName}},\n\n{{siteName}} confirmed {{studentName}} for {{scheduleDates}}.\n\nSee the schedule: {{scheduleDetailsLink}}', ['firstName', 'siteName', 'studentName', 'scheduleDates', 'scheduleDetailsLink'], { audience: 'School Contact' }),
    ev('sch-updated', 'schedule-management', 'Site updates the schedule details', 'When a site changes location, dates or other details.', 'Schedule updated: {{studentName}}', 'Hi {{firstName}},\n\n{{siteName}} updated the schedule for {{studentName}}: {{changeSummary}}\n\nSee the schedule: {{scheduleDetailsLink}}', ['firstName', 'siteName', 'studentName', 'changeSummary', 'scheduleDetailsLink'], { audience: 'School Contact' }),
    ev('sch-cancelled', 'schedule-management', 'Site cancels a schedule', 'When a site cancels a confirmed schedule.', 'Schedule cancelled: {{studentName}}', 'Hi {{firstName}},\n\n{{siteName}} cancelled the schedule for {{studentName}} ({{scheduleDates}}).\n\nSee the schedule: {{scheduleDetailsLink}}', ['firstName', 'siteName', 'studentName', 'scheduleDates', 'scheduleDetailsLink'], { audience: 'School Contact' }),
    ev('onb-due', 'onboarding', 'Student onboarding requirement is due soon', 'When a student has an onboarding requirement due within a week.', '{{studentName}}: {{requirementName}} is due {{dueDate}}', 'Hi {{firstName}},\n\n{{studentName}} still needs to complete {{requirementName}} by {{dueDate}}.\n\nSee the requirement: {{requirementDetailLink}}', ['firstName', 'studentName', 'requirementName', 'dueDate', 'requirementDetailLink'], { audience: 'School Contact' }),
    ev('onb-noncompliant', 'onboarding', 'A student becomes non-compliant', 'When a student is marked non-compliant.', '{{studentName}} is not cleared to start', 'Hi {{firstName}},\n\n{{studentName}} is not compliant with {{requirementName}} and cannot start until it is cleared.\n\nSee the requirement: {{requirementDetailLink}}', ['firstName', 'studentName', 'requirementName', 'requirementDetailLink'], { audience: 'School Contact' }),
    ev('weekly-digest-school', 'digest', 'Weekly Request and Schedule Digest', 'A weekly summary of your requests and upcoming schedules.', 'Your weekly summary: {{openRequestCount}} open requests', 'Hi {{firstName}},\n\nThis week:\n\nOpen requests: {{openRequestCount}}\nUpcoming schedules: {{upcomingScheduleCount}}\n\nOpen Exxat One: {{exxatOneHomeLink}}', ['firstName', 'openRequestCount', 'upcomingScheduleCount', 'exxatOneHomeLink'], { audience: 'School Contact' }),
  ],
};

export const fieldDef = (t: string): FieldDef => ({ token: t, label: LIB[t]?.label ?? t });
export const sampleFor = (t: string) => LIB[t]?.sample;
/** Replace {{tokens}} with the event's sample values, highlighted; unknown tokens stay visible. */
export function renderSample(html: string, mark = true): string {
  return html.replace(/\{\{\s*([^}]+?)\s*\}\}/g, (m, t: string) => {
    const v = sampleFor(t);
    if (v == null) return m;
    const out = isLink(t) ? `<a href="#" style="color:#2563eb">${v}</a>` : v;
    return mark ? `<mark style="background:#fef3c7;color:inherit;padding:0 2px;border-radius:3px">${out}</mark>` : out;
  });
}
const toHtml = (text: string) => text.split(/\n\n/).map((p) => `<p>${p.replace(/\n/g, '<br>')}</p>`).join('');

// ── Roles, recipients ────────────────────────────────────────────────────────
export const ROLES: Record<Portal, string[]> = {
  site: ['Site Admin', 'Location Coordinator', 'Discipline Coordinator', 'Location-Discipline Coordinator', 'Preceptor'],
  school: ['School Admin', 'Program Coordinator', 'Clinical Instructor'],
};
export const LIMITED_ROLES: Record<Portal, string[]> = { site: ['Preceptor'], school: ['Clinical Instructor'] };
export interface Recipient { id: string; name: string; email: string; selected: boolean; external?: boolean; blocked?: boolean }
const people = (...r: [string, string, boolean?][]): Recipient[] => r.map(([name, email, blocked], i) => ({ id: `${email}`, name, email, selected: !blocked, blocked, external: false }) as Recipient);
const RECIPIENTS: Record<string, Recipient[]> = {
  'site|Site Admin': [{ id: 'compliance@bedlam-hospital.org', name: 'compliance@bedlam-hospital.org', email: 'compliance@bedlam-hospital.org', selected: true, external: true }, ...people(['abcd test', 'abcdtest@mailinator.com'], ['All Notification Blocked', 'allnotificationandemaildisabled@exxat.testinator.com', true], ['Maya Chen', 'maya.chen@mailinator.com'], ['Luis Ortega', 'luis.ortega@mailinator.com'])],
  'site|Location Coordinator': people(['Raymond Castillo', 'r.castillo@medstarhealth.org']),
  'site|Discipline Coordinator': people(['Daniel Kim', 'd.kim@medstarhealth.org']),
  'site|Location-Discipline Coordinator': [],
  'site|Preceptor': people(['David Whitfield', 'd.whitfield@medstarhealth.org']),
  'school|School Admin': people(['Dr. Renee Blackwell', 'r.blackwell@bowiestate.edu'], ['Marcus Ellery', 'm.ellery@bowiestate.edu']),
  'school|Program Coordinator': people(['Denise Carrington', 'd.carrington@bowiestate.edu']),
  'school|Clinical Instructor': people(['Harold Whitman', 'h.whitman@bowiestate.edu']),
};

// ── Templates ────────────────────────────────────────────────────────────────
export interface HistoryItem { action: string; by: string; at: string }
export interface TemplateRecord {
  id: string; portal: Portal; group: Group; categoryId: string; eventId: string; name: string;
  subject: string; body: string; type: 'Standard' | 'Customized'; isDefault: boolean; attachments: string[];
  layout: LayoutId; audience: AudienceType; replyToOverride: string | null; history: HistoryItem[]; bulkId?: string;
}
const SYSTEM = 'Exxat One';
const SEED_AT = '2026-04-08T11:20:00';
let uid = 1;
const nextId = (p: string) => `${p}-${Date.now()}-${uid++}`;

let templates: TemplateRecord[] = [];
function seedTemplates() {
  for (const portal of ['site', 'school'] as Portal[]) {
    for (const e of EVENTS[portal]) {
      templates.push({ id: `n-${e.id}`, portal, group: 'notification', categoryId: e.category, eventId: e.id, name: e.label, subject: e.subject, body: toHtml(e.body), type: 'Standard', isDefault: true, attachments: [], layout: 'own-exxat', audience: e.audience, replyToOverride: null, history: [{ action: 'Created', by: SYSTEM, at: SEED_AT }] });
    }
  }
  // One customized example per portal, as in the reference: a customized default beside the standard one.
  const site = templates.find((t) => t.id === 'n-slot-request-approved')!;
  site.isDefault = false;
  templates.push({ ...site, id: 'n-slot-request-approved-custom', name: 'Site slot request approved', type: 'Customized', isDefault: true, subject: '{{siteName}} approved {{approvedSlotCount}} slots for {{schoolName}}', history: [{ action: 'Set as default', by: CURRENT_USER, at: '2026-04-09T07:10:00' }, { action: 'Created', by: CURRENT_USER, at: SEED_AT }] });
  // Bulk Email templates are the existing ones, kept in sync with mockEmailTemplates.
  for (const t of mockEmailTemplates) {
    const siblings = templates.filter((x) => x.portal === t.portal && x.group === 'bulk' && x.categoryId === t.section && x.eventId === t.category);
    templates.push({ id: `b-${t.id}`, portal: t.portal as Portal, group: 'bulk', categoryId: t.section, eventId: t.category, name: t.name, subject: t.subject, body: t.body, type: 'Standard', isDefault: siblings.length === 0, attachments: [...t.attachments], layout: 'none', audience: t.audienceType, replyToOverride: t.replyToOverride, history: [{ action: 'Created', by: SYSTEM, at: SEED_AT }], bulkId: t.id });
  }
}
seedTemplates();

// ── Matrix state ─────────────────────────────────────────────────────────────
type Cell = { inApp: boolean; email: boolean };
const cells: Record<string, Cell> = {};
const locks: Record<Portal, Record<string, boolean>> = { site: { 'schedule-management': true, digest: true }, school: { digest: true } };
const myPrefs: Record<string, Cell> = {};
const recipients: Record<string, Recipient[]> = JSON.parse(JSON.stringify(RECIPIENTS));

// ── Store plumbing ───────────────────────────────────────────────────────────
let version = 0;
const listeners = new Set<() => void>();
const emit = () => { version++; listeners.forEach((l) => l()); };
const subscribe = (l: () => void) => { listeners.add(l); return () => listeners.delete(l); };
export function useNotifStore() {
  useSyncExternalStore(subscribe, () => version);
}

// ── Template API ─────────────────────────────────────────────────────────────
export const getTemplate = (id: string) => templates.find((t) => t.id === id);
/** The notification-area record behind a Bulk Email template (the compose picker works with the Bulk Email id). */
export const getTemplateByBulkId = (bulkId: string) => templates.find((t) => t.bulkId === bulkId);
export const templatesFor = (portal: Portal, group: Group, categoryId: string, eventId: string) =>
  templates.filter((t) => t.portal === portal && t.group === group && t.categoryId === categoryId && t.eventId === eventId).sort((a, b) => Number(b.isDefault) - Number(a.isDefault));

export interface EventRef { group: Group; categoryId: string; categoryLabel: string; eventId: string; label: string; count: number; icon: string }
export function eventRefs(portal: Portal): EventRef[] {
  const out: EventRef[] = [];
  for (const c of NOTIF_CATEGORIES[portal]) {
    for (const e of EVENTS[portal].filter((x) => x.category === c.id)) {
      out.push({ group: 'notification', categoryId: c.id, categoryLabel: c.label, eventId: e.id, label: e.label, count: templatesFor(portal, 'notification', c.id, e.id).length, icon: c.icon });
    }
  }
  const seen = new Set<string>();
  for (const t of templates.filter((x) => x.portal === portal && x.group === 'bulk')) {
    const k = `${t.categoryId}|${t.eventId}`;
    if (seen.has(k)) continue;
    seen.add(k);
    out.push({ group: 'bulk', categoryId: t.categoryId, categoryLabel: t.categoryId, eventId: t.eventId, label: t.eventId, count: templatesFor(portal, 'bulk', t.categoryId, t.eventId).length, icon: 'envelope' });
  }
  return out;
}
export const eventOf = (portal: Portal, eventId: string) => EVENTS[portal].find((e) => e.id === eventId);

const stamp = (t: TemplateRecord, action: string) => t.history.unshift({ action, by: CURRENT_USER, at: new Date().toISOString() });
function syncBulk(t: TemplateRecord) {
  if (t.group !== 'bulk') return;
  const mock: EmailTemplate = { id: t.bulkId ?? `tmpl-${t.id}`, portal: t.portal, section: t.categoryId as EmailTemplate['section'], category: t.eventId, name: t.name, subject: t.subject, body: t.body, attachments: t.attachments, replyToOverride: t.replyToOverride, audienceType: t.audience };
  t.bulkId = mock.id;
  const i = mockEmailTemplates.findIndex((m) => m.id === mock.id);
  if (i >= 0) mockEmailTemplates[i] = mock; else mockEmailTemplates.push(mock);
}

export function createTemplate(input: Omit<TemplateRecord, 'id' | 'type' | 'isDefault' | 'history' | 'bulkId'>): TemplateRecord {
  const t: TemplateRecord = { ...input, id: nextId('t'), type: 'Customized', isDefault: false, history: [{ action: 'Created', by: CURRENT_USER, at: new Date().toISOString() }] };
  templates.push(t);
  syncBulk(t);
  emit();
  return t;
}
export function updateTemplate(id: string, patch: Partial<TemplateRecord>) {
  const t = getTemplate(id);
  if (!t || t.type === 'Standard') return;
  Object.assign(t, patch);
  stamp(t, 'Edited');
  syncBulk(t);
  emit();
}
export function cloneTemplate(id: string, name: string): TemplateRecord | undefined {
  const s = getTemplate(id);
  if (!s) return;
  const t: TemplateRecord = { ...s, id: nextId('t'), name, type: 'Customized', isDefault: false, attachments: [...s.attachments], bulkId: undefined, history: [{ action: `Cloned from "${s.name}"`, by: CURRENT_USER, at: new Date().toISOString() }] };
  templates.push(t);
  syncBulk(t);
  emit();
  return t;
}
export function setDefault(id: string) {
  const t = getTemplate(id);
  if (!t) return;
  templates.filter((x) => x.portal === t.portal && x.group === t.group && x.categoryId === t.categoryId && x.eventId === t.eventId).forEach((x) => { x.isDefault = x.id === id; });
  stamp(t, 'Set as default');
  emit();
}
export function deleteBlockedReason(t: TemplateRecord): string | null {
  if (t.type === 'Standard') return 'Standard templates cannot be deleted.';
  const siblings = templatesFor(t.portal, t.group, t.categoryId, t.eventId);
  if (t.isDefault && siblings.length > 1) return 'Set another template as default before deleting this one.';
  return null;
}
export function deleteTemplate(id: string): string | null {
  const t = getTemplate(id);
  if (!t) return null;
  const why = deleteBlockedReason(t);
  if (why) return why;
  templates = templates.filter((x) => x.id !== id);
  if (t.bulkId) { const i = mockEmailTemplates.findIndex((m) => m.id === t.bulkId); if (i >= 0) mockEmailTemplates.splice(i, 1); }
  emit();
  return null;
}

// ── Matrix API (Notification Configuration and My Notifications) ─────────────
export const eventsForRole = (portal: Portal, role: string) =>
  EVENTS[portal].filter((e) => e.matrix !== false && (e.roles ? e.roles.includes(role) : !LIMITED_ROLES[portal].includes(role)));
export const isLocked = (portal: Portal, categoryId: string) => !!NOTIF_CATEGORIES[portal].find((c) => c.id === categoryId)?.permanentLock || !!locks[portal][categoryId];
export function toggleLock(portal: Portal, categoryId: string) { locks[portal][categoryId] = !locks[portal][categoryId]; emit(); }
export const getCell = (portal: Portal, role: string, eventId: string): Cell => cells[`${portal}|${role}|${eventId}`] ?? { inApp: true, email: true };
export function setCell(portal: Portal, role: string, eventId: string, ch: keyof Cell, v: boolean) { cells[`${portal}|${role}|${eventId}`] = { ...getCell(portal, role, eventId), [ch]: v }; emit(); }
export function setCategory(portal: Portal, role: string, categoryId: string, ch: keyof Cell, v: boolean) {
  eventsForRole(portal, role).filter((e) => e.category === categoryId).forEach((e) => { cells[`${portal}|${role}|${e.id}`] = { ...getCell(portal, role, e.id), [ch]: v }; });
  emit();
}
export const getMyPref = (portal: Portal, eventId: string): Cell => myPrefs[`${portal}|${eventId}`] ?? { inApp: true, email: true };
export function setMyPref(portal: Portal, eventId: string, ch: keyof Cell, v: boolean) { myPrefs[`${portal}|${eventId}`] = { ...getMyPref(portal, eventId), [ch]: v }; emit(); }
export function setMyCategory(portal: Portal, categoryId: string, ch: keyof Cell, v: boolean) {
  EVENTS[portal].filter((e) => e.matrix !== false && !e.roles && e.category === categoryId).forEach((e) => { myPrefs[`${portal}|${e.id}`] = { ...getMyPref(portal, e.id), [ch]: v }; });
  emit();
}

export const getRecipients = (portal: Portal, role: string) => recipients[`${portal}|${role}`] ?? [];
export function setRecipients(portal: Portal, role: string, list: Recipient[]) { recipients[`${portal}|${role}`] = list; emit(); }
export function recipientSummary(portal: Portal, role: string) {
  const list = getRecipients(portal, role).filter((r) => r.selected);
  const external = list.filter((r) => r.external).length;
  const internal = list.length - external;
  const noun = role.toLowerCase() + (internal === 1 ? '' : 's');
  return `${internal} ${noun}${external ? `, ${external} external` : ''}`;
}

export function whenText(iso: string) {
  return new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
}
