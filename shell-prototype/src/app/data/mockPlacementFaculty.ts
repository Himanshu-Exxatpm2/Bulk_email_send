// Placement Faculty/CI audience type — school-side faculty and Clinical
// Instructors, distinct from Preceptors (who sit on the site side).
// Rosters cross-reference the cohorts already seeded in mockStudents.ts.

export type FacultyTitle = 'Clinical Instructor' | 'Faculty Coordinator';

export interface PlacementFaculty {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;   // null = no email on file (excluded from Bulk Email, PRD 8)
  phone: string;
  school: string;             // matches school names in mockStudents / mockSchoolPartners
  title: FacultyTitle;
  studentRosterRef: string;   // human-readable roster reference tied to a mockStudents cohort
  rosterCount: number;
}

// ── Hand-written representative rows ────────────────────────────────────────
export const mockPlacementFaculty: PlacementFaculty[] = [
  { id: 'fac-001', firstName: 'Denise', lastName: 'Carrington', email: 'd.carrington@bowiestate.edu', phone: '(301) 555-0401', school: 'Bowie State University', title: 'Clinical Instructor', studentRosterRef: 'Bowie State BSN – Fall 2026 Cohort', rosterCount: 8 },
  { id: 'fac-002', firstName: 'Harold', lastName: 'Whitman', email: 'h.whitman@bowiestate.edu', phone: '(301) 555-0402', school: 'Bowie State University', title: 'Faculty Coordinator', studentRosterRef: 'Bowie State BSN – Spring 2026 Cohort', rosterCount: 4 },
  { id: 'fac-003', firstName: 'Elena', lastName: 'Vasquez', email: 'e.vasquez@baylor.edu', phone: '(254) 555-0403', school: 'Baylor University', title: 'Clinical Instructor', studentRosterRef: 'Baylor MOT – Fall 2026 Cohort', rosterCount: 3 },
  { id: 'fac-004', firstName: 'Gregory', lastName: 'Ashford', email: 'g.ashford@eastwoodstate.edu', phone: '(614) 555-0404', school: 'Eastwood State University', title: 'Clinical Instructor', studentRosterRef: 'Eastwood State BSN – Spring 2026 Cohort', rosterCount: 3 },
  { id: 'fac-005', firstName: 'Monica', lastName: 'Delacroix', email: 'm.delacroix@eastwoodstate.edu', phone: '(614) 555-0405', school: 'Eastwood State University', title: 'Faculty Coordinator', studentRosterRef: 'Eastwood State DNP – Fall 2026 Cohort', rosterCount: 2 },
  // Added so every school that appears on Schedules has faculty to pre-seed. These
  // schools' students aren't in mockStudents, so the roster refs are descriptive only.
  { id: 'fac-006', firstName: 'Yolanda', lastName: 'Brandt', email: 'y.brandt@wthsu.edu', phone: '(806) 555-0406', school: 'Western Texas Health Sciences University', title: 'Clinical Instructor', studentRosterRef: 'Western Texas HSU – Fall 2026 Cohort', rosterCount: 6 },
  { id: 'fac-007', firstName: 'Winston', lastName: 'Achebe', email: 'w.achebe@capitolnursing.edu', phone: '(202) 555-0407', school: 'Capitol Nursing College', title: 'Faculty Coordinator', studentRosterRef: 'Capitol Nursing – Fall 2026 Cohort', rosterCount: 5 },
  // No email on file — reachable path for the "excluded, no email on file" edge case (PRD 8).
  { id: 'fac-009', firstName: 'Rosalind', lastName: 'Pierce', email: 'r.pierce@baylor.edu', phone: '(254) 555-0409', school: 'Baylor University', title: 'Clinical Instructor', studentRosterRef: 'Baylor MOT – Spring 2026 Cohort', rosterCount: 2 },
  { id: 'fac-008', firstName: 'Tamsin', lastName: 'Rourke', email: 't.rourke@harrington.edu', phone: '(410) 555-0408', school: 'Harrington School of Allied Health', title: 'Clinical Instructor', studentRosterRef: 'Harrington Allied Health – Spring 2026 Cohort', rosterCount: 4 },
];
