import { useState } from 'react';
import { NavLink, Outlet } from 'react-router';
import { Switch } from '../ui/switch';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { FontAwesomeIcon } from '../font-awesome-icon';
import { cn } from '../ui/utils';
import { CHANGE_LIST, ChangeTag, ShowChangesContext, type ChangeKind } from './changes';
import type { Portal } from '../../data/notificationStore';

const NAV: { to: string; label: string; kind: ChangeKind; tag?: string }[] = [
  { to: 'notification/email-setup', label: 'Email Setup', kind: 'ours', tag: 'Ours + reference' },
  { to: 'notification/email-templates', label: 'Email Templates', kind: 'reference' },
  { to: 'notification/attachment-templates', label: 'Attachment Templates', kind: 'ours' },
  { to: 'notification/notification-configuration', label: 'Notification Configuration', kind: 'reference' },
  { to: 'notification/my-notifications', label: 'My Notifications', kind: 'reference' },
];

const KIND_TITLE: Record<ChangeKind, string> = { reference: 'From the reference prototype', new: 'New in this prototype', ours: 'Already ours, kept' };

/** Configuration secondary navigation (Notification group) plus the Show changes controls. */
export function ConfigLayout({ portal }: { portal: Portal }) {
  const [show, setShow] = useState(true);
  const [listOpen, setListOpen] = useState(false);
  return (
    <ShowChangesContext.Provider value={show}>
      <div className="flex h-full min-h-0 bg-neutral-50">
        <aside className="w-60 shrink-0 border-r border-neutral-200 bg-card p-3 overflow-y-auto">
          <p className="px-2 pt-1 pb-2 text-[11px] font-semibold uppercase tracking-wider text-neutral-600">Configuration</p>
          <p className="px-2 py-1.5 text-sm font-semibold text-neutral-900 flex items-center gap-2">
            <FontAwesomeIcon name="bell" className="w-3.5 h-3.5" aria-hidden="true" /> Notification
            <ChangeTag kind="reference" />
          </p>
          <nav className="mt-1 flex flex-col gap-0.5" aria-label="Notification">
            {NAV.filter((n) => portal === 'site' || n.to !== 'notification/attachment-templates').map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                className={({ isActive }) =>
                  cn('flex flex-wrap items-center gap-1.5 rounded-md px-3 py-2 text-sm transition-colors', isActive ? 'bg-blue-500 text-white font-medium' : 'text-neutral-800 hover:bg-neutral-100')
                }
              >
                {n.label}
                <ChangeTag kind={n.kind} label={n.tag} />
              </NavLink>
            ))}
          </nav>
          <div className="mt-6 rounded-lg border border-neutral-200 p-3 space-y-2">
            <label className="flex items-center justify-between gap-2 text-sm text-neutral-900">
              Show changes
              <Switch checked={show} onCheckedChange={setShow} aria-label="Show changes" />
            </label>
            <p className="text-xs text-neutral-700 leading-snug">Marks each part: From reference, New, or Ours.</p>
            <Button size="sm" variant="outline" className="w-full" onClick={() => setListOpen(true)}>
              What changed
            </Button>
            {show && (
              <div className="flex flex-wrap gap-1 pt-1">
                <ChangeTag kind="reference" />
                <ChangeTag kind="new" />
                <ChangeTag kind="ours" />
              </div>
            )}
          </div>
          <p className="mt-3 px-1 text-[11px] text-neutral-600">{portal === 'site' ? 'Site' : 'School'} portal</p>
        </aside>
        <div className="flex-1 min-w-0 overflow-y-auto">
          <Outlet />
        </div>
      </div>

      <Dialog open={listOpen} onOpenChange={setListOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>What changed</DialogTitle>
            <DialogDescription>Everything in the Notification area, by where it came from.</DialogDescription>
          </DialogHeader>
          {(['reference', 'new', 'ours'] as ChangeKind[]).map((k) => (
            <section key={k} className="space-y-1.5">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-neutral-900">
                {KIND_TITLE[k]} <ChangeTag kind={k} />
              </h3>
              <ul className="space-y-1 text-sm text-neutral-800 list-disc pl-5">
                {CHANGE_LIST.filter((c) => c.kind === k).map((c, i) => (
                  <li key={i}>
                    <span className="font-medium">{c.area}.</span> {c.item}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </DialogContent>
      </Dialog>
    </ShowChangesContext.Provider>
  );
}

// Visible badge helper for page headers: always shown (outside Show changes) is not needed.
export { ChangeTag };
