import { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
} from '../ui/drawer';
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
import { Checkbox } from '../ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { EmailRichTextEditor, EmailRichTextEditorHandle, styleTables } from './EmailRichTextEditor';
import { mockEmailTemplates, resolveSourceSurface, AudienceType, EmailTemplate } from '../../data/mockEmailTemplates';
import { mockEmailAttachmentTemplates } from '../../data/mockEmailAttachmentTemplates';
import { missingMergeFields } from '../../data/mergeFieldResolver';
import { renderMessage, CURRENT_USER } from '../../data/messageMerge';
import { recordSend, type EmailHistoryRow } from '../../data/mockEmailHistory';
import { FontAwesomeIcon } from '../font-awesome-icon';
import { cn } from '../ui/utils';
import { tenantEmailConfig } from '../../data/tenantEmailConfig';
import { mergeFieldsForAudiences } from '../../data/mergeFieldCatalog';
import { MergeFieldList } from './MergeFieldList';
import { fieldsForSurface, type SurfaceKey } from '../../data/surfaceMergeFields';
import { Sheet, SheetContent, SheetTitle } from '../ui/sheet';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import { useNotifStore, deleteTemplate, deleteBlockedReason, getTemplateByBulkId, getTemplate, createTemplate, updateTemplate, setDefault as setDefaultTemplate, layoutOptions, type LayoutId } from '../../data/notificationStore';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { ChipInput } from './compose/ChipInput';
import { AtMenu } from './compose/AtMenu';
import { EmailUploader, UPLOAD_LIMIT_BYTES, type UploadedFile } from './compose/EmailUploader';
import { MERGE_FIELD_CATALOG, MERGE_FIELD_GROUPS, mergeToken } from '../../data/mergeFieldCatalog';
import { Check, ChevronDown, ChevronRight, Copy, Info, OctagonAlert, Paperclip, Pencil, Plus, Sparkles, Trash2, TriangleAlert, Users, X } from 'lucide-react';

export interface RecipientRow {
  id: string;
  name: string;
  email: string | null;
  meta?: string;
  /** Set when the record is ineligible to receive Bulk Email (e.g. Site Personnel with Receive Notifications off) — listed but excluded, like a missing email. */
  excludedReason?: 'notifications-off';
  /** Role chips shown in the recipient picker (e.g. "Clinical Coordinator") and used to filter it. */
  tags?: string[];
  /** Persona this recipient belongs to. Merge fields, templates and history are resolved per recipient from this, falling back to the wizard's audienceType. */
  audience?: AudienceType;
  /** Short persona name shown beside the person in the sheet's recipient list. */
  badge?: string;
  /** On the Schedules screens: the ticked schedules this person is being emailed about, so one email can cover all of them. */
  scheduleIds?: string[];
}

/** A persona the sender can tick in Step 1; ticking it adds its recipients automatically. */
export const personaKey = (p: { id?: string; audience: AudienceType }) => p.id ?? p.audience;

export interface PersonaOption {
  /** Unique key when several personas share one audience (e.g. two staff roles). Defaults to the audience. */
  id?: string;
  /** Short name shown beside each person in step 1 (e.g. "Location Coordinator"). Defaults to the audience name. */
  badge?: string;
  audience: AudienceType;
  label: string;
  description?: string;
  recipients: RecipientRow[];
}

// Manual = uploaded by the sender. Dynamic = rendered at send time from an
// EmailAttachmentTemplate (Site Configuration → Attachment Templates) — no
// raw file, so `size` is absent and `templateId` points at the template instead.
interface AttachedFile {
  name: string;
  source: 'manual' | 'dynamic';
  size?: number;
  templateId?: string;
}

export interface ComposeEmailWizardInitialData {
  subject?: string;
  body?: string;
  replyTo?: string;
  scheduleDate?: string;
  scheduleTime?: string;
  sendMode?: 'now' | 'scheduled';
}

export interface ComposeEmailWizardScheduleUpdate {
  subject: string;
  body: string;
  scheduleDate: string;
  scheduleTime: string;
  recipients: RecipientRow[];
}

interface ComposeEmailWizardProps {
  open: boolean;
  onClose: () => void;
  selectedRecipients: RecipientRow[];
  /** When set, Step 1 shows a picker of everyone in this pool, to the left of the recipient list. Nothing is pre-selected. */
  recipientPool?: RecipientRow[];
  /** When set, Step 1 shows these personas to tick instead of a person picker. One message goes to every ticked persona; fields fill per recipient. */
  personas?: PersonaOption[];
  audienceType: AudienceType;
  /** Which portal this wizard is launched from — controls branding and template set */
  portal?: 'site' | 'school';
  /** SOURCE_BADGE key recorded on every history row this wizard sends (e.g. 'Slot Requests') */
  sourceSurface?: string;
  /** Badges this screen can be attributed to; the send takes the one matching its template's section, else `sourceSurface` (PRD 5.3) */
  sourceSurfaceCandidates?: string[];
  /** Pre-fill compose fields when editing a scheduled send */
  initialData?: ComposeEmailWizardInitialData;
  /** 'edit-scheduled': submit updates existing schedule instead of firing a send */
  mode?: 'compose' | 'edit-scheduled';
  /** Called on submit in edit-scheduled mode with the updated data */
  onScheduleUpdate?: (data: ComposeEmailWizardScheduleUpdate) => void;
  /** 'drawer' (default): full-screen bottom drawer. 'sheet': the design team's right-hand "Compose Bulk Email" sheet. Same steps, same engine. */
  layout?: 'drawer' | 'sheet';
  /** Sheet only: the line under the title, e.g. "2 schedules selected · Group". */
  selectionSummary?: string;
  /** Sheet only: personas already chosen in the pop-up that precedes the sheet. Their recipients are listed in step 1. */
  initialPersonas?: string[];
  /** Sheet only: lets the sender go back to the persona pop-up. */
  onChangePersonas?: () => void;
  /** The screen the email is sent from. Limits the merge fields offered to those that make sense there. */
  surface?: SurfaceKey;
}

// Fallback only — actual values come from tenantEmailConfig (written by Email Setup save)
const TENANT_DEFAULTS = {
  displayName: 'MedStar Health Clinical Education',
  replyTo: 'clinical.placements@medstarhealth.org',
  footer:
    'This email was sent by MedStar Health Clinical Education via Exxat One. If you believe you received this in error, please contact support@exxat.com.',
};

const ALLOWED_EXTS = ['.pdf', '.docx', '.xlsx', '.png', '.jpg', '.jpeg'];
const MAX_FILE_BYTES = 10 * 1024 * 1024;
const MAX_FILES = 3;

function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function isBodyEmpty(html: string): boolean {
  return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, '').replace(/\s/g, '').length === 0;
}

function simulateFail(email: string): boolean {
  const sum = [...email].reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return sum % 7 === 0;
}

// One visual treatment for every "this recipient (or their attachment) is left
// out of the send" note: the same red triangle line as the Step 1 "excluded"
// pattern. Only the reason text changes.
function ExclusionLine({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex items-start gap-1.5 text-negative-default text-xs">
      <FontAwesomeIcon name="triangleExclamation" className="w-3 h-3 flex-shrink-0 mt-0.5" />
      <span>{children}</span>
    </p>
  );
}

