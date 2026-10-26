// Confirmed clinical placements (schedules). Platform KPI: 792 active schedules.
export type ScheduleStatus = 'Active' | 'Upcoming' | 'Completed' | 'To be Scheduled' | 'Canceled';
export type OnboardingStatus = 'Compliant' | 'Non-Compliant' | 'Pending' | 'Not Started';

export interface Schedule {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  school: string;
  program: string;
  programType: string;
  locationId: string;
  location: string;
  rotationName: string;
  startDate: string;
  endDate: string;
  onboardingStatus: OnboardingStatus;
  scheduleStatus: ScheduleStatus;
  preceptor: string;
}

export const KPI_TOTAL_SCHEDULES = 792;

export const mockSchedules: Schedule[] = [
  // ── Bowie State – MedStar ICU ───────────────────────────────────────────────
  { id: 'sched-001', studentId: 'stu-001', studentName: 'Aaliyah Washington', studentEmail: 'a.washington@bowiestate.edu', school: 'Bowie State University', program: 'BSN Pre-Licensure Nursing', programType: 'BSN', locationId: 'loc-001', location: 'MedStar Washington Hospital Center – ICU', rotationName: 'MedStar ICU – Fall 2026', startDate: '2026-09-01', endDate: '2026-12-15', onboardingStatus: 'Not Started', scheduleStatus: 'Upcoming', preceptor: 'Sandra Okonkwo' },
  { id: 'sched-002', studentId: 'stu-002', studentName: 'Marcus Okafor', studentEmail: 'm.okafor@bowiestate.edu', school: 'Bowie State University', program: 'BSN Pre-Licensure Nursing', programType: 'BSN', locationId: 'loc-001', location: 'MedStar Washington Hospital Center – ICU', rotationName: 'MedStar ICU – Fall 2026', startDate: '2026-09-01', endDate: '2026-12-15', onboardingStatus: 'Not Started', scheduleStatus: 'Upcoming', preceptor: 'Raymond Castillo' },
  { id: 'sched-003', studentId: 'stu-003', studentName: 'Destiny Robinson', studentEmail: 'd.robinson@bowiestate.edu', school: 'Bowie State University', program: 'BSN Pre-Licensure Nursing', programType: 'BSN', locationId: 'loc-001', location: 'MedStar Washington Hospital Center – ICU', rotationName: 'MedStar ICU – Fall 2026', startDate: '2026-09-01', endDate: '2026-12-15', onboardingStatus: 'Not Started', scheduleStatus: 'Upcoming', preceptor: 'Sandra Okonkwo' },
  { id: 'sched-004', studentId: 'stu-004', studentName: 'Jerome Bailey', studentEmail: 'j.bailey@bowiestate.edu', school: 'Bowie State University', program: 'BSN Pre-Licensure Nursing', programType: 'BSN', locationId: 'loc-002', location: 'MedStar Washington Hospital Center – ED', rotationName: 'MedStar ED – Fall 2026', startDate: '2026-09-01', endDate: '2026-12-15', onboardingStatus: 'Not Started', scheduleStatus: 'Upcoming', preceptor: 'Patricia Nguyen' },
  { id: 'sched-005', studentId: 'stu-005', studentName: 'Keisha Thompson', studentEmail: 'k.thompson@bowiestate.edu', school: 'Bowie State University', program: 'BSN Pre-Licensure Nursing', programType: 'BSN', locationId: 'loc-006', location: 'MedStar Georgetown University Hospital – NICU', rotationName: 'MedStar NICU – Fall 2026', startDate: '2026-09-15', endDate: '2026-12-15', onboardingStatus: 'Not Started', scheduleStatus: 'Upcoming', preceptor: 'Thomas Park' },

  // ── Bowie State – Spring 2026 (Active, various compliance states) ───────────
  { id: 'sched-006', studentId: 'stu-009', studentName: 'Imani Jackson', studentEmail: 'i.jackson@bowiestate.edu', school: 'Bowie State University', program: 'BSN Pre-Licensure Nursing', programType: 'BSN', locationId: 'loc-001', location: 'MedStar Washington Hospital Center – ICU', rotationName: 'MedStar ICU – Spring 2026', startDate: '2026-01-15', endDate: '2026-05-01', onboardingStatus: 'Compliant', scheduleStatus: 'Completed', preceptor: 'Sandra Okonkwo' },
  { id: 'sched-007', studentId: 'stu-010', studentName: 'Malik Freeman', studentEmail: 'm.freeman@bowiestate.edu', school: 'Bowie State University', program: 'BSN Pre-Licensure Nursing', programType: 'BSN', locationId: 'loc-009', location: 'MedStar Montgomery Medical Center – Med/Surg', rotationName: 'MedStar Med/Surg – Spring 2026', startDate: '2026-01-15', endDate: '2026-05-01', onboardingStatus: 'Non-Compliant', scheduleStatus: 'Active', preceptor: 'George Mercer' },
  { id: 'sched-008', studentId: 'stu-011', studentName: 'Brianna Carter', studentEmail: 'b.carter@bowiestate.edu', school: 'Bowie State University', program: 'BSN Pre-Licensure Nursing', programType: 'BSN', locationId: 'loc-009', location: 'MedStar Montgomery Medical Center – Med/Surg', rotationName: 'MedStar Med/Surg – Spring 2026', startDate: '2026-01-15', endDate: '2026-05-01', onboardingStatus: 'Pending', scheduleStatus: 'Active', preceptor: 'George Mercer' },
  { id: 'sched-009', studentId: 'stu-012', studentName: 'Deonte Simmons', studentEmail: 'd.simmons@bowiestate.edu', school: 'Bowie State University', program: 'BSN Pre-Licensure Nursing', programType: 'BSN', locationId: 'loc-008', location: 'MedStar National Rehabilitation Network', rotationName: 'MedStar Rehab – Spring 2026', startDate: '2026-02-01', endDate: '2026-05-15', onboardingStatus: 'Compliant', scheduleStatus: 'Active', preceptor: 'James Holloway' },

  // ── Baylor OT ────────────────────────────────────────────────────────────────
  { id: 'sched-010', studentId: 'stu-013', studentName: 'Sofia Reyes', studentEmail: 's.reyes@baylor.edu', school: 'Baylor University', program: 'Master of Occupational Therapy', programType: 'MOT', locationId: 'loc-012', location: 'ATI Physical Therapy – Rockville', rotationName: 'ATI OT Rockville – Fall 2026', startDate: '2026-09-01', endDate: '2026-12-20', onboardingStatus: 'Compliant', scheduleStatus: 'Upcoming', preceptor: 'Michelle Tran' },
  { id: 'sched-011', studentId: 'stu-014', studentName: 'Nathan Pryce', studentEmail: 'n.pryce@baylor.edu', school: 'Baylor University', program: 'Master of Occupational Therapy', programType: 'MOT', locationId: 'loc-013', location: 'ATI Physical Therapy – Bethesda', rotationName: 'ATI OT Bethesda – Fall 2026', startDate: '2026-09-01', endDate: '2026-12-20', onboardingStatus: 'Non-Compliant', scheduleStatus: 'Upcoming', preceptor: 'Paul Greenwald' },

  // ── Eastwood State ───────────────────────────────────────────────────────────
  { id: 'sched-012', studentId: 'stu-016', studentName: 'Priya Sharma', studentEmail: 'p.sharma@eastwoodstate.edu', school: 'Eastwood State University', program: 'BSN Pre-Licensure Nursing', programType: 'BSN', locationId: 'loc-001', location: 'MedStar Washington Hospital Center – ICU', rotationName: 'MedStar ICU – Spring 2026', startDate: '2026-01-10', endDate: '2026-04-30', onboardingStatus: 'Compliant', scheduleStatus: 'Completed', preceptor: 'Raymond Castillo' },
  { id: 'sched-013', studentId: 'stu-017', studentName: 'Owen Fitzgerald', studentEmail: 'o.fitzgerald@eastwoodstate.edu', school: 'Eastwood State University', program: 'BSN Pre-Licensure Nursing', programType: 'BSN', locationId: 'loc-009', location: 'MedStar Montgomery Medical Center – Med/Surg', rotationName: 'MedStar Med/Surg – Spring 2026', startDate: '2026-02-01', endDate: '2026-05-15', onboardingStatus: 'Compliant', scheduleStatus: 'Active', preceptor: 'Carmen Ortega' },
  { id: 'sched-014', studentId: 'stu-018', studentName: 'Lena Kowalski', studentEmail: 'l.kowalski@eastwoodstate.edu', school: 'Eastwood State University', program: 'BSN Pre-Licensure Nursing', programType: 'BSN', locationId: 'loc-009', location: 'MedStar Montgomery Medical Center – Med/Surg', rotationName: 'MedStar Med/Surg – Spring 2026', startDate: '2026-02-01', endDate: '2026-05-15', onboardingStatus: 'Non-Compliant', scheduleStatus: 'Active', preceptor: 'Carmen Ortega' },

  // ── Western Texas / Hendrick ─────────────────────────────────────────────────
  { id: 'sched-015', studentId: 'stu-100', studentName: 'Jordan Mitchell', studentEmail: 'jordan.mitchell100@bowiestate.edu', school: 'Western Texas Health Sciences University', program: 'BSN Pre-Licensure Nursing', programType: 'BSN', locationId: 'loc-015', location: 'Hendrick Medical Center – Med/Surg', rotationName: 'Hendrick Med/Surg – Fall 2026', startDate: '2026-09-01', endDate: '2026-12-20', onboardingStatus: 'Pending', scheduleStatus: 'Upcoming', preceptor: 'Bobby Whitfield' },
  { id: 'sched-016', studentId: 'stu-101', studentName: 'Taylor Bennett', studentEmail: 'taylor.bennett101@bowiestate.edu', school: 'Western Texas Health Sciences University', program: 'BSN Pre-Licensure Nursing', programType: 'BSN', locationId: 'loc-015', location: 'Hendrick Medical Center – Med/Surg', rotationName: 'Hendrick Med/Surg – Fall 2026', startDate: '2026-09-01', endDate: '2026-12-20', onboardingStatus: 'Not Started', scheduleStatus: 'Upcoming', preceptor: 'Linda Swanson' },
  { id: 'sched-017', studentId: 'stu-102', studentName: 'Morgan Russell', studentEmail: 'morgan.russell102@baylor.edu', school: 'Western Texas Health Sciences University', program: 'DPT', programType: 'DPT', locationId: 'loc-016', location: 'Hendrick Medical Center – ICU', rotationName: 'Hendrick ICU – Fall 2026', startDate: '2026-09-15', endDate: '2026-12-20', onboardingStatus: 'Compliant', scheduleStatus: 'Upcoming', preceptor: 'Bobby Whitfield' },

  // ── Capitol Nursing ───────────────────────────────────────────────────────────
  { id: 'sched-018', studentId: 'stu-103', studentName: 'Riley Coleman', studentEmail: 'riley.coleman103@eastwoodstate.edu', school: 'Capitol Nursing College', program: 'BSN Pre-Licensure Nursing', programType: 'BSN', locationId: 'loc-006', location: 'MedStar Georgetown University Hospital – NICU', rotationName: 'MedStar NICU – Spring 2026', startDate: '2026-01-15', endDate: '2026-04-30', onboardingStatus: 'Compliant', scheduleStatus: 'Completed', preceptor: 'Denise Washington' },
  { id: 'sched-019', studentId: 'stu-104', studentName: 'Casey Brooks', studentEmail: 'casey.brooks104@bowiestate.edu', school: 'Capitol Nursing College', program: 'BSN Pre-Licensure Nursing', programType: 'BSN', locationId: 'loc-006', location: 'MedStar Georgetown University Hospital – NICU', rotationName: 'MedStar NICU – Fall 2026', startDate: '2026-09-15', endDate: '2026-12-15', onboardingStatus: 'Pending', scheduleStatus: 'Upcoming', preceptor: 'Thomas Park' },

  // ── Harrington Allied Health ─────────────────────────────────────────────────
  { id: 'sched-020', studentId: 'stu-105', studentName: 'Quinn Rivera', studentEmail: 'quinn.rivera105@baylor.edu', school: 'Harrington School of Allied Health', program: 'BS Radiologic Technology', programType: 'BS Rad Tech', locationId: 'loc-003', location: 'MedStar Washington Hospital Center – Radiology', rotationName: 'MedStar Radiology – Fall 2026', startDate: '2026-09-01', endDate: '2026-12-20', onboardingStatus: 'Compliant', scheduleStatus: 'Upcoming', preceptor: 'Kevin O\'Brien' },
];

