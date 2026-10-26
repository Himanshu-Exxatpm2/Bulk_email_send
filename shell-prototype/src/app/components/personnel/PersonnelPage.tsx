import { useState } from 'react';
import { toast } from 'sonner';
import { PageHeader } from '../PageHeader';
import { FilterChip } from '../ListFilters';
import { Checkbox } from '../ui/checkbox';
import { Input } from '../ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { FontAwesomeIcon } from '../font-awesome-icon';
import { type RecipientRow } from '../email/ComposeEmailWizard';
import { BulkEmailFlow } from '../email/BulkEmailFlow';
import { EmailHistoryPanel } from '../email/EmailHistoryPanel';
import { SelectionToolbar, useBulkEmailSelection } from '../email/BulkEmailSurface';
import { mockPersonnel, setReceiveNotifications, type Personnel, type PersonnelRole } from '../../data/mockPersonnel';
import { personnelRecipientRow } from '../email/boltOnRecipients';
import { Switch } from '../ui/switch';

const ROLES: PersonnelRole[] = [
  'Nurse Manager', 'Clinical Preceptor', 'Clinical Coordinator',
  'Department Director', 'Placement Coordinator', 'Administrative Staff', 'Education Specialist',
];

const DESIGNATIONS = Array.from(new Set(mockPersonnel.map((p) => p.designation))).sort();

const STATUS_OPTIONS = ['Active', 'Inactive'];
const SYSTEM_ACCESS_OPTIONS = ['Has System Access', 'No System Access'];

function buildFiltered(
  rows: Personnel[],
  search: string,
  role: string,
  status: string,
  designation: string,
  systemAccess: string,
) {
  const q = search.toLowerCase();
  return rows.filter((p) => {
    const matchSearch =
      q === '' ||
      `${p.firstName} ${p.lastName}`.toLowerCase().includes(q) ||
      (p.email ?? '').toLowerCase().includes(q) ||
      p.department.toLowerCase().includes(q) ||
      p.location.toLowerCase().includes(q);
    const matchRole = role === 'All' || p.role === role;
    const matchStatus =
      status === 'All' || (status === 'Active' ? p.isActive : !p.isActive);
    const matchDesignation = designation === 'All' || p.designation === designation;
    const matchSystemAccess =
      systemAccess === 'All' ||
      (systemAccess === 'Has System Access' ? p.hasSystemAccess : !p.hasSystemAccess);
    return matchSearch && matchRole && matchStatus && matchDesignation && matchSystemAccess;
  });
}

