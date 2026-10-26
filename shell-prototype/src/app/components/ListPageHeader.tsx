import type { ReactNode } from 'react';
import { Button } from './ui/button';
import { FontAwesomeIcon, type FontAwesomeIconName } from './font-awesome-icon';

interface ListPageHeaderProps {
  title: string;
  // Primary action, top right (e.g. "Add Partner").
  action?: { label: string; onClick: () => void };
  children?: ReactNode;
}

/**
 * Base header for list pages: plain title on the left, one primary action on the
 * right. The filter bar, table and pagination footer sit below it
 * (see ListPagination for the footer).
 */
export function ListPageHeader({ title, action, children }: ListPageHeaderProps) {
  return (
    <header className="bg-card border-b border-neutral-200 w-full">
      <div className="px-6 py-3 flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-lg font-semibold text-neutral-900 leading-7">{title}</h1>
        {action && (
          <Button onClick={action.onClick}>
            <FontAwesomeIcon name={'plus' as FontAwesomeIconName} className="w-3.5 h-3.5" aria-hidden="true" />
            {action.label}
          </Button>
        )}
      </div>
      {children}
    </header>
  );
}

const PAGE_SIZES = [10, 25, 50];

interface ListPaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

/** Footer: "Rows per page [50]  Page 1 of 1 (11 items)  « ‹ 1 › »" */
export function ListPagination({ page, pageSize, total, onPageChange, onPageSizeChange }: ListPaginationProps) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const btn = 'flex items-center justify-center w-8 h-8 rounded-md text-neutral-800 hover:bg-neutral-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors';
  return (
    <div className="px-4 py-3 border-t border-neutral-200 flex flex-wrap items-center justify-end gap-x-6 gap-y-2 text-sm text-neutral-800">
      <label className="flex items-center gap-2">
        Rows per page
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="h-8 rounded-md border border-neutral-300 bg-card px-2 text-sm"
        >
          {PAGE_SIZES.map((n) => <option key={n} value={n}>{n}</option>)}
        </select>
      </label>
      <span>
        Page <strong>{page}</strong> of <strong>{pageCount}</strong>{' '}
        <span className="text-neutral-600">({total} item{total === 1 ? '' : 's'})</span>
      </span>
      <div className="flex items-center gap-1">
        <button type="button" className={btn} disabled={page <= 1} onClick={() => onPageChange(1)} aria-label="First page">
          <FontAwesomeIcon name="chevronLeft" className="w-3 h-3" /><FontAwesomeIcon name="chevronLeft" className="w-3 h-3 -ml-1.5" />
        </button>
        <button type="button" className={btn} disabled={page <= 1} onClick={() => onPageChange(page - 1)} aria-label="Previous page">
          <FontAwesomeIcon name="chevronLeft" className="w-3 h-3" />
        </button>
        <span className="flex items-center justify-center w-8 h-8 rounded-md bg-blue-500 text-white text-sm font-medium">{page}</span>
        <button type="button" className={btn} disabled={page >= pageCount} onClick={() => onPageChange(page + 1)} aria-label="Next page">
          <FontAwesomeIcon name="chevronRight" className="w-3 h-3" />
        </button>
        <button type="button" className={btn} disabled={page >= pageCount} onClick={() => onPageChange(pageCount)} aria-label="Last page">
          <FontAwesomeIcon name="chevronRight" className="w-3 h-3" /><FontAwesomeIcon name="chevronRight" className="w-3 h-3 -ml-1.5" />
        </button>
      </div>
    </div>
  );
}
