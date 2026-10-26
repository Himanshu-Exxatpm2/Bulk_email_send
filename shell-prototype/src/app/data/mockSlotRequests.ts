// Slot requests submitted by schools to clinical sites.
// Counts shown on the Dashboard and Slot Requests screen are derived from this array.
export type SlotRequestStatus = 'Pending' | 'Approved' | 'Declined' | 'Info Requested';
export type ExperienceType = 'Individual' | 'Group';

import { mockSchoolPartners } from './mockSchoolPartners';

export interface SlotRequest {
  id: string;
  schoolId: string;
  schoolName: string;
  programType: string;
  rotationName: string;
  location: string;
  startDate: string;
  endDate: string;
  slotsRequested: number;
  status: SlotRequestStatus;
  submittedAt: string;
  experienceType?: ExperienceType; // derived below — see enrichExperienceType
}

// A slot request doesn't store its school contact — the partner record is the only
// place it lives, and this reads it from there by schoolId. Storing a copy on the
// row is what let a request keep an email its partner no longer had.
export function slotRequestContact(r: Pick<SlotRequest, 'schoolId'>): { name: string; email: string | null } {
  const partner = mockSchoolPartners.find((p) => p.id === r.schoolId);
  return { name: partner?.contactName ?? '', email: partner?.contactEmail ?? null };
}

