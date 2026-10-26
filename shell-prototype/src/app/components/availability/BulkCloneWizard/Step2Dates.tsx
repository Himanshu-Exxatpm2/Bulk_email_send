import { useState, useEffect, useRef } from 'react';
import { Availability } from '../../../data/mockAvailabilities';
import { Button } from '../../ui/button';
import { FontAwesomeIcon } from '../../font-awesome-icon';
import { DateField } from '../DateField';

// ── Exported types ─────────────────────────────────────────────────────────────

export type DateMode = 'roll' | 'custom';
export type RollMonths = 3 | 6 | 12;

export interface Step2Data {
  mode: DateMode;
  dates: Record<string, { startDate: string; endDate: string }>;
  /** Remembered so Back/Next keeps the coordinator's choices */
  rollMonths?: RollMonths;
  customStart?: string;
  customEnd?: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function rollDateByMonths(iso: string, months: number): string {
  const [y, m, d] = iso.split('-').map(Number);
  const target = new Date(y, m - 1 + months, d);
  // If the day overflowed (e.g. Jan 31 + 1 month → Mar 3), clamp to the last day of the target month
  const expectedMonth = (((m - 1 + months) % 12) + 12) % 12;
  if (target.getMonth() !== expectedMonth) {
    target.setDate(0);
  }
  return `${target.getFullYear()}-${String(target.getMonth() + 1).padStart(2, '0')}-${String(target.getDate()).padStart(2, '0')}`;
}

function formatDate(iso: string): string {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function rowIsValid(startDate: string, endDate: string): boolean {
  return !!startDate && !!endDate && startDate <= endDate;
}

function rolledDates(availabilities: Availability[], months: number) {
  const out: Record<string, { startDate: string; endDate: string }> = {};
  for (const a of availabilities) {
    out[a.id] = {
      startDate: rollDateByMonths(a.startDate, months),
      endDate: rollDateByMonths(a.endDate, months),
    };
  }
  return out;
}

function uniformDates(availabilities: Availability[], start: string, end: string) {
  const out: Record<string, { startDate: string; endDate: string }> = {};
  for (const a of availabilities) out[a.id] = { startDate: start, endDate: end };
  return out;
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface Step2DatesProps {
  availabilities: Availability[];
  resolvedNames: Record<string, string>;
  initialData: Step2Data;
  onDataChange: (data: Step2Data) => void;
  onValidityChange: (isValid: boolean) => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function Step2Dates({
  availabilities,
  resolvedNames,
  initialData,
  onDataChange,
  onValidityChange,
}: Step2DatesProps) {
  const [mode, setMode] = useState<DateMode>(initialData.mode);
  const [rollMonths, setRollMonths] = useState<RollMonths>(initialData.rollMonths ?? 12);
  const [customStart, setCustomStart] = useState(initialData.customStart ?? '');
  const [customEnd, setCustomEnd] = useState(initialData.customEnd ?? '');
  const [dates, setDates] = useState<Record<string, { startDate: string; endDate: string }>>(() =>
    Object.keys(initialData.dates).length > 0
      ? initialData.dates
      : rolledDates(availabilities, initialData.rollMonths ?? 12),
  );

  // Stable callback refs
  const onDataChangeRef = useRef(onDataChange);
  onDataChangeRef.current = onDataChange;
  const onValidityChangeRef = useRef(onValidityChange);
  onValidityChangeRef.current = onValidityChange;

  const customRangeValid = rowIsValid(customStart, customEnd);
  const customOrderError = !!customStart && !!customEnd && customStart > customEnd;

  // Propagate data and validity whenever anything changes
  useEffect(() => {
    onDataChangeRef.current({ mode, dates, rollMonths, customStart, customEnd });
    const rowsValid =
      availabilities.length > 0 &&
      availabilities.every((a) => {
        const d = dates[a.id];
        return d && rowIsValid(d.startDate, d.endDate);
      });
    onValidityChangeRef.current(mode === 'custom' ? customRangeValid && rowsValid : rowsValid);
  }, [mode, dates, rollMonths, customStart, customEnd, customRangeValid, availabilities]);

  // ── Mutations ─────────────────────────────────────────────────────────────

  const updateDate = (id: string, field: 'startDate' | 'endDate', value: string) => {
    setDates((prev) => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
  };

  const handleRollMonthsChange = (months: RollMonths) => {
    setRollMonths(months);
    setDates(rolledDates(availabilities, months));
  };

  // Picking a custom start/end applies it to every availability
  const handleCustomChange = (field: 'start' | 'end', value: string) => {
    const nextStart = field === 'start' ? value : customStart;
    const nextEnd = field === 'end' ? value : customEnd;
    if (field === 'start') setCustomStart(value);
    else setCustomEnd(value);
    if (rowIsValid(nextStart, nextEnd)) {
      setDates(uniformDates(availabilities, nextStart, nextEnd));
    }
  };

  const handleModeChange = (next: DateMode) => {
    setMode(next);
    if (next === 'roll') {
      setDates(rolledDates(availabilities, rollMonths));
    } else if (rowIsValid(customStart, customEnd)) {
      setDates(uniformDates(availabilities, customStart, customEnd));
    }
  };

  const handleReset = () => {
    if (mode === 'roll') {
      setDates(rolledDates(availabilities, rollMonths));
    } else if (customRangeValid) {
      setDates(uniformDates(availabilities, customStart, customEnd));
    }
  };

  const resetDisabled = mode === 'custom' && !customRangeValid;
  const awaitingCustomRange = mode === 'custom' && !customRangeValid;
  const rollLabel = rollMonths === 12 ? '1 year' : `${rollMonths} months`;

  // ── Render ────────────────────────────────────────────────────────────────

  const CARD = 'bg-card rounded-xl shadow-[0_1px_1.5px_rgba(0,0,0,0.1),0_1px_1px_rgba(0,0,0,0.1)]';

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      {/* ── Guidance ─────────────────────────────────────────────────────── */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-2">
          <FontAwesomeIcon
            name="circleQuestion"
            className="w-4 h-4 mt-0.5 flex-shrink-0 text-blue-500"
            aria-hidden="true"
          />
          <div className="space-y-1">
            <p className="text-sm font-semibold text-blue-900">Setting dates for your clones</p>
            <p className="text-xs text-blue-800 leading-relaxed">
              <strong>Roll Forward</strong> moves every start and end date ahead by <strong>3 months</strong>,{' '}
              <strong>6 months</strong> or <strong>1 year</strong> from the original rotation window. Feb 29 dates
              are clamped to Feb 28 in non-leap years. <strong>Custom Date</strong> lets you pick one start and one
              end date that is applied to every availability in the batch.
            </p>
            <p className="text-xs text-blue-700 leading-relaxed font-medium">
              Either way, you can still edit any row below by clicking into its date field.
            </p>
          </div>
        </div>
      </div>

      {/* ── Method selector ──────────────────────────────────────────────── */}
      <div className={`${CARD} p-5 space-y-4`}>
        <div>
          <h3 className="text-sm font-semibold text-neutral-850 mb-0.5">Date Assignment Method</h3>
          <p className="text-xs text-neutral-700">Choose how dates are set for the cloned availabilities.</p>
        </div>

        <div className="flex items-center gap-2" role="radiogroup" aria-label="Date assignment method">
          {([
            { id: 'roll', label: 'Roll Forward', icon: 'calendar' },
            { id: 'custom', label: 'Custom Date', icon: 'calendarCheck' },
          ] as const).map((opt) => {
            const active = mode === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => handleModeChange(opt.id)}
                className={[
                  'inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors',
                  active
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-card text-neutral-700 border-neutral-200 hover:border-blue-500 hover:text-blue-500',
                ].join(' ')}
              >
                <FontAwesomeIcon name={opt.icon} className="w-4 h-4" aria-hidden="true" />
                {opt.label}
              </button>
            );
          })}
        </div>

        {/* Roll-forward window */}
        {mode === 'roll' && (
          <div>
            <p className="text-xs text-neutral-700 mb-2">Roll forward by</p>
            <div
              className="inline-flex rounded-lg border border-neutral-200 overflow-hidden"
              role="radiogroup"
              aria-label="Roll forward by"
            >
              {([3, 6, 12] as const).map((m) => {
                const label = m === 12 ? '1 Year' : `${m} Months`;
                const isActive = rollMonths === m;
                return (
                  <button
                    key={m}
                    type="button"
                    role="radio"
                    aria-checked={isActive}
                    onClick={() => handleRollMonthsChange(m)}
                    className={[
                      'px-4 py-2 text-sm font-medium transition-colors border-r last:border-r-0 border-neutral-200',
                      isActive ? 'bg-blue-50 text-blue-500' : 'bg-card text-neutral-700 hover:bg-neutral-50',
                    ].join(' ')}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-neutral-600 mt-2">
              Choosing a different option recalculates all dates. Any rows you've already edited manually will reset.
            </p>
          </div>
        )}

        {/* Custom range */}
        {mode === 'custom' && (
          <div>
            <div className="flex items-start gap-4 flex-wrap">
              <div className="w-56">
                <p className="text-xs text-neutral-700 mb-1.5">Start date</p>
                <div className={customOrderError ? 'ring-1 ring-negative-default rounded-md' : ''}>
                  <DateField
                    value={customStart}
                    onChange={(v) => handleCustomChange('start', v)}
                    placeholder="Select start date"
                    ariaLabel="Custom start date for all availabilities"
                  />
                </div>
              </div>
              <div className="w-56">
                <p className="text-xs text-neutral-700 mb-1.5">End date</p>
                <div className={customOrderError ? 'ring-1 ring-negative-default rounded-md' : ''}>
                  <DateField
                    value={customEnd}
                    onChange={(v) => handleCustomChange('end', v)}
                    placeholder="Select end date"
                    ariaLabel="Custom end date for all availabilities"
                  />
                </div>
              </div>
            </div>
            {customOrderError ? (
              <p className="text-xs text-negative-default mt-2">Start must be before end</p>
            ) : (
              <p className="text-xs text-neutral-600 mt-2">
                {awaitingCustomRange
                  ? `Choose a start and end date to apply to all ${availabilities.length} availabilities.`
                  : `Applied to all ${availabilities.length} availabilities. Picking new dates replaces any row edits.`}
              </p>
            )}
          </div>
        )}
      </div>

      {/* ── Date preview table ───────────────────────────────────────────── */}
      <div className={`${CARD} overflow-hidden`}>
        <div className="bg-neutral-50 border-b border-neutral-200 px-4 py-2.5 flex items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold text-neutral-800">Date Preview</h3>
            <p className="text-xs text-neutral-700 mt-0.5">
              {mode === 'roll'
                ? `Dates are pre-filled by rolling the original dates forward by ${rollLabel}. Edit any row to override.`
                : 'Dates come from your custom range. Edit any row to override.'}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="text-xs shrink-0"
            onClick={handleReset}
            disabled={resetDisabled}
          >
            <FontAwesomeIcon name="arrowRotateLeft" className="w-3 h-3" aria-hidden="true" />
            {mode === 'roll' ? 'Reset Dates' : 'Re-apply Range'}
          </Button>
        </div>

        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[var(--bg-table-header)]">
              <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-neutral-700 border-b border-neutral-200 w-[34%]">
                Availability
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-neutral-700 border-b border-neutral-200 w-[18%]">
                Original Dates
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-neutral-700 border-b border-neutral-200 w-[24%]">
                New Start
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-neutral-700 border-b border-neutral-200 w-[24%]">
                New End
              </th>
            </tr>
          </thead>
          <tbody>
            {availabilities.map((a, idx) => {
              const row = dates[a.id] ?? { startDate: '', endDate: '' };
              const startEmpty = !row.startDate;
              const endEmpty = !row.endDate;
              const dateOrderErr = !!row.startDate && !!row.endDate && row.startDate > row.endDate;
              // In custom mode, don't flag rows red before a range has been chosen
              const showEmptyErr = !awaitingCustomRange;
              const isEven = idx % 2 === 0;

              return (
                <tr key={a.id} className={isEven ? 'bg-card' : 'bg-neutral-50/40'}>
                  <td className="px-4 py-3 border-b border-neutral-100 align-top">
                    <p className="text-sm text-neutral-850 font-medium leading-snug">{a.name}</p>
                    {resolvedNames[a.id] && resolvedNames[a.id] !== a.name && (
                      <p className="text-xs text-blue-500 font-medium mt-0.5 leading-snug">
                        → {resolvedNames[a.id]}
                      </p>
                    )}
                    <p className="text-xs text-neutral-600 mt-0.5">
                      {a.programType} · {a.discipline}
                    </p>
                  </td>

                  <td className="px-4 py-3 border-b border-neutral-100 align-top text-xs text-neutral-700">
                    <span className="block">{formatDate(a.startDate)}</span>
                    <span className="text-neutral-500">→</span>
                    <span className="block">{formatDate(a.endDate)}</span>
                  </td>

                  <td className="px-4 py-3 border-b border-neutral-100 align-top">
                    <div className={(showEmptyErr && startEmpty) || dateOrderErr ? 'ring-1 ring-negative-default rounded-md' : ''}>
                      <DateField
                        value={row.startDate}
                        onChange={(v) => updateDate(a.id, 'startDate', v)}
                        placeholder="Start date"
                        ariaLabel={`New start date for ${a.name}`}
                      />
                    </div>
                  </td>

                  <td className="px-4 py-3 border-b border-neutral-100 align-top">
                    <div className={(showEmptyErr && endEmpty) || dateOrderErr ? 'ring-1 ring-negative-default rounded-md' : ''}>
                      <DateField
                        value={row.endDate}
                        onChange={(v) => updateDate(a.id, 'endDate', v)}
                        placeholder="End date"
                        ariaLabel={`New end date for ${a.name}`}
                      />
                    </div>
                    {dateOrderErr && (
                      <p className="text-xs text-negative-default mt-1">Start must be before end</p>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
