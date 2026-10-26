import type { Availability } from './mockAvailabilities';

// One definition of an availability's time bucket, shared by the Availability screen
// (its All / Upcoming / Current / Completed tabs) and the Dashboard's "Active
// Availabilities" card, so the two cannot disagree about what "active" means.
export type TimeBucket = 'Upcoming' | 'Current' | 'Completed';

// "Today" anchored to America/New_York (EST/EDT) to match the platform's day-boundary
// convention (reports refresh at 3:30 AM EST) — avoids bucket membership flickering for
// coordinators outside the Eastern timezone.
export function todayET(now: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now);
  const get = (t: string) => parts.find((p) => p.type === t)!.value;
  return `${get('year')}-${get('month')}-${get('day')}`;
}

// Plain string comparison on YYYY-MM-DD is safe — both sides are zero-padded ISO dates.
export function getTimeBucket(a: Pick<Availability, 'startDate' | 'endDate'>, today: string): TimeBucket {
  if (a.startDate > today) return 'Upcoming';
  if (a.endDate < today) return 'Completed';
  return 'Current';
}

/** Active = Current + Upcoming: everything that hasn't ended yet. */
export function countActiveAvailabilities(list: readonly Pick<Availability, 'startDate' | 'endDate'>[], today: string = todayET()): number {
  return list.filter((a) => getTimeBucket(a, today) !== 'Completed').length;
}
