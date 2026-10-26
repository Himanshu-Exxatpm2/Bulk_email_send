import { Availability } from '../../../data/mockAvailabilities';
import { FontAwesomeIcon } from '../../font-awesome-icon';

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface Step3ReviewProps {
  availabilities: Availability[];
  resolvedNames: Record<string, string>;
  dates: Record<string, { startDate: string; endDate: string }>;
  onDelete: (id: string) => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function Step3Review({
  availabilities,
  resolvedNames,
  dates,
  onDelete,
}: Step3ReviewProps) {

  // Empty state — all items deleted
  if (availabilities.length === 0) {
    return (
      <div className="max-w-5xl mx-auto flex flex-col items-center justify-center py-16 gap-3">
        <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center">
          <FontAwesomeIcon name="circleQuestion" className="w-5 h-5 text-neutral-600" aria-hidden="true" />
        </div>
        <p className="text-sm font-semibold text-neutral-800">No availabilities remaining</p>
        <p className="text-xs text-neutral-600 text-center max-w-xs">
          All availabilities have been removed from this batch. Use the Back button to go
          to the previous step and adjust your selection.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-5">

      {/* ── Inherited fields banner ───────────────────────────────────────── */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-2">
          <FontAwesomeIcon
            name="circleQuestion"
            className="w-4 h-4 mt-0.5 flex-shrink-0 text-blue-500"
            aria-hidden="true"
          />
          <div>
            <p className="text-sm font-semibold text-blue-900 mb-1">What's carried over from the original</p>
            <p className="text-xs text-blue-800 leading-relaxed">
              The following details will be copied from each original availability:{' '}
              <span className="font-medium">
                Location, Location Group, Discipline, Program Type, Experience Type,
                Slot Count, and Onboarding Requirements
              </span>{' '}
              (as per the latest configuration). Only the name and dates you set in the
              previous steps will differ.
            </p>
            <p className="text-xs text-blue-700 mt-1.5">
              If you need to remove an availability from this batch, use the delete button
              on its row. To change a name or date, use the Back button.
            </p>
          </div>
        </div>
      </div>

      {/* ── Review table ──────────────────────────────────────────────────── */}
      <div className="bg-card rounded-xl shadow-[0_1px_1.5px_rgba(0,0,0,0.1),0_1px_1px_rgba(0,0,0,0.1)] overflow-hidden">
        <div className="bg-neutral-50 border-b border-neutral-200 px-4 py-2.5">
          <h3 className="text-sm font-semibold text-neutral-800">
            Review Clones ({availabilities.length})
          </h3>
          <p className="text-xs text-neutral-600 mt-0.5">
            All fields are read-only. Go back to adjust names or dates. Use the delete button to remove an availability from this batch.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[820px]">
            <thead>
              <tr className="bg-[var(--bg-table-header)]">
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-neutral-700 border-b border-neutral-200 w-[24%]">
                  New Name
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-neutral-700 border-b border-neutral-200 w-[16%]">
                  New Dates
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-neutral-700 border-b border-neutral-200 w-[12%]">
                  Discipline
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-neutral-700 border-b border-neutral-200 w-[12%]">
                  Program Type
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-neutral-700 border-b border-neutral-200 w-[10%]">
                  Exp. Type
                </th>
                <th className="text-center px-4 py-3 text-xs font-semibold uppercase tracking-wider text-neutral-700 border-b border-neutral-200 w-[8%]">
                  Slots
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-neutral-700 border-b border-neutral-200 w-[14%]">
                  Location Group
                </th>
                <th className="text-center px-4 py-3 text-xs font-semibold uppercase tracking-wider text-neutral-700 border-b border-neutral-200 w-[4%] sticky right-0 bg-[var(--bg-table-header)]">
                  {/* Delete */}
                </th>
              </tr>
            </thead>
            <tbody>
              {availabilities.map((a, idx) => {
                const newName = resolvedNames[a.id] || a.name;
                const d = dates[a.id] ?? { startDate: '', endDate: '' };
                const isEven = idx % 2 === 0;

                return (
                  <tr key={a.id} className={isEven ? 'bg-card' : 'bg-neutral-50/40'}>
                    <td className="px-4 py-3 text-sm text-neutral-850 border-b border-neutral-100 align-top font-medium">
                      {newName}
                    </td>
                    <td className="px-4 py-3 text-xs text-neutral-700 border-b border-neutral-100 align-top">
                      <span className="block">{formatDate(d.startDate)}</span>
                      <span className="text-neutral-500">→</span>
                      <span className="block">{formatDate(d.endDate)}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-700 border-b border-neutral-100 align-top">
                      {a.discipline}
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-700 border-b border-neutral-100 align-top">
                      {a.programType}
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-700 border-b border-neutral-100 align-top">
                      {a.experienceType}
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-700 border-b border-neutral-100 align-top text-center">
                      {a.slotCount}
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-700 border-b border-neutral-100 align-top">
                      {a.locationGroup}
                    </td>
                    <td className={`px-4 py-3 border-b border-neutral-100 align-top text-center sticky right-0 ${isEven ? 'bg-card' : 'bg-neutral-50'}`}>
                      <button
                        type="button"
                        onClick={() => onDelete(a.id)}
                        className="text-neutral-600 hover:text-negative-default transition-colors focus-visible:outline-2 focus-visible:outline-blue-500 rounded-sm p-1"
                        aria-label={`Remove ${newName} from batch`}
                        title="Remove from batch"
                      >
                        <FontAwesomeIcon name="trash" className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
