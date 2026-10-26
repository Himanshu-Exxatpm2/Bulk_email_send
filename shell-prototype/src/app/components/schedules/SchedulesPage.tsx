import { useState } from 'react';
import { PageHeader } from '../PageHeader';
import { TabBar } from '../TabBar';
import { FontAwesomeIcon } from '../font-awesome-icon';
import { SchedulesListView } from './SchedulesListView';
import { mockSchedules, KPI_TOTAL_SCHEDULES, type Schedule } from '../../data/mockSchedules';

// Top-level page tabs (new outer navigation).
type PageTab = 'Overview' | 'Schedules List' | 'Calendar' | 'Report';
const PAGE_TABS: PageTab[] = ['Overview', 'Schedules List', 'Calendar', 'Report'];

// ── KPI card — same visual pattern as PersonnelPage's stat cards ───────────────
function KpiCard({ icon, label, value, sub, accent }: { icon: string; label: string; value: string | number; sub?: string; accent: string }) {
  return (
    <div className="flex items-center gap-8 rounded border border-neutral-200 bg-card px-4 py-3">
      <div className="flex items-center gap-2">
        <FontAwesomeIcon name={icon as any} className="w-4 h-4 text-neutral-900" />
        <span className="text-sm text-blue-500">{label}</span>
      </div>
      <span className="text-lg font-semibold text-neutral-900">{value}</span>
    </div>
  );
}

// ── Overview tab — status KPI summary from mockSchedules ─────────────────────────
function OverviewTab({ schedules }: { schedules: Schedule[] }) {
  const active = schedules.filter((s) => s.scheduleStatus === 'Active').length;
  const upcoming = schedules.filter((s) => s.scheduleStatus === 'Upcoming').length;
  const nonCompliant = schedules.filter((s) => s.onboardingStatus === 'Non-Compliant').length;
  const notStarted = schedules.filter((s) => s.onboardingStatus === 'Not Started').length;

  return (
    <div className="w-full flex flex-wrap gap-4">
      <KpiCard icon="calendar" label="Active Schedules" value={active} sub={`${KPI_TOTAL_SCHEDULES} platform-wide`} accent="bg-blue-500" />
      <KpiCard icon="clock" label="Upcoming" value={upcoming} accent="bg-warning-subtle" />
      <KpiCard icon="triangleExclamation" label="Non-Compliant" value={nonCompliant} sub="Onboarding" accent="bg-negative-subtle" />
      <KpiCard icon="circleQuestion" label="Not Started" value={notStarted} sub="Onboarding" accent="bg-neutral-500" />
    </div>
  );
}

// ── Placeholder tab body — Calendar / Report aren't built yet ───────────────────
function ComingSoonTab({ icon, label }: { icon: string; label: string }) {
  return (
    <div className="w-full bg-card rounded-lg border border-neutral-200 p-10 text-center">
      <FontAwesomeIcon name={icon as any} className="w-8 h-8 text-neutral-400 mx-auto mb-3" aria-hidden="true" />
      <p className="text-sm text-neutral-600">{label} — coming soon.</p>
    </div>
  );
}

export function SchedulesPage() {
  const [pageTab, setPageTab] = useState<PageTab>('Schedules List');

  const nonCompliantCount = mockSchedules.filter((s) => s.onboardingStatus === 'Non-Compliant').length;
  const notStartedCount = mockSchedules.filter((s) => s.onboardingStatus === 'Not Started').length;

  return (
    <>
      <PageHeader
        icon="calendar"
        title="Schedules & Onboarding"
        description={`${KPI_TOTAL_SCHEDULES} active schedules · ${nonCompliantCount} non-compliant · ${notStartedCount} not started`}
      />

      {/* Top-level page navigation */}
      <div className="bg-card border-b border-neutral-200 px-4 sm:px-6 py-3">
        <TabBar activeTab={pageTab} onTabChange={(t) => setPageTab(t as PageTab)} tabs={PAGE_TABS} />
      </div>

      {pageTab === 'Overview' && (
        <div className="p-3 sm:p-4">
          <OverviewTab schedules={mockSchedules} />
        </div>
      )}

      {pageTab === 'Calendar' && (
        <div className="p-3 sm:p-4">
          <ComingSoonTab icon="calendar" label="Calendar" />
        </div>
      )}

      {pageTab === 'Report' && (
        <div className="p-3 sm:p-4">
          <ComingSoonTab icon="barChart" label="Report" />
        </div>
      )}

      {pageTab === 'Schedules List' && (
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3">
          <SchedulesListView schedules={mockSchedules} />
        </div>
      )}
    </>
  );
}
