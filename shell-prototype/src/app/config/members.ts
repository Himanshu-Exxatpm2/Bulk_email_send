/**
 * Members module mock data — Clinical Sites + Member Schools + profile modals.
 * Funnel volumes align to Requested → Approved → Confirmed → Onboarded for selected CY.
 * // TODO(pm-feedback): fields provisional until PM review
 */

export type MembersTabId = 'clinical-sites' | 'member-schools';
export type MemberStatus = 'Active' | 'Inactive';
export type MemberStatusFilter = 'all' | MemberStatus;

export type PerformanceFilterId =
  | 'all'
  | 'approval-gte-60'
  | 'approval-60-80'
  | 'confirmation-gte-60'
  | 'confirmation-60-80';

export interface MembersTab {
  id: MembersTabId;
  label: string;
}

export const membersTabs: MembersTab[] = [
  { id: 'clinical-sites', label: 'Clinical Sites' },
  { id: 'member-schools', label: 'Member Schools' },
];

export const membersPageCopy = {
  searchPlaceholder: 'Search',
  exportPdf: 'Export .Pdf',
} as const;

export const performanceFilterOptions: {
  id: PerformanceFilterId;
  label: string;
}[] = [
  { id: 'all', label: 'All' },
  { id: 'approval-gte-60', label: 'Approval ≥ 60%' },
  { id: 'approval-60-80', label: 'Approval 60–80%' },
  { id: 'confirmation-gte-60', label: 'Confirmation ≥ 60%' },
  { id: 'confirmation-60-80', label: 'Confirmation 60–80%' },
];

export interface ClinicalSiteRow {
  id: string;
  name: string;
  system: string;
  type: string;
  location: string;
  availabilities: number;
  requested: number;
  approved: number;
  confirmed: number;
  onboarded: number;
  uniqueStudents: number;
  approvalPct: number;
  confirmationPct: number;
  confirmationRate: string;
  status: MemberStatus;
  email: string;
  phone: string;
  website: string;
  address: string;
  about: string;
  partners: string[];
  metrics: {
    totalPlacements: string;
    requestsReceived: string;
    requestsApproved: string;
    responseRate: string;
    waitlisted: string;
    avgApprTime: string;
    disciplines: string;
    upcoming: string;
    ongoing: string;
    completed: string;
  };
}

export interface MemberSchoolRow {
  id: string;
  name: string;
  type: string;
  location: string;
  disciplines: string;
  requested: number;
  approved: number;
  confirmed: number;
  onboarded: number;
  uniqueStudents: number;
  approvalPct: number;
  confirmationPct: number;
  confirmationRate: string;
  status: MemberStatus;
  email: string;
  phone: string;
  website: string;
  address: string;
  about: string;
  partners: string[];
  metrics: {
    requestsMade: string;
    requestsApproved: string;
    approvalRate: string;
    avgApprTime: string;
    sequenceSlots: string;
    availabilityRate: string;
    confirmationRate: string;
    upcoming: string;
    ongoing: string;
    total: string;
  };
}

export function matchesPerformanceFilter(
  approvalPct: number,
  confirmationPct: number,
  filter: PerformanceFilterId,
): boolean {
  switch (filter) {
    case 'all':
      return true;
    case 'approval-gte-60':
      return approvalPct >= 60;
    case 'approval-60-80':
      return approvalPct >= 60 && approvalPct <= 80;
    case 'confirmation-gte-60':
      return confirmationPct >= 60;
    case 'confirmation-60-80':
      return confirmationPct >= 60 && confirmationPct <= 80;
    default:
      return true;
  }
}

