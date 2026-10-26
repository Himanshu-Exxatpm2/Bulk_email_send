import { mergeToken, type MergeFieldDef } from '../../../data/mergeFieldCatalog';

/** Floating list of merge fields shown while typing "@word" in the email body. */
export function AtMenu({ fields, query, onPick }: { fields: MergeFieldDef[]; query: string; onPick: (text: string) => void }) {
  const q = query.toLowerCase();
  const shown = fields.filter((f) => `${f.label} ${f.token}`.toLowerCase().includes(q)).slice(0, 8);
  if (shown.length === 0) return null;
  return (
    <ul className="absolute z-30 mt-1 w-72 rounded-md border border-neutral-200 bg-popover p-1 shadow-md" role="listbox" aria-label="Merge fields">
      {shown.map((f) => (
        <li key={f.token}>
          <button
            type="button"
            className="flex w-full items-center justify-between gap-2 rounded-sm px-2 py-1.5 text-left text-sm hover:bg-neutral-100"
            onMouseDown={(e) => { e.preventDefault(); onPick(mergeToken(f)); }}
          >
            <span className="text-neutral-900">{f.label}</span>
            <span className="font-mono text-xs text-neutral-700">{`@${f.token}`}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}
