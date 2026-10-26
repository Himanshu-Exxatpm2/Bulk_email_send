// Staff-Personnel audience type.
// Every count shown for personnel is derived from mockPersonnel.

export type PersonnelRole =
  | 'Nurse Manager'
  | 'Clinical Preceptor'
  | 'Clinical Coordinator'
  | 'Department Director'
  | 'Placement Coordinator'
  | 'Administrative Staff'
  | 'Education Specialist';

export interface Personnel {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;   // null = no email on file (excluded from Bulk Email, PRD 8)
  phone: string;
  role: PersonnelRole;
  department: string;
  location: string;          // matches location names in mockLocations
  hospitalName: string;
  isActive: boolean;
  hasSystemAccess: boolean;  // default true for active rows
  hasLoggedIn: boolean;      // false = "Pending Login" (only meaningful when hasSystemAccess is true)
  lastLogin: string | null;  // ISO date string, or null if never logged in
  designation: string;       // reuses role text for now
  // PRD 5.6 — gates eligibility as a Bulk Email recipient (Generic and contextual
  // sends). Default is an open product question (section 11); mock ships all ON.
  receiveNotifications: boolean;
}

// ── Hand-written representative rows ────────────────────────────────────────
const BASE_PERSONNEL: Omit<Personnel, 'receiveNotifications'>[] = [
  // MedStar Washington Hospital Center
  { id: 'per-001', firstName: 'Sandra', lastName: 'Okonkwo', email: 's.okonkwo@medstarhealth.org', phone: '(202) 555-0201', role: 'Nurse Manager', department: 'ICU', location: 'MedStar Washington Hospital Center – ICU', hospitalName: 'MedStar Health', isActive: true, hasSystemAccess: true, hasLoggedIn: true, lastLogin: '2026-09-10', designation: 'Nurse Manager' },
  { id: 'per-002', firstName: 'Raymond', lastName: 'Castillo', email: 'r.castillo@medstarhealth.org', phone: '(202) 555-0202', role: 'Clinical Coordinator', department: 'ICU', location: 'MedStar Washington Hospital Center – ICU', hospitalName: 'MedStar Health', isActive: true, hasSystemAccess: true, hasLoggedIn: true, lastLogin: '2026-09-08', designation: 'Clinical Coordinator' },
  { id: 'per-003', firstName: 'Patricia', lastName: 'Nguyen', email: 'p.nguyen@medstarhealth.org', phone: '(202) 555-0203', role: 'Clinical Preceptor', department: 'Emergency Department', location: 'MedStar Washington Hospital Center – ED', hospitalName: 'MedStar Health', isActive: true, hasSystemAccess: true, hasLoggedIn: true, lastLogin: '2026-09-05', designation: 'Clinical Preceptor' },
  { id: 'per-004', firstName: 'Kevin', lastName: 'O\'Brien', email: 'k.obrien@medstarhealth.org', phone: '(202) 555-0204', role: 'Department Director', department: 'Radiology', location: 'MedStar Washington Hospital Center – Radiology', hospitalName: 'MedStar Health', isActive: true, hasSystemAccess: true, hasLoggedIn: false, lastLogin: null, designation: 'Department Director' },
  { id: 'per-005', firstName: 'Alicia', lastName: 'Ruiz', email: 'a.ruiz@medstarhealth.org', phone: '(202) 555-0205', role: 'Placement Coordinator', department: 'Clinical Education', location: 'MedStar Washington Hospital Center – ICU', hospitalName: 'MedStar Health', isActive: true, hasSystemAccess: true, hasLoggedIn: true, lastLogin: '2026-09-01', designation: 'Placement Coordinator' },

  // MedStar Georgetown University Hospital
  { id: 'per-006', firstName: 'Thomas', lastName: 'Park', email: 't.park@medstarhealth.org', phone: '(202) 555-0206', role: 'Nurse Manager', department: 'NICU', location: 'MedStar Georgetown University Hospital – NICU', hospitalName: 'MedStar Health', isActive: true, hasSystemAccess: true, hasLoggedIn: true, lastLogin: '2026-08-28', designation: 'Nurse Manager' },
  { id: 'per-007', firstName: 'Denise', lastName: 'Washington', email: 'd.washington@medstarhealth.org', phone: '(202) 555-0207', role: 'Clinical Preceptor', department: 'NICU', location: 'MedStar Georgetown University Hospital – NICU', hospitalName: 'MedStar Health', isActive: true, hasSystemAccess: true, hasLoggedIn: true, lastLogin: '2026-08-30', designation: 'Clinical Preceptor' },
  { id: 'per-008', firstName: 'George', lastName: 'Mercer', email: 'g.mercer@medstarhealth.org', phone: '(202) 555-0208', role: 'Education Specialist', department: 'Clinical Education', location: 'MedStar Georgetown University Hospital – NICU', hospitalName: 'MedStar Health', isActive: true, hasSystemAccess: true, hasLoggedIn: true, lastLogin: '2026-08-20', designation: 'Education Specialist' },
  { id: 'per-009', firstName: 'Helen', lastName: 'Adeyemi', email: 'h.adeyemi@medstarhealth.org', phone: '(202) 555-0209', role: 'Clinical Coordinator', department: 'Pharmacy', location: 'MedStar Georgetown University Hospital – Pharmacy', hospitalName: 'MedStar Health', isActive: true, hasSystemAccess: true, hasLoggedIn: true, lastLogin: '2026-09-02', designation: 'Clinical Coordinator' },

  // MedStar National Rehabilitation Network
  { id: 'per-010', firstName: 'James', lastName: 'Holloway', email: 'j.holloway@medstarhealth.org', phone: '(202) 555-0210', role: 'Department Director', department: 'Physical Therapy', location: 'MedStar National Rehabilitation Network', hospitalName: 'MedStar Health', isActive: true, hasSystemAccess: true, hasLoggedIn: true, lastLogin: '2026-08-15', designation: 'Department Director' },
  { id: 'per-011', firstName: 'Carmen', lastName: 'Ortega', email: 'c.ortega@medstarhealth.org', phone: '(202) 555-0211', role: 'Clinical Preceptor', department: 'Occupational Therapy', location: 'MedStar National Rehabilitation Network', hospitalName: 'MedStar Health', isActive: true, hasSystemAccess: true, hasLoggedIn: false, lastLogin: null, designation: 'Clinical Preceptor' },
  { id: 'per-012', firstName: 'Derek', lastName: 'Fontaine', email: 'd.fontaine@medstarhealth.org', phone: '(202) 555-0212', role: 'Clinical Coordinator', department: 'Rehabilitation Services', location: 'MedStar National Rehabilitation Network', hospitalName: 'MedStar Health', isActive: true, hasSystemAccess: true, hasLoggedIn: true, lastLogin: '2026-08-22', designation: 'Clinical Coordinator' },

  // ATI Physical Therapy
  { id: 'per-013', firstName: 'Michelle', lastName: 'Tran', email: 'm.tran@atipt.com', phone: '(301) 555-0213', role: 'Clinical Preceptor', department: 'Physical Therapy', location: 'ATI Physical Therapy – Rockville', hospitalName: 'ATI Physical Therapy', isActive: true, hasSystemAccess: true, hasLoggedIn: true, lastLogin: '2026-09-06', designation: 'Clinical Preceptor' },
  { id: 'per-014', firstName: 'Paul', lastName: 'Greenwald', email: 'p.greenwald@atipt.com', phone: '(301) 555-0214', role: 'Placement Coordinator', department: 'Clinical Education', location: 'ATI Physical Therapy – Bethesda', hospitalName: 'ATI Physical Therapy', isActive: true, hasSystemAccess: true, hasLoggedIn: true, lastLogin: '2026-08-18', designation: 'Placement Coordinator' },
  { id: 'per-015', firstName: 'Stephanie', lastName: 'Burrows', email: 's.burrows@atipt.com', phone: '(301) 555-0215', role: 'Nurse Manager', department: 'Occupational Therapy', location: 'ATI Physical Therapy – Bethesda', hospitalName: 'ATI Physical Therapy', isActive: false, hasSystemAccess: false, hasLoggedIn: false, lastLogin: null, designation: 'Nurse Manager' },

  // Hendrick Medical Center
  { id: 'per-016', firstName: 'Bobby', lastName: 'Whitfield', email: 'b.whitfield@hendrickhealth.org', phone: '(325) 555-0216', role: 'Nurse Manager', department: 'Med/Surg', location: 'Hendrick Medical Center – Med/Surg', hospitalName: 'Hendrick Health', isActive: true, hasSystemAccess: true, hasLoggedIn: true, lastLogin: '2026-09-03', designation: 'Nurse Manager' },
  { id: 'per-017', firstName: 'Linda', lastName: 'Swanson', email: 'l.swanson@hendrickhealth.org', phone: '(325) 555-0217', role: 'Clinical Coordinator', department: 'ICU', location: 'Hendrick Medical Center – ICU', hospitalName: 'Hendrick Health', isActive: true, hasSystemAccess: true, hasLoggedIn: false, lastLogin: null, designation: 'Clinical Coordinator' },
  { id: 'per-018', firstName: 'Craig', lastName: 'Patel', email: 'c.patel@hendrickhealth.org', phone: '(325) 555-0218', role: 'Administrative Staff', department: 'Clinical Education', location: 'Hendrick Medical Center – Med/Surg', hospitalName: 'Hendrick Health', isActive: true, hasSystemAccess: true, hasLoggedIn: true, lastLogin: '2026-08-25', designation: 'Administrative Staff' },

  // Added so every location that appears on Availability / Schedules has site personnel to pre-seed.
  { id: 'per-019', firstName: 'Vanessa', lastName: 'Achterberg', email: 'v.achterberg@atipt.com', phone: '(703) 555-0219', role: 'Placement Coordinator', department: 'Clinical Education', location: 'ATI Physical Therapy – Arlington', hospitalName: 'ATI Physical Therapy', isActive: true, hasSystemAccess: true, hasLoggedIn: true, lastLogin: '2026-08-21', designation: 'Placement Coordinator' },
  { id: 'per-020', firstName: 'Leonard', lastName: 'Bishop', email: 'l.bishop@medstarhealth.org', phone: '(202) 555-0220', role: 'Clinical Coordinator', department: 'Occupational Therapy', location: 'MedStar Washington Hospital Center – OT', hospitalName: 'MedStar Health', isActive: true, hasSystemAccess: true, hasLoggedIn: true, lastLogin: '2026-08-19', designation: 'Clinical Coordinator' },
  { id: 'per-021', firstName: 'Ingrid', lastName: 'Solheim', email: 'i.solheim@medstarhealth.org', phone: '(202) 555-0221', role: 'Education Specialist', department: 'Pharmacy', location: 'MedStar Washington Hospital Center – Pharmacy', hospitalName: 'MedStar Health', isActive: true, hasSystemAccess: true, hasLoggedIn: true, lastLogin: '2026-08-23', designation: 'Education Specialist' },
  // No email on file — reachable path for the "excluded, no email on file" edge case (PRD 8).
  { id: 'per-023', firstName: 'Harold', lastName: 'Ainsworth', email: 'h.ainsworth@medstarhealth.org', phone: '(202) 555-0223', role: 'Administrative Staff', department: 'Rehabilitation Services', location: 'MedStar National Rehabilitation Network', hospitalName: 'MedStar Health', isActive: true, hasSystemAccess: false, hasLoggedIn: false, lastLogin: null, designation: 'Administrative Staff' },
  { id: 'per-022', firstName: 'Marcus', lastName: 'Delgado', email: 'm.delgado@medstarhealth.org', phone: '(301) 555-0222', role: 'Nurse Manager', department: 'Med/Surg', location: 'MedStar Montgomery Medical Center – Med/Surg', hospitalName: 'MedStar Health', isActive: true, hasSystemAccess: true, hasLoggedIn: true, lastLogin: '2026-08-27', designation: 'Nurse Manager' },
];

