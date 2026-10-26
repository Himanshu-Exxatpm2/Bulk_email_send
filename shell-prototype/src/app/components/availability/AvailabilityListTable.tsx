import { useState } from 'react';
import { FontAwesomeIcon } from '../font-awesome-icon';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Checkbox } from '../ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import { Availability } from '../../data/mockAvailabilities';

interface AvailabilityListTableProps {
  availabilities: Availability[];
  selectedIds: string[];
  onSelectAll: (checked: boolean) => void;
  onSelectOne: (id: string, checked: boolean) => void;
  onClone: (id: string) => void;
  onBulkClone: () => void;
  formatDate: (date: string) => string;
}

const STATUS_CLASSES: Record<Availability['status'], string> = {
  Published: 'bg-positive-default/10 text-positive-default hover:bg-positive-default/10',
  Scheduled: 'bg-accent-100 text-warning-default hover:bg-accent-100',
  Draft:     'bg-neutral-100 text-neutral-700 hover:bg-neutral-100',
  Closed:    'bg-neutral-100 text-neutral-800 hover:bg-neutral-100',
};

function StatusBadge({ status }: { status: Availability['status'] }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="w-fit">
          <Badge
            variant="secondary"
            className={`${STATUS_CLASSES[status]}`}
          >
            {status}
          </Badge>
        </span>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="max-w-[240px] text-center text-xs leading-snug">
        Status reflects whether this availability accepts new slot requests — it's
        independent of the Upcoming/Current/Completed tab, which is based on rotation
        dates only. A Closed availability can still appear under Current or Upcoming
        if its dates haven't elapsed. Scheduled means the publish date is in the future;
        Draft means it hasn't been published yet.
      </TooltipContent>
    </Tooltip>
  );
}

function ExperienceBadge({ type }: { type: Availability['experienceType'] }) {
  return (
    <Badge
      variant="secondary"
      className={`${
        type === 'Group'
          ? 'bg-blue-100 text-blue-800 hover:bg-blue-100'
          : 'bg-purple-100 text-purple-800 hover:bg-purple-100'
      }`}
    >
      {type}
    </Badge>
  );
}

// Hard cap on a single bulk-clone batch (decided Oct 2026). A soft advisory is
// shown from ADVISORY_THRESHOLD selections upward.
export const MAX_CLONE_SELECTION = 25;
export const ADVISORY_THRESHOLD = 15;

