import { useState } from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Checkbox } from '../ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '../ui/collapsible';
import { FontAwesomeIcon } from '../font-awesome-icon';
import {
  mockPartnerTiers,
  PublishPreferenceCardState,
  PublishWhen,
  WhoSees,
  todayISODate,
} from './publishPreferenceData';
import { DateField } from './DateField';
import { ScheduleTiersModal } from './ScheduleTiersModal';

// Mirrors production's per-card model: "Who sees this availability?" (with a
// Tiered Partners drill-in) + "Publish When" + conditional Publish On / Due
// Date, plus a "Set Preferred Dates for Tiers" modal and summary for the
// Tiered Partners + Scheduled combination.

function formatShort(iso: string): string {
  if (!iso) return 'Not specified';
  const [y, m, d] = iso.split('-');
  const dt = new Date(Number(y), Number(m) - 1, Number(d));
  return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ── "Who sees this availability?" custom selector ──────────────────────────
// No native radio-group exists in this project's ui/ folder, so this follows
// the same Popover-based pattern already established for date pickers
// (BulkCloneRow's inline DatePicker) rather than introducing a new primitive.
function WhoSeesSelector({
  whoSees,
  selectedTierIds,
  onWhoSeesChange,
  onTierIdsChange,
}: {
  whoSees?: WhoSees;
  selectedTierIds: string[];
  onWhoSeesChange: (v: WhoSees) => void;
  onTierIdsChange: (ids: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<'main' | 'tiers'>('main');

  const triggerLabel = whoSees ?? 'Select…';

  const toggleTier = (id: string) => {
    if (selectedTierIds.includes(id)) {
      onTierIdsChange(selectedTierIds.filter((t) => t !== id));
    } else {
      onTierIdsChange([...selectedTierIds, id]);
    }
  };

  return (
    <Popover
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) setView('main');
      }}
    >
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex items-center justify-between gap-2 text-sm border border-neutral-300 rounded-md px-3 py-2 hover:bg-neutral-50 transition-colors w-full text-left bg-white"
          aria-label="Who sees this availability?"
        >
          <span className="flex items-center gap-2">
            <span className={whoSees ? 'text-neutral-850' : 'text-neutral-600'}>{triggerLabel}</span>
            {whoSees === 'Tiered Partners' && selectedTierIds.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {selectedTierIds.length}
              </Badge>
            )}
          </span>
          <FontAwesomeIcon name="chevronDown" className="w-3 h-3 text-neutral-600 flex-shrink-0" aria-hidden="true" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-0" align="start">
        {view === 'main' ? (
          <div className="py-1">
            {(['Public', 'All Partners'] as WhoSees[]).map((opt) => (
              <button
                key={opt}
                type="button"
                className="w-full text-left px-3 py-2 text-sm hover:bg-neutral-50 flex items-center justify-between"
                onClick={() => {
                  onWhoSeesChange(opt);
                  setOpen(false);
                }}
              >
                {opt}
                {whoSees === opt && <FontAwesomeIcon name="check" className="w-3 h-3 text-blue-500" aria-hidden="true" />}
              </button>
            ))}
            <button
              type="button"
              className="w-full text-left px-3 py-2 text-sm hover:bg-neutral-50 flex items-center justify-between"
              onClick={() => {
                onWhoSeesChange('Tiered Partners');
                setView('tiers');
              }}
            >
              <span className="flex items-center gap-2">
                Tiered Partners
                {selectedTierIds.length > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {selectedTierIds.length}
                  </Badge>
                )}
              </span>
              <FontAwesomeIcon name="chevronRight" className="w-3 h-3 text-neutral-600" aria-hidden="true" />
            </button>
          </div>
        ) : (
          <div>
            <button
              type="button"
              className="w-full text-left px-3 py-2 text-xs text-neutral-600 hover:bg-neutral-50 flex items-center gap-1.5 border-b border-neutral-100"
              onClick={() => setView('main')}
            >
              <FontAwesomeIcon name="chevronLeft" className="w-3 h-3" aria-hidden="true" />
              Back
            </button>
            <div className="max-h-64 overflow-y-auto py-1">
              {mockPartnerTiers.map((tier) => (
                <label
                  key={tier.id}
                  className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-neutral-50 cursor-pointer"
                >
                  <Checkbox checked={selectedTierIds.includes(tier.id)} onCheckedChange={() => toggleTier(tier.id)} />
                  <span className="text-neutral-850">{tier.name}</span>
                </label>
              ))}
            </div>
            <div className="border-t border-neutral-100 px-3 py-2 flex justify-end">
              <Button
                size="sm"
                
                onClick={() => setOpen(false)}
              >
                Done
              </Button>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

// ── PublishPreferenceCard ───────────────────────────────────────────────────

export interface PublishPreferenceCardProps {
  card: PublishPreferenceCardState;
  index: number;
  canDelete: boolean;
  onChange: (next: PublishPreferenceCardState) => void;
  onDelete: () => void;
}

export function PublishPreferenceCard({ card, index, canDelete, onChange, onDelete }: PublishPreferenceCardProps) {
  const [tierModalOpen, setTierModalOpen] = useState(false);

  const handleWhoSeesChange = (whoSees: WhoSees) => {
    onChange({
      ...card,
      whoSees,
      selectedTierIds: whoSees === 'Tiered Partners' ? card.selectedTierIds : [],
      tierDates: whoSees === 'Tiered Partners' ? card.tierDates : [],
    });
  };

  const handleTierIdsChange = (ids: string[]) => {
    onChange({ ...card, selectedTierIds: ids });
  };

  const handlePublishWhenChange = (publishWhen: PublishWhen) => {
    onChange({
      ...card,
      publishWhen,
      tierDates: publishWhen === 'Scheduled' ? card.tierDates : [],
    });
  };

  const showPublishOnField = card.publishWhen === 'Scheduled';
  const showDueDateField = card.publishWhen === 'Now' || card.publishWhen === 'Scheduled';
  const showTierScheduleButton = showPublishOnField && card.whoSees === 'Tiered Partners';
  const hasTierDates = card.tierDates.some((t) => t.publishOn || t.dueDate);

  return (
    <div className="border border-neutral-200 rounded-lg p-4 bg-white relative">
      {canDelete && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-3 right-3 h-7 w-7 hover:bg-negative-default/10 hover:text-negative-default"
          onClick={onDelete}
          aria-label={`Remove publish preference ${index + 1}`}
        >
          <FontAwesomeIcon name="trash" className="w-3.5 h-3.5" />
        </Button>
      )}

      <p className="text-xs font-semibold uppercase tracking-wide text-neutral-600 mb-3">
        Preference {index + 1}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-neutral-800 mb-1.5">
            Who sees this availability? *
          </label>
          <WhoSeesSelector
            whoSees={card.whoSees}
            selectedTierIds={card.selectedTierIds}
            onWhoSeesChange={handleWhoSeesChange}
            onTierIdsChange={handleTierIdsChange}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-800 mb-1.5">Publish When *</label>
          <Select value={card.publishWhen} onValueChange={(v) => handlePublishWhenChange(v as PublishWhen)}>
            <SelectTrigger className="w-full text-sm" aria-label="Publish when">
              <SelectValue placeholder="Select…" />
            </SelectTrigger>
            <SelectContent className="">
              <SelectItem value="Now">Now</SelectItem>
              <SelectItem value="Scheduled">Scheduled</SelectItem>
              <SelectItem value="Do Not Publish">Do Not Publish</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {(showPublishOnField || showDueDateField) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          {showPublishOnField && (
            <div>
              <label className="block text-sm font-medium text-neutral-800 mb-1.5">Publish on *</label>
              <DateField
                value={card.publishOn}
                onChange={(iso) => onChange({ ...card, publishOn: iso })}
                ariaLabel="Publish on date"
                clearable
              />
            </div>
          )}
          {showDueDateField && (
            <div>
              <label className="block text-sm font-medium text-neutral-800 mb-1.5">Due Date *</label>
              <DateField
                value={card.dueDate}
                onChange={(iso) => onChange({ ...card, dueDate: iso })}
                ariaLabel="Due date"
                clearable
              />
              {card.dueDate && card.dueDate < (card.publishWhen === 'Scheduled' ? card.publishOn : todayISODate()) && (
                <p className="mt-1 text-xs" style={{ color: 'var(--color-negative-default)' }}>
                  Due date must be on or after the publish date
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {showTierScheduleButton && (
        <div className="mt-4">
          <Button type="button" variant="outline" size="sm" className="" onClick={() => setTierModalOpen(true)}>
            <FontAwesomeIcon name="calendar" className="w-3.5 h-3.5 mr-2" aria-hidden="true" />
            Set Preferred Dates for Tiers
          </Button>

          <ScheduleTiersModal
            open={tierModalOpen}
            onClose={() => setTierModalOpen(false)}
            tierIds={card.selectedTierIds}
            tierDates={card.tierDates}
            onSave={(next) => {
              onChange({ ...card, tierDates: next });
              setTierModalOpen(false);
            }}
          />
        </div>
      )}

      {card.whoSees === 'Tiered Partners' && hasTierDates && (
        <Collapsible className="mt-4 border-t border-neutral-100 pt-3">
          <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium text-neutral-800 group">
            <FontAwesomeIcon name="chevronRight" className="w-3 h-3 transition-transform group-data-[state=open]:rotate-90" aria-hidden="true" />
            Tiered Partners
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2 space-y-1.5">
            {card.selectedTierIds.map((tierId) => {
              const tier = mockPartnerTiers.find((t) => t.id === tierId);
              const dates = card.tierDates.find((t) => t.tierId === tierId);
              return (
                <div
                  key={tierId}
                  className="flex items-center justify-between text-xs text-neutral-700 px-2 py-1"
                >
                  <span className="font-medium text-neutral-850">{tier?.name ?? tierId}</span>
                  <span>
                    Publish On: {formatShort(dates?.publishOn ?? '')} · Due On: {formatShort(dates?.dueDate ?? '')}
                  </span>
                </div>
              );
            })}
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
}