function formatDate(iso: string): string {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ── KPI card — same visual pattern as SiteDashboard's stat cards ───────────────
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


export function PersonnelPage() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [designationFilter, setDesignationFilter] = useState('All');
  const [systemAccessFilter, setSystemAccessFilter] = useState('All');

  const filtered = buildFiltered(mockPersonnel, search, roleFilter, statusFilter, designationFilter, systemAccessFilter);

  const [, bumpNotifications] = useState(0);

  // Rows with Receive Notifications off can't be selected for Bulk Email (PRD 5.6),
  // so Select all and the "N selected" count only ever see eligible rows.
  const eligible = filtered.filter((p) => p.receiveNotifications);
  const { selectedIds, wizardOpen, setWizardOpen, historyOpen, setHistoryOpen, selectAllChecked, handleSelectAll, handleSelectOne, narrowSelection } =
    useBulkEmailSelection(eligible);

  function toggleNotifications(p: Personnel, on: boolean) {
    setReceiveNotifications(p.id, on);
    if (!on) handleSelectOne(p.id, false);
    bumpNotifications((n) => n + 1);
    toast.success(`${p.firstName} ${p.lastName} ${on ? 'will receive' : 'will no longer receive'} Bulk Email notifications.`);
  }

  function updateFilters(s: string, r: string, st: string, d: string, sa: string) {
    const next = buildFiltered(mockPersonnel, s, r, st, d, sa);
    narrowSelection(new Set(next.map((p) => p.id)));
  }

  const selectedRows = filtered.filter((p) => selectedIds.includes(p.id));
  const recipients: RecipientRow[] = selectedRows.map(personnelRecipientRow);

  // ── KPI counts ──────────────────────────────────────────────────────────────
  const totalPersonnel = mockPersonnel.length;
  const withAccessCount = mockPersonnel.filter((p) => p.hasSystemAccess).length;
  const pendingLoginCount = mockPersonnel.filter((p) => p.hasSystemAccess && !p.hasLoggedIn).length;
  const inactiveCount = mockPersonnel.filter((p) => !p.isActive).length;

  return (
    <>
      <PageHeader
        icon="building"
        title="Site Personnel"
        description={`${totalPersonnel} staff across ${new Set(mockPersonnel.map((p) => p.location)).size} locations`}
        actions={[
          { label: 'Add Personnel', icon: 'plus', onClick: () => toast.info('Add Personnel — coming soon.') },
        ]}
      />

      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3">
        <div className="w-full space-y-3">

          {/* KPI cards */}
          <div className="flex flex-wrap gap-4">
            <KpiCard icon="users"      label="Total Personnel"     value={totalPersonnel}   sub="All staff on record"        accent="bg-blue-500" />
            <KpiCard icon="userCheck"  label="Personnel with Access" value={withAccessCount} sub="Active system logins"       accent="bg-positive-default" />
            <KpiCard icon="clock"      label="Pending Login"       value={pendingLoginCount} sub="Access granted, not yet used" accent="bg-warning-subtle" />
            <KpiCard icon="x"          label="Inactive"            value={inactiveCount}    sub="No longer active staff"     accent="bg-neutral-500" />
          </div>

          <div className="bg-card rounded-xl shadow-[0_1px_1.5px_rgba(0,0,0,0.1),0_1px_1px_rgba(0,0,0,0.1)] overflow-hidden">

            {/* Filter bar */}
            <div className="px-4 py-3 border-b border-neutral-200 flex flex-wrap items-center gap-2">
              <div className="relative flex-1 min-w-[200px] max-w-xs">
                <FontAwesomeIcon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-600" />
                <Input
                  placeholder="Search name, department, location…"
                  value={search}
                  onChange={(e) => { updateFilters(e.target.value, roleFilter, statusFilter, designationFilter, systemAccessFilter); setSearch(e.target.value); }}
                  className="pl-9 h-9 text-sm"
                />
              </div>

              <FilterChip
                label="Role"
                icon="briefcaseMedical"
                value={roleFilter}
                options={ROLES}
                onChange={(v) => { updateFilters(search, v, statusFilter, designationFilter, systemAccessFilter); setRoleFilter(v); }}
              />
              <FilterChip
                label="Status"
                icon="circleCheck"
                value={statusFilter}
                options={STATUS_OPTIONS}
                onChange={(v) => { updateFilters(search, roleFilter, v, designationFilter, systemAccessFilter); setStatusFilter(v); }}
              />
              <FilterChip
                label="Designation"
                icon="clipboard"
                value={designationFilter}
                options={DESIGNATIONS}
                onChange={(v) => { updateFilters(search, roleFilter, statusFilter, v, systemAccessFilter); setDesignationFilter(v); }}
              />
              <FilterChip
                label="System Access"
                icon="userCheck"
                value={systemAccessFilter}
                options={SYSTEM_ACCESS_OPTIONS}
                onChange={(v) => { updateFilters(search, roleFilter, statusFilter, designationFilter, v); setSystemAccessFilter(v); }}
              />

              <span className="text-sm text-neutral-700 ml-auto">{filtered.length} shown</span>
            </div>

            {/* Selection toolbar */}
            <SelectionToolbar
              selectedCount={selectedIds.length}
              entityLabel="Staff"
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
                    <th className="px-4 py-3 text-left text-xs font-medium text-neutral-900 uppercase tracking-wider">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-neutral-900 uppercase tracking-wider">Role &amp; Access</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-neutral-900 uppercase tracking-wider hidden md:table-cell">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-neutral-900 uppercase tracking-wider hidden lg:table-cell">Designation</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-neutral-900 uppercase tracking-wider hidden lg:table-cell">Last Login</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-neutral-900 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-neutral-900 uppercase tracking-wider">Receive Notifications</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-neutral-900 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-4 py-10 text-center text-sm text-neutral-600">
                        No personnel match your filters.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((p) => {
                      const isSelected = selectedIds.includes(p.id);
                      return (
                        <tr key={p.id} className={`hover:bg-neutral-50 transition-colors ${isSelected ? 'bg-blue-50' : ''}`}>
                          <td className="w-11 px-4 py-3">
                            <Checkbox
                              checked={isSelected}
                              disabled={!p.receiveNotifications}
                              onCheckedChange={(v) => handleSelectOne(p.id, !!v)}
                              aria-label={`Select ${p.firstName} ${p.lastName}`}
                            />
                          </td>
                          <td className="px-4 py-3">
                            <div>
                              <p className="text-sm font-medium text-neutral-900">{p.firstName} {p.lastName}</p>
                              <p className="text-xs text-neutral-600">{p.phone}</p>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-sm text-neutral-800">{p.role}</p>
                            {p.hasSystemAccess && p.hasLoggedIn && (
                              <p className="flex items-center gap-1 text-xs text-positive-default mt-0.5">
                                <FontAwesomeIcon name="check" className="w-3 h-3" />
                                System Access
                              </p>
                            )}
                            {p.hasSystemAccess && !p.hasLoggedIn && (
                              <p className="flex items-center gap-1.5 text-xs mt-0.5">
                                <span className="flex items-center gap-1 text-warning-default">
                                  <FontAwesomeIcon name="clock" className="w-3 h-3" />
                                  Yet to Login
                                </span>
                                <button
                                  type="button"
                                  onClick={() => toast.success(`Invite resent to ${p.email}.`)}
                                  className="text-blue-500 hover:text-blue-600 hover:underline"
                                >
                                  Resend Invite
                                </button>
                              </p>
                            )}
                            {!p.hasSystemAccess && (
                              <p className="text-xs text-neutral-600 mt-0.5">No System Access</p>
                            )}
                          </td>
                          <td className="px-4 py-3 hidden md:table-cell">
                            {p.email ? <span className="text-xs text-neutral-700">{p.email}</span> : <span className="text-xs text-negative-default">No email on file</span>}
                          </td>
                          <td className="px-4 py-3 hidden lg:table-cell">
                            <span className="text-sm text-neutral-800">{p.designation || '--'}</span>
                          </td>
                          <td className="px-4 py-3 hidden lg:table-cell">
                            <span className="text-xs text-neutral-700">{p.lastLogin ? formatDate(p.lastLogin) : 'Never'}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${p.isActive ? 'bg-positive-default/10 text-positive-default' : 'bg-neutral-100 text-neutral-800'}`}>
                              {p.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <Switch
                              checked={p.receiveNotifications}
                              onCheckedChange={(v) => toggleNotifications(p, v)}
                              aria-label={`Receive notifications for ${p.firstName} ${p.lastName}`}
                            />
                          </td>
                          <td className="px-4 py-3">
                            <button
                              type="button"
                              onClick={() => toast.info(`Edit ${p.firstName} ${p.lastName} — coming soon.`)}
                              className="text-neutral-600 hover:text-blue-500 transition-colors"
                              aria-label={`Edit ${p.firstName} ${p.lastName}`}
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
          </div>

          <EmailHistoryPanel open={historyOpen} onClose={() => setHistoryOpen(false)} />
        </div>
      </div>

      <BulkEmailFlow
        open={wizardOpen}
        onClose={() => setWizardOpen(false)}
        surface="site.personnel"
        personas={[{ audience: 'Staff-Personnel', label: 'Site personnel', badge: 'Site Personnel', description: 'The staff you ticked', recipients }]}
        audienceType="Staff-Personnel"
        selectionSummary={`${recipients.length} ${recipients.length === 1 ? 'person' : 'people'} selected`}
        sourceSurface="General"
      />
    </>
  );
}
