// Which merge fields each Bulk Email screen offers.
// The full catalogue (mergeFieldCatalog.ts) holds every field the engine can fill. A sender writing from a
// given screen only needs the ones that make sense there. The lists below start from the field lists
// Harshavardhan Martur sent on 2026-10-26 (his wording is kept in `harsha`), plus a short Product baseline
// that every email needs (recipient's name for the greeting, sender, site, sign-in link, date) and, on the schedule screens, two onboarding
// fields. Anything beyond his lists is held in `additions` so reviewers can see exactly what is ours.
// The compose panel reads this file, and the review workbook is generated from it.
import { MERGE_FIELD_CATALOG, MERGE_FIELD_GROUPS, mergeFieldsForAudiences, type MergeFieldDef } from './mergeFieldCatalog';
import type { AudienceType } from './mockEmailTemplates';

export type SurfaceKey =
  | 'site.schedules'
  | 'site.schedules.group'
  | 'site.locations'
  | 'site.locationSchedules'
  | 'site.locationSchedules.group'
  | 'site.locationPersonnel'
  | 'site.partnerSchedules'
  | 'site.partnerSchedules.group'
  | 'site.personnel'
  | 'site.schoolPartners'
  | 'site.partnerContacts'
  | 'site.jobCandidates'
  | 'school.schedules'
  | 'school.schedules.group'
  | 'school.requests';

/** The group variant of a schedules surface, used when the Group view is showing or every ticked row is a group placement. */
export const groupVariant = (key: SurfaceKey): SurfaceKey => (key.endsWith('.group') ? key : (`${key}.group` as SurfaceKey));

// Harsha's lists, in his order. Where his label is not the catalogue label the comment says which it maps to.
const PERSONNEL = ['firstName', 'lastName', 'associatedLocations', 'associatedDisciplines']; // Personnel First / Last Name
const PARTNER = ['schoolName', 'firstName', 'lastName', 'phone', 'email']; // Program Contact First / Last Name, Phone Number, Email ID
const SCHEDULE_COMMON = [
  'scheduleStatus', 'onboardingStatus', 'locationName', 'scheduleDateRange', 'discipline', 'specialization', 'programType', 'shift', 'daysOfWeek',
  'studentFirstName', 'studentLastName', 'preceptorFirstName', 'preceptorLastName', 'schoolContactFirstName', 'schoolContactLastName', 'ciFirstName', 'ciLastName',
];
const SCHEDULE_ONE = ['scheduleId', ...SCHEDULE_COMMON, 'scheduleDetailLink', 'scheduleTable'];
const SCHEDULE_GROUP = [
  'groupName', 'groupId', 'schoolProgramName', 'groupAvailability', 'groupSlots', 'groupMembers', ...SCHEDULE_COMMON,
  'placementTable', 'groupDetailsLink', 'groupMembersTable',
];
const REQUEST_SCHOOL = [
  'hospitalName', 'siteContactFirstName', 'siteContactLastName', 'requestId', 'slotStatus', 'availabilityName', 'experienceType', 'discipline', 'specialization', 'programType',
  'requestedLocation', 'requestedSlots', 'requestedDuration', 'requestedShifts', 'requestedDays', 'requestDetailLink', 'requestTable',
]; // Site Name maps to Site / Hospital Name

// Not in Harsha's message. Every email needs to be signed and to point somewhere.
export const BASELINE = ['firstName', 'lastName', 'senderName', 'hospitalName', 'loginUrl', 'today'];
const ONBOARDING_EXTRA = ['onboardingDeadline', 'outstandingItems'];
// Job Candidates is not in Harsha's message; the list is the one kept from the earlier clean-up.
const JOB = [
  'firstName', 'lastName', 'recipientName', 'candidateName', 'department', 'jobTitle', 'jobLocation', 'compensation', 'stage', 'applicationDate', 'jobsPortalUrl',
  // Typed by the recruiter; the three seeded Jobs templates use them.
  'interviewDate', 'interviewTime', 'interviewFormat', 'interviewerName', 'interviewerTitle', 'confirmationDeadline', 'offerExpirationDate', 'proposedStartDate',
];

export interface SurfacePolicy {
  key: SurfaceKey;
  label: string;
  portal: 'site' | 'school';
  where: string;
  /** Who can be emailed from here. */
  personas: string;
  /** What emails are typically sent from here: the test for whether a field belongs. */
  purpose: string;
  /** Fields from Harsha's list for this screen. */
  harsha: string[];
  /** Fields Product added on top of Harsha's list (the baseline is added automatically). */
  additions: string[];
  /** Why the additions are there. */
  additionNote: string;
  /** Standard (default) templates for this screen, from Harsha's list. Users can still save their own. */
  templates: string;
  /** Harsha's own heading for this screen, or what it is inheriting. */
  source: string;
  tokens: string[];
}

