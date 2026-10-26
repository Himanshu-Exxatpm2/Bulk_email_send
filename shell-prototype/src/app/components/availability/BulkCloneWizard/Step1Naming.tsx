import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Availability } from '../../../data/mockAvailabilities';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../ui/select';
import { FontAwesomeIcon } from '../../font-awesome-icon';

// Token names the user types via @ and how they map to Availability fields
const TOKENS: Array<{ token: string; label: string; field: FieldName }> = [
  { token: '@location',       label: 'Location',       field: 'location' },
  { token: '@discipline',     label: 'Discipline',     field: 'discipline' },
  { token: '@program_type',   label: 'Program Type',   field: 'programType' },
  { token: '@experience_type',label: 'Experience Type',field: 'experienceType' },
];

const TOKEN_TO_FIELD: Record<string, FieldName> = Object.fromEntries(
  TOKENS.map(({ token, field }) => [token, field]),
);

// ── Exported types ─────────────────────────────────────────────────────────────

export interface Step1Data {
  template: string;
  resolvedNames: Record<string, string>;
  locationOverrides: Record<string, string>;
}

// ── Internal types ────────────────────────────────────────────────────────────

type FieldName = 'location' | 'discipline' | 'programType' | 'experienceType';

// ── Helpers ───────────────────────────────────────────────────────────────────

function parseLocations(location: string): string[] {
  if (!location) return [];
  return location.split(',').map((s) => s.trim()).filter(Boolean);
}

function getFieldValue(
  a: Availability,
  field: FieldName,
  locationOverrides: Record<string, string>,
): string {
  switch (field) {
    case 'location': {
      const locs = parseLocations(a.location);
      if (locs.length === 1) return locs[0];
      if (locs.length > 1) return locationOverrides[a.id] ?? '';
      return '';
    }
    case 'discipline':    return a.discipline ?? '';
    case 'programType':   return a.programType ?? '';
    case 'experienceType':return a.experienceType ?? '';
  }
}

function resolveNames(
  availabilities: Availability[],
  template: string,
  locationOverrides: Record<string, string>,
): Record<string, string> {
  const result: Record<string, string> = {};
  for (const a of availabilities) {
    if (!template.trim()) { result[a.id] = ''; continue; }
    result[a.id] = template.replace(/@\w+/g, (tok) => {
      const field = TOKEN_TO_FIELD[tok];
      if (!field) return tok;
      return getFieldValue(a, field, locationOverrides);
    });
  }
  return result;
}

/**
 * After resolving names, detect within-batch duplicates and append
 * #2, #3... to each duplicate so the user sees the final name in preview.
 */
