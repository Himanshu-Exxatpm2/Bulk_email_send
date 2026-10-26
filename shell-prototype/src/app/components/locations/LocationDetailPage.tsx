import { useState, type ReactNode } from 'react';
import { toast } from 'sonner';
import { Checkbox } from '../ui/checkbox';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { TabBar } from '../TabBar';
import { FontAwesomeIcon } from '../font-awesome-icon';
import { type PersonaOption, type RecipientRow } from '../email/ComposeEmailWizard';
import { BulkEmailFlow } from '../email/BulkEmailFlow';
import { EmailHistoryPanel } from '../email/EmailHistoryPanel';
import { BulkEmailMenu, SelectionToolbar, useBulkEmailSelection } from '../email/BulkEmailSurface';
import { SchedulesListView } from '../schedules/SchedulesListView';
import { preceptorsAtLocations, personnelAtLocations, schoolContactsForSchools, facultyForSchools } from '../email/boltOnRecipients';
import type { AudienceType } from '../../data/mockEmailTemplates';
import { personnelRecipientRow } from '../email/boltOnRecipients';
import { mockLocations, type LocationDiscipline } from '../../data/mockLocations';
import { mockPersonnel, type Personnel } from '../../data/mockPersonnel';
import { mockSlotRequests, slotRequestContact, type SlotRequest, type SlotRequestStatus } from '../../data/mockSlotRequests';
import { mockSchedules, type Schedule, type OnboardingStatus } from '../../data/mockSchedules';
import { mockSchoolPartners } from '../../data/mockSchoolPartners';

type LocationTab = 'About' | 'Personnel' | 'Contracts' | 'Requests' | 'Schedules' | 'Availability';

const SR_STATUS: Record<SlotRequestStatus, string> = {
  Pending: 'bg-accent-100 text-warning-default border border-accent-200',
  Approved: 'bg-positive-default/10 text-positive-default border border-positive-default/30',
  Declined: 'bg-negative-default/10 text-negative-default border border-negative-default/30',
  'Info Requested': 'bg-blue-50 text-blue-700 border border-blue-200',
};
const OB_STATUS: Record<OnboardingStatus, string> = {
  Compliant: 'bg-positive-default/10 text-positive-default border border-positive-default/30',
  'Non-Compliant': 'bg-negative-default/10 text-negative-default border border-negative-default/30',
  Pending: 'bg-accent-100 text-warning-default border border-accent-200',
  'Not Started': 'bg-[var(--bg-container)] text-neutral-700 border border-neutral-200',
};

// ── Shared card shell — used across the About tab ───────────────────────────────
function Card({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <div className="bg-card rounded-xl shadow-[0_1px_1.5px_rgba(0,0,0,0.1),0_1px_1px_rgba(0,0,0,0.1)] p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-neutral-900">{title}</h3>
        {action}
      </div>
      {children}
    </div>
  );
}

function InfoField({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-xs text-neutral-600 uppercase tracking-wide mb-0.5">{label}</p>
      <p className="text-sm text-neutral-900">{value || '--'}</p>
    </div>
  );
}

function DisciplineRow({ discipline }: { discipline: LocationDiscipline }) {
  const [expanded, setExpanded] = useState(false);
  const CAP = 3;
  const visible = expanded ? discipline.specialties : discipline.specialties.slice(0, CAP);
  const remaining = discipline.specialties.length - CAP;

  return (
    <div className="py-2.5 first:pt-0 last:pb-0 border-b border-neutral-100 last:border-0">
      <p className="text-sm font-medium text-neutral-900">{discipline.name}</p>
      <div className="flex flex-wrap items-center gap-1.5 mt-1">
        {visible.map((s) => (
          <span key={s} className="inline-flex px-1.5 py-0.5 rounded text-xs bg-blue-500/8 text-blue-500">{s}</span>
        ))}
        {remaining > 0 && (
          <button
            type="button"
            onClick={() => setExpanded((e) => !e)}
            className="text-xs text-blue-500 hover:underline"
          >
            {expanded ? 'Show less' : `+${remaining} more`}
          </button>
        )}
      </div>
    </div>
  );
}