function policy(p: Omit<SurfacePolicy, 'tokens'>): SurfacePolicy {
  const tokens = [...new Set([...p.harsha, ...BASELINE, ...p.additions])];
  return { ...p, tokens };
}

const SCHED_PERSONAS_SITE = 'Students, Preceptors, Site Personnel, Schools, Placement Faculty / CI';
const SCHED_TEMPLATES = 'Students: onboarding reminder. Preceptor: placement information. Schools: onboarding reminder. CI: onboarding reminder. Location Coordinators: placement information.';
const GROUP_TEMPLATES = 'The same five audiences, written for a group placement.';
const SCHED_NOTE = 'Onboarding Deadline and Outstanding Items. The onboarding-reminder templates need to say what is missing and by when; Onboarding Status alone does not.';
const NONE = 'None. Generic emails; users can still save their own templates.';

export const SURFACE_POLICY: SurfacePolicy[] = [
  policy({
    key: 'site.schedules', label: 'Site: Schedules (All / Individual)', portal: 'site', where: 'Schedules > Schedules List > Individual',
    personas: SCHED_PERSONAS_SITE, purpose: 'Placement updates and onboarding reminders to the students, preceptors, schools, clinical instructors and coordinators on a placement.',
    harsha: SCHEDULE_ONE, additions: ONBOARDING_EXTRA, additionNote: SCHED_NOTE, templates: SCHED_TEMPLATES, source: 'Site side > Schedules Grid > All Schedules / Individual Schedules',
  }),
  policy({
    key: 'site.schedules.group', label: 'Site: Schedules (Group)', portal: 'site', where: 'Schedules > Schedules List > Group',
    personas: SCHED_PERSONAS_SITE, purpose: 'The same updates and reminders, written for a whole group placement.',
    harsha: SCHEDULE_GROUP, additions: ONBOARDING_EXTRA, additionNote: SCHED_NOTE, templates: GROUP_TEMPLATES, source: 'Site side > Schedules Grid > Group Schedules',
  }),
  policy({
    key: 'site.locations', label: 'Site: Locations', portal: 'site', where: 'Locations (list)',
    personas: 'Location Coordinators, Preceptors, All site personnel at the ticked locations', purpose: 'Notices to the people who run a location: orientation or parking changes, coverage updates, expectations for upcoming placements.',
    harsha: PERSONNEL, additions: [], additionNote: '', templates: NONE, source: 'Site side > Location Grid > Location Coordinators',
  }),
  policy({
    key: 'site.locationSchedules', label: 'Site: Location > Schedules tab (Individual)', portal: 'site', where: 'Locations > a location > Schedules > Individual',
    personas: SCHED_PERSONAS_SITE, purpose: 'Same as the Schedules page, narrowed to one location.',
    harsha: SCHEDULE_ONE, additions: ONBOARDING_EXTRA, additionNote: SCHED_NOTE, templates: SCHED_TEMPLATES, source: 'Not in Harsha\'s message; uses the Schedules Grid list',
  }),
  policy({
    key: 'site.locationSchedules.group', label: 'Site: Location > Schedules tab (Group)', portal: 'site', where: 'Locations > a location > Schedules > Group',
    personas: SCHED_PERSONAS_SITE, purpose: 'Same as the Schedules page, narrowed to one location.',
    harsha: SCHEDULE_GROUP, additions: ONBOARDING_EXTRA, additionNote: SCHED_NOTE, templates: GROUP_TEMPLATES, source: 'Not in Harsha\'s message; uses the Group Schedules list',
  }),
  policy({
    key: 'site.locationPersonnel', label: 'Site: Location > Personnel tab', portal: 'site', where: 'Locations > a location > Personnel',
    personas: 'Staff at one location, grouped by role', purpose: 'Messages to the staff at one location.',
    harsha: PERSONNEL, additions: [], additionNote: '', templates: NONE, source: 'Not in Harsha\'s message; uses the Personnel Grid list',
  }),
  policy({
    key: 'site.partnerSchedules', label: 'Site: School Partner > Schedules tab (Individual)', portal: 'site', where: 'School Partners > a school > Schedules > Individual',
    personas: SCHED_PERSONAS_SITE, purpose: 'Same as the Schedules page, narrowed to one school.',
    harsha: SCHEDULE_ONE, additions: ONBOARDING_EXTRA, additionNote: SCHED_NOTE, templates: SCHED_TEMPLATES, source: 'Not in Harsha\'s message; uses the Schedules Grid list',
  }),
  policy({
    key: 'site.partnerSchedules.group', label: 'Site: School Partner > Schedules tab (Group)', portal: 'site', where: 'School Partners > a school > Schedules > Group',
    personas: SCHED_PERSONAS_SITE, purpose: 'Same as the Schedules page, narrowed to one school.',
    harsha: SCHEDULE_GROUP, additions: ONBOARDING_EXTRA, additionNote: SCHED_NOTE, templates: GROUP_TEMPLATES, source: 'Not in Harsha\'s message; uses the Group Schedules list',
  }),
  policy({
    key: 'site.personnel', label: 'Site: Personnel', portal: 'site', where: 'Site Details > Personnel (list)',
    personas: 'The site staff ticked', purpose: 'Messages to site staff: access reminders, role-wide notices, what is expected of them.',
    harsha: PERSONNEL, additions: [], additionNote: '', templates: NONE, source: 'Site side > Personnel Grid',
  }),
  policy({
    key: 'site.schoolPartners', label: 'Site: School Partners', portal: 'site', where: 'Site Details > School Partners (list)',
    personas: 'Program contacts at the ticked schools', purpose: 'Messages to partner schools: renewals, open requests, partnership announcements.',
    harsha: PARTNER, additions: [], additionNote: '', templates: NONE, source: 'Site side > School Partners Grid',
  }),
  policy({
    key: 'site.partnerContacts', label: 'Site: School Partner > Program Contacts', portal: 'site', where: 'School Partners > a school > About > Program Contacts',
    personas: 'The contacts ticked at one school', purpose: 'Messages to specific people at one school.',
    harsha: PARTNER, additions: [], additionNote: '', templates: NONE, source: 'Not in Harsha\'s message; uses the School Partners Grid list',
  }),
  policy({
    key: 'site.jobCandidates', label: 'Site: Jobs > Candidates', portal: 'site', where: 'Jobs > a job > Candidates',
    personas: 'The applicants ticked for a job', purpose: 'Recruiting messages: application received, interview invitations, offers, rejections.',
    harsha: [], additions: JOB, additionNote: 'Jobs is not in Harsha\'s message. This is the list kept from the earlier clean-up; decide whether Jobs is in this release.', templates: 'Not specified by Harsha. The three seeded Jobs templates remain.', source: 'Not in Harsha\'s message',
  }),
  policy({
    key: 'school.schedules', label: 'School: Schedules and Onboarding (Individual)', portal: 'school', where: 'School portal > Schedules and Onboarding',
    personas: 'Students, Site Personnel, Placement Faculty / CI, Schools', purpose: 'Placement updates and onboarding reminders from the school side.',
    harsha: SCHEDULE_ONE, additions: [...ONBOARDING_EXTRA, 'studentLoginStatus'], additionNote: SCHED_NOTE + ' Student Login Status: a common school-side reminder.', templates: SCHED_TEMPLATES, source: 'School side > Schedules Grid, left blank by Harsha; Product decision: use the site-side Schedules Grid list',
  }),
  policy({
    key: 'school.schedules.group', label: 'School: Schedules and Onboarding (Group)', portal: 'school', where: 'School portal > Schedules and Onboarding',
    personas: 'Students, Site Personnel, Placement Faculty / CI, Schools', purpose: 'Placement updates and onboarding reminders for a group placement.',
    harsha: SCHEDULE_GROUP, additions: ONBOARDING_EXTRA, additionNote: SCHED_NOTE, templates: GROUP_TEMPLATES, source: 'School side > Schedules Grid, left blank by Harsha; Product decision: use the site-side Group Schedules list',
  }),
  policy({
    key: 'school.requests', label: 'School: Requests', portal: 'school', where: 'School portal > Requests',
    personas: 'The site contact for each request ticked', purpose: 'Follow-ups on requests to a site: chasing a pending request, adding information.',
    harsha: REQUEST_SCHOOL, additions: [], additionNote: '', templates: 'Follow up on pending requests.', source: 'School side > Requests',
  }),
];

export const SURFACE_BY_KEY: Record<SurfaceKey, SurfacePolicy> = Object.fromEntries(SURFACE_POLICY.map((s) => [s.key, s])) as Record<SurfaceKey, SurfacePolicy>;

/** The fields to offer on a screen: those the persona(s) being emailed can fill, limited to the screen's own set. */
export function fieldsForSurface(surface: SurfaceKey | undefined, audiences: AudienceType[], portal: 'site' | 'school'): MergeFieldDef[] {
  const all = mergeFieldsForAudiences(audiences, portal);
  if (!surface) return all;
  const keep = new Set(SURFACE_BY_KEY[surface].tokens);
  return all.filter((f) => keep.has(f.token));
}

/** Catalogue entries for a screen, for the review workbook (ignores persona and portal filters). */
export function catalogueForSurface(surface: SurfaceKey): MergeFieldDef[] {
  const keep = new Set(SURFACE_BY_KEY[surface].tokens);
  return MERGE_FIELD_CATALOG.filter((f) => keep.has(f.token));
}

export { MERGE_FIELD_GROUPS };
