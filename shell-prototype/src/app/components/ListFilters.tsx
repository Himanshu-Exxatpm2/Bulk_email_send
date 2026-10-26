import { useState } from 'react';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Input } from './ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from './ui/dropdown-menu';
import { FontAwesomeIcon } from './font-awesome-icon';

/** Shell filter control: outline button reading "Label: All", with searchable option list. */
function ChipShell({
  label,
  summary,
  active,
  onClear,
  children,
}: {
  label: string;
  summary: string;
  active: boolean;
  onClear: () => void;
  children: React.ReactNode;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-9 gap-2 font-normal text-neutral-800" aria-label={`Filter by ${label}`}>
          <span className="text-neutral-700">{label}:</span>
          <span className="font-medium text-neutral-900 max-w-[140px] truncate">{summary}</span>
          <FontAwesomeIcon name="chevronDown" className="w-3 h-3 text-neutral-600" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64 p-0" onCloseAutoFocus={(e) => e.preventDefault()}>
        {children}
        {active && (
          <div className="border-t border-neutral-200">
            <button
              type="button"
              onClick={onClear}
              className="w-full text-left px-3 py-2 text-sm text-blue-500 hover:bg-neutral-100"
            >
              Clear selection
            </button>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function OptionSearch({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) {
  return (
    <div className="px-3 pt-3 pb-2 border-b border-neutral-200">
      <Input
        placeholder={`Search ${label.toLowerCase()}…`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-8 text-sm"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}

/** Multi-select (empty array = All). */
export function PillFilterChip({
  label,
  selectedValues,
  options,
  onChange,
}: {
  label: string;
  icon?: string;
  selectedValues: string[];
  options: string[];
  onChange: (values: string[]) => void;
}) {
  const [term, setTerm] = useState('');
  const shown = options.filter((o) => o.toLowerCase().includes(term.toLowerCase()));
  const toggle = (v: string) =>
    onChange(selectedValues.includes(v) ? selectedValues.filter((x) => x !== v) : [...selectedValues, v]);
  const summary =
    selectedValues.length === 0 ? 'All' : selectedValues.length === 1 ? selectedValues[0] : `${selectedValues.length} selected`;
  return (
    <ChipShell label={label} summary={summary} active={selectedValues.length > 0} onClear={() => onChange([])}>
      {options.length > 8 && <OptionSearch value={term} onChange={setTerm} label={label} />}
      <div className="max-h-72 overflow-y-auto py-1">
        {shown.length === 0 ? (
          <div className="p-4 text-sm text-neutral-600 text-center">No options found</div>
        ) : (
          shown.map((opt) => (
            <div
              key={opt}
              className="flex items-center gap-2 px-3 py-1.5 hover:bg-neutral-100 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                toggle(opt);
              }}
            >
              <Checkbox checked={selectedValues.includes(opt)} onCheckedChange={() => toggle(opt)} onClick={(e) => e.stopPropagation()} />
              <span className="flex-1 text-sm text-neutral-900">{opt}</span>
            </div>
          ))
        )}
      </div>
    </ChipShell>
  );
}

/** Single-select with an "All" default. */
export function FilterChip({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  icon?: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  const [term, setTerm] = useState('');
  const shown = options.filter((o) => o.toLowerCase().includes(term.toLowerCase()));
  const all = ['All', ...shown.filter((o) => o !== 'All')];
  return (
    <ChipShell label={label} summary={value} active={value !== 'All'} onClear={() => onChange('All')}>
      {options.length > 8 && <OptionSearch value={term} onChange={setTerm} label={label} />}
      <div className="max-h-72 overflow-y-auto py-1">
        {all.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={`w-full text-left px-3 py-1.5 text-sm hover:bg-neutral-100 ${
              value === opt ? 'text-blue-500 font-medium' : 'text-neutral-900'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </ChipShell>
  );
}
