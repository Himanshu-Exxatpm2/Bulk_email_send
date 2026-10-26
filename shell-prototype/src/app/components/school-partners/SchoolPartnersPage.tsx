import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { ListPageHeader, ListPagination } from '../ListPageHeader';
import { PillFilterChip } from '../ListFilters';
import { Checkbox } from '../ui/checkbox';
import { Input } from '../ui/input';
import { FontAwesomeIcon } from '../font-awesome-icon';
import { type RecipientRow } from '../email/ComposeEmailWizard';
import { BulkEmailFlow } from '../email/BulkEmailFlow';
import { EmailHistoryPanel } from '../email/EmailHistoryPanel';
import { SelectionToolbar, useBulkEmailSelection } from '../email/BulkEmailSurface';
import { mockSchoolPartners, type SchoolPartner } from '../../data/mockSchoolPartners';

// Associated Discipline is derived from program types (not stored on the partner).
function disciplinesFor(p: SchoolPartner): string[] {
  const out = new Set<string>();
  p.programTypes.forEach((t) => {
    if (/RN|BSN|DNP|MSN|LPN/.test(t)) out.add('Nursing');
    else if (/MOT|OT\b/.test(t)) out.add('Occupational Therapy');
    else if (/DPT|PT\b/.test(t)) out.add('Physical Therapy');
    else if (/Rad/.test(t)) out.add('Radiologic Technology');
    else if (/Respiratory/.test(t)) out.add('Respiratory Therapy');
    else if (/SLP/.test(t)) out.add('Speech-Language Pathology');
    else if (/Pharm/.test(t)) out.add('Pharmacy');
    else out.add(t);
  });
  return Array.from(out);
}

type ContractStatus = 'Active' | 'Expired' | 'No contracts';
function contractStatuses(p: SchoolPartner): ContractStatus[] {
  const s: ContractStatus[] = [];
  if (p.activeContractsCount > 0) s.push('Active');
  if (p.expiredContractsCount > 0) s.push('Expired');
  return s.length ? s : ['No contracts'];
}

type ContactDetail = 'Has email' | 'No email on file' | 'No contact';
function contactDetail(p: SchoolPartner): ContactDetail {
  if (p.contacts.length === 0) return 'No contact';
  return p.contacts.some((c) => c.email) ? 'Has email' : 'No email on file';
}

const STATE_OPTIONS = Array.from(new Set(mockSchoolPartners.map((p) => p.state))).sort();
const CATEGORY_OPTIONS = Array.from(new Set(mockSchoolPartners.map((p) => p.category))).sort();
const CONTRACT_OPTIONS: ContractStatus[] = ['Active', 'Expired', 'No contracts'];
const CONTACT_OPTIONS: ContactDetail[] = ['Has email', 'No email on file', 'No contact'];
const DISCIPLINE_OPTIONS = Array.from(new Set(mockSchoolPartners.flatMap(disciplinesFor))).sort();

interface Filters {
  states: string[];
  categories: string[];
  contractStatuses: string[];
  contactDetails: string[];
  disciplines: string[];
}
const EMPTY_FILTERS: Filters = { states: [], categories: [], contractStatuses: [], contactDetails: [], disciplines: [] };

function buildFiltered(rows: SchoolPartner[], search: string, f: Filters) {
  const q = search.toLowerCase();
  return rows.filter((p) => {
    const matchSearch =
      q === '' ||
      p.schoolName.toLowerCase().includes(q) ||
      p.contactName.toLowerCase().includes(q) ||
      p.city.toLowerCase().includes(q) ||
      p.website.toLowerCase().includes(q) ||
      p.programTypes.join(' ').toLowerCase().includes(q);
    return (
      matchSearch &&
      (f.states.length === 0 || f.states.includes(p.state)) &&
      (f.categories.length === 0 || f.categories.includes(p.category)) &&
      (f.contractStatuses.length === 0 || contractStatuses(p).some((s) => f.contractStatuses.includes(s))) &&
      (f.contactDetails.length === 0 || f.contactDetails.includes(contactDetail(p))) &&
      (f.disciplines.length === 0 || disciplinesFor(p).some((d) => f.disciplines.includes(d)))
    );
  });
}

const TH = 'px-4 py-3 text-left text-xs font-medium text-neutral-900 uppercase tracking-wider whitespace-nowrap';

