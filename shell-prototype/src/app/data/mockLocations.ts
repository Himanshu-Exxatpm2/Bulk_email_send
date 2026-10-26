// Clinical site locations — anchored to MedStar Health (primary tenant).
export const KPI_ACTIVE_SCHEDULES = 792;

export type LocationStatus = 'Active' | 'Inactive' | 'Under Review';

export interface LocationDiscipline {
  name: string;
  specialties: string[];
}

export interface ClinicalLocation {
  id: string;
  name: string;           // matches location field in mockAvailabilities
  locationGroup: string;  // matches locationGroup field in mockAvailabilities
  hospitalName: string;   // also surfaced as "Parent" on the About tab
  department: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  activeAvailabilities: number;
  activeSchedules: number;
  status: LocationStatus;
  // ── About tab enrichment (derived below — see enrichLocationsAboutFields) ──
  aliasName?: string;
  phone?: string;
  description?: string;
  disciplines?: LocationDiscipline[];
}

// Hand-written representative rows — MedStar (primary), ATI, Hendrick.
export const mockLocations: ClinicalLocation[] = [
  // ── MedStar Washington Hospital Center ──────────────────────────────────
  {
    id: 'loc-001',
    name: 'MedStar Washington Hospital Center – ICU',
    locationGroup: 'MedStar DC Metro',
    hospitalName: 'MedStar Health',
    department: 'Intensive Care Unit',
    address: '110 Irving St NW',
    city: 'Washington',
    state: 'DC',
    zip: '20010',
    activeAvailabilities: 18,
    activeSchedules: 72,
    status: 'Active',
  },
  {
    id: 'loc-002',
    name: 'MedStar Washington Hospital Center – ED',
    locationGroup: 'MedStar DC Metro',
    hospitalName: 'MedStar Health',
    department: 'Emergency Department',
    address: '110 Irving St NW',
    city: 'Washington',
    state: 'DC',
    zip: '20010',
    activeAvailabilities: 12,
    activeSchedules: 48,
    status: 'Active',
  },
  {
    id: 'loc-003',
    name: 'MedStar Washington Hospital Center – Radiology',
    locationGroup: 'MedStar DC Metro',
    hospitalName: 'MedStar Health',
    department: 'Radiology',
    address: '110 Irving St NW',
    city: 'Washington',
    state: 'DC',
    zip: '20010',
    activeAvailabilities: 8,
    activeSchedules: 24,
    status: 'Active',
  },
  {
    id: 'loc-004',
    name: 'MedStar Washington Hospital Center – OT',
    locationGroup: 'MedStar DC Metro',
    hospitalName: 'MedStar Health',
    department: 'Occupational Therapy',
    address: '110 Irving St NW',
    city: 'Washington',
    state: 'DC',
    zip: '20010',
    activeAvailabilities: 6,
    activeSchedules: 18,
    status: 'Active',
  },
  {
    id: 'loc-005',
    name: 'MedStar Washington Hospital Center – Pharmacy',
    locationGroup: 'MedStar DC Metro',
    hospitalName: 'MedStar Health',
    department: 'Pharmacy',
    address: '110 Irving St NW',
    city: 'Washington',
    state: 'DC',
    zip: '20010',
    activeAvailabilities: 4,
    activeSchedules: 12,
    status: 'Active',
  },

  // ── MedStar Georgetown University Hospital ───────────────────────────────
  {
    id: 'loc-006',
    name: 'MedStar Georgetown University Hospital – NICU',
    locationGroup: 'MedStar DC Metro',
    hospitalName: 'MedStar Health',
    department: 'Neonatal Intensive Care Unit',
    address: '3800 Reservoir Rd NW',
    city: 'Washington',
    state: 'DC',
    zip: '20007',
    activeAvailabilities: 10,
    activeSchedules: 36,
    status: 'Active',
  },
  {
    id: 'loc-007',
    name: 'MedStar Georgetown University Hospital – Pharmacy',
    locationGroup: 'MedStar DC Metro',
    hospitalName: 'MedStar Health',
    department: 'Pharmacy',
    address: '3800 Reservoir Rd NW',
    city: 'Washington',
    state: 'DC',
    zip: '20007',
    activeAvailabilities: 5,
    activeSchedules: 16,
    status: 'Active',
  },

  // ── MedStar National Rehabilitation Network ──────────────────────────────
  {
    id: 'loc-008',
    name: 'MedStar National Rehabilitation Network',
    locationGroup: 'MedStar DC Metro',
    hospitalName: 'MedStar Health',
    department: 'Physical Therapy',
    address: '102 Irving St NW',
    city: 'Washington',
    state: 'DC',
    zip: '20010',
    activeAvailabilities: 9,
    activeSchedules: 31,
    status: 'Active',
  },

  // ── MedStar Montgomery Medical Center ───────────────────────────────────
  {
    id: 'loc-009',
    name: 'MedStar Montgomery Medical Center – Med/Surg',
    locationGroup: 'MedStar DC Metro',
    hospitalName: 'MedStar Health',
    department: 'Medical/Surgical',
    address: '18101 Prince Philip Dr',
    city: 'Olney',
    state: 'MD',
    zip: '20832',
    activeAvailabilities: 14,
    activeSchedules: 55,
    status: 'Active',
  },
  {
    id: 'loc-010',
    name: 'MedStar Montgomery Medical Center – Oncology',
    locationGroup: 'MedStar DC Metro',
    hospitalName: 'MedStar Health',
    department: 'Oncology',
    address: '18101 Prince Philip Dr',
    city: 'Olney',
    state: 'MD',
    zip: '20832',
    activeAvailabilities: 5,
    activeSchedules: 20,
    status: 'Active',
  },

  // ── MedStar Harbor Hospital ──────────────────────────────────────────────
  {
    id: 'loc-011',
    name: 'MedStar Harbor Hospital – Cardiology',
    locationGroup: 'MedStar DC Metro',
    hospitalName: 'MedStar Health',
    department: 'Cardiology',
    address: '3001 S Hanover St',
    city: 'Baltimore',
    state: 'MD',
    zip: '21225',
    activeAvailabilities: 7,
    activeSchedules: 28,
    status: 'Active',
  },

  // ── ATI Physical Therapy ─────────────────────────────────────────────────
  {
    id: 'loc-012',
    name: 'ATI Physical Therapy – Rockville',
    locationGroup: 'ATI Mid-Atlantic',
    hospitalName: 'ATI Physical Therapy',
    department: 'Physical Therapy',
    address: '1130 E Gude Dr',
    city: 'Rockville',
    state: 'MD',
    zip: '20850',
    activeAvailabilities: 16,
    activeSchedules: 62,
    status: 'Active',
  },
  {
    id: 'loc-013',
    name: 'ATI Physical Therapy – Bethesda',
    locationGroup: 'ATI Mid-Atlantic',
    hospitalName: 'ATI Physical Therapy',
    department: 'Occupational Therapy',
    address: '4800 Montgomery Ln',
    city: 'Bethesda',
    state: 'MD',
    zip: '20814',
    activeAvailabilities: 14,
    activeSchedules: 56,
    status: 'Active',
  },
  {
    id: 'loc-014',
    name: 'ATI Physical Therapy – Arlington',
    locationGroup: 'ATI Mid-Atlantic',
    hospitalName: 'ATI Physical Therapy',
    department: 'Speech-Language Pathology',
    address: '3101 N Fairfax Dr',
    city: 'Arlington',
    state: 'VA',
    zip: '22201',
    activeAvailabilities: 8,
    activeSchedules: 30,
    status: 'Active',
  },

  // ── Hendrick Medical Center ──────────────────────────────────────────────
  {
    id: 'loc-015',
    name: 'Hendrick Medical Center – Med/Surg',
    locationGroup: 'Hendrick West Texas',
    hospitalName: 'Hendrick Health',
    department: 'Medical/Surgical',
    address: '1900 Pine St',
    city: 'Abilene',
    state: 'TX',
    zip: '79601',
    activeAvailabilities: 20,
    activeSchedules: 80,
    status: 'Active',
  },
  {
    id: 'loc-016',
    name: 'Hendrick Medical Center – ICU',
    locationGroup: 'Hendrick West Texas',
    hospitalName: 'Hendrick Health',
    department: 'Intensive Care Unit',
    address: '1900 Pine St',
    city: 'Abilene',
    state: 'TX',
    zip: '79601',
    activeAvailabilities: 11,
    activeSchedules: 43,
    status: 'Active',
  },
  {
    id: 'loc-017',
    name: 'Hendrick Medical Center – Rehab',
    locationGroup: 'Hendrick West Texas',
    hospitalName: 'Hendrick Health',
    department: 'Rehabilitation Services',
    address: '1900 Pine St',
    city: 'Abilene',
    state: 'TX',
    zip: '79601',
    activeAvailabilities: 6,
    activeSchedules: 22,
    status: 'Inactive',
  },

  // ── Loop-generated additional MedStar DC Metro locations ─────────────────
  // Generated inline below to keep the file self-contained.
];