export const mockSlotRequests: SlotRequest[] = [
  // Bowie State — multiple requests (large partner)
  { id: 'sr-001', schoolId: 'sp-001', schoolName: 'Bowie State University', programType: 'BSN', rotationName: 'MedStar ICU – Fall 2026', location: 'MedStar Washington Hospital Center – ICU', startDate: '2026-09-01', endDate: '2026-12-15', slotsRequested: 24, status: 'Pending', submittedAt: '2026-06-01T09:00:00Z' },
  { id: 'sr-002', schoolId: 'sp-001', schoolName: 'Bowie State University', programType: 'BSN', rotationName: 'MedStar NICU – Fall 2026', location: 'MedStar Georgetown University Hospital – NICU', startDate: '2026-09-01', endDate: '2026-12-15', slotsRequested: 12, status: 'Approved', submittedAt: '2026-05-28T10:30:00Z' },
  { id: 'sr-003', schoolId: 'sp-001', schoolName: 'Bowie State University', programType: 'BSN', rotationName: 'MedStar ED – Spring 2027', location: 'MedStar Washington Hospital Center – ED', startDate: '2027-01-15', endDate: '2027-05-01', slotsRequested: 18, status: 'Pending', submittedAt: '2026-06-10T14:00:00Z' },
  { id: 'sr-004', schoolId: 'sp-001', schoolName: 'Bowie State University', programType: 'Pre-Licensure RN', rotationName: 'MedStar Med/Surg – Fall 2026', location: 'MedStar Montgomery Medical Center – Med/Surg', startDate: '2026-08-15', endDate: '2026-12-01', slotsRequested: 20, status: 'Info Requested', submittedAt: '2026-06-03T11:00:00Z' },

  // Baylor University
  { id: 'sr-005', schoolId: 'sp-002', schoolName: 'Baylor University', programType: 'MOT', rotationName: 'ATI OT Rockville – Fall 2026', location: 'ATI Physical Therapy – Rockville', startDate: '2026-09-01', endDate: '2026-12-20', slotsRequested: 10, status: 'Approved', submittedAt: '2026-05-20T08:00:00Z' },
  { id: 'sr-006', schoolId: 'sp-002', schoolName: 'Baylor University', programType: 'DPT', rotationName: 'ATI PT Bethesda – Spring 2027', location: 'ATI Physical Therapy – Bethesda', startDate: '2027-01-10', endDate: '2027-04-30', slotsRequested: 8, status: 'Pending', submittedAt: '2026-06-08T09:15:00Z' },

  // Eastwood State
  { id: 'sr-007', schoolId: 'sp-003', schoolName: 'Eastwood State University', programType: 'BSN', rotationName: 'MedStar ICU – Spring 2027', location: 'MedStar Washington Hospital Center – ICU', startDate: '2027-01-15', endDate: '2027-05-01', slotsRequested: 16, status: 'Pending', submittedAt: '2026-06-12T10:00:00Z' },
  { id: 'sr-008', schoolId: 'sp-003', schoolName: 'Eastwood State University', programType: 'DNP', rotationName: 'MedStar Harbor Cardiology – Fall 2026', location: 'MedStar Harbor Hospital – Cardiology', startDate: '2026-09-01', endDate: '2026-12-15', slotsRequested: 4, status: 'Approved', submittedAt: '2026-05-25T13:00:00Z' },
  { id: 'sr-009', schoolId: 'sp-003', schoolName: 'Eastwood State University', programType: 'MS-SLP', rotationName: 'ATI Speech-Language Arlington – Fall 2026', location: 'ATI Physical Therapy – Arlington', startDate: '2026-08-20', endDate: '2026-12-10', slotsRequested: 6, status: 'Declined', submittedAt: '2026-05-15T09:00:00Z' },

  // Capitol Nursing
  { id: 'sr-010', schoolId: 'sp-004', schoolName: 'Capitol Nursing College', programType: 'BSN', rotationName: 'MedStar NICU – Fall 2026', location: 'MedStar Georgetown University Hospital – NICU', startDate: '2026-09-15', endDate: '2026-12-15', slotsRequested: 10, status: 'Pending', submittedAt: '2026-06-05T08:30:00Z' },
  { id: 'sr-011', schoolId: 'sp-004', schoolName: 'Capitol Nursing College', programType: 'LPN-to-RN', rotationName: 'MedStar Med/Surg Olney – Spring 2027', location: 'MedStar Montgomery Medical Center – Med/Surg', startDate: '2027-01-10', endDate: '2027-05-01', slotsRequested: 8, status: 'Pending', submittedAt: '2026-06-11T11:00:00Z' },

  // Harrington School
  { id: 'sr-012', schoolId: 'sp-005', schoolName: 'Harrington School of Allied Health', programType: 'BS Radiologic Technology', rotationName: 'MedStar Radiology – Fall 2026', location: 'MedStar Washington Hospital Center – Radiology', startDate: '2026-09-01', endDate: '2026-12-20', slotsRequested: 8, status: 'Approved', submittedAt: '2026-05-18T09:00:00Z' },
  { id: 'sr-013', schoolId: 'sp-005', schoolName: 'Harrington School of Allied Health', programType: 'Respiratory Therapy', rotationName: 'MedStar ICU – Fall 2026', location: 'MedStar Washington Hospital Center – ICU', startDate: '2026-09-01', endDate: '2026-12-15', slotsRequested: 6, status: 'Pending', submittedAt: '2026-06-07T10:00:00Z' },

  // Lakewood Community College
  { id: 'sr-014', schoolId: 'sp-006', schoolName: 'Lakewood Community College', programType: 'Pre-Licensure RN', rotationName: 'MedStar Med/Surg – Fall 2026', location: 'MedStar Washington Hospital Center – ICU', startDate: '2026-08-25', endDate: '2026-12-10', slotsRequested: 10, status: 'Pending', submittedAt: '2026-06-09T14:00:00Z' },

  // Midlands University Pharmacy
  { id: 'sr-015', schoolId: 'sp-007', schoolName: 'Midlands University College of Pharmacy', programType: 'PharmD', rotationName: 'MedStar Pharmacy Rotation – Fall 2026', location: 'MedStar Georgetown University Hospital – Pharmacy', startDate: '2026-09-01', endDate: '2026-12-15', slotsRequested: 6, status: 'Approved', submittedAt: '2026-05-22T11:00:00Z' },

  // Western Texas Health Sciences
  { id: 'sr-016', schoolId: 'sp-008', schoolName: 'Western Texas Health Sciences University', programType: 'BSN', rotationName: 'Hendrick Med/Surg – Fall 2026', location: 'Hendrick Medical Center – Med/Surg', startDate: '2026-09-01', endDate: '2026-12-20', slotsRequested: 20, status: 'Approved', submittedAt: '2026-05-10T09:00:00Z' },
  { id: 'sr-017', schoolId: 'sp-008', schoolName: 'Western Texas Health Sciences University', programType: 'DPT', rotationName: 'Hendrick Rehab – Fall 2026', location: 'Hendrick Medical Center – Rehab', startDate: '2026-09-01', endDate: '2026-12-15', slotsRequested: 8, status: 'Pending', submittedAt: '2026-06-04T10:00:00Z' },

  // Crestwood College
  { id: 'sr-018', schoolId: 'sp-009', schoolName: 'Crestwood College of Nursing', programType: 'BSN', rotationName: 'MedStar Rehab Network – Spring 2027', location: 'MedStar National Rehabilitation Network', startDate: '2027-01-15', endDate: '2027-05-15', slotsRequested: 8, status: 'Pending', submittedAt: '2026-06-14T09:00:00Z' },

  // Northern Allied Health
  { id: 'sr-019', schoolId: 'sp-010', schoolName: 'Northern Allied Health Institute', programType: 'Respiratory Therapy', rotationName: 'MedStar ICU – Spring 2027', location: 'MedStar Washington Hospital Center – ICU', startDate: '2027-01-10', endDate: '2027-04-30', slotsRequested: 6, status: 'Pending', submittedAt: '2026-06-16T10:30:00Z' },

  // Horizon Graduate School
  { id: 'sr-020', schoolId: 'sp-011', schoolName: 'Horizon Graduate School of Health Sciences', programType: 'DNP', rotationName: 'MedStar Harbor Cardiology – Spring 2027', location: 'MedStar Harbor Hospital – Cardiology', startDate: '2027-01-15', endDate: '2027-05-01', slotsRequested: 4, status: 'Pending', submittedAt: '2026-06-13T11:00:00Z' },
  { id: 'sr-021', schoolId: 'sp-011', schoolName: 'Horizon Graduate School of Health Sciences', programType: 'MOT', rotationName: 'ATI OT Bethesda – Fall 2026', location: 'ATI Physical Therapy – Bethesda', startDate: '2026-09-01', endDate: '2026-12-20', slotsRequested: 6, status: 'Approved', submittedAt: '2026-05-19T08:00:00Z' },

  // Chesapeake PT
  { id: 'sr-022', schoolId: 'sp-012', schoolName: 'Chesapeake School of Physical Therapy', programType: 'DPT', rotationName: 'ATI PT Rockville – Spring 2027', location: 'ATI Physical Therapy – Rockville', startDate: '2027-01-10', endDate: '2027-04-30', slotsRequested: 8, status: 'Pending', submittedAt: '2026-06-17T09:00:00Z' },
];

