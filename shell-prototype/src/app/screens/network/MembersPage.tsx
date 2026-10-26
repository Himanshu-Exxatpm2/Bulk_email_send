/**
 * Unified Members page — sticky tabs+filters, funnel columns, sortable metrics.
 */

import { useMemo, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  BookOpen,
  Building2,
  FileDown,
  Gauge,
  Map,
  MapPin,
  RotateCcw,
  Search,
  type LucideIcon,
} from 'lucide-react';
import { MemberProfileModal } from '../../components/network/MemberProfileModal';
import { Input } from '../../components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import {
  clinicalSiteRows,
  matchesPerformanceFilter,
  memberSchoolRows,
  membersPageCopy,
  membersTabs,
  performanceFilterOptions,
  type ClinicalSiteRow,
  type MemberSchoolRow,
  type MemberStatus,
  type MemberStatusFilter,
  type MembersTabId,
  type PerformanceFilterId,
} from '../../config/members';

const PAGE_SIZE = 8;

type SortKey =
  | 'availabilities'
  | 'requested'
  | 'approvalPct'
  | 'confirmationPct'
  | 'uniqueStudents';

type SortDir = 'asc' | 'desc';

export function MembersPage() {
  const [tab, setTab] = useState<MembersTabId>('clinical-sites');
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<MemberStatusFilter>('all');
  const [performance, setPerformance] = useState<PerformanceFilterId>('all');
  const [page, setPage] = useState(0);
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [siteProfile, setSiteProfile] = useState<ClinicalSiteRow | null>(null);
  const [schoolProfile, setSchoolProfile] = useState<MemberSchoolRow | null>(null);

  const isSites = tab === 'clinical-sites';
  const perfLabel =
    performanceFilterOptions.find((o) => o.id === performance)?.label ?? 'All';

  const filteredSites = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = clinicalSiteRows.filter((r) => {
      if (status !== 'all' && r.status !== status) return false;
      if (!matchesPerformanceFilter(r.approvalPct, r.confirmationPct, performance)) {
        return false;
      }
      if (!q) return true;
      return (
        r.name.toLowerCase().includes(q) ||
        r.location.toLowerCase().includes(q) ||
        r.type.toLowerCase().includes(q) ||
        r.system.toLowerCase().includes(q)
      );
    });
    if (sortKey) {
      list = [...list].sort((a, b) => compareNum(a[sortKey], b[sortKey], sortDir));
    }
    return list;
  }, [query, status, performance, sortKey, sortDir]);

  const filteredSchools = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = memberSchoolRows.filter((r) => {
      if (status !== 'all' && r.status !== status) return false;
      if (!matchesPerformanceFilter(r.approvalPct, r.confirmationPct, performance)) {
        return false;
      }
      if (!q) return true;
      return (
        r.name.toLowerCase().includes(q) ||
        r.location.toLowerCase().includes(q) ||
        r.disciplines.toLowerCase().includes(q) ||
        r.type.toLowerCase().includes(q)
      );
    });
    if (sortKey && sortKey !== 'availabilities') {
      list = [...list].sort((a, b) => compareNum(a[sortKey], b[sortKey], sortDir));
    }
    return list;
  }, [query, status, performance, sortKey, sortDir]);

  const rows = isSites ? filteredSites : filteredSchools;
  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const pageRows = rows.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);
  const showingFrom = rows.length === 0 ? 0 : safePage * PAGE_SIZE + 1;
  const showingTo = Math.min(safePage * PAGE_SIZE + PAGE_SIZE, rows.length);

  const resetFilters = () => {
    setQuery('');
    setStatus('all');
    setPerformance('all');
    setSortKey(null);
    setSortDir('asc');
    setPage(0);
  };

  const switchTab = (id: MembersTabId) => {
    setTab(id);
    setQuery('');
    setStatus('all');
    setPerformance('all');
    setSortKey(null);
    setSortDir('asc');
    setPage(0);
  };

  const toggleSort = (key: SortKey) => {
    if (sortKey !== key) {
      setSortKey(key);
      setSortDir('asc');
    } else if (sortDir === 'asc') {
      setSortDir('desc');
    } else {
      setSortKey(null);
      setSortDir('asc');
    }
    setPage(0);
  };

  return (
    <div className="mx-auto max-w-[1440px] px-6 pb-4">
      {/* Sticky secondary tabs + filter bar */}
      <div className="sticky top-0 z-20 -mx-6 space-y-3 border-b border-[#e5e7eb]/80 bg-neutral-50/95 px-6 pt-4 pb-3 backdrop-blur-sm">
        <div className="border-b border-[#e5e7eb]">
          <div className="flex gap-1">
            {membersTabs.map((t) => {
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => switchTab(t.id)}
                  className={`relative px-3 py-2 text-sm font-semibold ${
                    active
                      ? 'bg-[#f3f4f6] text-[#111827]'
                      : 'text-[#6b7280] hover:text-[#111827]'
                  }`}
                >
                  {t.label}
                  {active && (
                    <span className="absolute inset-x-0 -bottom-px h-[2px] bg-[#3f51b5]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-white py-1.5 pl-4 shadow-sm">
          <div className="flex flex-wrap items-center gap-2 py-0.5">
            <div className="relative">
              <Search className="absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 text-[#888]" />
              <Input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(0);
                }}
                placeholder={membersPageCopy.searchPlaceholder}
                className="h-[34px] w-[250px] rounded border-[#888] bg-white pl-8 text-sm"
              />
            </div>

            <FacetBtn icon={MapPin} label="State" />

            <div className="flex items-center gap-1.5">
              {(['all', 'Active', 'Inactive'] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    setStatus(s);
                    setPage(0);
                  }}
                  className={`h-[34px] rounded-md px-3 text-[13px] font-medium ${
                    status === s
                      ? 'border border-[#3f51b5] bg-[#3f51b5] text-white'
                      : 'border border-[#e5e7eb] bg-white text-[#6b7280]'
                  }`}
                >
                  {s === 'all' ? 'All' : s}
                </button>
              ))}
            </div>

            {isSites ? (
              <FacetBtn icon={Map} label="Location Groups" />
            ) : (
              <>
                <FacetBtn icon={Building2} label="Category" />
                <FacetBtn icon={BookOpen} label="Disciplines" />
              </>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className={`flex h-[34px] items-center gap-2 rounded border px-2.5 text-sm ${
                    performance !== 'all'
                      ? 'border-[#3f51b5] bg-[#eef2ff] text-[#3730a3]'
                      : 'border-[#8c8c92] bg-white text-[#111827]'
                  }`}
                >
                  <Gauge className="h-4 w-4 shrink-0 opacity-70" strokeWidth={1.75} />
                  Performance
                  {performance !== 'all' && (
                    <span className="max-w-[110px] truncate text-xs font-medium opacity-80">
                      · {perfLabel}
                    </span>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="min-w-[200px]">
                <DropdownMenuRadioGroup
                  value={performance}
                  onValueChange={(v) => {
                    setPerformance(v as PerformanceFilterId);
                    setPage(0);
                  }}
                >
                  {performanceFilterOptions.map((opt) => (
                    <DropdownMenuRadioItem key={opt.id} value={opt.id}>
                      {opt.label}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            <button
              type="button"
              aria-label="Reset filters"
              onClick={resetFilters}
              className="flex h-[34px] w-[34px] items-center justify-center rounded-md text-[#6b7280] hover:bg-neutral-50"
            >
              <RotateCcw className="h-4 w-4 -scale-x-100" strokeWidth={1.75} />
            </button>
          </div>

          <div className="pr-2">
            <button
              type="button"
              className="flex h-[29px] items-center gap-1.5 rounded-md border border-[#d1d5db] bg-white px-2 text-sm text-[#374151] shadow-sm"
            >
              <FileDown className="h-4 w-4 text-[#6b7280]" strokeWidth={1.75} />
              {membersPageCopy.exportPdf}
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="mt-4 overflow-hidden rounded-lg border border-[#e5e7eb] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table
            className={`w-full table-fixed text-sm ${
              isSites ? 'min-w-[1280px]' : 'min-w-[1120px]'
            }`}
          >
            <colgroup>
              {isSites ? (
                <>
                  <col className="w-[18%]" />
                  <col className="w-[11%]" />
                  <col className="w-[10%]" />
                  <col className="w-[7%]" />
                  <col className="w-[7%]" />
                  <col className="w-[6%]" />
                  <col className="w-[6%]" />
                  <col className="w-[6%]" />
                  <col className="w-[8%]" />
                  <col className="w-[7%]" />
                  <col className="w-[9%]" />
                  <col className="w-[5%]" />
                </>
              ) : (
                <>
                  <col className="w-[20%]" />
                  <col className="w-[11%]" />
                  <col className="w-[12%]" />
                  <col className="w-[7%]" />
                  <col className="w-[7%]" />
                  <col className="w-[7%]" />
                  <col className="w-[7%]" />
                  <col className="w-[8%]" />
                  <col className="w-[7%]" />
                  <col className="w-[9%]" />
                  <col className="w-[5%]" />
                </>
              )}
            </colgroup>
            <thead>
              <tr className="border-b border-[#e5e7eb] bg-[#f8fafc]">
                {isSites ? (
                  <>
                    <Th>Site / System</Th>
                    <Th>Type</Th>
                    <Th>Location</Th>
                    <SortTh
                      label="Availabilities"
                      align="right"
                      active={sortKey === 'availabilities'}
                      dir={sortDir}
                      onClick={() => toggleSort('availabilities')}
                    />
                    <SortTh
                      label="Requested"
                      align="right"
                      active={sortKey === 'requested'}
                      dir={sortDir}
                      onClick={() => toggleSort('requested')}
                    />
                    <Th align="right">Approved</Th>
                    <Th align="right">Confirmed</Th>
                    <Th align="right">Onboarded</Th>
                    <SortTh
                      label="Unique students"
                      align="right"
                      active={sortKey === 'uniqueStudents'}
                      dir={sortDir}
                      onClick={() => toggleSort('uniqueStudents')}
                    />
                    <SortTh
                      label="Approval %"
                      align="right"
                      active={sortKey === 'approvalPct'}
                      dir={sortDir}
                      onClick={() => toggleSort('approvalPct')}
                    />
                    <SortTh
                      label="Confirmation"
                      align="right"
                      active={sortKey === 'confirmationPct'}
                      dir={sortDir}
                      onClick={() => toggleSort('confirmationPct')}
                    />
                    <Th>Status</Th>
                  </>
                ) : (
                  <>
                    <Th>School</Th>
                    <Th>Location</Th>
                    <Th>Disciplines</Th>
                    <SortTh
                      label="Requested"
                      align="right"
                      active={sortKey === 'requested'}
                      dir={sortDir}
                      onClick={() => toggleSort('requested')}
                    />
                    <Th align="right">Approved</Th>
                    <Th align="right">Confirmed</Th>
                    <Th align="right">Onboarded</Th>
                    <SortTh
                      label="Unique students"
                      align="right"
                      active={sortKey === 'uniqueStudents'}
                      dir={sortDir}
                      onClick={() => toggleSort('uniqueStudents')}
                    />
                    <SortTh
                      label="Approval %"
                      align="right"
                      active={sortKey === 'approvalPct'}
                      dir={sortDir}
                      onClick={() => toggleSort('approvalPct')}
                    />
                    <SortTh
                      label="Confirmation"
                      align="right"
                      active={sortKey === 'confirmationPct'}
                      dir={sortDir}
                      onClick={() => toggleSort('confirmationPct')}
                    />
                    <Th>Status</Th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {isSites
                ? (pageRows as ClinicalSiteRow[]).map((row) => (
                    <tr
                      key={row.id}
                      className="cursor-pointer border-b border-[#f1f5f9] transition-colors hover:bg-[#eef2ff]/50"
                      onClick={() => setSiteProfile(row)}
                    >
                      <td className="px-3 py-3 align-middle">
                        <div className="flex min-w-0 items-center gap-2.5">
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-[#3f51b5] text-xs font-bold text-white">
                            {row.name.charAt(0)}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate font-medium text-[#111827]">{row.name}</p>
                            <p className="truncate text-xs text-[#6b7280]">{row.system}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3 align-middle text-[#374151]">
                        <span className="line-clamp-2">{row.type}</span>
                      </td>
                      <td className="px-3 py-3 align-middle whitespace-nowrap text-[#374151]">
                        {row.location}
                      </td>
                      <NumTd>{row.availabilities}</NumTd>
                      <NumTd>{row.requested.toLocaleString()}</NumTd>
                      <NumTd>{row.approved.toLocaleString()}</NumTd>
                      <NumTd>{row.confirmed.toLocaleString()}</NumTd>
                      <NumTd>{row.onboarded.toLocaleString()}</NumTd>
                      <NumTd>{row.uniqueStudents.toLocaleString()}</NumTd>
                      <td className="px-3 py-3 align-middle text-right">
                        <Pct value={row.approvalPct} />
                      </td>
                      <td className="px-3 py-3 align-middle text-right">
                        <Pct value={row.confirmationPct} />
                      </td>
                      <td className="px-3 py-3 align-middle">
                        <StatusBadge status={row.status} />
                      </td>
                    </tr>
                  ))
                : (pageRows as MemberSchoolRow[]).map((row) => (
                    <tr
                      key={row.id}
                      className="cursor-pointer border-b border-[#f1f5f9] transition-colors hover:bg-[#eef2ff]/50"
                      onClick={() => setSchoolProfile(row)}
                    >
                      <td className="px-3 py-3 align-middle">
                        <div className="flex min-w-0 items-center gap-2.5">
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-[#3f51b5] text-xs font-bold text-white">
                            {row.name.charAt(0)}
                          </span>
                          <p className="min-w-0 truncate font-medium text-[#111827]">
                            {row.name}
                          </p>
                        </div>
                      </td>
                      <td className="px-3 py-3 align-middle whitespace-nowrap text-[#374151]">
                        {row.location}
                      </td>
                      <td className="px-3 py-3 align-middle text-[#374151]">
                        <span className="line-clamp-2">{row.disciplines}</span>
                      </td>
                      <NumTd>{row.requested.toLocaleString()}</NumTd>
                      <NumTd>{row.approved.toLocaleString()}</NumTd>
                      <NumTd>{row.confirmed.toLocaleString()}</NumTd>
                      <NumTd>{row.onboarded.toLocaleString()}</NumTd>
                      <NumTd>{row.uniqueStudents.toLocaleString()}</NumTd>
                      <td className="px-3 py-3 align-middle text-right">
                        <Pct value={row.approvalPct} />
                      </td>
                      <td className="px-3 py-3 align-middle text-right">
                        <Pct value={row.confirmationPct} />
                      </td>
                      <td className="px-3 py-3 align-middle">
                        <StatusBadge status={row.status} />
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>

        {rows.length === 0 && (
          <p className="px-4 py-10 text-center text-sm text-[#6b7280]">
            No {isSites ? 'clinical sites' : 'member schools'} match your filters.
          </p>
        )}

        <div className="flex flex-col gap-3 border-t border-[#e5e7eb] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-[#6b7280]">
            Showing{' '}
            <span className="font-medium text-[#374151]">
              {showingFrom} to {showingTo}
            </span>{' '}
            of <span className="font-medium text-[#374151]">{rows.length}</span>{' '}
            {isSites ? 'clinical sites' : 'member schools'}
          </p>
          <div className="flex items-center gap-1">
            <PagerBtn disabled={safePage === 0} onClick={() => setPage(0)}>
              «
            </PagerBtn>
            <PagerBtn
              disabled={safePage === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
            >
              ‹
            </PagerBtn>
            {Array.from({ length: pageCount }, (_, i) => (
              <PagerBtn key={i} active={safePage === i} onClick={() => setPage(i)}>
                {i + 1}
              </PagerBtn>
            ))}
            <PagerBtn
              disabled={safePage >= pageCount - 1}
              onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
            >
              ›
            </PagerBtn>
            <PagerBtn
              disabled={safePage >= pageCount - 1}
              onClick={() => setPage(pageCount - 1)}
            >
              »
            </PagerBtn>
          </div>
        </div>
      </div>

      <MemberProfileModal
        open={!!siteProfile}
        onOpenChange={(o) => !o && setSiteProfile(null)}
        profile={siteProfile ? { kind: 'site', data: siteProfile } : null}
      />
      <MemberProfileModal
        open={!!schoolProfile}
        onOpenChange={(o) => !o && setSchoolProfile(null)}
        profile={schoolProfile ? { kind: 'school', data: schoolProfile } : null}
      />
    </div>
  );
}

function compareNum(a: number, b: number, dir: SortDir) {
  return dir === 'asc' ? a - b : b - a;
}

function Th({
  children,
  align = 'left',
}: {
  children: React.ReactNode;
  align?: 'left' | 'right';
}) {
  return (
    <th
      className={`px-3 py-3 text-[11px] font-bold tracking-wide whitespace-nowrap text-[#6b7280] uppercase ${
        align === 'right' ? 'text-right' : 'text-left'
      }`}
    >
      {children}
    </th>
  );
}

function SortTh({
  label,
  active,
  dir,
  onClick,
  align = 'left',
}: {
  label: string;
  active: boolean;
  dir: SortDir;
  onClick: () => void;
  align?: 'left' | 'right';
}) {
  const Icon = !active ? ArrowUpDown : dir === 'asc' ? ArrowUp : ArrowDown;
  return (
    <th
      className={`px-3 py-3 text-[11px] font-bold tracking-wide text-[#6b7280] uppercase ${
        align === 'right' ? 'text-right' : 'text-left'
      }`}
    >
      <button
        type="button"
        onClick={onClick}
        className={`inline-flex items-center gap-1 whitespace-nowrap hover:text-[#111827] ${
          align === 'right' ? 'justify-end' : ''
        }`}
      >
        {label}
        <Icon className={`h-3 w-3 shrink-0 ${active ? 'text-[#3f51b5]' : 'opacity-50'}`} />
      </button>
    </th>
  );
}

function NumTd({ children }: { children: React.ReactNode }) {
  return (
    <td className="px-3 py-3 align-middle text-right tabular-nums whitespace-nowrap text-[#111827]">
      {children}
    </td>
  );
}

function FacetBtn({
  icon: Icon,
  label,
}: {
  icon: LucideIcon;
  label: string;
}) {
  return (
    <button
      type="button"
      className="flex h-[34px] items-center gap-2 rounded border border-[#8c8c92] bg-white px-2.5 text-sm text-[#111827]"
    >
      <Icon className="h-4 w-4 shrink-0 text-[#6b7280]" strokeWidth={1.75} />
      {label}
    </button>
  );
}

function Pct({ value }: { value: number }) {
  const tone =
    value >= 85 ? 'text-emerald-700' : value >= 70 ? 'text-amber-700' : 'text-red-700';
  return <span className={`font-semibold tabular-nums ${tone}`}>{value}%</span>;
}

function StatusBadge({ status }: { status: MemberStatus }) {
  return (
    <span
      className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold ${
        status === 'Active'
          ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
          : 'border-neutral-200 bg-neutral-50 text-neutral-600'
      }`}
    >
      {status}
    </span>
  );
}

function PagerBtn({
  children,
  onClick,
  disabled,
  active,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex h-8 min-w-8 items-center justify-center rounded border px-2 text-sm disabled:opacity-40 ${
        active
          ? 'border-[#3f51b5] bg-[#3f51b5] text-white'
          : 'border-[#d1d5db] bg-white text-[#374151]'
      }`}
    >
      {children}
    </button>
  );
}
