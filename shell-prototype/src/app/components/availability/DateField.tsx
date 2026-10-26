import { useState } from 'react';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { FontAwesomeIcon } from '../font-awesome-icon';

// Standalone single-date picker (Popover + Calendar) used by the Publish
// Preferences rebuild. Intentionally not shared with BulkCloneRow's inline
// DatePicker — that one is already verified/locked behavior; duplicating a
// small pure helper here avoids touching working code for an unrelated flow.

function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatDisplay(iso: string): string {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  const dt = new Date(Number(y), Number(m) - 1, Number(d));
  return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export interface DateFieldProps {
  value: string;
  onChange: (iso: string) => void;
  placeholder?: string;
  ariaLabel?: string;
  /** Shows a small clear (x) control when a value is set — matches production's
   *  "pre-filled with today, clearable" Publish On behavior. */
  clearable?: boolean;
}

export function DateField({ value, onChange, placeholder = 'Pick date', ariaLabel, clearable }: DateFieldProps) {
  const [open, setOpen] = useState(false);
  const selected = value ? new Date(value + 'T00:00:00') : undefined;

  return (
    <div className="flex items-center gap-1.5 border border-neutral-300 rounded-md px-2 py-1.5 hover:bg-neutral-50 transition-colors w-full bg-white">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="flex items-center gap-1.5 text-sm flex-1 min-w-0 text-left"
            aria-label={ariaLabel ?? placeholder}
          >
            <FontAwesomeIcon name="calendar" className="w-3 h-3 text-neutral-400 flex-shrink-0" aria-hidden="true" />
            {value ? (
              <span className="text-neutral-850 truncate">{formatDisplay(value)}</span>
            ) : (
              <span className="text-neutral-400">{placeholder}</span>
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={selected}
            onSelect={(date) => {
              if (date) {
                onChange(toISODate(date));
                setOpen(false);
              }
            }}
            initialFocus
          />
        </PopoverContent>
      </Popover>
      {clearable && value && (
        <button
          type="button"
          aria-label="Clear date"
          className="text-neutral-400 hover:text-neutral-700 px-1 flex-shrink-0"
          onClick={() => onChange('')}
        >
          <FontAwesomeIcon name="x" className="w-2.5 h-2.5" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
