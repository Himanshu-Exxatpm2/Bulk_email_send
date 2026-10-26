import { useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';
import { FontAwesomeIcon, type FontAwesomeIconName } from '../font-awesome-icon';
import { cn } from '../ui/utils';
import { ChangeTag } from './changes';
import { TemplatePreviewDialog } from './EmailPreview';
import {
  cloneTemplate, deleteBlockedReason, deleteTemplate, eventRefs, setDefault, templatesFor, useNotifStore, whenText,
  type EventRef, type Group, type Portal, type TemplateRecord,
} from '../../data/notificationStore';

const GROUP_TITLE: Record<Group, string> = { notification: 'Automated notifications', bulk: 'Bulk Email' };

export function EmailTemplatesPage({ portal }: { portal: Portal }) {
  useNotifStore();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [params, setParams] = useSearchParams();
  const refs = eventRefs(portal);
  const sel =
    refs.find((r) => r.group === params.get('group') && r.categoryId === params.get('category') && r.eventId === params.get('event')) ?? refs[0];
  const [add, setAdd] = useState(false);
  const [clone, setClone] = useState<TemplateRecord | null>(null);
  const [cloneName, setCloneName] = useState('');
  const [del, setDel] = useState<TemplateRecord | null>(null);
  const [preview, setPreview] = useState<TemplateRecord | null>(null);
  const [openHistory, setOpenHistory] = useState<string | null>(null);

  const list = templatesFor(portal, sel.group, sel.categoryId, sel.eventId);
  const base = pathname.replace(/\/$/, '');
  const choose = (r: EventRef) => setParams({ group: r.group, category: r.categoryId, event: r.eventId });
  const editorUrl = (id: string, extra = '') => `${base}/${id}?group=${sel.group}&category=${sel.categoryId}&event=${sel.eventId}${extra}`;

  return (
    <div className="p-4 sm:p-6">
      <div className="max-w-6xl rounded-xl bg-card shadow-[0_1px_1.5px_rgba(0,0,0,0.1)] overflow-hidden">
        <div className="px-6 pt-6 pb-4">
          <h1 className="flex items-center gap-2 text-lg font-semibold text-neutral-900">
            Email Templates <ChangeTag kind="reference" />
            {portal === 'school' && <ChangeTag kind="new" label="New: School portal" />}
          </h1>
          <p className="mt-1 text-sm text-neutral-700">Manage the emails Exxat One sends, and the Bulk Email templates people send by hand.</p>
        </div>

        <div className="grid lg:grid-cols-[320px_1fr] border-t border-neutral-200">
          {/* Event list */}
          <nav className="border-b lg:border-b-0 lg:border-r border-neutral-200 max-h-[70vh] overflow-y-auto" aria-label="Events">
            {(['notification', 'bulk'] as Group[]).map((g) => {
              const groupRefs = refs.filter((r) => r.group === g);
              const cats = Array.from(new Set(groupRefs.map((r) => r.categoryId)));
              return (
                <div key={g}>
                  <p className="sticky top-0 z-10 flex items-center gap-2 bg-neutral-900 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white">
                    {GROUP_TITLE[g]}
                    <ChangeTag kind={g === 'bulk' ? 'new' : 'reference'} />
                  </p>
                  {cats.map((c) => {
                    const first = groupRefs.find((r) => r.categoryId === c)!;
                    return (
                      <div key={c}>
                        <p className="flex items-center gap-2 bg-indigo-50/70 px-4 py-2 text-sm font-semibold text-neutral-900">
                          <FontAwesomeIcon name={first.icon as FontAwesomeIconName} className="w-3.5 h-3.5" aria-hidden="true" />
                          {first.categoryLabel}
                        </p>
                        {groupRefs.filter((r) => r.categoryId === c).map((r) => {
                          const active = r.group === sel.group && r.categoryId === sel.categoryId && r.eventId === sel.eventId;
                          return (
                            <button key={r.eventId} type="button" onClick={() => choose(r)}
                              className={cn('flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-sm border-b border-neutral-100 hover:bg-neutral-50', active && 'bg-neutral-100 font-semibold')}>
                              <span className="text-neutral-900">{r.label}</span>
                              <span className="rounded-full border border-neutral-300 px-2 text-xs text-neutral-700">{r.count}</span>
                            </button>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </nav>

          {/* Templates for the selected event */}
          <section className="p-6 space-y-4 min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-base font-semibold text-neutral-900">{sel.label}</h2>
              <Button onClick={() => setAdd(true)}><FontAwesomeIcon name="plus" className="w-3.5 h-3.5" aria-hidden="true" /> Add template</Button>
            </div>
            {list.map((t) => {
              const del = deleteBlockedReason(t);
              const std = t.type === 'Standard';
              return (
                <article key={t.id} className="rounded-lg border border-neutral-200 p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-semibold text-neutral-900">{t.name}</h3>
                    <Badge variant="outline" className={cn('font-normal', !std && 'bg-indigo-50 border-indigo-200 text-indigo-700')}>{t.type}</Badge>
                    {t.isDefault && <Badge variant="outline" className="font-normal bg-green-50 border-green-200 text-green-700">Default</Badge>}
                    {t.group === 'bulk' && <Badge variant="outline" className="font-normal">{t.audience}</Badge>}
                  </div>
                  <p className="mt-1 text-sm text-neutral-700 truncate">{t.subject}</p>
                  <div className="mt-3 flex items-center justify-end gap-3">
                    {!t.isDefault && <button type="button" className="text-sm text-blue-500 hover:underline font-medium" onClick={() => { setDefault(t.id); toast.success('Default template updated.'); }}>Set as default</button>}
                    <IconBtn icon="eye" label="Preview email" onClick={() => setPreview(t)} />
                    <IconBtn icon="copy" label="Clone" onClick={() => { setClone(t); setCloneName(`${t.name} copy`); }} />
                    <IconBtn icon="pencil" label={std ? 'Standard templates cannot be edited. Clone to customize.' : 'Edit'} disabled={std} onClick={() => navigate(editorUrl(t.id))} />
                    <IconBtn icon="trash" label={del ?? 'Delete'} disabled={!!del} danger onClick={() => setDel(t)} />
                  </div>
                  <button type="button" onClick={() => setOpenHistory(openHistory === t.id ? null : t.id)} aria-label="Edit history"
                    className="mt-3 flex w-full items-center justify-between rounded-md bg-neutral-50 px-3 py-2 text-xs text-neutral-700">
                    <span>Last updated by {t.history[0].by} · {whenText(t.history[0].at)}</span>
                    <FontAwesomeIcon name={openHistory === t.id ? 'chevronUp' : 'chevronDown'} className="w-3 h-3" />
                  </button>
                  {openHistory === t.id && (
                    <ul className="mt-2 divide-y divide-neutral-100 text-xs">
                      {t.history.map((h, i) => (
                        <li key={i} className="px-3 py-2">
                          <p className="font-medium text-neutral-900">{h.action}</p>
                          <p className="text-neutral-700">{h.by} · {whenText(h.at)}</p>
                        </li>
                      ))}
                    </ul>
                  )}
                </article>
              );
            })}
            <p className="flex flex-wrap items-center gap-2 text-xs text-neutral-700">
              Standard templates are read-only: clone one to customize it. A default cannot be deleted until another is set.
              <ChangeTag kind="reference" />
            </p>
          </section>
        </div>
      </div>

      {/* Add template */}
      <Dialog open={add} onOpenChange={setAdd}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add template</DialogTitle>
            <DialogDescription>Start from scratch or pick an existing template for this event. Nothing is added until you save.</DialogDescription>
          </DialogHeader>
          <Button variant="outline" className="justify-start" onClick={() => { setAdd(false); navigate(editorUrl('new')); }}>Start from scratch</Button>
          <p className="text-xs font-medium uppercase tracking-wider text-neutral-700">Or pick a template</p>
          <ul className="space-y-2 max-h-64 overflow-y-auto">
            {list.map((t) => (
              <li key={t.id}>
                <button type="button" className="w-full rounded-md border border-neutral-200 p-3 text-left hover:bg-neutral-50" onClick={() => { setAdd(false); navigate(editorUrl('new', `&base=${t.id}`)); }}>
                  <span className="flex items-center gap-2 text-sm font-medium text-neutral-900">{t.name}<Badge variant="outline" className="font-normal">{t.type}</Badge></span>
                  <span className="block truncate text-xs text-neutral-700">{t.subject}</span>
                </button>
              </li>
            ))}
          </ul>
          <DialogFooter><Button variant="outline" onClick={() => setAdd(false)}>Cancel</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Clone */}
      <Dialog open={!!clone} onOpenChange={(o) => !o && setClone(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Clone template</DialogTitle>
            <DialogDescription>Name the copy. Nothing is created until you confirm.</DialogDescription>
          </DialogHeader>
          <label className="text-sm font-medium text-neutral-800">Template name
            <Input className="mt-1" value={cloneName} onChange={(e) => setCloneName(e.target.value)} />
          </label>
          <DialogFooter>
            <Button variant="outline" onClick={() => setClone(null)}>Cancel</Button>
            <Button disabled={!cloneName.trim()} onClick={() => { cloneTemplate(clone!.id, cloneName.trim()); setClone(null); toast.success('Template cloned.'); }}>Clone</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete */}
      <AlertDialog open={!!del} onOpenChange={(o) => !o && setDel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this template?</AlertDialogTitle>
            <AlertDialogDescription>"{del?.name}" will be removed. This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => { const why = deleteTemplate(del!.id); if (why) toast.error(why); else toast.success('Template deleted.'); setDel(null); }}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <TemplatePreviewDialog template={preview} onClose={() => setPreview(null)} />
    </div>
  );
}

function IconBtn({ icon, label, onClick, disabled, danger }: { icon: FontAwesomeIconName; label: string; onClick: () => void; disabled?: boolean; danger?: boolean }) {
  return (
    <button type="button" aria-label={label} title={label} disabled={disabled} onClick={onClick}
      className={cn('text-neutral-700 hover:text-blue-500 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:text-neutral-700', danger && 'hover:text-negative-default')}>
      <FontAwesomeIcon name={icon} className="w-4 h-4" />
    </button>
  );
}
