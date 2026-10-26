import { useState, type ReactNode } from 'react';
import { toast } from 'sonner';
import { Checkbox } from '../ui/checkbox';
import { Input } from '../ui/input';
import { TabBar } from '../TabBar';
import { FontAwesomeIcon } from '../font-awesome-icon';
import { type PersonaOption, type RecipientRow } from '../email/ComposeEmailWizard';
import { BulkEmailFlow } from '../email/BulkEmailFlow';
import { EmailHistoryPanel } from '../email/EmailHistoryPanel';
import { SelectionToolbar, useBulkEmailSelection } from '../email/BulkEmailSurface';
import { SchedulesListView } from '../schedules/SchedulesListView';
import { preceptorsAtLocations, personnelAtLocations, schoolContactsForSchools, facultyForSchools } from '../email/boltOnRecipients';
import type { AudienceType } from '../../data/mockEmailTemplates';
import { mockSchoolPartners } from '../../data/mockSchoolPartners';
import { mockSlotRequests, type SlotRequest, type SlotRequestStatus } from '../../data/mockSlotRequests';
import { mockSchedules, type Schedule, type OnboardingStatus } from '../../data/mockSchedules';

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

type DetailTab = 'About' | 'Requests' | 'Schedules' | 'Contracts';

interface SchoolPartnerDetailPageProps {
  partnerId: string;
  onNavigate?: (href: string) => void;
}

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

