/**
 * Site-admin dashboard content — hero, KPIs, charts, quick actions, activities.
 * Values mirror the Consortium Ideation frames (node 263:56 / 263:638).
 * Edit arrays here; the screen only maps over them.
 */

import kpiAvailabilitiesIcon from '../../assets/dashboard/kpi-availabilities.svg';
import kpiPendingIcon from '../../assets/dashboard/kpi-pending.svg';
import kpiOngoingIcon from '../../assets/dashboard/kpi-ongoing.svg';
import kpiUpcomingIcon from '../../assets/dashboard/kpi-upcoming.svg';
import qaCreateAvailabilityIcon from '../../assets/dashboard/qa-create-availability.svg';
import qaTrackAvailabilitiesIcon from '../../assets/dashboard/qa-track-availabilities.svg';
import qaSchoolRequestsIcon from '../../assets/dashboard/qa-school-requests.svg';
import qaSchedulesIcon from '../../assets/dashboard/qa-schedules.svg';
import qaReportsIcon from '../../assets/dashboard/qa-reports.svg';

export interface SiteKpiTile {
  id: string;
  label: string;
  value: string;
  subtext?: string;
  icon: string;
  href: string;
}

export interface SiteHeroCopy {
  badge: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaHref: string;
}

export interface SiteActivityItem {
  id: string;
  text: string;
  discipline?: string;
  location: string;
  updatedOn: string;
  updatedBy: string;
}

export interface SitePieSegment {
  name: string;
  value: number;
  /** Token key resolved to a CSS variable at render time */
  colorToken: 'positive-strong' | 'accent-500' | 'neutral-600' | 'warn-500';
}

export interface SiteQuickAction {
  id: string;
  label: string;
  description: string;
  icon: string;
  href: string;
}

export const siteHeroCopy: SiteHeroCopy = {
  badge: 'NEW',
  title: "Turn today's students into tomorrow's hires",
  subtitle: 'Post roles, connect instantly, and hire from your clinical pipeline',
  ctaLabel: 'Post Job',
  ctaHref: '/jobs',
};

export const siteKpiTiles: SiteKpiTile[] = [
  {
    id: 'open-availabilities',
    label: 'Open / Active Availabilities',
    value: '748',
    subtext: '137 unique locations',
    icon: kpiAvailabilitiesIcon,
    href: '/availability',
  },
  {
    id: 'pending-approvals',
    label: 'Requests Pending Approvals',
    value: '124',
    subtext: '5 unique schools',
    icon: kpiPendingIcon,
    href: '/slot-requests',
  },
  {
    id: 'ongoing-schedules',
    label: 'Ongoing Schedules (Confirmed)',
    value: '27',
    icon: kpiOngoingIcon,
    href: '/schedules',
  },
  {
    id: 'upcoming-schedules',
    label: 'Upcoming Schedules (in the next 6 months)',
    value: '9',
    icon: kpiUpcomingIcon,
    href: '/schedules',
  },
];

export const siteSchedulesOverview: SitePieSegment[] = [
  { name: 'Confirmed', value: 1, colorToken: 'positive-strong' },
  { name: 'Not Confirmed', value: 1, colorToken: 'accent-500' },
  { name: 'To Be Scheduled', value: 4, colorToken: 'neutral-600' },
  { name: 'Cancelled', value: 0, colorToken: 'warn-500' },
];

export const siteOnboardingOverview: SitePieSegment[] = [
  { name: 'Compliant', value: 0, colorToken: 'positive-strong' },
  { name: 'Some action needed', value: 0, colorToken: 'warn-500' },
  { name: 'Not started', value: 1, colorToken: 'accent-500' },
];

export const siteRequestAging = {
  categories: ['< 7 days', '7 - 15 days', '15 - 30 days', '30+ days'],
  series: [
    { name: 'Review In Progress', colorToken: 'blue-500', data: [0, 0, 0, 16] },
    { name: 'Request Pending', colorToken: 'accent-500', data: [0, 0, 0, 107] },
  ],
  xAxisTitle: 'Time Period',
  yAxisTitle: 'Number of Requests',
} as const;

export const siteQuickActions: SiteQuickAction[] = [
  {
    id: 'create-availability',
    label: 'Create Availability',
    description: 'Post new availability slots',
    icon: qaCreateAvailabilityIcon,
    href: '/availability',
  },
  {
    id: 'track-availabilities',
    label: 'View & Track Availabilities',
    description: 'Monitor existing slots',
    icon: qaTrackAvailabilitiesIcon,
    href: '/availability',
  },
  {
    id: 'school-requests',
    label: 'School Requests',
    description: 'Manage placement requests',
    icon: qaSchoolRequestsIcon,
    href: '/slot-requests',
  },
  {
    id: 'schedules',
    label: 'Schedules',
    description: 'View upcoming schedules',
    icon: qaSchedulesIcon,
    href: '/schedules',
  },
  {
    id: 'reports',
    label: 'Reports',
    description: 'View detailed insights',
    icon: qaReportsIcon,
    href: '/reports',
  },
];