// ── Loop-generated rows ────────────────────────────────────────────────────────
const LOOP_SCHOOLS = [
  { id: 'sp-001', name: 'Bowie State University',     type: 'BSN' },
  { id: 'sp-002', name: 'Baylor University',            type: 'MOT' },
  { id: 'sp-003', name: 'Eastwood State University',  type: 'BSN' },
  { id: 'sp-004', name: 'Capitol Nursing College',   type: 'BSN' },
  { id: 'sp-005', name: 'Harrington School of Allied Health',     type: 'Respiratory Therapy' },
];
const LOOP_ROTATIONS = [
  'MedStar ICU Rotation', 'MedStar NICU Rotation', 'MedStar ED Rotation',
  'ATI Physical Therapy Rotation', 'Hendrick Med/Surg Rotation',
];
const LOOP_LOCATIONS = [
  'MedStar Washington Hospital Center – ICU',
  'MedStar Georgetown University Hospital – NICU',
  'MedStar Washington Hospital Center – ED',
  'ATI Physical Therapy – Rockville',
  'Hendrick Medical Center – Med/Surg',
];
const LOOP_STATUSES: SlotRequestStatus[] = ['Pending', 'Pending', 'Pending', 'Approved', 'Declined'];

(function seedLoopSlotRequests() {
  for (let i = 0; i < 20; i++) {
    const sc = LOOP_SCHOOLS[i % LOOP_SCHOOLS.length];
    const year = i < 10 ? 2027 : 2026;
    const month = String(1 + (i % 12)).padStart(2, '0');
    mockSlotRequests.push({
      id: `sr-${String(100 + i).padStart(3, '0')}`,
      schoolId: sc.id,
      schoolName: sc.name,
      programType: sc.type,
      rotationName: `${LOOP_ROTATIONS[i % LOOP_ROTATIONS.length]} – ${year}`,
      location: LOOP_LOCATIONS[i % LOOP_LOCATIONS.length],
      startDate: `${year}-${month}-01`,
      endDate: `${year}-${String(Number(month) + 3 > 12 ? 1 : Number(month) + 3).padStart(2, '0')}-30`,
      slotsRequested: 4 + (i % 8) * 2,
      status: LOOP_STATUSES[i % LOOP_STATUSES.length],
      submittedAt: `2026-0${5 + (i % 2)}-${String(1 + (i % 28)).padStart(2, '0')}T10:00:00Z`,
    });
  }
})();

// ── Experience type — Group for larger slot requests, Individual otherwise ──────
(function enrichExperienceType() {
  mockSlotRequests.forEach((r) => {
    r.experienceType = r.slotsRequested > 10 ? 'Group' : 'Individual';
  });
})();
