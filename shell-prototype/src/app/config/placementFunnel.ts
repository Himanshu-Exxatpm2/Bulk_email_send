/**
 * Placement funnel hero mock data — mirrors Exxat-UI network-hero-funnel-prototype-v3.
 */

export type FunnelDesign = 'dropoff' | 'progression';

export interface FunnelMonth {
  month: string;
  requested: number;
  approved: number;
  confirmed: number;
  onboarded: number;
}

export interface FunnelKpi {
  id: string;
  value: string;
  label: string;
  tone?: 'danger' | 'default';
}

export interface FunnelInsight {
  id: string;
  tone: 'red' | 'amber' | 'indigo';
  title: string;
  body: string;
}

export const FUNNEL_BAR_COLORS = {
  requested: '#94A3B8',
  approved: '#6366F1',
  confirmed: '#F59E0B',
  onboarded: '#16A34A',
} as const;

export const FUNNEL_LINE_COLORS = {
  approval: '#2563EB',
  confirmation: '#DB2777',
  onboarding: '#7C3AED',
  overall: '#0F172A',
} as const;

export const funnelMonths: FunnelMonth[] = [
  { month: 'Aug 2026', requested: 820, approved: 599, confirmed: 394, onboarded: 145 },
  { month: 'Sep 2026', requested: 1511, approved: 1056, confirmed: 613, onboarded: 138 },
  { month: 'Oct 2026', requested: 968, approved: 726, confirmed: 260, onboarded: 21 },
  { month: 'Nov 2026', requested: 354, approved: 290, confirmed: 107, onboarded: 3 },
  { month: 'Dec 2026', requested: 34, approved: 29, confirmed: 4, onboarded: 0 },
  { month: 'Jan 2027', requested: 5, approved: 4, confirmed: 2, onboarded: 0 },
  { month: 'Feb 2027', requested: 0, approved: 0, confirmed: 0, onboarded: 0 },
  { month: 'Mar 2027', requested: 1, approved: 1, confirmed: 0, onboarded: 0 },
  { month: 'Apr 2027', requested: 0, approved: 0, confirmed: 0, onboarded: 0 },
  { month: 'May 2027', requested: 0, approved: 0, confirmed: 0, onboarded: 0 },
  { month: 'Jun 2027', requested: 0, approved: 0, confirmed: 0, onboarded: 0 },
  { month: 'Jul 2027', requested: 0, approved: 0, confirmed: 0, onboarded: 0 },
];

export const funnelKpis: FunnelKpi[] = [
  { id: 'onboarding-rate', value: '22%', label: 'Onboarding rate', tone: 'danger' },
  { id: 'biggest-dropoff', value: '−78%', label: 'Biggest drop-off · onboarding', tone: 'danger' },
  { id: 'pending-onboarding', value: '1,073', label: 'Slots pending onboarding' },
  { id: 'conversion-trend', value: '▼', label: 'Conversion trend falling' },
];

export const funnelInsights: FunnelInsight[] = [
  {
    id: 'onboarding-lag',
    tone: 'red',
    title: 'The onboarding line never catches up.',
    body: 'It sits far below approval and confirmation every month and keeps sliding — the spread between the top and bottom rate lines is widening, not closing.',
  },
  {
    id: 'near-term-compliance',
    tone: 'amber',
    title: 'Near-term compliance is slipping.',
    body: 'Oct–Nov starts have 367 confirmed but just 24 onboarded (6.5%). ~93% of imminent onboarding is still pending.',
  },
  {
    id: 'peak-confirmation',
    tone: 'indigo',
    title: 'Peak month stalls at confirmation.',
    body: 'Sep 2026 approved 1,056 but confirmed only 613 (58%) — 443 approved slots never became schedules.',
  },
];

export const funnelCopy = {
  title: 'Placement Funnel Health — Consortium',
  subtitle:
    'Requested → Approved → Confirmed → Onboarded, with approval, confirmation, onboarding & overall rates · 2026-27',
  leoTitle: 'Leo Insights',
  bottleneck: '1 bottleneck',
  keySignals: 'Key signals',
  footer: 'Auto-generated from consortium funnel data · click a legend item to show/hide a line',
} as const;

/** Rate % or null when denominator < 10 */
export function funnelRate(num: number, den: number): number | null {
  return den >= 10 ? Math.round((num / den) * 1000) / 10 : null;
}
