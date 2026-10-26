import { useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { FontAwesomeIcon } from '../font-awesome-icon';
import { cn } from '../ui/utils';
import { EmailRichTextEditor, type EmailRichTextEditorHandle } from '../email/EmailRichTextEditor';
import { MergeFieldList } from '../email/MergeFieldList';
import { ChangeTag } from './changes';
import { FrameFooter, FrameHeader, TemplatePreviewDialog } from './EmailPreview';
import {
  NOTIF_CATEGORIES, createTemplate, deleteBlockedReason, deleteTemplate, eventOf, fieldDef, getTemplate, layoutOptions,
  setDefault, updateTemplate, useNotifStore, whenText, type Group, type LayoutId, type Portal, type TemplateRecord,
} from '../../data/notificationStore';
import { MERGE_FIELD_CATALOG, mergeFieldsForAudiences, mergeToken } from '../../data/mergeFieldCatalog';
import type { AudienceType } from '../../data/mockEmailTemplates';
import { tenantEmailConfig } from '../../data/tenantEmailConfig';

const AUDIENCES: AudienceType[] = ['Student', 'School Contact', 'Partner Contact', 'Staff-Personnel', 'Candidate', 'Preceptor', 'Placement Faculty/CI'];
const MAX_FILES = 5;
const MAX_BYTES = 10 * 1024 * 1024;

type AtItem = { token: string; label: string; insert: string };
type AtState = { query: string; apply: (text: string) => void } | null;

function AtMenu({ items, query, onPick }: { items: AtItem[]; query: string; onPick: (i: AtItem) => void }) {
  const shown = items.filter((i) => `${i.label} ${i.token}`.toLowerCase().includes(query.toLowerCase())).slice(0, 8);
  if (shown.length === 0) return null;
  return (
    <ul className="absolute z-30 mt-1 w-72 rounded-md border border-neutral-200 bg-popover p-1 shadow-md" role="listbox" aria-label="Merge fields">
      {shown.map((i) => (
        <li key={i.token}>
          <button type="button" className="flex w-full items-center justify-between gap-2 rounded-sm px-2 py-1.5 text-left text-sm hover:bg-neutral-100" onMouseDown={(e) => { e.preventDefault(); onPick(i); }}>
            <span className="text-neutral-900">{i.label}</span>
            <span className="font-mono text-xs text-neutral-700">{`@${i.token}`}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}

export function TemplateEditorPage({ portal }: { portal: Portal }) {
  useNotifStore();
  const { templateId = 'new' } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isNew = templateId === 'new';
  const existing = isNew ? undefined : getTemplate(templateId);
  const base = isNew && params.get('base') ? getTemplate(params.get('base')!) : undefined;
  const src = existing ?? base;

  const group = (existing?.group ?? (params.get('group') as Group) ?? 'notification') as Group;
  const categoryId = existing?.categoryId ?? params.get('category') ?? '';
  const eventId = existing?.eventId ?? params.get('event') ?? '';
  const ev = group === 'notification' ? eventOf(portal, eventId) : undefined;
  const categoryLabel = group === 'notification' ? NOTIF_CATEGORIES[portal].find((c) => c.id === categoryId)?.label ?? categoryId : categoryId;
  const eventLabel = group === 'notification' ? ev?.label ?? eventId : eventId;
  const standard = existing?.type === 'Standard';
  const listUrl = `${pathname.replace(/\/[^/]+$/, '')}?group=${group}&category=${categoryId}&event=${eventId}`;

  const [name, setName] = useState(existing?.name ?? (src ? `${src.name} copy` : `${eventLabel} template`));
  const [subject, setSubject] = useState(src?.subject ?? '');
  const [body, setBody] = useState(src?.body ?? '');
  const [attachments, setAttachments] = useState<string[]>(src?.attachments ?? []);
  const [layout, setLayout] = useState<LayoutId>(src?.layout ?? (group === 'notification' ? 'own-exxat' : 'none'));
  const [audience, setAudience] = useState<AudienceType>(src?.audience ?? (ev?.audience ?? 'Student'));
  const [replyTo, setReplyTo] = useState(src?.replyToOverride ?? '');
  const [makeDefault, setMakeDefault] = useState(!!existing?.isDefault);
  const [preview, setPreview] = useState<TemplateRecord | null>(null);
  const [atSubject, setAtSubject] = useState<string | null>(null);
  const [atBody, setAtBody] = useState<AtState>(null);
  const bodyRef = useRef<EmailRichTextEditorHandle>(null);
  const subjectRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Fields offered: an event's own list for automated emails, the full catalogue for Bulk Email.
  const catalogFields = useMemo(() => mergeFieldsForAudiences([audience], portal), [audience, portal]);
  const fieldItems: AtItem[] = useMemo(() => {
    if (group === 'notification' && ev) return [...ev.fields, ...ev.links].map((t) => ({ ...fieldDef(t), insert: `{{${t}}}` }));
    return catalogFields.filter((f) => f.kind !== 'list').map((f) => ({ token: f.token, label: f.label, insert: mergeToken(f) }));
  }, [group, ev, catalogFields]);
  const linkFields = group === 'bulk' ? catalogFields.filter((f) => f.group === 'Links') : [];
  const plainFields = group === 'bulk' ? catalogFields.filter((f) => f.group !== 'Links') : [];

  function draft(): TemplateRecord {
    return { id: existing?.id ?? 'draft', portal, group, categoryId, eventId, name, subject, body, type: 'Customized', isDefault: makeDefault, attachments, layout, audience, replyToOverride: replyTo || null, history: existing?.history ?? [] };
  }

  function insertIntoBody(text: string) {
    bodyRef.current?.insertAtCursor(text);
    bodyRef.current?.focus();
  }

  function onSubjectChange(v: string) {
    setSubject(v);
    const pos = subjectRef.current?.selectionStart ?? v.length;
    const m = /@(\w*)$/.exec(v.slice(0, pos));
    setAtSubject(m ? m[1] : null);
  }
  function pickSubject(i: AtItem) {
    const pos = subjectRef.current?.selectionStart ?? subject.length;
    const before = subject.slice(0, pos).replace(/@\w*$/, '');
    setSubject(`${before}${i.insert}${subject.slice(pos)}`);
    setAtSubject(null);
    subjectRef.current?.focus();
  }

  function addFiles(files: FileList | null) {
    if (!files) return;
    const next = [...attachments];
    for (const f of Array.from(files)) {
      if (!/\.(pdf|docx?|png|jpe?g|gif)$/i.test(f.name)) { toast.error(`${f.name}: use a PDF, DOC or image file.`); continue; }
      if (f.size > MAX_BYTES) { toast.error(`${f.name} is over 10 MB.`); continue; }
      if (next.length >= MAX_FILES) { toast.error(`You can add up to ${MAX_FILES} attachments per template.`); break; }
      next.push(f.name);
    }
    setAttachments(next);
    if (fileRef.current) fileRef.current.value = '';
  }

  function save() {
    if (!name.trim() || !subject.trim() || !body.replace(/<[^>]*>/g, '').trim()) { toast.error('Add a name, a subject and a body.'); return; }
    if (existing) {
      updateTemplate(existing.id, { name: name.trim(), subject, body, attachments, layout, audience, replyToOverride: replyTo || null });
      if (makeDefault && !existing.isDefault) setDefault(existing.id);
      toast.success('Template saved.');
    } else {
      const t = createTemplate({ portal, group, categoryId, eventId, name: name.trim(), subject, body, attachments, layout, audience, replyToOverride: replyTo || null });
      if (makeDefault) setDefault(t.id);
      toast.success('Template created.');
    }
    navigate(listUrl);
  }

  if (!isNew && !existing) {
    return <div className="p-6 text-sm text-neutral-700">This template no longer exists. <button className="text-blue-500 underline" onClick={() => navigate(listUrl)}>Back to templates</button></div>;
  }
  const blocked = existing ? deleteBlockedReason(existing) : null;
  const ownName = portal === 'school' ? 'University' : 'Site';
  const lock = standard;

  return (
    <div className="p-4 sm:p-6">
      <div className="max-w-4xl space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" aria-label="Back to templates" onClick={() => navigate(listUrl)} className="text-neutral-800 hover:text-blue-500"><FontAwesomeIcon name="arrowLeft" className="w-4 h-4" /></button>
          <h1 className="text-lg font-semibold text-neutral-900">{isNew ? 'Create template' : standard ? 'Template' : 'Edit template'}</h1>
          <Badge variant="outline" className={cn('font-normal', !standard && 'bg-indigo-50 border-indigo-200 text-indigo-700')}>{standard ? 'Standard' : 'Customized'}</Badge>
          <ChangeTag kind="reference" label="Full-page editor: from reference" />
          <div className="ml-auto flex items-center gap-2">
            <Button variant="outline" onClick={() => setPreview(draft())}><FontAwesomeIcon name="eye" className="w-4 h-4" aria-hidden="true" /> Preview</Button>
            <Button onClick={save} disabled={lock}>Save</Button>
            {existing && !standard && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild><Button variant="outline" size="icon" aria-label="More actions"><FontAwesomeIcon name="ellipsisVertical" className="w-4 h-4" /></Button></DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem disabled={!!blocked} onSelect={() => { deleteTemplate(existing.id); toast.success('Template deleted.'); navigate(listUrl); }} title={blocked ?? undefined}>Delete</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {standard && (
          <div className="flex items-center justify-between gap-3 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Standard templates cannot be edited. Clone to customize.
            <Button size="sm" variant="outline" onClick={() => navigate(listUrl)}>Back to templates</Button>
          </div>
        )}

        <div className="rounded-xl bg-card shadow-[0_1px_1.5px_rgba(0,0,0,0.1)] p-6 space-y-5">
          <label className="block text-sm font-medium text-neutral-800">Template name
            <Input className="mt-1" value={name} onChange={(e) => setName(e.target.value)} disabled={lock} />
          </label>
          <div className="text-sm">
            <p className="font-medium text-neutral-800">Category</p>
            <p className="text-neutral-700">{categoryLabel} · {eventLabel}</p>
          </div>

          {group === 'bulk' && (
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <p className="flex items-center gap-2 text-sm font-medium text-neutral-800">Audience type <ChangeTag kind="ours" /></p>
                <Select value={audience} onValueChange={(v) => setAudience(v as AudienceType)} disabled={lock}>
                  <SelectTrigger className="mt-1" aria-label="Audience type"><SelectValue /></SelectTrigger>
                  <SelectContent>{AUDIENCES.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <label className="block text-sm font-medium text-neutral-800"><span className="flex items-center gap-2">Reply-to override (optional) <ChangeTag kind="ours" /></span>
                <Input className="mt-1" value={replyTo} onChange={(e) => setReplyTo(e.target.value)} placeholder={tenantEmailConfig[portal].replyTo} disabled={lock} />
              </label>
            </div>
          )}

          {/* The email as it will look: header, subject, body, footer */}
          <div className="rounded-lg border border-neutral-200 overflow-visible">
            <FrameHeader layout={layout} portal={portal} />
            <div className="p-4 space-y-4">
              <div className="relative">
                <label className="block text-sm font-medium text-neutral-800">Subject
                  <Input ref={subjectRef} className="mt-1" value={subject} onChange={(e) => onSubjectChange(e.target.value)} onBlur={() => setTimeout(() => setAtSubject(null), 150)} disabled={lock} placeholder="Type @ to insert a merge field" />
                </label>
                {atSubject !== null && <AtMenu items={fieldItems} query={atSubject} onPick={pickSubject} />}
              </div>
              <div className="relative">
                <p className="mb-1 text-sm font-medium text-neutral-800">Body</p>
                <div className={cn(lock && 'pointer-events-none opacity-70')}>
                  <EmailRichTextEditor ref={bodyRef} value={body} onChange={setBody} minHeight={220} placeholder="Type @ to insert a merge field" onAtQuery={(q, apply) => setAtBody(q === null ? null : { query: q, apply })} />
                </div>
                {atBody && <AtMenu items={fieldItems} query={atBody.query} onPick={(i) => { atBody.apply(i.insert); setAtBody(null); }} />}
              </div>
            </div>
            <FrameFooter layout={layout} />
          </div>
          <p className="text-xs text-neutral-700 flex flex-wrap items-center gap-2">Type @ in the subject or body to pick a merge field. <ChangeTag kind="reference" label="@ picker: from reference" /></p>

          {/* Attachments */}
          <section>
            <h2 className="flex items-center gap-2 text-sm font-semibold text-neutral-900">Attachments <ChangeTag kind="reference" /></h2>
            <p className="text-xs text-neutral-700">Files are sent with this email template.</p>
            <button type="button" disabled={lock} onClick={() => fileRef.current?.click()} onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); addFiles(e.dataTransfer.files); }}
              className="mt-2 w-full rounded-md border border-dashed border-neutral-400 py-6 text-sm text-neutral-700 hover:border-blue-500 disabled:opacity-50">
              Drop files here or <span className="text-blue-500">browse</span>
              <span className="block text-xs text-neutral-600">PDF, DOC, or image files up to 10 MB each</span>
            </button>
            <input ref={fileRef} type="file" multiple className="hidden" onChange={(e) => addFiles(e.target.files)} />
            <p className="mt-1 text-xs text-neutral-600">You can add up to {MAX_FILES} attachments per template.</p>
            {attachments.length > 0 && (
              <ul className="mt-2 flex flex-wrap gap-2">
                {attachments.map((a) => (
                  <li key={a} className="inline-flex items-center gap-1.5 rounded-full border border-neutral-300 px-3 py-1 text-xs text-neutral-900">
                    <FontAwesomeIcon name="paperclip" className="w-3 h-3" aria-hidden="true" />{a}
                    {!lock && <button type="button" aria-label={`Remove ${a}`} onClick={() => setAttachments(attachments.filter((x) => x !== a))}><FontAwesomeIcon name="xmark" className="w-3 h-3" /></button>}
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Settings */}
          <section className="space-y-3">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-neutral-900">Template settings <ChangeTag kind="reference" /></h2>
            <label className="flex items-center justify-between text-sm text-neutral-900">Set as default
              <Switch checked={makeDefault} onCheckedChange={setMakeDefault} disabled={lock || !!existing?.isDefault} aria-label="Set as default" />
            </label>
            <fieldset disabled={lock}>
              <legend className="mb-2 text-sm font-medium text-neutral-800">Header and footer layouts</legend>
              <div className="space-y-2">
                {layoutOptions(ownName).map((o) => (
                  <label key={o.value} className="flex items-center gap-2.5 text-sm text-neutral-800 cursor-pointer">
                    <input type="radio" name="layout" checked={layout === o.value} onChange={() => setLayout(o.value)} className="h-4 w-4 accent-blue-500" />
                    {o.label}
                  </label>
                ))}
              </div>
            </fieldset>
          </section>

          {/* Merge fields and links */}
          <section>
            <h2 className="flex items-center gap-2 text-sm font-semibold text-neutral-900">Merge fields
              <ChangeTag kind="reference" />{group === 'bulk' && <ChangeTag kind="new" label="New: full catalogue, search and groups" />}
            </h2>
            <p className="mb-2 text-xs text-neutral-700">Type @ in a field to pick a merge field, or use the list below.</p>
            {group === 'notification' && ev ? (
              <ul className="grid sm:grid-cols-2 gap-2">
                {ev.fields.map((t) => (
                  <li key={t}><button type="button" disabled={lock} onClick={() => insertIntoBody(`{{${t}}}`)} className="flex w-full items-center justify-between rounded-md border border-neutral-200 px-3 py-2 text-left text-sm hover:bg-neutral-50 disabled:opacity-50"><span>{fieldDef(t).label}</span><span className="font-mono text-xs text-neutral-700">{`@${t}`}</span></button></li>
                ))}
              </ul>
            ) : (
              <div className="rounded-md border border-neutral-200 p-2"><MergeFieldList fields={plainFields} onInsert={insertIntoBody} maxHeightClass="max-h-64" /></div>
            )}
          </section>
          <section>
            <h2 className="flex items-center gap-2 text-sm font-semibold text-neutral-900">Links <ChangeTag kind="reference" />{group === 'bulk' && <ChangeTag kind="new" label="New for Bulk Email" />}</h2>
            <p className="mb-2 text-xs text-neutral-700">Type @ in the body to pick a deep link, or use the list below. Links become hyperlinks in preview.</p>
            <ul className="grid sm:grid-cols-2 gap-2">
              {(group === 'notification' && ev ? ev.links.map((t) => ({ token: t, label: fieldDef(t).label, insert: `{{${t}}}` })) : linkFields.map((f) => ({ token: f.token, label: f.label, insert: mergeToken(f) }))).map((l) => (
                <li key={l.token}><button type="button" disabled={lock} onClick={() => insertIntoBody(l.insert)} className="flex w-full items-center justify-between rounded-md border border-neutral-200 px-3 py-2 text-left text-sm hover:bg-neutral-50 disabled:opacity-50"><span>{l.label}</span><span className="font-mono text-xs text-neutral-700">{`@${l.token}`}</span></button></li>
              ))}
            </ul>
          </section>

          {existing && (
            <section>
              <h2 className="flex items-center gap-2 text-sm font-semibold text-neutral-900">Edit history <ChangeTag kind="reference" /></h2>
              <ul className="mt-2 divide-y divide-neutral-100 text-xs">
                {existing.history.map((h, i) => (
                  <li key={i} className="py-2"><p className="font-medium text-neutral-900">{h.action}</p><p className="text-neutral-700">{h.by} · {whenText(h.at)}</p></li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
      <TemplatePreviewDialog template={preview} onClose={() => setPreview(null)} />
    </div>
  );
}
