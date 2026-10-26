import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { DateField } from './DateField';
import { mockPartnerTiers, TierDateOverride } from './publishPreferenceData';

// "Schedule Publishing" modal — matches production's per-tier date override
// flow for Tiered Partners + Scheduled. Lets the coordinator set a different
// Publish On / Due Date for individual tiers instead of (or layered on top
// of) the card-level default.

interface ScheduleTiersModalProps {
  open: boolean;
  onClose: () => void;
  tierIds: string[];
  tierDates: TierDateOverride[];
  onSave: (next: TierDateOverride[]) => void;
}

interface LocalDates {
  publishOn: string;
  dueDate: string;
}

export function ScheduleTiersModal({ open, onClose, tierIds, tierDates, onSave }: ScheduleTiersModalProps) {
  const [local, setLocal] = useState<Record<string, LocalDates>>({});

  // Re-seed from committed tierDates every time the modal opens (Cancel discards edits).
  useEffect(() => {
    if (open) {
      const seeded: Record<string, LocalDates> = {};
      tierIds.forEach((id) => {
        const existing = tierDates.find((t) => t.tierId === id);
        seeded[id] = { publishOn: existing?.publishOn ?? '', dueDate: existing?.dueDate ?? '' };
      });
      setLocal(seeded);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- re-seed on open only, matches BulkCloneReviewSheet's open-keyed reset pattern
  }, [open]);

  const handleSave = () => {
    const next: TierDateOverride[] = tierIds.map((id) => ({
      tierId: id,
      publishOn: local[id]?.publishOn ?? '',
      dueDate: local[id]?.dueDate ?? '',
    }));
    onSave(next);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Schedule Publishing</DialogTitle>
          <DialogDescription>
            Select the date and time to schedule publishing for the selected categories.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[360px] overflow-y-auto space-y-3 py-2 pr-1">
          {tierIds.length === 0 && (
            <p className="text-sm text-neutral-600">
              No tiers selected yet — pick at least one tier under &ldquo;Who sees this availability?&rdquo; first.
            </p>
          )}
          {tierIds.map((id) => {
            const tier = mockPartnerTiers.find((t) => t.id === id);
            return (
              <div key={id} className="border border-neutral-100 rounded-md p-3">
                <p className="text-sm font-medium text-neutral-850 mb-2">{tier?.name ?? id}</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-neutral-600 mb-1">Publish On</label>
                    <DateField
                      value={local[id]?.publishOn ?? ''}
                      onChange={(iso) =>
                        setLocal((prev) => ({ ...prev, [id]: { ...prev[id], publishOn: iso, dueDate: prev[id]?.dueDate ?? '' } }))
                      }
                      clearable
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-neutral-600 mb-1">Due Date</label>
                    <DateField
                      value={local[id]?.dueDate ?? ''}
                      onChange={(iso) =>
                        setLocal((prev) => ({ ...prev, [id]: { ...prev[id], dueDate: iso, publishOn: prev[id]?.publishOn ?? '' } }))
                      }
                      clearable
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="">
            Cancel
          </Button>
          <Button onClick={handleSave} >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
