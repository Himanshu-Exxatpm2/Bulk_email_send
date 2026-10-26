/**
 * Network Admin dashboard KPIs, filters, and chart series definitions.
 * // TODO(pm-feedback): chart series & KPI copy are concept mocks
 */

export interface NetworkKpiTile {
  id: string;
  label: string;
  primaryValue: string;
  primaryLabel: string;
  secondaryValue: string;
  secondaryLabel: string;
  tertiaryValue?: string;
  tertiaryLabel?: string;
  icon:
    | 'hospital'
    | 'school'
    | 'fileUser'
    | 'userGroup'
    | 'clipboardCheck'
    | 'checkToSlot'
    | 'building'
    | 'graduationCap'
    | 'calendar'
    | 'users'
    | 'check'
    | 'clock';
}

export interface AcademicYearOption {
  id: string;
  label: string;
  /** Compact trigger label for CY dropdown, e.g. "2026" */
  shortYear: string;
}

export interface ChartSeriesPoint {
  name: string;
  [key: string]: string | number;
}

export interface NamedValue {
  name: string;
  value: number;
}

export interface EquityPoint {
  school: string;
  slotAllocation: number;
  studentShare: number;
}

export interface UpcomingPlacementPoint {
  period: string;
  nursing: number;
  allied: number;
  medical: number;
  other: number;
}

export interface YtdStat {
  id: string;
  label: string;
  value: string;
}

export const networkDashboardCopy = {
  title: 'Consortium Dashboard',
  subtitlePrefix: 'Placement operations across the',
  subtitleSuffix: 'nursing network.',
  contextChipTemplate: '{fullName} · {region}',
  exportLabel: 'Export .Pdf',
  addFilters: '+ Add Filters',
  roleAdmin: 'Admin (OAC)',
  roleMember: 'Member',
} as const;

export const academicYearOptions: AcademicYearOption[] = [
  { id: 'cy-2026-27', label: '2026-27', shortYear: '2026' },
  { id: 'cy-2025-26', label: '2025-26', shortYear: '2025' },
];

export const networkKpiTiles: NetworkKpiTile[] = [
  {
    id: 'clinical-sites',
    label: 'MEMBER CLINICAL SITES / LOCATIONS',
    primaryValue: '12',
    primaryLabel: 'Active sites',
    secondaryValue: '71',
    secondaryLabel: 'Total individual locations',
    icon: 'hospital',
  },
  {
    id: 'member-schools',
    label: 'MEMBER SCHOOLS',
    primaryValue: '8',
    primaryLabel: 'Active schools',
    secondaryValue: '28',
    secondaryLabel: 'Total programs',
    icon: 'school',
  },
  {
    id: 'availabilities',
    label: 'ACTIVE AVAILABILITIES / TOTAL',
    primaryValue: '1,386',
    primaryLabel: 'Currently active',
    secondaryValue: '3028',
    secondaryLabel: 'Total posted this CY',
    icon: 'fileUser',
  },
  {
    id: 'placements',
    label: 'ACTIVE PLACEMENTS / TOTAL',
    primaryValue: '1,386',
    primaryLabel: 'Ongoing this semester',
    secondaryValue: '302',
    secondaryLabel: 'Unique students',
    tertiaryValue: '3028',
    tertiaryLabel: 'Total this CY',
    icon: 'userGroup',
  },
  {
    id: 'approval-rate',
    label: 'REQUEST APPROVAL RATE / AVG TIME',
    primaryValue: '78%',
    primaryLabel: 'Approval rate',
    secondaryValue: '2.9d',
    secondaryLabel: 'Avg days to approve',
    icon: 'clipboardCheck',
  },
  {
    id: 'confirmation-rate',
    label: 'SLOT CONFIRMATION RATE / AVG TIME',
    primaryValue: '85%',
    primaryLabel: 'Confirmation rate',
    secondaryValue: '4.8d',
    secondaryLabel: 'Avg days to confirm',
    icon: 'checkToSlot',
  },
];

export const monthlyPlacementInflow: ChartSeriesPoint[] = [
  { name: "Aug '24", requests: 320, approvals: 280, placements: 240 },
  { name: "Sep '24", requests: 410, approvals: 360, placements: 310 },
  { name: "Oct '24", requests: 380, approvals: 340, placements: 295 },
  { name: "Nov '24", requests: 450, approvals: 400, placements: 350 },
  { name: "Dec '24", requests: 290, approvals: 260, placements: 220 },
  { name: "Jan '25", requests: 520, approvals: 470, placements: 410 },
  { name: "Feb '25", requests: 480, approvals: 440, placements: 390 },
  { name: "Mar '25", requests: 510, approvals: 460, placements: 420 },
  { name: "Apr '25", requests: 440, approvals: 400, placements: 360 },
  { name: "May '25", requests: 390, approvals: 350, placements: 310 },
];

export const placementsBySpecialty: NamedValue[] = [
  { name: 'Nursing - Med-Surg', value: 420 },
  { name: 'Nursing - ICU/Critical', value: 310 },
  { name: 'Nursing - Pediatrics', value: 180 },
  { name: 'Nursing - OB/L&D', value: 145 },
  { name: 'Allied Health - PT', value: 120 },
  { name: 'Allied Health - OT', value: 95 },
  { name: 'Medical Education', value: 80 },
];

export const upcomingPlacements: UpcomingPlacementPoint[] = [
  { period: 'Week 1', nursing: 48, allied: 22, medical: 12, other: 8 },
  { period: 'Week 2', nursing: 52, allied: 18, medical: 15, other: 10 },
  { period: 'Week 3', nursing: 40, allied: 25, medical: 10, other: 6 },
  { period: 'Week 4', nursing: 55, allied: 20, medical: 14, other: 9 },
];

export const upcomingPeriodOptions = [
  { id: '30d', label: '30d' },
  { id: '45d', label: '45d' },
  { id: '60d', label: '60d' },
] as const;

export const equityIndex: EquityPoint[] = [
  { school: 'UMSON', slotAllocation: 22, studentShare: 18 },
  { school: 'JHSON', slotAllocation: 18, studentShare: 20 },
  { school: 'CUA', slotAllocation: 14, studentShare: 12 },
  { school: 'Howard', slotAllocation: 12, studentShare: 15 },
  { school: 'GWU', slotAllocation: 16, studentShare: 14 },
  { school: 'UMB', slotAllocation: 10, studentShare: 11 },
];

export const cancellationReasons: NamedValue[] = [
  { name: 'Preceptor unavailable', value: 38 },
  { name: 'Census/capacity change', value: 29 },
  { name: 'Student withdrawal', value: 22 },
  { name: 'Compliance incomplete', value: 18 },
  { name: 'Schedule conflict', value: 14 },
];

export const ytdSummary: YtdStat[] = [
  { id: 'slots-posted', label: 'Total Availability Slots Posted', value: '3,028' },
  { id: 'avg-approval', label: 'Avg Request → Approval', value: '2.9 days' },
  { id: 'cancellation-rate', label: 'Cancellation Rate', value: '6.4%' },
  { id: 'compliance-rate', label: 'Compliance Clearance Rate', value: '91%' },
  { id: 'fill-rate', label: 'Slot Fill Rate', value: '88%' },
  { id: 'schools-active', label: 'Schools with Active Placements', value: '8 / 8' },
];

export const chartTitles = {
  monthlyInflow: 'Monthly Placement Inflow',
  bySpecialty: 'Placements by Specialty',
  upcoming: 'Upcoming Site Placements',
  equity: 'Equity Index',
  cancellations: 'Cancellation Reasons',
  ytd: 'YTD Summary — AY 2026-27',
} as const;
