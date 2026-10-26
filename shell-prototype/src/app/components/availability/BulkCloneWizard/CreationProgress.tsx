import { useState, useEffect, useRef } from 'react';
import { Availability } from '../../../data/mockAvailabilities';
import { FontAwesomeIcon } from '../../font-awesome-icon';

type RowStatus = 'pending' | 'inprogress' | 'created' | 'draft';

interface CreationResult {
  availability: Availability;
  status: 'created' | 'draft';
  error?: string;
}

interface CreationProgressProps {
  availabilities: Availability[];
  resolvedNames: Record<string, string>;
  onComplete: (results: CreationResult[]) => void;
}

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

function getDraftReason(a: Availability): string {
  if (!a.locationGroup)
    return 'Location Group is no longer active in this system.';
  if (!a.discipline)
    return `Discipline "${a.discipline}" could not be resolved in this system.`;
  if (!a.programType)
    return `Program Type "${a.programType}" could not be resolved in this system.`;
  return `Program Type "${a.programType}" could not be confirmed — saved as draft for manual review.`;
}

export function CreationProgress({
  availabilities,
  resolvedNames,
  onComplete,
}: CreationProgressProps) {
  const [rowStatuses, setRowStatuses] = useState<Record<string, RowStatus>>(() => {
    const init: Record<string, RowStatus> = {};
    for (const a of availabilities) init[a.id] = 'pending';
    return init;
  });
  const [processingIndex, setProcessingIndex] = useState(1);

  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    let cancelled = false;
    const total = availabilities.length;

    async function run() {
      const statuses: Record<string, RowStatus> = {};
      for (const a of availabilities) statuses[a.id] = 'pending';
      setRowStatuses({ ...statuses });

      const results: CreationResult[] = [];

      for (let i = 0; i < total; i++) {
        if (cancelled) return;
        const a = availabilities[i];

        statuses[a.id] = 'inprogress';
        setRowStatuses({ ...statuses });
        setProcessingIndex(i + 1);

        await delay(350);
        if (cancelled) return;

        const isLast = i === total - 1;
        const toDraft = isLast && total >= 5;
        const rowStatus: RowStatus = toDraft ? 'draft' : 'created';
        const error = toDraft ? getDraftReason(a) : undefined;

        statuses[a.id] = rowStatus;
        setRowStatuses({ ...statuses });
        results.push({ availability: a, status: toDraft ? 'draft' : 'created', error });

        await delay(100);
      }

      if (!cancelled) {
        onCompleteRef.current(results);
      }
    }

    run();

    return () => { cancelled = true; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const total = availabilities.length;
  const completedCount = Object.values(rowStatuses).filter(
    (s) => s === 'created' || s === 'draft',
  ).length;
  const progressPct = total > 0 ? (completedCount / total) * 100 : 0;

  return (
    <div className="max-w-2xl mx-auto space-y-6 pt-4">

      {/* ── Progress header ───────────────────────────────────────────────── */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-neutral-800">
          {completedCount < total
            ? `Creating availability ${processingIndex} of ${total}…`
            : `Finished — ${total} availabilit${total !== 1 ? 'ies' : 'y'} processed.`}
        </p>
        <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <p className="text-xs text-neutral-600 text-right">
          {completedCount} / {total}
        </p>
      </div>

      {/* ── Row list ──────────────────────────────────────────────────────── */}
      <div className="border border-neutral-200 rounded-lg divide-y divide-neutral-100 overflow-hidden">
        {availabilities.map((a) => {
          const status = rowStatuses[a.id] ?? 'pending';
          const name = resolvedNames[a.id] || a.name;

          return (
            <div key={a.id} className="flex items-center gap-3 px-4 py-3 bg-white">
              {/* Status indicator */}
              <div className="flex-shrink-0 w-5 flex items-center justify-center">
                {status === 'pending' && (
                  <FontAwesomeIcon name="clock" className="w-4 h-4 text-neutral-500" aria-hidden="true" />
                )}
                {status === 'inprogress' && (
                  <FontAwesomeIcon name="spinner" className="w-4 h-4 text-blue-500 animate-spin" aria-hidden="true" />
                )}
                {status === 'created' && (
                  <FontAwesomeIcon name="circleCheck" className="w-4 h-4 text-positive-default" aria-hidden="true" />
                )}
                {status === 'draft' && (
                  <span
                    className="inline-flex w-4 h-4 items-center justify-center rounded-full bg-accent-100 text-warning-default text-xs font-bold leading-none"
                    aria-label="Saved as draft"
                  >
                    !
                  </span>
                )}
              </div>

              {/* Name */}
              <span className="flex-1 text-sm text-neutral-850 truncate">{name}</span>

              {/* Status label */}
              <span
                className={[
                  'text-xs font-medium flex-shrink-0',
                  status === 'pending'    ? 'text-neutral-600' : '',
                  status === 'inprogress' ? 'text-blue-500' : '',
                  status === 'created'    ? 'text-positive-default' : '',
                  status === 'draft'      ? 'text-warning-default' : '',
                ].join(' ')}
              >
                {status === 'pending'    && 'Waiting…'}
                {status === 'inprogress' && 'Creating…'}
                {status === 'created'    && 'Created'}
                {status === 'draft'      && 'Saved as draft'}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
