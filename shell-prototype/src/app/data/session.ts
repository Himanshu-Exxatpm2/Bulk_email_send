/**
 * Mock session — flip these (or use header Dev Options) to preview every entry path.
 *
 * Live-product entry model (Network Layer is intentionally out of scope here):
 *   Super admin signs in  ->  Choose a product ("As School" | "As Site")
 *     As Site   ->  single site   -> that site dashboard
 *                   multiple sites -> Sites launch page
 *     As School ->  single school -> that school dashboard
 *                   multiple schools -> Schools launch page
 *
 * // TODO(pm-feedback): replace with real auth + product entitlements when wiring backends
 */

export type SessionRole = 'super-admin' | 'site-only' | 'school-only';

export type CountMode = 'single' | 'multiple';
/** Back-compat alias — header Dev Options still speak "site count" */
export type SiteCountMode = CountMode;

export type ProductKind = 'site' | 'school';

export interface MockSite {
  id: string;
  name: string;
  location: string;
}

export interface MockSchool {
  id: string;
  name: string;
  /** e.g. "DPT", "Nursing - BSN" — shown after the university name */
  program?: string;
  location: string;
}

/** Parallel "Network Layer" project — kept for future iterations, not surfaced in this shell. */
export interface MockConsortium {
  id: string;
  name: string;
  shortName: string;
  discipline: string;
  region: string;
  fullName: string;
}

export interface MockSession {
  isAuthenticated: boolean;
  role: SessionRole;
  siteCountMode: CountMode;
  schoolCountMode: CountMode;
  userDisplayName: string;
  userInitials: string;
  email: string;
  notificationCount: number;
  sites: MockSite[];
  schools: MockSchool[];
  /** Kept for the parked Network Layer work; unused by the live-product flow. */
  consortiums: MockConsortium[];
}

export const defaultSession: MockSession = {
  isAuthenticated: false,
  role: 'super-admin',
  siteCountMode: 'multiple',
  schoolCountMode: 'multiple',
  userDisplayName: 'Snehal Gajbhiye',
  userInitials: 'SG',
  email: 'snehal@exxat.com',
  notificationCount: 372,
  sites: [
    { id: 'bedlam-hospital', name: 'Bedlam-Hospital', location: 'Oklahoma City, OK' },
    { id: 'happy-clinic', name: 'Happy Clinic', location: 'Austin, TX' },
    { id: 'metro-health', name: 'Metro Health Partners', location: 'Baltimore, MD' },
    { id: 'riverside-medical', name: 'Riverside Medical Center', location: 'Washington, DC' },
  ],
  schools: [
    {
      id: 'abilene-christian-dpt',
      name: 'Abilene Christine University',
      program: 'DPT',
      location: 'Abilene, TX',
    },
    {
      id: 'atsu-santa-maria-pa',
      name: 'A.T. Still University - Central Coast - Santa Maria Campus',
      program: 'PA',
      location: 'Santa Maria, CA',
    },
    {
      id: 'abc-university-nursing',
      name: 'ABC University',
      program: 'Nursing',
      location: 'Boston, MA',
    },
    {
      id: 'adelphi-public-health',
      name: 'Adelphi University',
      program: 'Public Health',
      location: 'Garden City, NY',
    },
  ],
  consortiums: [
    {
      id: 'mddc-nursing',
      name: 'MDDC Nursing Consortium',
      shortName: 'MDDC Consortium',
      discipline: 'Nursing Network',
      region: 'Maryland & Washington DC Region',
      fullName: 'Maryland-DC Nursing Consortium (MDDC)',
    },
  ],
};

/* ---- sites ---- */

export function getVisibleSites(session: MockSession): MockSite[] {
  return session.siteCountMode === 'single' ? session.sites.slice(0, 1) : session.sites;
}

export function getPrimarySite(session: MockSession): MockSite {
  return getVisibleSites(session)[0];
}

export function findSite(session: MockSession, siteId: string): MockSite | undefined {
  return session.sites.find((s) => s.id === siteId);
}

/* ---- schools ---- */

export function getVisibleSchools(session: MockSession): MockSchool[] {
  return session.schoolCountMode === 'single' ? session.schools.slice(0, 1) : session.schools;
}

export function getPrimarySchool(session: MockSession): MockSchool {
  return getVisibleSchools(session)[0];
}

export function findSchool(session: MockSession, schoolId: string): MockSchool | undefined {
  return session.schools.find((s) => s.id === schoolId);
}

export function schoolLabel(school: MockSchool): string {
  return school.program ? `${school.name} - ${school.program}` : school.name;
}

/* ---- product access ---- */

export function canAccessSiteLayer(session: MockSession): boolean {
  return session.role === 'super-admin' || session.role === 'site-only';
}

export function canAccessSchoolLayer(session: MockSession): boolean {
  return session.role === 'super-admin' || session.role === 'school-only';
}

/**
 * Parked "Network Layer" project is out of scope for this shell — always false.
 * Kept so the dormant network screens still compile for future iterations.
 */
export function canAccessNetworkLayer(_session: MockSession): boolean {
  return false;
}

/** Dormant Network Layer lookup — retained so parked network screens compile. */
export function findConsortium(
  session: MockSession,
  consortiumId: string,
): MockConsortium | undefined {
  return session.consortiums.find((c) => c.id === consortiumId);
}

/** Where a chosen product should land the user (single -> dashboard, multiple -> launch). */
export function siteEntryPath(session: MockSession): string {
  const sites = getVisibleSites(session);
  return sites.length <= 1 ? `/site/${sites[0].id}` : '/sites';
}

export function schoolEntryPath(session: MockSession): string {
  const schools = getVisibleSchools(session);
  return schools.length <= 1 ? `/school/${schools[0].id}` : '/schools';
}

/** After sign-in: super admins choose a product; single-product roles skip straight in. */
export function postLoginPath(session: MockSession): string {
  if (session.role === 'site-only') return siteEntryPath(session);
  if (session.role === 'school-only') return schoolEntryPath(session);
  return '/choose-products';
}
