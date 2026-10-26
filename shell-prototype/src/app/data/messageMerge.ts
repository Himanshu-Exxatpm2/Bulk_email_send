import type { AudienceType } from './mockEmailTemplates';
import { mockLocations } from './mockLocations';
import { mockPersonnel } from './mockPersonnel';
import { mockSlotRequests, type SlotRequest } from './mockSlotRequests';
import { mockCandidates, mockJobs } from './mockData';
import { mockSchedules, type Schedule } from './mockSchedules';
import { mockSchoolPartners, type SchoolPartner } from './mockSchoolPartners';
import { mockPlacementFaculty } from './mockPlacementFaculty';
import { mockStudents } from './mockStudents';
import { tenantEmailConfig } from './tenantEmailConfig';
import { MERGE_FIELD_CATALOG } from './mergeFieldCatalog';
import {
  locateStudent,
  locatePartner,
  locatePreceptor,
  locateFaculty,
  locatePersonnel,
  type Recipient,
  contactNameFor,
} from './mergeFieldResolver';

// Renders a message's merge fields for ONE recipient (subject and body alike).
//
// Before this existed the wizard held a single message string for every recipient and
// only highlighted its tokens, so Preview, History and the Notification Preview all
// showed raw {{tokens}}. This is the missing stage between "recipient bound" and
// "preview / send": each recipient's message is rendered against their own records.
//
// Values come from four places:
//   record   the recipient's own mock record, plus records it links to (a student's
//            schedule, a school's slot request, a candidate's job)
//   tenant   sender and platform constants (senderName, hospitalName, loginUrl)
//   derived  computed from the above (dates, days-until, onboarding deadline, the
//            outstanding-items list)
//   author   text the sender is meant to write ({{messageBody}}, {{subject}},
//            {{changeDescription}}…). These have no source, so they stay unresolved.
//
// A token with no value is reported in `unresolved` and left in the text exactly as
// written — never guessed, never blanked — so the caller can flag or exclude.

export const CURRENT_USER = 'Kierra Mango';
const DEFAULT_HOSPITAL = 'MedStar Health';
const LOGIN_URL = 'https://one.exxat.com/login';
const PORTAL_URL = 'https://one.exxat.com';
const JOBS_PORTAL_URL = 'https://one.exxat.com/jobs';

export interface MergeRecipient extends Recipient { name: string; /** Schedules ticked on the screen that this person is being emailed about. */ scheduleIds?: string[] }
export interface MergeOptions {
  /** Values the sender supplied for author-level tokens, keyed by token name. */
  extra?: Record<string, string>;
  /** Reference date for days-until values; defaults to now. */
  today?: Date;
  /** Escape values for HTML (bodies). Off for plain text (subjects). */
  html?: boolean;
  /** Wrap each merged value in <mark> (HTML only), for previews that show what came from a merge field. */
  mark?: boolean;
  /** Which portal is sending; picks the sender organisation. Defaults to the site portal. */
  portal?: 'site' | 'school';
}
export interface Rendered { text: string; unresolved: string[] }

type Scalars = Record<string, string | null | undefined>;
interface Bag { scalars: Scalars; lists: Record<string, string[] | undefined>; tables: Record<string, { head: string[]; rows: string[][] } | undefined> }

