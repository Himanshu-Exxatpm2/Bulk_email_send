// Data model + mock partner tiers for the Bulk Clone "Publish Preferences" rebuild.
// Mirrors the production multi-card model (Who sees / Publish When / Tiered Partners
// per-tier scheduling) observed in the real Create Availability → Publish Preferences
// step. This is throwaway prototype state — the real model is a Phase 4 backend concern.
//
// NOTE: production's tier list included at least one malformed/duplicated tier name
// (looked like a data-entry bug, not a UI pattern). We deliberately did not replicate
// that — these are clean, representative tier names so the prototype reads as intended
// rather than reproducing a customer data quality issue.

export interface PartnerTier {
  id: string;
  name: string;
}

export const mockPartnerTiers: PartnerTier[] = [
  { id: 'tier-gold', name: 'Gold Partners' },
  { id: 'tier-intl-a', name: 'International Partners — Cohort A' },
  { id: 'tier-intl-b', name: 'International Partners — Cohort B' },
  { id: 'tier-intl-c', name: 'International Partners — Cohort C' },
  { id: 'tier-premium', name: 'Premium Partners' },
  { id: 'tier-prime', name: 'Prime Partners' },
  { id: 'tier-silver', name: 'Silver Partners' },
  { id: 'tier-bronze', name: 'Bronze Partners' },
  { id: 'tier-regional-ne', name: 'Regional Partners — Northeast' },
  { id: 'tier-regional-sw', name: 'Regional Partners — Southwest' },
  { id: 'tier-affiliate', name: 'Affiliate Partners' },
];

export type WhoSees = 'Public' | 'All Partners' | 'Tiered Partners';
export type PublishWhen = 'Now' | 'Scheduled' | 'Do Not Publish';

export interface TierDateOverride {
  tierId: string;
  publishOn: string; // ISO date (YYYY-MM-DD); '' = not specified
  dueDate: string;
}

export interface PublishPreferenceCardState {
  cardId: string;
  whoSees?: WhoSees;
  selectedTierIds: string[]; // only meaningful when whoSees === 'Tiered Partners'
  publishWhen?: PublishWhen;
  publishOn: string; // card-level default; ISO date or ''
  dueDate: string;
  tierDates: TierDateOverride[]; // per-tier overrides set via "Set Preferred Dates for Tiers"
}

export function todayISODate(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

let cardSeq = 0;
export function makeEmptyCard(): PublishPreferenceCardState {
  cardSeq += 1;
  return {
    cardId: `pref-${cardSeq}-${Date.now()}`,
    whoSees: undefined,
    selectedTierIds: [],
    publishWhen: undefined,
    publishOn: '',
    dueDate: '',
    tierDates: [],
  };
}

export function isCardValid(card: PublishPreferenceCardState): boolean {
  if (!card.whoSees || !card.publishWhen) return false;
  if (card.whoSees === 'Tiered Partners' && card.selectedTierIds.length === 0) return false;
  if (card.publishWhen === 'Scheduled' && !card.publishOn) return false;
  if (card.publishWhen !== 'Do Not Publish') {
    if (!card.dueDate) return false;
    const effectivePublishDate =
      card.publishWhen === 'Scheduled' ? card.publishOn : todayISODate();
    if (effectivePublishDate && card.dueDate < effectivePublishDate) return false;
  }
  return true;
}

export function summarizeCard(card: PublishPreferenceCardState): string {
  const who =
    card.whoSees === 'Tiered Partners'
      ? `Tiered Partners (${card.selectedTierIds.length} ${card.selectedTierIds.length === 1 ? 'tier' : 'tiers'})`
      : card.whoSees ?? 'Unset';
  const when = card.publishWhen ?? 'Unset';
  return `${who} — ${when}`;
}
