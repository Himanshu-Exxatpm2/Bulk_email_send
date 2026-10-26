import { useState } from 'react';
import { PageHeader } from '../PageHeader';
import { Checkbox } from '../ui/checkbox';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { FontAwesomeIcon } from '../font-awesome-icon';
import { type RecipientRow } from '../email/ComposeEmailWizard';
import { BulkEmailFlow } from '../email/BulkEmailFlow';
import { EmailHistoryPanel } from '../email/EmailHistoryPanel';
import { SelectionToolbar, useBulkEmailSelection } from '../email/BulkEmailSurface';
import { mockSlotRequests, type SlotRequest, type SlotRequestStatus } from '../../data/mockSlotRequests';

const STATUS_CLASSES: Record<SlotRequestStatus, string> = {
  Pending: 'bg-accent-100 text-warning-default border border-accent-200',
  Approved: 'bg-positive-default/10 text-positive-default border border-positive-default/30',
  Declined: 'bg-negative-default/10 text-negative-default border border-negative-default/30',
  'Info Requested': 'bg-blue-50 text-blue-700 border border-blue-200',
};

// School portal: show Bowie State's own slot requests (outbound requests to sites)
const bowieRequests = mockSlotRequests.filter((r) => r.schoolId === 'sp-001');

function buildFiltered(rows: SlotRequest[], search: string, status: string) {
  const q = search.toLowerCase();
  return rows.filter((r) => {
    const matchSearch = q === '' || r.rotationName.toLowerCase().includes(q) || r.location.toLowerCase().includes(q) || r.programType.toLowerCase().includes(q);
    const matchStatus = status === 'All' || r.status === status;
    return matchSearch && matchStatus;
  });
}

// Site contact lookup (clinical coordinators at each location)
const SITE_COORDINATOR: Record<string, { name: string; email: string }> = {
  'MedStar Washington Hospital Center – ICU': { name: 'Patricia Nguyen', email: 'p.nguyen@medstarhealth.org' },
  'MedStar Georgetown University Hospital – NICU': { name: 'Denise Washington', email: 'd.washington@medstarhealth.org' },
  'MedStar Washington Hospital Center – ED': { name: 'Raymond Castillo', email: 'r.castillo@medstarhealth.org' },
  'MedStar Montgomery Medical Center – Med/Surg': { name: 'George Mercer', email: 'g.mercer@medstarhealth.org' },
  'MedStar Harbor Hospital – Cardiology': { name: 'Carmen Ortega', email: 'c.ortega@medstarhealth.org' },
  'default': { name: 'MedStar Placement Office', email: 'placements@medstarhealth.org' },
};

function getSiteContact(location: string) {
  return SITE_COORDINATOR[location] ?? SITE_COORDINATOR['default'];
}

