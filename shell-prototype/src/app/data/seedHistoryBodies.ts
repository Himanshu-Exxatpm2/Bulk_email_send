import type { EmailHistoryRow } from './mockEmailHistory';
import { mockEmailTemplates } from './mockEmailTemplates';
import { mockAvailabilities } from './mockAvailabilities';
import { mockLocations } from './mockLocations';
import { formatLongDate, shiftISODate } from './messageMerge';

// Pre-seeded History rows were written with a subject but no body, so their detail view
// showed the "preview not available" placeholder. This builds the missing body for the
// hand-written rows the way it would have been built when they were sent: from the
// template whose subject they carry, rendered later (mockEmailHistory.ts) against the
// row's real recipient. Only what no record can supply is provided here — the rotation
// named in the subject, and text the sender would have written.

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Turns a template subject into a matcher: each {{token}} captures what the row's subject
// put there ("Your slot request for {{availabilityName}} has been approved" → the rotation).
function matchTemplate(subject: string) {
  for (const t of mockEmailTemplates) {
    const names: string[] = [];
    const re = new RegExp('^' + escapeRe(t.subject).replace(/\\\{\\\{([^}]+?)\\\}\\\}/g, (_m, n: string) => { names.push(n); return '(.+?)'; }) + '$');
    const m = subject.match(re);
    if (m) return { tpl: t, captured: Object.fromEntries(names.map((n, i) => [n, m[i + 1]])) as Record<string, string> };
  }
  // One seeded subject drops the trailing word its template ends with.
  const m = subject.match(/^Action required: additional information for (.+)$/);
  const tpl = m && mockEmailTemplates.find((t) => t.name === 'Additional Info Needed');
  return tpl ? { tpl, captured: { availabilityName: m![1] } } : null;
}

// Text the sender wrote at the time, for the templates that leave it to the sender.
const AUTHORED: Record<string, Record<string, string>> = {
  'System Announcement': {
    announcementBody: 'We are updating the Fall 2026 clinical placement timeline. Onboarding requirements for all incoming students are now due two weeks before each rotation starts, and revised site orientation dates are posted in Exxat One. Please share this update with your students and placement staff.',
  },
  'Staff Notification': {
    messageBody: 'The onboarding deadline for Fall 2026 rotations has moved to two weeks before each rotation start date. Please make sure students assigned to your unit have completed every checklist item by then, and flag anyone at risk to the Clinical Education team.',
  },
  'Schedule Updated': {
    changeDescription: 'Your rotation start date has moved by one week to accommodate a scheduling change at the site. Your location and preceptor are unchanged.',
  },
};

export function seedBodyFor(row: EmailHistoryRow): { body: string; extra: Record<string, string> } | null {
  const found = matchTemplate(row.subject);
  if (!found) return null;
  const { tpl, captured } = found;
  const sent = row.sentAt.slice(0, 10);
  const extra: Record<string, string> = { ...captured, ...(AUTHORED[tpl.name] ?? {}) };

  // The rotation named in the subject: its location and slot count come from the matching
  // availability. Dates are set relative to the send date so the email never describes a
  // rotation that had already ended when it went out.
  const rotation = captured.availabilityName ?? captured.rotationName;
  if (rotation) {
    const av = mockAvailabilities.find((a) => norm(a.name) === norm(rotation));
    const start = shiftISODate(sent, 42);
    Object.assign(extra, {
      startDate: formatLongDate(start),
      endDate: formatLongDate(shiftISODate(start, 83)),
      onboardingDeadline: formatLongDate(shiftISODate(sent, 14)),
    });
    if (av) {
      Object.assign(extra, {
        locationName: av.location,
        reportingLocation: av.location,
        approvedSlotCount: String(av.slotCount),
        hospitalName: mockLocations.find((l) => l.name === av.location)?.hospitalName ?? 'MedStar Health',
      });
    }
  }
  // "14 days left" means the deadline is 14 days after the send.
  if (captured.daysUntilDeadline) extra.onboardingDeadline = formatLongDate(shiftISODate(sent, Number(captured.daysUntilDeadline)));
  // Schedule Updated: the new dates are a week after the ones the rotation would have had.
  if (tpl.name === 'Schedule Updated') {
    extra.newStartDate = formatLongDate(shiftISODate(sent, 49));
    extra.newEndDate = formatLongDate(shiftISODate(sent, 132));
  }
  return { body: tpl.body, extra };
}