export const clinicalSiteRows: ClinicalSiteRow[] = [
  {
    id: 'cs1',
    name: 'Johns Hopkins Hospital',
    system: 'Johns Hopkins Medicine',
    type: 'Academic Medical Center',
    location: 'Baltimore, MD',
    availabilities: 186,
    requested: 464,
    approved: 420,
    confirmed: 354,
    onboarded: 312,
    uniqueStudents: 302,
    approvalPct: 92,
    confirmationPct: 88,
    confirmationRate: '88% · 312/354',
    status: 'Active',
    email: 'clinical.education@jhmi.edu',
    phone: '(410) 955-5000',
    website: 'hopkinsmedicine.org',
    address: '1800 Orleans St, Baltimore, MD 21287',
    about:
      'Flagship academic medical center hosting nursing and allied health placements across ICU, med-surg, pediatrics, and OB units.',
    partners: ['Med-Surg', 'ICU', 'Pediatrics', 'OB/L&D', 'ED', 'Oncology'],
    metrics: {
      totalPlacements: '1,248',
      requestsReceived: '464',
      requestsApproved: '420',
      responseRate: '96%',
      waitlisted: '18',
      avgApprTime: '2.4d',
      disciplines: '6',
      upcoming: '48',
      ongoing: '312',
      completed: '1,058',
    },
  },
  {
    id: 'cs2',
    name: 'MedStar Georgetown',
    system: 'MedStar Health',
    type: 'Tertiary Care',
    location: 'Washington, DC',
    availabilities: 98,
    requested: 248,
    approved: 210,
    confirmed: 182,
    onboarded: 148,
    uniqueStudents: 142,
    approvalPct: 85,
    confirmationPct: 81,
    confirmationRate: '81% · 148/182',
    status: 'Active',
    email: 'students@medstar.net',
    phone: '(202) 444-2000',
    website: 'medstargeorgetown.org',
    address: '3800 Reservoir Rd NW, Washington, DC 20007',
    about: 'Urban tertiary campus with strong nursing and therapy placement capacity.',
    partners: ['Med-Surg', 'ICU', 'Rehab', 'Cardiology'],
    metrics: {
      totalPlacements: '612',
      requestsReceived: '248',
      requestsApproved: '210',
      responseRate: '91%',
      waitlisted: '12',
      avgApprTime: '3.1d',
      disciplines: '4',
      upcoming: '22',
      ongoing: '148',
      completed: '514',
    },
  },
  {
    id: 'cs3',
    name: 'Inova Fairfax Medical Campus',
    system: 'Inova Health',
    type: 'Academic Medical Center',
    location: 'Falls Church, VA',
    availabilities: 124,
    requested: 310,
    approved: 280,
    confirmed: 244,
    onboarded: 210,
    uniqueStudents: 196,
    approvalPct: 90,
    confirmationPct: 86,
    confirmationRate: '86% · 210/244',
    status: 'Active',
    email: 'clinicals@inova.org',
    phone: '(703) 776-4001',
    website: 'inova.org',
    address: '3300 Gallows Rd, Falls Church, VA 22042',
    about: 'Regional flagship with multi-specialty clinical education partnerships.',
    partners: ['ICU', 'Med-Surg', 'Trauma', 'Pediatrics'],
    metrics: {
      totalPlacements: '890',
      requestsReceived: '310',
      requestsApproved: '280',
      responseRate: '94%',
      waitlisted: '9',
      avgApprTime: '2.8d',
      disciplines: '5',
      upcoming: '31',
      ongoing: '210',
      completed: '758',
    },
  },
  {
    id: 'cs4',
    name: "Children's National Hospital",
    system: "Children's National",
    type: 'Pediatric Specialty',
    location: 'Washington, DC',
    availabilities: 67,
    requested: 168,
    approved: 140,
    confirmed: 124,
    onboarded: 98,
    uniqueStudents: 94,
    approvalPct: 83,
    confirmationPct: 79,
    confirmationRate: '79% · 98/124',
    status: 'Active',
    email: 'education@childrensnational.org',
    phone: '(202) 476-5000',
    website: 'childrensnational.org',
    address: '111 Michigan Ave NW, Washington, DC 20010',
    about: 'Pediatric specialty hospital supporting nursing and allied pediatric rotations.',
    partners: ['Pediatrics', 'NICU', 'PICU', 'ED'],
    metrics: {
      totalPlacements: '402',
      requestsReceived: '168',
      requestsApproved: '140',
      responseRate: '89%',
      waitlisted: '14',
      avgApprTime: '3.6d',
      disciplines: '4',
      upcoming: '16',
      ongoing: '98',
      completed: '332',
    },
  },
  {
    id: 'cs5',
    name: 'UMMC Midtown Campus',
    system: 'University of Maryland Medical System',
    type: 'Community Hospital',
    location: 'Baltimore, MD',
    availabilities: 22,
    requested: 72,
    approved: 48,
    confirmed: 46,
    onboarded: 28,
    uniqueStudents: 26,
    approvalPct: 67,
    confirmationPct: 61,
    confirmationRate: '61% · 28/46',
    status: 'Inactive',
    email: 'placements@umm.edu',
    phone: '(410) 225-8000',
    website: 'umms.org',
    address: '827 Linden Ave, Baltimore, MD 21201',
    about: 'Community campus with constrained preceptor bandwidth this cycle.',
    partners: ['Med-Surg', 'Behavioral Health'],
    metrics: {
      totalPlacements: '118',
      requestsReceived: '72',
      requestsApproved: '48',
      responseRate: '74%',
      waitlisted: '21',
      avgApprTime: '5.2d',
      disciplines: '2',
      upcoming: '4',
      ongoing: '28',
      completed: '106',
    },
  },
  {
    id: 'cs6',
    name: 'Sibley Memorial Hospital',
    system: 'Johns Hopkins Medicine',
    type: 'Community Hospital',
    location: 'Washington, DC',
    availabilities: 41,
    requested: 102,
    approved: 88,
    confirmed: 78,
    onboarded: 64,
    uniqueStudents: 61,
    approvalPct: 86,
    confirmationPct: 82,
    confirmationRate: '82% · 64/78',
    status: 'Active',
    email: 'clinicals@sibley.org',
    phone: '(202) 537-4000',
    website: 'hopkinsmedicine.org/sibley',
    address: '5255 Loughboro Rd NW, Washington, DC 20016',
    about: 'Community hospital with steady nursing placement demand.',
    partners: ['Med-Surg', 'OB', 'Ortho'],
    metrics: {
      totalPlacements: '276',
      requestsReceived: '102',
      requestsApproved: '88',
      responseRate: '92%',
      waitlisted: '6',
      avgApprTime: '2.9d',
      disciplines: '3',
      upcoming: '11',
      ongoing: '64',
      completed: '232',
    },
  },
  {
    id: 'cs7',
    name: 'Holy Cross Hospital',
    system: 'Trinity Health',
    type: 'Community Hospital',
    location: 'Silver Spring, MD',
    availabilities: 0,
    requested: 40,
    approved: 12,
    confirmed: 28,
    onboarded: 6,
    uniqueStudents: 6,
    approvalPct: 30,
    confirmationPct: 22,
    confirmationRate: '22% · 6/28',
    status: 'Inactive',
    email: 'education@holycrosshealth.org',
    phone: '(301) 754-7000',
    website: 'holycrosshealth.org',
    address: '1500 Forest Glen Rd, Silver Spring, MD 20910',
    about: 'Temporarily limited capacity pending staffing recovery.',
    partners: ['Med-Surg'],
    metrics: {
      totalPlacements: '54',
      requestsReceived: '40',
      requestsApproved: '12',
      responseRate: '58%',
      waitlisted: '19',
      avgApprTime: '7.1d',
      disciplines: '1',
      upcoming: '0',
      ongoing: '6',
      completed: '54',
    },
  },
  {
    id: 'cs8',
    name: 'Anne Arundel Medical Center',
    system: 'Luminis Health',
    type: 'Regional Medical Center',
    location: 'Annapolis, MD',
    availabilities: 73,
    requested: 178,
    approved: 156,
    confirmed: 140,
    onboarded: 118,
    uniqueStudents: 112,
    approvalPct: 88,
    confirmationPct: 84,
    confirmationRate: '84% · 118/140',
    status: 'Active',
    email: 'students@aahs.org',
    phone: '(443) 481-1000',
    website: 'luminishealth.org',
    address: '2001 Medical Pkwy, Annapolis, MD 21401',
    about: 'Regional medical center with broad nursing specialty coverage.',
    partners: ['Med-Surg', 'ICU', 'ED', 'OB'],
    metrics: {
      totalPlacements: '498',
      requestsReceived: '178',
      requestsApproved: '156',
      responseRate: '93%',
      waitlisted: '8',
      avgApprTime: '2.7d',
      disciplines: '4',
      upcoming: '19',
      ongoing: '118',
      completed: '421',
    },
  },
];

