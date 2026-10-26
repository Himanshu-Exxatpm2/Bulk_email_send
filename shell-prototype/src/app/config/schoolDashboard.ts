/**
 * School-admin Home dashboard content (Figma 413:7475).
 */

export const schoolDashboardCopy = {
  greetingPrefix: 'Good evening',
  tasksTitle: 'Your Tasks',
  tasksNewMessages: 'New messages (0)',
  tasksActivityDashboard: 'Activity Dashboard',
  tasksEmptyTitle: "You're all set for now!",
  tasksEmptyBody:
    'Once you request for more slots or have approved schedules, you’ll have tasks to act upon.',
  discoverTitle: 'Discover Availabilities',
  discoverBookmarks: 'My Bookmarks',
  discoverExploreMap: 'Explore All on Map',
  landscapeTitle: 'Exxat One Availability Landscape',
  landscapeSubtitle: 'Visualize all availabilities across the Exxat One network in one comprehensive glance',
  journeyTitle: 'Master your placement journey',
  journeyKicker: 'Get started',
  journeyConnect: 'Have more questions? Connect with us',
  journeyHide: 'Hide this Section',
  promoBadge: 'NEW',
  promoTitle: "Don't let your students figure it out alone!",
  promoBody: 'Guide them to jobs aligned with where they trained.',
  promoCta: 'Explore Job Opportunities',
} as const;

export const discoverFilters = [
  { id: 'site', label: 'Site', icon: 'building' as const },
  { id: 'date-range', label: 'Date Range', icon: 'calendar' as const },
  { id: 'specialization', label: 'Specialization', icon: 'graduationCap' as const },
];

export interface JourneyStep {
  id: number;
  label: string;
}

export const journeySteps: JourneyStep[] = [
  { id: 1, label: 'Finding clinical availabilities' },
  { id: 2, label: 'Submitting availability slot request' },
  { id: 3, label: 'Tracking requests' },
  { id: 4, label: 'Confirming schedules' },
  { id: 5, label: 'Managing schedule onboarding' },
  { id: 6, label: 'Student Journey on Exxat One' },
];

/**
 * Mock availability intensity by US state (FIPS-2 code) — feeds the choropleth.
 * Values are illustrative placement volumes, not live data.
 */
export const availabilityByState: Record<string, number> = {
  'us-ca': 48, 'us-tx': 44, 'us-ny': 40, 'us-md': 38, 'us-fl': 34,
  'us-pa': 30, 'us-il': 28, 'us-oh': 26, 'us-mi': 24, 'us-nc': 23,
  'us-ga': 22, 'us-va': 21, 'us-nj': 20, 'us-wa': 19, 'us-az': 18,
  'us-ma': 17, 'us-tn': 16, 'us-mo': 15, 'us-in': 14, 'us-wi': 13,
  'us-co': 12, 'us-mn': 12, 'us-sc': 11, 'us-al': 10, 'us-ky': 9,
  'us-or': 9, 'us-la': 8, 'us-ok': 8, 'us-ct': 7, 'us-ia': 6,
  'us-ut': 6, 'us-nv': 5, 'us-ks': 5, 'us-ar': 4, 'us-ms': 4,
  'us-ne': 3, 'us-nm': 3, 'us-wv': 3, 'us-id': 2, 'us-ha': 2,
  'us-me': 2, 'us-nh': 2, 'us-ri': 2, 'us-mt': 1, 'us-de': 1,
  'us-sd': 1, 'us-nd': 1, 'us-ak': 1, 'us-vt': 1, 'us-wy': 1,
};
