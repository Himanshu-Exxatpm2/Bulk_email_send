// Shared hook + toolbar for every Bulk Email surface.
// All 9 surfaces use these identically — zero per-surface deviation.
import { useState, useCallback } from 'react';
import { Button } from '../ui/button';
import { FontAwesomeIcon } from '../font-awesome-icon';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useBulkEmailSelection<T extends { id: string }>(filteredRows: T[]) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  // Narrow the selection when filters change (removes ids no longer in view).
  const narrowSelection = useCallback((nextFilteredIds: Set<string>) => {
    setSelectedIds((prev) => prev.filter((id) => nextFilteredIds.has(id)));
  }, []);

  const filteredIdSet = new Set(filteredRows.map((r) => r.id));
  const selectedInView = selectedIds.filter((id) => filteredIdSet.has(id));

  const selectAllChecked: boolean | 'indeterminate' =
    selectedInView.length === 0
      ? false
      : selectedInView.length === filteredRows.length
      ? true
      : 'indeterminate';

  function handleSelectAll(checked: boolean) {
    setSelectedIds(checked ? filteredRows.map((r) => r.id) : []);
  }

  function handleSelectOne(id: string, checked: boolean) {
    setSelectedIds((prev) => (checked ? [...prev, id] : prev.filter((x) => x !== id)));
  }

  return {
    selectedIds,
    setSelectedIds,
    wizardOpen,
    setWizardOpen,
    historyOpen,
    setHistoryOpen,
    selectAllChecked,
    handleSelectAll,
    handleSelectOne,
    narrowSelection,
  };
}

// ── Bulk Email menu ──────────────────────────────────────────────────────────
// One "Bulk Email" button with a dropdown: Compose Email + Email History (same
// labels and layout as PRISM). Compose is disabled until there is something to send to.

interface BulkEmailMenuProps {
  composeDisabled?: boolean;
  onCompose: () => void;
  onHistoryOpen: () => void;
}

export function BulkEmailMenu({ composeDisabled = false, onCompose, onHistoryOpen }: BulkEmailMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" variant="outline" className="border-blue-500 text-blue-500 hover:bg-blue-50 hover:text-blue-500 gap-0 pr-0">
          <span className="pr-3">Bulk Email</span>
          <span className="flex items-center self-stretch border-l border-blue-500/40 px-2.5">
            <FontAwesomeIcon name="chevronDown" className="w-3 h-3" aria-hidden="true" />
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem disabled={composeDisabled} onSelect={onCompose} className="text-sm cursor-pointer py-2.5">
          <FontAwesomeIcon name="envelope" className="w-4 h-4 mr-2" aria-hidden="true" />
          Compose Email
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={onHistoryOpen} className="text-sm cursor-pointer py-2.5">
          <FontAwesomeIcon name="clock" className="w-4 h-4 mr-2" aria-hidden="true" />
          Email History
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ── Selection toolbar ─────────────────────────────────────────────────────────

interface SelectionToolbarProps {
  selectedCount: number;
  entityLabel: string; // e.g. "School Contacts", "Students", "Staff"
  onBulkEmail: () => void;
  onHistoryOpen: () => void;
}

export function SelectionToolbar({ selectedCount, entityLabel, onBulkEmail, onHistoryOpen }: SelectionToolbarProps) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-2 border-b border-neutral-200 bg-neutral-50 min-h-[48px]">
      <span className="text-sm text-neutral-800">
        {selectedCount > 0 ? `${selectedCount} selected` : `Select rows to email ${entityLabel}`}
      </span>
      <BulkEmailMenu composeDisabled={selectedCount === 0} onCompose={onBulkEmail} onHistoryOpen={onHistoryOpen} />
    </div>
  );
}
