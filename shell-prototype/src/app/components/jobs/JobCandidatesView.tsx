import { useState } from 'react';
import { Checkbox } from '../ui/checkbox';
import { Input } from '../ui/input';
import { FontAwesomeIcon } from '../font-awesome-icon';
import { BulkEmailFlow } from '../email/BulkEmailFlow';
import { EmailHistoryPanel } from '../email/EmailHistoryPanel';
import { SelectionToolbar, useBulkEmailSelection } from '../email/BulkEmailSurface';
import { mockCandidates, mockJobs, type Candidate } from '../../data/mockData';

const fmt = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

/** The applicants for one job. Tick some, then Bulk Email to write to them (interviews, offers, updates). */
export function JobCandidatesView({ jobId, onBack }: { jobId: string; onBack: () => void }) {
  const job = mockJobs.find((j) => j.id === jobId);
  const [search, setSearch] = useState('');
  const all: Candidate[] = mockCandidates.filter((c) => c.jobId === jobId);
  const q = search.toLowerCase();
  const filtered = all.filter((c) => q === '' || `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || (c.currentTitle ?? '').toLowerCase().includes(q));
  const { selectedIds, wizardOpen, setWizardOpen, historyOpen, setHistoryOpen, selectAllChecked, handleSelectAll, handleSelectOne, narrowSelection } = useBulkEmailSelection(filtered);
  const selected = filtered.filter((c) => selectedIds.includes(c.id));

  return (
    <div className="p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-3">
        <button type="button" onClick={onBack} className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-500 hover:underline">
          <FontAwesomeIcon name="chevronLeft" className="w-3 h-3" aria-hidden="true" /> All jobs
        </button>
        <div>
          <h2 className="text-lg font-semibold text-neutral-900">Candidates{job ? ` — ${job.title}` : ''}</h2>
          <p className="text-sm text-neutral-700">{job ? `${job.hospitalName} · ${job.location} · ` : ''}{all.length} {all.length === 1 ? 'candidate' : 'candidates'}</p>
        </div>

        <div className="bg-card rounded-xl shadow-[0_1px_1.5px_rgba(0,0,0,0.1),0_1px_1px_rgba(0,0,0,0.1)] overflow-hidden">
          <div className="px-4 py-3 border-b border-neutral-200 flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[200px] max-w-xs">
              <FontAwesomeIcon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-600" />
              <Input placeholder="Search name, email, title…" value={search} onChange={(e) => { setSearch(e.target.value); const nq = e.target.value.toLowerCase(); narrowSelection(new Set(all.filter((c) => nq === '' || `${c.firstName} ${c.lastName}`.toLowerCase().includes(nq) || c.email.toLowerCase().includes(nq) || (c.currentTitle ?? '').toLowerCase().includes(nq)).map((c) => c.id))); }} className="pl-9 h-9 text-sm" />
            </div>
            <span className="text-sm text-neutral-700 ml-auto">{filtered.length} shown</span>
          </div>

          <SelectionToolbar selectedCount={selectedIds.length} entityLabel="Candidates" onBulkEmail={() => setWizardOpen(true)} onHistoryOpen={() => setHistoryOpen(true)} />

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[var(--bg-table-header)]">
                <tr className="border-b border-neutral-200">
                  <th className="w-11 px-4 py-3"><Checkbox checked={selectAllChecked} onCheckedChange={(v) => handleSelectAll(!!v)} aria-label="Select all candidates" /></th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-900 uppercase tracking-wider">Candidate</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-900 uppercase tracking-wider hidden md:table-cell">Current role</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-900 uppercase tracking-wider hidden lg:table-cell">Experience</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-900 uppercase tracking-wider">Stage</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-900 uppercase tracking-wider hidden md:table-cell">Applied</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filtered.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-10 text-center text-sm text-neutral-600">No candidates match your search.</td></tr>
                ) : filtered.map((c) => (
                  <tr key={c.id} className={`hover:bg-neutral-50 transition-colors ${selectedIds.includes(c.id) ? 'bg-blue-50' : ''}`}>
                    <td className="w-11 px-4 py-3"><Checkbox checked={selectedIds.includes(c.id)} onCheckedChange={(v) => handleSelectOne(c.id, !!v)} aria-label={`Select ${c.firstName} ${c.lastName}`} /></td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-neutral-900">{c.firstName} {c.lastName}</p>
                      <p className="text-xs text-neutral-600">{c.email}</p>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell"><span className="text-sm text-neutral-800">{c.currentTitle ?? '--'}</span><p className="text-xs text-neutral-600">{c.currentEmployer ?? ''}</p></td>
                    <td className="px-4 py-3 hidden lg:table-cell"><span className="text-sm text-neutral-800">{c.yearsOfExperience} yrs</span></td>
                    <td className="px-4 py-3"><span className="inline-flex items-center rounded bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-500">{c.stage}</span></td>
                    <td className="px-4 py-3 hidden md:table-cell"><span className="text-xs text-neutral-700 whitespace-nowrap">{fmt(c.appliedDate)}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <EmailHistoryPanel open={historyOpen} onClose={() => setHistoryOpen(false)} />
      <BulkEmailFlow
        open={wizardOpen}
        onClose={() => setWizardOpen(false)}
        surface="site.jobCandidates"
        personas={[{ audience: 'Candidate', label: 'Candidates', badge: 'Candidate', description: 'The applicants you ticked', recipients: selected.map((c) => ({ id: c.id, name: `${c.firstName} ${c.lastName}`, email: c.email, meta: c.currentTitle })) }]}
        audienceType="Candidate"
        selectionSummary={`${selected.length} ${selected.length === 1 ? 'candidate' : 'candidates'} selected`}
        sourceSurface="Jobs"
      />
    </div>
  );
}