interface SchoolPartnersPageProps {
  onNavigate?: (href: string) => void;
}

export function SchoolPartnersPage({ onNavigate }: SchoolPartnersPageProps) {
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  const filtered = useMemo(() => buildFiltered(mockSchoolPartners, search, filters), [search, filters]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const pageRows = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const { selectedIds, wizardOpen, setWizardOpen, historyOpen, setHistoryOpen, selectAllChecked, handleSelectAll, handleSelectOne, narrowSelection } =
    useBulkEmailSelection(filtered);

  function applyFilters(nextSearch: string, nextFilters: Filters) {
    narrowSelection(new Set(buildFiltered(mockSchoolPartners, nextSearch, nextFilters).map((p) => p.id)));
    setSearch(nextSearch);
    setFilters(nextFilters);
    setPage(1);
  }
  function setFilter<K extends keyof Filters>(key: K, values: Filters[K]) {
    applyFilters(search, { ...filters, [key]: values });
  }

  // Every program contact of every selected school (the About tab's Program Contacts),
  // not just the school's primary contact. Contacts with no email are skipped (the product's fallback covers them).
  const recipients: RecipientRow[] = filtered
    .filter((p) => selectedIds.includes(p.id))
    .flatMap((p) =>
      p.contacts.filter((c) => c.email).map((c) => ({ id: `${p.id}:${c.email ?? c.name}`, name: c.name, email: c.email, meta: `${c.role} · ${p.schoolName}` })),
    );

  const open = (p: SchoolPartner) => onNavigate?.(`/partners/${p.id}`);

  return (
    <>
      <ListPageHeader title="School Partners" action={{ label: 'Add Partner', onClick: () => toast.info('Add Partner — coming soon.') }} />

      <div className="flex-1 overflow-y-auto p-3 sm:p-4">
        <div className="w-full bg-card rounded-xl shadow-[0_1px_1.5px_rgba(0,0,0,0.1),0_1px_1px_rgba(0,0,0,0.1)] overflow-hidden">

          {/* Filter bar */}
          <div className="px-4 py-3 border-b border-neutral-200 flex flex-wrap items-center gap-2">
            <div className="relative w-full max-w-[220px]">
              <FontAwesomeIcon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-600" />
              <Input placeholder="Search" value={search} onChange={(e) => applyFilters(e.target.value, filters)} className="pl-9 h-9 text-sm" />
            </div>
            <PillFilterChip label="State" icon="mapPin" selectedValues={filters.states} options={STATE_OPTIONS} onChange={(v) => setFilter('states', v)} />
            <PillFilterChip label="Category" icon="building" selectedValues={filters.categories} options={CATEGORY_OPTIONS} onChange={(v) => setFilter('categories', v)} />
            <PillFilterChip label="Contract Status" icon="clipboard" selectedValues={filters.contractStatuses} options={CONTRACT_OPTIONS} onChange={(v) => setFilter('contractStatuses', v)} />
            <PillFilterChip label="Program Contact Details" icon="users" selectedValues={filters.contactDetails} options={CONTACT_OPTIONS} onChange={(v) => setFilter('contactDetails', v)} />
            <PillFilterChip label="Discipline" icon="stethoscope" selectedValues={filters.disciplines} options={DISCIPLINE_OPTIONS} onChange={(v) => setFilter('disciplines', v)} />
            <button
              type="button"
              onClick={() => applyFilters('', EMPTY_FILTERS)}
              className="text-neutral-600 hover:text-blue-500 transition-colors p-2"
              aria-label="Reset filters"
            >
              <FontAwesomeIcon name="refresh" className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => toast.info('Export — coming soon.')}
              className="ml-auto text-neutral-600 hover:text-blue-500 transition-colors p-2"
              aria-label="Export"
            >
              <FontAwesomeIcon name="fileExport" className="w-4 h-4" />
            </button>
          </div>

          {/* Selection toolbar */}
          <SelectionToolbar
            selectedCount={selectedIds.length}
            entityLabel="School Partners"
            onBulkEmail={() => setWizardOpen(true)}
            onHistoryOpen={() => setHistoryOpen(true)}
          />

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="sticky top-0 bg-[var(--bg-table-header)] z-10">
                <tr className="border-b border-neutral-200">
                  <th className="w-11 px-4 py-3">
                    <Checkbox checked={selectAllChecked} onCheckedChange={(v) => handleSelectAll(!!v)} aria-label="Select all" />
                  </th>
                  <th className={TH}>School Name</th>
                  <th className={TH}>Website</th>
                  <th className={TH}>Address</th>
                  <th className={TH}>Category</th>
                  <th className={TH}>Contracts</th>
                  <th className={TH}>Program Contact</th>
                  <th className={TH}>Associated Discipline</th>
                  <th className={TH}>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {pageRows.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-10 text-center text-sm text-neutral-600">No school partners match your filters.</td>
                  </tr>
                ) : (
                  pageRows.map((p) => {
                    const isSelected = selectedIds.includes(p.id);
                    const extra = p.contacts.length - 1;
                    const disciplines = disciplinesFor(p);
                    return (
                      <tr key={p.id} className={`hover:bg-neutral-50 transition-colors ${isSelected ? 'bg-blue-50' : ''}`}>
                        <td className="w-11 px-4 py-3 align-top">
                          <Checkbox checked={isSelected} onCheckedChange={(v) => handleSelectOne(p.id, !!v)} aria-label={`Select ${p.schoolName}`} />
                        </td>
                        <td className="px-4 py-3 align-top">
                          <button type="button" onClick={() => open(p)} className="text-sm font-medium text-blue-500 hover:underline text-left">
                            {p.schoolName}
                          </button>
                        </td>
                        <td className="px-4 py-3 align-top text-sm text-blue-500">{p.website || '--'}</td>
                        <td className="px-4 py-3 align-top text-sm text-neutral-800 min-w-[200px]">
                          {p.address}, {p.city}, {p.state}
                        </td>
                        <td className="px-4 py-3 align-top text-sm text-neutral-800">{p.category || '--'}</td>
                        <td className="px-4 py-3 align-top">
                          {p.activeContractsCount + p.expiredContractsCount === 0 ? (
                            <span className="text-sm text-neutral-800">--</span>
                          ) : (
                            <div className="flex flex-col items-start gap-1">
                              {p.activeContractsCount > 0 && (
                                <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-positive-default/10 text-positive-default">
                                  {p.activeContractsCount} Active
                                </span>
                              )}
                              {p.expiredContractsCount > 0 && (
                                <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-accent-100 text-warning-default">
                                  {p.expiredContractsCount} Expired
                                </span>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 align-top text-sm whitespace-nowrap">
                          {p.contacts.length === 0 ? (
                            <span className="text-neutral-800">--</span>
                          ) : (
                            <span className="inline-flex items-center gap-2">
                              <span className="text-blue-500">{p.contacts[0].name}</span>
                              {extra > 0 && (
                                <>
                                  <span className="text-xs text-neutral-700">+{extra}</span>
                                  <button type="button" onClick={() => open(p)} className="text-xs text-blue-500 hover:underline">View All</button>
                                </>
                              )}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 align-top text-sm text-neutral-800">{disciplines.join(', ') || '--'}</td>
                        <td className="px-4 py-3 align-top">
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => toast.info(`Edit ${p.schoolName} — coming soon.`)}
                              className="text-neutral-600 hover:text-blue-500 transition-colors"
                              aria-label={`Edit ${p.schoolName}`}
                            >
                              <FontAwesomeIcon name="penToSquare" className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => toast.info(`Delete ${p.schoolName} — coming soon.`)}
                              className="text-neutral-600 hover:text-negative-default transition-colors"
                              aria-label={`Delete ${p.schoolName}`}
                            >
                              <FontAwesomeIcon name="trash" className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <ListPagination
            page={currentPage}
            pageSize={pageSize}
            total={filtered.length}
            onPageChange={setPage}
            onPageSizeChange={(n) => { setPageSize(n); setPage(1); }}
          />
        </div>

        <EmailHistoryPanel open={historyOpen} onClose={() => setHistoryOpen(false)} />
      </div>

      <BulkEmailFlow
        open={wizardOpen}
        onClose={() => setWizardOpen(false)}
        surface="site.schoolPartners"
        personas={[{ audience: 'School Contact', label: 'School program contacts', badge: 'Program contact', description: 'Every program contact of the schools you ticked', recipients }]}
        audienceType="School Contact"
        selectionSummary={`${selectedIds.length} ${selectedIds.length === 1 ? 'school' : 'schools'} selected`}
        sourceSurface="General"
      />
    </>
  );
}