function escapeHtml(v: string): string {
  return v.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function dedupeByEmail(rows: RecipientRow[]): RecipientRow[] {
  const seen = new Set<string>();
  return rows.filter((r) => {
    if (!r.email) return true;
    const key = r.email.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ── Local DatePicker (same pattern as BulkCloneRow.tsx) ─────────────────────
function DatePicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const selected = value ? new Date(value + 'T00:00:00') : undefined;
  const label = selected
    ? selected.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Pick a date';
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 border border-input rounded-md px-3 py-2 text-sm bg-card hover:bg-neutral-50 text-left min-w-[160px]"
        >
          <FontAwesomeIcon name="calendar" className="w-4 h-4 text-neutral-600" />
          {label}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={(date) => {
            if (date) {
              onChange(toISODate(date));
              setOpen(false);
            }
          }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}

function mapStoreLayout(l: LayoutId | undefined): HeaderFooterLayout {
  return l === 'own-header' ? 'university-header' : l === 'own-exxat' ? 'university-exxat' : l === 'exxat-footer' ? 'exxat-footer' : l === 'share-profile-exxat' ? 'share-profile-exxat' : 'none';
}

// Chevron-shaped step bar segments, as in the design team's build.
function stepClip(i: number, total: number): string {
  if (i === 0) return 'polygon(0 0, calc(100% - 14px) 0, 100% 50%, calc(100% - 14px) 100%, 0 100%)';
  if (i === total - 1) return 'polygon(0 0, 100% 0, 100% 100%, 0 100%, 14px 50%)';
  return 'polygon(0 0, calc(100% - 14px) 0, 100% 50%, calc(100% - 14px) 100%, 0 100%, 14px 50%)';
}

// ── Step label ───────────────────────────────────────────────────────────────
const STEP_LABELS = ['Recipients', 'Compose', 'Preview'] as const;

type HeaderFooterLayout =
  | 'none'
  | 'university-header'
  | 'exxat-footer'
  | 'university-exxat'
  | 'share-profile-exxat';

// "Own logo" is the sender's organisation: the site on the site portal, the university on the school portal.
const headerFooterOptions = (own: string): { value: HeaderFooterLayout; label: string }[] => [
  { value: 'none',                label: 'No logos on header and footer' },
  { value: 'university-header',   label: `${own} logo on the header` },
  { value: 'exxat-footer',        label: 'Exxat logo on the footer' },
  { value: 'university-exxat',    label: `${own} logo on the header and Exxat logo on the footer` },
  { value: 'share-profile-exxat', label: `Share Profile ${own} logo on the header and Exxat logo on the footer` },
];

// ── Main component ───────────────────────────────────────────────────────────
export function ComposeEmailWizard({
  open,
  onClose,
  selectedRecipients,
  recipientPool,
  personas,
  audienceType,
  portal = 'site',
  sourceSurface = 'General',
  sourceSurfaceCandidates,
  initialData,
  mode = 'compose',
  onScheduleUpdate,
  layout = 'drawer',
  selectionSummary,
  initialPersonas,
  onChangePersonas,
  surface,
}: ComposeEmailWizardProps) {
  useNotifStore(); // re-render when a template is added, edited or deleted from inside the flow
  // Live tenant config — reads whatever Email Setup last saved (or defaults)
  const tenantConfig = tenantEmailConfig[portal];
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1 state
  const [recipients, setRecipients] = useState<RecipientRow[]>([]);
  const [overrideEmail, setOverrideEmail] = useState('');
  const [overrideError, setOverrideError] = useState('');
  const [cc, setCc] = useState('');
  const [bcc, setBcc] = useState('');
  const [pickerSearch, setPickerSearch] = useState('');
  const [pickerTag, setPickerTag] = useState('All');
  const [pickedPersonas, setPickedPersonas] = useState<string[]>([]);
  const [removedIds, setRemovedIds] = useState<string[]>([]);

  // Step 2 state
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [replyTo, setReplyTo] = useState(TENANT_DEFAULTS.replyTo);
  const [attachments, setAttachments] = useState<AttachedFile[]>([]);
  const [attachError, setAttachError] = useState('');
  const [dynamicAttachOpen, setDynamicAttachOpen] = useState(false);
  const [continueWithoutTemplate, setContinueWithoutTemplate] = useState(false);
  const [headerFooterLayout, setHeaderFooterLayout] = useState<HeaderFooterLayout>('none');
  const [mergeOpen, setMergeOpen] = useState(false);
  const editorRef = useRef<EmailRichTextEditorHandle>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Step 3 state
  const [sendMode, setSendMode] = useState<'now' | 'scheduled'>('now');
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [scheduleError, setScheduleError] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [previewAsId, setPreviewAsId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Sheet layout only
  const [maxStep, setMaxStep] = useState<1 | 2 | 3>(1);
  const [testOpen, setTestOpen] = useState(false);
  const [testEnabled, setTestEnabled] = useState(false);
  const [templateOpen, setTemplateOpen] = useState(false);
  const [excludedOpen, setExcludedOpen] = useState(false);
  const [unchecked, setUnchecked] = useState<string[]>([]);
  const [editing, setEditing] = useState<null | 'new' | 'edit'>(null);
  const [eName, setEName] = useState('');
  const [eDefault, setEDefault] = useState(false);
  const [eSubject, setESubject] = useState('');
  const [eBody, setEBody] = useState('');
  const [eLayout, setELayout] = useState<LayoutId>('own-exxat');
  const [eFiles, setEFiles] = useState<UploadedFile[]>([]);
  const [ePreviewOpen, setEPreviewOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [atBody, setAtBody] = useState<{ query: string; apply: (t: string) => void } | null>(null);
  const [fieldQuery, setFieldQuery] = useState('');

  useEffect(() => {
    if (open) {
      setRecipients(dedupeByEmail(selectedRecipients));
      setPickerSearch('');
      setPickerTag('All');
      setPickedPersonas([]);
      setRemovedIds([]);
      setStep(1);
      setOverrideEmail('');
      setOverrideError('');
      setCc('');
      setBcc('');
      setSelectedTemplate(null);
      setSubject(initialData?.subject ?? '');
      setBody(initialData?.body ?? '');
      setReplyTo(initialData?.replyTo ?? tenantEmailConfig[portal].replyTo);
      setAttachments([]);
      setAttachError('');
      setDynamicAttachOpen(false);
      setContinueWithoutTemplate(false);
      setHeaderFooterLayout('none');
      setSendMode(initialData?.sendMode ?? (mode === 'edit-scheduled' ? 'scheduled' : 'now'));
      setScheduleDate(initialData?.scheduleDate ?? '');
      setScheduleTime(initialData?.scheduleTime ?? '');
      setScheduleError('');
      setConfirmOpen(false);
      setSubmitting(false);
      setMaxStep(1);
      setTestOpen(false);
      setTestEnabled(false);
      setTemplateOpen(false);
      setExcludedOpen(false);
      setUnchecked([]);
      setEditing(null);
      setEPreviewOpen(false);
      setDeleteOpen(false);
      setAtBody(null);
      setFieldQuery('');
    }
  }, [open]);

  // Sheet layout: the personas chosen in the pop-up decide who is listed in step 1.
  const personaSignature = (initialPersonas ?? []).join('|');
  useEffect(() => {
    if (layout === 'sheet' && open && initialPersonas) {
      applyPersonas(initialPersonas, []);
      setUnchecked([]);
    }
  }, [open, personaSignature]); // eslint-disable-line react-hooks/exhaustive-deps // eslint-disable-line react-hooks/exhaustive-deps

  // Sheet layout: people unticked in step 1 stay listed but are left out of the send.
  const activeRecipients = layout === 'sheet' ? recipients.filter((r) => !unchecked.includes(r.id)) : recipients;
  const validRecipients = activeRecipients.filter((r) => r.email !== null && !r.excludedReason);
  const notificationsOffCount = activeRecipients.filter((r) => r.email && r.excludedReason === 'notifications-off').length;

  const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  // In the sheet layout the test address only applies while its checkbox is ticked.
  const activeOverride = layout === 'sheet' && !testEnabled ? '' : overrideEmail;
  const effectiveRecipients =
    activeOverride && isValidEmail(activeOverride)
      ? validRecipients.map((r) => ({ ...r, email: activeOverride }))
      : validRecipients;

  // ── Per-recipient message rendering ───────────────────────────────────────
  // The message in compose state is a template with {{tokens}}. Each recipient gets
  // their own copy, rendered against their own records (messageMerge.ts). Resolved
  // against the original recipient, never the test-redirect address.
  // With personas, one send can span several audiences; each recipient is resolved as their own.
  const audienceOf = (r: RecipientRow): AudienceType => r.audience ?? audienceType;
  const sendAudiences: AudienceType[] = personas
    ? Array.from(new Set(personas.filter((p) => pickedPersonas.includes(personaKey(p))).map((p) => p.audience)))
    : [audienceType];
  const audienceLabel = sendAudiences.length > 0 ? sendAudiences.join(' + ') : audienceType;
  function renderFor(r: RecipientRow) {
    const original = validRecipients.find((v) => v.id === r.id) ?? r;
    return renderMessage(subject, body, audienceOf(r), { id: original.id, name: original.name, email: original.email, scheduleIds: original.scheduleIds }, { portal });
  }

  // A recipient whose message can't be fully filled (a token with no value on their
  // record, or one the sender is meant to write) is left out of the send and flagged —
  // an email with a raw {{token}} in it is never sent. Only computed on Step 3.
  const messageGaps =
    step === 3
      ? effectiveRecipients.map((r) => ({ r, unresolved: renderFor(r).unresolved })).filter((g) => g.unresolved.length > 0)
      : [];
  const gapIds = new Set(messageGaps.map((g) => g.r.id));
  const sendRecipients = effectiveRecipients.filter((r) => !gapIds.has(r.id));
  // token -> the recipients it's missing for
  const gapsByToken = new Map<string, RecipientRow[]>();
  for (const g of messageGaps) for (const t of g.unresolved) gapsByToken.set(t, [...(gapsByToken.get(t) ?? []), g.r]);

  const isStep1NextEnabled = validRecipients.length > 0;
  const isStep2NextEnabled = subject.trim().length > 0 && !isBodyEmpty(body);

  const isPastSchedule =
    scheduleDate !== '' &&
    scheduleTime !== '' &&
    new Date(`${scheduleDate}T${scheduleTime}`) <= new Date();

  const isStep3SubmitEnabled =
    !submitting &&
    sendRecipients.length > 0 &&
    (sendMode === 'now' || (scheduleDate !== '' && scheduleTime !== '' && !isPastSchedule));

  // ── Template selection ─────────────────────────────────────────────────────
  function handleTemplateSelect(id: string) {
    const tmpl = mockEmailTemplates.find((t) => t.id === id) ?? null;
    setSelectedTemplate(tmpl);
    if (tmpl) {
      setSubject(tmpl.subject);
      setBody(tmpl.body);
      setReplyTo(tmpl.replyToOverride ?? tenantConfig.replyTo);
    }
  }

  // ── Attachment handling ────────────────────────────────────────────────────
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = '';
    setAttachError('');
    for (const file of files) {
      if (attachments.length >= MAX_FILES) {
        setAttachError(`Cannot add "${file.name}": already at the 3-file maximum.`);
        return;
      }
      const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
      if (!ALLOWED_EXTS.includes(ext)) {
        setAttachError(
          `"${file.name}" was rejected: file type not allowed — PDF, DOCX, XLSX, PNG, and JPG only.`,
        );
        return;
      }
      if (file.size > MAX_FILE_BYTES) {
        setAttachError(`"${file.name}" was rejected: file exceeds the 10 MB limit.`);
        return;
      }
      setAttachments((prev) => [...prev, { name: file.name, source: 'manual', size: file.size }]);
    }
  }

  // Available dynamic-attachment templates for this send's audience — Site
  // Configuration's save-time validation means everything here is already valid.
  const availableAttachmentTemplates = mockEmailAttachmentTemplates.filter(
    (t) => sendAudiences.includes(t.audienceType),
  );

  function addDynamicAttachment(templateId: string) {
    setDynamicAttachOpen(false);
    const tpl = mockEmailAttachmentTemplates.find((t) => t.id === templateId);
    if (!tpl) return;
    if (attachments.length >= MAX_FILES) {
      setAttachError(`Cannot add "${tpl.name}": already at the 3-file maximum.`);
      return;
    }
    if (attachments.some((a) => a.templateId === tpl.id)) return;
    setAttachError('');
    const fileName = `${tpl.name.replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_+|_+$/g, '')}.pdf`;
    setAttachments((prev) => [...prev, { name: fileName, source: 'dynamic', templateId: tpl.id }]);
  }

  // ── Submit flow ────────────────────────────────────────────────────────────
  function validateSchedule(): boolean {
    if (sendMode === 'scheduled') {
      if (!scheduleDate || !scheduleTime) {
        setScheduleError('Please select both a date and time.');
        return false;
      }
      if (isPastSchedule) {
        // Inline warning already shows; button is normally disabled — this guards the race condition
        return false;
      }
    }
    setScheduleError('');
    return true;
  }

  function handleSubmitIntent() {
    if (!validateSchedule()) return;
    if (mode === 'edit-scheduled') {
      executeScheduleUpdate();
      return;
    }
    if (sendRecipients.length > 25) {
      setConfirmOpen(true);
    } else {
      executeSend();
    }
  }

  function executeScheduleUpdate() {
    setSubmitting(true);
    setTimeout(() => {
      onScheduleUpdate?.({ subject, body, scheduleDate, scheduleTime, recipients: sendRecipients });
      toast.success('Scheduled send updated successfully.');
      setSubmitting(false);
      onClose();
    }, 400);
  }

  // Section 8: does this recipient's own record lack a field the template requires?
  // Checked against the original recipient, not the test-redirect address, so an
  // override email never changes whose record is being resolved.
  function attachmentGapFor(r: RecipientRow, templateId: string): boolean {
    const tpl = mockEmailAttachmentTemplates.find((t) => t.id === templateId);
    if (!tpl) return false;
    const original = validRecipients.find((v) => v.id === r.id) ?? r;
    const missing = missingMergeFields(audienceOf(r), original, tpl.requiredMergeFields);
    return !!missing && missing.length > 0;
  }

  function executeSend() {
    setSubmitting(true);
    setTimeout(() => {
      const failed = sendRecipients.filter((r) => r.email && simulateFail(r.email));
      if (sendMode === 'now') {
        const sentAt = new Date().toISOString();
        const rows: EmailHistoryRow[] = sendRecipients.map((r, i) => {
          const message = renderFor(r); // this recipient's own subject and body, fields filled in
          return {
          id: `eh-live-${Date.now()}-${i}`,
          portal,
          recipientName: r.name,
          recipientEmail: r.email ?? '',
          subject: message.subject,
          status: r.email && simulateFail(r.email) ? 'Failed' : 'Sent',
          from: tenantConfig.displayName,
          sentBy: CURRENT_USER,
          sentAt,
          sourceSurface: resolveSourceSurface(sourceSurface, sourceSurfaceCandidates, selectedTemplate),
          audienceType: audienceOf(r),
          body: withHeaderFooter(message.body), // same header/footer the preview showed
          // A dynamic attachment is dropped for just the recipients whose record
          // can't fill its merge fields — the email itself still goes out.
          attachments: attachments
            .filter((a) => !(a.source === 'dynamic' && a.templateId && attachmentGapFor(r, a.templateId)))
            .map((a) => ({
              name: a.name,
              size: a.source === 'dynamic' ? 'Generated' : formatFileSize(a.size ?? 0),
            })),
          };
        });
        recordSend(rows);
      }
      const succeededCount = sendRecipients.length - failed.length;
      // Same exclusions the Step 3 preview flagged, repeated in the confirmation.
      const notes: string[] = [];
      if (notificationsOffRecipients.length > 0) notes.push(`${plural(notificationsOffRecipients.length, 'recipient', 'recipients')} excluded (notifications off)`);
      dynamicAttachmentExclusions.forEach((ex) =>
        notes.push(`"${ex.templateName}" not attached for ${plural(ex.affected.length, 'recipient', 'recipients')} (missing merge data)`),
      );
      // One short note however many fields were missing; Preview lists the fields and the people.
      const gapPeople = new Set([...gapsByToken.values()].flatMap((rs) => rs.map((r) => r.id)));
      if (gapPeople.size > 0) notes.push(`${plural(gapPeople.size, 'recipient', 'recipients')} excluded (a merge field had no value for them)`);
      const noteSuffix = notes.length > 0 ? ` ${notes.join('; ')}.` : '';
      if (failed.length === 0 && notes.length === 0) {
        toast.success(
          `Email ${sendMode === 'scheduled' ? 'scheduled' : 'sent'} successfully to ${succeededCount} ${succeededCount === 1 ? 'recipient' : 'recipients'}.`,
        );
      } else if (failed.length === 0) {
        toast.warning(
          `Email ${sendMode === 'scheduled' ? 'scheduled' : 'sent'} to ${succeededCount} ${succeededCount === 1 ? 'recipient' : 'recipients'}.${noteSuffix}`,
        );
      } else {
        toast.warning(
          `${succeededCount} of ${sendRecipients.length} succeeded, ${failed.length} failed — see Email History to retry.${noteSuffix}`,
        );
      }
      setSubmitting(false);
      onClose();
    }, 600);
  }

  const audienceTemplates = mockEmailTemplates.filter(
    (t) => sendAudiences.includes(t.audienceType) && t.portal === portal && (!surface || !t.surfaces || t.surfaces.includes(surface)),
  );
  const mergeFields = surface
    ? fieldsForSurface(surface, sendAudiences.length > 0 ? sendAudiences : [audienceType], portal)
    : mergeFieldsForAudiences(sendAudiences.length > 0 ? sendAudiences : [audienceType], portal);

  // Section 8 edge case: a valid template can still fail to resolve for one
  // specific recipient whose own record is missing a merge field it needs
  // (see mergeFieldResolver.ts). Excludes just that recipient's copy of the
  // attachment — never the whole send — and surfaces it here so it's visible
  // before Send is pressed.
  const dynamicAttachmentExclusions = attachments
    .filter((a): a is AttachedFile & { templateId: string } => a.source === 'dynamic' && !!a.templateId)
    .map((a) => {
      const tpl = mockEmailAttachmentTemplates.find((t) => t.id === a.templateId);
      const affected = sendRecipients.filter(
        (r) => r.email && attachmentGapFor(r, a.templateId),
      );
      return { attachmentName: a.name, templateName: tpl?.name ?? a.name, affected };
    })
    .filter((x) => x.affected.length > 0);

  // Recipients left out of the send entirely (Step 1 already marks them; Step 3
  // and the confirmation repeat it so it's visible right before Send).
  const notificationsOffRecipients = activeRecipients.filter((r) => r.email && r.excludedReason === 'notifications-off');
  const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

  // Renders every exclusion line — recipient-level and per-recipient attachment.
  const renderExclusionNotes = (withNames: boolean) => (
    <div className="space-y-1">
      {notificationsOffRecipients.length > 0 && (
        <ExclusionLine>
          {plural(notificationsOffRecipients.length, 'recipient', 'recipients')} excluded — Receive Notifications is off
          {withNames && ` (${notificationsOffRecipients.map((r) => r.name).join(', ')})`}
        </ExclusionLine>
      )}
      {[...gapsByToken.entries()].map(([t, rs]) => (
        <ExclusionLine key={`gap-${t}`}>
          {rs.length === effectiveRecipients.length
            ? <>{`{{${t}}}`} has no value for any recipient — replace it with your own text in Step 2. It can't be sent as written.</>
            : <>{plural(rs.length, 'recipient', 'recipients')} excluded — {`{{${t}}}`} has no value on their record{withNames && ` (${rs.map((r) => r.name).join(', ')})`}</>}
        </ExclusionLine>
      ))}
      {dynamicAttachmentExclusions.map((ex) => (
        <ExclusionLine key={ex.templateName}>
          "{ex.templateName}" not attached for {plural(ex.affected.length, 'recipient', 'recipients')} — missing required merge data
          {withNames && ` (${ex.affected.map((r) => r.name).join(', ')})`}. They still receive the email.
        </ExclusionLine>
      ))}
    </div>
  );
  const hasExclusionNotes =
    notificationsOffRecipients.length > 0 || dynamicAttachmentExclusions.length > 0 || gapsByToken.size > 0;

  // ── Recipient picker (only when a pool is provided) ───────────────────────
  const pool = recipientPool ?? [];
  const pickedIds = new Set(recipients.map((r) => r.id));
  const poolTags = Array.from(new Set(pool.flatMap((r) => r.tags ?? []))).sort();
  const poolVisible = pool.filter((r) => {
    const q = pickerSearch.trim().toLowerCase();
    return (
      (pickerTag === 'All' || (r.tags ?? []).includes(pickerTag)) &&
      (q === '' || r.name.toLowerCase().includes(q) || (r.email ?? '').toLowerCase().includes(q))
    );
  });
  const visibleAllPicked = poolVisible.length > 0 && poolVisible.every((r) => pickedIds.has(r.id));
  function setPicked(ids: string[], on: boolean) {
    const touch = new Set(ids);
    // Keep the recipient list in pool order so it doesn't reshuffle as people are ticked.
    const next = pool.filter((r) => (touch.has(r.id) ? on : pickedIds.has(r.id)));
    setRecipients(dedupeByEmail(next));
  }
  // ── Persona picker (only when personas are provided) ──────────────────────
  function applyPersonas(nextPicked: string[], nextRemoved: string[]) {
    const removed = new Set(nextRemoved);
    const next = (personas ?? [])
      .filter((p) => nextPicked.includes(personaKey(p)))
      .flatMap((p) => p.recipients.map((r) => ({ ...r, audience: p.audience, badge: p.badge })))
      .filter((r) => !removed.has(r.id));
    setPickedPersonas(nextPicked);
    setRecipients(dedupeByEmail(next));
  }
  function togglePersona(a: string, on: boolean) {
    applyPersonas(on ? [...pickedPersonas, a] : pickedPersonas.filter((x) => x !== a), removedIds);
  }
  function removeRecipient(id: string) {
    if (personas) {
      const nextRemoved = [...removedIds, id];
      setRemovedIds(nextRemoved);
    }
    setRecipients((prev) => prev.filter((x) => x.id !== id));
  }
  const tagChip = (tag: string) => {
    const t = tag.toLowerCase();
    if (t.includes('coordinator')) return 'bg-blue-50 text-blue-500';
    if (t.includes('preceptor')) return 'bg-positive-default/10 text-positive-default';
    if (t.includes('director') || t.includes('manager')) return 'bg-accent-100 text-warning-default';
    return 'bg-neutral-100 text-neutral-800';
  };

  // ── Step 1: Recipients ─────────────────────────────────────────────────────
  const renderStep1 = () => (
    <div className={cn('p-6 grid grid-cols-1 gap-6', pool.length > 0 || personas ? 'lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,0.8fr)] max-w-7xl' : 'lg:grid-cols-2 max-w-5xl')}>

      {/* ── Persona column ──────────────────────────────────────────────── */}
      {personas && (
        <div>
          <p className="text-sm font-semibold text-neutral-900 mb-2">Who should receive this? — {pickedPersonas.length} of {personas.length} selected</p>
          <div className="border border-neutral-200 rounded-md overflow-hidden divide-y divide-neutral-100">
            {personas.map((p) => {
              // Unique people: a student on several schedules is still one recipient.
              const unique = dedupeByEmail(p.recipients);
              const none = unique.length === 0;
              return (
                <label key={personaKey(p)} className={cn('flex items-start gap-3 px-4 py-3', none ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-neutral-50')}>
                  <Checkbox
                    className="mt-0.5"
                    disabled={none}
                    checked={pickedPersonas.includes(personaKey(p))}
                    onCheckedChange={(v) => togglePersona(personaKey(p), !!v)}
                    aria-label={`Select ${p.label}`}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="text-sm font-medium text-neutral-900">{p.label}</span>
                      <span className={cn('px-2 py-0.5 rounded-full text-[11px] font-medium', tagChip(p.audience))}>
                        {none ? 'none found' : `${unique.length} ${unique.length === 1 ? 'person' : 'people'}`}
                      </span>
                    </span>
                    {p.description && <span className="block text-xs text-neutral-700 mt-0.5">{p.description}</span>}
                  </span>
                </label>
              );
            })}
          </div>
          <p className="text-xs text-neutral-700 mt-2">Tick one or more. Their recipients are added automatically from the selected schedules.</p>
        </div>
      )}

      {/* ── Picker column ───────────────────────────────────────────────── */}
      {pool.length > 0 && (
        <div>
          <p className="text-sm font-semibold text-neutral-900 mb-2">Select recipients — {recipients.length} of {pool.length}</p>
          <div className="border border-neutral-200 rounded-md overflow-hidden">
            <div className="p-3 space-y-2 border-b border-neutral-200 bg-neutral-50">
              <Input value={pickerSearch} onChange={(e) => setPickerSearch(e.target.value)} placeholder="Search name or email" />
              <div className="flex flex-wrap gap-1.5">
                {['All', ...poolTags].map((tag) => {
                  const count = tag === 'All' ? pool.length : pool.filter((r) => (r.tags ?? []).includes(tag)).length;
                  const active = pickerTag === tag;
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setPickerTag(tag)}
                      className={cn(
                        'px-2.5 py-1 rounded-full text-xs font-medium border transition-colors',
                        active ? 'bg-blue-500 text-white border-blue-500' : 'bg-card text-neutral-800 border-neutral-300 hover:bg-neutral-100',
                      )}
                    >
                      {tag} <span className={active ? 'text-white/80' : 'text-neutral-600'}>{count}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <label className="flex items-center gap-3 px-4 py-2.5 border-b border-neutral-200 text-xs font-semibold text-neutral-700 uppercase tracking-wider cursor-pointer">
              <Checkbox
                checked={visibleAllPicked}
                onCheckedChange={(v) => setPicked(poolVisible.map((r) => r.id), !!v)}
                aria-label="Select all shown"
              />
              Select all{pickerTag !== 'All' || pickerSearch ? ' shown' : ''} ({poolVisible.length})
            </label>
            <div className="max-h-[420px] overflow-y-auto divide-y divide-neutral-100">
              {poolVisible.map((r) => (
                <label key={r.id} className="flex items-start gap-3 px-4 py-2.5 cursor-pointer hover:bg-neutral-50">
                  <Checkbox
                    className="mt-0.5"
                    checked={pickedIds.has(r.id)}
                    onCheckedChange={(v) => setPicked([r.id], !!v)}
                    aria-label={`Select ${r.name}`}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-neutral-900">{r.name}</span>
                    <span className="block text-xs text-neutral-700 truncate">
                      {r.excludedReason ? 'notifications off — excluded' : r.email}
                    </span>
                    {(r.tags ?? []).length > 0 && (
                      <span className="flex flex-wrap gap-1 mt-1">
                        {(r.tags ?? []).map((t) => (
                          <span key={t} className={cn('px-2 py-0.5 rounded-full text-[11px] font-medium', tagChip(t))}>{t}</span>
                        ))}
                      </span>
                    )}
                  </span>
                </label>
              ))}
              {poolVisible.length === 0 && <p className="px-4 py-8 text-center text-sm text-neutral-600">No one matches.</p>}
            </div>
          </div>
        </div>
      )}

      {/* ── Left column: recipient list ─────────────────────────────────── */}
      <div>
        <p className="text-sm font-semibold text-neutral-900 mb-2">
          Recipients — {validRecipients.length} valid
          {notificationsOffCount > 0 && (
            <span className="text-negative-default font-normal"> · {notificationsOffCount} with notifications off (excluded)</span>
          )}
        </p>
        <div className="border border-neutral-200 rounded-md overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-200">
                <th className="text-left px-4 py-2.5 font-semibold text-neutral-700 text-xs uppercase tracking-wider">Name</th>
                <th className="text-left px-4 py-2.5 font-semibold text-neutral-700 text-xs uppercase tracking-wider">Email</th>
                <th className="text-left px-4 py-2.5 font-semibold text-neutral-700 text-xs uppercase tracking-wider hidden sm:table-cell">Details</th>
                <th className="w-10 px-2 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {recipients.map((r) => (
                <tr key={r.id} className="border-b border-neutral-100 last:border-0">
                  <td className="px-4 py-2.5 font-medium text-neutral-900">{r.name}</td>
                  <td className="px-4 py-2.5">
                    {r.email && r.excludedReason === 'notifications-off' ? (
                      <span className="inline-flex items-center gap-1 text-negative-default text-xs">
                        <FontAwesomeIcon name="triangleExclamation" className="w-3 h-3" />
                        notifications off — excluded
                      </span>
                    ) : (
                      <span className="text-neutral-700">{r.email}</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-neutral-800 text-xs hidden sm:table-cell">
                    {personas && r.audience && <span className={cn('inline-block mr-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium', tagChip(r.audience))}>{r.audience}</span>}
                    {r.meta ?? '—'}
                  </td>
                  <td className="px-2 py-2.5">
                    <button
                      onClick={() => removeRecipient(r.id)}
                      className="text-neutral-400 hover:text-negative-default transition-colors"
                      aria-label={`Remove ${r.name}`}
                    >
                      <FontAwesomeIcon name="xmark" className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {recipients.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-neutral-600 text-sm">
                    {pool.length > 0 || personas ? (personas ? 'No recipients yet — tick a persona on the left.' : 'No recipients yet — tick people on the left.') : 'No recipients. All were removed — go back and re-select.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Right column: email routing options ─────────────────────────── */}
      <div className="space-y-3">

        {/* Override email */}
        <div>
          <label className="block text-sm font-medium text-neutral-800 mb-1">
            Override Recipient's Email
          </label>
          <p className="text-xs text-neutral-600 mb-2">
            If specified, ALL emails will be sent to this address instead of the original recipients.
          </p>
          <Input
            value={overrideEmail}
            onChange={(e) => { setOverrideEmail(e.target.value); setOverrideError(''); }}
            onBlur={() => {
              if (overrideEmail && !isValidEmail(overrideEmail)) {
                setOverrideError('Enter a valid email address.');
              }
            }}
            placeholder="e.g. test@example.com"
          />
          {overrideError && <p className="text-xs text-negative-default mt-1">{overrideError}</p>}
          {overrideEmail && !overrideError && isValidEmail(overrideEmail) && (
            <p className="text-xs text-warning-default mt-1">
              All {validRecipients.length} emails will be redirected to {overrideEmail}.
            </p>
          )}
        </div>

        {/* Reply-To */}
        <div>
          <label className="block text-sm font-medium text-neutral-800 mb-1">
            Reply to <span className="text-negative-default">*</span>
          </label>
          <Input
            value={replyTo}
            onChange={(e) => setReplyTo(e.target.value)}
            placeholder={tenantConfig.replyTo}
          />
        </div>

        {/* CC */}
        <div>
          <label className="block text-sm font-medium text-neutral-800 mb-1">CC</label>
          <Input
            value={cc}
            onChange={(e) => setCc(e.target.value)}
            placeholder="cc@example.com, another@example.com"
          />
          <p className="text-xs text-neutral-800 mt-1">Separate multiple addresses with commas.</p>
        </div>

        {/* BCC */}
        <div>
          <label className="block text-sm font-medium text-neutral-800 mb-1">BCC</label>
          <Input
            value={bcc}
            onChange={(e) => setBcc(e.target.value)}
            placeholder="bcc@example.com"
          />
        </div>

      </div>
    </div>
  );

  // ── Step 2: Compose ────────────────────────────────────────────────────────
  const renderStep2 = () => {
    // ── Toggle handler ────────────────────────────────────────────────────────
    const handleToggle = () => {
      const next = !continueWithoutTemplate;
      setContinueWithoutTemplate(next);
      // Whichever direction we're switching, clear compose state so the user
      // starts fresh in the new mode.
      setSelectedTemplate(null);
      setSubject('');
      setBody('');
    };

    // ── Shared: subject + body + attachments ──────────────────────────────────
    const composeFields = (
      <div className="space-y-4">
        {/* Subject */}
        <div>
          <label className="block text-sm font-medium text-neutral-800 mb-1">
            Subject <span className="text-negative-default">*</span>
          </label>
          <Input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Email subject…"
          />
        </div>

        {/* Body */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-neutral-800">
              Email Content <span className="text-negative-default">*</span>
            </label>
            <Popover open={mergeOpen} onOpenChange={setMergeOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5">
                  <FontAwesomeIcon name="tag" className="w-3 h-3" />
                  Insert Merge Field
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-80 p-2">
                <MergeFieldList
                  fields={mergeFields}
                  onInsert={(text) => {
                    setMergeOpen(false);
                    setTimeout(() => editorRef.current?.insertAtCursor(text), 50);
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>
          <EmailRichTextEditor
            ref={editorRef}
            value={body}
            onChange={setBody}
            placeholder={
              continueWithoutTemplate
                ? 'Compose your email body…'
                : 'Compose your email body… or pick a template above.'
            }
            minHeight={220}
          />
        </div>

        {/* Attachments */}
        <div>
          <label className="block text-sm font-medium text-neutral-800 mb-1">
            Attachments
            <span className="font-normal text-neutral-600 ml-1">
              PDF · DOCX · XLSX · PNG · JPG · 10 MB max · 3 files max
            </span>
          </label>
          <div className="flex flex-wrap gap-2 items-center">
            {attachments.map((f, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 bg-[var(--bg-container)] text-neutral-800 text-xs rounded-full px-3 py-1"
              >
                <FontAwesomeIcon name="paperclip" className="w-3 h-3" />
                {f.name}
                {f.source === 'dynamic' ? (
                  <span
                    className="inline-flex items-center gap-1 text-blue-500 bg-blue-500/10 rounded-full px-1.5 py-[1px] text-[10px] font-medium"
                    title="Generated at send time from an Attachment Template"
                  >
                    <FontAwesomeIcon name="sparkles" className="w-2.5 h-2.5" />
                    Generated
                  </span>
                ) : (
                  <span className="text-neutral-600">({formatFileSize(f.size ?? 0)})</span>
                )}
                <button
                  onClick={() => setAttachments((prev) => prev.filter((_, j) => j !== i))}
                  className="text-neutral-600 hover:text-negative-default ml-0.5 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-600"
                  aria-label={`Remove ${f.name}`}
                >
                  <FontAwesomeIcon name="xmark" className="w-3 h-3" />
                </button>
              </span>
            ))}
            {attachments.length < MAX_FILES && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 border border-dashed border-neutral-400 text-neutral-600 text-xs rounded-full px-3 py-1 hover:border-blue-500 hover:text-blue-500 transition-colors"
              >
                <FontAwesomeIcon name="plus" className="w-3 h-3" />
                Add file
              </button>
            )}
            {attachments.length < MAX_FILES && (
              <Popover open={dynamicAttachOpen} onOpenChange={setDynamicAttachOpen}>
                <PopoverTrigger asChild>
                  <button
                    disabled={availableAttachmentTemplates.length === 0}
                    title={
                      availableAttachmentTemplates.length === 0
                        ? `No attachment templates configured for ${audienceLabel} in Site Configuration`
                        : undefined
                    }
                    className="inline-flex items-center gap-1.5 border border-dashed border-neutral-400 text-neutral-600 text-xs rounded-full px-3 py-1 hover:border-blue-500 hover:text-blue-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-neutral-400 disabled:hover:text-neutral-600"
                  >
                    <FontAwesomeIcon name="sparkles" className="w-3 h-3" />
                    Generate document
                  </button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-72 p-1 max-h-72 overflow-y-auto">
                  <p className="text-xs font-semibold text-neutral-600 uppercase tracking-wider px-2 py-1.5">
                    {audienceLabel} attachment templates
                  </p>
                  {availableAttachmentTemplates.map((t) => (
                    <button
                      key={t.id}
                      disabled={attachments.some((a) => a.templateId === t.id)}
                      className="w-full text-left px-3 py-1.5 text-sm hover:bg-[var(--bg-container)] rounded-sm disabled:opacity-40 disabled:cursor-not-allowed"
                      onClick={() => addDynamicAttachment(t.id)}
                    >
                      <span className="text-neutral-800">{t.name}</span>
                      {attachments.some((a) => a.templateId === t.id) && (
                        <span className="text-neutral-600 text-xs ml-1.5">— already added</span>
                      )}
                    </button>
                  ))}
                </PopoverContent>
              </Popover>
            )}
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              multiple
              accept=".pdf,.docx,.xlsx,.png,.jpg,.jpeg"
              onChange={handleFileChange}
            />
          </div>
          {attachError && (
            <p className="text-xs text-negative-default mt-1.5">{attachError}</p>
          )}
        </div>
      </div>
    );

    return (
      <div className="p-6 max-w-4xl space-y-3">

        {/* ── Toggle: Continue without template ────────────────────────────── */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-neutral-800">
            Continue without picking a template.
          </span>
          <Switch
            checked={continueWithoutTemplate}
            onCheckedChange={handleToggle}
            aria-label="Continue without picking a template"
          />
        </div>

        {/* ── Template mode (toggle OFF) ────────────────────────────────────── */}
        {!continueWithoutTemplate && (
          <div className="space-y-3">
            {/* Template picker */}
            <div>
              <label className="block text-sm font-medium text-neutral-800 mb-1">
                Pick a template <span className="text-negative-default">*</span>
              </label>
              <Select
                value={selectedTemplate?.id ?? ''}
                onValueChange={(v) => {
                  if (v) handleTemplateSelect(v);
                  else setSelectedTemplate(null);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Standard" />
                </SelectTrigger>
                <SelectContent>
                  {audienceTemplates.length === 0 ? (
                    <SelectItem value="_none" disabled>
                      No templates for audience type "{audienceLabel}"
                    </SelectItem>
                  ) : (
                    audienceTemplates.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        [{t.section}] {t.name}{sendAudiences.length > 1 ? ` · ${t.audienceType}` : ''}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Compose fields (subject / body / attachments) */}
            {composeFields}
          </div>
        )}

        {/* ── No-template mode (toggle ON): two-column layout ──────────────── */}
        {continueWithoutTemplate && (
          <div className="grid grid-cols-3 gap-6">
            {/* Left: compose fields */}
            <div className="col-span-2">
              {composeFields}
            </div>

            {/* Right: Header and footer layout */}
            <div>
              <p className="text-sm font-semibold text-neutral-900 mb-3">
                Header and footer layout
              </p>
              <div className="flex flex-col gap-3">
                {headerFooterOptions(portal === 'school' ? 'University' : 'Site').map((opt) => (
                  <label
                    key={opt.value}
                    className="flex items-start gap-2.5 cursor-pointer group"
                  >
                    <input
                      type="radio"
                      name="headerFooterLayout"
                      checked={headerFooterLayout === opt.value}
                      onChange={() => setHeaderFooterLayout(opt.value)}
                      className="mt-0.5 h-4 w-4 flex-shrink-0 accent-blue-500 cursor-pointer"
                    />
                    <span className="text-sm text-neutral-800 leading-snug group-hover:text-neutral-900">
                      {opt.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    );
  };

  // Wraps {{token}} placeholders in a visible amber highlight for the Preview step.
  // Applied to both subject and body — tokens remain unchanged in compose state,
  // only the preview rendering is affected.
  // Only tokens in text content are highlighted. A token inside a tag — href="{{loginUrl}}" —
  // is left exactly as written: a <mark> dropped into an attribute value ends the value at
  // its first quote and spills the rest of the tag onto the page as visible text. The
  // first alternative matches a whole tag (quoted attribute values included) and passes
  // it through untouched.
  function highlightMergeTokens(html: string): string {
    return html.replace(
      /(<(?:"[^"]*"|'[^']*'|[^'">])*>)|\{\{([^}]+)\}\}/g,
      (_match, tag: string | undefined, token: string) =>
        tag ??
        `<mark style="background:#fef3c7;color:#92400e;padding:1px 4px;border-radius:3px;font-weight:500;">{{${token}}}</mark>`,
    );
  }

  // Wraps body content with header/footer HTML blocks for the no-template preview.
  // Uses inline SVG / placeholder text for logos (demo quality).
  function withHeaderFooter(rawBody: string): string {
    const storeLayout = selectedTemplate ? getTemplateByBulkId(selectedTemplate.id)?.layout : undefined;
    return headerFooterFor(continueWithoutTemplate ? headerFooterLayout : mapStoreLayout(storeLayout), rawBody);
  }
  function headerFooterFor(headerFooterLayout_: HeaderFooterLayout, rawBody: string): string {
    rawBody = styleTables(rawBody); // tables made in the editor get the same look as the seeded ones
    if (headerFooterLayout_ === 'none') {
      return rawBody;
    }

    // Simple placeholder blocks — swap for real asset URLs when available
    // The sender's own logo (uploaded in Email Setup); their name stands in until one is uploaded.
    const ownLogo = tenantConfig.logoDataUrl
      ? `<img src="${tenantConfig.logoDataUrl}" alt="${escapeHtml(tenantConfig.displayName)} logo" style="max-height:48px;max-width:220px" />`
      : `<span style="font-size:18px;font-weight:700;font-family:sans-serif;color:#111827">${escapeHtml(tenantConfig.displayName)}</span>`;
    const universityHeader = `
      <div style="text-align:center;padding:20px 0 16px;border-bottom:1px solid #e5e7eb;margin-bottom:20px">
        ${ownLogo}
      </div>`;

    const exxatFooter = `
      <div style="text-align:center;padding:16px 0 20px;border-top:1px solid #e5e7eb;margin-top:20px">
        <div style="display:inline-flex;align-items:center;gap:8px">
          <svg width="22" height="22" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="100" height="100" rx="8" fill="#E5208E"/>
            <text x="50" y="68" text-anchor="middle" font-family="sans-serif" font-weight="700" font-size="52" fill="white">E</text>
          </svg>
          <span style="font-size:18px;font-weight:700;font-family:sans-serif;color:#111827;letter-spacing:-0.01em">Exxat</span>
        </div>
      </div>`;

    const header =
      headerFooterLayout_ === 'university-header' ||
      headerFooterLayout_ === 'university-exxat' ||
      headerFooterLayout_ === 'share-profile-exxat'
        ? universityHeader
        : '';

    const footer =
      headerFooterLayout_ === 'exxat-footer' ||
      headerFooterLayout_ === 'university-exxat' ||
      headerFooterLayout_ === 'share-profile-exxat'
        ? exxatFooter
        : '';

    return `${header}${rawBody}${footer}`;
  }

  // ── Step 3: Preview ────────────────────────────────────────────────────────
  // The message as the chosen recipient will receive it: fields filled in from their
  // own records; any that couldn't be filled stay highlighted.
  const previewAs = effectiveRecipients.find((r) => r.id === previewAsId) ?? sendRecipients[0] ?? effectiveRecipients[0];
  const preview = previewAs ? renderFor(previewAs) : { subject, body };
  const renderStep3 = () => (
    <div className="space-y-6 p-6">
      {/* Email preview card */}
      <div>
        <p className="text-sm font-semibold text-neutral-900 mb-3">Email Preview</p>
        {effectiveRecipients.length > 0 && (
          <div className="flex items-center gap-2 mb-3 max-w-2xl">
            <span className="text-xs text-neutral-800 whitespace-nowrap">Previewing as</span>
            <Select value={previewAs?.id ?? ''} onValueChange={setPreviewAsId}>
              <SelectTrigger className="h-8 text-sm" aria-label="Preview as recipient">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {effectiveRecipients.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.name}{gapIds.has(r.id) ? ' — missing data' : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        <div className="border border-neutral-200 rounded-lg overflow-hidden bg-card shadow-sm max-w-2xl">
          {/* Sender row — uses live tenant branding from Email Setup */}
          <div className="bg-neutral-50 border-b border-neutral-200 px-6 py-4 flex items-center gap-3">
            <div className="w-12 h-12 rounded-md flex items-center justify-center flex-shrink-0 overflow-hidden bg-card border border-neutral-100">
              {tenantConfig.logoDataUrl ? (
                <img
                  src={tenantConfig.logoDataUrl}
                  alt={`${tenantConfig.displayName} logo`}
                  className="max-h-10 max-w-[80px] object-contain"
                />
              ) : (
                <div className="w-full h-full bg-blue-500/10 flex items-center justify-center">
                  <FontAwesomeIcon name="building" className="w-4 h-4 text-blue-500" />
                </div>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-neutral-900">
                {tenantConfig.displayName}
              </p>
              <p className="text-xs text-neutral-600 truncate">
                From: {tenantConfig.displayName} &lt;noreply@exxat.com&gt;
                {replyTo && ` · Reply-To: ${replyTo}`}
              </p>
              {cc && <p className="text-xs text-neutral-600 truncate">CC: {cc}</p>}
              {bcc && <p className="text-xs text-neutral-600 truncate">BCC: {bcc}</p>}
            </div>
          </div>
          {/* Subject */}
          <div className="px-6 py-3 border-b border-neutral-100 bg-card">
            <p className="text-[10px] text-neutral-800 uppercase tracking-wider mb-0.5">
              Subject
            </p>
            {subject ? (
              <p
                className="text-sm font-medium text-neutral-900"
                dangerouslySetInnerHTML={{ __html: highlightMergeTokens(escapeHtml(preview.subject)) }}
              />
            ) : (
              <p className="text-sm text-neutral-400">(no subject)</p>
            )}
          </div>
          {/* Body */}
          <div
            className="px-6 py-5 text-sm prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{
              __html: body
                ? withHeaderFooter(highlightMergeTokens(preview.body))
                : '<p style="color:#9ca3af">(no body composed)</p>',
            }}
          />
          {/* Attachments */}
          {attachments.length > 0 && (
            <div className="px-6 py-3 border-t border-neutral-100">
              <p className="text-xs text-neutral-800 mb-1.5">Attachments</p>
              <div className="flex flex-wrap gap-2">
                {attachments.map((f, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 text-xs text-neutral-700 bg-[var(--bg-container)] rounded-full px-3 py-1"
                  >
                    <FontAwesomeIcon name="paperclip" className="w-3 h-3" />
                    {f.name}
                    {f.source === 'dynamic' && (
                      <span
                        className="inline-flex items-center gap-1 text-blue-500 bg-blue-500/10 rounded-full px-1.5 py-[1px] text-[10px] font-medium"
                        title="Generated at send time from an Attachment Template"
                      >
                        <FontAwesomeIcon name="sparkles" className="w-2.5 h-2.5" />
                        Generated
                      </span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          )}
          {/* Footer — uses live footer text from Email Setup */}
          <div className="bg-neutral-50 px-6 py-3 border-t border-neutral-200">
            <p className="text-xs text-neutral-800 leading-relaxed">
              {tenantConfig.footer}
            </p>
          </div>
        </div>

        {/* Sender-side send notes — outside the card because the recipient never sees them */}
        {hasExclusionNotes && <div className="mt-3 max-w-2xl">{renderExclusionNotes(true)}</div>}
      </div>
    </div>
  );


  // ══ Sheet layout: the Compose Email side panel, laid out the way PRISM does it ═══════════════
  const stepIndex = step - 1;
  const PERSONA_BADGE: Record<string, string> = { Student: 'Student', Preceptor: 'Preceptor', 'Staff-Personnel': 'Site Personnel', 'School Contact': 'School', 'Placement Faculty/CI': 'Faculty / CI' };
  const replyList = replyTo.split(',').map((x) => x.trim()).filter(Boolean);
  const ccList = cc.split(',').map((x) => x.trim()).filter(Boolean);
  const bccList = bcc.split(',').map((x) => x.trim()).filter(Boolean);
  const sheetStep1Ok = validRecipients.length > 0 && replyList.length > 0 && !(testEnabled && !isValidEmail(overrideEmail));
  const sheetStep2Ok = isStep2NextEnabled && (continueWithoutTemplate || !!selectedTemplate);
  const sheetNextDisabled = step === 1 ? !sheetStep1Ok : step === 2 ? !sheetStep2Ok : !isStep3SubmitEnabled || !sheetStep2Ok;
  const canReachStep = (n: number) => n <= maxStep && (n < 2 || sheetStep1Ok) && (n < 3 || sheetStep2Ok);

  function goStep(n: 1 | 2 | 3) {
    // Entering Compose in template mode starts on the default template for this audience.
    if (n === 2 && !continueWithoutTemplate && !selectedTemplate && audienceTemplates.length > 0) {
      const def = audienceTemplates.find((t) => getTemplateByBulkId(t.id)?.isDefault) ?? audienceTemplates[0];
      handleTemplateSelect(def.id);
    }
    // No template exists for this audience on this screen: switch on "Continue without picking a template" and open the
    // create-a-template form straight away.
    if (n === 2 && !selectedTemplate && !editing && audienceTemplates.length === 0) {
      setContinueWithoutTemplate(true);
      startEditing('new');
    }
    setStep(n);
    setMaxStep((m) => (n > m ? n : m));
  }
  function sheetNext() {
    if (sheetNextDisabled) return;
    if (step === 3) handleSubmitIntent();
    else goStep((step + 1) as 1 | 2 | 3);
  }

  async function copyEmails() {
    const list = validRecipients.map((r) => r.email as string);
    try {
      await navigator.clipboard.writeText(list.join(', '));
      toast.success(`Copied ${list.length} email ${list.length === 1 ? 'address' : 'addresses'}.`);
    } catch {
      toast.error('Could not copy to the clipboard. Select the addresses and copy them manually.');
    }
  }

  const checkableRecipients = recipients.filter((r) => r.email && !r.excludedReason);
  const allTicked: boolean | 'indeterminate' =
    checkableRecipients.length === 0 ? false : checkableRecipients.every((r) => !unchecked.includes(r.id)) ? true : checkableRecipients.some((r) => !unchecked.includes(r.id)) ? 'indeterminate' : false;
  const toggleAll = (on: boolean) => setUnchecked(on ? [] : checkableRecipients.map((r) => r.id));
  const toggleOne = (id: string, on: boolean) => setUnchecked((prev) => (on ? prev.filter((x) => x !== id) : [...prev, id]));
  const multiAudience = new Set(recipients.map((r) => r.badge ?? r.audience)).size > 1;

  // Merge fields as PRISM shows them: "@First Name" with an info icon. Tokens in a template are shown the same way.
  const labelOf = (token: string) => MERGE_FIELD_CATALOG.find((f) => f.token === token)?.label ?? token;
  const pillHtml = (html: string) =>
    styleTables(html).replace(/(<(?:"[^"]*"|'[^']*'|[^'">])*>)|\{\{([^}]+)\}\}/g, (_m, tag: string | undefined, token: string) =>
      tag ?? `<span style="background:#fde8ec;color:#a8294a;padding:0 4px;border-radius:3px;font-weight:500">@${escapeHtml(labelOf(token.trim()))}</span>`);
  const pillText = (text: string) => text.replace(/\{\{([^}]+)\}\}/g, (_m, token: string) => `@${labelOf(token.trim())}`);

  // Preview: each merged value on a highlight; anything still unresolved in red.
  function highlightMissing(html: string): string {
    return html.replace(
      /(<(?:"[^"]*"|'[^']*'|[^'">])*>)|\{\{([^}]+)\}\}/g,
      (_m, tag: string | undefined, token: string) =>
        tag ?? `<span style="background:#fde2e1;color:#b3261e;font-weight:500;padding:0 2px;border-radius:2px">{{${token}}}</span>`,
    );
  }
  const sheetPreviewAs = effectiveRecipients.find((r) => r.id === previewAsId) ?? sendRecipients[0] ?? effectiveRecipients[0];
  const sheetPreview = sheetPreviewAs
    ? (() => {
        const original = validRecipients.find((v) => v.id === sheetPreviewAs.id) ?? sheetPreviewAs;
        return renderMessage(subject, body, audienceOf(sheetPreviewAs), { id: original.id, name: original.name, email: original.email, scheduleIds: original.scheduleIds }, { portal, mark: true });
      })()
    : { subject, body };

  const templateRecord = selectedTemplate ? getTemplateByBulkId(selectedTemplate.id) : undefined;
  const templateIsCustom = templateRecord?.type === 'Customized';
  const templateSections = Array.from(new Set(audienceTemplates.map((t) => t.section)));
  const allRecipientsGap = [...gapsByToken.entries()].filter(([, rs]) => effectiveRecipients.length > 0 && rs.length === effectiveRecipients.length).map(([t]) => t);
  const partialGapLines = [...gapsByToken.entries()]
    .filter(([t]) => !allRecipientsGap.includes(t))
    .flatMap(([t, rs]) => rs.map((r) => `{{${t}}} has no value on their record (${r.name})`));
  const offLines = notificationsOffRecipients.map((r) => `${r.name} — Receive Notifications is off`);
  const attachLines = dynamicAttachmentExclusions.map((ex) => `"${ex.templateName}" not attached for ${plural(ex.affected.length, 'recipient', 'recipients')} — missing required merge data (${ex.affected.map((r) => r.name).join(', ')}); they still receive the email`);
  const excludedCount = new Set([...messageGaps.filter((g) => !g.unresolved.every((t) => allRecipientsGap.includes(t))).map((g) => g.r.id)]).size + notificationsOffRecipients.length;
  const warnLines = [...partialGapLines, ...offLines, ...attachLines];

  // Files added in step 1 travel with this send; generated documents are listed beside them.
  const manualFiles: UploadedFile[] = attachments.filter((a) => a.source === 'manual').map((a) => ({ name: a.name, size: a.size ?? 0 }));
  const setManualFiles = (next: UploadedFile[]) =>
    setAttachments([...attachments.filter((a) => a.source === 'dynamic'), ...next.map((f) => ({ name: f.name, source: 'manual' as const, size: f.size }))]);

  const sheetStepper = (
    <div className="flex min-h-11 w-full items-stretch overflow-hidden rounded-md border border-neutral-300 bg-card" role="tablist" aria-label="Compose email steps">
      {STEP_LABELS.map((label, i) => {
        const active = i === stepIndex;
        const done = i < stepIndex;
        const reachable = canReachStep(i + 1) && (!editing || i === stepIndex);
        return (
          <button
            key={label}
            type="button"
            role="tab"
            aria-selected={active}
            aria-current={active ? 'step' : undefined}
            disabled={!reachable}
            onClick={() => reachable && goStep((i + 1) as 1 | 2 | 3)}
            className={cn('relative min-w-0 flex-1 px-4 py-2.5 text-sm font-medium transition-colors', active ? 'z-[2] text-white' : done ? 'z-[1] text-neutral-900 hover:bg-neutral-50' : 'text-neutral-800', reachable ? 'cursor-pointer' : 'cursor-not-allowed opacity-70')}
            style={{ clipPath: stepClip(i, STEP_LABELS.length), marginLeft: i === 0 ? 0 : -10, paddingLeft: i === 0 ? 16 : 22, backgroundColor: active ? 'var(--color-blue-500)' : 'var(--color-card, #fff)' }}
          >
            <span className="relative z-[1] inline-flex items-center gap-1.5 whitespace-nowrap">
              {done ? <><Pencil className="size-3.5 text-neutral-700" strokeWidth={2} aria-hidden />{label}</> : `${i + 1}  ${label}`}
            </span>
          </button>
        );
      })}
    </div>
  );

  // ── Step 1: Recipients ──────────────────────────────────────────────────────
  const sheetStep1 = (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="outline" onClick={copyEmails} disabled={validRecipients.length === 0}><Copy className="size-4" aria-hidden />Copy selected recipient email addresses</Button>
        <Button disabled={!sheetStep1Ok} onClick={sheetNext}>Next</Button>
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <section className="overflow-hidden rounded-lg border border-neutral-200 bg-card">
          <div className="flex items-center justify-between gap-3 border-b border-neutral-200 px-4 py-3">
            <label className="flex items-center gap-2.5 text-sm font-semibold text-neutral-900">
              <Checkbox checked={allTicked} onCheckedChange={(v) => toggleAll(v === true)} disabled={checkableRecipients.length === 0} aria-label="Select all recipients" />
              Recipients
            </label>
            <span className="text-sm text-neutral-800">{validRecipients.length} selected {validRecipients.length === 1 ? 'recipient' : 'recipients'}</span>
          </div>
          {onChangePersonas && (
            <div className="flex items-center justify-between gap-2 border-b border-neutral-100 bg-neutral-50 px-4 py-2 text-xs text-neutral-800">
              <span>Emailing: {(personas ?? []).filter((p) => pickedPersonas.includes(personaKey(p))).map((p) => p.badge ?? p.label).join(', ') || 'no group picked'}</span>
              <button type="button" className="font-medium text-blue-500 hover:underline" onClick={onChangePersonas}>Change</button>
            </div>
          )}
          {recipients.length === 0 ? (
            <div className="flex min-h-[200px] flex-col items-center justify-center px-6 text-center text-sm text-neutral-700">
              <Users className="mb-2 size-6 text-neutral-400" strokeWidth={1.5} aria-hidden />
              No recipients yet. Pick who this email is for.
              {onChangePersonas && <Button variant="outline" size="sm" className="mt-3" onClick={onChangePersonas}>Pick recipients</Button>}
            </div>
          ) : (
            <ul className="max-h-[420px] divide-y divide-neutral-100 overflow-y-auto">
              {recipients.map((r) => {
                const off = !r.email || !!r.excludedReason;
                return (
                  <li key={r.id}>
                    <label className={cn('flex items-start gap-3 px-4 py-2.5', off ? 'cursor-not-allowed opacity-70' : 'cursor-pointer hover:bg-neutral-50')}>
                      <Checkbox className="mt-0.5" disabled={off} checked={!off && !unchecked.includes(r.id)} onCheckedChange={(v) => toggleOne(r.id, v === true)} aria-label={`Include ${r.name}`} />
                      <span className="min-w-0 flex-1 text-sm text-neutral-900">
                        <span className="block">{r.name}</span>
                        <span className="block break-all text-xs text-neutral-700">
                          {r.excludedReason === 'notifications-off' ? <span className="inline-flex items-center gap-1 text-negative-default"><TriangleAlert className="size-3" aria-hidden />notifications off — excluded</span> : r.email ?? 'no email on file'}
                        </span>
                      </span>
                      {multiAudience && (r.badge ?? r.audience) && <span className="shrink-0 rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-500">{r.badge ?? PERSONA_BADGE[r.audience as string] ?? r.audience}</span>}
                    </label>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="space-y-4">
          <p className="text-sm text-neutral-800">If override is specified, ALL email notifications will be sent to THIS email instead of the original recipients.</p>
          <div>
            <label htmlFor="bulk-email-override" className="mb-1.5 block text-sm font-semibold text-neutral-900">Override Recipient's Email</label>
            <Input
              id="bulk-email-override"
              type="email"
              value={overrideEmail}
              onChange={(e) => { setOverrideEmail(e.target.value); setOverrideError(''); setTestEnabled(e.target.value.trim() !== ''); }}
              onBlur={() => { if (overrideEmail && !isValidEmail(overrideEmail)) setOverrideError('Enter a valid email address.'); }}
              placeholder="e.g. test@example.com"
            />
            {overrideError && <p className="mt-1 text-xs text-negative-default">{overrideError}</p>}
            {testEnabled && overrideEmail && isValidEmail(overrideEmail) && (
              <p className="mt-1.5 rounded-md border border-warning-subtle bg-accent-100 px-3 py-2 text-xs text-warning-default">All emails will go to {overrideEmail} instead of the {validRecipients.length} {validRecipients.length === 1 ? 'recipient' : 'recipients'}.</p>
            )}
          </div>
          <div>
            <label htmlFor="bulk-email-reply-to" className="mb-1.5 block text-sm font-semibold text-neutral-900">Reply to <span className="text-negative-default">*</span></label>
            <ChipInput id="bulk-email-reply-to" value={replyList} onChange={(v) => setReplyTo(v.join(', '))} placeholder={tenantConfig.replyTo} invalid={replyList.length === 0} />
            {replyList.length === 0 && <p className="mt-1 text-xs text-negative-default">Add at least one reply-to address.</p>}
          </div>
          <div>
            <label htmlFor="bulk-email-cc" className="mb-1.5 block text-sm font-semibold text-neutral-900">CC</label>
            <ChipInput id="bulk-email-cc" value={ccList} onChange={(v) => setCc(v.join(', '))} placeholder="cc@example.com" />
          </div>
          <div>
            <label htmlFor="bulk-email-bcc" className="mb-1.5 block text-sm font-semibold text-neutral-900">BCC</label>
            <ChipInput id="bulk-email-bcc" value={bccList} onChange={(v) => setBcc(v.join(', '))} placeholder="bcc@example.com" />
          </div>
          <EmailUploader
            files={manualFiles}
            onChange={setManualFiles}
            remainingLabel="remaining for attachments in Recipients Tab."
          />
        </section>
      </div>
    </div>
  );

  // ── Step 2: Compose Email ───────────────────────────────────────────────────
  const eLayoutAsWizard = mapStoreLayout(eLayout);
  const fieldsShown = mergeFields.filter((f) => `${f.label} ${f.token}`.toLowerCase().includes(fieldQuery.trim().toLowerCase()));
  const toggleTemplateMode = (scratch: boolean) => {
    setContinueWithoutTemplate(scratch);
    setSelectedTemplate(null);
    setSubject('');
    setBody('');
    setHeaderFooterLayout('none');
    setAtBody(null);
    if (!scratch && audienceTemplates.length > 0) {
      const def = audienceTemplates.find((t) => getTemplateByBulkId(t.id)?.isDefault) ?? audienceTemplates[0];
      handleTemplateSelect(def.id);
    }
  };

  // ── Inline template editing (Add Template / Edit): same page, no pop-up ─────────
  const isStandardEdit = editing === 'edit' && templateRecord?.type === 'Standard';
  const editBodyEmpty = isBodyEmpty(eBody);
  const editValid = eName.trim() !== '' && eSubject.trim() !== '' && !editBodyEmpty;

  function startEditing(mode: 'new' | 'edit') {
    const rec = mode === 'edit' ? templateRecord : undefined;
    setEName(rec ? (rec.type === 'Standard' ? `${rec.name} copy` : rec.name) : '');
    setEDefault(rec && rec.type !== 'Standard' ? rec.isDefault : false);
    setESubject(rec?.subject ?? '');
    setEBody(rec?.body ?? '');
    setELayout(rec?.layout ?? 'own-exxat');
    setEFiles((rec?.attachments ?? []).map((n) => ({ name: n, size: 0 })));
    setAtBody(null);
    setEditing(mode);
  }
  function saveEditing() {
    if (!editValid || !editing) return;
    const attachmentsNames = eFiles.map((f) => f.name);
    let record;
    if (editing === 'edit' && templateRecord && templateRecord.type !== 'Standard') {
      updateTemplate(templateRecord.id, { name: eName.trim(), subject: eSubject, body: eBody, layout: eLayout, attachments: attachmentsNames });
      record = getTemplate(templateRecord.id);
    } else {
      const base = editing === 'edit' ? templateRecord : undefined;
      record = createTemplate({
        portal, group: 'bulk',
        categoryId: base ? base.categoryId : (templateSections[0] ?? 'Schedules'),
        eventId: base ? base.eventId : 'My templates',
        name: eName.trim(), subject: eSubject, body: eBody, attachments: attachmentsNames, layout: eLayout,
        audience: base ? base.audience : (sendAudiences[0] ?? audienceType),
        replyToOverride: base?.replyToOverride ?? null,
      });
    }
    if (record && eDefault) setDefaultTemplate(record.id);
    toast.success(editing === 'edit' && templateRecord?.type !== 'Standard' ? 'Template saved.' : 'Template created.');
    if (record?.bulkId) { handleTemplateSelect(record.bulkId); setContinueWithoutTemplate(false); }
    setEditing(null);
    setAtBody(null);
  }
  function cancelEditing() {
    setEditing(null);
    setAtBody(null);
  }
  // The draft as the first recipient would receive it, in its chosen header and footer.
  const draftRecipient = validRecipients[0];
  const draftRendered = draftRecipient
    ? renderMessage(eSubject, eBody, audienceOf(draftRecipient), { id: draftRecipient.id, name: draftRecipient.name, email: draftRecipient.email, scheduleIds: draftRecipient.scheduleIds }, { portal, mark: true })
    : { subject: eSubject, body: eBody };

  const sheetCompose = (
    <div className="space-y-4">
      <label className={cn('flex w-fit items-center gap-3 text-sm text-neutral-900', editing && 'opacity-60')}>
        Continue without picking a template.
        <Switch checked={continueWithoutTemplate} disabled={!!editing} onCheckedChange={toggleTemplateMode} aria-label="Continue without picking a template" />
      </label>

      {editing && (
        <div className="space-y-2">
          {isStandardEdit && <p className="rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-600">Standard templates can't be changed. Saving creates your own editable copy; the Standard one stays as it is.</p>}
          <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
            <label className="block text-sm font-semibold text-neutral-900">Template Name <span className="text-negative-default">*</span>
              <Input className="mt-1.5 max-w-md font-normal" value={eName} onChange={(e) => setEName(e.target.value)} placeholder="e.g. Rotation reminder" />
            </label>
            <label className="flex items-center gap-2 pb-2 text-sm text-neutral-900">
              <Checkbox checked={eDefault} onCheckedChange={(v) => setEDefault(v === true)} aria-label="Set as Default Template" />
              Set as Default Template
            </label>
          </div>
        </div>
      )}

      {!continueWithoutTemplate && !editing && (
        <div>
          <p className="mb-1.5 text-sm font-semibold text-neutral-900">Pick a template <span className="text-negative-default">*</span></p>
          <div className="flex max-w-md items-center gap-2">
            <Popover open={templateOpen} onOpenChange={setTemplateOpen}>
              <PopoverTrigger asChild>
                <button type="button" aria-label="Pick a template" className="flex h-10 min-w-0 flex-1 items-center justify-between gap-2 rounded-md border border-input bg-card px-3 text-left text-sm text-neutral-900 hover:bg-neutral-50">
                  <span className={cn('truncate', !selectedTemplate && 'text-neutral-600')}>{selectedTemplate ? `${selectedTemplate.name}${templateRecord?.isDefault ? ' (Default)' : ''}` : 'Choose a template…'}</span>
                  <ChevronDown className="size-4 shrink-0 text-neutral-700" aria-hidden />
                </button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-[360px] p-0">
                <div className="max-h-[360px] overflow-y-auto pb-1">
                  {audienceTemplates.length === 0 && <p className="px-3 py-4 text-sm text-neutral-700">No templates for {audienceLabel}. Add one below.</p>}
                  {templateSections.map((sec) => (
                    <div key={sec}>
                      <p className="px-3 pb-1 pt-2.5 text-[11px] font-semibold uppercase tracking-wide text-neutral-700">{sec}</p>
                      {audienceTemplates.filter((t) => t.section === sec).map((t) => (
                        <button key={t.id} type="button" className="flex w-full items-center justify-between gap-3 px-3 py-1.5 text-left text-sm text-neutral-900 hover:bg-neutral-100" onClick={() => { handleTemplateSelect(t.id); setTemplateOpen(false); }}>
                          <span>{t.name}{getTemplateByBulkId(t.id)?.isDefault ? ' (Default)' : ''}</span>
                          <span className="shrink-0 rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-500">{PERSONA_BADGE[t.audienceType] ?? t.audienceType}</span>
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
            {templateIsCustom && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button type="button" aria-label="Delete template" className="flex size-9 shrink-0 items-center justify-center rounded-md text-negative-default hover:bg-negative-subtle" onClick={() => setDeleteOpen(true)}><Trash2 className="size-4" strokeWidth={1.75} /></button>
                </TooltipTrigger>
                <TooltipContent>Delete this template</TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        {!continueWithoutTemplate && !editing ? <Button variant="outline" onClick={() => startEditing('new')}><Plus className="size-4" aria-hidden />Add Template</Button> : <span />}
        {editing ? (
          <div className="flex items-center gap-2">
            <Button disabled={!editValid} onClick={saveEditing}>Save</Button>
            <Button variant="outline" onClick={cancelEditing}>Cancel</Button>
            <Button variant="outline" disabled={editBodyEmpty && eSubject.trim() === ''} onClick={() => setEPreviewOpen(true)}>Preview</Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => goStep(1)}>Previous</Button>
            {!continueWithoutTemplate && selectedTemplate && <Button variant="outline" onClick={() => startEditing('edit')}>Edit</Button>}
            <Button disabled={!sheetStep2Ok} onClick={sheetNext}>Preview</Button>
          </div>
        )}
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
        <section className="min-w-0 rounded-lg border border-neutral-200 bg-card p-4">
          {editing || continueWithoutTemplate ? (
            <div className="space-y-4">
              <div>
                <label htmlFor="bulk-email-subject" className="mb-1.5 block text-sm font-semibold text-neutral-900">Subject <span className="text-negative-default">*</span></label>
                <Input id="bulk-email-subject" value={editing ? eSubject : subject} onChange={(e) => (editing ? setESubject(e.target.value) : setSubject(e.target.value))} placeholder="Email subject" />
                <p className="mt-1 text-xs text-neutral-700">Type "@" in the content to insert merge fields.</p>
              </div>
              <div className="relative">
                <p className="mb-1.5 text-sm font-semibold text-neutral-900">Email Content <span className="text-negative-default">*</span></p>
                <EmailRichTextEditor
                  key={editing ? `edit-${editing}-${selectedTemplate?.id ?? 'new'}` : 'send'}
                  ref={editorRef}
                  value={editing ? eBody : body}
                  onChange={editing ? setEBody : setBody}
                  placeholder="Type email content here!"
                  minHeight={260}
                  onAtQuery={(q, apply) => setAtBody(q === null ? null : { query: q, apply })}
                />
                {atBody && <AtMenu fields={mergeFields} query={atBody.query} onPick={(t) => { atBody.apply(t); setAtBody(null); }} />}
              </div>
            </div>
          ) : selectedTemplate ? (
            <div className="space-y-3 rounded-md bg-neutral-50 p-3">
              <div>
                <p className="mb-1 text-sm font-semibold text-neutral-900">Subject <span className="text-negative-default">*</span></p>
                <p className="rounded-md border border-neutral-200 bg-card px-3 py-2 text-sm text-neutral-900">{pillText(subject)}</p>
              </div>
              <div className="prose prose-sm max-w-none text-sm text-neutral-900" dangerouslySetInnerHTML={{ __html: pillHtml(body) }} />
              <p className="text-xs text-neutral-700">{templateIsCustom ? 'To change this email, use Edit. Edits apply to the template.' : 'Standard templates are read-only. Edit saves your own copy that you can change.'}</p>
            </div>
          ) : (
            <p className="py-10 text-center text-sm text-neutral-700">Pick a template to see it here.</p>
          )}
        </section>

        <aside className="space-y-4">
          <section className="rounded-lg border border-neutral-200 bg-card">
            <div className="border-b border-neutral-200 px-4 py-3">
              <h3 className="text-sm font-semibold text-neutral-900">Merge Fields</h3>
              {mergeFields.length > 8 && <Input className="mt-2 h-8 text-sm" value={fieldQuery} onChange={(e) => setFieldQuery(e.target.value)} placeholder={`Search ${mergeFields.length} fields`} aria-label="Search merge fields" />}
            </div>
            <div className="max-h-[300px] overflow-y-auto py-1">
              {MERGE_FIELD_GROUPS.map((g) => {
                const items = fieldsShown.filter((f) => f.group === g);
                if (items.length === 0) return null;
                return (
                  <div key={g}>
                    <p className="px-4 pb-0.5 pt-2 text-[11px] font-semibold uppercase tracking-wide text-neutral-700">{g}</p>
                    {items.map((f) => (
                      <div key={f.token} className="flex items-center justify-between gap-2 px-4 py-1.5 text-sm text-neutral-900">
                        <button
                          type="button"
                          disabled={!continueWithoutTemplate && !editing}
                          className="min-w-0 truncate text-left enabled:hover:text-blue-500 enabled:hover:underline"
                          onClick={() => editorRef.current?.insertAtCursor(mergeToken(f))}
                        >
                          @{f.label}
                        </button>
                        <Tooltip>
                          <TooltipTrigger asChild><button type="button" aria-label={`About ${f.label}`} className="shrink-0 text-neutral-700 hover:text-neutral-900"><Info className="size-4" strokeWidth={1.75} /></button></TooltipTrigger>
                          <TooltipContent className="max-w-[240px]">{f.description || f.label}</TooltipContent>
                        </Tooltip>
                      </div>
                    ))}
                  </div>
                );
              })}
              {fieldsShown.length === 0 && <p className="px-4 py-4 text-center text-sm text-neutral-700">No field matches.</p>}
            </div>
          </section>

          {(continueWithoutTemplate || editing) && (
            <section className="rounded-lg border border-neutral-200 bg-card p-4">
              <p className="mb-2 text-sm font-semibold text-neutral-900">Header and footer layout</p>
              <div role="radiogroup" aria-label="Header and footer layout" className="space-y-2">
                {(editing
                  ? layoutOptions(portal === 'school' ? 'University' : 'Site').map((o) => ({ value: o.value as string, label: o.label }))
                  : headerFooterOptions(portal === 'school' ? 'University' : 'Site').map((o) => ({ value: o.value as string, label: o.label }))
                ).map((opt) => (
                  <label key={opt.value} className="flex cursor-pointer items-start gap-2 text-sm text-neutral-900">
                    <input
                      type="radio"
                      name="sheet-header-footer"
                      checked={editing ? eLayout === opt.value : headerFooterLayout === opt.value}
                      onChange={() => (editing ? setELayout(opt.value as LayoutId) : setHeaderFooterLayout(opt.value as HeaderFooterLayout))}
                      className="mt-0.5 size-4 shrink-0 accent-blue-500"
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            </section>
          )}

          <section className="rounded-lg border border-neutral-200 bg-card p-4">
            <h3 className="mb-3 text-sm font-semibold text-neutral-900">Attachments</h3>
            {editing ? (
              <EmailUploader files={eFiles} onChange={setEFiles} remainingLabel="remaining for attachments in this template." />
            ) : (
              <>
                {!continueWithoutTemplate && (
                  <div className="mb-4">
                    <p className="flex items-center gap-1.5 text-sm font-medium text-neutral-900"><Paperclip className="size-3.5" aria-hidden />Uploaded files in this template</p>
                    {templateRecord && templateRecord.attachments.length > 0 ? (
                      <ol className="mt-1 list-decimal pl-6 text-sm text-neutral-900">{templateRecord.attachments.map((n) => <li key={n}>{n}</li>)}</ol>
                    ) : (
                      <p className="mt-1 text-sm text-neutral-700">None.</p>
                    )}
                  </div>
                )}
                <EmailUploader files={manualFiles} onChange={setManualFiles} remainingLabel="remaining for attachments in this email." />
              </>
            )}
          </section>
        </aside>
      </div>
    </div>
  );

  const draftPreviewDialog = (
    <Dialog open={ePreviewOpen} onOpenChange={setEPreviewOpen}>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Preview</DialogTitle>
          <DialogDescription>{draftRecipient ? `As ${draftRecipient.name} would receive it. ` : ''}Merged values are highlighted.</DialogDescription>
        </DialogHeader>
        <div className="overflow-hidden rounded-lg border border-neutral-200 bg-card">
          <p className="border-b border-neutral-100 px-5 py-3 text-sm font-semibold text-neutral-900" dangerouslySetInnerHTML={{ __html: highlightMissing(escapeHtml(draftRendered.subject || '(no subject)')) }} />
          <div className="prose prose-sm max-w-none px-5 py-4 text-sm text-neutral-900" dangerouslySetInnerHTML={{ __html: headerFooterFor(eLayoutAsWizard, highlightMissing(draftRendered.body || '<p style="color:#9ca3af">(no content)</p>')) }} />
          <div className="border-t border-neutral-100 bg-neutral-50 px-5 py-3 text-xs leading-relaxed text-neutral-700">{tenantConfig.footer}</div>
        </div>
      </DialogContent>
    </Dialog>
  );

  // ── Step 3: Preview ─────────────────────────────────────────────────────────
  const sendTarget = activeOverride && isValidEmail(activeOverride) ? `the test address (${activeOverride})` : plural(sendRecipients.length, 'recipient', 'recipients');
  const sheetPreviewStep = (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <fieldset>
          <legend className="mb-1.5 text-sm font-semibold text-neutral-900">Select email delivery time</legend>
          <div className="flex flex-wrap items-center gap-5 text-sm text-neutral-900">
            <label className="flex cursor-pointer items-center gap-2"><input type="radio" name="bulk-email-delivery" checked={sendMode === 'now'} onChange={() => { setSendMode('now'); setScheduleError(''); }} className="size-4 accent-blue-500" />Send email now</label>
            <label className="flex cursor-pointer items-center gap-2"><input type="radio" name="bulk-email-delivery" checked={sendMode === 'scheduled'} onChange={() => setSendMode('scheduled')} className="size-4 accent-blue-500" />Send email at specific date and time</label>
          </div>
          {sendMode === 'scheduled' && (
            <div className="mt-3">
              <p className="mb-1 text-xs font-semibold text-neutral-900">Date Time <span className="text-negative-default">*</span></p>
              <div className="flex flex-wrap items-center gap-2">
                <DatePicker value={scheduleDate} onChange={(d) => { setScheduleDate(d); setScheduleError(''); }} />
                <input type="time" value={scheduleTime} onChange={(e) => { setScheduleTime(e.target.value); setScheduleError(''); }} aria-label="Send time" className="h-9 rounded-md border border-input bg-card px-3 text-sm text-neutral-900" />
              </div>
              {(scheduleError || (scheduleDate && scheduleTime && isPastSchedule)) && <p className="mt-1 text-xs text-negative-default">{scheduleError || 'Scheduled time must be in the future.'}</p>}
            </div>
          )}
        </fieldset>
        <div className="flex items-center gap-2">
          <Button variant="outline" disabled={submitting} onClick={() => goStep(2)}>Previous</Button>
          <Button disabled={sheetNextDisabled} onClick={sheetNext}>{submitting ? 'Sending…' : sendMode === 'scheduled' ? 'Schedule' : 'Send'}</Button>
        </div>
      </div>

      {allRecipientsGap.length > 0 && (
        <div className="flex items-start gap-2.5 rounded-md border border-negative-default/40 bg-negative-subtle px-3 py-2.5 text-sm text-negative-default">
          <OctagonAlert className="mt-0.5 size-4 shrink-0" strokeWidth={2} aria-hidden />
          <span>
            {allRecipientsGap.map((t) => `{{${t}}}`).join(', ')} has no value for any recipient. Replace it with your own text in Compose; it can’t be sent as written.{' '}
            <button type="button" className="font-medium underline" onClick={() => goStep(2)}>Fix in Compose</button>
          </span>
        </div>
      )}
      {allRecipientsGap.length === 0 && warnLines.length > 0 && (
        <div className="flex items-start gap-2.5 rounded-md border border-warning-subtle bg-accent-100 px-3 py-2.5 text-sm text-warning-default">
          <TriangleAlert className="mt-0.5 size-4 shrink-0" strokeWidth={2} aria-hidden />
          <div className="min-w-0 flex-1">
            <button type="button" className="inline-flex items-center gap-1 font-medium" onClick={() => setExcludedOpen((o) => !o)}>
              {excludedOpen ? <ChevronDown className="size-3.5" aria-hidden /> : <ChevronRight className="size-3.5" aria-hidden />}
              {excludedCount > 0 ? `${excludedCount} ${excludedCount === 1 ? 'recipient' : 'recipients'} excluded` : 'Some attachments will be skipped'}
            </button>
            {excludedOpen && <ul className="mt-1.5 flex flex-col gap-1">{warnLines.map((l, i) => <li key={i}>{l}</li>)}</ul>}
          </div>
        </div>
      )}

      <section className="overflow-hidden rounded-lg border border-neutral-200 bg-card">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-100 px-5 py-3 text-xs text-neutral-700">
          <span>Will send to {sendTarget}.{ccList.length > 0 && ` CC: ${ccList.join(', ')}.`}{bccList.length > 0 && ` BCC: ${bccList.join(', ')}.`}</span>
          <span className="flex items-center gap-2">
            Previewing as
            <select value={sheetPreviewAs?.id ?? ''} onChange={(e) => setPreviewAsId(e.target.value)} aria-label="Preview as recipient" className="h-8 max-w-[220px] rounded-md border border-input bg-card px-2 text-sm text-neutral-900">
              {effectiveRecipients.map((r) => <option key={r.id} value={r.id}>{r.name}{gapIds.has(r.id) ? ' — missing data' : ''}</option>)}
            </select>
          </span>
        </div>
        <div className="px-5 py-4">
          {subject
            ? <p className="text-sm font-semibold text-neutral-900" dangerouslySetInnerHTML={{ __html: highlightMissing(escapeHtml(sheetPreview.subject)) }} />
            : <p className="text-sm text-neutral-600">(no subject)</p>}
          <div className="mt-3 flex items-start gap-3">
            {tenantConfig.logoDataUrl
              ? <img src={tenantConfig.logoDataUrl} alt="" className="size-10 shrink-0 rounded-full object-contain" />
              : <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-semibold text-blue-500" aria-hidden>{tenantConfig.displayName.slice(0, 1)}</span>}
            <div className="min-w-0 text-sm">
              <p className="font-medium text-neutral-900">{tenantConfig.displayName}</p>
              <p className="truncate text-xs text-neutral-700">to {sheetPreviewAs?.email ?? '—'}</p>
              <p className="truncate text-xs text-neutral-700">from: noreply@exxat.com · reply-to: {replyTo || '—'}</p>
            </div>
          </div>
          <hr className="my-4 border-neutral-200" />
          <div className="prose prose-sm max-w-none text-sm text-neutral-900" dangerouslySetInnerHTML={{ __html: body ? withHeaderFooter(highlightMissing(sheetPreview.body)) : '<p style="color:#9ca3af">(no body composed)</p>' }} />
        </div>
        {(attachments.length > 0 || (templateRecord && templateRecord.attachments.length > 0 && !continueWithoutTemplate)) && (
          <div className="border-t border-neutral-100 px-5 py-3">
            <p className="mb-1.5 text-xs text-neutral-700">Attachments</p>
            <div className="flex flex-wrap gap-2">
              {[...(continueWithoutTemplate ? [] : (templateRecord?.attachments ?? []).map((n) => ({ name: n, note: 'template' }))), ...attachments.map((a) => ({ name: a.name, note: a.source === 'dynamic' ? 'Generated' : formatFileSize(a.size ?? 0) }))].map((f, i) => (
                <span key={i} className="inline-flex items-center gap-1.5 rounded-md border border-neutral-200 bg-neutral-50 px-2.5 py-1.5 text-xs text-neutral-900"><Paperclip className="size-3" aria-hidden />{f.name}<span className="text-neutral-700">{f.note}</span></span>
              ))}
            </div>
          </div>
        )}
        <div className="border-t border-neutral-100 bg-neutral-50 px-5 py-3 text-xs leading-relaxed text-neutral-700">{tenantConfig.footer}</div>
        {sheetPreviewAs && gapIds.has(sheetPreviewAs.id) && <p className="px-5 pb-3 text-xs font-medium text-negative-default">This recipient will be excluded — highlighted fields have no value on their record.</p>}
      </section>
    </div>
  );

  const confirmDialog = (
    <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm bulk email</AlertDialogTitle>
          <AlertDialogDescription>
            You are about to email <strong>{sendRecipients.length} recipients</strong>. This action cannot be undone.
          </AlertDialogDescription>
          {hasExclusionNotes && <div className="pt-1">{renderExclusionNotes(false)}</div>}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={executeSend}>Confirm — Send to {sendRecipients.length}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  const deleteDialog = (
    <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this template?</AlertDialogTitle>
          <AlertDialogDescription>“{selectedTemplate?.name}” will be removed for everyone. This cannot be undone.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              const rec = selectedTemplate ? getTemplateByBulkId(selectedTemplate.id) : undefined;
              const blocked = rec ? deleteBlockedReason(rec) : null;
              if (rec && !blocked) {
                deleteTemplate(rec.id);
                toast.success('Template deleted.');
                setSelectedTemplate(null);
                setSubject('');
                setBody('');
                const next = audienceTemplates.find((t) => t.id !== selectedTemplate?.id);
                if (next) handleTemplateSelect(next.id);
              } else if (blocked) toast.error(blocked);
              setDeleteOpen(false);
            }}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  if (layout === 'sheet') {
    return (
      <>
        <Sheet open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
          <SheetContent side="right" className="flex h-full w-[min(96vw,980px)] max-w-none flex-col gap-0 bg-neutral-50 p-0 sm:max-w-none [&>button]:hidden" onInteractOutside={(e) => e.preventDefault()}>
            <SheetTitle className="sr-only">Compose Email</SheetTitle>
            <div className="flex shrink-0 items-center gap-2 border-b border-neutral-200 bg-card px-4 py-3">
              <button type="button" onClick={onClose} aria-label="Close — discard draft" className="flex size-8 items-center justify-center rounded-md bg-blue-50 text-blue-500 hover:bg-blue-100"><X className="size-4" strokeWidth={2} /></button>
              <h2 className="min-w-0 flex-1 truncate text-base font-semibold text-neutral-900">Compose Email</h2>
              {selectionSummary && <span className="hidden text-xs text-neutral-700 sm:block">{selectionSummary}</span>}
            </div>
            <div className="shrink-0 border-b border-neutral-200 bg-card px-4 py-3">{sheetStepper}</div>
            <div className="min-h-0 flex-1 overflow-y-auto p-4">
              {step === 1 && sheetStep1}
              {step === 2 && sheetCompose}
              {step === 3 && sheetPreviewStep}
            </div>
          </SheetContent>
        </Sheet>
        {draftPreviewDialog}
        {deleteDialog}
        {confirmDialog}
      </>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      <Drawer
        open={open}
        onOpenChange={(v) => {
          if (!v) onClose();
        }}
        direction="bottom"
        dismissible={false}
      >
        <DrawerContent
          style={{
            marginTop: 0,
            height: '100dvh',
            maxHeight: '100dvh',
            borderTopLeftRadius: 0,
            borderTopRightRadius: 0,
          }}
          className="flex flex-col overflow-hidden [&>div:first-child]:hidden"
        >
          {/* Sticky header */}
          <DrawerHeader className="flex-shrink-0 border-b border-neutral-200 px-6 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-5">
                <h2 className="text-base font-semibold text-neutral-900">
                  Bulk Email
                </h2>
                {/* Step breadcrumb */}
                <div className="flex items-center gap-1">
                  {STEP_LABELS.map((label, i) => {
                    const num = (i + 1) as 1 | 2 | 3;
                    const isActive = step === num;
                    const isDone = step > num;
                    return (
                      <div key={i} className="flex items-center">
                        <div
                          className={cn(
                            'flex items-center justify-center w-5 h-5 rounded-full text-[11px] font-medium',
                            isDone || isActive
                              ? 'bg-blue-500 text-white'
                              : 'bg-neutral-200 text-neutral-600',
                          )}
                        >
                          {isDone ? (
                            <FontAwesomeIcon name="check" className="w-2.5 h-2.5" />
                          ) : (
                            num
                          )}
                        </div>
                        <span
                          className={cn(
                            'ml-1.5 text-sm ',
                            isActive ? 'text-neutral-900 font-medium' : 'text-neutral-600',
                          )}
                        >
                          {label}
                        </span>
                        {i < 2 && (
                          <FontAwesomeIcon
                            name="chevronRight"
                            className="w-3 h-3 text-neutral-400 mx-2"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-neutral-600 hover:text-neutral-700 transition-colors"
                aria-label="Close — discard draft"
              >
                <FontAwesomeIcon name="xmark" className="w-5 h-5" />
              </button>
            </div>
          </DrawerHeader>

          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto min-h-0">
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
          </div>

          {/* Sticky footer */}
          <DrawerFooter className="flex-shrink-0 border-t border-neutral-200 px-6 py-4">
            <div className="flex items-center justify-between gap-4">
              <button
                onClick={onClose}
                className="text-sm text-neutral-600 hover:text-neutral-700 transition-colors flex-shrink-0"
              >
                Cancel — discard draft
              </button>

              {/* Center: scheduling controls — inline in the footer bar, Step 3 only */}
              {step === 3 && (
                <div className="flex items-center gap-4 flex-1 justify-center flex-wrap">
                  <span className="text-sm font-medium text-neutral-800 whitespace-nowrap">
                    Select email delivery time
                  </span>

                  {/* Radio: Send now */}
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="sendMode"
                      checked={sendMode === 'now'}
                      onChange={() => { setSendMode('now'); setScheduleError(''); }}
                      className="h-4 w-4 accent-blue-500 cursor-pointer"
                    />
                    <span className="text-sm text-neutral-800 whitespace-nowrap">
                      Send email now
                    </span>
                  </label>

                  {/* Radio: Schedule */}
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="sendMode"
                      checked={sendMode === 'scheduled'}
                      onChange={() => setSendMode('scheduled')}
                      className="h-4 w-4 accent-blue-500 cursor-pointer"
                    />
                    <span className="text-sm text-neutral-800 whitespace-nowrap">
                      Send email at specific date and time
                    </span>
                  </label>

                  {/* Inline date+time — appear only when scheduled is chosen */}
                  {sendMode === 'scheduled' && (
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <DatePicker
                          value={scheduleDate}
                          onChange={(d) => { setScheduleDate(d); setScheduleError(''); }}
                        />
                        <input
                          type="time"
                          value={scheduleTime}
                          onChange={(e) => { setScheduleTime(e.target.value); setScheduleError(''); }}
                          className="border border-input rounded-md px-3 py-2 text-sm bg-card h-9"
                        />
                      </div>
                      {(scheduleError || (scheduleDate && scheduleTime && isPastSchedule)) && (
                        <p className="text-xs text-negative-default">
                          {scheduleError || 'Scheduled time must be in the future.'}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center gap-2 flex-shrink-0">
                {step > 1 && (
                  <Button
                    variant="outline"
                    onClick={() => setStep((prev) => (prev - 1) as 1 | 2 | 3)}
                    disabled={submitting}
                  >
                    Back
                  </Button>
                )}
                {step < 3 && (
                  <Button
                    onClick={() => setStep((prev) => (prev + 1) as 1 | 2 | 3)}
                    disabled={
                      (step === 1 && !isStep1NextEnabled) || (step === 2 && !isStep2NextEnabled)
                    }
                    className="bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Next
                    <FontAwesomeIcon name="chevronRight" className="w-4 h-4 ml-1" />
                  </Button>
                )}
                {step === 3 && (
                  <Button
                    onClick={handleSubmitIntent}
                    disabled={!isStep3SubmitEnabled}
                    className="bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-40 disabled:cursor-not-allowed gap-1.5"
                  >
                    {submitting ? (
                      <>
                        <FontAwesomeIcon name="spinner" spin className="w-4 h-4" />
                        {mode === 'edit-scheduled' ? 'Updating…' : 'Sending…'}
                      </>
                    ) : mode === 'edit-scheduled' ? (
                      <>
                        <FontAwesomeIcon name="check" className="w-4 h-4" />
                        Update Schedule
                      </>
                    ) : sendMode === 'scheduled' ? (
                      <>
                        <FontAwesomeIcon name="clock" className="w-4 h-4" />
                        Schedule
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon name="paperPlane" className="w-4 h-4" />
                        Send
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* 25+ recipient confirmation interstitial */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm bulk email</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to email{' '}
              <strong>{sendRecipients.length} recipients</strong>. This action
              cannot be undone.
            </AlertDialogDescription>
            {hasExclusionNotes && <div className="pt-1">{renderExclusionNotes(false)}</div>}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={executeSend}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              Confirm — Send to {sendRecipients.length}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