export const mockPersonnel: Personnel[] = BASE_PERSONNEL.map((p) => ({ ...p, receiveNotifications: true }));

// Mutates the shared mock record in place so every screen that reads
// mockPersonnel (list, launcher, bolt-on pre-seeding) sees the change.
export function setReceiveNotifications(id: string, value: boolean) {
  const rec = mockPersonnel.find((p) => p.id === id);
  if (rec) rec.receiveNotifications = value;
}

// ── Loop-generated rows ──────────────────────────────────────────────────────
const LOOP_ROLES: PersonnelRole[] = [
  'Clinical Preceptor', 'Clinical Coordinator', 'Nurse Manager', 'Placement Coordinator', 'Administrative Staff',
];
const LOOP_DEPTS = ['ICU', 'NICU', 'Emergency Department', 'Pharmacy', 'Rehabilitation Services', 'Radiology', 'Med/Surg'];
const LOOP_LOCS = [
  'MedStar Washington Hospital Center – ICU',
  'MedStar Georgetown University Hospital – NICU',
  'MedStar National Rehabilitation Network',
  'ATI Physical Therapy – Rockville',
  'Hendrick Medical Center – Med/Surg',
];
const LOOP_HOSPITALS = ['MedStar Health', 'MedStar Health', 'MedStar Health', 'ATI Physical Therapy', 'Hendrick Health'];
const LOOP_FIRST = ['Alex', 'Jordan', 'Morgan', 'Sam', 'Chris', 'Taylor', 'Casey', 'Dana', 'Robin', 'Jamie'];
const LOOP_LAST = ['Foster', 'Lawson', 'Carr', 'Drake', 'Holt', 'Pratt', 'Nash', 'Vega', 'Garza', 'Webb'];