export function SchoolRequestsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const filtered = buildFiltered(bowieRequests, search, statusFilter);

  const { selectedIds, wizardOpen, setWizardOpen, historyOpen, setHistoryOpen, selectAllChecked, handleSelectAll, handleSelectOne, narrowSelection } =
    useBulkEmailSelection(filtered);

  function handleSearchChange(value: string) {
    const next = buildFiltered(bowieRequests, value, statusFilter);
    narrowSelection(new Set(next.map((r) => r.id)));
    setSearch(value);
  }

  function handleStatusChange(value: string) {
    const next = buildFiltered(bowieRequests, search, value);
    narrowSelection(new Set(next.map((r) => r.id)));
    setStatusFilter(value);
  }

  const selectedRows = filtered.filter((r) => selectedIds.includes(r.id));
  const recipients: RecipientRow[] = selectedRows.map((r) => {
    const contact = getSiteContact(r.location);
    return { id: r.id, name: contact.name, email: contact.email, meta: r.location };
  });

  const statusCounts = {
    Pending: bowieRequests.filter((r) => r.status === 'Pending').length,
    Approved: bowieRequests.filter((r) => r.status === 'Approved').length,
    Declined: bowieRequests.filter((r) => r.status === 'Declined').length,
    'Info Requested': bowieRequests.filter((r) => r.status === 'Info Requested').length,
  };

  return (
    <>
      <PageHeader
        icon="clipboardList"
        title="Requests"
        description={`${bowieRequests.length} slot requests · ${statusCounts.Pending} pending · ${statusCounts.Approved} approved`}
      />

      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3">
        <div className="w-full space-y-3">
          <div className="bg-card rounded-xl shadow-[0_1px_1.5px_rgba(0,0,0,0.1),0_1px_1px_rgba(0,0,0,0.1)] overflow-hidden">

            {/* Filter bar */}
            <div className="px-4 py-3 border-b border-neutral-200 flex flex-wrap items-center gap-2">
              <div className="relative flex-1 min-w-[180px] max-w-xs">
                <FontAwesomeIcon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-500" />
                <Input
                  placeholder="Search rotation, site…"
                  value={search}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-9 h-9 text-sm"
                />
              </div>
              <Select value={statusFilter} onValueChange={handleStatusChange}>
                <SelectTrigger className="h-8 w-40 text-sm">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All statuses</SelectItem>
                  <SelectItem value="Pending">Pending ({statusCounts.Pending})</SelectItem>
                  <SelectItem value="Approved">Approved ({statusCounts.Approved})</SelectItem>
                  <SelectItem value="Declined">Declined ({statusCounts.Declined})</SelectItem>
                  <SelectItem value="Info Requested">Info Requested ({statusCounts['Info Requested']})</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-xs text-neutral-500 ml-auto">{filtered.length} shown</span>
            </div>

            {/* Selection toolbar */}
            <SelectionToolbar
              selectedCount={selectedIds.length}
              entityLabel="Site Contacts"
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
                    <th className="px-4 py-3 text-left text-xs font-medium text-neutral-900 uppercase tracking-wider">Rotation</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-neutral-900 uppercase tracking-wider hidden md:table-cell">Program</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-neutral-900 uppercase tracking-wider hidden lg:table-cell">Site / Location</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-neutral-900 uppercase tracking-wider hidden lg:table-cell">Dates</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-neutral-900 uppercase tracking-wider hidden md:table-cell">Coordinator</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-neutral-900 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-neutral-900 uppercase tracking-wider hidden md:table-cell">Submitted</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-10 text-center text-sm text-neutral-500">
                        No requests match your filters.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((req) => {
                      const isSelected = selectedIds.includes(req.id);
                      const siteContact = getSiteContact(req.location);
                      return (
                        <tr key={req.id} className={`hover:bg-neutral-50 transition-colors ${isSelected ? 'bg-purple-700/5' : ''}`}>
                          <td className="w-11 px-4 py-3">
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={(v) => handleSelectOne(req.id, !!v)}
                              aria-label={`Select ${req.rotationName}`}
                            />
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm font-medium text-neutral-900 line-clamp-1">{req.rotationName}</span>
                          </td>
                          <td className="px-4 py-3 hidden md:table-cell">
                            <span className="text-sm text-neutral-700">{req.programType}</span>
                          </td>
                          <td className="px-4 py-3 hidden lg:table-cell">
                            <span className="text-xs text-neutral-600 line-clamp-1">{req.location}</span>
                          </td>
                          <td className="px-4 py-3 hidden lg:table-cell">
                            <span className="text-xs text-neutral-600 whitespace-nowrap">
                              {new Date(req.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              {' – '}
                              {new Date(req.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}
                            </span>
                          </td>
                          <td className="px-4 py-3 hidden md:table-cell">
                            <div>
                              <p className="text-sm text-neutral-700">{siteContact.name}</p>
                              <p className="text-xs text-neutral-500">{siteContact.email}</p>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${STATUS_CLASSES[req.status]}`}>
                              {req.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 hidden md:table-cell">
                            <span className="text-xs text-neutral-600">
                              {new Date(req.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
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
        surface="school.requests"
        portal="school"
        personas={[{ audience: 'School Contact', label: 'Site contacts', badge: 'Site contact', description: 'The site contact for each request you ticked', recipients }]}
        audienceType="School Contact"
        selectionSummary={`${selectedRows.length} ${selectedRows.length === 1 ? 'request' : 'requests'} selected`}
        sourceSurface="School Requests"
      />
    </>
  );
}
