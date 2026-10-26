import { Availability } from '../../../data/mockAvailabilities';
import { Button } from '../../ui/button';
import { FontAwesomeIcon } from '../../font-awesome-icon';

interface CreationResult {
  availability: Availability;
  status: 'created' | 'draft';
  error?: string;
}

interface CreationSummaryProps {
  results: CreationResult[];
  resolvedNames: Record<string, string>;
  onDone: () => void;
  onViewDrafts: () => void;
}

export function CreationSummary({
  results,
  resolvedNames,
  onDone,
  onViewDrafts,
}: CreationSummaryProps) {
  const created = results.filter((r) => r.status === 'created');
  const drafts  = results.filter((r) => r.status === 'draft');

  return (
    <div className="max-w-2xl mx-auto space-y-6 pt-4">

      {/* ── Created section ───────────────────────────────────────────────── */}
      {created.length > 0 && (
        <div className="border border-positive-default/30 rounded-lg overflow-hidden">
          <div className="bg-positive-default/10 px-4 py-3 flex items-center gap-2 border-b border-positive-default/30">
            <FontAwesomeIcon name="circleCheck" className="w-4 h-4 text-positive-default flex-shrink-0" aria-hidden="true" />
            <span className="text-sm font-semibold text-positive-default">
              {created.length} {created.length === 1 ? 'availability' : 'availabilities'} created successfully
            </span>
          </div>
          <ul className="divide-y divide-positive-default bg-white">
            {created.map((r) => {
              const name = resolvedNames[r.availability.id] || r.availability.name;
              return (
                <li key={r.availability.id} className="flex items-center justify-between px-4 py-2.5">
                  <span className="text-sm text-neutral-850">{name}</span>
                  <button
                    type="button"
                    className="text-xs text-blue-500 hover:underline flex-shrink-0 ml-4"
                    onClick={() => console.log('View availability:', r.availability.id)}
                  >
                    (View)
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* ── Drafts section ────────────────────────────────────────────────── */}
      {drafts.length > 0 && (
        <div className="border border-accent-200 rounded-lg overflow-hidden">
          <div className="bg-accent-50 px-4 py-3 flex items-center gap-2 border-b border-accent-200">
            <span
              className="inline-flex w-4 h-4 flex-shrink-0 items-center justify-center rounded-full bg-accent-200 text-warning-default text-xs font-bold leading-none"
              aria-hidden="true"
            >
              !
            </span>
            <span className="text-sm font-semibold text-warning-default">
              {drafts.length} {drafts.length === 1 ? 'availability' : 'availabilities'} saved as draft
            </span>
          </div>
          <ul className="divide-y divide-accent-100 bg-white">
            {drafts.map((r) => {
              const name = resolvedNames[r.availability.id] || r.availability.name;
              return (
                <li key={r.availability.id} className="px-4 py-2.5">
                  <span className="text-sm text-neutral-850 block">{name}</span>
                  {r.error && (
                    <span className="text-xs text-neutral-600 mt-0.5 block">{r.error}</span>
                  )}
                </li>
              );
            })}
          </ul>
          <div className="bg-accent-50 px-4 py-2.5 border-t border-accent-100">
            <p className="text-xs text-warning-default">
              These were saved as drafts. Open each one individually to resolve the issue and publish.
            </p>
          </div>
        </div>
      )}

      {/* ── Footer buttons ─────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 pt-2">
        <Button
          
          onClick={onDone}
        >
          Done
        </Button>
        {drafts.length > 0 && (
          <button
            type="button"
            className="text-sm text-blue-500 hover:underline"
            onClick={onViewDrafts}
          >
            Close
          </button>
        )}
      </div>
    </div>
  );
}
