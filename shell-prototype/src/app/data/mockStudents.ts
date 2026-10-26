// KPI constants — displayed in the UI, decoupled from how many rows are seeded.
// 229 matches the platform baseline: Bowie State students pending first login.
export const KPI_STUDENTS_PENDING_FIRST_LOGIN = 229;

export type OnboardingStatus = 'Compliant' | 'Non-Compliant' | 'Pending' | 'Not Started';

export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;   // null = no email on file (excluded from Bulk Email, PRD 8)
  phone: string;
  school: string;
  program: string;
  programType: string;  // BSN, DNP, MOT, DPT, etc.
  cohort: string;       // e.g. "Fall 2026", "Spring 2027"
  onboardingStatus: OnboardingStatus;
  scheduleId: string | null;  // null = not yet placed
  pendingFirstLogin: boolean;
}

// ── Hand-written representative rows ────────────────────────────────────────
// Primary school: Bowie State Nursing (largest cohort, anchors KPI_STUDENTS_PENDING_FIRST_LOGIN)
// Also includes Baylor OT and Eastwood State to demonstrate multi-school filtering.

export const mockStudents: Student[] = [
  // Bowie State – BSN cohort (pending first login = true for this group)
  { id: 'stu-001', firstName: 'Aaliyah', lastName: 'Washington', email: 'a.washington@bowiestate.edu', phone: '(301) 555-0141', school: 'Bowie State University', program: 'BSN Pre-Licensure Nursing', programType: 'BSN', cohort: 'Fall 2026', onboardingStatus: 'Not Started', scheduleId: 'sched-016', pendingFirstLogin: true },
  { id: 'stu-002', firstName: 'Marcus', lastName: 'Okafor', email: 'm.okafor@bowiestate.edu', phone: '(301) 555-0142', school: 'Bowie State University', program: 'BSN Pre-Licensure Nursing', programType: 'BSN', cohort: 'Fall 2026', onboardingStatus: 'Not Started', scheduleId: 'sched-017', pendingFirstLogin: true },
  { id: 'stu-003', firstName: 'Destiny', lastName: 'Robinson', email: 'd.robinson@bowiestate.edu', phone: '(301) 555-0143', school: 'Bowie State University', program: 'BSN Pre-Licensure Nursing', programType: 'BSN', cohort: 'Fall 2026', onboardingStatus: 'Not Started', scheduleId: 'sched-018', pendingFirstLogin: true },
  { id: 'stu-004', firstName: 'Jerome', lastName: 'Bailey', email: 'j.bailey@bowiestate.edu', phone: '(301) 555-0144', school: 'Bowie State University', program: 'BSN Pre-Licensure Nursing', programType: 'BSN', cohort: 'Fall 2026', onboardingStatus: 'Not Started', scheduleId: 'sched-019', pendingFirstLogin: true },
  { id: 'stu-005', firstName: 'Keisha', lastName: 'Thompson', email: 'k.thompson@bowiestate.edu', phone: '(301) 555-0145', school: 'Bowie State University', program: 'BSN Pre-Licensure Nursing', programType: 'BSN', cohort: 'Fall 2026', onboardingStatus: 'Not Started', scheduleId: null, pendingFirstLogin: true },
  { id: 'stu-006', firstName: 'Darius', lastName: 'Jennings', email: 'd.jennings@bowiestate.edu', phone: '(301) 555-0146', school: 'Bowie State University', program: 'BSN Pre-Licensure Nursing', programType: 'BSN', cohort: 'Fall 2026', onboardingStatus: 'Not Started', scheduleId: null, pendingFirstLogin: true },
  { id: 'stu-007', firstName: 'Simone', lastName: 'Harris', email: 's.harris@bowiestate.edu', phone: '(301) 555-0147', school: 'Bowie State University', program: 'BSN Pre-Licensure Nursing', programType: 'BSN', cohort: 'Fall 2026', onboardingStatus: 'Not Started', scheduleId: null, pendingFirstLogin: true },
  { id: 'stu-008', firstName: 'Tyrell', lastName: 'Graves', email: 't.graves@bowiestate.edu', phone: '(301) 555-0148', school: 'Bowie State University', program: 'BSN Pre-Licensure Nursing', programType: 'BSN', cohort: 'Fall 2026', onboardingStatus: 'Not Started', scheduleId: null, pendingFirstLogin: true },

  // Bowie State – non-pending (already logged in, various onboarding states)
  { id: 'stu-009', firstName: 'Imani', lastName: 'Jackson', email: 'i.jackson@bowiestate.edu', phone: '(301) 555-0149', school: 'Bowie State University', program: 'BSN Pre-Licensure Nursing', programType: 'BSN', cohort: 'Spring 2026', onboardingStatus: 'Compliant', scheduleId: 'sched-021', pendingFirstLogin: false },
  { id: 'stu-010', firstName: 'Malik', lastName: 'Freeman', email: 'm.freeman@bowiestate.edu', phone: '(301) 555-0150', school: 'Bowie State University', program: 'BSN Pre-Licensure Nursing', programType: 'BSN', cohort: 'Spring 2026', onboardingStatus: 'Non-Compliant', scheduleId: 'sched-022', pendingFirstLogin: false },
  { id: 'stu-011', firstName: 'Brianna', lastName: 'Carter', email: 'b.carter@bowiestate.edu', phone: '(301) 555-0151', school: 'Bowie State University', program: 'BSN Pre-Licensure Nursing', programType: 'BSN', cohort: 'Spring 2026', onboardingStatus: 'Pending', scheduleId: 'sched-023', pendingFirstLogin: false },
  { id: 'stu-012', firstName: 'Deonte', lastName: 'Simmons', email: 'd.simmons@bowiestate.edu', phone: '(301) 555-0152', school: 'Bowie State University', program: 'BSN Pre-Licensure Nursing', programType: 'BSN', cohort: 'Spring 2026', onboardingStatus: 'Compliant', scheduleId: 'sched-024', pendingFirstLogin: false },

  // Baylor – OT cohort
  { id: 'stu-013', firstName: 'Sofia', lastName: 'Reyes', email: 's.reyes@baylor.edu', phone: '(254) 555-0161', school: 'Baylor University', program: 'Master of Occupational Therapy', programType: 'MOT', cohort: 'Fall 2026', onboardingStatus: 'Compliant', scheduleId: 'sched-031', pendingFirstLogin: false },
  { id: 'stu-014', firstName: 'Nathan', lastName: 'Pryce', email: 'n.pryce@baylor.edu', phone: '(254) 555-0162', school: 'Baylor University', program: 'Master of Occupational Therapy', programType: 'MOT', cohort: 'Fall 2026', onboardingStatus: 'Non-Compliant', scheduleId: 'sched-032', pendingFirstLogin: false },
  { id: 'stu-015', firstName: 'Caitlin', lastName: 'Holloway', email: 'c.holloway@baylor.edu', phone: '(254) 555-0163', school: 'Baylor University', program: 'Master of Occupational Therapy', programType: 'MOT', cohort: 'Fall 2026', onboardingStatus: 'Pending', scheduleId: null, pendingFirstLogin: false },

  // Eastwood State – Nursing
  { id: 'stu-016', firstName: 'Priya', lastName: 'Sharma', email: 'p.sharma@eastwoodstate.edu', phone: '(614) 555-0171', school: 'Eastwood State University', program: 'BSN Pre-Licensure Nursing', programType: 'BSN', cohort: 'Spring 2026', onboardingStatus: 'Compliant', scheduleId: 'sched-041', pendingFirstLogin: false },
  { id: 'stu-017', firstName: 'Owen', lastName: 'Fitzgerald', email: 'o.fitzgerald@eastwoodstate.edu', phone: '(614) 555-0172', school: 'Eastwood State University', program: 'BSN Pre-Licensure Nursing', programType: 'BSN', cohort: 'Spring 2026', onboardingStatus: 'Compliant', scheduleId: 'sched-042', pendingFirstLogin: false },
  { id: 'stu-018', firstName: 'Lena', lastName: 'Kowalski', email: 'l.kowalski@eastwoodstate.edu', phone: '(614) 555-0173', school: 'Eastwood State University', program: 'BSN Pre-Licensure Nursing', programType: 'BSN', cohort: 'Spring 2026', onboardingStatus: 'Non-Compliant', scheduleId: 'sched-043', pendingFirstLogin: false },
  { id: 'stu-019', firstName: 'Andre', lastName: 'Dupont', email: 'a.dupont@eastwoodstate.edu', phone: '(614) 555-0174', school: 'Eastwood State University', program: 'DNP Advanced Practice', programType: 'DNP', cohort: 'Fall 2026', onboardingStatus: 'Pending', scheduleId: null, pendingFirstLogin: false },
  // No email on file — reachable path for the "excluded, no email on file" edge case (PRD 8). Not pending first login, so the 229 KPI is unaffected.
  { id: 'stu-021', firstName: 'Tobias', lastName: 'Brandt', email: null, phone: '(614) 555-0176', school: 'Eastwood State University', program: 'BSN Pre-Licensure Nursing', programType: 'BSN', cohort: 'Fall 2026', onboardingStatus: 'Not Started', scheduleId: null, pendingFirstLogin: false },
  { id: 'stu-020', firstName: 'Fatima', lastName: 'Al-Rashid', email: 'f.alrashid@eastwoodstate.edu', phone: '(614) 555-0175', school: 'Eastwood State University', program: 'DNP Advanced Practice', programType: 'DNP', cohort: 'Fall 2026', onboardingStatus: 'Not Started', scheduleId: null, pendingFirstLogin: true },
];

