import type { AudienceType } from './mockEmailTemplates';
import { mockStudents, type Student } from './mockStudents';
import { mockSchedules, type Schedule } from './mockSchedules';
import { mockSchoolPartners, type SchoolPartner } from './mockSchoolPartners';
import { mockSlotRequests, type SlotRequest } from './mockSlotRequests';
import { mockPreceptors } from './mockPreceptors';
import { mockPlacementFaculty } from './mockPlacementFaculty';
import { mockPersonnel } from './mockPersonnel';

// Resolves a dynamic-attachment template's required merge fields against a
// recipient's own mock record (PRD section 8) — the send-time check that replaced
// the earlier simulation.
//
// Only tokens that come from the recipient's record are checked. Tenant-level
// tokens ({{hospitalName}}, {{loginUrl}}) and send-context tokens
// ({{availabilityName}}, {{coordinatorName}}, {{subject}}…) don't live on any
// recipient, so they never count as "missing from the record".

export type Recipient = { id: string; email: string | null };
type Values = Record<string, string | null | undefined>;

const same = (a: string | null | undefined, b: string | null | undefined) =>
  !!a && !!b && a.toLowerCase() === b.toLowerCase();

// A student's schedule is the schedules-table row for them. Student.scheduleId is
// not used: in the mock data it disagrees with the schedule rows themselves.
export function studentSchedule(s: Student): Schedule | undefined {
  return mockSchedules.find((x) => x.studentId === s.id) ?? mockSchedules.find((x) => same(x.studentEmail, s.email));
}

// ── Recipient locators ─────────────────────────────────────────────────────────
// The single place that decides which mock record a recipient row refers to. Both
// this attachment check and the message renderer (messageMerge.ts) use them, so the
// two can never disagree about who a recipient is. A row's id may be a record id or
// the id of the screen row it came from (a schedule, a slot request); email is the
// fallback.
export function locateStudent(r: Recipient): { student?: Student; schedule?: Schedule } | null {
  const scheduleById = mockSchedules.find((x) => x.id === r.id);
  const student =
    mockStudents.find((s) => s.id === r.id) ??
    (scheduleById && (mockStudents.find((s) => s.id === scheduleById.studentId) ?? mockStudents.find((s) => same(s.email, scheduleById.studentEmail)))) ??
    mockStudents.find((s) => same(s.email, r.email));
  const schedule = scheduleById ?? (student ? studentSchedule(student) : mockSchedules.find((x) => same(x.studentEmail, r.email)));
  if (!student && !schedule) return null;
  return { student, schedule };
}

export function locatePartner(r: Recipient): { partner: SchoolPartner; slotRequest?: SlotRequest } | null {
  const slotRequest = mockSlotRequests.find((x) => x.id === r.id);
  const partner =
    // Program-contact recipients are keyed `<partnerId>:<contact>`; the partner is the prefix.
    mockSchoolPartners.find((p) => p.id === (slotRequest?.schoolId ?? r.id.split(':')[0])) ??
    mockSchoolPartners.find((p) => same(p.contactEmail, r.email));
  return partner ? { partner, slotRequest } : null;
}

// The contact being emailed: a program contact matched by email, else the partner's primary contact.
export const contactNameFor = (p: SchoolPartner, r: Recipient) =>
  p.contacts.find((c) => same(c.email, r.email))?.name ?? p.contactName;

export const locatePreceptor = (r: Recipient) => mockPreceptors.find((x) => x.id === r.id || same(x.email, r.email));
export const locateFaculty = (r: Recipient) => mockPlacementFaculty.find((x) => x.id === r.id || same(x.email, r.email));
export const locatePersonnel = (r: Recipient) => mockPersonnel.find((x) => x.id === r.id || same(x.email, r.email));

function studentValues(r: Recipient): Values | null {
  const found = locateStudent(r);
  if (!found) return null;
  const { student, schedule } = found;
  return {
    '{{studentName}}': student ? `${student.firstName} ${student.lastName}` : schedule?.studentName,
    '{{email}}': student?.email ?? schedule?.studentEmail,
    '{{school}}': student?.school ?? schedule?.school,
    '{{program}}': student?.program ?? schedule?.program,
    '{{cohort}}': student?.cohort,
    '{{onboardingStatus}}': student?.onboardingStatus ?? schedule?.onboardingStatus,
    '{{rotationName}}': schedule?.rotationName,
    '{{startDate}}': schedule?.startDate,
    '{{endDate}}': schedule?.endDate,
    '{{locationName}}': schedule?.location,
    '{{preceptorName}}': schedule?.preceptor,
  };
}

function schoolContactValues(r: Recipient): Values | null {
  const p = locatePartner(r)?.partner;
  if (!p) return null;
  return { '{{schoolContactName}}': contactNameFor(p, r), '{{schoolName}}': p.schoolName };
}

function preceptorValues(r: Recipient): Values | null {
  const p = locatePreceptor(r);
  if (!p) return null;
  return {
    '{{preceptorName}}': `${p.firstName} ${p.lastName}`.trim(),
    '{{siteName}}': p.site,
    '{{locationName}}': p.location,
    '{{shift}}': p.shift,
    '{{assignedScheduleRef}}': p.assignedScheduleRef,
  };
}

function facultyValues(r: Recipient): Values | null {
  const f = locateFaculty(r);
  if (!f) return null;
  return {
    '{{facultyName}}': `${f.firstName} ${f.lastName}`.trim(),
    '{{schoolName}}': f.school,
    '{{studentRosterRef}}': f.studentRosterRef,
  };
}

function staffValues(r: Recipient): Values | null {
  const p = locatePersonnel(r);
  if (!p) return null;
  return { '{{staffName}}': `${p.firstName} ${p.lastName}`.trim(), '{{role}}': p.role, '{{department}}': p.department };
}

function valuesFor(audience: AudienceType, r: Recipient): Values | null {
  switch (audience) {
    case 'Student': return studentValues(r);
    case 'School Contact': return schoolContactValues(r);
    case 'Preceptor': return preceptorValues(r);
    case 'Placement Faculty/CI': return facultyValues(r);
    case 'Staff-Personnel': return staffValues(r);
    default: return null; // Candidate / Partner Contact: no recipient records in this prototype
  }
}

/**
 * The template's required tokens that are genuinely empty on this recipient's
 * record. Returns null when no record can be found for the recipient at all —
 * "can't check" is not the same as "missing", so callers must not exclude on null.
 */
export function missingMergeFields(audience: AudienceType, recipient: Recipient, requiredTokens: readonly string[]): string[] | null {
  const values = valuesFor(audience, recipient);
  if (!values) return null;
  return requiredTokens.filter((t) => {
    if (!(t in values)) return false; // tenant-level or send-context token — not a record field
    const v = values[t];
    return v == null || String(v).trim() === '';
  });
}
