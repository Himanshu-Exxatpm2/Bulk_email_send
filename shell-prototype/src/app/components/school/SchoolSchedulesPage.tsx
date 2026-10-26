import { useState } from 'react';
import { PageHeader } from '../PageHeader';
import { Checkbox } from '../ui/checkbox';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { FontAwesomeIcon } from '../font-awesome-icon';
import { type RecipientRow, type PersonaOption } from '../email/ComposeEmailWizard';
import { BulkEmailFlow } from '../email/BulkEmailFlow';
import { EmailHistoryPanel } from '../email/EmailHistoryPanel';
import { SelectionToolbar, useBulkEmailSelection } from '../email/BulkEmailSurface';
import { personnelForPicked, facultyForPicked, schoolContactsForPicked } from '../email/boltOnRecipients';
import type { AudienceType } from '../../data/mockEmailTemplates';
import { mockSchedules, type Schedule, type OnboardingStatus } from '../../data/mockSchedules';

const ONBOARDING_CLASSES: Record<OnboardingStatus, string> = {
  Compliant: 'bg-positive-default/10 text-positive-default border border-positive-default/30',
  'Non-Compliant': 'bg-negative-default/10 text-negative-default border border-negative-default/30',
  Pending: 'bg-accent-100 text-warning-default border border-accent-200',
  'Not Started': 'bg-[var(--bg-container)] text-neutral-700 border border-neutral-200',
};

// School portal — scoped to Bowie State only
const BOWIE_STATE_SCHEDULES = mockSchedules.filter((s) => s.school === 'Bowie State University');

function buildFiltered(rows: Schedule[], search: string, onboarding: string) {
  const q = search.toLowerCase();
  return rows.filter((r) => {
    const matchSearch =
      q === '' ||
      r.studentName.toLowerCase().includes(q) ||
      r.studentEmail.toLowerCase().includes(q) ||
      r.location.toLowerCase().includes(q) ||
      r.rotationName.toLowerCase().includes(q);
    const matchOnboarding = onboarding === 'All' || r.onboardingStatus === onboarding;
    return matchSearch && matchOnboarding;
  });
}

