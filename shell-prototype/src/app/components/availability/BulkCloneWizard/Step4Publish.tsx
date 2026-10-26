import { useState } from 'react';
import { Availability } from '../../../data/mockAvailabilities';
import { FontAwesomeIcon } from '../../font-awesome-icon';
import { PublishPreferenceCard } from '../PublishPreferenceCard';
import { PublishPreferenceCardState, isCardValid } from '../publishPreferenceData';

// ── Default preference ─────────────────────────────────────────────────────────

const DEFAULT_PREF: PublishPreferenceCardState = {
  cardId: 'global',
  whoSees: undefined,
  selectedTierIds: [],
  tierDates: [],
  publishWhen: undefined,
  publishOn: '',
  dueDate: '',
};

function formatDate(iso: string): string {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface Step4PublishProps {
  availabilities: Availability[];
  resolvedNames: Record<string, string>;
  dates: Record<string, { startDate: string; endDate: string }>;
  initialMode: 'all' | 'individual';
  initialDefaultPreference: PublishPreferenceCardState | null;
  initialOverrides: Record<string, PublishPreferenceCardState>;
  onDataChange: (
    mode: 'all' | 'individual',
    defaultPreference: PublishPreferenceCardState | null,
    overrides: Record<string, PublishPreferenceCardState>,
  ) => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function Step4Publish({
  availabilities,
  resolvedNames,
  dates,
  initialMode,
  initialDefaultPreference,
  initialOverrides,
  onDataChange,
}: Step4PublishProps) {
  const [publishMode, setPublishMode] = useState<'all' | 'individual'>(initialMode);
  const [defaultPreference, setDefaultPreference] = useState<PublishPreferenceCardState | null>(
    initialDefaultPreference,
  );
  const [overrides, setOverrides] = useState<Record<string, PublishPreferenceCardState>>(
    initialOverrides,
  );
  // Which rows have their override panel expanded
  const [expandedOverrides, setExpandedOverrides] = useState<Set<string>>(
    new Set(Object.keys(initialOverrides)),
  );

  const emit = (
    mode: 'all' | 'individual',
    def: PublishPreferenceCardState | null,
    ovr: Record<string, PublishPreferenceCardState>,
  ) => onDataChange(mode, def, ovr);

  const handleModeChange = (mode: 'all' | 'individual') => {
    setPublishMode(mode);
    emit(mode, defaultPreference, overrides);
  };

  const handleDefaultChange = (pref: PublishPreferenceCardState) => {
    setDefaultPreference(pref);
    emit(publishMode, pref, overrides);
  };

  const handleOverrideChange = (id: string, pref: PublishPreferenceCardState) => {
    const next = { ...overrides, [id]: pref };
    setOverrides(next);
    emit(publishMode, defaultPreference, next);
  };

  const handleRemoveOverride = (id: string) => {
    const next = { ...overrides };
    delete next[id];
    setOverrides(next);
    setExpandedOverrides((prev) => { const s = new Set(prev); s.delete(id); return s; });
    emit(publishMode, defaultPreference, next);
  };

  const toggleExpand = (id: string) => {
    setExpandedOverrides((prev) => {
      const s = new Set(prev);
      if (s.has(id)) { s.delete(id); } else { s.add(id); }
      return s;
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">

      {/* ── Mode toggle ──────────────────────────────────────────────────── */}
      <div className="bg-card rounded-xl shadow-[0_1px_1.5px_rgba(0,0,0,0.1),0_1px_1px_rgba(0,0,0,0.1)] p-5 space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-neutral-850 mb-0.5">Publish Preference</h3>
          <p className="text-xs text-neutral-600">
            Set a single preference for all cloned availabilities, or customise each one individually.
          </p>
        </div>

        <div className="flex gap-3">
          {/* All same */}
          <button
            type="button"
            onClick={() => handleModeChange('all')}
            className={[
              'flex-1 flex items-start gap-3 p-4 rounded-lg border-2 text-left transition-colors',
              publishMode === 'all'
                ? 'border-blue-500 bg-blue-50'
                : 'border-neutral-200 bg-white hover:border-neutral-300',
            ].join(' ')}
          >
            <div className={[
              'w-4 h-4 mt-0.5 rounded-full border-2 flex-shrink-0 flex items-center justify-center',
              publishMode === 'all' ? 'border-blue-500' : 'border-neutral-300',
            ].join(' ')}>
              {publishMode === 'all' && (
                <div className="w-2 h-2 rounded-full bg-blue-500" />
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-neutral-850">Same for all</p>
              <p className="text-xs text-neutral-600 mt-0.5">
                One publish setting applies to all {availabilities.length} cloned availabilities.
              </p>
            </div>
          </button>

          {/* Individual */}
          <button
            type="button"
            onClick={() => handleModeChange('individual')}
            className={[
              'flex-1 flex items-start gap-3 p-4 rounded-lg border-2 text-left transition-colors',
              publishMode === 'individual'
                ? 'border-blue-500 bg-blue-50'
                : 'border-neutral-200 bg-white hover:border-neutral-300',
            ].join(' ')}
          >
            <div className={[
              'w-4 h-4 mt-0.5 rounded-full border-2 flex-shrink-0 flex items-center justify-center',
              publishMode === 'individual' ? 'border-blue-500' : 'border-neutral-300',
            ].join(' ')}>
              {publishMode === 'individual' && (
                <div className="w-2 h-2 rounded-full bg-blue-500" />
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-neutral-850">Customise per availability</p>
              <p className="text-xs text-neutral-600 mt-0.5">
                Set a default, then override specific availabilities as needed.
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* ── Default preference card ──────────────────────────────────────── */}
      <div>
        {publishMode === 'individual' && (
          <p className="text-xs font-semibold text-neutral-600 uppercase tracking-wide mb-2">
            Default — applies to all unless overridden below
          </p>
        )}
        <PublishPreferenceCard
          card={defaultPreference ?? DEFAULT_PREF}
          index={0}
          canDelete={false}
          onChange={handleDefaultChange}
          onDelete={() => {}}
        />
      </div>

      {/* ── Per-availability overrides (individual mode only) ────────────── */}
      {publishMode === 'individual' && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-neutral-600 uppercase tracking-wide">
            Individual overrides
          </p>

          <div className="bg-card rounded-xl shadow-[0_1px_1.5px_rgba(0,0,0,0.1),0_1px_1px_rgba(0,0,0,0.1)] overflow-hidden divide-y divide-neutral-100">
            {availabilities.map((a) => {
              const name = resolvedNames[a.id] || a.name;
              const hasOverride = !!overrides[a.id];
              const isExpanded = expandedOverrides.has(a.id);
              const overridePref = overrides[a.id];
              const overrideValid = hasOverride ? isCardValid(overridePref) : true;
              const rowDates = dates[a.id];
              const dateRange = rowDates
                ? `${formatDate(rowDates.startDate)} – ${formatDate(rowDates.endDate)}`
                : null;

              return (
                <div key={a.id} className="bg-white">
                  {/* Row header */}
                  <div className="flex items-center gap-3 px-4 py-3">
                    {/* Status dot */}
                    <div className="flex-shrink-0">
                      {hasOverride ? (
                        overrideValid ? (
                          <FontAwesomeIcon name="circleCheck" className="w-4 h-4 text-positive-default" aria-hidden="true" />
                        ) : (
                          <span className="inline-flex w-4 h-4 items-center justify-center rounded-full bg-negative-default/10 text-negative-default text-xs font-bold">!</span>
                        )
                      ) : (
                        <span className="inline-flex w-4 h-4 items-center justify-center rounded-full bg-neutral-100 text-neutral-600 text-xs">—</span>
                      )}
                    </div>

                    {/* Name */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-neutral-850 truncate">{name}</p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        {dateRange && (
                          <span className="text-xs text-neutral-600 flex items-center gap-1">
                            <FontAwesomeIcon name="calendar" className="w-3 h-3 text-neutral-500" aria-hidden="true" />
                            {dateRange}
                          </span>
                        )}
                        {dateRange && (
                          <span className="text-neutral-200 text-xs">·</span>
                        )}
                        <span className="text-xs text-neutral-600">
                          {hasOverride
                            ? <span className="text-blue-500 font-medium">Custom preference set</span>
                            : 'Using default'}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {hasOverride ? (
                        <>
                          <button
                            type="button"
                            onClick={() => toggleExpand(a.id)}
                            className="text-xs text-blue-500 hover:underline"
                          >
                            {isExpanded ? 'Collapse' : 'Edit'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveOverride(a.id)}
                            className="text-xs text-negative-default hover:underline"
                          >
                            Remove
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            // Seed the override with the current default so the user
                            // starts from a pre-filled state rather than blank
                            handleOverrideChange(a.id, { ...(defaultPreference ?? DEFAULT_PREF) });
                            setExpandedOverrides((prev) => new Set([...prev, a.id]));
                          }}
                          className="text-xs text-blue-500 border border-blue-500 rounded px-2 py-1 hover:bg-blue-50 transition-colors"
                        >
                          + Override
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Inline override panel */}
                  {hasOverride && isExpanded && (
                    <div className="px-4 pb-4 border-t border-neutral-100 pt-4 bg-blue-50/30">
                      <PublishPreferenceCard
                        card={overridePref}
                        index={0}
                        canDelete={false}
                        onChange={(pref) => handleOverrideChange(a.id, pref)}
                        onDelete={() => {}}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
