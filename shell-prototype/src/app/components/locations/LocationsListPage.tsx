import { useState } from 'react';
import { toast } from 'sonner';
import { PageHeader } from '../PageHeader';
import { FilterChip } from '../ListFilters';
import { Input } from '../ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { FontAwesomeIcon } from '../font-awesome-icon';
import { mockLocations, type ClinicalLocation, type LocationStatus } from '../../data/mockLocations';
import { mockPersonnel } from '../../data/mockPersonnel';
import { Checkbox } from '../ui/checkbox';
import { type PersonaOption } from '../email/ComposeEmailWizard';
import { BulkEmailFlow } from '../email/BulkEmailFlow';
import { EmailHistoryPanel } from '../email/EmailHistoryPanel';
import { SelectionToolbar, useBulkEmailSelection } from '../email/BulkEmailSurface';
import { preceptorsAtLocations, personnelRecipientRow } from '../email/boltOnRecipients';

const GROUPS = Array.from(new Set(mockLocations.map((l) => l.locationGroup))).sort();
const STATUS_OPTIONS: LocationStatus[] = ['Active', 'Inactive', 'Under Review'];
const PAGE_SIZE = 10;

function buildFiltered(rows: ClinicalLocation[], search: string, group: string, status: string) {
  const q = search.toLowerCase();
  return rows.filter((l) => {
    const matchSearch =
      q === '' ||
      l.name.toLowerCase().includes(q) ||
      l.address.toLowerCase().includes(q) ||
      l.city.toLowerCase().includes(q);
    const matchGroup = group === 'All' || l.locationGroup === group;
    const matchStatus = status === 'All' || l.status === status;
    return matchSearch && matchGroup && matchStatus;
  });
}

// Location Coordinators — Clinical Coordinator personnel affiliated with this location.
function coordinatorsFor(locationName: string): string {
  const rows = mockPersonnel.filter((p) => p.role === 'Clinical Coordinator' && p.location === locationName);
  return rows.map((p) => `${p.firstName} ${p.lastName}`).join(', ');
}


const STATUS_BADGE: Record<LocationStatus, string> = {
  Active: 'bg-positive-default/10 text-positive-default border border-positive-default/30',
  Inactive: 'bg-[var(--bg-container)] text-neutral-600 border border-neutral-200',
  'Under Review': 'bg-accent-100 text-warning-default border border-accent-200',
};

interface LocationsListPageProps {
  onNavigate?: (href: string) => void;
}