export const siteRecentActivities: SiteActivityItem[] = [
  {
    id: 'a1',
    text: 'Central City College confirmed schedule for May 1, 2026 - May 12, 2026. (Individual)',
    discipline: 'Audiology',
    location: '0011 test no phone no discipline',
    updatedOn: 'Jul 28, 2026',
    updatedBy: 'Mr Darp Dhameliya',
  },
  {
    id: 'a2',
    text: 'Schedule updated for Eastwood State University for Feb 25, 2026 - Apr 4, 2026. (Individual)',
    location: '004 Location_Automation_WGCWLC35290120263613',
    updatedOn: 'Jul 28, 2026',
    updatedBy: 'Mr Darp Dhameliya',
  },
  {
    id: 'a3',
    text: 'Schedule updated for Eastwood State University for Jul 28, 2025 - Aug 28, 2025. (Individual)',
    discipline: 'Physical Therapy +1',
    location: 'Ruchita - Johns Hopkins Hospital',
    updatedOn: 'Jul 28, 2026',
    updatedBy: 'Mr Darp Dhameliya',
  },
  {
    id: 'a4',
    text: 'Schedule updated for Eastwood State University for Jul 2, 2026 - Aug 1, 2026. (Group)',
    location: 'XYZ',
    updatedOn: 'Jul 28, 2026',
    updatedBy: 'Mr Darp Dhameliya',
  },
  {
    id: 'a5',
    text: 'Schedule updated for Eastwood State University for Oct 27, 2024 - Nov 1, 2024. (Individual)',
    location: 'Ruchita - ACMH - Hospital',
    updatedOn: 'Jul 28, 2026',
    updatedBy: 'Mr Darp Dhameliya',
  },
  {
    id: 'a6',
    text: 'Schedule updated for Eastwood State University for Jul 13, 2026 - Aug 1, 2026. (Individual)',
    location: 'XYZ',
    updatedOn: 'Jul 28, 2026',
    updatedBy: 'Exxat One',
  },
  {
    id: 'a7',
    text: 'Schedule updated for Eastwood State University for Jul 8, 2026 - Jul 31, 2026. (Group)',
    location: 'XYZ',
    updatedOn: 'Jul 28, 2026',
    updatedBy: 'Mr Darp Dhameliya',
  },
  {
    id: 'a8',
    text: 'Eastwood State University confirmed schedule for Feb 1, 2026 - Feb 28, 2026. (Individual)',
    discipline: 'Anesthesia Assistant',
    location: 'Concussion Management Unit',
    updatedOn: 'Jul 28, 2026',
    updatedBy: 'Mr Darp Dhameliya',
  },
  {
    id: 'a9',
    text: 'Eastwood State University confirmed schedule for Sep 17, 2024 - Sep 26, 2024. (Individual)',
    discipline: 'Medicine - MD +2',
    location: 'Ruchita - Exxat Demo - Location1',
    updatedOn: 'Jul 28, 2026',
    updatedBy: 'Mr Darp Dhameliya',
  },
  {
    id: 'a10',
    text: 'Schedule updated for ABC University - Nursing for Jul 28, 2026 - Aug 26, 2026. (Individual)',
    location: 'XYZ',
    updatedOn: 'Jul 27, 2026',
    updatedBy: 'Jordan Osman',
  },
];

export const siteSchedulePeriodOptions = [
  { id: 'next-30', label: 'Next 30 Days' },
  { id: 'all-upcoming', label: 'All Upcoming' },
] as const;

export const siteDashboardCopy = {
  greetingPrefix: 'Good afternoon',
  schedulesOverviewTitle: 'Upcoming Schedules Overview',
  schedulesChartTitle: 'Schedules Overview',
  schedulesChartSubtitle: 'Status of schedules.',
  onboardingChartTitle: 'Student Onboarding Overview',
  onboardingChartSubtitle: 'Status of onboarding requirements for confirmed schedules',
  requestAgingTitle: 'Request Aging Overview',
  requestAgingSubtitle: 'View how long requests have been open, segmented by time periods',
  quickActionsTitle: 'Quick Actions',
  recentActivitiesTitle: 'Recent Activities',
  viewLink: 'View',
} as const;