(function seedLoopPersonnel() {
  for (let i = 0; i < 20; i++) {
    const locIdx = i % LOOP_LOCS.length;
    const role = LOOP_ROLES[i % LOOP_ROLES.length];
    const isActive = i % 7 !== 0;
    const hasSystemAccess = isActive;
    const hasLoggedIn = hasSystemAccess && i % 5 !== 0;
    mockPersonnel.push({
      id: `per-${String(100 + i).padStart(3, '0')}`,
      firstName: LOOP_FIRST[i % LOOP_FIRST.length],
      lastName: LOOP_LAST[i % LOOP_LAST.length],
      email: `${LOOP_FIRST[i % LOOP_FIRST.length].toLowerCase()}.${LOOP_LAST[i % LOOP_LAST.length].toLowerCase()}${100 + i}@medstarhealth.org`,
      phone: `(202) 555-${String(300 + i).padStart(4, '0')}`,
      role,
      department: LOOP_DEPTS[i % LOOP_DEPTS.length],
      location: LOOP_LOCS[locIdx],
      hospitalName: LOOP_HOSPITALS[locIdx],
      isActive,
      hasSystemAccess,
      hasLoggedIn,
      lastLogin: hasLoggedIn ? `2026-08-${String(1 + (i % 28)).padStart(2, '0')}` : null,
      designation: role,
      receiveNotifications: true,
    });
  }
})();