// ── Loop-generated rows ──────────────────────────────────────────────────────
const LOOP_STUDENTS = [
  { name: 'Avery Reed',    email: 'avery.reed@bowiestate.edu',      school: 'Bowie State University',   program: 'BSN Pre-Licensure Nursing', type: 'BSN' },
  { name: 'Cameron Cooper',email: 'cameron.cooper@baylor.edu',       school: 'Baylor University',         program: 'Master of Occupational Therapy', type: 'MOT' },
  { name: 'Skyler Hayes',  email: 'skyler.hayes@eastwoodstate.edu',  school: 'Eastwood State University', program: 'BSN Pre-Licensure Nursing', type: 'BSN' },
  { name: 'Drew Bell',     email: 'drew.bell@wthsu.edu',             school: 'Western Texas Health Sciences University', program: 'BSN Pre-Licensure Nursing', type: 'BSN' },
  { name: 'Alex Foster',   email: 'alex.foster@capitolnursing.edu',  school: 'Capitol Nursing College',   program: 'BSN Pre-Licensure Nursing', type: 'BSN' },
];
const LOOP_LOCATIONS_S = [
  { id: 'loc-001', name: 'MedStar Washington Hospital Center – ICU',  preceptor: 'Sandra Okonkwo' },
  { id: 'loc-009', name: 'MedStar Montgomery Medical Center – Med/Surg', preceptor: 'George Mercer' },
  { id: 'loc-012', name: 'ATI Physical Therapy – Rockville',          preceptor: 'Michelle Tran' },
  { id: 'loc-015', name: 'Hendrick Medical Center – Med/Surg',        preceptor: 'Bobby Whitfield' },
  { id: 'loc-006', name: 'MedStar Georgetown University Hospital – NICU', preceptor: 'Denise Washington' },
];
const LOOP_STATUSES_S: OnboardingStatus[] = ['Compliant', 'Non-Compliant', 'Pending', 'Not Started', 'Compliant', 'Non-Compliant', 'Pending'];
// Includes the two "Needs Attention" statuses (To be Scheduled, Canceled) alongside the
// original three so the Schedules page's attention card has real, non-zero counts.
const LOOP_SCHED_STATUS: ScheduleStatus[] = ['Active', 'Upcoming', 'Active', 'Completed', 'Upcoming', 'To be Scheduled', 'Canceled'];

(function seedLoopSchedules() {
  for (let i = 0; i < 25; i++) {
    const st = LOOP_STUDENTS[i % LOOP_STUDENTS.length];
    const loc = LOOP_LOCATIONS_S[i % LOOP_LOCATIONS_S.length];
    const yr = i < 12 ? '2026' : '2027';
    const mo = String(1 + (i % 12)).padStart(2, '0');
    const endMo = String(Math.min(12, Number(mo) + 3)).padStart(2, '0');
    mockSchedules.push({
      id: `sched-${String(100 + i).padStart(3, '0')}`,
      studentId: `stu-loop-${i}`,
      studentName: st.name,
      studentEmail: st.email,
      school: st.school,
      program: st.program,
      programType: st.type,
      locationId: loc.id,
      location: loc.name,
      rotationName: `${loc.name.split(' – ')[0]} Rotation – ${yr}`,
      startDate: `${yr}-${mo}-01`,
      endDate: `${yr}-${endMo}-30`,
      onboardingStatus: LOOP_STATUSES_S[i % LOOP_STATUSES_S.length],
      scheduleStatus: LOOP_SCHED_STATUS[i % LOOP_SCHED_STATUS.length],
      preceptor: loc.preceptor,
    });
  }
})();
