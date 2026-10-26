/**
 * Launch Page (/sites) — Network Layer + Sites secondary tabs.
 * // TODO(pm-feedback): card fields & pagination copy from Figma 370:624 / 370:245
 */

export type LaunchTabId = 'network' | 'sites';

export interface LaunchTab {
  id: LaunchTabId;
  label: string;
}

export const launchTabs: LaunchTab[] = [
  { id: 'network', label: 'Network Layer' },
  { id: 'sites', label: 'Sites' },
];

export const launchPageCopy = {
  title: 'Launch Page',
  searchPlaceholder: 'Search by name...',
  showingPrefix: 'Showing',
  ofLabel: 'of',
  resultsLabel: 'results',
} as const;

export interface LaunchSiteCard {
  id: string;
  name: string;
  location: string;
  initial: string;
}

/** Extra site cards to match Figma Sites tab density */
export const launchSiteCards: LaunchSiteCard[] = [
  { id: 'bedlam-hospital', name: 'Bedlam-Hospital', location: 'Oklahoma City, OK', initial: 'B' },
  { id: 'baptist-health', name: 'Baptist Health', location: 'Louisville, KY', initial: 'B' },
  { id: 'happy-clinic', name: 'Happy Clinic', location: 'Austin, TX', initial: 'H' },
  { id: 'metro-health', name: 'Metro Health Partners', location: 'Baltimore, MD', initial: 'M' },
  { id: 'riverside-medical', name: 'Riverside Medical Center', location: 'Washington, DC', initial: 'R' },
  { id: 'capitol-care', name: 'Capitol Care Clinic', location: 'Washington, DC', initial: 'C' },
];