function deduplicateResolvedNames(
  names: Record<string, string>,
  availabilities: Availability[],
): Record<string, string> {
  const result: Record<string, string> = { ...names };
  const baseCount = new Map<string, number>(); // base name → occurrences so far

  for (const a of availabilities) {
    const base = result[a.id] ?? '';
    if (!base) continue;
    const count = (baseCount.get(base) ?? 0) + 1;
    baseCount.set(base, count);
    if (count > 1) {
      result[a.id] = `${base} #${count}`;
    }
  }

  return result;
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface Step1NamingProps {
  availabilities: Availability[];
  initialData: Step1Data;
  onDataChange: (data: Step1Data) => void;
  onValidityChange: (isValid: boolean) => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function Step1Naming({
  availabilities,
  initialData,
  onDataChange,
  onValidityChange,
}: Step1NamingProps) {
  const [template, setTemplate] = useState<string>(initialData.template);
  const [locationOverrides, setLocationOverrides] = useState<Record<string, string>>(
    initialData.locationOverrides,
  );
  // @ dropdown state
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownFilter, setDropdownFilter] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const conflictTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onDataChangeRef = useRef(onDataChange);
  onDataChangeRef.current = onDataChange;
  const onValidityChangeRef = useRef(onValidityChange);
  onValidityChangeRef.current = onValidityChange;

  // Resolved names: recompute whenever template or locationOverrides change
  const resolvedNames = useMemo(() => {
    const raw = resolveNames(availabilities, template, locationOverrides);
    return deduplicateResolvedNames(raw, availabilities);
  }, [availabilities, template, locationOverrides]);

  // Set of raw resolved names that appear in more than one row — used to
  // show the Duplicate badge in the preview table.
  const duplicateRawNames = useMemo(() => {
    const counts = new Map<string, number>();
    for (const a of availabilities) {
      const raw = template.replace(/@\w+/g, (tok) => {
        const field = TOKEN_TO_FIELD[tok];
        return field ? getFieldValue(a, field, locationOverrides) : tok;
      });
      if (!raw.trim()) continue;
      counts.set(raw, (counts.get(raw) ?? 0) + 1);
    }
    const dupes = new Set<string>();
    for (const [name, count] of counts) {
      if (count > 1) dupes.add(name);
    }
    return dupes;
  }, [availabilities, template, locationOverrides]);

  useEffect(() => {
    onValidityChangeRef.current(false);
    if (conflictTimerRef.current) clearTimeout(conflictTimerRef.current);

    if (!template.trim()) return;

    conflictTimerRef.current = setTimeout(() => {
      const allNamesResolved = availabilities.every(
        (a) => (resolvedNames[a.id] ?? '').trim() !== '',
      );

      const locInTemplate = /@location(?!\w)/.test(template);
      const hasUnresolvedLocPicker =
        locInTemplate &&
        availabilities.some((a) => {
          const locs = parseLocations(a.location);
          return locs.length > 1 && !locationOverrides[a.id];
        });

      onValidityChangeRef.current(allNamesResolved && !hasUnresolvedLocPicker);
    }, 300);

    return () => { if (conflictTimerRef.current) clearTimeout(conflictTimerRef.current); };
  }, [resolvedNames, template, availabilities, locationOverrides]);

  // Propagate step data to parent whenever anything changes
  useEffect(() => {
    onDataChangeRef.current({ template, resolvedNames, locationOverrides });
  }, [template, resolvedNames, locationOverrides]);

  // ── Template mutations ───────────────────────────────────────────────────

  const handleLocationOverride = useCallback((id: string, value: string) => {
    setLocationOverrides((prev) => ({ ...prev, [id]: value }));
  }, []);

  const handleTemplateInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTemplate(val);

    // Detect @ trigger: find the word currently being typed
    const cursor = e.target.selectionStart ?? val.length;
    const textBefore = val.slice(0, cursor);
    const match = textBefore.match(/@(\w*)$/);
    if (match) {
      setDropdownFilter(match[1].toLowerCase());
      setShowDropdown(true);
    } else {
      setShowDropdown(false);
      setDropdownFilter('');
    }
  };

  const handleTokenSelect = (token: string) => {
    const input = inputRef.current;
    if (!input) return;

    const cursor = input.selectionStart ?? template.length;
    const textBefore = template.slice(0, cursor);
    const textAfter = template.slice(cursor);

    // Replace the partial @word the user was typing
    const replaced = textBefore.replace(/@\w*$/, token);
    const next = replaced + textAfter;
    setTemplate(next);
    setShowDropdown(false);
    setDropdownFilter('');

    // Restore focus and move cursor to after inserted token
    setTimeout(() => {
      input.focus();
      const pos = replaced.length;
      input.setSelectionRange(pos, pos);
    }, 0);
  };

  const handleTemplateKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setShowDropdown(false);
      setDropdownFilter('');
    }
  };

  // ── Derived state ────────────────────────────────────────────────────────

  const locationInTemplate = /@location(?!\w)/.test(template);

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="max-w-5xl mx-auto space-y-5">

      {/* ── Naming guideline ─────────────────────────────────────────────── */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
        <div className="flex items-start gap-2">
          <FontAwesomeIcon
            name="circleQuestion"
            className="w-4 h-4 mt-0.5 flex-shrink-0 text-blue-500"
            aria-hidden="true"
          />
          <div>
            <p className="text-sm font-semibold text-blue-900 mb-1">Naming Convention</p>
            <p className="text-xs text-blue-800 leading-relaxed">
              <span className="font-medium">Recommended format:</span>{' '}
              <span className="font-mono bg-blue-100 px-1 py-0.5 rounded text-blue-900">
                Location – Discipline – Program Type – Season Year
              </span>
            </p>
            <p className="text-xs text-blue-700 mt-1 leading-relaxed">
              Example: <span className="italic">MedStar ICU – Nursing – BSN – Spring 2027</span>
            </p>
            <ul className="mt-2 space-y-1 text-xs text-blue-700 list-disc list-inside">
              <li>Use a separator text chip (e.g. <span className="font-mono bg-blue-100 px-0.5 rounded"> – </span>) between fields to keep names readable.</li>
              <li>Include a season or year text chip so the clone is clearly distinct from the original.</li>
              <li>If two or more clones resolve to the same name, a #2, #3 … suffix is added automatically to keep each one unique — no action needed.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* ── Section 1: Template builder ──────────────────────────────────── */}
      <div className="bg-card rounded-xl shadow-[0_1px_1.5px_rgba(0,0,0,0.1),0_1px_1px_rgba(0,0,0,0.1)] p-5">
        <h3 className="text-sm font-semibold text-neutral-850 mb-0.5">Name Template</h3>
        <p className="text-xs text-neutral-600 mb-3">
          Type freely. Use <span className="font-mono bg-neutral-100 px-1 rounded">@</span> to insert
          a merge field (e.g. <span className="font-mono bg-neutral-100 px-1 rounded">@discipline</span>).
          Add separators and season labels as plain text.
        </p>

        {/* Single input bar */}
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={template}
            onChange={handleTemplateInput}
            onKeyDown={handleTemplateKeyDown}
            onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
            placeholder={`e.g. @location – @discipline – Spring 2027`}
            className="w-full h-10 px-3 text-sm border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
          />

          {/* @ dropdown */}
          {showDropdown && (
            <div className="absolute z-10 top-full mt-1 left-0 w-64 bg-card rounded-xl shadow-[0_1px_1.5px_rgba(0,0,0,0.1),0_1px_1px_rgba(0,0,0,0.1)] shadow-lg overflow-hidden">
              <div className="px-3 py-2 bg-neutral-50 border-b border-neutral-100">
                <p className="text-xs text-neutral-600 font-medium uppercase tracking-wide">Insert field</p>
              </div>
              {TOKENS.filter((t) =>
                t.label.toLowerCase().includes(dropdownFilter) ||
                t.token.toLowerCase().includes(dropdownFilter)
              ).map(({ token, label }) => (
                <button
                  key={token}
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); handleTokenSelect(token); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-blue-50 text-left transition-colors"
                >
                  <span className="font-mono text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded shrink-0">
                    {token}
                  </span>
                  <span className="text-sm text-neutral-800">{label}</span>
                </button>
              ))}
              {TOKENS.filter((t) =>
                t.label.toLowerCase().includes(dropdownFilter) ||
                t.token.toLowerCase().includes(dropdownFilter)
              ).length === 0 && (
                <p className="px-3 py-3 text-xs text-neutral-600 italic">No matching fields</p>
              )}
            </div>
          )}
        </div>

        {/* Available tokens hint */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          <span className="text-xs text-neutral-600 shrink-0 self-center">Available:</span>
          {TOKENS.map(({ token, label }) => (
            <button
              key={token}
              type="button"
              onClick={() => {
                setTemplate((prev) => prev + (prev.endsWith(' ') || prev === '' ? '' : ' ') + token + ' ');
                setTimeout(() => inputRef.current?.focus(), 0);
              }}
              className="font-mono text-xs bg-blue-50 text-blue-600 border border-blue-200 px-2 py-0.5 rounded hover:bg-blue-100 transition-colors"
              title={label}
            >
              {token}
            </button>
          ))}
        </div>
      </div>

      {/* ── Section 2: Live preview table ────────────────────────────────── */}
      <div className="bg-card rounded-xl shadow-[0_1px_1.5px_rgba(0,0,0,0.1),0_1px_1px_rgba(0,0,0,0.1)] overflow-hidden">
        <div className="bg-neutral-50 border-b border-neutral-200 px-4 py-2.5 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-neutral-800">Name Preview</h3>
          <span className="text-xs text-neutral-600">
            {availabilities.length} availabilit{availabilities.length !== 1 ? 'ies' : 'y'}
          </span>
        </div>

        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[var(--bg-table-header)]">
              <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-neutral-700 border-b border-neutral-200 w-[38%]">
                Original Name
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-neutral-700 border-b border-neutral-200 w-[46%]">
                New Name
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-neutral-700 border-b border-neutral-200 w-[16%]">
                Duplicate Check
              </th>
            </tr>
          </thead>
          <tbody>
            {availabilities.map((a, idx) => {
              const locs = parseLocations(a.location);
              const needsLocPick =
                locs.length > 1 && locationInTemplate && !locationOverrides[a.id];
              const isEven = idx % 2 === 0;
              const rawResolved = template.replace(/@\w+/g, (tok) => {
                const field = TOKEN_TO_FIELD[tok];
                return field ? getFieldValue(a, field, locationOverrides) : tok;
              });
              const finalName = resolvedNames[a.id] ?? rawResolved;
              const dedupSuffix = finalName !== rawResolved
                ? finalName.slice(rawResolved.length).trim()
                : null;
              const isDuplicate = rawResolved.trim() !== '' && duplicateRawNames.has(rawResolved);

              return (
                <tr
                  key={a.id}
                  className={isEven ? 'bg-card' : 'bg-neutral-50/40'}
                >
                  {/* Original name */}
                  <td className="px-4 py-3 text-sm text-neutral-800 border-b border-neutral-100 align-top">
                    {a.name}
                  </td>

                  {/* New name */}
                  <td className="px-4 py-3 text-sm border-b border-neutral-100 align-top">
                    {!template.trim() ? (
                      <span className="text-neutral-600">—</span>
                    ) : (
                      <div>
                        <div className="leading-relaxed break-all">
                          {/* Render template parts: tokens as chips, text as plain */}
                          {template.split(/(@\w+)/g).map((part, i) => {
                            if (TOKEN_TO_FIELD[part]) {
                              const val = getFieldValue(a, TOKEN_TO_FIELD[part], locationOverrides);
                              if (val === '') {
                                return (
                                  <span
                                    key={i}
                                    className="inline-block bg-accent-100 text-warning-default text-xs font-medium px-1 py-0.5 rounded mx-0.5 align-baseline"
                                  >
                                    {part}
                                  </span>
                                );
                              }
                              return (
                                <span
                                  key={i}
                                  className="inline-block bg-blue-100 text-blue-700 text-xs font-medium px-1 py-0.5 rounded mx-0.5 align-baseline"
                                >
                                  {val}
                                </span>
                              );
                            }
                            return <span key={i} className="text-neutral-850">{part}</span>;
                          })}

                          {dedupSuffix && (
                            <span className="inline-block bg-accent-100 text-warning-default text-xs font-semibold px-1.5 py-0.5 rounded ml-1 align-baseline">
                              {dedupSuffix}
                            </span>
                          )}
                        </div>

                        {/* Location picker for multi-location availabilities */}
                        {needsLocPick && (
                          <div className="mt-2">
                            <Select
                              value={locationOverrides[a.id] ?? ''}
                              onValueChange={(val) => handleLocationOverride(a.id, val)}
                            >
                              <SelectTrigger size="sm" className="h-7 text-xs max-w-[280px]">
                                <SelectValue placeholder="Select location…" />
                              </SelectTrigger>
                              <SelectContent>
                                {locs.map((loc) => (
                                  <SelectItem key={loc} value={loc} className="text-xs">
                                    {loc}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </div>
                    )}
                  </td>

                  {/* Duplicate Check */}
                  <td className="px-4 py-3 border-b border-neutral-100 align-top">
                    {isDuplicate ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-negative-default/10 border border-negative-default/30 text-negative-default text-xs font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-negative-default flex-shrink-0" />
                        Duplicate
                      </span>
                    ) : (
                      template.trim() && rawResolved.trim() && !rawResolved.includes('TBD') ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-positive-default/10 border border-positive-default/30 text-positive-default text-xs font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-positive-default flex-shrink-0" />
                          Unique
                        </span>
                      ) : null
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