// ── Loop-generated rows ──────────────────────────────────────────────────────
// Deterministic counter — no Math.random() so the list is stable across renders.
const LOOP_SCHOOLS = ['Bowie State University', 'Baylor University', 'Eastwood State University'] as const;
const LOOP_PROGRAMS = [
  { program: 'BSN Pre-Licensure Nursing', programType: 'BSN', school: 'Bowie State University' as const },
  { program: 'Master of Occupational Therapy', programType: 'MOT', school: 'Baylor University' as const },
  { program: 'BSN Pre-Licensure Nursing', programType: 'BSN', school: 'Eastwood State University' as const },
];
const LOOP_COHORTS = ['Spring 2026', 'Fall 2026', 'Spring 2027'];
const LOOP_STATUSES: OnboardingStatus[] = ['Compliant', 'Non-Compliant', 'Pending', 'Not Started'];
const LOOP_FIRST = ['Jordan', 'Taylor', 'Morgan', 'Riley', 'Casey', 'Quinn', 'Avery', 'Cameron'];
const LOOP_LAST = ['Mitchell', 'Bennett', 'Russell', 'Coleman', 'Brooks', 'Rivera', 'Reed', 'Cooper'];

// Diverse display rows — power table views (schedules, school requests) with
// varied schools and onboarding statuses. None carry pendingFirstLogin: true;
// the Bowie State pending cohort is seeded separately below.
(function seedLoopStudents() {
  const domainMap: Record<typeof LOOP_SCHOOLS[number], string> = {
    'Bowie State University': 'bowiestate.edu',
    'Baylor University': 'baylor.edu',
    'Eastwood State University': 'eastwoodstate.edu',
  };
  for (let i = 0; i < 30; i++) {
    const prog = LOOP_PROGRAMS[i % LOOP_PROGRAMS.length];
    const first = LOOP_FIRST[i % LOOP_FIRST.length];
    const last = LOOP_LAST[i % LOOP_LAST.length];
    const cohort = LOOP_COHORTS[i % LOOP_COHORTS.length];
    const status = LOOP_STATUSES[i % LOOP_STATUSES.length];
    mockStudents.push({
      id: `stu-${String(100 + i).padStart(3, '0')}`,
      firstName: first,
      lastName: last,
      email: `${first.toLowerCase()}.${last.toLowerCase()}${100 + i}@${domainMap[prog.school]}`,
      phone: `(${301 + (i % 3) * 100}) 555-${String(200 + i).padStart(4, '0')}`,
      school: prog.school,
      program: prog.program,
      programType: prog.programType,
      cohort,
      onboardingStatus: status,
      scheduleId: i % 3 === 0 ? null : `sched-${String(200 + i).padStart(3, '0')}`,
      pendingFirstLogin: false,
    });
  }
})();

