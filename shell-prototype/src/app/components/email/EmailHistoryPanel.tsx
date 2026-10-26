import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../ui/sheet';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar } from '../ui/calendar';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Checkbox } from '../ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { FontAwesomeIcon } from '../font-awesome-icon';
import { mockEmailHistory, isWithinLocalDateRange, type EmailHistoryRow, type EmailStatus } from '../../data/mockEmailHistory';
import { mockScheduledSends, type ScheduledSend } from '../../data/mockScheduledSends';
import { ComposeEmailWizard, type RecipientRow, type ComposeEmailWizardScheduleUpdate } from './ComposeEmailWizard';
import { tenantEmailConfig } from '../../data/tenantEmailConfig';
import { cn } from '../ui/utils';
import { getNotificationContext, buildSnippet } from './notifications';
import { mockPersonnel } from '../../data/mockPersonnel';
import { renderMessage } from '../../data/messageMerge';

// ── Local DatePicker (Popover + Calendar, same pattern as BulkCloneRow) ────────
function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function DatePicker({
  value,
  onChange,
  placeholder = 'Pick date',
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const selected = value ? new Date(value + 'T00:00:00') : undefined;
  const label = selected
    ? selected.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : placeholder;
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            'flex items-center gap-2 border border-input rounded-md px-3 py-1.5 text-sm bg-card hover:bg-neutral-50  min-w-[130px]',
            !value && 'text-neutral-600',
          )}
        >
          <FontAwesomeIcon name="calendar" className="w-3.5 h-3.5 text-neutral-600 flex-shrink-0" />
          <span className="truncate">{label}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={(date) => {
            if (date) { onChange(toISODate(date)); setOpen(false); }
          }}
          initialFocus
        />
        {value && (
          <div className="px-3 pb-2">
            <button
              onClick={() => { onChange(''); setOpen(false); }}
              className="text-xs text-blue-500 hover:underline"
            >
              Clear date
            </button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
    ' ' +
    d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

const SOURCE_BADGE: Record<string, string> = {
  'Slot Requests': 'bg-blue-100 text-blue-800',
  Schedules: 'bg-purple-100 text-purple-800',
  Onboarding: 'bg-accent-100 text-warning-default',
  Availability: 'bg-cyan-100 text-cyan-800',
  Jobs: 'bg-informative-surface text-informative-default',
  General: 'bg-[var(--bg-container)] text-neutral-700',
  'School Dashboard': 'bg-blue-100 text-blue-800',
  'School Schedules': 'bg-pink-100 text-pink-500',
  'School Requests': 'bg-negative-default/10 text-negative-default',
};

// ── Read-only email preview (used in Sent row click + Scheduled view) ─────────
function EmailPreviewCard({
  from,
  subject,
  body,
  footer,
}: {
  from: string;
  subject: string;
  body?: string;
  footer?: string;
}) {
  return (
    <div className="border border-neutral-200 rounded-lg overflow-hidden bg-card">
      <div className="bg-neutral-50 border-b border-neutral-200 px-5 py-3 flex items-center gap-2.5">
        <div className="w-8 h-8 bg-blue-500/10 rounded-md flex items-center justify-center flex-shrink-0">
          <FontAwesomeIcon name="building" className="w-4 h-4 text-blue-500" />
        </div>
        <p className="text-sm font-medium text-neutral-900">{from}</p>
      </div>
      <div className="px-5 py-2.5 border-b border-neutral-100">
        <p className="text-[10px] text-neutral-800 uppercase tracking-wider mb-0.5">Subject</p>
        <p className="text-sm font-semibold text-neutral-900">{subject}</p>
      </div>
      <div className="px-5 py-4 min-h-[120px]">
        {body ? (
          <div
            className="text-sm prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: body }}
          />
        ) : (
          <p className="text-sm text-neutral-600 italic">
            Email body preview not available for this send.
          </p>
        )}
      </div>
      {footer && (
        <div className="bg-neutral-50 px-5 py-3 border-t border-neutral-100">
          <p className="text-xs text-neutral-800 leading-relaxed">{footer}</p>
        </div>
      )}
    </div>
  );
}

// ── Notification Preview (recipient-side, in-app surfacing — section 5.5) ─────
function NotificationPreviewCard({ row }: { row: EmailHistoryRow }) {
  const { moduleLabel, inboxLabel } = getNotificationContext(row);
  return (
    <div>
      <p className="text-xs text-neutral-800 uppercase tracking-wide mb-0.5">
        Notification Preview
      </p>
      <p className="text-xs text-neutral-600 mb-2">
        What this looks like in the {moduleLabel}
      </p>
      <div className="border border-neutral-200 rounded-lg overflow-hidden bg-card">
        <div className="bg-neutral-50 border-b border-neutral-200 px-5 py-2.5 flex items-center gap-2.5">
          <div className="w-8 h-8 bg-blue-500/10 rounded-md flex items-center justify-center flex-shrink-0">
            <FontAwesomeIcon name="bell" className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-xs font-medium text-neutral-800 uppercase tracking-wide">
            {inboxLabel}
          </p>
        </div>
        <div className="px-5 py-3 flex items-start gap-3">
          <span className="mt-1.5 w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" aria-label="Unread" />
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between gap-3">
              <p className="text-sm font-semibold text-neutral-900 truncate">{row.from}</p>
              <p className="text-xs text-neutral-800 flex-shrink-0">
                {formatDateTime(row.sentAt)}
              </p>
            </div>
            <p className="text-sm font-medium text-neutral-900 mt-0.5">{row.subject}</p>
            <p className="text-sm text-neutral-800 mt-1 leading-relaxed">
              {buildSnippet(row)}
            </p>
          </div>
        </div>
        <div className="bg-neutral-50 px-5 py-2.5 border-t border-neutral-100">
          <p className="text-xs text-neutral-800">
            {row.status === 'Failed'
              ? 'Email delivery failed — this in-app notification is delivered independently of the email.'
              : 'Delivered as an email and shown here in-app — two independent channels.'}
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Shared detail Sheet header (Back button + subject title) ──────────────────
function DetailSheetHeader({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <div className="flex items-center gap-3 px-5 py-4 border-b border-neutral-200 flex-shrink-0">
      <Button
        variant="ghost"
        size="sm"
        onClick={onBack}
        className=" text-sm text-neutral-700 hover:text-neutral-900 -ml-2"
      >
        <FontAwesomeIcon name="arrowLeft" className="w-4 h-4 mr-1.5" aria-hidden="true" />
        Back
      </Button>
      <div className="h-4 w-px bg-neutral-200" />
      <h3 className="text-sm font-semibold text-neutral-900 truncate">{title}</h3>
    </div>
  );
}

// ── Props ─────────────────────────────────────────────────────────────────────
interface EmailHistoryPanelProps {
  open: boolean;
  onClose: () => void;
}

// ── Main component ─────────────────────────────────────────────────────────────
export function EmailHistoryPanel({ open, onClose }: EmailHistoryPanelProps) {
  // Data — mutable local copies of mock data
  const [sentHistory, setSentHistory] = useState<EmailHistoryRow[]>(() => [...mockEmailHistory]);
  const [scheduledSends, setScheduledSends] = useState<ScheduledSend[]>(() => [...mockScheduledSends]);

  // Live sends are recorded in the shared store — re-sync whenever the panel opens.
  useEffect(() => {
    if (open) setSentHistory([...mockEmailHistory]);
  }, [open]);

  // ── Sent tab filters ──────────────────────────────────────────────────────
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Sent' | 'Failed'>('All');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sourceFilter, setSourceFilter] = useState<string[]>([]);

  // ── Sent tab overlays ─────────────────────────────────────────────────────
  const [previewRow, setPreviewRow] = useState<EmailHistoryRow | null>(null);
  const [resendRow, setResendRow] = useState<EmailHistoryRow | null>(null);
  const [resending, setResending] = useState(false);

  // ── Scheduled tab overlays ────────────────────────────────────────────────
  const [viewScheduled, setViewScheduled] = useState<ScheduledSend | null>(null);
  const [editScheduled, setEditScheduled] = useState<ScheduledSend | null>(null);
  const [cancelScheduled, setCancelScheduled] = useState<ScheduledSend | null>(null);

  // ── Derived: filtered sent rows ───────────────────────────────────────────
  const filteredSent = sentHistory.filter((r) => {
    const q = search.toLowerCase();
    const matchSearch =
      !search ||
      r.recipientName.toLowerCase().includes(q) ||
      r.recipientEmail.toLowerCase().includes(q) ||
      r.subject.toLowerCase().includes(q);
    const matchStatus = statusFilter === 'All' || r.status === statusFilter;
    // From/To are local calendar days and rows render in local time — compare on that basis.
    const matchDate = isWithinLocalDateRange(r.sentAt, dateFrom, dateTo);
    // OR within the source filter (any selected badge matches); AND across filter types.
    const matchSource = sourceFilter.length === 0 || sourceFilter.includes(r.sourceSurface);
    return matchSearch && matchStatus && matchDate && matchSource;
  });

  const failedCount = sentHistory.filter((r) => r.status === 'Failed').length;
  const scheduledCount = scheduledSends.length;

  // ── Sent tab handlers ─────────────────────────────────────────────────────
  function handleExportCSV() {
    const headers = ['Recipient Name', 'Recipient Email', 'Subject', 'Status', 'From', 'Sent By', 'Sent At', 'Source'];
    const rows = filteredSent.map((r) => [
      r.recipientName, r.recipientEmail, r.subject, r.status, r.from, r.sentBy, r.sentAt, r.sourceSurface,
    ]);
    const csv = [headers, ...rows]
      .map((row) => row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    try {
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `email-history-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // fallback if createObjectURL unavailable
    }
    toast.success(`Exported ${filteredSent.length} rows to CSV.`);
  }

  function handleResendConfirm() {
    if (!resendRow) return;
    // Resend is another way to email a Site Personnel record, so the same
    // Receive Notifications gate applies (PRD 5.6) — even if it was on at send time.
    const optedOut = mockPersonnel.find(
      (p) => p.email?.toLowerCase() === resendRow.recipientEmail.toLowerCase() && !p.receiveNotifications,
    );
    if (optedOut) {
      toast.warning(`${resendRow.recipientEmail} was not re-sent — Receive Notifications is off for this Site Personnel record.`);
      setResendRow(null);
      return;
    }
    setResending(true);
    setTimeout(() => {
      setSentHistory((prev) =>
        prev.map((r) =>
          r.id === resendRow.id
            ? { ...r, status: 'Sent' as EmailStatus, sentAt: new Date().toISOString() }
            : r,
        ),
      );
      toast.success(`Re-sent to ${resendRow.recipientEmail} successfully.`);
      setResendRow(null);
      setResending(false);
    }, 500);
  }

  // ── Scheduled tab handlers ────────────────────────────────────────────────
  function handleScheduleUpdate(id: string, data: ComposeEmailWizardScheduleUpdate) {
    const newSendAt = `${data.scheduleDate}T${data.scheduleTime}:00Z`;
    setScheduledSends((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              subject: data.subject,
              body: data.body,
              sendAt: newSendAt,
              recipientCount: data.recipients.length,
              sampleRecipients: data.recipients.slice(0, 3).map((r) => ({
                id: r.id,
                name: r.name,
                email: r.email,
                meta: r.meta,
              })),
            }
          : s,
      ),
    );
    setEditScheduled(null);
  }

  function handleCancelConfirm() {
    if (!cancelScheduled) return;
    const preview = cancelScheduled.subject.length > 50
      ? cancelScheduled.subject.slice(0, 50) + '…'
      : cancelScheduled.subject;
    setScheduledSends((prev) => prev.filter((s) => s.id !== cancelScheduled.id));
    toast.success(`Canceled: "${preview}"`);
    setCancelScheduled(null);
  }

  function getEditRecipients(ss: ScheduledSend): RecipientRow[] {
    if (ss.sampleRecipients && ss.sampleRecipients.length > 0) {
      // Eligibility is evaluated when the send is edited, not frozen at scheduling time: a
      // Site Personnel record switched to Receive Notifications off since then is flagged (PRD 5.6).
      return ss.sampleRecipients.map((r) => {
        const optedOut = mockPersonnel.some((p) => !!p.email && p.email.toLowerCase() === (r.email ?? '').toLowerCase() && !p.receiveNotifications);
        return { id: r.id, name: r.name, email: r.email, meta: r.meta, ...(optedOut ? { excludedReason: 'notifications-off' as const } : {}) };
      });
    }
    return [{ id: ss.id, name: ss.recipientName, email: null, meta: `${ss.recipientCount} recipients` }];
  }

  function getScheduleDateParts(sendAt: string) {
    const d = new Date(sendAt);
    const scheduleDate = toISODate(d);
    const scheduleTime = `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`;
    return { scheduleDate, scheduleTime };
  }

  function handlePanelClose() {
    setPreviewRow(null);
    setViewScheduled(null);
    setResendRow(null);
    setCancelScheduled(null);
    setEditScheduled(null);
    onClose();
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Main history Sheet ─────────────────────────────────────────────── */}
      <Sheet open={open} onOpenChange={(v) => { if (!v) handlePanelClose(); }}>
        <SheetContent
          side="right"
          className="w-[760px] sm:max-w-[760px] p-0 flex flex-col h-full"
        >
          <SheetHeader className="flex-row items-center justify-between px-5 py-4 border-b border-neutral-200 flex-shrink-0">
            <SheetTitle className="text-base font-semibold text-neutral-900">
              Email History
            </SheetTitle>
            {failedCount > 0 && (
              <Badge className="bg-negative-default/10 text-negative-default text-xs mr-6">
                {failedCount} failed
              </Badge>
            )}
          </SheetHeader>

          <div className="flex-1 overflow-hidden flex flex-col min-h-0">
            <Tabs defaultValue="sent" className="flex flex-col flex-1 min-h-0 gap-0">
              <div className="px-5 pt-3 border-b border-neutral-200 flex-shrink-0">
                <TabsList className="h-8 bg-transparent p-0 gap-4 rounded-none">
                  <TabsTrigger
                    value="sent"
                    className="h-8 px-0 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:text-blue-500 data-[state=active]:bg-transparent bg-transparent text-neutral-600 text-sm font-medium"
                  >
                    Sent ({sentHistory.length})
                  </TabsTrigger>
                  <TabsTrigger
                    value="scheduled"
                    className="h-8 px-0 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:text-blue-500 data-[state=active]:bg-transparent bg-transparent text-neutral-600 text-sm font-medium"
                  >
                    Scheduled ({scheduledCount})
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* ── Sent tab ──────────────────────────────────────────────── */}
              <TabsContent value="sent" className="mt-0 flex flex-col flex-1 min-h-0">
                {/* Filters */}
                <div className="px-4 py-3 border-b border-neutral-100 flex flex-wrap items-center gap-2 flex-shrink-0">
                  <div className="relative flex-1 min-w-[200px]">
                    <FontAwesomeIcon
                      name="magnifyingGlass"
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-600"
                    />
                    <Input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search name, email, subject…"
                      className="pl-9 h-9 text-sm"
                    />
                  </div>

                  <Select
                    value={statusFilter}
                    onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}
                  >
                    <SelectTrigger className="w-32 h-8 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Status</SelectItem>
                      <SelectItem value="Sent">Sent</SelectItem>
                      <SelectItem value="Failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>

                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className="flex items-center gap-2 border border-input rounded-md px-3 py-1.5 text-sm bg-card hover:bg-neutral-50"
                      >
                        <FontAwesomeIcon name="tag" className="w-3.5 h-3.5 text-neutral-600" />
                        {sourceFilter.length === 0 ? 'All Sources' : `Source (${sourceFilter.length})`}
                      </button>
                    </PopoverTrigger>
                    <PopoverContent align="start" className="w-56 p-1">
                      {Object.keys(SOURCE_BADGE).map((src) => (
                        <label
                          key={src}
                          className="flex items-center gap-2 px-2 py-1.5 rounded-sm hover:bg-[var(--bg-container)] cursor-pointer"
                        >
                          <Checkbox
                            checked={sourceFilter.includes(src)}
                            onCheckedChange={(v) =>
                              setSourceFilter((prev) => (v ? [...prev, src] : prev.filter((x) => x !== src)))
                            }
                          />
                          <span className={cn('inline-flex px-2 py-0.5 rounded text-xs font-medium', SOURCE_BADGE[src])}>
                            {src}
                          </span>
                        </label>
                      ))}
                    </PopoverContent>
                  </Popover>

                  <DatePicker value={dateFrom} onChange={setDateFrom} placeholder="From date" />
                  <DatePicker value={dateTo} onChange={setDateTo} placeholder="To date" />

                  {(search || statusFilter !== 'All' || dateFrom || dateTo || sourceFilter.length > 0) && (
                    <button
                      onClick={() => { setSearch(''); setStatusFilter('All'); setDateFrom(''); setDateTo(''); setSourceFilter([]); }}
                      className="text-xs text-blue-500 hover:underline"
                    >
                      Clear
                    </button>
                  )}

                  <div className="ml-auto flex items-center gap-3">
                    <span className="text-xs text-neutral-800">
                      {filteredSent.length} of {sentHistory.length}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleExportCSV}
                      className="h-7 text-xs gap-1.5"
                    >
                      <FontAwesomeIcon name="tableCells" className="w-3 h-3" />
                      Export CSV
                    </Button>
                  </div>
                </div>

                {/* Sent table */}
                <div className="overflow-x-auto overflow-y-auto flex-1 min-h-0">
                  <table className="w-full text-sm min-w-[900px]">
                    <thead className="sticky top-0 bg-[var(--bg-table-header)] z-10">
                      <tr className="border-b border-neutral-200">
                        {['Recipient Name', 'Email', 'Subject', 'Status', 'From', 'Sent By', 'Sent At', ''].map((h) => (
                          <th
                            key={h}
                            className="text-left px-4 py-2.5 font-semibold text-neutral-700 text-xs uppercase tracking-wider border-r border-neutral-200 last:border-r-0 whitespace-nowrap"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSent.map((row) => (
                        <tr
                          key={row.id}
                          className="border-b border-neutral-100 last:border-0 odd:bg-[var(--bg-alternate-row)] hover:bg-[var(--bg-hover)] cursor-pointer transition-colors"
                          onClick={() => setPreviewRow(row)}
                        >
                          <td className="px-4 py-2.5 font-medium text-neutral-900 border-r border-neutral-100 whitespace-nowrap">
                            {row.recipientName}
                          </td>
                          <td className="px-4 py-2.5 text-neutral-700 border-r border-neutral-100 whitespace-nowrap">
                            {row.recipientEmail}
                          </td>
                          <td className="px-4 py-2.5 text-neutral-800 border-r border-neutral-100 max-w-[280px]">
                            <span className="line-clamp-1 block">{row.subject}</span>
                          </td>
                          <td className="px-4 py-2.5 border-r border-neutral-100 whitespace-nowrap">
                            <Badge
                              variant="secondary"
                              className={
                                row.status === 'Sent'
                                  ? 'bg-positive-default/10 text-positive-default hover:bg-positive-default/10  rounded-sm px-2 py-1 text-sm'
                                  : 'bg-negative-default/10 text-negative-default hover:bg-negative-default/10  rounded-sm px-2 py-1 text-sm'
                              }
                            >
                              {row.status}
                            </Badge>
                          </td>
                          <td className="px-4 py-2.5 text-neutral-600 border-r border-neutral-100 whitespace-nowrap max-w-[180px]">
                            <span className="truncate block">{row.from}</span>
                          </td>
                          <td className="px-4 py-2.5 text-neutral-600 border-r border-neutral-100 whitespace-nowrap">
                            {row.sentBy}
                          </td>
                          <td className="px-4 py-2.5 text-neutral-600 border-r border-neutral-100 whitespace-nowrap">
                            {formatDateTime(row.sentAt)}
                          </td>
                          <td
                            className="px-3 py-2.5 whitespace-nowrap"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {row.status === 'Failed' && (
                              <button
                                onClick={() => setResendRow(row)}
                                className="inline-flex items-center gap-1 text-xs text-blue-500 hover:text-blue-600 font-medium whitespace-nowrap"
                                title="Resend to this recipient only"
                              >
                                <FontAwesomeIcon name="arrowRotateLeft" className="w-3 h-3" />
                                Resend
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                      {filteredSent.length === 0 && (
                        <tr>
                          <td colSpan={8} className="px-4 py-8 text-center text-neutral-600 text-sm">
                            No email history matches the current filters.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </TabsContent>

              {/* ── Scheduled tab ────────────────────────────────────────── */}
              <TabsContent value="scheduled" className="mt-0 flex-1 overflow-hidden min-h-0">
                <div className="overflow-x-auto h-full overflow-y-auto">
                  <table className="w-full text-sm min-w-[800px]">
                    <thead className="sticky top-0 bg-[var(--bg-table-header)] z-10">
                      <tr className="border-b border-neutral-200">
                        {['Recipients', 'Subject', 'Scheduled For', 'Source', 'Sent By', 'Actions'].map((h) => (
                          <th
                            key={h}
                            className="text-left px-4 py-2.5 font-semibold text-neutral-700 text-xs uppercase tracking-wider border-r border-neutral-200 last:border-r-0"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {scheduledSends.map((ss) => (
                        <tr
                          key={ss.id}
                          className="border-b border-neutral-100 last:border-0 odd:bg-[var(--bg-alternate-row)] hover:bg-[var(--bg-hover)] transition-colors"
                        >
                          <td className="px-4 py-3 border-r border-neutral-100">
                            <div className="font-medium text-neutral-900 leading-tight">{ss.recipientName}</div>
                            <div className="text-xs text-neutral-800 mt-0.5">{ss.recipientCount} recipients</div>
                          </td>
                          <td className="px-4 py-3 text-neutral-800 border-r border-neutral-100 max-w-[280px]">
                            <span className="line-clamp-2 block">{ss.subject}</span>
                            {ss.templateName && (
                              <span className="text-xs text-neutral-800 mt-0.5 block">{ss.templateName}</span>
                            )}
                          </td>
                          <td className="px-4 py-3 border-r border-neutral-100 whitespace-nowrap">
                            <div className="flex items-center gap-1.5 text-neutral-800">
                              <FontAwesomeIcon name="clock" className="w-3.5 h-3.5 text-neutral-600" />
                              {formatDateTime(ss.sendAt)}
                            </div>
                          </td>
                          <td className="px-4 py-3 border-r border-neutral-100">
                            <Badge
                              variant="secondary"
                              className={cn('text-xs ', SOURCE_BADGE[ss.sourceSurface] ?? 'bg-[var(--bg-container)] text-neutral-700')}
                            >
                              {ss.sourceSurface}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 border-r border-neutral-100 text-neutral-600 whitespace-nowrap">
                            {ss.sentBy}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => setViewScheduled(ss)}
                                className="text-xs text-neutral-600 hover:text-neutral-800 flex items-center gap-1"
                              >
                                <FontAwesomeIcon name="eye" className="w-3.5 h-3.5" />
                                View
                              </button>
                              <button
                                onClick={() => setEditScheduled(ss)}
                                className="text-xs text-blue-500 hover:text-blue-600 flex items-center gap-1"
                              >
                                <FontAwesomeIcon name="penToSquare" className="w-3.5 h-3.5" />
                                Edit
                              </button>
                              <button
                                onClick={() => setCancelScheduled(ss)}
                                className="text-xs text-negative-default hover:text-negative-default flex items-center gap-1"
                              >
                                <FontAwesomeIcon name="trash" className="w-3.5 h-3.5" />
                                Cancel
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {scheduledSends.length === 0 && (
                        <tr>
                          <td colSpan={6} className="px-4 py-10 text-center text-neutral-600 text-sm">
                            No scheduled sends. Compose a message and choose "Schedule for later" on the Preview step.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </SheetContent>
      </Sheet>

      {/* ── Sent row read-only preview — nested Sheet ─────────────────────── */}
      <Sheet open={!!previewRow} onOpenChange={(v) => { if (!v) setPreviewRow(null); }}>
        <SheetContent
          side="right"
          className="w-[640px] sm:max-w-[640px] p-0 flex flex-col h-full"
        >
          {previewRow && (
            <>
              <DetailSheetHeader title={previewRow.subject} onBack={() => setPreviewRow(null)} />

              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
                {/* Meta grid */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-neutral-800 text-xs uppercase tracking-wide">From</span>
                    <p className="text-neutral-900 mt-0.5">{previewRow.from}</p>
                  </div>
                  <div>
                    <span className="text-neutral-800 text-xs uppercase tracking-wide">Sent By</span>
                    <p className="text-neutral-900 mt-0.5">{previewRow.sentBy}</p>
                  </div>
                  <div>
                    <span className="text-neutral-800 text-xs uppercase tracking-wide">Sent At</span>
                    <p className="text-neutral-900 mt-0.5">{formatDateTime(previewRow.sentAt)}</p>
                  </div>
                  <div>
                    <span className="text-neutral-800 text-xs uppercase tracking-wide">Source</span>
                    <p className="mt-0.5">
                      <span className={cn('inline-flex items-center px-2 py-0.5 rounded text-xs font-medium', SOURCE_BADGE[previewRow.sourceSurface] ?? 'bg-[var(--bg-container)] text-neutral-700')}>
                        {previewRow.sourceSurface}
                      </span>
                    </p>
                  </div>
                  <div>
                    <span className="text-neutral-800 text-xs uppercase tracking-wide">Status</span>
                    <p className="mt-0.5">
                      <Badge
                        variant="secondary"
                        className={previewRow.status === 'Sent'
                          ? 'bg-positive-default/10 text-positive-default rounded-sm px-2 py-1 text-sm '
                          : 'bg-negative-default/10 text-negative-default rounded-sm px-2 py-1 text-sm '}
                      >
                        {previewRow.status}
                      </Badge>
                    </p>
                  </div>
                  <div>
                    <span className="text-neutral-800 text-xs uppercase tracking-wide">Recipient</span>
                    <p className="text-neutral-900 mt-0.5">
                      {previewRow.recipientName}
                      <br />
                      <span className="text-neutral-600 text-xs">{previewRow.recipientEmail}</span>
                    </p>
                  </div>
                </div>

                <hr className="border-neutral-100" />

                <div>
                  <p className="text-xs text-neutral-800 uppercase tracking-wide">Subject</p>
                  <p className="text-sm font-medium text-neutral-900 mt-1">{previewRow.subject}</p>
                </div>

                <div>
                  <p className="text-xs text-neutral-800 uppercase tracking-wide mb-2">Message</p>
                  <EmailPreviewCard
                    from={previewRow.from}
                    subject={previewRow.subject}
                    body={previewRow.body}
                    footer={tenantEmailConfig[previewRow.portal].footer}
                  />
                </div>

                <NotificationPreviewCard row={previewRow} />

                <div>
                  <p className="text-xs text-neutral-800 uppercase tracking-wide mb-2">Attachments</p>
                  {previewRow.attachments && previewRow.attachments.length > 0 ? (
                    <div className="flex flex-col gap-1.5">
                      {previewRow.attachments.map((a) => (
                        <div
                          key={a.name}
                          className="flex items-center gap-2 px-3 py-2 rounded-md bg-neutral-50 border border-neutral-200 text-sm"
                        >
                          <FontAwesomeIcon name="tableCells" className="w-4 h-4 text-neutral-600 flex-shrink-0" aria-hidden="true" />
                          <span className="flex-1 text-neutral-800 truncate">{a.name}</span>
                          <span className="text-xs text-neutral-800 flex-shrink-0">{a.size}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-neutral-600 italic">None</p>
                  )}
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* ── Scheduled send view — nested Sheet ───────────────────────────── */}
      <Sheet open={!!viewScheduled} onOpenChange={(v) => { if (!v) setViewScheduled(null); }}>
        <SheetContent
          side="right"
          className="w-[640px] sm:max-w-[640px] p-0 flex flex-col h-full"
        >
          {viewScheduled && (
            <>
              <DetailSheetHeader title={viewScheduled.subject} onBack={() => setViewScheduled(null)} />

              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
                {/* Meta grid */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-neutral-800 text-xs uppercase tracking-wide">From</span>
                    <p className="text-neutral-900 mt-0.5">{viewScheduled.from}</p>
                  </div>
                  <div>
                    <span className="text-neutral-800 text-xs uppercase tracking-wide">Scheduled By</span>
                    <p className="text-neutral-900 mt-0.5">{viewScheduled.sentBy}</p>
                  </div>
                  <div>
                    <span className="text-neutral-800 text-xs uppercase tracking-wide">Sends At</span>
                    <p className="text-neutral-900 mt-0.5">{formatDateTime(viewScheduled.sendAt)}</p>
                  </div>
                  <div>
                    <span className="text-neutral-800 text-xs uppercase tracking-wide">Source</span>
                    <p className="mt-0.5">
                      <span className={cn('inline-flex items-center px-2 py-0.5 rounded text-xs font-medium', SOURCE_BADGE[viewScheduled.sourceSurface] ?? 'bg-[var(--bg-container)] text-neutral-700')}>
                        {viewScheduled.sourceSurface}
                      </span>
                    </p>
                  </div>
                  <div>
                    <span className="text-neutral-800 text-xs uppercase tracking-wide">Audience</span>
                    <p className="text-neutral-900 mt-0.5">{viewScheduled.audienceType}</p>
                  </div>
                  <div>
                    <span className="text-neutral-800 text-xs uppercase tracking-wide">Recipients</span>
                    <p className="text-neutral-900 mt-0.5">{viewScheduled.recipientCount} · {viewScheduled.recipientName}</p>
                  </div>
                  {viewScheduled.templateName && (
                    <div className="col-span-2">
                      <span className="text-neutral-800 text-xs uppercase tracking-wide">Template</span>
                      <p className="text-neutral-900 mt-0.5">{viewScheduled.templateName}</p>
                    </div>
                  )}
                </div>

                <hr className="border-neutral-100" />

                <div>
                  <p className="text-xs text-neutral-800 uppercase tracking-wide">Subject</p>
                  <p className="text-sm font-medium text-neutral-900 mt-1">{viewScheduled.subject}</p>
                </div>

                <div>
                  <p className="text-xs text-neutral-800 uppercase tracking-wide mb-2">Message</p>
                  {(() => {
                    // A scheduled send is one message for many recipients; show it rendered
                    // for the first of them (each recipient gets their own values at send time).
                    const sample = viewScheduled.sampleRecipients?.[0];
                    const shown = sample
                      ? renderMessage(viewScheduled.subject, viewScheduled.body ?? '', viewScheduled.audienceType, { id: sample.id, name: sample.name, email: sample.email })
                      : { subject: viewScheduled.subject, body: viewScheduled.body };
                    return (
                      <>
                        {sample && (
                          <p className="text-xs text-neutral-800 mb-2">
                            Shown for {sample.name} — each recipient receives their own values.
                          </p>
                        )}
                        <EmailPreviewCard
                          from={viewScheduled.from}
                          subject={shown.subject}
                          body={shown.body}
                          footer={tenantEmailConfig[viewScheduled.portal].footer}
                        />
                      </>
                    );
                  })()}
                </div>

                {viewScheduled.sampleRecipients && viewScheduled.sampleRecipients.length > 0 && (
                  <div>
                    <p className="text-xs text-neutral-800 uppercase tracking-wide mb-2">
                      Sample Recipients ({viewScheduled.recipientCount} total)
                    </p>
                    <div className="space-y-1">
                      {viewScheduled.sampleRecipients.map((r) => (
                        <div key={r.id} className="flex items-center gap-2 text-sm">
                          <span className="font-medium text-neutral-900">{r.name}</span>
                          {r.email && <span className="text-neutral-800 text-xs">{r.email}</span>}
                          {r.meta && <span className="text-neutral-800 text-xs">· {r.meta}</span>}
                        </div>
                      ))}
                      {viewScheduled.recipientCount > viewScheduled.sampleRecipients.length && (
                        <p className="text-xs text-neutral-800 italic">
                          +{viewScheduled.recipientCount - viewScheduled.sampleRecipients.length} more recipients
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Sticky footer — Edit + Cancel actions */}
              <div className="flex-shrink-0 px-5 py-4 border-t border-neutral-200 flex items-center justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { const s = viewScheduled; setViewScheduled(null); setCancelScheduled(s); }}
                  className=" text-xs text-negative-default hover:text-negative-default border-negative-default/30 hover:border-negative-default/40 gap-1.5"
                >
                  <FontAwesomeIcon name="trash" className="w-3.5 h-3.5" />
                  Cancel this send
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { setEditScheduled(viewScheduled); }}
                  className=" text-xs gap-1.5"
                >
                  <FontAwesomeIcon name="penToSquare" className="w-3.5 h-3.5" />
                  Edit this send
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* ── Resend to failed recipient only — confirmation ────────────────── */}
      <AlertDialog open={!!resendRow} onOpenChange={(v) => { if (!v && !resending) setResendRow(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Resend to failed recipient only</AlertDialogTitle>
            <AlertDialogDescription>
              This will resend <strong>"{resendRow?.subject}"</strong> to{' '}
              <strong>{resendRow?.recipientEmail}</strong> only.
              <br /><br />
              Recipients who already received this email will <strong>not</strong> be contacted again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={resending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleResendConfirm}
              disabled={resending}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              {resending ? (
                <>
                  <FontAwesomeIcon name="spinner" spin className="w-4 h-4 mr-1.5" />
                  Sending…
                </>
              ) : (
                'Confirm — Resend to 1 recipient'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Cancel scheduled send — confirmation ─────────────────────────── */}
      <AlertDialog open={!!cancelScheduled} onOpenChange={(v) => { if (!v) setCancelScheduled(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel scheduled send</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently cancel the scheduled send of{' '}
              <strong>"{cancelScheduled?.subject?.slice(0, 60)}{cancelScheduled && cancelScheduled.subject.length > 60 ? '…' : ''}"</strong>{' '}
              to <strong>{cancelScheduled?.recipientCount} recipients</strong>.
              <br /><br />
              The canceled send will not appear in Email History.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep scheduled</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelConfirm}
              className="bg-negative-default hover:bg-negative-default/90 text-white"
            >
              Cancel this send
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Edit scheduled send — ComposeEmailWizard in edit-scheduled mode ─ */}
      {editScheduled && (() => {
        const { scheduleDate, scheduleTime } = getScheduleDateParts(editScheduled.sendAt);
        return (
          <ComposeEmailWizard
            open={!!editScheduled}
            onClose={() => setEditScheduled(null)}
            selectedRecipients={getEditRecipients(editScheduled)}
            audienceType={editScheduled.audienceType}
            mode="edit-scheduled"
            initialData={{
              subject: editScheduled.subject,
              body: editScheduled.body,
              scheduleDate,
              scheduleTime,
              sendMode: 'scheduled',
            }}
            onScheduleUpdate={(data) => handleScheduleUpdate(editScheduled.id, data)}
          />
        );
      })()}
    </>
  );
}
