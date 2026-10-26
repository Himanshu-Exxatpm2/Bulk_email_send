import { useMemo, useState } from 'react';
import { FontAwesomeIcon } from '../font-awesome-icon';
import { MERGE_FIELD_GROUPS, mergeToken, type MergeFieldDef } from '../../data/mergeFieldCatalog';

interface MergeFieldListProps {
  fields: MergeFieldDef[];
  /** Called with the text to insert: the bare token, or a whole block for list fields. */
  onInsert: (text: string) => void;
  maxHeightClass?: string;
}

/**
 * Merge field menu body: search box and fields grouped by what they describe
 * (Recipient, Schedule, Location, Slot Request…). One component for the compose
 * panel and both template editors, so every place offers the same fields.
 */
export function MergeFieldList({ fields, onInsert, maxHeightClass = 'max-h-80' }: MergeFieldListProps) {
  const [term, setTerm] = useState('');
  const groups = useMemo(() => {
    const q = term.trim().toLowerCase();
    const shown = q === '' ? fields : fields.filter((f) => f.label.toLowerCase().includes(q) || f.token.toLowerCase().includes(q) || f.description.toLowerCase().includes(q));
    return MERGE_FIELD_GROUPS.map((g) => ({ group: g, items: shown.filter((f) => f.group === g) })).filter((g) => g.items.length > 0);
  }, [fields, term]);

  return (
    <div>
      <div className="relative mb-1.5">
        <FontAwesomeIcon name="search" className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-neutral-600" />
        <input
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder={`Search ${fields.length} fields`}
          aria-label="Search merge fields"
          className="w-full h-8 rounded-md border border-neutral-300 bg-card pl-8 pr-2 text-sm outline-none focus:border-blue-500"
        />
      </div>
      <div className={`${maxHeightClass} overflow-y-auto`}>
        {groups.length === 0 && <p className="px-2 py-6 text-center text-sm text-neutral-600">No field matches.</p>}
        {groups.map(({ group, items }) => (
          <div key={group}>
            <p className="sticky top-0 bg-popover px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-neutral-600">{group}</p>
            {items.map((f) => (
              <button
                key={f.token}
                type="button"
                title={f.description}
                className="w-full text-left px-2 py-1.5 text-sm hover:bg-[var(--bg-container)] rounded-sm flex items-center justify-between gap-2"
                onClick={() => onInsert(mergeToken(f))}
              >
                <span className="text-neutral-800">{f.label}</span>
                <span className="text-neutral-700 text-xs truncate font-mono">{f.kind === 'list' ? 'list' : `{{${f.token}}}`}</span>
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
