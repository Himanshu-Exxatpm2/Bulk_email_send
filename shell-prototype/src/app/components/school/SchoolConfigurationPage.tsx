import { mergeFieldsFor } from '../../data/mergeFieldCatalog';
import { MergeFieldList } from '../email/MergeFieldList';
import { useRef, useState } from 'react';
import { XIcon, PlusIcon, PaperclipIcon, EyeIcon, CopyIcon, PencilIcon, Trash2Icon, ChevronDownIcon } from 'lucide-react';
import { tenantEmailConfig } from '../../data/tenantEmailConfig';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Separator } from '../ui/separator';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '../ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from '../ui/alert-dialog';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { PageHeader } from '../PageHeader';
import { EmailRichTextEditor, EmailRichTextEditorHandle } from '../email/EmailRichTextEditor';
import { mockEmailTemplates, EmailTemplate, AudienceType, SchoolSection } from '../../data/mockEmailTemplates';

// ── School sections — locked to 3 (no Jobs, no site-only sections) ────────────
const SCHOOL_SECTIONS: SchoolSection[] = ['Requests', 'Schedules & Onboarding', 'General'];

// ── Audience types relevant to school coordinators ────────────────────────────
const SCHOOL_AUDIENCE_TYPES: AudienceType[] = ['Student', 'School Contact'];

const AUDIENCE_COLORS: Record<AudienceType, string> = {
  Student: 'bg-blue-100 text-blue-800',
  'School Contact': 'bg-purple-100 text-purple-800',
  'Partner Contact': 'bg-informative-surface text-informative-default',
  'Staff-Personnel': 'bg-accent-100 text-warning-default',
  Candidate: 'bg-positive-default/10 text-positive-default',
  Preceptor: 'bg-blue-100 text-blue-800',
  'Placement Faculty/CI': 'bg-negative-default/10 text-negative-default',
};

// ── Merge fields — school-relevant audience types only ────────────────────────
// ── Email Setup state ─────────────────────────────────────────────────────────
interface SetupState {
  displayName: string;
  replyTos: string[];
  replyToInput: string;
  replyToError: string;
  logoFile: File | null;
  logoPreview: string | null;
  logoError: string;
  footer: string;
}

// ── Template editor state ─────────────────────────────────────────────────────
interface TemplateEditorState {
  id: string;
  section: SchoolSection;
  category: string;
  name: string;
  subject: string;
  body: string;
  attachments: string[];
  attachmentInput: string;
  replyToOverride: string;
  audienceType: AudienceType;
}

function blankEditor(overrides?: Partial<TemplateEditorState>): TemplateEditorState {
  return {
    id: '',
    section: 'General',
    category: '',
    name: '',
    subject: '',
    body: '',
    attachments: [],
    attachmentInput: '',
    replyToOverride: '',
    audienceType: 'Student',
    ...overrides,
  };
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

// ── Multi-chip input (reused verbatim from EmailConfigurationPage pattern) ─────
function ChipInput({
  chips, input, error, placeholder, onInputChange, onAdd, onRemove,
}: {
  chips: string[];
  input: string;
  error: string;
  placeholder: string;
  onInputChange: (v: string) => void;
  onAdd: () => void;
  onRemove: (i: number) => void;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex flex-wrap gap-1.5 p-2 min-h-[2.5rem] rounded-md border border-input bg-input-background focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50 transition-[color,box-shadow]">
        {chips.map((chip, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-1 rounded bg-blue-500/10 text-blue-500 text-xs font-medium px-2 py-0.5"
          >
            {chip}
            <button type="button" onClick={() => onRemove(i)} className="hover:text-negative-default transition-colors" aria-label={`Remove ${chip}`}>
              <XIcon className="size-3" />
            </button>
          </span>
        ))}
        <input
          className="flex-1 min-w-[180px] text-sm outline-none bg-transparent placeholder:text-muted-foreground"
          value={input}
          placeholder={chips.length === 0 ? placeholder : 'Add another…'}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ',' || e.key === 'Tab') {
              e.preventDefault();
              onAdd();
            }
            if (e.key === 'Backspace' && input === '' && chips.length > 0) {
              onRemove(chips.length - 1);
            }
          }}
        />
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
      <p className="text-xs text-muted-foreground">Press Enter or comma to add</p>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