export const memberSchoolRows: MemberSchoolRow[] = [
  {
    id: 'ms1',
    name: 'University of Maryland School of Nursing',
    type: 'Public University',
    location: 'Baltimore, MD',
    disciplines: 'BSN, MSN, DNP',
    requested: 340,
    approved: 312,
    confirmed: 278,
    onboarded: 248,
    uniqueStudents: 248,
    approvalPct: 92,
    confirmationPct: 89,
    confirmationRate: '89% · 248/278',
    status: 'Active',
    email: 'placements@umaryland.edu',
    phone: '(410) 706-6109',
    website: 'nursing.umaryland.edu',
    address: '655 W Lombard St, Baltimore, MD 21201',
    about: 'Largest consortium nursing school with multi-degree clinical pathways.',
    partners: ['Johns Hopkins Hospital', 'UMMC Midtown', 'Inova Fairfax'],
    metrics: {
      requestsMade: '340',
      requestsApproved: '312',
      approvalRate: '92%',
      avgApprTime: '2.6d',
      sequenceSlots: '186 / 210',
      availabilityRate: '88%',
      confirmationRate: '89%',
      upcoming: '42',
      ongoing: '248',
      total: '1,860',
    },
  },
  {
    id: 'ms2',
    name: 'Johns Hopkins School of Nursing',
    type: 'Private University',
    location: 'Baltimore, MD',
    disciplines: 'BSN, MSN, DNP, PhD',
    requested: 300,
    approved: 278,
    confirmed: 246,
    onboarded: 221,
    uniqueStudents: 221,
    approvalPct: 93,
    confirmationPct: 90,
    confirmationRate: '90% · 221/246',
    status: 'Active',
    email: 'clinicals@jhu.edu',
    phone: '(410) 955-4766',
    website: 'nursing.jhu.edu',
    address: '525 N Wolfe St, Baltimore, MD 21205',
    about: 'Research-intensive nursing school with high placement confirmation rates.',
    partners: ['Johns Hopkins Hospital', 'Sibley Memorial'],
    metrics: {
      requestsMade: '300',
      requestsApproved: '278',
      approvalRate: '93%',
      avgApprTime: '2.2d',
      sequenceSlots: '164 / 180',
      availabilityRate: '91%',
      confirmationRate: '90%',
      upcoming: '36',
      ongoing: '221',
      total: '1,640',
    },
  },
  {
    id: 'ms3',
    name: 'Catholic University of America',
    type: 'Private University',
    location: 'Washington, DC',
    disciplines: 'BSN, MSN',
    requested: 110,
    approved: 94,
    confirmed: 89,
    onboarded: 71,
    uniqueStudents: 71,
    approvalPct: 85,
    confirmationPct: 80,
    confirmationRate: '80% · 71/89',
    status: 'Active',
    email: 'nursing@cua.edu',
    phone: '(202) 319-5400',
    website: 'nursing.catholic.edu',
    address: '620 Michigan Ave NE, Washington, DC 20064',
    about: 'Private university nursing programs serving DC-area clinical partners.',
    partners: ['MedStar Georgetown', "Children's National"],
    metrics: {
      requestsMade: '110',
      requestsApproved: '94',
      approvalRate: '85%',
      avgApprTime: '3.4d',
      sequenceSlots: '52 / 64',
      availabilityRate: '81%',
      confirmationRate: '80%',
      upcoming: '14',
      ongoing: '71',
      total: '520',
    },
  },
  {
    id: 'ms4',
    name: 'Howard University College of Nursing',
    type: 'Private University',
    location: 'Washington, DC',
    disciplines: 'BSN, MSN, DNP',
    requested: 178,
    approved: 156,
    confirmed: 142,
    onboarded: 119,
    uniqueStudents: 119,
    approvalPct: 88,
    confirmationPct: 84,
    confirmationRate: '84% · 119/142',
    status: 'Active',
    email: 'nursing@howard.edu',
    phone: '(202) 806-7456',
    website: 'nursing.howard.edu',
    address: '2400 6th St NW, Washington, DC 20059',
    about: 'HBCU nursing college with strong DC hospital partnerships.',
    partners: ['Howard University Hospital', 'MedStar Georgetown'],
    metrics: {
      requestsMade: '178',
      requestsApproved: '156',
      approvalRate: '88%',
      avgApprTime: '3.0d',
      sequenceSlots: '88 / 102',
      availabilityRate: '86%',
      confirmationRate: '84%',
      upcoming: '21',
      ongoing: '119',
      total: '890',
    },
  },
  {
    id: 'ms5',
    name: 'George Washington University',
    type: 'Private University',
    location: 'Washington, DC',
    disciplines: 'BSN, MSN, DNP',
    requested: 210,
    approved: 188,
    confirmed: 165,
    onboarded: 142,
    uniqueStudents: 142,
    approvalPct: 90,
    confirmationPct: 86,
    confirmationRate: '86% · 142/165',
    status: 'Active',
    email: 'nursing@gwu.edu',
    phone: '(202) 994-7901',
    website: 'nursing.gwu.edu',
    address: '1919 Pennsylvania Ave NW, Washington, DC 20006',
    about: 'Urban university nursing school with consortium-wide clinical demand.',
    partners: ['Inova Fairfax', 'Sibley Memorial'],
    metrics: {
      requestsMade: '210',
      requestsApproved: '188',
      approvalRate: '90%',
      avgApprTime: '2.8d',
      sequenceSlots: '104 / 120',
      availabilityRate: '87%',
      confirmationRate: '86%',
      upcoming: '28',
      ongoing: '142',
      total: '1,120',
    },
  },
  {
    id: 'ms6',
    name: 'Bowie State University',
    type: 'Public University',
    location: 'Bowie, MD',
    disciplines: 'BSN, MSN',
    requested: 68,
    approved: 41,
    confirmed: 25,
    onboarded: 12,
    uniqueStudents: 12,
    approvalPct: 60,
    confirmationPct: 48,
    confirmationRate: '48% · 12/25',
    status: 'Inactive',
    email: 'nursing@bowiestate.edu',
    phone: '(301) 860-3200',
    website: 'bowiestate.edu',
    address: '14000 Jericho Park Rd, Bowie, MD 20715',
    about: 'Growing program with placement conversion challenges this CY.',
    partners: ['Anne Arundel Medical Center'],
    metrics: {
      requestsMade: '68',
      requestsApproved: '41',
      approvalRate: '60%',
      avgApprTime: '5.4d',
      sequenceSlots: '18 / 40',
      availabilityRate: '45%',
      confirmationRate: '48%',
      upcoming: '5',
      ongoing: '12',
      total: '210',
    },
  },
  {
    id: 'ms7',
    name: 'Towson University',
    type: 'Public University',
    location: 'Towson, MD',
    disciplines: 'BSN, MSN',
    requested: 142,
    approved: 127,
    confirmed: 115,
    onboarded: 98,
    uniqueStudents: 98,
    approvalPct: 89,
    confirmationPct: 85,
    confirmationRate: '85% · 98/115',
    status: 'Active',
    email: 'nursing@towson.edu',
    phone: '(410) 704-2067',
    website: 'towson.edu/nursing',
    address: '8000 York Rd, Towson, MD 21252',
    about: 'Public university nursing programs with strong Maryland site coverage.',
    partners: ['UMMC Midtown', 'Anne Arundel Medical Center'],
    metrics: {
      requestsMade: '142',
      requestsApproved: '127',
      approvalRate: '89%',
      avgApprTime: '2.9d',
      sequenceSlots: '72 / 84',
      availabilityRate: '86%',
      confirmationRate: '85%',
      upcoming: '18',
      ongoing: '98',
      total: '740',
    },
  },
  {
    id: 'ms8',
    name: 'Coppin State University',
    type: 'Public University',
    location: 'Baltimore, MD',
    disciplines: 'BSN',
    requested: 22,
    approved: 0,
    confirmed: 0,
    onboarded: 0,
    uniqueStudents: 0,
    approvalPct: 0,
    confirmationPct: 0,
    confirmationRate: '0% · 0/0',
    status: 'Inactive',
    email: 'nursing@coppin.edu',
    phone: '(410) 951-3000',
    website: 'coppin.edu',
    address: '2500 W North Ave, Baltimore, MD 21216',
    about: 'Currently inactive in placement flow pending program restart.',
    partners: [],
    metrics: {
      requestsMade: '22',
      requestsApproved: '0',
      approvalRate: '0%',
      avgApprTime: '—',
      sequenceSlots: '0 / 12',
      availabilityRate: '0%',
      confirmationRate: '0%',
      upcoming: '0',
      ongoing: '0',
      total: '86',
    },
  },
];
