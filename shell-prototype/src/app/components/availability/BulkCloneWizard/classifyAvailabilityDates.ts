export type RotationPeriod = 'Fall' | 'Spring' | 'Summer' | 'FullYear' | 'Custom';
export type Confidence = 'high' | 'medium' | 'low';

export interface DateSuggestion {
  suggestedStartDate: string;
  suggestedEndDate: string;
  confidence: Confidence;
  rotationPeriod: RotationPeriod;
}

// ── Anchor table ──────────────────────────────────────────────────────────────

type AnchorPeriod = Exclude<RotationPeriod, 'Custom'>;

interface Anchor {
  monthStart: number; // 1-indexed
  dayStart: number;
  monthEnd: number;
  dayEnd: number;
}

const ANCHORS_V2: Record<string, Partial<Record<AnchorPeriod, Anchor>>> = {
  bsn: {
    Fall:     { monthStart: 9,  dayStart: 2,  monthEnd: 12, dayEnd: 13 },
    Spring:   { monthStart: 1,  dayStart: 13, monthEnd: 5,  dayEnd: 2  },
    Summer:   { monthStart: 5,  dayStart: 20, monthEnd: 8,  dayEnd: 8  },
    FullYear: { monthStart: 8,  dayStart: 25, monthEnd: 5,  dayEnd: 10 },
  },
  dnp: {
    Fall:     { monthStart: 9,  dayStart: 8,  monthEnd: 12, dayEnd: 20 },
    Spring:   { monthStart: 1,  dayStart: 10, monthEnd: 5,  dayEnd: 9  },
    Summer:   { monthStart: 6,  dayStart: 2,  monthEnd: 8,  dayEnd: 15 },
    FullYear: { monthStart: 9,  dayStart: 2,  monthEnd: 8,  dayEnd: 15 },
  },
  'pre-licensure': {
    Fall:     { monthStart: 8,  dayStart: 25, monthEnd: 12, dayEnd: 20 },
    Spring:   { monthStart: 1,  dayStart: 6,  monthEnd: 5,  dayEnd: 16 },
    Summer:   { monthStart: 5,  dayStart: 13, monthEnd: 8,  dayEnd: 1  },
    FullYear: { monthStart: 8,  dayStart: 18, monthEnd: 5,  dayEnd: 23 },
  },
  ot: {
    Fall:     { monthStart: 9,  dayStart: 2,  monthEnd: 12, dayEnd: 16 },
    Spring:   { monthStart: 1,  dayStart: 8,  monthEnd: 5,  dayEnd: 7  },
    Summer:   { monthStart: 5,  dayStart: 27, monthEnd: 8,  dayEnd: 12 },
    FullYear: { monthStart: 9,  dayStart: 2,  monthEnd: 6,  dayEnd: 13 },
  },
  pt: {
    Fall:     { monthStart: 8,  dayStart: 25, monthEnd: 12, dayEnd: 18 },
    Spring:   { monthStart: 1,  dayStart: 6,  monthEnd: 5,  dayEnd: 14 },
    Summer:   { monthStart: 5,  dayStart: 20, monthEnd: 8,  dayEnd: 7  },
    FullYear: { monthStart: 8,  dayStart: 25, monthEnd: 6,  dayEnd: 7  },
  },
  generic: {
    Fall:     { monthStart: 9,  dayStart: 1,  monthEnd: 12, dayEnd: 15 },
    Spring:   { monthStart: 1,  dayStart: 15, monthEnd: 5,  dayEnd: 1  },
    Summer:   { monthStart: 6,  dayStart: 1,  monthEnd: 8,  dayEnd: 15 },
    FullYear: { monthStart: 9,  dayStart: 1,  monthEnd: 5,  dayEnd: 31 },
  },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function parseDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function daysBetween(start: string, end: string): number {
  return Math.round(
    (parseDate(end).getTime() - parseDate(start).getTime()) / 86_400_000,
  );
}

function toISO(year: number, month: number, day: number): string {
  // month is 1-indexed; clamp overflows (e.g. Feb 29 in non-leap year → Feb 28)
  const d = new Date(year, month - 1, day);
  if (d.getMonth() !== month - 1) {
    // Day overflowed into the next month — use last day of the intended month
    const lastDay = new Date(year, month, 0).getDate();
    return toISO(year, month, lastDay);
  }
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function shiftOneYear(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  // Feb 29 in a non-leap target year → Feb 28 (toISO clamping handles this)
  return toISO(y + 1, m, d);
}

// ── Rotation period derivation ────────────────────────────────────────────────

function deriveRotationPeriod(startDate: string, endDate: string): RotationPeriod {
  if (daysBetween(startDate, endDate) > 270) return 'FullYear';

  const sm = parseDate(startDate).getMonth(); // 0-indexed
  const em = parseDate(endDate).getMonth();

  if ([7, 8, 9].includes(sm) && [10, 11, 0].includes(em)) return 'Fall';
  if ([0, 1].includes(sm)    && [3, 4, 5].includes(em))   return 'Spring';
  if ([4, 5].includes(sm)    && [6, 7].includes(em))       return 'Summer';
  return 'Custom';
}

// ── Program-type normalisation ────────────────────────────────────────────────

function normalizeProgramType(programType: string): { key: string; confidence: Confidence } {
  const norm = programType.toLowerCase().trim();
  const knownKeys = Object.keys(ANCHORS_V2);

  // 1. Exact match
  if (knownKeys.includes(norm)) return { key: norm, confidence: 'high' };

  // 2. Partial match — prefer longer keys to avoid 'pt' shadowing 'pre-licensure'
  const candidates = knownKeys
    .filter((k) => k !== 'generic')
    .sort((a, b) => b.length - a.length);

  for (const k of candidates) {
    if (norm.includes(k)) return { key: k, confidence: 'medium' };
  }

  return { key: 'generic', confidence: 'medium' };
}

// ── Main export ───────────────────────────────────────────────────────────────

export function classifyAvailabilityDates(
  startDate: string,
  endDate: string,
  programType: string,
  _discipline: string,
  _experienceType: string,
): DateSuggestion {
  const rotationPeriod = deriveRotationPeriod(startDate, endDate);

  if (rotationPeriod === 'Custom') {
    return {
      suggestedStartDate: shiftOneYear(startDate),
      suggestedEndDate:   shiftOneYear(endDate),
      confidence:         'low',
      rotationPeriod:     'Custom',
    };
  }

  const { key, confidence } = normalizeProgramType(programType);
  const anchor =
    ANCHORS_V2[key]?.[rotationPeriod] ?? (ANCHORS_V2.generic[rotationPeriod] as Anchor);

  const origYear   = parseDate(startDate).getFullYear();
  const targetYear = origYear + 1;
  // FullYear anchors typically span Sep→May which crosses a calendar year boundary
  const endYear    = anchor.monthEnd < anchor.monthStart ? targetYear + 1 : targetYear;

  return {
    suggestedStartDate: toISO(targetYear, anchor.monthStart, anchor.dayStart),
    suggestedEndDate:   toISO(endYear,    anchor.monthEnd,   anchor.dayEnd),
    confidence,
    rotationPeriod,
  };
}
