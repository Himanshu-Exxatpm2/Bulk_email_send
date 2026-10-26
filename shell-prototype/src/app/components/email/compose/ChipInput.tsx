import { useState } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../ui/utils';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Email addresses as removable chips. Enter, comma, semicolon or leaving the field adds what was typed. */
export function ChipInput({
  value,
  onChange,
  placeholder,
  id,
  ariaLabel,
  invalid,
}: {
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  id?: string;
  ariaLabel?: string;
  invalid?: boolean;
}) {
  const [draft, setDraft] = useState('');
  const [error, setError] = useState('');

  function commit(raw: string) {
    const parts = raw.split(/[,;\s]+/).map((s) => s.trim()).filter(Boolean);
    if (parts.length === 0) return;
    const bad = parts.find((p) => !EMAIL.test(p));
    if (bad) {
      setError(`"${bad}" is not a valid email address.`);
      return;
    }
    const lower = new Set(value.map((v) => v.toLowerCase()));
    const fresh = parts.filter((p, i) => !lower.has(p.toLowerCase()) && parts.findIndex((q) => q.toLowerCase() === p.toLowerCase()) === i);
    setError('');
    setDraft('');
    if (fresh.length > 0) onChange([...value, ...fresh]);
  }

  return (
    <div>
      <div
        className={cn(
          'flex min-h-10 flex-wrap items-center gap-1.5 rounded-md border bg-card px-2 py-1.5 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20',
          invalid || error ? 'border-negative-default' : 'border-input',
        )}
      >
        {value.map((v) => (
          <span key={v} className="inline-flex items-center gap-1 rounded-full border border-neutral-300 bg-neutral-50 py-0.5 pl-2.5 pr-1 text-sm text-neutral-900">
            {v}
            <button
              type="button"
              aria-label={`Remove ${v}`}
              className="flex size-4 items-center justify-center rounded-full text-neutral-700 hover:bg-neutral-200"
              onClick={() => onChange(value.filter((x) => x !== v))}
            >
              <X className="size-3" strokeWidth={2.5} />
            </button>
          </span>
        ))}
        <input
          id={id}
          aria-label={ariaLabel}
          value={draft}
          onChange={(e) => { setDraft(e.target.value); if (error) setError(''); }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ',' || e.key === ';') { e.preventDefault(); commit(draft); }
            else if (e.key === 'Backspace' && draft === '' && value.length > 0) onChange(value.slice(0, -1));
          }}
          onBlur={() => commit(draft)}
          onPaste={(e) => { const t = e.clipboardData.getData('text'); if (/[,;\s]/.test(t.trim())) { e.preventDefault(); commit(t); } }}
          placeholder={value.length === 0 ? placeholder : undefined}
          className="min-w-[140px] flex-1 border-0 bg-transparent px-1 py-0.5 text-sm text-neutral-900 outline-none placeholder:text-neutral-600"
        />
      </div>
      {error && <p className="mt-1 text-xs text-negative-default">{error}</p>}
    </div>
  );
}