// ── About tab ─────────────────────────────────────────────────────────────────
function AboutTab({ partner }: { partner: (typeof mockSchoolPartners)[number] }) {
  const [contactSearch, setContactSearch] = useState('');
  const filteredContacts = contactSearch === ''
    ? partner.contacts
    : partner.contacts.filter((c) =>
        c.name.toLowerCase().includes(contactSearch.toLowerCase()) ||
        (c.email ?? '').toLowerCase().includes(contactSearch.toLowerCase()),
      );

  // Contacts are keyed by email (falls back to name); contacts without an email can't be selected.
  const contactRows = filteredContacts.map((c) => ({ ...c, id: c.email ?? c.name }));
  const { selectedIds, wizardOpen, setWizardOpen, historyOpen, setHistoryOpen, selectAllChecked, handleSelectAll, handleSelectOne, narrowSelection } =
    useBulkEmailSelection(contactRows.filter((c) => c.email));
  const contactRecipients: RecipientRow[] = contactRows
    .filter((c) => c.email && selectedIds.includes(c.id))
    .map((c) => ({ id: c.id, name: c.name, email: c.email, meta: c.role }));

  return (
    <div className="space-y-3">
      <Card title="Basic Information">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InfoField label="Name" value={partner.schoolName} />
          <InfoField label="Alias Name" value={partner.aliasName} />
          <InfoField label="Category" value={partner.category} />
          <InfoField label="Website" value={partner.website} />
          <InfoField label="Associated Discipline" value={partner.programTypes.join(', ')} />
          <InfoField label="Address" value={`${partner.address}, ${partner.city}, ${partner.state}`} />
        </div>
      </Card>

      <Card
        title="Related Documents"
        action={
          <button
            type="button"
            onClick={() => toast.info('Add Notes and documents — coming soon.')}
            className="text-xs text-blue-500 hover:underline flex items-center gap-1"
          >
            <FontAwesomeIcon name="plus" className="w-3 h-3" />
            Add Notes and documents
          </button>
        }
      >
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <FontAwesomeIcon name="clipboard" className="w-10 h-10 text-neutral-400 mb-3" aria-hidden="true" />
          <p className="text-sm text-neutral-600">Notes and documents will be listed here</p>
        </div>
      </Card>

      <Card
        title="Program Contacts"
        action={
          <button
            type="button"
            onClick={() => toast.info('Add User — coming soon.')}
            className="text-xs text-blue-500 hover:underline flex items-center gap-1"
          >
            <FontAwesomeIcon name="plus" className="w-3 h-3" />
            Add User
          </button>
        }
      >
        <div className="relative max-w-xs mb-3">
          <FontAwesomeIcon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-600" />
          <Input
            placeholder="Search contacts…"
            value={contactSearch}
            onChange={(e) => {
              const q = e.target.value.toLowerCase();
              narrowSelection(new Set(partner.contacts.filter((c) => c.email && (c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q))).map((c) => c.email as string)));
              setContactSearch(e.target.value);
            }}
            className="pl-9 h-9 text-sm"
          />
        </div>
        <div className="border border-neutral-200 rounded-md overflow-hidden">
          <SelectionToolbar selectedCount={selectedIds.length} entityLabel="Program Contacts" onBulkEmail={() => setWizardOpen(true)} onHistoryOpen={() => setHistoryOpen(true)} />
          <table className="w-full">
            <thead className="bg-[var(--bg-table-header)]">
              <tr className="border-b border-neutral-200">
                <th className="w-11 px-3 py-2"><Checkbox checked={selectAllChecked} onCheckedChange={(v) => handleSelectAll(!!v)} aria-label="Select all contacts" /></th>
                <th className="px-3 py-2 text-left text-xs font-medium text-neutral-900 uppercase tracking-wider">Name</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-neutral-900 uppercase tracking-wider">Email</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-neutral-900 uppercase tracking-wider">Phone</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-neutral-900 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredContacts.length === 0 ? (
                <tr><td colSpan={5} className="px-3 py-6 text-center text-sm text-neutral-600">No contacts match your search.</td></tr>
              ) : contactRows.map((c) => (
                <tr key={c.id} className={`hover:bg-neutral-50 ${selectedIds.includes(c.id) ? 'bg-blue-50' : ''}`}>
                  <td className="w-11 px-3 py-2.5">
                    <Checkbox
                      checked={selectedIds.includes(c.id)}
                      disabled={!c.email}
                      onCheckedChange={(v) => handleSelectOne(c.id, !!v)}
                      aria-label={`Select ${c.name}`}
                    />
                  </td>
                  <td className="px-3 py-2.5">
                    <p className="text-sm font-medium text-neutral-900">{c.name}</p>
                    <p className="text-xs text-neutral-600">{c.role}</p>
                  </td>
                  <td className="px-3 py-2.5">{c.email ? <span className="text-sm text-neutral-700">{c.email}</span> : <span className="text-sm text-negative-default">No email on file</span>}</td>
                  <td className="px-3 py-2.5"><span className="text-sm text-neutral-700">{c.phone}</span></td>
                  <td className="px-3 py-2.5">
                    <button
                      type="button"
                      onClick={() => toast.info(`Edit ${c.name} — coming soon.`)}
                      className="text-neutral-600 hover:text-blue-500 transition-colors"
                      aria-label={`Edit ${c.name}`}
                    >
                      <FontAwesomeIcon name="penToSquare" className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <EmailHistoryPanel open={historyOpen} onClose={() => setHistoryOpen(false)} />
      <BulkEmailFlow
        open={wizardOpen}
        onClose={() => setWizardOpen(false)}
        surface="site.partnerContacts"
        personas={[{ audience: 'School Contact', label: 'Program contacts', badge: 'Program contact', description: 'The contacts you ticked', recipients: contactRecipients }]}
        audienceType="School Contact"
        selectionSummary={`${contactRecipients.length} ${contactRecipients.length === 1 ? 'contact' : 'contacts'} selected`}
        sourceSurface="General"
      />
    </div>
  );
}

function RequestsTab({ schoolName }: { schoolName: string }) {
  const rows: SlotRequest[] = mockSlotRequests.filter((r) => r.schoolName === schoolName);
  const [search, setSearch] = useState('');
  const filtered = search === ''
    ? rows
    : rows.filter((r) =>
        r.rotationName.toLowerCase().includes(search.toLowerCase()) ||
        r.location.toLowerCase().includes(search.toLowerCase()),
      );

  return (
    <div className="bg-card rounded-xl shadow-[0_1px_1.5px_rgba(0,0,0,0.1),0_1px_1px_rgba(0,0,0,0.1)] overflow-hidden">
      <div className="px-4 py-3 border-b border-neutral-200 flex items-center gap-2">
        <div className="relative flex-1 max-w-xs">
          <FontAwesomeIcon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-600" />
          <Input placeholder="Search rotation, location…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9 text-sm" />
        </div>
        <span className="text-sm text-neutral-700 ml-auto">{filtered.length} requests</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[var(--bg-table-header)]">
            <tr className="border-b border-neutral-200">
              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-900 uppercase tracking-wider">Rotation</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-900 uppercase tracking-wider hidden md:table-cell">Program</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-900 uppercase tracking-wider hidden lg:table-cell">Dates</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-900 uppercase tracking-wider hidden md:table-cell">Slots</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-900 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {filtered.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-neutral-600">No requests found.</td></tr>
            ) : filtered.map((r) => (
              <tr key={r.id} className="hover:bg-neutral-50 transition-colors">
                <td className="px-4 py-3"><span className="text-sm text-neutral-800 line-clamp-1">{r.rotationName}</span></td>
                <td className="px-4 py-3 hidden md:table-cell"><span className="text-sm text-neutral-700">{r.programType}</span></td>
                <td className="px-4 py-3 hidden lg:table-cell"><span className="text-xs text-neutral-600 whitespace-nowrap">{new Date(r.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – {new Date(r.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}</span></td>
                <td className="px-4 py-3 hidden md:table-cell"><span className="text-sm text-neutral-800">{r.slotsRequested}</span></td>
                <td className="px-4 py-3"><span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${SR_STATUS[r.status]}`}>{r.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SchedulesTab({ schoolName }: { schoolName: string }) {
  const rows: Schedule[] = mockSchedules.filter((s) => s.school === schoolName);
  return <SchedulesListView schedules={rows} showSchoolFilter={false} surface="site.partnerSchedules" />;
}

// Only contract counts exist on the partner record in this prototype, so this tab
// summarizes those rather than listing individual contracts.
function ContractsTab({ partner }: { partner: (typeof mockSchoolPartners)[number] }) {
  return (
    <div className="bg-card rounded-xl shadow-[0_1px_1.5px_rgba(0,0,0,0.1),0_1px_1px_rgba(0,0,0,0.1)] p-5 space-y-4">
      <h2 className="text-sm font-semibold text-neutral-900">Contracts</h2>
      <div className="flex flex-wrap gap-4">
        <div className="rounded border border-neutral-200 px-4 py-3 min-w-[160px]">
          <p className="text-lg font-semibold text-neutral-900">{partner.activeContractsCount}</p>
          <p className="text-xs text-neutral-700">Active</p>
        </div>
        <div className="rounded border border-neutral-200 px-4 py-3 min-w-[160px]">
          <p className="text-lg font-semibold text-neutral-900">{partner.expiredContractsCount}</p>
          <p className="text-xs text-neutral-700">Expired</p>
        </div>
      </div>
      <p className="text-sm text-neutral-600">Contract documents and renewal dates aren't part of this prototype.</p>
    </div>
  );
}

export function SchoolPartnerDetailPage({ partnerId, onNavigate }: SchoolPartnerDetailPageProps) {
  const [activeTab, setActiveTab] = useState<DetailTab>('About');

  const partner = mockSchoolPartners.find((p) => p.id === partnerId) ?? mockSchoolPartners[0];

  const TABS: DetailTab[] = ['About', 'Requests', 'Schedules', 'Contracts'];

  return (
    <div className="h-full flex flex-col bg-neutral-50">
      {/* Breadcrumb */}
      <div className="bg-card px-6 pt-3 text-xs text-neutral-600">
        <button onClick={() => onNavigate?.('/partners')} className="hover:text-blue-500 hover:underline">School Partners</button>
        <span className="mx-1.5 text-neutral-500">&gt;</span>
        <span className="text-neutral-700">{partner.schoolName}</span>
      </div>

      {/* Partner header */}
      <div className="bg-card border-b border-neutral-200 px-6 py-4">
        <div className="flex items-start gap-3">
          <button
            className="mt-0.5 text-neutral-600 hover:text-neutral-800 transition-colors"
            onClick={() => onNavigate?.('/partners')}
            aria-label="Back to partners"
          >
            <FontAwesomeIcon name="chevronLeft" className="w-4 h-4" />
          </button>
          <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
            <FontAwesomeIcon name="graduationCap" className="w-5 h-5 text-blue-500" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base font-semibold text-neutral-900">{partner.schoolName}</h1>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-positive-default/10 text-positive-default border border-positive-default/30">
                {partner.activeContractsCount} Active Contract{partner.activeContractsCount === 1 ? '' : 's'}
              </span>
              {partner.expiredContractsCount > 0 && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[var(--bg-container)] text-neutral-600 border border-neutral-200">
                  {partner.expiredContractsCount} Contract{partner.expiredContractsCount === 1 ? '' : 's'} Expired
                </span>
              )}
            </div>
            <p className="text-xs text-neutral-600 mt-0.5">
              {partner.category} · {partner.address}, {partner.city}, {partner.state} · {partner.website} · {partner.contactName}
            </p>
          </div>
        </div>

        {/* Tab bar */}
        <div className="mt-4 -mb-4">
          <TabBar activeTab={activeTab} onTabChange={(t) => setActiveTab(t as DetailTab)} tabs={TABS} />
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4">
        <div className="w-full">
          {activeTab === 'About' && <AboutTab partner={partner} />}
          {activeTab === 'Requests' && (
            <RequestsTab schoolName={partner.schoolName} />
          )}
          {activeTab === 'Schedules' && <SchedulesTab schoolName={partner.schoolName} />}
          {activeTab === 'Contracts' && <ContractsTab partner={partner} />}
        </div>
      </div>
    </div>
  );
}
