/**
 * Site-admin sidebar navigation — edit here to reorder/rename/add items.
 * // TODO(pm-feedback): confirm final labels & grouping with PM
 */

export type SiteNavIcon =
  | 'home'
  | 'mapPin'
  | 'idCard'
  | 'clipboardUser'
  | 'handshake'
  | 'fileLines'
  | 'users'
  | 'graduationCap'
  | 'chartLine'
  | 'briefcase'
  | 'gear';

export interface SiteNavItem {
  id: string;
  label: string;
  href: string;
  icon: SiteNavIcon;
  badge?: string;
}

export interface SiteNavGroup {
  id: string;
  /** Section heading; omit/empty for ungrouped top items */
  label?: string;
  items: SiteNavItem[];
}

export const siteNavGroups: SiteNavGroup[] = [
  {
    id: 'main',
    items: [
      { id: 'home', label: 'Home', href: '/home', icon: 'home' },
      { id: 'locations', label: 'Locations', href: '/locations', icon: 'mapPin' },
      { id: 'personnel', label: 'Personnel', href: '/personnel', icon: 'clipboardUser' },
      { id: 'school-partners', label: 'School Partners', href: '/partners', icon: 'handshake' },
    ],
  },
  {
    id: 'availability',
    label: 'AVAILABILITY MANAGEMENT',
    items: [
      { id: 'availability', label: 'Availability', href: '/availability', icon: 'fileLines' },
      { id: 'slot-requests', label: 'Slot Requests', href: '/slot-requests', icon: 'users' },
      { id: 'schedules', label: 'Schedules', href: '/schedules', icon: 'graduationCap' },
      { id: 'reports', label: 'Reports', href: '/reports', icon: 'chartLine' },
    ],
  },
  {
    id: 'jobs',
    label: 'JOBS MANAGEMENT',
    items: [
      { id: 'jobs', label: 'Jobs', href: '/jobs', icon: 'briefcase', badge: 'NEW' },
    ],
  },
  {
    id: 'config',
    items: [
      { id: 'site-config', label: 'Site Configuration', href: '/site-configuration', icon: 'gear' },
    ],
  },
];