// ── Selection toolbar ────────────────────────────────────────────────────────
// • 0 selected → disabled button (disabled-not-hidden)
// • 1 selected → nudge text replaces button (single rows use the row Clone action)
// • ≥2 selected → enabled "Clone N Availabilities" button
// • ≥15 selected → dismissible advisory; 25 is the hard cap
function SelectionToolbar({
  selectedCount,
  onBulkClone,
}: {
  selectedCount: number;
  onBulkClone: () => void;
}) {
  const [advisoryDismissed, setAdvisoryDismissed] = useState(false);
  const atCap = selectedCount >= MAX_CLONE_SELECTION;
  const showAdvisory = selectedCount >= ADVISORY_THRESHOLD && !advisoryDismissed;

  return (
    <div className="border-b border-neutral-200 bg-neutral-50">
      <div className="flex items-center justify-between gap-4 px-4 py-2 min-h-[48px]">
        <span className="text-sm text-neutral-800">
          {selectedCount > 0
            ? `${selectedCount} selected${atCap ? ` (maximum ${MAX_CLONE_SELECTION})` : ''}`
            : 'Select rows to bulk clone'}
        </span>

        {selectedCount === 1 ? (
          <p className="text-sm text-blue-600">
            Select 2 or more to bulk clone — use Clone for just this one.
          </p>
        ) : (
          <Button size="sm" disabled={selectedCount < 2} onClick={onBulkClone}>
            <FontAwesomeIcon name="copy" className="w-4 h-4" aria-hidden="true" />
            {selectedCount >= 2 ? `Clone ${selectedCount} Availabilities` : 'Clone Availabilities'}
          </Button>
        )}
      </div>

      {showAdvisory && (
        <div
          role="status"
          className="flex items-start gap-2 px-4 py-2 border-t border-accent-200 bg-accent-50 text-sm text-warning-default"
        >
          <FontAwesomeIcon name="circleQuestion" className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
          <span className="flex-1">
            Large batches take longer to review — consider splitting by location or discipline.
          </span>
          <button
            type="button"
            onClick={() => setAdvisoryDismissed(true)}
            aria-label="Dismiss advisory"
            className="text-warning-default hover:underline shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
}

export function AvailabilityListTable({
  availabilities,
  selectedIds,
  onSelectAll,
  onSelectOne,
  onClone,
  onBulkClone,
  formatDate,
}: AvailabilityListTableProps) {
  // ── Tri-state header checkbox — copied verbatim from JobListTable ─────────
  const allChecked =
    availabilities.length > 0 && selectedIds.length === availabilities.length;
  const someChecked =
    selectedIds.length > 0 && selectedIds.length < availabilities.length;
  const selectAllChecked: true | false | 'indeterminate' = allChecked
    ? true
    : someChecked
    ? 'indeterminate'
    : false;

  return (
    <div>
      <SelectionToolbar
        selectedCount={selectedIds.length}
        onBulkClone={onBulkClone}
      />

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-[var(--bg-table-header)]">
              <TableHead className="w-11 min-w-11 max-w-11 border-r border-neutral-200 text-center !px-0">
                <div className="inline-flex items-center justify-center w-full h-full">
                  <Checkbox
                    checked={selectAllChecked}
                    onCheckedChange={(checked) => onSelectAll(checked === true)}
                    aria-label="Select all availabilities"
                  />
                </div>
              </TableHead>
              <TableHead className="font-medium border-r border-neutral-200 text-xs tracking-wider uppercase">
                Availability Name
              </TableHead>
              <TableHead className="font-medium border-r border-neutral-200 text-xs tracking-wider uppercase">
                Dates
              </TableHead>
              <TableHead className="font-medium border-r border-neutral-200 text-xs tracking-wider uppercase">
                Location Group
              </TableHead>
              <TableHead className="font-medium border-r border-neutral-200 text-xs tracking-wider uppercase">
                Discipline
              </TableHead>
              <TableHead className="font-medium border-r border-neutral-200 text-xs tracking-wider uppercase">
                Experience
              </TableHead>
              <TableHead className="font-medium border-r border-neutral-200 text-xs tracking-wider uppercase w-16 text-center">
                Slots
              </TableHead>
              <TableHead className="font-medium border-r border-neutral-200 text-xs tracking-wider uppercase">
                Status
              </TableHead>
              <TableHead className="font-medium w-28 text-xs tracking-wider uppercase">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {availabilities.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-12 text-neutral-600">
                  No availabilities match the current filters.
                </TableCell>
              </TableRow>
            ) : (
              availabilities.map((avail) => (
                <TableRow
                  key={avail.id}
                  className="hover:bg-neutral-50 transition-colors"
                >
                  <TableCell
                    className="border-r border-neutral-200 w-11 min-w-11 max-w-11 text-center !p-0"
                    onClick={(e) => e.stopPropagation()}
                    style={{ width: '44px', minWidth: '44px', maxWidth: '44px' }}
                  >
                    <div className="inline-flex items-center justify-center w-full h-full">
                      {(() => {
                        const isSelected = selectedIds.includes(avail.id);
                        const capped = !isSelected && selectedIds.length >= MAX_CLONE_SELECTION;
                        const box = (
                          <Checkbox
                            checked={isSelected}
                            disabled={capped}
                            onCheckedChange={(checked) =>
                              onSelectOne(avail.id, checked as boolean)
                            }
                            aria-label={`Select ${avail.name}`}
                          />
                        );
                        return capped ? (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="inline-flex">{box}</span>
                            </TooltipTrigger>
                            <TooltipContent side="right" className="text-xs">
                              Maximum {MAX_CLONE_SELECTION} selections reached.
                            </TooltipContent>
                          </Tooltip>
                        ) : (
                          box
                        );
                      })()}
                    </div>
                  </TableCell>

                  <TableCell className="border-r border-neutral-200">
                    <div className="space-y-1">
                      <div className="font-medium text-neutral-900 text-sm leading-snug">
                        {avail.name}
                      </div>
                      <div className="text-xs text-neutral-600">
                        {avail.location}
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="border-r border-neutral-200 text-sm text-neutral-800 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <FontAwesomeIcon name="calendar" className="w-3 h-3 text-neutral-400" aria-hidden="true" />
                      {formatDate(avail.startDate)} – {formatDate(avail.endDate)}
                    </div>
                  </TableCell>

                  <TableCell className="border-r border-neutral-200 text-sm text-neutral-800">
                    <div className="flex items-center gap-1">
                      <FontAwesomeIcon name="locationDot" className="w-3 h-3 text-neutral-400" aria-hidden="true" />
                      {avail.locationGroup}
                    </div>
                  </TableCell>

                  <TableCell className="border-r border-neutral-200">
                    <div className="text-sm text-neutral-900 font-medium">
                      {avail.discipline}
                    </div>
                    <div className="text-xs text-neutral-600">
                      {avail.programType}
                    </div>
                  </TableCell>

                  <TableCell className="border-r border-neutral-200">
                    <ExperienceBadge type={avail.experienceType} />
                  </TableCell>

                  <TableCell className="border-r border-neutral-200 text-center">
                    <div className="flex items-center justify-center gap-1 text-sm text-neutral-800">
                      <FontAwesomeIcon name="users" className="w-3 h-3 text-neutral-400" aria-hidden="true" />
                      {avail.slotCount}
                    </div>
                  </TableCell>

                  <TableCell className="border-r border-neutral-200">
                    <StatusBadge status={avail.status} />
                  </TableCell>

                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-neutral-100"
                        aria-label={`Clone ${avail.name}`}
                        onClick={() => onClone(avail.id)}
                      >
                        <FontAwesomeIcon name="copy" className="h-4 w-4" aria-hidden="true" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-neutral-100"
                        aria-label={`Edit ${avail.name}`}
                        onClick={() => console.log('Edit:', avail.id)}
                      >
                        <FontAwesomeIcon name="penToSquare" className="h-4 w-4" aria-hidden="true" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-negative-default/10 hover:text-negative-default"
                        aria-label={`Delete ${avail.name}`}
                        onClick={() => console.log('Delete:', avail.id)}
                      >
                        <FontAwesomeIcon name="trash" className="h-4 w-4" aria-hidden="true" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
