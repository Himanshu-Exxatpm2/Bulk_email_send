// Rows for the Schedules module (Overview and Schedules List).
// The design team's list works on one row per schedule, where a Group schedule is one cohort row
// ("PT Cohort B (12 students)") and an Individual schedule is one student. Our data is one row per
// student, so cohorts are derived: students who share a rotation at the same school are one Group
// schedule; a student alone in a rotation is an Individual schedule.
import { mockSchedules, type Schedule } from '../../data/mockSchedules';
import { mockPlacementFaculty } from '../../data/mockPlacementFaculty';

export type ListKind = 'all' | 'group' | 'individual';
export type Timeline = 'upcoming' | 'current' | 'completed';
export type RowKind = 'group' | 'individual';

export interface ModuleRow {
  id: string;
  scheduleId: string;
  assignmentLabel: string;
  primaryName: string;
  primarySubline?: string;
  kind: RowKind;
  schoolName: string;
  availability: string;
  location: string;
  locationGroup: string;
  durationLabel: string;
  startDate: string;
  endDate: string;
  discipline: string;
  disciplineBase: string;
  shift: string;
  daysOfWeek: string;
  preceptor: string;
  clinicalInstructor: string;
  programType: string;
  scheduleStatus: string;
  onboardingStatus: string;
  groupOnboardingStatus: string;
  timeline: Timeline;
  /** The student schedules behind this row: one for Individual, the whole cohort for Group. */
  members: Schedule[];
}

const PROGRAM_TO_DISCIPLINE: Record<string, string> = {
  BSN: 'Nursing',
  MOT: 'Occupational Therapy',
  DPT: 'Physical Therapy',
  'BS Rad Tech': 'Radiologic Technology',
};

const SHIFTS = ['Day', 'Evening', 'Night', 'Rotating'];
const DAYS = ['Mon – Fri', 'Mon – Thu', 'Tue – Sat', 'Fri – Sun', 'Mon – Wed'];

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

function fmtDate(iso: string): string {
  const [y, m, d] = iso.split('-');
  return `${m}/${d}/${y}`;
}

function scheduleStatusLabel(s: Schedule): string {
  switch (s.scheduleStatus) {
    case 'Active': return 'Ongoing';
    case 'Completed': return 'Completed';
    case 'Upcoming': return s.onboardingStatus === 'Compliant' ? 'Confirmed' : 'Pending Confirmation';
    default: return s.scheduleStatus; // To be Scheduled, Canceled
  }
}

function onboardingLabel(s: Schedule): string {
  if (s.onboardingStatus === 'Non-Compliant') return 'Not Compliant';
  if (s.onboardingStatus === 'Pending') return 'In Progress';
  return s.onboardingStatus; // Compliant, Not Started
}

function timelineOf(s: Schedule): Timeline {
  if (s.scheduleStatus === 'Active') return 'current';
  if (s.scheduleStatus === 'Completed' || s.scheduleStatus === 'Canceled') return 'completed';
  return 'upcoming';
}

function groupOnboarding(members: Schedule[]): string {
  const labels = members.map(onboardingLabel);
  if (labels.every((l) => l === 'Compliant')) return 'Compliant';
  if (labels.includes('Not Compliant')) return 'Not Compliant';
  if (labels.includes('In Progress')) return 'In Progress';
  return 'Not Started';
}

function groupScheduleStatus(members: Schedule[]): string {
  const labels = members.map(scheduleStatusLabel);
  const first = labels[0];
  if (labels.every((l) => l === first)) return first;
  if (labels.includes('Ongoing')) return 'Ongoing';
  return first;
}

function instructorFor(school: string): string {
  const f = mockPlacementFaculty.find((p) => p.school === school);
  return f ? `${f.firstName} ${f.lastName}` : '—';
}

function baseFields(rep: Schedule, members: Schedule[]) {
  const disciplineBase = PROGRAM_TO_DISCIPLINE[rep.programType] ?? rep.programType;
  const preceptors = Array.from(new Set(members.map((m) => m.preceptor)));
  const h = hash(rep.rotationName);
  return {
    schoolName: rep.school,
    availability: rep.rotationName,
    location: rep.location,
    locationGroup: rep.location.split(' – ')[0],
    durationLabel: `${fmtDate(rep.startDate)} – ${fmtDate(rep.endDate)}`,
    startDate: rep.startDate,
    endDate: rep.endDate,
    discipline: `${disciplineBase} (${rep.programType})`,
    disciplineBase,
    shift: SHIFTS[h % SHIFTS.length],
    daysOfWeek: DAYS[(h >> 3) % DAYS.length],
    preceptor: preceptors.length === 1 ? preceptors[0] : 'Multiple',
    clinicalInstructor: instructorFor(rep.school),
    programType: rep.programType === 'BSN' ? 'Undergraduate' : 'Graduate',
    members,
  };
}

function build(): ModuleRow[] {
  const cohorts = new Map<string, Schedule[]>();
  mockSchedules.forEach((s) => {
    const key = `${s.rotationName}|${s.school}`;
    cohorts.set(key, [...(cohorts.get(key) ?? []), s]);
  });

  const rows: ModuleRow[] = [];
  let groupNo = 0;
  let indNo = 0;
  const emitted = new Set<string>();
  mockSchedules.forEach((s) => {
    const key = `${s.rotationName}|${s.school}`;
    const members = cohorts.get(key)!;
    if (members.length > 1) {
      if (emitted.has(key)) return;
      emitted.add(key);
      groupNo += 1;
      const scheduleId = `6428${String(100 + groupNo).padStart(3, '0')}`;
      rows.push({
        id: `grp-${groupNo}`,
        scheduleId,
        assignmentLabel: `Group Schedule - ${scheduleId}`,
        primaryName: `${s.rotationName} (${members.length} students)`,
        primarySubline: 'Group schedule',
        kind: 'group',
        scheduleStatus: groupScheduleStatus(members),
        onboardingStatus: groupOnboarding(members),
        groupOnboardingStatus: groupOnboarding(members),
        timeline: timelineOf(s),
        ...baseFields(s, members),
      });
    } else {
      indNo += 1;
      const scheduleId = `6427${String(100 + indNo).padStart(3, '0')}`;
      rows.push({
        id: `ind-${indNo}`,
        scheduleId,
        assignmentLabel: `${indNo % 2 === 0 ? 'Slot Request' : 'Direct Assignment'} - ${scheduleId}`,
        primaryName: s.studentName,
        primarySubline: s.studentEmail,
        kind: 'individual',
        scheduleStatus: scheduleStatusLabel(s),
        onboardingStatus: onboardingLabel(s),
        groupOnboardingStatus: onboardingLabel(s),
        timeline: timelineOf(s),
        ...baseFields(s, [s]),
      });
    }
  });
  return rows;
}

export const MODULE_ROWS: ModuleRow[] = build();

/** Counts for the Needs Attention card, over every student schedule. */
export function needsAttention() {
  return {
    toBeScheduled: mockSchedules.filter((s) => s.scheduleStatus === 'To be Scheduled').length,
    notCompliant: mockSchedules.filter((s) => s.onboardingStatus === 'Non-Compliant').length,
    canceled: mockSchedules.filter((s) => s.scheduleStatus === 'Canceled').length,
  };
}

export function rowsFor(kind: ListKind): ModuleRow[] {
  return kind === 'all' ? MODULE_ROWS : MODULE_ROWS.filter((r) => r.kind === kind);
}
