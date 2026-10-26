// Preceptor audience type.
// Mock data only — no real "isPreceptor" identification bit exists yet (see
// companion Preceptor Module PRD); these are hand-modeled records for the
// Bulk Email prototype's Recipients step, not tied to mockPersonnel.

export type PreceptorShift = 'Day' | 'Evening' | 'Night' | 'Rotating';

export interface Preceptor {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;   // null = no email on file (excluded from Bulk Email, PRD 8)
  phone: string;
  site: string;                      // hospital/site name — matches hospitalName in mockPersonnel
  location: string;                  // matches location names in mockLocations / mockSchedules
  shift: PreceptorShift;
  assignedScheduleId: string | null; // matches id in mockSchedules — null if not currently assigned
  assignedScheduleRef: string | null; // human-readable rotation reference, e.g. mockSchedules.rotationName
}

// ── Hand-written representative rows ────────────────────────────────────────
export const mockPreceptors: Preceptor[] = [
  { id: 'prec-001', firstName: 'David', lastName: 'Whitfield', email: 'd.whitfield@medstarhealth.org', phone: '(202) 555-0301', site: 'MedStar Health', location: 'MedStar Washington Hospital Center – ICU', shift: 'Day', assignedScheduleId: 'sched-001', assignedScheduleRef: 'MedStar ICU – Fall 2026' },
  { id: 'prec-002', firstName: 'Angela', lastName: 'Reyes', email: 'a.reyes@medstarhealth.org', phone: '(202) 555-0302', site: 'MedStar Health', location: 'MedStar Washington Hospital Center – ED', shift: 'Night', assignedScheduleId: 'sched-004', assignedScheduleRef: 'MedStar ED – Fall 2026' },
  { id: 'prec-003', firstName: 'Michael', lastName: 'Osei', email: 'm.osei@medstarhealth.org', phone: '(202) 555-0303', site: 'MedStar Health', location: 'MedStar Georgetown University Hospital – NICU', shift: 'Day', assignedScheduleId: 'sched-005', assignedScheduleRef: 'MedStar NICU – Fall 2026' },
  { id: 'prec-004', firstName: 'Rachel', lastName: 'Kim', email: 'r.kim@atipt.com', phone: '(301) 555-0304', site: 'ATI Physical Therapy', location: 'ATI Physical Therapy – Rockville', shift: 'Rotating', assignedScheduleId: 'sched-010', assignedScheduleRef: 'ATI OT Rockville – Fall 2026' },
  { id: 'prec-005', firstName: 'Anthony', lastName: 'Brooks', email: 'a.brooks@hendrickhealth.org', phone: '(325) 555-0305', site: 'Hendrick Health', location: 'Hendrick Medical Center – ICU', shift: 'Evening', assignedScheduleId: null, assignedScheduleRef: null },
  { id: 'prec-006', firstName: 'Wanda', lastName: 'Ellis', email: 'w.ellis@medstarhealth.org', phone: '(202) 555-0306', site: 'MedStar Health', location: 'MedStar National Rehabilitation Network', shift: 'Day', assignedScheduleId: null, assignedScheduleRef: null },
  { id: 'prec-007', firstName: 'Bruce', lastName: 'Kowalczyk', email: 'b.kowalczyk@medstarhealth.org', phone: '(202) 555-0307', site: 'MedStar Health', location: 'MedStar Montgomery Medical Center – Med/Surg', shift: 'Night', assignedScheduleId: 'sched-007', assignedScheduleRef: 'MedStar Med/Surg – Spring 2026' },
  // Added so every location that appears on Availability / Schedules has at least one preceptor to pre-seed.
  { id: 'prec-008', firstName: 'Nadia', lastName: 'Farouk', email: 'n.farouk@atipt.com', phone: '(301) 555-0308', site: 'ATI Physical Therapy', location: 'ATI Physical Therapy – Bethesda', shift: 'Day', assignedScheduleId: null, assignedScheduleRef: null },
  { id: 'prec-009', firstName: 'Lawrence', lastName: 'Tate', email: 'l.tate@hendrickhealth.org', phone: '(325) 555-0309', site: 'Hendrick Health', location: 'Hendrick Medical Center – Med/Surg', shift: 'Night', assignedScheduleId: null, assignedScheduleRef: null },
  { id: 'prec-010', firstName: 'Priscilla', lastName: 'Yamamoto', email: 'p.yamamoto@medstarhealth.org', phone: '(202) 555-0310', site: 'MedStar Health', location: 'MedStar Washington Hospital Center – Radiology', shift: 'Day', assignedScheduleId: null, assignedScheduleRef: null },
  { id: 'prec-011', firstName: 'Omar', lastName: 'Haddad', email: 'o.haddad@atipt.com', phone: '(703) 555-0311', site: 'ATI Physical Therapy', location: 'ATI Physical Therapy – Arlington', shift: 'Rotating', assignedScheduleId: null, assignedScheduleRef: null },
  { id: 'prec-012', firstName: 'Beatrice', lastName: 'Lindqvist', email: 'b.lindqvist@medstarhealth.org', phone: '(202) 555-0312', site: 'MedStar Health', location: 'MedStar Washington Hospital Center – OT', shift: 'Evening', assignedScheduleId: null, assignedScheduleRef: null },
  // No email on file — reachable path for the "excluded, no email on file" edge case (PRD 8).
  { id: 'prec-014', firstName: 'Terrence', lastName: 'Boyd', email: 't.boyd@medstarhealth.org', phone: '(202) 555-0314', site: 'MedStar Health', location: 'MedStar Georgetown University Hospital – NICU', shift: 'Night', assignedScheduleId: null, assignedScheduleRef: null },
  { id: 'prec-013', firstName: 'Julian', lastName: 'Okoye', email: 'j.okoye@medstarhealth.org', phone: '(202) 555-0313', site: 'MedStar Health', location: 'MedStar Washington Hospital Center – Pharmacy', shift: 'Day', assignedScheduleId: null, assignedScheduleRef: null },
];