export function SchoolSchedulesPage() {
  const [search, setSearch] = useState('');
  const [onboardingFilter, setOnboardingFilter] = useState('All');

  const filtered = buildFiltered(BOWIE_STATE_SCHEDULES, search, onboardingFilter);

  const { selectedIds, wizardOpen, setWizardOpen, historyOpen, setHistoryOpen, selectAllChecked, handleSelectAll, handleSelectOne, narrowSelection } =
    useBulkEmailSelection(filtered);

  function updateFilters(nextSearch: string, nextOnboarding: string) {
    const next = buildFiltered(BOWIE_STATE_SCHEDULES, nextSearch, nextOnboarding);
    narrowSelection(new Set(next.map((r) => r.id)));
  }

  const selectedRows = filtered.filter((s) => selectedIds.includes(s.id));
  // The group field list applies when every ticked placement is a group (a rotation with more than one student).
  const allGroup = selectedRows.length > 0 && selectedRows.every((s) => mockSchedules.filter((x) => x.rotationName === s.rotationName).length > 1);
  // School-initiated contextual sends (PRD 5.1): Students, Site Personnel and
  // Placement Faculty/CI can each be reached from a schedule selection.
  const recipientsByAudience: Partial<Record<AudienceType, RecipientRow[]>> = {
    Student: selectedRows.map((s) => ({ id: s.id, name: s.studentName, email: s.studentEmail, meta: s.location })),
    'Staff-Personnel': personnelForPicked(selectedRows),
    'Placement Faculty/CI': facultyForPicked(selectedRows),
    'School Contact': schoolContactsForPicked(selectedRows),
  };
  // Personas offered in the compose panel; ticking one adds its recipients automatically.
  const personas: PersonaOption[] = [
    { audience: 'Student', label: 'Students', description: 'The students on the selected schedules', recipients: recipientsByAudience.Student ?? [] },
    { audience: 'Staff-Personnel', label: 'Site Personnel', description: 'Site staff at the selected locations', recipients: recipientsByAudience['Staff-Personnel'] ?? [] },
    { audience: 'Placement Faculty/CI', label: 'Placement Faculty / CI', description: 'Faculty and clinical instructors at your school', recipients: recipientsByAudience['Placement Faculty/CI'] ?? [] },
    { audience: 'School Contact', label: 'School Program Contacts', description: 'All program contacts on file for your school', recipients: recipientsByAudience['School Contact'] ?? [] },
  ];

  const nonCompliantCount = BOWIE_STATE_SCHEDULES.filter((s) => s.onboardingStatus === 'Non-Compliant').length;
  const notStartedCount = BOWIE_STATE_SCHEDULES.filter((s) => s.onboardingStatus === 'Not Started').length;

  return (
    <>
      <PageHeader
        icon="calendar"
        title="Schedules & Onboarding"
        description={`${BOWIE_STATE_SCHEDULES.length} schedules · ${nonCompliantCount} non-compliant · ${notStartedCount} not started`}
      />

      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3">
        <div className="w-full space-y-3">
          <div className="bg-card rounded-xl shadow-[0_1px_1.5px_rgba(0,0,0,0.1),0_1px_1px_rgba(0,0,0,0.1)] overflow-hidden">

            {/* Filter bar */}
            <div className="px-4 py-3 border-b border-neutral-200 flex flex-wrap items-center gap-2">
              <div className="relative flex-1 min-w-[200px] max-w-xs">
                <FontAwesomeIcon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-600" />
                <Input
                  placeholder="Search student, location, rotation…"
                  value={search}
                  onChange={(e) => {
                    updateFilters(e.target.value, onboardingFilter);
                    setSearch(e.target.value);
                  }}
                  className="pl-9 h-9 text-sm"
                />
              </div>
              <Select
                value={onboardingFilter}
                onValueChange={(v) => { updateFilters(search, v); setOnboardingFilter(v); }}
              >
                <SelectTrigger className="h-9 w-44 text-sm">
                  <SelectValue placeholder="Onboarding status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All statuses</SelectItem>
                  <SelectItem value="Compliant">Compliant</SelectItem>
                  <SelectItem value="Non-Compliant">Non-Compliant</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Not Started">Not Started</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-neutral-700 ml-auto">{filtered.length} shown</span>
            </div>

            {/* Selection toolbar */}
            <SelectionToolbar
              selectedCount={selectedIds.length}
              entityLabel="Students"
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
                    <th className="px-4 py-3 text-left text-xs font-medium text-neutral-900 uppercase tracking-wider">Student</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-neutral-900 uppercase tracking-wider hidden md:table-cell">Program</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-neutral-900 uppercase tracking-wider">Location</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-neutral-900 uppercase tracking-wider hidden lg:table-cell">Rotation Dates</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-neutral-900 uppercase tracking-wider">Onboarding</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-10 text-center text-sm text-neutral-600">
                        No schedules match your filters.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((sched) => {
                      const isSelected = selectedIds.includes(sched.id);
                      return (
                        <tr
                          key={sched.id}
                          className={`hover:bg-neutral-50 transition-colors ${isSelected ? 'bg-blue-50' : ''}`}
                        >
                          <td className="w-11 px-4 py-3">
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={(v) => handleSelectOne(sched.id, !!v)}
                              aria-label={`Select ${sched.studentName}`}
                            />
                          </td>
                          <td className="px-4 py-3">
                            <div>
                              <p className="text-sm font-medium text-neutral-900">{sched.studentName}</p>
                              <p className="text-xs text-neutral-600">{sched.studentEmail}</p>
                            </div>
                          </td>
                          <td className="px-4 py-3 hidden md:table-cell">
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
      </div>

      <BulkEmailFlow
        open={wizardOpen}
        onClose={() => setWizardOpen(false)}
        surface={allGroup ? 'school.schedules.group' : 'school.schedules'}
        portal="school"
        personas={personas}
        audienceType="Student"
        selectionSummary={`${selectedRows.length} ${selectedRows.length === 1 ? 'schedule' : 'schedules'} selected`}
        sourceSurface="School Schedules"
      />
    </>
  );
}
