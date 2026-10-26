import { useState, useMemo, useCallback } from 'react';
import { FontAwesomeIcon } from '../font-awesome-icon';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { AvailabilityListTable, MAX_CLONE_SELECTION } from './AvailabilityListTable';
import { BulkCloneWizard } from './BulkCloneWizard';
import { mockAvailabilities, Availability } from '../../data/mockAvailabilities';

interface AvailabilityListPageProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

// Time-based tabs. `status` (Published/Closed/Draft/Scheduled) stays a separate
// per-row dimension shown via the Status badge column.
type ActiveTab = 'All' | 'Upcoming' | 'Current' | 'Completed';
const TABS: ActiveTab[] = ['All', 'Upcoming', 'Current', 'Completed'];
const TAB_ROUTES: Record<ActiveTab, string> = {
  All: '/availability/all',
  Upcoming: '/availability/upcoming',
  Current: '/availability/current',
  Completed: '/availability/completed',
};

function formatDate(date: string): string {
  return new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

// Plain string comparison on YYYY-MM-DD is safe — both sides are zero-padded ISO dates.
function getTimeBucket(a: Availability, today: string): 'Upcoming' | 'Current' | 'Completed' {
  if (a.startDate > today) return 'Upcoming';
  if (a.endDate < today) return 'Completed';
  return 'Current';
}

function matchesSearchTerm(a: Availability, term: string): boolean {
  if (term === '') return true;
  const t = term.toLowerCase();
  return (
    a.name.toLowerCase().includes(t) ||
    a.location.toLowerCase().includes(t) ||
    a.locationGroup.toLowerCase().includes(t)
  );
}

// Empty selection = "All"
function matchesMulti(value: string, selected: string[]): boolean {
  return selected.length === 0 || selected.includes(value);
}

// ── Multi-select filter dropdown ─────────────────────────────────────────────
function FilterDropdown({
  label,
  options,
  selected,
  onChange,
}: {
  label: string;
  options: string[];
  selected: string[];
  onChange: (next: string[]) => void;
}) {
  const summary =
    selected.length === 0 ? 'All' : selected.length === 1 ? selected[0] : `${selected.length} selected`;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-9 gap-2 font-normal text-neutral-800"
          aria-label={`Filter by ${label}`}
        >
          <span className="text-neutral-700">{label}:</span>
          <span className="font-medium text-neutral-900 max-w-[140px] truncate">{summary}</span>
          <FontAwesomeIcon name="chevronDown" className="w-3 h-3 text-neutral-600" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-[220px] max-h-[320px] overflow-y-auto">
        {options.map((opt) => (
          <DropdownMenuCheckboxItem
            key={opt}
            checked={selected.includes(opt)}
            onSelect={(e) => e.preventDefault()}
            onCheckedChange={(checked) =>
              onChange(checked ? [...selected, opt] : selected.filter((s) => s !== opt))
            }
          >
            {opt}
          </DropdownMenuCheckboxItem>
        ))}
        {selected.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <button
              type="button"
              onClick={() => onChange([])}
              className="w-full text-left px-2 py-1.5 text-sm text-blue-500 hover:bg-neutral-100 rounded-sm"
            >
              Clear selection
            </button>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function AvailabilityListPage({ currentPath, onNavigate }: AvailabilityListPageProps) {
  // Availability list state (seeded from mock; appended by bulk-clone submits)
  const [availabilities, setAvailabilities] = useState<Availability[]>(mockAvailabilities);

  // ── Tab state ──────────────────────────────────────────────────────────────
  const activeTab: ActiveTab =
    currentPath === '/availability/upcoming'
      ? 'Upcoming'
      : currentPath === '/availability/current'
      ? 'Current'
      : currentPath === '/availability/completed'
      ? 'Completed'
      : 'All';

  // "Today" anchored to America/New_York to match the platform's day-boundary
  // convention (reports refresh at 3:30 AM EST).
  const todayISO = useMemo(() => {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/New_York',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(new Date());
    const y = parts.find((p) => p.type === 'year')!.value;
    const m = parts.find((p) => p.type === 'month')!.value;
    const day = parts.find((p) => p.type === 'day')!.value;
    return `${y}-${m}-${day}`;
  }, []);

  // ── Filter state (empty array = All) ───────────────────────────────────────
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDiscipline, setSelectedDiscipline] = useState<string[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string[]>([]);
  const [selectedExperienceType, setSelectedExperienceType] = useState<string[]>([]);

  // ── Selection + wizard state ───────────────────────────────────────────────
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [wizardOpen, setWizardOpen] = useState(false);

  const tabFiltered = useMemo<Availability[]>(
    () =>
      activeTab === 'All'
        ? availabilities
        : availabilities.filter((a) => getTimeBucket(a, todayISO) === activeTab),
    [activeTab, todayISO, availabilities],
  );

  const filteredAvailabilities = useMemo<Availability[]>(
    () =>
      tabFiltered.filter(
        (a) =>
          matchesSearchTerm(a, searchTerm) &&
          matchesMulti(a.discipline, selectedDiscipline) &&
          matchesMulti(a.locationGroup, selectedLocation) &&
          matchesMulti(a.experienceType, selectedExperienceType),
      ),
    [tabFiltered, searchTerm, selectedDiscipline, selectedLocation, selectedExperienceType],
  );

  // Behavior (a): a filter change narrows the selection to what's still visible
  const narrowSelection = useCallback((nextFilteredIds: Set<string>) => {
    setSelectedIds((prev) => prev.filter((id) => nextFilteredIds.has(id)));
  }, []);

  const buildNextFiltered = (o: {
    search?: string;
    discipline?: string[];
    location?: string[];
    expType?: string[];
  }) => {
    const srch = o.search ?? searchTerm;
    const disc = o.discipline ?? selectedDiscipline;
    const loc = o.location ?? selectedLocation;
    const exp = o.expType ?? selectedExperienceType;
    return new Set(
      tabFiltered
        .filter(
          (a) =>
            matchesSearchTerm(a, srch) &&
            matchesMulti(a.discipline, disc) &&
            matchesMulti(a.locationGroup, loc) &&
            matchesMulti(a.experienceType, exp),
        )
        .map((a) => a.id),
    );
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    narrowSelection(buildNextFiltered({ search: value }));
  };
  const handleDisciplineChange = (value: string[]) => {
    setSelectedDiscipline(value);
    narrowSelection(buildNextFiltered({ discipline: value }));
  };
  const handleLocationChange = (value: string[]) => {
    setSelectedLocation(value);
    narrowSelection(buildNextFiltered({ location: value }));
  };
  const handleExperienceTypeChange = (value: string[]) => {
    setSelectedExperienceType(value);
    narrowSelection(buildNextFiltered({ expType: value }));
  };
  const hasActiveFilters =
    searchTerm !== '' ||
    selectedDiscipline.length > 0 ||
    selectedLocation.length > 0 ||
    selectedExperienceType.length > 0;
  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedDiscipline([]);
    setSelectedLocation([]);
    setSelectedExperienceType([]);
  };

  // Behavior (b): a tab switch clears the selection
  const handleTabChange = (tab: ActiveTab) => {
    setSelectedIds([]);
    onNavigate(TAB_ROUTES[tab]);
  };

  // Select all selects up to the hard cap (visible rows only)
  const handleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? filteredAvailabilities.slice(0, MAX_CLONE_SELECTION).map((a) => a.id) : []);
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) =>
        prev.includes(id) || prev.length >= MAX_CLONE_SELECTION ? prev : [...prev, id],
      );
    } else {
      setSelectedIds((prev) => prev.filter((x) => x !== id));
    }
  };

  const handleClone = (id: string) => {
    setSelectedIds([id]);
    setWizardOpen(true);
  };
  const handleBulkClone = () => setWizardOpen(true);

  const selectedAvailabilities = useMemo<Availability[]>(
    () => availabilities.filter((a) => selectedIds.includes(a.id)),
    [availabilities, selectedIds],
  );

  const uniq = (xs: string[]) => Array.from(new Set(xs)).sort();
  const disciplineOptions = uniq(tabFiltered.map((a) => a.discipline));
  const locationOptions = uniq(tabFiltered.map((a) => a.locationGroup));
  const expTypeOptions = uniq(tabFiltered.map((a) => a.experienceType));

  return (
    <div className="bg-neutral-50 min-h-full">
      {wizardOpen && (
        <BulkCloneWizard
          availabilities={selectedAvailabilities}
          onClose={() => {
            setWizardOpen(false);
            setSelectedIds([]);
          }}
          onCloneComplete={(newOnes) => {
            if (newOnes.length > 0) {
              // Dedup against the full list: if a clone's resolved name already
              // exists, append #2, #3 … so names stay unique in the list.
              setAvailabilities((prev) => {
                const existingNames = new Set(prev.map((a) => a.name));
                const nameCounts = new Map<string, number>();
                for (const a of prev) {
                  const base = a.name.replace(/ #\d+$/, '');
                  nameCounts.set(base, (nameCounts.get(base) ?? 0) + 1);
                }
                const deduped = newOnes.map((a) => {
                  const base = a.name.replace(/ #\d+$/, '');
                  if (!existingNames.has(a.name) && !existingNames.has(base)) {
                    existingNames.add(a.name);
                    return a;
                  }
                  const next = (nameCounts.get(base) ?? 1) + 1;
                  nameCounts.set(base, next);
                  const suffixed = `${base} #${next}`;
                  existingNames.add(suffixed);
                  return { ...a, name: suffixed };
                });
                return [...deduped, ...prev];
              });
            }
            setWizardOpen(false);
            setSelectedIds([]);
          }}
        />
      )}

      {/* Page header */}
      <header className="bg-card border-b border-neutral-200">
        <div className="px-6 pt-5 flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <span className="size-10 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center">
              <FontAwesomeIcon name="calendar" className="w-5 h-5" aria-hidden="true" />
            </span>
            <div>
              <h1 className="text-lg font-semibold text-neutral-900 leading-7">Availability</h1>
              <p className="text-sm text-neutral-700 leading-5">Manage clinical rotation slots</p>
            </div>
          </div>
          <Button onClick={() => console.log('Post Availability')}>
            <FontAwesomeIcon name="plus" className="w-4 h-4" aria-hidden="true" />
            Post Availability
          </Button>
        </div>

        <div className="px-6 mt-4 flex gap-6" role="tablist" aria-label="Availability views">
          {TABS.map((tab) => {
            const isActive = tab === activeTab;
            return (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => handleTabChange(tab)}
                className={`pb-3 -mb-px text-sm font-medium border-b-2 transition-colors ${
                  isActive
                    ? 'border-blue-500 text-blue-500'
                    : 'border-transparent text-neutral-700 hover:text-neutral-900'
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>
      </header>

      <div className="p-6">
        <section className="bg-card rounded-xl shadow-[0_1px_1.5px_rgba(0,0,0,0.1),0_1px_1px_rgba(0,0,0,0.1)] overflow-hidden">
          {/* Filter bar */}
          <div className="flex items-center gap-2 flex-wrap p-4 border-b border-neutral-200">
            <div className="relative w-full sm:w-72">
              <FontAwesomeIcon
                name="search"
                className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-500"
                aria-hidden="true"
              />
              <Input
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search name or location"
                aria-label="Search availabilities"
                className="pl-9 h-9"
              />
            </div>
            <FilterDropdown
              label="Discipline"
              options={disciplineOptions}
              selected={selectedDiscipline}
              onChange={handleDisciplineChange}
            />
            <FilterDropdown
              label="Location group"
              options={locationOptions}
              selected={selectedLocation}
              onChange={handleLocationChange}
            />
            <FilterDropdown
              label="Experience"
              options={expTypeOptions}
              selected={selectedExperienceType}
              onChange={handleExperienceTypeChange}
            />
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={handleClearFilters} className="text-blue-500">
                Clear filters
              </Button>
            )}
            <span className="ml-auto text-sm text-neutral-700">
              {filteredAvailabilities.length} availabilities
            </span>
          </div>

          <AvailabilityListTable
            availabilities={filteredAvailabilities}
            selectedIds={selectedIds}
            onSelectAll={handleSelectAll}
            onSelectOne={handleSelectOne}
            onClone={handleClone}
            onBulkClone={handleBulkClone}
            formatDate={formatDate}
          />
        </section>
      </div>
    </div>
  );
}