// onlyTab renders a single section on its own (used by the Notification area's Email Setup and Attachment Templates pages).
export function SchoolConfigurationPage({ onlyTab }: { onlyTab?: 'setup' | 'templates' | 'attachment-templates' } = {}) {
  // Setup tab
  const [setup, setSetup] = useState<SetupState>({
    displayName: 'Bowie State University Clinical Placement Office',
    replyTos: ['clinicalplacements@bowiestate.edu'],
    replyToInput: '',
    replyToError: '',
    logoFile: null,
    logoPreview: null,
    logoError: '',
    footer: 'This email was sent by Bowie State University Clinical Placement Office via Exxat One. For questions, contact clinicalplacements@bowiestate.edu.',
  });
  const [setupSaved, setSetupSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Templates tab — school portal only
  const [templates, setTemplates] = useState<EmailTemplate[]>(
    mockEmailTemplates.filter((t) => t.portal === 'school')
  );
  const [sectionFilter, setSectionFilter] = useState<SchoolSection | 'All'>('All');
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorMode, setEditorMode] = useState<'create' | 'edit'>('create');
  const [editorState, setEditorState] = useState<TemplateEditorState>(blankEditor());
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [mergeFieldOpen, setMergeFieldOpen] = useState(false);
  const editorRef = useRef<EmailRichTextEditorHandle>(null);

  // ── Setup handlers ──────────────────────────────────────────────────────────
  function addReplyTo() {
    const email = setup.replyToInput.trim().replace(/,$/, '');
    if (!email) return;
    if (!isValidEmail(email)) {
      setSetup((s) => ({ ...s, replyToError: 'Enter a valid email address.' }));
      return;
    }
    if (setup.replyTos.includes(email)) {
      setSetup((s) => ({ ...s, replyToError: 'This address is already added.', replyToInput: '' }));
      return;
    }
    setSetup((s) => ({ ...s, replyTos: [...s.replyTos, email], replyToInput: '', replyToError: '' }));
  }

  function removeReplyTo(i: number) {
    setSetup((s) => ({ ...s, replyTos: s.replyTos.filter((_, idx) => idx !== i) }));
  }

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowed = ['image/png', 'image/jpeg', 'image/svg+xml'];
    if (!allowed.includes(file.type)) {
      setSetup((s) => ({ ...s, logoError: 'Only PNG, JPG, or SVG files are allowed.', logoFile: null, logoPreview: null }));
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setSetup((s) => ({ ...s, logoError: 'File exceeds the 2 MB limit.', logoFile: null, logoPreview: null }));
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }
    const preview = URL.createObjectURL(file);
    setSetup((s) => ({ ...s, logoFile: file, logoPreview: preview, logoError: '' }));
  }

  function handleSetupSave() {
    // Persist to shared singleton so ComposeEmailWizard Preview reads live values
    tenantEmailConfig.school.displayName = setup.displayName;
    tenantEmailConfig.school.logoDataUrl = setup.logoPreview;
    tenantEmailConfig.school.footer = setup.footer;
    if (setup.replyTos.length > 0) {
      tenantEmailConfig.school.replyTo = setup.replyTos[0];
    }
    setSetupSaved(true);
    setTimeout(() => setSetupSaved(false), 2500);
  }

  // ── Template handlers ───────────────────────────────────────────────────────
  function openCreate() {
    setEditorState(blankEditor());
    setEditorMode('create');
    setEditorOpen(true);
  }

  function openEdit(t: EmailTemplate) {
    setEditorState({
      id: t.id,
      section: t.section as SchoolSection,
      category: t.category,
      name: t.name,
      subject: t.subject,
      body: t.body,
      attachments: [...t.attachments],
      attachmentInput: '',
      replyToOverride: t.replyToOverride ?? '',
      audienceType: t.audienceType,
    });
    setEditorMode('edit');
    setEditorOpen(true);
  }

  function openClone(t: EmailTemplate) {
    setEditorState({
      id: '',
      section: t.section as SchoolSection,
      category: t.category,
      name: `${t.name} (Copy)`,
      subject: t.subject,
      body: t.body,
      attachments: [...t.attachments],
      attachmentInput: '',
      replyToOverride: t.replyToOverride ?? '',
      audienceType: t.audienceType,
    });
    setEditorMode('create');
    setEditorOpen(true);
  }

  function saveTemplate() {
    const tpl: EmailTemplate = {
      id: editorState.id || `tmpl-school-custom-${Date.now()}`,
      portal: 'school',
      section: editorState.section,
      category: editorState.category,
      name: editorState.name,
      subject: editorState.subject,
      body: editorState.body,
      attachments: editorState.attachments,
      replyToOverride: editorState.replyToOverride || null,
      audienceType: editorState.audienceType,
    };
    if (editorMode === 'edit') {
      setTemplates((prev) => prev.map((t) => (t.id === tpl.id ? tpl : t)));
    } else {
      setTemplates((prev) => [...prev, tpl]);
    }
    setEditorOpen(false);
  }

  function deleteTemplate() {
    if (!deleteId) return;
    setTemplates((prev) => prev.filter((t) => t.id !== deleteId));
    setDeleteId(null);
  }

  function addAttachment() {
    const name = editorState.attachmentInput.trim();
    if (!name) return;
    setEditorState((s) => ({ ...s, attachments: [...s.attachments, name], attachmentInput: '' }));
  }

  function insertMergeField(token: string) {
    setMergeFieldOpen(false);
    editorRef.current?.insertAtCursor(' ' + token + ' ');
    editorRef.current?.focus();
  }

  // ── Grouped template list ───────────────────────────────────────────────────
  const visibleTemplates = sectionFilter === 'All'
    ? templates
    : templates.filter((t) => t.section === sectionFilter);

  const grouped: Record<string, Record<string, EmailTemplate[]>> = {};
  for (const t of visibleTemplates) {
    if (!grouped[t.section]) grouped[t.section] = {};
    if (!grouped[t.section][t.category]) grouped[t.section][t.category] = [];
    grouped[t.section][t.category].push(t);
  }
  const sectionOrder = SCHOOL_SECTIONS.filter((s) => grouped[s]);

  return (
    <div className="h-full flex flex-col">
      {!onlyTab && (
        <PageHeader
        icon="envelope"
        title="School Configuration"
        description="Configure email settings and manage notification templates for Bowie State University"
      />
      )}

      <div className="flex-1 overflow-y-auto p-6">
        <Tabs defaultValue={onlyTab ?? 'setup'} className="space-y-0">
          <TabsList className={onlyTab ? 'hidden' : 'mb-6'}>
            <TabsTrigger value="setup">Email Setup</TabsTrigger>
            <TabsTrigger value="templates">Email Templates</TabsTrigger>
          </TabsList>

          {/* ── Tab 1: Email Setup ─────────────────────────────────────────── */}
          <TabsContent value="setup">
            <div className="max-w-2xl space-y-8">

              <section className="space-y-4">
                <div>
                  <h2 className="text-base font-semibold text-neutral-900">Email Display Name</h2>
                  <p className="text-sm text-neutral-600 mt-0.5">The "From" name recipients see in their inbox.</p>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input
                    id="displayName"
                    value={setup.displayName}
                    onChange={(e) => setSetup((s) => ({ ...s, displayName: e.target.value }))}
                    placeholder="e.g. Bowie State University Clinical Placement Office"
                    className="max-w-md"
                  />
                </div>
              </section>

              <Separator />

              <section className="space-y-4">
                <div>
                  <h2 className="text-base font-semibold text-neutral-900">Default Reply-To</h2>
                  <p className="text-sm text-neutral-600 mt-0.5">
                    School-wide fallback. Individual templates can override this.
                  </p>
                </div>
                <ChipInput
                  chips={setup.replyTos}
                  input={setup.replyToInput}
                  error={setup.replyToError}
                  placeholder="reply-to@yourdomain.edu"
                  onInputChange={(v) => setSetup((s) => ({ ...s, replyToInput: v, replyToError: '' }))}
                  onAdd={addReplyTo}
                  onRemove={removeReplyTo}
                />
              </section>

              <Separator />

              <section className="space-y-4">
                <div>
                  <h2 className="text-base font-semibold text-neutral-900">School Branding</h2>
                  <p className="text-sm text-neutral-600 mt-0.5">Logo appears in the email header. Footer text is appended to every outgoing email.</p>
                </div>

                <div className="space-y-2">
                  <Label>School Logo</Label>
                  <div
                    className="border-2 border-dashed border-neutral-200 rounded-lg p-6 flex flex-col items-center gap-3 cursor-pointer hover:border-purple-700/40 hover:bg-purple-700/5 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const file = e.dataTransfer.files?.[0];
                      if (file) {
                        const synth = { target: { files: [file] } } as unknown as React.ChangeEvent<HTMLInputElement>;
                        handleLogoChange(synth);
                      }
                    }}
                  >
                    {setup.logoPreview ? (
                      <img src={setup.logoPreview} alt="School logo preview" className="max-h-16 max-w-[200px] object-contain" />
                    ) : (
                      <>
                        <div className="w-10 h-10 rounded-full bg-[var(--bg-container)] flex items-center justify-center">
                          <PlusIcon className="size-5 text-neutral-600" />
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-medium text-neutral-800">Click to upload or drag & drop</p>
                          <p className="text-xs text-muted-foreground mt-0.5">PNG, JPG, SVG · Max 2 MB</p>
                        </div>
                      </>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".png,.jpg,.jpeg,.svg,image/png,image/jpeg,image/svg+xml"
                    className="hidden"
                    onChange={handleLogoChange}
                  />
                  {setup.logoError && (
                    <p className="text-sm text-destructive flex items-center gap-1.5">
                      <XIcon className="size-3.5 flex-shrink-0" />
                      {setup.logoError}
                    </p>
                  )}
                  {setup.logoFile && !setup.logoError && (
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-muted-foreground">
                        {setup.logoFile.name} · {(setup.logoFile.size / 1024).toFixed(0)} KB
                      </p>
                      <button
                        type="button"
                        className="text-xs text-destructive hover:underline"
                        onClick={() => {
                          setSetup((s) => ({ ...s, logoFile: null, logoPreview: null, logoError: '' }));
                          if (fileInputRef.current) fileInputRef.current.value = '';
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="footer">Footer / Disclaimer</Label>
                  <Textarea
                    id="footer"
                    value={setup.footer}
                    onChange={(e) => setSetup((s) => ({ ...s, footer: e.target.value }))}
                    placeholder="Standard footer text appended to every email…"
                    className="min-h-[100px]"
                  />
                  <p className="text-xs text-muted-foreground">{setup.footer.length} characters</p>
                </div>
              </section>

              <div className="flex items-center gap-3 pt-2">
                <Button
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                  onClick={handleSetupSave}
                >
                  Save Settings
                </Button>
                {setupSaved && (
                  <span className="text-sm text-positive-default font-medium">Settings saved.</span>
                )}
              </div>
            </div>
          </TabsContent>

          {/* ── Tab 2: Email Templates ─────────────────────────────────────── */}
          <TabsContent value="templates">
            <div className="space-y-4">
              {/* Toolbar */}
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-neutral-700">Section:</span>
                  {(['All', ...SCHOOL_SECTIONS] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSectionFilter(s as SchoolSection | 'All')}
                      className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                        sectionFilter === s
                          ? 'bg-blue-500 text-white'
                          : 'bg-[var(--bg-container)] text-neutral-700 hover:bg-neutral-200'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                <Button
                  size="sm"
                  className="bg-blue-500 hover:bg-blue-600 text-white gap-1.5"
                  onClick={openCreate}
                >
                  <PlusIcon className="size-4" />
                  Create Template
                </Button>
              </div>

              {/* Template list */}
              {sectionOrder.length === 0 && (
                <div className="text-center py-16 text-muted-foreground text-sm">
                  No templates found for this section.
                </div>
              )}

              <div className="space-y-6">
                {sectionOrder.map((section) => (
                  <div key={section} className="bg-card border border-neutral-200 rounded-lg overflow-hidden">
                    <div className="px-4 py-3 bg-neutral-50 border-b border-neutral-200 flex items-center gap-2">
                      <span className="text-sm font-semibold text-neutral-800">{section}</span>
                      <span className="text-xs text-muted-foreground">
                        ({templates.filter((t) => t.section === section).length} templates)
                      </span>
                    </div>

                    {Object.entries(grouped[section]).map(([category, catTemplates]) => (
                      <div key={category}>
                        <div className="px-4 py-2 bg-card border-b border-neutral-100">
                          <span className="text-xs font-bold text-neutral-900 uppercase tracking-wider">{category}</span>
                        </div>

                        {catTemplates.map((tpl, idx) => (
                          <div
                            key={tpl.id}
                            className={`px-4 py-3 flex items-center gap-3 ${
                              idx < catTemplates.length - 1 ? 'border-b border-neutral-100' : ''
                            } hover:bg-neutral-50 transition-colors`}
                          >
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-neutral-900 truncate">{tpl.name}</p>
                              <p className="text-xs text-muted-foreground truncate mt-0.5">{tpl.subject}</p>
                            </div>
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${AUDIENCE_COLORS[tpl.audienceType]}`}>
                              {tpl.audienceType}
                            </span>
                            {tpl.attachments.length > 0 && (
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <PaperclipIcon className="size-3" />
                                {tpl.attachments.length}
                              </span>
                            )}
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <Button variant="ghost" size="icon" className="size-8 text-neutral-600 hover:text-blue-500" title="Preview" onClick={() => setPreviewTemplate(tpl)}>
                                <EyeIcon className="size-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="size-8 text-neutral-600 hover:text-blue-500" title="Edit" onClick={() => openEdit(tpl)}>
                                <PencilIcon className="size-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="size-8 text-neutral-600 hover:text-blue-500" title="Clone" onClick={() => openClone(tpl)}>
                                <CopyIcon className="size-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="size-8 text-neutral-600 hover:text-destructive" title="Delete" onClick={() => setDeleteId(tpl.id)}>
                                <Trash2Icon className="size-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* ── Template Editor Sheet ─────────────────────────────────────────────── */}
      <Sheet open={editorOpen} onOpenChange={setEditorOpen}>
        <SheetContent side="right" className="w-full sm:max-w-2xl flex flex-col p-0 gap-0 overflow-hidden">
          <SheetHeader className="px-6 py-4 border-b border-neutral-200 flex-shrink-0">
            <SheetTitle>{editorMode === 'create' ? 'Create Template' : 'Edit Template'}</SheetTitle>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
            {/* Row 1: Audience Type + Section */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="ed-audience">Audience Type</Label>
                <Select
                  value={editorState.audienceType}
                  onValueChange={(v) => setEditorState((s) => ({ ...s, audienceType: v as AudienceType }))}
                >
                  <SelectTrigger id="ed-audience"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {SCHOOL_AUDIENCE_TYPES.map((a) => (
                      <SelectItem key={a} value={a}>{a}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ed-section">Section</Label>
                <Select
                  value={editorState.section}
                  onValueChange={(v) => setEditorState((s) => ({ ...s, section: v as SchoolSection }))}
                >
                  <SelectTrigger id="ed-section"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {SCHOOL_SECTIONS.map((sec) => (
                      <SelectItem key={sec} value={sec}>{sec}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Row 2: Category + Template Name */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="ed-category">Category</Label>
                <Input
                  id="ed-category"
                  value={editorState.category}
                  onChange={(e) => setEditorState((s) => ({ ...s, category: e.target.value }))}
                  placeholder="e.g. Approval, Reminder…"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ed-name">Template Name</Label>
                <Input
                  id="ed-name"
                  value={editorState.name}
                  onChange={(e) => setEditorState((s) => ({ ...s, name: e.target.value }))}
                  placeholder="e.g. Request Submitted"
                />
              </div>
            </div>

            {/* Subject */}
            <div className="space-y-1.5">
              <Label htmlFor="ed-subject">Subject</Label>
              <Input
                id="ed-subject"
                value={editorState.subject}
                onChange={(e) => setEditorState((s) => ({ ...s, subject: e.target.value }))}
                placeholder="Email subject line…"
              />
            </div>

            {/* Body + Merge Field Picker */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label>Body</Label>
                <Popover open={mergeFieldOpen} onOpenChange={setMergeFieldOpen}>
                  <PopoverTrigger asChild>
                    <Button type="button" variant="outline" size="sm" className="h-7 text-xs gap-1">
                      <span className="text-blue-500 font-mono">&#123;&#123;&#125;&#125;</span>
                      Insert field
                      <ChevronDownIcon className="size-3 text-muted-foreground" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="end" className="w-80 p-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1 mb-1.5">
                      {editorState.audienceType} fields
                    </p>
                    <MergeFieldList fields={mergeFieldsFor(editorState.audienceType, 'school')} onInsert={insertMergeField} />
                  </PopoverContent>
                </Popover>
              </div>
              <EmailRichTextEditor
                ref={editorRef}
                value={editorState.body}
                onChange={(v) => setEditorState((s) => ({ ...s, body: v }))}
                minHeight={240}
              />
            </div>

            {/* Attachments */}
            <div className="space-y-1.5">
              <Label>Attachments</Label>
              <div className="flex gap-2">
                <div className="flex-1 flex flex-wrap gap-1.5 p-2 min-h-[2.5rem] rounded-md border border-input bg-input-background focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50 transition-[color,box-shadow]">
                  {editorState.attachments.map((name, i) => (
                    <span key={i} className="inline-flex items-center gap-1 rounded bg-[var(--bg-container)] text-neutral-800 text-xs font-medium px-2 py-0.5">
                      <PaperclipIcon className="size-3" />
                      {name}
                      <button
                        type="button"
                        onClick={() => setEditorState((s) => ({ ...s, attachments: s.attachments.filter((_, idx) => idx !== i) }))}
                        className="hover:text-destructive transition-colors"
                        aria-label={`Remove ${name}`}
                      >
                        <XIcon className="size-3" />
                      </button>
                    </span>
                  ))}
                  <input
                    className="flex-1 min-w-[140px] text-sm outline-none bg-transparent placeholder:text-muted-foreground"
                    value={editorState.attachmentInput}
                    placeholder={editorState.attachments.length === 0 ? 'e.g. Checklist.pdf' : 'Add another…'}
                    onChange={(e) => setEditorState((s) => ({ ...s, attachmentInput: e.target.value }))}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ',') {
                        e.preventDefault();
                        addAttachment();
                      }
                    }}
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">Filename labels only — no actual upload here.</p>
            </div>

            {/* Reply-To Override */}
            <div className="space-y-1.5">
              <Label htmlFor="ed-replyto">Reply-To Override (optional)</Label>
              <Input
                id="ed-replyto"
                value={editorState.replyToOverride}
                onChange={(e) => setEditorState((s) => ({ ...s, replyToOverride: e.target.value }))}
                placeholder="Leave blank to use the school default"
                type="email"
              />
              <p className="text-xs text-muted-foreground">
                Overrides the school Reply-To for this template only. School default:&nbsp;
                <span className="font-mono">{setup.replyTos[0] ?? '(none set)'}</span>
              </p>
            </div>
          </div>

          <SheetFooter className="px-6 py-4 border-t border-neutral-200 flex-shrink-0 flex-row justify-end gap-2">
            <Button variant="outline" onClick={() => setEditorOpen(false)}>Cancel</Button>
            <Button
              className="bg-blue-500 hover:bg-blue-600 text-white"
              onClick={saveTemplate}
              disabled={!editorState.name.trim() || !editorState.subject.trim()}
            >
              {editorMode === 'create' ? 'Create Template' : 'Save Changes'}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* ── Preview Dialog ────────────────────────────────────────────────────── */}
      <Dialog open={!!previewTemplate} onOpenChange={(open) => !open && setPreviewTemplate(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="flex items-center gap-2">
              <EyeIcon className="size-4 text-muted-foreground" />
              Template Preview
            </DialogTitle>
          </DialogHeader>
          {previewTemplate && (
            <div className="flex-1 overflow-y-auto space-y-4">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Subject</p>
                <p className="text-sm font-medium text-neutral-900 border rounded-md p-2.5 bg-neutral-50">
                  {previewTemplate.subject}
                </p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Body</p>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${AUDIENCE_COLORS[previewTemplate.audienceType]}`}>
                    {previewTemplate.audienceType}
                  </span>
                </div>
                <div
                  className="prose prose-sm max-w-none border rounded-md p-4 bg-card text-sm text-neutral-800 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: previewTemplate.body }}
                />
              </div>
              {previewTemplate.attachments.length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Attachments</p>
                  <div className="flex flex-wrap gap-1.5">
                    {previewTemplate.attachments.map((a) => (
                      <span key={a} className="inline-flex items-center gap-1 rounded bg-[var(--bg-container)] text-neutral-800 text-xs px-2 py-0.5">
                        <PaperclipIcon className="size-3" />
                        {a}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {previewTemplate.replyToOverride && (
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Reply-To Override</p>
                  <p className="text-sm font-mono text-neutral-800">{previewTemplate.replyToOverride}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirmation ───────────────────────────────────────────────── */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete template?</AlertDialogTitle>
            <AlertDialogDescription>
              This template will be permanently removed. Any scheduled sends that reference it will need to be updated.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteId(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={deleteTemplate}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
