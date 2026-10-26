/**
 * School-admin LHN (Figma 413:7475). Edit here to reorder/rename/add items.
 */
import type { FontAwesomeIconName } from '../components/font-awesome-icon';

export interface SchoolNavItem {
  id: string;
  label: string;
  href: string;
  icon: FontAwesomeIconName;
  badge?: string;
}

export interface SchoolNavGroup {
  id: string;
  label?: string;
  items: SchoolNavItem[];
}

export const schoolNavGroups: SchoolNavGroup[] = [
  {
    id: 'main',
    items: [
      { id: 'home', label: 'Home', href: '/home', icon: 'home' },
      {
        id: 'explore',
        label: 'Explore & apply for Availability',
        href: '/explore',
        icon: 'compass',
      },
    ],
  },
  {
    id: 'activities',
    label: 'ACTIVITIES',
    items: [
      { id: 'dashboard', label: 'Dashboard', href: '/dashboard', icon: 'chartBar' },
      { id: 'requests', label: 'Requests', href: '/requests', icon: 'clipboardList' },
      { id: 'schedules', label: 'Schedules', href: '/schedules', icon: 'calendarCheck' },
    ],
  },
  {
    id: 'reports',
    items: [{ id: 'reports', label: 'Reports', href: '/reports', icon: 'chartLine' }],
  },
  {
    id: 'config',
    items: [
      { id: 'school-config', label: 'School Configuration', href: '/school-configuration', icon: 'gear' },
    ],
  },
];
