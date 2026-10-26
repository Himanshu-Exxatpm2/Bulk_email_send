import { useMemo, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
} from 'lucide-react';
import { Input } from './ui/input';
import { FontAwesomeIcon, type FontAwesomeIconName } from './font-awesome-icon';
import launchGradientWash from '../../assets/launch/gradient-wash.png';

export interface LaunchGridItem {
  id: string;
  title: string;
  subtitle?: string;
}

interface LaunchGridProps {
  items: LaunchGridItem[];
  onSelect: (id: string) => void;
  icon: FontAwesomeIconName;
  pageSize?: number;
  /** Override the "of N results" count to mimic a larger live catalog. */
  totalCountOverride?: number;
  searchPlaceholder?: string;
  emptyNoun?: string;
}

/**
 * Shared launch-page body — title, search, 3-up card grid, pagination.
 * Used by both the Sites and Schools launch pages (Figma 263:3288 / 413:6334).
 */
export function LaunchGrid({
  items,
  onSelect,
  icon,
  pageSize = 18,
  totalCountOverride,
  searchPlaceholder = 'Search by name...',
  emptyNoun = 'results',
}: LaunchGridProps) {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (it) =>
        it.title.toLowerCase().includes(q) ||
        (it.subtitle?.toLowerCase().includes(q) ?? false),
    );
  }, [items, query]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, pageCount - 1);
  const start = safePage * pageSize;
  const pageItems = filtered.slice(start, start + pageSize);
  const totalForCopy = query.trim() ? filtered.length : totalCountOverride ?? filtered.length;
  const showingFrom = filtered.length === 0 ? 0 : start + 1;
  const showingTo = Math.min(start + pageSize, filtered.length);

  return (
    <div className="relative min-h-full overflow-hidden bg-[#f6f7fa]">
      <img
        aria-hidden
        src={launchGradientWash}
        alt=""
        className="pointer-events-none absolute top-0 right-0 h-full w-[min(55%,832px)] object-cover object-left select-none"
      />

      <div className="relative mx-auto flex min-h-[calc(100vh-3rem)] max-w-[1320px] flex-col px-6 pt-8 pb-6 sm:px-12">
        <div className="mb-6 flex shrink-0 items-center justify-between gap-4">
          <h1 className="text-[22px] font-semibold tracking-tight text-[#111827]">Launch Page</h1>
          <div className="relative w-[330px] max-w-full">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-500" />
            <Input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(0);
              }}
              placeholder={searchPlaceholder}
              className="h-9 rounded-md border-[#d1d5db] bg-white pl-9 shadow-sm"
            />
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col">
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {pageItems.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => onSelect(item.id)}
                  className="flex h-full w-full items-center gap-3 rounded-lg border border-[#e5e7eb] bg-white px-4 py-3.5 text-left shadow-sm transition-colors hover:border-[#c7d2fe]"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded bg-[#eef0fb] text-[#3f51b5]">
                    <FontAwesomeIcon name={icon} className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold leading-snug text-[#111827]">
                      {item.title}
                    </span>
                    {item.subtitle && (
                      <span className="mt-0.5 block truncate text-xs text-[#6b7280]">
                        {item.subtitle}
                      </span>
                    )}
                  </span>
                </button>
              </li>
            ))}
          </ul>

          {filtered.length === 0 && (
            <p className="py-12 text-center text-sm text-[#6b7280]">
              No {emptyNoun} match your search.
            </p>
          )}

          <div className="mt-auto flex flex-col gap-3 pt-16 pb-1 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-[#6b7280]">
              Showing{' '}
              <span className="font-medium text-[#374151]">
                {showingFrom} to {showingTo}
              </span>{' '}
              of <span className="font-medium text-[#374151]">{totalForCopy}</span> results
            </p>

            <div className="flex items-center gap-1">
              <PagerBtn disabled={safePage === 0} onClick={() => setPage(0)} label="First">
                <ChevronsLeft className="h-3.5 w-3.5" />
              </PagerBtn>
              <PagerBtn
                disabled={safePage === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                label="Prev"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </PagerBtn>
              {Array.from({ length: Math.min(pageCount, 5) }, (_, i) => (
                <PagerBtn
                  key={i}
                  active={safePage === i}
                  onClick={() => setPage(i)}
                  label={`Page ${i + 1}`}
                >
                  {i + 1}
                </PagerBtn>
              ))}
              {pageCount > 5 && <span className="px-1 text-sm text-[#9ca3af]">…</span>}
              <PagerBtn
                disabled={safePage >= pageCount - 1}
                onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
                label="Next"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </PagerBtn>
              <PagerBtn
                disabled={safePage >= pageCount - 1}
                onClick={() => setPage(pageCount - 1)}
                label="Last"
              >
                <ChevronsRight className="h-3.5 w-3.5" />
              </PagerBtn>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PagerBtn({
  children,
  onClick,
  disabled,
  active,
  label,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex h-8 min-w-8 items-center justify-center rounded border px-2 text-sm font-medium disabled:opacity-40 ${
        active
          ? 'border-[#3f51b5] bg-[#3f51b5] text-white'
          : 'border-[#d1d5db] bg-white text-[#374151] hover:bg-neutral-50'
      }`}
    >
      {children}
    </button>
  );
}