const CELL = 'padding:6px;border:1px solid #e5e7eb;text-align:left;';
const tableHtml = (t: { head: string[]; rows: string[][] }) =>
  `<table style="border-collapse:collapse;width:100%;"><thead><tr>${t.head.map((h) => `<th style="${CELL}background:#f3f4f6;">${esc(h)}</th>`).join('')}</tr></thead><tbody>${t.rows.map((r) => `<tr>${r.map((c) => `<td style="${CELL}">${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
// A subject line has no markup, so a table there collapses to "a: b, c: d" text.
const tableText = (t: { head: string[]; rows: string[][] }) => t.rows.map((r) => r.map((c, i) => `${t.head[i]}: ${c}`).join(', ')).join('; ');

// Two token spellings exist side by side — {{studentName}} in templates and the
// template editor, {{first_name}} in Compose's insert menu and older History rows.
// Normalizing removes the difference: both reduce to letters and digits, lower-cased.
const norm = (t: string) => t.toLowerCase().replace(/[^a-z0-9]/g, '');

const esc = (v: string) => v.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// ── date helpers (all local calendar days, matching how dates are displayed) ────
const parts = (iso: string): [number, number, number] => {
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
  return [y, m - 1, d];
};
const fmtDate = (iso?: string | null): string | undefined => {
  if (!iso) return undefined;
  const [y, m, d] = parts(iso);
  return new Date(y, m, d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
};
const addDays = (iso: string, n: number): string => {
  const [y, m, d] = parts(iso);
  const dt = new Date(y, m, d + n);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
};
// Whole days elapsed since `iso`, never negative.
const daysSince = (today: Date, iso: string): string => {
  const [y, m, d] = parts(iso);
  const t0 = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  return String(Math.max(0, Math.round((t0 - new Date(y, m, d).getTime()) / 86_400_000)));
};
// Whole days from today to `iso`; undefined once it has passed (a "starts in -12 days"
// message is wrong, so the token is left unresolved and flagged instead).
const daysUntil = (today: Date, iso?: string | null): string | undefined => {
  if (!iso) return undefined;
  const [y, m, d] = parts(iso);
  const t0 = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const n = Math.round((new Date(y, m, d).getTime() - t0) / 86_400_000);
  return n >= 0 ? String(n) : undefined;
};

/** Long-form date for an ISO day, e.g. "September 1, 2026". */
export const formatLongDate = (iso: string) => fmtDate(iso) ?? iso;
/** ISO day shifted by n days. */
export const shiftISODate = addDays;

const hospitalOf = (location?: string | null) =>
  (location && mockLocations.find((l) => l.name === location)?.hospitalName) || DEFAULT_HOSPITAL;

// Deterministic mock rule for the onboarding checklist: how many items are still
// open follows the student's onboarding status. There is no per-item data in the mock.
const CHECKLIST = ['Immunization records', 'Background check', 'CPR certification', 'Drug screening'];
const outstandingFor = (status?: string | null): string[] | undefined => {
  switch (status) {
    case 'Compliant': return [];
    case 'Pending': return CHECKLIST.slice(3);
    case 'Non-Compliant': return CHECKLIST.slice(2);
    case 'Not Started': return CHECKLIST;
    default: return undefined;
  }
};

// ── helpers for the wider field set (schedule, location, school, request) ─────────
const DISCIPLINE_RULES: [RegExp, string][] = [
  [/RN|BSN|DNP|MSN|LPN/, 'Nursing'], [/MOT|\bOT\b/, 'Occupational Therapy'], [/DPT|\bPT\b/, 'Physical Therapy'],
  [/Rad/, 'Radiologic Technology'], [/Respiratory/, 'Respiratory Therapy'], [/SLP/, 'Speech-Language Pathology'], [/Pharm/, 'Pharmacy'],
];
export const disciplineFor = (programType?: string | null) =>
  programType ? (DISCIPLINE_RULES.find(([re]) => re.test(programType))?.[1] ?? programType) : undefined;

const shortDate = (iso: string, withYear: boolean) => {
  const [y, m, d] = parts(iso);
  return new Date(y, m, d).toLocaleDateString('en-US', withYear ? { month: 'short', day: 'numeric', year: 'numeric' } : { month: 'short', day: 'numeric' });
};
const rangeLabel = (a?: string | null, b?: string | null) => (a && b ? `${shortDate(a, false)} – ${shortDate(b, true)}` : undefined);
// "15 weeks", "4 weeks 2 days", "6 days" — same wording as the Requested Duration column.
const spanLabel = (a?: string | null, b?: string | null) => {
  if (!a || !b) return undefined;
  const [y1, m1, d1] = parts(a);
  const [y2, m2, d2] = parts(b);
  const days = Math.round((new Date(y2, m2, d2).getTime() - new Date(y1, m1, d1).getTime()) / 86_400_000) + 1;
  const w = Math.floor(days / 7), r = days % 7;
  if (w === 0) return `${r} day${r === 1 ? '' : 's'}`;
  return r === 0 ? `${w} week${w === 1 ? '' : 's'}` : `${w} week${w === 1 ? '' : 's'} ${r} day${r === 1 ? '' : 's'}`;
};
// Group = a rotation shared by more than one student; same rule the Schedules list uses.
const experienceOf = (sc: Schedule) =>
  mockSchedules.filter((x) => x.rotationName === sc.rotationName).length > 1 ? 'Group' : 'Individual';
const partnerByName = (school?: string | null) => mockSchoolPartners.find((p) => p.schoolName === school);
const locationRecord = (name?: string | null) => (name ? mockLocations.find((l) => l.name === name) : undefined);
const COORDINATOR_ROLES = ['Clinical Coordinator', 'Placement Coordinator'];
const coordinatorsAt = (name?: string | null) =>
  name ? mockPersonnel.filter((p) => p.location === name && COORDINATOR_ROLES.includes(p.role)) : [];
const scheduleLine = (x: Schedule) => `${x.studentName} — ${x.location} — ${rangeLabel(x.startDate, x.endDate)}`;
const sameLoc = (a: string, b: string) => a === b || a.startsWith(b.split(' – ')[0]);
const MAX_LIST = 12;

const OWN_NAME_TOKEN: Record<string, string> = {
  Student: 'studentName',
  'School Contact': 'schoolContactName',
  'Partner Contact': 'recipientName',
  'Staff-Personnel': 'staffName',
  Candidate: 'candidateName',
  Preceptor: 'preceptorName',
  'Placement Faculty/CI': 'facultyName',
};

// What is known from the recipient row alone, even when no record can be found.
function nameBag(audience: AudienceType, name: string): Scalars {
  const [first = '', ...rest] = name.replace(/^(Dr\.|Prof\.)\s+/, '').split(' ');
  return { name, firstName: first, lastName: rest.join(' '), recipientName: name, [OWN_NAME_TOKEN[audience] ?? 'recipientName']: name };
}

function latestSlotRequest(schoolId: string): SlotRequest | undefined {
  return mockSlotRequests.filter((x) => x.schoolId === schoolId).sort((a, b) => b.submittedAt.localeCompare(a.submittedAt))[0];
}

function buildBag(audience: AudienceType, r: MergeRecipient, today: Date, portal: 'site' | 'school' = 'site'): Bag {
  const common: Scalars = { senderName: CURRENT_USER, hospitalName: DEFAULT_HOSPITAL, loginUrl: LOGIN_URL, portalUrl: PORTAL_URL, jobsPortalUrl: JOBS_PORTAL_URL, contactPortalUrl: PORTAL_URL };
  const scalars: Scalars = { ...common, ...nameBag(audience, r.name) };
  const lists: Bag['lists'] = {};
  const tables: Bag['tables'] = {};
  const set = (v: Scalars) => Object.assign(scalars, v);
  // Records found for this recipient, used by the shared enrichment below.
  const ctx: { sc?: Schedule; partner?: SchoolPartner; sr?: SlotRequest; srExplicit?: boolean; locName?: string | null; school?: string | null; ownEmail?: string | null } = {};

  switch (audience) {
    case 'Student': {
      const found = locateStudent(r);
      if (!found) break;
      const { student: st, schedule: sc } = found;
      ctx.sc = sc; ctx.locName = sc?.location; ctx.school = st?.school ?? sc?.school;
      const deadline = sc ? addDays(sc.startDate, -14) : undefined; // "two weeks before the rotation starts"
      const preceptor = sc?.preceptor;
      set({
        studentName: st ? `${st.firstName} ${st.lastName}` : sc?.studentName,
        firstName: st?.firstName ?? scalars.firstName,
        lastName: st?.lastName ?? scalars.lastName,
        email: st?.email ?? sc?.studentEmail,
        school: st?.school ?? sc?.school, schoolName: st?.school ?? sc?.school,
        program: st?.program ?? sc?.program, programType: st?.programType ?? sc?.programType,
        cohort: st?.cohort, studentId: st?.id ?? sc?.studentId,
        onboardingStatus: st?.onboardingStatus ?? sc?.onboardingStatus,
        rotationName: sc?.rotationName,
        startDate: fmtDate(sc?.startDate), rotationStartDate: fmtDate(sc?.startDate),
        endDate: fmtDate(sc?.endDate), rotationEndDate: fmtDate(sc?.endDate),
        locationName: sc?.location, reportingLocation: sc?.location,
        // With a placement the hospital is where they rotate; without one it stays the sender's own organization.
        hospitalName: sc ? hospitalOf(sc.location) : scalars.hospitalName, siteName: sc ? hospitalOf(sc.location) : undefined,
        preceptorName: preceptor, supervisorName: preceptor,
        preceptorEmail: preceptor ? mockPersonnel.find((p) => `${p.firstName} ${p.lastName}` === preceptor)?.email : undefined,
        onboardingDeadline: fmtDate(deadline),
        daysUntilStart: daysUntil(today, sc?.startDate), daysUntilDeadline: daysUntil(today, deadline),
      });
      lists.outstandingItems = outstandingFor(st?.onboardingStatus ?? sc?.onboardingStatus);
      break;
    }
    case 'School Contact': {
      const found = locatePartner(r);
      if (!found) break;
      const { partner: p } = found;
      // A send launched from a slot request carries that request; otherwise the school's
      // most recent one stands in, so a generic send to a school still has a rotation.
      const sr = found.slotRequest ?? latestSlotRequest(p.id);
      ctx.partner = p; ctx.sr = sr; ctx.srExplicit = !!found.slotRequest; ctx.locName = sr?.location; ctx.school = p.schoolName;
      set({
        schoolContactName: contactNameFor(p, r), coordinatorName: contactNameFor(p, r), email: p.contactEmail,
        schoolName: p.schoolName, organization: p.schoolName, scheduleCount: String(p.activeSchedules),
        availabilityName: sr?.rotationName, rotationName: sr?.rotationName, programType: sr?.programType,
        approvedSlotCount: sr ? String(sr.slotsRequested) : undefined,
        startDate: fmtDate(sr?.startDate), endDate: fmtDate(sr?.endDate), locationName: sr?.location,
        submittedDate: fmtDate(sr?.submittedAt), requestId: sr?.id, slotStatus: sr?.status,
        onboardingDeadline: sr ? fmtDate(addDays(sr.startDate, -14)) : undefined,
        hospitalName: sr ? hospitalOf(sr.location) : DEFAULT_HOSPITAL,
      });
      break;
    }
    case 'Partner Contact': {
      const p = locatePartner(r)?.partner;
      if (!p) break;
      ctx.partner = p; ctx.school = p.schoolName;
      set({ recipientName: p.contactName, name: p.contactName, organizationName: p.schoolName, organization: p.schoolName, email: p.contactEmail });
      break;
    }
    case 'Staff-Personnel': {
      const p = locatePersonnel(r);
      if (!p) break;
      ctx.locName = p.location;
      set({ staffName: `${p.firstName} ${p.lastName}`, role: p.role, department: p.department, email: p.email, hospitalName: p.hospitalName, locationName: p.location });
      break;
    }
    case 'Preceptor': {
      const p = locatePreceptor(r);
      if (!p) break;
      ctx.locName = p.location;
      ctx.sc = mockSchedules.find((x) => x.id === p.assignedScheduleId);
      set({
        preceptorName: `${p.firstName} ${p.lastName}`, name: `${p.firstName} ${p.lastName}`, email: p.email,
        siteName: p.site, hospitalName: p.site, locationName: p.location, shift: p.shift, assignedScheduleRef: p.assignedScheduleRef,
      });
      break;
    }
    case 'Placement Faculty/CI': {
      const f = locateFaculty(r);
      if (!f) break;
      ctx.school = f.school; ctx.partner = partnerByName(f.school);
      set({ facultyName: `${f.firstName} ${f.lastName}`, name: `${f.firstName} ${f.lastName}`, email: f.email, schoolName: f.school, studentRosterRef: f.studentRosterRef });
      break;
    }
    case 'Candidate': {
      const c = mockCandidates.find((x) => x.id === r.id || (!!r.email && x.email.toLowerCase() === r.email.toLowerCase()));
      if (!c) break;
      const job = mockJobs.find((j) => j.id === c.jobId);
      set({
        candidateName: `${c.firstName} ${c.lastName}`, email: c.email, stage: c.stage, applicationDate: fmtDate(c.appliedDate),
        jobTitle: job?.title, department: job?.department, hospitalName: job?.hospitalName ?? DEFAULT_HOSPITAL,
        compensation: job?.salary ? `${job.salary.currency === 'USD' ? '$' : ''}${job.salary.min.toLocaleString()} – ${job.salary.max.toLocaleString()}` : undefined,
      });
      break;
    }
  }

  // A send to someone who is not on a placement (a school contact, a staff member, faculty, a preceptor) is about the
  // schedules ticked on the screen; the first of them leads the single-value fields and the tables list them all.
  // With nothing ticked (a generic send), the first placement at their school or location stands in.
  const picked = (r.scheduleIds ?? []).map((id) => mockSchedules.find((x) => x.id === id)).filter((x): x is Schedule => !!x);
  let scheduleLed = false;
  if (audience !== 'Student' && picked.length) { ctx.sc = picked[0]; scheduleLed = true; }
  else if (!ctx.sc) {
    if (ctx.school) ctx.sc = mockSchedules.find((x) => x.school === ctx.school && (!ctx.locName || sameLoc(x.location, ctx.locName))) ?? mockSchedules.find((x) => x.school === ctx.school);
    else if (ctx.locName) ctx.sc = mockSchedules.find((x) => sameLoc(x.location, ctx.locName!));
    scheduleLed = !!ctx.sc && !ctx.srExplicit;
  }
  // Schedule-led: the schedule's own values win over a stand-in slot request's, so one email never mixes the two.
  if (scheduleLed && ctx.sc) {
    const sc = ctx.sc;
    ctx.locName = sc.location;
    set({
      locationName: sc.location, reportingLocation: sc.location, startDate: fmtDate(sc.startDate), endDate: fmtDate(sc.endDate), rotationName: sc.rotationName,
      availabilityName: sc.rotationName, programType: sc.programType, hospitalName: hospitalOf(sc.location),
      onboardingDeadline: fmtDate(addDays(sc.startDate, -14)), daysUntilDeadline: daysUntil(today, addDays(sc.startDate, -14)),
    });
  }

  // ── Wider field set: schedule, location, school, request, contract, lists ──────────
  if (ctx.sc) {
    const sc = ctx.sc;
    const preceptor = sc.preceptor;
    const ci = mockPlacementFaculty.find((f) => f.school === sc.school);
    const sched: Scalars = {
      scheduleId: sc.id, scheduleType: experienceOf(sc), scheduleStatus: sc.scheduleStatus, rotationName: sc.rotationName,
      scheduleDateRange: rangeLabel(sc.startDate, sc.endDate), scheduleDuration: spanLabel(sc.startDate, sc.endDate),
      daysUntilStart: daysUntil(today, sc.startDate), daysUntilEnd: daysUntil(today, sc.endDate),
      disciplineSpecialization: disciplineFor(sc.programType),
      clinicalInstructorName: ci ? `${ci.firstName} ${ci.lastName}` : undefined, clinicalInstructorEmail: ci?.email ?? undefined,
      schoolRequirementsStatus: sc.onboardingStatus === 'Compliant' ? 'Completed' : 'Pending',
    };
    // Not overwriting what the audience case already set (e.g. a preceptor's own name).
    for (const [k, v] of Object.entries(sched)) if (scalars[k] == null) scalars[k] = v;
    const split = (full?: string | null) => { const [f = '', ...r] = (full ?? '').replace(/^(Dr\.|Prof\.)\s+/, '').split(' '); return [f || undefined, r.join(' ') || undefined] as const; };
    const [sf, sl] = split(sc.studentName), [pf, pl] = split(preceptor), [cf, cl] = split(ci ? `${ci.firstName} ${ci.lastName}` : undefined);
    const [kf, kl] = split(partnerByName(sc.school)?.contactName);
    const more: Scalars = {
      onboardingStatus: sc.onboardingStatus, programType: sc.programType, discipline: disciplineFor(sc.programType), locationName: sc.location,
      studentFirstName: sf, studentLastName: sl, preceptorFirstName: pf, preceptorLastName: pl, ciFirstName: cf, ciLastName: cl,
      schoolContactFirstName: kf, schoolContactLastName: kl, schoolProgramName: sc.program, groupAvailability: sc.rotationName,
      scheduleDetailLink: `${PORTAL_URL}/schedules/${sc.id}`, onboardingDeadline: fmtDate(addDays(sc.startDate, -14)), daysUntilDeadline: daysUntil(today, addDays(sc.startDate, -14)),
    };
    if (!lists.outstandingItems) lists.outstandingItems = outstandingFor(sc.onboardingStatus);
    for (const [k, v] of Object.entries(more)) if (scalars[k] == null) scalars[k] = v;
    const rows = picked.length ? picked : [sc];
    const shiftLabel = scalars.shift ?? MERGE_FIELD_CATALOG.find((f) => f.token === 'shift')?.example ?? '';
    const daysLabel = scalars.daysOfWeek ?? MERGE_FIELD_CATALOG.find((f) => f.token === 'daysOfWeek')?.example ?? '';
    tables.scheduleTable = {
      head: ['Schedule ID', 'Student', 'Location', 'Dates', 'Shift', 'Onboarding', 'Onboarding Due'],
      rows: rows.map((x) => [x.id, x.studentName, x.location, rangeLabel(x.startDate, x.endDate) ?? '', shiftLabel, x.onboardingStatus, fmtDate(addDays(x.startDate, -14)) ?? '']),
    };
    // Group placement: the students on the same rotation at the same location. Several ticked groups give one row each.
    const groupKeys = [...new Set(rows.map((x) => `${x.rotationName}|${x.location}`))];
    const groups = groupKeys.map((k) => {
      const [rot, loc] = k.split('|');
      return { name: `${rot} Group`, id: `GRP-${rows.find((x) => x.rotationName === rot && x.location === loc)!.id.replace(/\D/g, '')}`, rep: rows.find((x) => x.rotationName === rot && x.location === loc)!, members: mockSchedules.filter((x) => x.rotationName === rot && x.location === loc) };
    });
    const g0 = groups[0];
    set({
      groupName: g0.name, groupId: g0.id, groupSlots: String(g0.members.length), groupMembers: g0.members.map((m) => m.studentName).join(', '),
      groupDetailsLink: `${PORTAL_URL}/schedules/group/${g0.id.replace(/\D/g, '')}`,
    });
    const cname = (x: Schedule) => { const f = mockPlacementFaculty.find((y) => y.school === x.school); return f ? `${f.firstName} ${f.lastName}` : ''; };
    tables.placementTable = {
      head: ['Group', 'Location', 'Dates', 'Shift', 'Days', 'Discipline', 'Preceptor', 'Clinical Instructor'],
      rows: groups.map((g) => [g.name, g.rep.location, rangeLabel(g.rep.startDate, g.rep.endDate) ?? '', shiftLabel, daysLabel, disciplineFor(g.rep.programType) ?? '', g.rep.preceptor ?? '', cname(g.rep)]),
    };
    tables.groupMembersTable = {
      head: ['Group', 'Student', 'School', 'Onboarding', 'Schedule Status'],
      rows: groups.flatMap((g) => g.members.map((m) => [g.name, m.studentName, m.school, m.onboardingStatus, m.scheduleStatus])),
    };
  }
  if (audience === 'Student') {
    const st = mockStudents.find((x) => x.id === r.id) ?? (ctx.sc && mockStudents.find((x) => x.id === ctx.sc!.studentId));
    if (st) set({ phone: st.phone, studentLoginStatus: st.pendingFirstLogin ? 'Pending first login' : 'Logged in' });
    set({ jobsPortalUrl: JOBS_PORTAL_URL });
  }
  const loc = locationRecord(ctx.locName);
  if (loc) {
    const coords = coordinatorsAt(loc.name);
    set({
      locationName: loc.name, locationAddress: `${loc.address}, ${loc.city}, ${loc.state} ${loc.zip}`, locationPhone: loc.phone,
      locationGroup: loc.locationGroup, locationDepartment: loc.department, locationStatus: loc.status, locationParent: loc.hospitalName,
      locationDisciplines: loc.disciplines?.map((d) => d.name).join(', '),
      locationCoordinators: coords.map((c) => `${c.firstName} ${c.lastName}`).join(', ') || undefined,
      locationCoordinatorEmail: coords.find((c) => c.email)?.email ?? undefined,
    });
  }
  if (ctx.partner) {
    const p = ctx.partner;
    const first = p.contacts[0];
    const emailed = p.contacts.filter((c) => c.email);
    set({
      schoolName: p.schoolName, organization: p.schoolName, organizationName: p.schoolName, schoolAlias: p.aliasName, schoolCategory: p.category, schoolWebsite: p.website,
      schoolAddress: `${p.address}, ${p.city}, ${p.state}`, schoolDisciplines: [...new Set(p.programTypes.map((t) => disciplineFor(t)!))].join(', '),
      schoolContactEmail: p.contactEmail ?? undefined, schoolContactPhone: first?.phone,
      programContactCount: String(p.contacts.length), partnerSince: p.partnerSince, scheduleCount: String(p.activeSchedules),
      activeRequests: String(p.activeRequests), contractsActive: String(p.activeContractsCount), contractsExpired: String(p.expiredContractsCount),
      pendingStudents: String(mockStudents.filter((x) => x.school === p.schoolName && x.pendingFirstLogin).length),
    });
    lists.programContacts = emailed.map((c) => `${c.name} — ${c.email}`);
    if (audience === 'School Contact' || audience === 'Partner Contact') {
      const mine = p.contacts.find((c) => r.email && c.email?.toLowerCase() === r.email.toLowerCase());
      set({ phone: mine?.phone ?? first?.phone });
    }
    if (audience === 'Placement Faculty/CI' || audience === 'School Contact') {
      lists.studentSchedules = mockSchedules.filter((x) => x.school === p.schoolName).slice(0, MAX_LIST).map(scheduleLine);
    }
    if (audience === 'School Contact' || audience === 'Placement Faculty/CI') {
      // Upcoming or current placements whose student has not finished onboarding.
      lists.studentsNotCleared = mockSchedules
        .filter((x) => x.school === p.schoolName && x.onboardingStatus !== 'Compliant' && (x.scheduleStatus === 'Upcoming' || x.scheduleStatus === 'Active'))
        .slice(0, MAX_LIST)
        .map((x) => `${x.studentName} — ${x.location} — starts ${fmtDate(x.startDate)} — ${x.onboardingStatus}`);
    }
    if (audience === 'School Contact') {
      lists.requestStatuses = mockSlotRequests
        .filter((x) => x.schoolId === p.id)
        .slice(0, MAX_LIST)
        .map((x) => `Request ${x.id} – ${x.rotationName} – ${x.status}`);
      lists.openRequests = mockSlotRequests
        .filter((x) => x.schoolId === p.id && (x.status === 'Pending' || x.status === 'Info Requested'))
        .map((x) => `Request ${x.id} – ${x.rotationName} – ${x.status}`);
    }
  }
  if (ctx.sr) {
    const sr = ctx.sr;
    const p = ctx.partner;
    set({
      requestedSlots: String(sr.slotsRequested), totalSlots: String(sr.slotsRequested),
      confirmedSlots: sr.status === 'Approved' ? String(sr.slotsRequested) : '0',
      requestedDuration: spanLabel(sr.startDate, sr.endDate), availabilityDuration: rangeLabel(sr.startDate, sr.endDate),
      requestPendingDays: sr.status === 'Pending' ? daysSince(today, sr.submittedAt) : '0',
      requestedBy: p?.contactName, requestedByEmail: p?.contactEmail ?? undefined, requestedLocation: sr.location,
      partnerCategory: p?.category, experienceType: sr.experienceType,
      pendingRequests: String(mockSlotRequests.filter((x) => x.schoolId === sr.schoolId && x.status === 'Pending').length),
    });
    // The person who added the availability isn't stored in the prototype: a coordinator at the location, else anyone there,
    // else a coordinator elsewhere at the same hospital.
    const hospital = hospitalOf(sr.location);
    const siteContact = coordinatorsAt(sr.location)[0] ?? mockPersonnel.find((x) => x.location === sr.location)
      ?? mockPersonnel.find((x) => x.hospitalName === hospital && COORDINATOR_ROLES.includes(x.role));
    set({
      siteContactFirstName: siteContact?.firstName, siteContactLastName: siteContact?.lastName,
      discipline: disciplineFor(sr.programType), programType: sr.programType, availabilityName: sr.rotationName,
    });
    tables.requestTable = {
      head: ['Request ID', 'Status', 'Availability', 'Experience', 'Discipline', 'Program Type', 'Location', 'Slots', 'Duration'],
      rows: [[sr.id, sr.status, sr.rotationName, sr.experienceType ?? '', disciplineFor(sr.programType) ?? '', sr.programType, sr.location, String(sr.slotsRequested), spanLabel(sr.startDate, sr.endDate) ?? '']],
    };
  }
  if (audience === 'Staff-Personnel') {
    const p = locatePersonnel(r);
    if (p) {
      set({
        phone: p.phone, designation: p.designation, systemAccess: p.hasSystemAccess ? 'Has access' : 'No access',
        lastLogin: fmtDate(p.lastLogin), staffStatus: p.isActive ? 'Active' : 'Inactive', associatedLocations: p.location,
        associatedDisciplines: loc?.disciplines?.map((d) => d.name).join(', '),
      });
      lists.studentSchedules = mockSchedules.filter((x) => sameLoc(x.location, p.location)).slice(0, MAX_LIST).map(scheduleLine);
      lists.openRequests = mockSlotRequests
        .filter((x) => sameLoc(x.location, p.location) && (x.status === 'Pending' || x.status === 'Info Requested'))
        .slice(0, MAX_LIST)
        .map((x) => `Request ${x.id} – ${x.rotationName} – ${x.schoolName} – ${x.status}`);
    }
  }
  if (audience === 'Preceptor') {
    const p = locatePreceptor(r);
    if (p) {
      set({ phone: p.phone, preceptorName: `${p.firstName} ${p.lastName}`, associatedLocations: p.location, associatedDisciplines: loc?.disciplines?.map((d) => d.name).join(', ') });
      const mine = mockSchedules.filter((x) => x.preceptor === `${p.firstName} ${p.lastName}`);
      if (ctx.sc) set({ assignedStudentName: ctx.sc.studentName, assignedStudentEmail: ctx.sc.studentEmail, assignedStudentSchool: ctx.sc.school });
      lists.studentSchedules = (mine.length ? mine : ctx.sc ? [ctx.sc] : []).slice(0, MAX_LIST).map(scheduleLine);
    }
  }
  if (audience === 'Placement Faculty/CI') {
    const f = locateFaculty(r);
    if (f) set({ phone: f.phone, facultyTitle: f.title, rosterCount: String(f.rosterCount) });
  }
  if (audience === 'Candidate') {
    const c = mockCandidates.find((x) => x.id === r.id || (!!r.email && x.email.toLowerCase() === r.email.toLowerCase()));
    const job = c && mockJobs.find((j) => j.id === c.jobId);
    if (c) {
      set({
        phone: c.phone, currentTitle: c.currentTitle, currentEmployer: c.currentEmployer, yearsOfExperience: String(c.yearsOfExperience),
        jobType: job?.jobType, jobLocation: job?.location, jobDiscipline: job?.discipline, jobPostedOn: fmtDate(job?.postedDate),
      });
    }
  }

  // Sender, platform and date fields, for every audience.
  set({
    scheduleDetailLink: `${PORTAL_URL}/schedules${ctx.sc ? `/${ctx.sc.id}` : ''}`, requestDetailLink: `${PORTAL_URL}/requests${ctx.sr ? `/${ctx.sr.id}` : ''}`,
    placementDetailLink: `${PORTAL_URL}/placements`, requirementDetailLink: `${PORTAL_URL}/onboarding`, exxatOneHomeLink: PORTAL_URL,
    senderOrganization: tenantEmailConfig[portal].displayName, supportEmail: 'support@exxat.com',
    today: fmtDate(`${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`),
    currentYear: String(today.getFullYear()),
  });
  if (audience === 'School Contact' || audience === 'Partner Contact') {
    // Contract detail has no per-school records in the prototype, so the days figure counts to the sample expiry date.
    set({ daysToContractExpiry: daysUntil(today, '2027-05-20') });
  }
  // Fields the live product has but the prototype holds no data for: filled with the catalogue's labelled sample.
  for (const f of MERGE_FIELD_CATALOG) {
    if (f.source === 'sample' && f.audiences.includes(audience) && f.portals.includes(portal) && scalars[f.token] == null) scalars[f.token] = f.example;
  }

  // Normalize every key once so lookups are spelling-agnostic.
  const n: Scalars = {};
  for (const [k, v] of Object.entries(scalars)) n[norm(k)] = v;
  const nl: Bag['lists'] = {};
  for (const [k, v] of Object.entries(lists)) nl[norm(k)] = v;
  const nt: Bag['tables'] = {};
  for (const [k, v] of Object.entries(tables)) nt[norm(k)] = v;
  return { scalars: n, lists: nl, tables: nt };
}

/** Fills every merge field in `text` for one recipient. */
export function renderMergeFields(text: string, audience: AudienceType, recipient: MergeRecipient, opts: MergeOptions = {}): Rendered {
  if (!text.includes('{{')) return { text, unresolved: [] };
  const bag = buildBag(audience, recipient, opts.today ?? new Date(), opts.portal);
  const extra: Record<string, string> = {};
  for (const [k, v] of Object.entries(opts.extra ?? {})) extra[norm(k)] = v;
  const unresolved = new Set<string>();
  const fmt = (v: string) => (opts.html ? (opts.mark ? `<mark style="background:#fef3c7;color:inherit;padding:0 2px;border-radius:3px">${esc(v)}</mark>` : esc(v)) : v);

  // {{#each list}} … {{this}} … {{/each}}
  let out = text.replace(/\{\{#each\s+([^}\s]+)\s*\}\}([\s\S]*?)\{\{\/each\}\}/g, (_m, list: string, inner: string) => {
    const items = bag.lists[norm(list)];
    if (!items) {
      unresolved.add(list);
      return `{{${list}}}`; // one clear marker instead of a half-rendered loop
    }
    return items.map((it) => inner.replace(/\{\{\s*this\s*\}\}/g, fmt(it))).join('');
  });

  out = out.replace(/\{\{\s*([^#/}][^}]*?)\s*\}\}/g, (match, token: string) => {
    const k = norm(token);
    const tbl = bag.tables[k];
    if (tbl && extra[k] == null) return opts.html ? tableHtml(tbl) : tableText(tbl);
    const v = extra[k] ?? bag.scalars[k];
    if (v == null || String(v).trim() === '') {
      unresolved.add(token.trim());
      return match;
    }
    return fmt(String(v));
  });
  return { text: out, unresolved: [...unresolved] };
}

/** Subject (plain text) and body (HTML) for one recipient, with the union of unresolved tokens. */
export function renderMessage(subject: string, body: string, audience: AudienceType, recipient: MergeRecipient, opts: Omit<MergeOptions, 'html'> = {}) {
  const s = renderMergeFields(subject, audience, recipient, { ...opts, html: false });
  const b = renderMergeFields(body, audience, recipient, { ...opts, html: true });
  return { subject: s.text, body: b.text, unresolved: [...new Set([...s.unresolved, ...b.unresolved])] };
}