export function LocationsListPage({ onNavigate }: LocationsListPageProps) {
  const [search, setSearch] = useState('');
  const [groupFilter, setGroupFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [page, setPage] = useState(1);

  const filtered = buildFiltered(mockLocations, search, groupFilter, statusFilter);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageRows = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const rangeStart = filtered.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(currentPage * PAGE_SIZE, filtered.length);

  const { selectedIds, wizardOpen, setWizardOpen, historyOpen, setHistoryOpen, selectAllChecked, handleSelectAll, handleSelectOne, narrowSelection } =
    useBulkEmailSelection(filtered);
  const selectedLocations = filtered.filter((l) => selectedIds.includes(l.id));
  const locationNames = new Set(selectedLocations.map((l) => l.name));
  const atSelected = mockPersonnel.filter((p) => locationNames.has(p.location));
  // Who an email from here can go to: the people who run the ticked locations. "Everyone" is last so a more
  // specific badge (Location Coordinator) wins when someone is in both.
  const personas: PersonaOption[] = [
    {
      id: 'location-coordinators', audience: 'Staff-Personnel', label: 'Location Coordinators', badge: 'Location Coordinator',
      description: 'Clinical coordinators at the selected locations',
      recipients: atSelected.filter((p) => p.role === 'Clinical Coordinator').map(personnelRecipientRow),
    },
    {
      id: 'preceptors', audience: 'Preceptor', label: 'Preceptors', badge: 'Preceptor',
      description: 'Preceptors at the selected locations',
      recipients: preceptorsAtLocations(selectedLocations.map((l) => l.name)),
    },
    {
      id: 'all-personnel', audience: 'Staff-Personnel', label: 'All site personnel', badge: 'Site Personnel',
      description: 'Everyone affiliated with the selected locations',
      recipients: atSelected.map(personnelRecipientRow),
    },
  ];

  function updateFilters() {
    narrowSelection(new Set(buildFiltered(mockLocations, search, groupFilter, statusFilter).map((l) => l.id)));
    setPage(1);
  }

  return (
    <>
      <PageHeader
        icon="mapPin"
        title="Locations"
        description={`${mockLocations.length} clinical locations across ${GROUPS.length} groups`}
        actions={[
          { label: 'Add Location', icon: 'plus', onClick: () => toast.info('Add Location — coming soon.') },
        ]}
      />

      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3">
        <div className="w-full space-y-3">
          <div className="bg-card rounded-xl shadow-[0_1px_1.5px_rgba(0,0,0,0.1),0_1px_1px_rgba(0,0,0,0.1)] overflow-hidden">

            {/* Filter bar */}
            <div className="px-4 py-3 border-b border-neutral-200 flex flex-wrap items-center gap-2">
              <div className="relative flex-1 min-w-[200px] max-w-xs">
                <FontAwesomeIcon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-600" />
                <Input
                  placeholder="Search location, address, city…"
                  value={search}
                  onChange={(e) => { updateFilters(); setSearch(e.target.value); }}
                  className="pl-9 h-9 text-sm"
                />
              </div>

              <FilterChip
                label="Group"
                icon="building"
                value={groupFilter}
                options={GROUPS}
                onChange={(v) => { updateFilters(); setGroupFilter(v); }}
              />
              <FilterChip
                label="Status"
                icon="circleCheck"
                value={statusFilter}
                options={STATUS_OPTIONS}
                onChange={(v) => { updateFilters(); setStatusFilter(v); }}
              />

              <span className="text-sm text-neutral-700 ml-auto">{filtered.length} shown</span>
            </div>

            <SelectionToolbar
              selectedCount={selectedIds.length}
              entityLabel="Locations"
              onBulkEmail={() => setWizardOpen(true)}
              onHistoryOpen={() => setHistoryOpen(true)}
            />

            {/* Table */}
            <div className="max-h-[560px] overflow-y-auto">
              <table className="w-full">
                <thead className="sticky top-0 bg-[var(--bg-table-header)] z-10">
                  <tr className="border-b border-neutral-200">
                    <th className="w-11 px-4 py-3"><Checkbox checked={selectAllChecked} onCheckedChange={(v) => handleSelectAll(!!v)} aria-label="Select all locations" /></th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-neutral-900 uppercase tracking-wider">Location</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-neutral-900 uppercase tracking-wider hidden md:table-cell">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-neutral-900 uppercase tracking-wider hidden lg:table-cell">Location Address</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-neutral-900 uppercase tracking-wider hidden lg:table-cell">Group</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-neutral-900 uppercase tracking-wider hidden md:table-cell">Location Coordinators</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-neutral-900 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-neutral-900 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {pageRows.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-10 text-center text-sm text-neutral-600">
                        No locations match your filters.
                      </td>
                    </tr>
                  ) : (
                    pageRows.map((loc) => {
                      const coordinators = coordinatorsFor(loc.name);
                      return (
                        <tr key={loc.id} className={`hover:bg-neutral-50 transition-colors ${selectedIds.includes(loc.id) ? 'bg-blue-50' : ''}`}>
                          <td className="w-11 px-4 py-3">
                            <Checkbox checked={selectedIds.includes(loc.id)} onCheckedChange={(v) => handleSelectOne(loc.id, !!v)} aria-label={`Select ${loc.name}`} />
                          </td>
                          <td className="px-4 py-3">
                            <button
                              type="button"
                              onClick={() => onNavigate?.(`/locations/${loc.id}`)}
                              className="text-sm font-medium text-blue-500 hover:underline text-left"
                            >
                              {loc.name}
                            </button>
                            <p className="text-xs text-neutral-600">{loc.hospitalName}</p>
                          </td>
                          <td className="px-4 py-3 hidden md:table-cell">
                            <span className="text-sm text-neutral-800">{loc.department}</span>
                          </td>
                          <td className="px-4 py-3 hidden lg:table-cell">
                            <span className="text-sm text-neutral-700">{loc.address}, {loc.city}, {loc.state} {loc.zip}</span>
                          </td>
                          <td className="px-4 py-3 hidden lg:table-cell">
                            <span className="text-sm text-neutral-800">{loc.locationGroup}</span>
                          </td>
                          <td className="px-4 py-3 hidden md:table-cell">
                            <span className="text-sm text-neutral-700">{coordinators || '--'}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${STATUS_BADGE[loc.status]}`}>
                              {loc.status}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <button
                              type="button"
                              onClick={() => toast.info(`Edit ${loc.name} — coming soon.`)}
                              className="text-neutral-600 hover:text-blue-500 transition-colors"
                              aria-label={`Edit ${loc.name}`}
                            >
                              <FontAwesomeIcon name="penToSquare" className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination footer */}
            <div className="px-4 py-3 border-t border-neutral-200 flex items-center justify-between">
              <span className="text-xs text-neutral-800">
                {filtered.length === 0 ? 'No results' : `Showing ${rangeStart}–${rangeEnd} of ${filtered.length}`}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage <= 1}
                  className="flex items-center justify-center w-8 h-8 rounded-md text-neutral-800 hover:bg-neutral-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  aria-label="Previous page"
                >
                  <FontAwesomeIcon name="chevronLeft" className="w-3.5 h-3.5" />
                </button>
                <span className="text-xs text-neutral-800 px-2">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages}
                  className="flex items-center justify-center w-8 h-8 rounded-md text-neutral-800 hover:bg-neutral-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  aria-label="Next page"
                >
                  <FontAwesomeIcon name="chevronRight" className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <EmailHistoryPanel open={historyOpen} onClose={() => setHistoryOpen(false)} />
      <BulkEmailFlow
        open={wizardOpen}
        onClose={() => setWizardOpen(false)}
        surface="site.locations"
        personas={personas}
        audienceType="Staff-Personnel"
        selectionSummary={`${selectedLocations.length} ${selectedLocations.length === 1 ? 'location' : 'locations'} selected`}
        sourceSurface="General"
      />
    </>
  );
}