(function seedLoopLocations() {
  const depts = ['Neurology', 'Pediatrics', 'Women\'s Health', 'Behavioral Health', 'Lab Services'];
  const buildings = [
    'MedStar Union Memorial Hospital',
    'MedStar Good Samaritan Hospital',
    'MedStar Southern Maryland Hospital Center',
  ];
  const addresses = ['201 E University Pkwy', '5601 Loch Raven Blvd', '7503 Surratts Rd'];
  const cities = ['Baltimore', 'Baltimore', 'Clinton'];
  const zips = ['21218', '21239', '20735'];

  for (let i = 0; i < 8; i++) {
    const bIdx = i % buildings.length;
    const dIdx = i % depts.length;
    mockLocations.push({
      id: `loc-${String(100 + i).padStart(3, '0')}`,
      name: `${buildings[bIdx]} – ${depts[dIdx]}`,
      locationGroup: 'MedStar DC Metro',
      hospitalName: 'MedStar Health',
      department: depts[dIdx],
      address: addresses[bIdx],
      city: cities[bIdx],
      state: 'MD',
      zip: zips[bIdx],
      activeAvailabilities: 3 + (i % 5),
      activeSchedules: 10 + (i * 3),
      status: i % 8 === 7 ? 'Inactive' : 'Active',
    });
  }
})();

