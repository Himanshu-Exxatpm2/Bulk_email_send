import { useState, useMemo } from 'react';
import { PillFilterChip } from '../ListFilters';
import { TabBar } from '../TabBar';
import { Checkbox } from '../ui/checkbox';
import { Input } from '../ui/input';
import { FontAwesomeIcon } from '../font-awesome-icon';
import { type RecipientRow, type PersonaOption } from '../email/ComposeEmailWizard';
import { BulkEmailFlow } from '../email/BulkEmailFlow';
import { groupVariant, type SurfaceKey } from '../../data/surfaceMergeFields';
import { EmailHistoryPanel } from '../email/EmailHistoryPanel';
import { SelectionToolbar, useBulkEmailSelection } from '../email/BulkEmailSurface';
import { preceptorsForPicked, personnelForPicked, schoolContactsForPicked, facultyForPicked } from '../email/boltOnRecipients';
import type { AudienceType } from '../../data/mockEmailTemplates';
import type { Schedule, OnboardingStatus, ScheduleStatus } from '../../data/mockSchedules';

// Shared Schedules list: All Schedules / Group / Individual, All / Upcoming / Current /
// Completed, Needs Attention, filters, and the bulk-email toolbar (Group and Individual
// only). Used by the Schedules page and by the Schedules tab on Location and School
// Partner detail pages, which pass in their own scoped schedules.

// Group vs Individual placement — not stored on Schedule, derived the same way
// Availability defines it: schedules sharing a rotation cohort (same rotationName)
// are a Group placement; a rotation with only one student is Individual.
type ExperienceFilter = 'All Schedules' | 'Group' | 'Individual';
const EXPERIENCE_FILTERS: ExperienceFilter[] = ['All Schedules', 'Group', 'Individual'];

function buildExperienceTypeMap(schedules: Schedule[]): Map<string, 'Group' | 'Individual'> {
  const cohortCounts = new Map<string, number>();
  schedules.forEach((s) => cohortCounts.set(s.rotationName, (cohortCounts.get(s.rotationName) ?? 0) + 1));
  const map = new Map<string, 'Group' | 'Individual'>();
  schedules.forEach((s) => map.set(s.id, (cohortCounts.get(s.rotationName) ?? 0) > 1 ? 'Group' : 'Individual'));
  return map;
}

// Second-row time tabs — mirrors the Availability page's All/Upcoming/Current/Completed,
// mapped onto Schedule's own scheduleStatus (scheduleStatus's 'Active' reads as "Current" here).
type TimeTab = 'All' | 'Upcoming' | 'Current' | 'Completed';
const TIME_TABS: TimeTab[] = ['All', 'Upcoming', 'Current', 'Completed'];
const TIME_TAB_TO_STATUS: Record<Exclude<TimeTab, 'All'>, ScheduleStatus> = {
  Upcoming: 'Upcoming',
  Current: 'Active',
  Completed: 'Completed',
};

const ONBOARDING_CLASSES: Record<OnboardingStatus, string> = {
  Compliant: 'bg-positive-default/10 text-positive-default',
  'Non-Compliant': 'bg-negative-default/10 text-negative-default',
  Pending: 'bg-accent-100 text-warning-default',
  'Not Started': 'bg-neutral-100 text-neutral-800',
};

// Broad discipline per program type — not stored on Schedule, derived for the Discipline chip
// (confirmed as a real filter dimension from the Overview tab's filter bar).
const PROGRAM_TO_DISCIPLINE: Record<string, string> = {
  BSN: 'Nursing',
  MOT: 'Occupational Therapy',
  DPT: 'Physical Therapy',
  'BS Rad Tech': 'Radiologic Technology',
};

const ONBOARDING_OPTIONS: OnboardingStatus[] = ['Compliant', 'Non-Compliant', 'Pending', 'Not Started'];

interface Filters {
  disciplines: string[];
  schools: string[];
  onboardingStatuses: string[];
}

const EMPTY_FILTERS: Filters = { disciplines: [], schools: [], onboardingStatuses: [] };

