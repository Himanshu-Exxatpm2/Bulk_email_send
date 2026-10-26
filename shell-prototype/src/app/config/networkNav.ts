/**
 * Network-layer top navigation (horizontal tabs).
 * // TODO(pm-feedback): Overview/Members/Communications/Reports confirmed against Figma 370:1052
 */

export interface NetworkTopNavItem {
  id: string;
  label: string;
  /** Route segment under /network/:consortiumId */
  href: string;
}

export const networkTopNav: NetworkTopNavItem[] = [
  { id: 'overview', label: 'Overview', href: '' },
  { id: 'members', label: 'Members', href: 'members' },
  { id: 'communications', label: 'Communications', href: 'communications' },
  { id: 'reports', label: 'Reports', href: 'reports' },
];

/** @deprecated Prefer networkTopNav — kept for any leftover sidebar references */
export const networkNavGroups = [
  {
    id: 'top',
    items: networkTopNav.map((t) => ({
      id: t.id,
      label: t.label,
      href: t.href || 'dashboard',
      icon: 'chartPie' as const,
    })),
  },
];