// ── About tab ─────────────────────────────────────────────────────────────────
function AboutTab({ location }: { location: (typeof mockLocations)[number] }) {
  return (
    <div className="space-y-3">
      <Card title="Basic Information">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InfoField label="Location Name" value={location.name} />
          <InfoField label="Alias Name" value={location.aliasName} />
          <InfoField label="Phone" value={location.phone} />
          <InfoField label="Parent" value={location.hospitalName} />
          <InfoField label="Address" value={`${location.address}, ${location.city}, ${location.state} ${location.zip}`} />
        </div>
        <div className="mt-4">
          <InfoField label="Description" value={location.description} />
        </div>
      </Card>

      <Card title="Associated Disciplines">
        {location.disciplines && location.disciplines.length > 0 ? (
          <div>
            {location.disciplines.map((d) => (
              <DisciplineRow key={d.name} discipline={d} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-neutral-600">No disciplines associated.</p>
        )}
      </Card>

      <Card
        title="Departments & Units"
        action={
          <button
            type="button"
            onClick={() => toast.info('Add Department/Unit — coming soon.')}
            className="text-xs text-blue-500 hover:underline flex items-center gap-1"
          >
            <FontAwesomeIcon name="plus" className="w-3 h-3" />
            Add Department/Unit
          </button>
        }
      >
        <p className="text-sm text-neutral-600">No department or unit added</p>
      </Card>

      <Card title="Associated Onboarding Requirements">
        <p className="text-sm text-neutral-600">No Onboarding Requirement Associated</p>
      </Card>
    </div>
  );
}

// ── Personnel Affiliation card ────────────────────────────────────────────────
// Still a card layout (list conversion is undecided). Bulk email here uses the
// "Compose" option: one button opens the compose panel, recipients are reviewed
// and removed inside the panel itself.
function PersonnelTab({ locationName }: { locationName: string }) {
  const rows: Personnel[] = mockPersonnel.filter((p) => p.location === locationName || p.location.startsWith(locationName.split(' – ')[0]));
  const [wizardOpen, setWizardOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  // The people at this location, grouped by role: the pop-up asks which roles the email is for, then step 1
  // lists them with a tick box each. "Everyone" is last so a role badge wins when someone is in both.
  const roles = Array.from(new Set(rows.map((p) => p.role || 'Other'))).sort();
  const personas: PersonaOption[] = [
    ...roles.map((role) => ({
      id: `role:${role}`,
      audience: 'Staff-Personnel' as const,
      label: role,
      badge: role,
      description: `${role} at this location`,
      recipients: rows.filter((p) => (p.role || 'Other') === role).map(personnelRecipientRow),
    })),
    {
      id: 'role:everyone',
      audience: 'Staff-Personnel' as const,
      label: 'Everyone at this location',
      badge: 'Site Personnel',
      description: 'All personnel affiliated with this location',
      recipients: rows.map(personnelRecipientRow),
    },
  ];

  return (
    <div className="bg-card rounded-xl shadow-[0_1px_1.5px_rgba(0,0,0,0.1),0_1px_1px_rgba(0,0,0,0.1)] p-5">
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <h3 className="text-sm font-semibold text-neutral-900">Personnel Affiliation</h3>
        <BulkEmailMenu composeDisabled={rows.length === 0} onCompose={() => setWizardOpen(true)} onHistoryOpen={() => setHistoryOpen(true)} />
      </div>
      {rows.length === 0 ? (
        <p className="text-sm text-neutral-600">No personnel affiliated with this location.</p>
      ) : (
        <div className="divide-y divide-neutral-100">
          {rows.map((p) => (
            <div key={p.id} className="py-2.5 first:pt-0 last:pb-0 text-sm">
              <span className="font-medium text-neutral-900">{p.firstName} {p.lastName}</span>
              <span className="text-neutral-600 mx-1.5">—</span>
              <span className="text-neutral-800">{p.role || '--'}</span>
            </div>
          ))}
        </div>
      )}
      <EmailHistoryPanel open={historyOpen} onClose={() => setHistoryOpen(false)} />
      <BulkEmailFlow
        open={wizardOpen}
        onClose={() => setWizardOpen(false)}
        surface="site.locationPersonnel"
        personas={personas}
        audienceType="Staff-Personnel"
        selectionSummary={`Personnel at ${locationName}`}
        sourceSurface="General"
      />
    </div>
  );
}

// ── Contracts sub-table ───────────────────────────────────────────────────────
function ContractsTab() {
  const rows = mockSchoolPartners.slice(0, 8);
  return (
    <div className="bg-card rounded-xl shadow-[0_1px_1.5px_rgba(0,0,0,0.1),0_1px_1px_rgba(0,0,0,0.1)] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[var(--bg-table-header)]">
            <tr className="border-b border-neutral-200">
              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-900 uppercase tracking-wider">School</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-900 uppercase tracking-wider hidden md:table-cell">Contact</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-900 uppercase tracking-wider hidden lg:table-cell">Programs</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-900 uppercase tracking-wider">Partner Since</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {rows.map((p) => (
              <tr key={p.id} className="hover:bg-neutral-50">
                <td className="px-4 py-3"><p className="text-sm font-medium text-neutral-900">{p.schoolName}</p></td>
                <td className="px-4 py-3 hidden md:table-cell"><p className="text-sm text-neutral-700">{p.contactName}</p><p className="text-xs text-neutral-600">{p.contactEmail ?? 'No email on file'}</p></td>
                <td className="px-4 py-3 hidden lg:table-cell"><div className="flex flex-wrap gap-1">{p.programTypes.map((pt) => <span key={pt} className="px-1.5 py-0.5 rounded text-xs bg-blue-50 text-blue-500">{pt}</span>)}</div></td>
                <td className="px-4 py-3"><span className="text-sm text-neutral-700">{p.partnerSince}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Requests sub-table ────────────────────────────────────────────────────────
function RequestsTab({ locationName }: { locationName: string }) {
  const rows: SlotRequest[] = mockSlotRequests.filter((r) => r.location.includes(locationName.split(' – ')[0]));
  const [search, setSearch] = useState('');
  const filtered = search === '' ? rows : rows.filter((r) => r.schoolName.toLowerCase().includes(search.toLowerCase()) || r.rotationName.toLowerCase().includes(search.toLowerCase()));
  return (
    <div className="bg-card rounded-xl shadow-[0_1px_1.5px_rgba(0,0,0,0.1),0_1px_1px_rgba(0,0,0,0.1)] overflow-hidden">
      <div className="px-4 py-3 border-b border-neutral-200 flex items-center gap-2">
        <div className="relative flex-1 max-w-xs">
          <FontAwesomeIcon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-600" />
          <Input placeholder="Search school, rotation…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9 text-sm" />
        </div>
        <span className="text-sm text-neutral-700 ml-auto">{filtered.length} requests</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[var(--bg-table-header)]">
            <tr className="border-b border-neutral-200">
              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-900 uppercase tracking-wider">School</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-900 uppercase tracking-wider hidden md:table-cell">Rotation</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-900 uppercase tracking-wider hidden lg:table-cell">Slots</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-900 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {filtered.length === 0 ? (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-sm text-neutral-600">No requests for this location.</td></tr>
            ) : filtered.map((r) => (
              <tr key={r.id} className="hover:bg-neutral-50">
                <td className="px-4 py-3"><p className="text-sm font-medium text-neutral-900">{r.schoolName}</p><p className="text-xs text-neutral-600">{slotRequestContact(r).name}</p></td>
                <td className="px-4 py-3 hidden md:table-cell"><span className="text-sm text-neutral-700 line-clamp-1">{r.rotationName}</span></td>
                <td className="px-4 py-3 hidden lg:table-cell"><span className="text-sm text-neutral-800">{r.slotsRequested}</span></td>
                <td className="px-4 py-3"><span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${SR_STATUS[r.status]}`}>{r.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Schedules sub-table ───────────────────────────────────────────────────────
function SchedulesTab({ locationName }: { locationName: string }) {
  const rows: Schedule[] = mockSchedules.filter((s) => s.location.includes(locationName.split(' – ')[0]));
  return <SchedulesListView schedules={rows} surface="site.locationSchedules" />;
}

// ── Availability tab — placeholder; the top-level Availability list page isn't
// wired for a per-location filter, and Availability isn't a Bulk Email surface ──
function AvailabilityTab() {
  return (
    <div className="bg-card rounded-xl shadow-[0_1px_1.5px_rgba(0,0,0,0.1),0_1px_1px_rgba(0,0,0,0.1)] p-10 text-center">
      <FontAwesomeIcon name="calendar" className="w-8 h-8 text-neutral-400 mx-auto mb-3" aria-hidden="true" />
      <p className="text-sm text-neutral-600">No availabilities posted for this location yet.</p>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
interface LocationDetailPageProps {
  locationId: string;
  onNavigate?: (href: string) => void;
}

const TABS: LocationTab[] = ['About', 'Personnel', 'Contracts', 'Requests', 'Schedules', 'Availability'];

export function LocationDetailPage({ locationId, onNavigate }: LocationDetailPageProps) {
  const [activeTab, setActiveTab] = useState<LocationTab>('About');

  const location = mockLocations.find((l) => l.id === locationId) ?? mockLocations[0];

  return (
    <div className="h-full flex flex-col bg-neutral-50">
      {/* Breadcrumb */}
      <div className="bg-card px-6 pt-3 text-xs text-neutral-600">
        <button onClick={() => onNavigate?.('/locations')} className="hover:text-blue-500 hover:underline">Locations</button>
        <span className="mx-1.5 text-neutral-500">&gt;</span>
        <span className="text-neutral-700">{location.name}</span>
      </div>

      {/* Location header */}
      <div className="bg-card border-b border-neutral-200 px-6 py-4">
        <div className="flex items-start gap-3">
          <button
            className="mt-0.5 text-neutral-600 hover:text-neutral-800 transition-colors"
            onClick={() => onNavigate?.('/locations')}
            aria-label="Back to locations"
          >
            <FontAwesomeIcon name="chevronLeft" className="w-4 h-4" />
          </button>
          <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
            <FontAwesomeIcon name="mapPin" className="w-5 h-5 text-blue-500" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-base font-semibold text-neutral-900">{location.name}</h1>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${location.status === 'Active' ? 'bg-positive-default/10 text-positive-default border border-positive-default/30' : 'bg-[var(--bg-container)] text-neutral-600 border border-neutral-200'}`}>
                {location.status}
              </span>
            </div>
            <p className="text-xs text-neutral-600 mt-0.5">
              {location.hospitalName} · {location.address}, {location.city}, {location.state} · {location.phone}
            </p>
          </div>
          <div className="flex items-center gap-4 text-right flex-shrink-0">
            <div>
              <p className="text-lg font-bold text-neutral-900 leading-none">{location.activeAvailabilities}</p>
              <p className="text-xs text-neutral-600">availabilities</p>
            </div>
            <div>
              <p className="text-lg font-bold text-neutral-900 leading-none">{location.activeSchedules}</p>
              <p className="text-xs text-neutral-600">schedules</p>
            </div>
          </div>
        </div>

        {/* Tab bar */}
        <div className="mt-4 -mb-4">
          <TabBar activeTab={activeTab} onTabChange={(t) => setActiveTab(t as LocationTab)} tabs={TABS} />
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4">
        <div className="w-full">
          {activeTab === 'About' && <AboutTab location={location} />}
          {activeTab === 'Personnel' && <PersonnelTab locationName={location.name} />}
          {activeTab === 'Contracts' && <ContractsTab />}
          {activeTab === 'Requests' && <RequestsTab locationName={location.name} />}
          {activeTab === 'Schedules' && <SchedulesTab locationName={location.name} />}
          {activeTab === 'Availability' && <AvailabilityTab />}
        </div>
      </div>
    </div>
  );
}