// ── About tab enrichment — alias, phone, description, disciplines ──────────────
const DISCIPLINES_BY_DEPT: Record<string, LocationDiscipline[]> = {
  'Intensive Care Unit': [
    { name: 'Nursing', specialties: ['Critical Care', 'Med-Surg', 'Trauma', 'Progressive Care', 'Step-Down'] },
    { name: 'Respiratory Therapy', specialties: ['Adult Critical Care'] },
  ],
  'Emergency Department': [
    { name: 'Nursing', specialties: ['Emergency/Trauma', 'Triage'] },
    { name: 'Physician Assistant', specialties: ['Emergency Medicine'] },
  ],
  'Radiology': [
    { name: 'Radiologic Technology', specialties: ['Diagnostic Imaging', 'CT', 'MRI'] },
  ],
  'Occupational Therapy': [
    { name: 'Occupational Therapy', specialties: ['Adult Rehabilitation', 'Hand Therapy'] },
  ],
  'Pharmacy': [
    { name: 'Pharmacy', specialties: ['Clinical Pharmacy', 'Sterile Compounding'] },
  ],
  'Neonatal Intensive Care Unit': [
    { name: 'Nursing', specialties: ['Neonatal Critical Care'] },
  ],
  'Physical Therapy': [
    { name: 'Physical Therapy', specialties: ['Orthopedics', 'Sports Rehabilitation'] },
  ],
  'Medical/Surgical': [
    { name: 'Nursing', specialties: ['Med-Surg', 'Post-Surgical Care'] },
  ],
  'Oncology': [
    { name: 'Nursing', specialties: ['Oncology', 'Infusion Therapy'] },
  ],
  'Cardiology': [
    { name: 'Nursing', specialties: ['Cardiac Care', 'Telemetry'] },
  ],
  'Rehabilitation Services': [
    { name: 'Physical Therapy', specialties: ['Inpatient Rehabilitation'] },
    { name: 'Occupational Therapy', specialties: ['Inpatient Rehabilitation'] },
  ],
  'Speech-Language Pathology': [
    { name: 'Speech-Language Pathology', specialties: ['Swallowing Disorders', 'Cognitive-Communication'] },
  ],
  'Neurology': [
    { name: 'Nursing', specialties: ['Neuro/Stroke Care'] },
  ],
  'Pediatrics': [
    { name: 'Nursing', specialties: ['Pediatric Acute Care'] },
  ],
  "Women's Health": [
    { name: 'Nursing', specialties: ['Labor & Delivery', 'Postpartum Care'] },
  ],
  'Behavioral Health': [
    { name: 'Mental Health Counseling', specialties: ['Inpatient Psychiatric Care'] },
  ],
  'Lab Services': [
    { name: 'Laboratory', specialties: ['Clinical Laboratory Science'] },
  ],
};
const DEFAULT_DISCIPLINES: LocationDiscipline[] = [{ name: 'Nursing', specialties: ['General Practice'] }];

const AREA_CODE_BY_STATE: Record<string, string> = { DC: '202', MD: '301', VA: '703', TX: '325' };

function deriveAlias(loc: ClinicalLocation): string {
  const parts = loc.name.split(' – ');
  if (parts.length > 1) return parts[1].trim();
  return loc.department
    .split(/[\s/]+/)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

(function enrichLocationsAboutFields() {
  mockLocations.forEach((loc, i) => {
    loc.aliasName = deriveAlias(loc);
    const areaCode = AREA_CODE_BY_STATE[loc.state] ?? '202';
    loc.phone = `(${areaCode}) 555-0${String(300 + i).padStart(3, '0')}`;
    loc.description = `${loc.department} at ${loc.hospitalName}, part of the ${loc.locationGroup} network.`;
    loc.disciplines = DISCIPLINES_BY_DEPT[loc.department] ?? DEFAULT_DISCIPLINES;
  });
})();