// Bowie State pending-first-login cohort — generates exactly
// KPI_STUDENTS_PENDING_FIRST_LOGIN − 9 rows (9 already in the hand-written block
// above: stu-001–stu-008 and stu-020) so that
//   mockStudents.filter(s => s.pendingFirstLogin).length === KPI_STUDENTS_PENDING_FIRST_LOGIN
// and allPendingRecipients in SchoolDashboard carries the real 229 entries into
// the Compose wizard when "Email All 229 Students" is clicked.
(function seedPendingCohort() {
  const needed = KPI_STUDENTS_PENDING_FIRST_LOGIN - 9; // 220
  for (let i = 0; i < needed; i++) {
    const first = LOOP_FIRST[i % LOOP_FIRST.length];
    const last = LOOP_LAST[i % LOOP_LAST.length];
    mockStudents.push({
      id: `stu-p${String(i + 1).padStart(3, '0')}`,
      firstName: first,
      lastName: last,
      email: `${first.toLowerCase()}.${last.toLowerCase()}${1000 + i}@bowiestate.edu`,
      phone: `(301) 555-${String(1000 + i).padStart(4, '0')}`,
      school: 'Bowie State University',
      program: 'BSN Pre-Licensure Nursing',
      programType: 'BSN',
      cohort: 'Fall 2026',
      onboardingStatus: 'Not Started',
      scheduleId: null,
      pendingFirstLogin: true,
    });
  }
})();