function buildFiltered(rows: Schedule[], search: string, filters: Filters) {
  const q = search.toLowerCase();
  return rows.filter((r) => {
    const matchSearch =
      q === '' ||
      r.studentName.toLowerCase().includes(q) ||
      r.studentEmail.toLowerCase().includes(q) ||
      r.school.toLowerCase().includes(q) ||
      r.location.toLowerCase().includes(q) ||
      r.rotationName.toLowerCase().includes(q);
    const discipline = PROGRAM_TO_DISCIPLINE[r.programType] ?? r.programType;
    const matchDiscipline = filters.disciplines.length === 0 || filters.disciplines.includes(discipline);
    const matchSchool = filters.schools.length === 0 || filters.schools.includes(r.school);
    const matchOnboarding = filters.onboardingStatuses.length === 0 || filters.onboardingStatuses.includes(r.onboardingStatus);
    return matchSearch && matchDiscipline && matchSchool && matchOnboarding;
  });
}


// ── Segmented control — All Schedules / Group / Individual ──────────────────────
function SegmentedControl<T extends string>({ value, options, onChange }: { value: T; options: T[]; onChange: (v: T) => void }) {
  return (
    <div className="inline-flex items-center bg-neutral-100 rounded-lg p-1">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
            value === opt ? 'bg-card text-neutral-900 shadow-sm' : 'text-neutral-800 hover:text-neutral-900'
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

// ── "Needs Attention" stat card — counts from the full mockSchedules dataset ────
function NeedsAttentionCard({ schedules }: { schedules: Schedule[] }) {
  const toBeScheduled = schedules.filter((s) => s.scheduleStatus === 'To be Scheduled').length;
  const notCompliant = schedules.filter((s) => s.onboardingStatus === 'Non-Compliant').length;
  const canceled = schedules.filter((s) => s.scheduleStatus === 'Canceled').length;

  const items: { label: string; value: number; dot: string }[] = [
    { label: 'To be Scheduled', value: toBeScheduled, dot: 'bg-warning-subtle' },
    { label: 'Not Compliant', value: notCompliant, dot: 'bg-negative-subtle' },
    { label: 'Canceled', value: canceled, dot: 'bg-neutral-500' },
  ];

  return (
    <div className="bg-card rounded-lg border border-neutral-200 px-4 py-2.5 flex items-center gap-4 flex-wrap">
      <div className="flex items-center gap-2 flex-shrink-0 pr-4 border-r border-neutral-200">
        <FontAwesomeIcon name="triangleExclamation" className="w-4 h-4 text-warning-subtle" />
        <span className="text-sm font-semibold text-neutral-900 whitespace-nowrap">Needs Attention</span>
      </div>
      {items.map((it) => (
        <div key={it.label} className="flex items-center gap-1.5 whitespace-nowrap">
          <span className={`w-2 h-2 rounded-full ${it.dot}`} />
          <span className="text-sm font-semibold text-neutral-900">{it.value}</span>
          <span className="text-xs text-neutral-800">{it.label}</span>
        </div>
      ))}
    </div>
  );
}


interface SchedulesListViewProps {
  schedules: Schedule[];
  // The School chip is redundant when the list is already scoped to one school.
  showSchoolFilter?: boolean;
  sourceSurface?: 'Schedules' | 'General';
  /** Which screen this list sits on; decides the merge fields offered. */
  surface?: SurfaceKey;
}

export function SchedulesListView({ schedules, showSchoolFilter = true, sourceSurface = 'Schedules', surface = 'site.locationSchedules' }: SchedulesListViewProps) {
  const disciplineOptions = useMemo(() => Array.from(new Set(schedules.map((s) => PROGRAM_TO_DISCIPLINE[s.programType] ?? s.programType))).sort(), [schedules]);
  const schoolOptions = useMemo(() => Array.from(new Set(schedules.map((s) => s.school))).sort(), [schedules]);
  const [experienceFilter, setExperienceFilter] = useState<ExperienceFilter>('All Schedules');
  const [timeTab, setTimeTab] = useState<TimeTab>('All');
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);

  const experienceTypeMap = useMemo(() => buildExperienceTypeMap(schedules), [schedules]);

  // ── Base list for the segmented control + time tabs, applied before search/filters ──
  const baseFiltered = useMemo<Schedule[]>(() => {
    return schedules.filter((s) => {
      const matchesExperience = experienceFilter === 'All Schedules' || experienceTypeMap.get(s.id) === experienceFilter;
      const matchesTime = timeTab === 'All' || s.scheduleStatus === TIME_TAB_TO_STATUS[timeTab];
      return matchesExperience && matchesTime;
    });
  }, [schedules, experienceFilter, timeTab, experienceTypeMap]);

  const filtered = buildFiltered(baseFiltered, search, filters);

  const { selectedIds, wizardOpen, setWizardOpen, historyOpen, setHistoryOpen, selectAllChecked, handleSelectAll, handleSelectOne, narrowSelection } =
    useBulkEmailSelection(filtered);

  function updateFilters(nextSearch: string, nextFilters: Filters) {
    const next = buildFiltered(baseFiltered, nextSearch, nextFilters);
    narrowSelection(new Set(next.map((r) => r.id)));
  }

  function handleSearchChange(value: string) {
    updateFilters(value, filters);
    setSearch(value);
  }

  function setFilter<K extends keyof Filters>(key: K, values: Filters[K]) {
    const nextFilters = { ...filters, [key]: values };
    updateFilters(search, nextFilters);
    setFilters(nextFilters);
  }

  // Segmented control / time-tab switches clear selection, same behavior as the
  // Availability page's tab switch (avoids emailing a row that just scrolled out of view).
  function handleExperienceFilterChange(value: ExperienceFilter) {
    setExperienceFilter(value);
    narrowSelection(new Set());
  }

  function handleTimeTabChange(value: string) {
    setTimeTab(value as TimeTab);
    narrowSelection(new Set());
  }

  // Bulk email only applies within Group / Individual; All Schedules is read-only.
  const emailEnabled = experienceFilter !== 'All Schedules';
  const selectedRows = filtered.filter((s) => selectedIds.includes(s.id));
  const recipientsByAudience: Partial<Record<AudienceType, RecipientRow[]>> = {
    Student: selectedRows.map((s) => ({ id: s.id, name: s.studentName, email: s.studentEmail, meta: s.school })),
    Preceptor: preceptorsForPicked(selectedRows),
    'Staff-Personnel': personnelForPicked(selectedRows),
    'School Contact': schoolContactsForPicked(selectedRows),
    'Placement Faculty/CI': facultyForPicked(selectedRows),
  };
  // Personas offered in the compose panel. Ticking one adds everyone tied to the selected
  // schedules: the students themselves, and the preceptors / site personnel at their
  // locations, the school contacts and placement faculty at their schools.
  const personas: PersonaOption[] = [
    { audience: 'Student', label: 'Students', description: 'The students on the selected schedules', recipients: recipientsByAudience.Student ?? [] },
    { audience: 'Preceptor', label: 'Preceptors', description: 'Preceptors at the selected locations', recipients: recipientsByAudience.Preceptor ?? [] },
    { audience: 'Staff-Personnel', label: 'Site Personnel', description: 'Site staff at the selected locations', recipients: recipientsByAudience['Staff-Personnel'] ?? [] },
    { audience: 'School Contact', label: 'Schools', description: 'School contacts for the students\' schools', recipients: recipientsByAudience['School Contact'] ?? [] },
    { audience: 'Placement Faculty/CI', label: 'Placement Faculty / CI', description: 'Faculty and clinical instructors at those schools', recipients: recipientsByAudience['Placement Faculty/CI'] ?? [] },
  ];

  return (
    <>
      <div className="w-full space-y-3">
          {/* Segmented control + Needs Attention card */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <SegmentedControl value={experienceFilter} options={EXPERIENCE_FILTERS} onChange={handleExperienceFilterChange} />
            <NeedsAttentionCard schedules={schedules} />
          </div>

          {/* Second-row time tabs */}
          <TabBar activeTab={timeTab} onTabChange={handleTimeTabChange} tabs={TIME_TABS} />

          <div className="bg-card rounded-xl shadow-[0_1px_1.5px_rgba(0,0,0,0.1),0_1px_1px_rgba(0,0,0,0.1)] overflow-hidden">

            {/* Filter bar */}
            <div className="px-4 py-3 border-b border-neutral-200 flex flex-wrap items-center gap-2">
              <div className="relative flex-1 min-w-[200px] max-w-xs">
                <FontAwesomeIcon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-600" />
                <Input
                  placeholder="Search student, school, location…"
                  value={search}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-9 h-9 text-sm"
                />
              </div>

              <PillFilterChip
                label="Discipline"
                icon="stethoscope"
                selectedValues={filters.disciplines}
                options={disciplineOptions}
                onChange={(v) => setFilter('disciplines', v)}
              />
              {showSchoolFilter && <PillFilterChip
                label="School"
                icon="graduationCap"
                selectedValues={filters.schools}
                options={schoolOptions}
                onChange={(v) => setFilter('schools', v)}
              />}
              <PillFilterChip
                label="Onboarding Status"
                icon="circleCheck"
                selectedValues={filters.onboardingStatuses}
                options={ONBOARDING_OPTIONS}
                onChange={(v) => setFilter('onboardingStatuses', v)}
              />

              <span className="text-sm text-neutral-700 ml-auto">{filtered.length} shown</span>
            </div>

            {/* Selection toolbar — Group and Individual only */}
            {emailEnabled && <SelectionToolbar
              selectedCount={selectedIds.length}
              entityLabel="Students"
              onBulkEmail={() => setWizardOpen(true)}
              onHistoryOpen={() => setHistoryOpen(true)}
            />}

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="sticky top-0 bg-[var(--bg-table-header)] z-10">
                  <tr className="border-b border-neutral-200">
                    {emailEnabled && (
                      <th className="w-11 px-4 py-3">
                        <Checkbox checked={selectAllChecked} onCheckedChange={(v) => handleSelectAll(!!v)} aria-label="Select all" />
                      </th>
                    )}
                    <th className="px-4 py-3 text-left text-xs font-medium text-neutral-900 uppercase tracking-wider">Student</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-neutral-900 uppercase tracking-wider hidden md:table-cell">School</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-neutral-900 uppercase tracking-wider hidden lg:table-cell">Program</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-neutral-900 uppercase tracking-wider">Location</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-neutral-900 uppercase tracking-wider hidden lg:table-cell">Rotation Dates</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-neutral-900 uppercase tracking-wider">Onboarding</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={emailEnabled ? 7 : 6} className="px-4 py-10 text-center text-sm text-neutral-600">
                        No schedules match your filters.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((sched) => {
                      const isSelected = selectedIds.includes(sched.id);
                      return (
                        <tr key={sched.id} className={`hover:bg-neutral-50 transition-colors ${isSelected ? 'bg-blue-50' : ''}`}>
                          {emailEnabled && (
                            <td className="w-11 px-4 py-3">
                              <Checkbox
                                checked={isSelected}
                                onCheckedChange={(v) => handleSelectOne(sched.id, !!v)}
                                aria-label={`Select ${sched.studentName}`}
                              />
                            </td>
                          )}
                          <td className="px-4 py-3">
                            <div>
                              <p className="text-sm font-medium text-neutral-900">{sched.studentName}</p>
                              <p className="text-xs text-neutral-600">{sched.studentEmail}</p>
                            </div>
                          </td>
                          <td className="px-4 py-3 hidden md:table-cell">
                            <span className="text-sm text-neutral-800 line-clamp-1">{sched.school}</span>
                          </td>
                          <td className="px-4 py-3 hidden lg:table-cell">
                            <span className="text-sm text-neutral-800">{sched.programType}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-xs text-neutral-700 line-clamp-1">{sched.location}</span>
                          </td>
                          <td className="px-4 py-3 hidden lg:table-cell">
                            <span className="text-xs text-neutral-600 whitespace-nowrap">
                              {new Date(sched.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              {' – '}
                              {new Date(sched.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${ONBOARDING_CLASSES[sched.onboardingStatus]}`}>
                              {sched.onboardingStatus}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <EmailHistoryPanel open={historyOpen} onClose={() => setHistoryOpen(false)} />
      </div>

      <BulkEmailFlow
        open={wizardOpen}
        onClose={() => setWizardOpen(false)}
        surface={experienceFilter === 'Group' ? groupVariant(surface) : surface}
        personas={personas}
        audienceType="Student"
        selectionSummary={`${selectedRows.length} ${selectedRows.length === 1 ? 'schedule' : 'schedules'} selected · ${experienceFilter}`}
        sourceSurface={sourceSurface}
        sourceSurfaceCandidates={['Schedules', 'Onboarding']}
      />
    </>
  );
}
