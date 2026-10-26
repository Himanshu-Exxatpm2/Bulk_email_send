import { mockEmailHistory, type EmailHistoryRow } from '../../data/mockEmailHistory';
import { FontAwesomeIcon } from '../font-awesome-icon';

// The recipient's module is read straight off row.audienceType — seed rows are
// backfilled with it in mockEmailHistory.ts, so nothing is re-derived here.
export function getNotificationContext(row: EmailHistoryRow): { moduleLabel: string; inboxLabel: string } {
  switch (row.audienceType) {
    case 'Preceptor':
      return { moduleLabel: "Preceptor's Delegator Link inbox", inboxLabel: 'Delegator Link' };
    case 'Placement Faculty/CI':
      return { moduleLabel: "Placement Faculty/CI's module", inboxLabel: 'Notifications' };
    case 'Staff-Personnel':
      return { moduleLabel: "Site Personnel's module", inboxLabel: 'Notifications' };
    case 'Student':
      return { moduleLabel: "Student's module", inboxLabel: 'Schedules & Onboarding' };
    case 'Candidate':
      return { moduleLabel: "Candidate's Jobs portal", inboxLabel: 'Jobs' };
    case 'School Contact':
    case 'Partner Contact':
    default:
      return { moduleLabel: "School's module", inboxLabel: row.sourceSurface === 'Slot Requests' ? 'Requests' : 'Notifications' };
  }
}

// The snippet is plain text taken from stored HTML: block-level tags become a space so
// paragraphs don't run together, inline tags disappear so "<strong>X</strong>'s" stays
// "X's", and entities (including the &amp; that merge-field escaping produces) are decoded.
const ENTITIES: Record<string, string> = { '&nbsp;': ' ', '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'", '&apos;': "'" };

export function buildSnippet(row: EmailHistoryRow): string {
  if (!row.body) return 'Open this message in your module to read the full details.';
  const text = row.body
    .replace(/<\/?(p|br|li|ul|ol|div|h[1-6]|tr|td|th|table)\b[^>]*>/gi, ' ')
    .replace(/<[^>]*>/g, '')
    .replace(/&(nbsp|amp|lt|gt|quot|apos|#39);/g, (m) => ENTITIES[m] ?? m)
    .replace(/\s+/g, ' ')
    .trim();
  return text.length > 140 ? `${text.slice(0, 140).trimEnd()}…` : text;
}


// ── Per-module notification card (section 5.5) ────────────────────────────────
// Real per-module surfacing: each module lists what was sent to its recipients.
// Deliberately not a cross-module inbox — the header bell stays decorative.
export function ModuleNotificationsCard({ moduleLabels, title }: { moduleLabels: string[]; title: string }) {
  const rows = mockEmailHistory
    .filter((r) => moduleLabels.includes(getNotificationContext(r).moduleLabel))
    .slice(0, 5);
  return (
    <div className="bg-card rounded-xl shadow-[0_1px_1.5px_rgba(0,0,0,0.1),0_1px_1px_rgba(0,0,0,0.1)] overflow-hidden">
      <div className="px-4 py-3 border-b border-neutral-200 flex items-center gap-2">
        <FontAwesomeIcon name="bell" className="w-4 h-4 text-blue-500" />
        <h2 className="text-base font-semibold text-neutral-900">{title}</h2>
      </div>
      {rows.length === 0 ? (
        <p className="px-4 py-6 text-sm text-neutral-600">No notifications yet.</p>
      ) : (
        <ul className="divide-y divide-neutral-100">
          {rows.map((r) => (
            <li key={r.id} className="px-4 py-3 flex items-start gap-3">
              <span className="mt-1.5 w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="text-sm font-semibold text-neutral-900 truncate">{r.from}</p>
                  <p className="text-xs text-neutral-800 flex-shrink-0">
                    {new Date(r.sentAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                </div>
                <p className="text-sm text-neutral-900 truncate">{r.subject}</p>
                <p className="text-xs text-neutral-800 truncate">{buildSnippet(r)}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
