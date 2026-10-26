import { useState } from 'react';
import { useSearchParams } from 'react-router';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '../ui/sheet';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import { FontAwesomeIcon, type FontAwesomeIconName } from '../font-awesome-icon';
import { ChangeTag } from './changes';
import { NotificationPreviewDialog } from './EmailPreview';
import {
  NOTIF_CATEGORIES, ROLES, eventsForRole, getCell, getRecipients, isLocked, recipientSummary, setCategory, setCell, setRecipients,
  toggleLock, useNotifStore, type NotifEvent, type Portal, type Recipient,
} from '../../data/notificationStore';

const slug = (r: string) => r.toLowerCase().replace(/\s+/g, '-');

export function NotificationConfigurationPage({ portal }: { portal: Portal }) {
  useNotifStore();
  const [params, setParams] = useSearchParams();
  const roles = ROLES[portal];
  const role = roles.find((r) => slug(r) === params.get('role')) ?? roles[0];
  const [drawer, setDrawer] = useState(false);
  const [preview, setPreview] = useState<NotifEvent | null>(null);
  const events = eventsForRole(portal, role);
  const cats = NOTIF_CATEGORIES[portal].filter((c) => events.some((e) => e.category === c.id));

  return (
    <div className="p-4 sm:p-6">
      <div className="max-w-5xl rounded-xl bg-card shadow-[0_1px_1.5px_rgba(0,0,0,0.1)] p-6">
        <h1 className="flex items-center gap-2 text-lg font-semibold text-neutral-900">
          Notification Configuration <ChangeTag kind="reference" />
          {portal === 'school' && <ChangeTag kind="new" label="New: School events and roles" />}
        </h1>
        <p className="mt-1 text-sm text-neutral-700">Configure in-app and email notifications for users.</p>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-neutral-800">User</span>
            <Select value={role} onValueChange={(v) => setParams({ role: slug(v) })}>
              <SelectTrigger className="w-64" aria-label="User role"><SelectValue /></SelectTrigger>
              <SelectContent>{roles.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <p className="text-sm text-neutral-800">
            <span className="font-medium">Recipients:</span> {recipientSummary(portal, role)}{' '}
            <button type="button" className="text-blue-500 hover:underline font-medium" onClick={() => setDrawer(true)}>Edit</button>
          </p>
        </div>

        <p className="mt-4 text-sm text-neutral-700">Notification delivery preferences by category and channel</p>
        <div className="mt-2 overflow-x-auto rounded-lg border border-neutral-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-neutral-50 text-xs font-medium uppercase tracking-wider text-neutral-700">
                <th className="px-4 py-2.5 text-left">Event</th>
                <th className="w-24 px-2 py-2.5 text-center"><FontAwesomeIcon name="bell" className="w-3 h-3 mr-1" aria-hidden="true" />In app</th>
                <th className="w-24 px-2 py-2.5 text-center"><FontAwesomeIcon name="envelope" className="w-3 h-3 mr-1" aria-hidden="true" />Email</th>
                <th className="w-20 px-2 py-2.5 text-center">Preview</th>
              </tr>
            </thead>
            <tbody>
              {cats.map((c) => {
                const evs = events.filter((e) => e.category === c.id);
                const permanent = !!c.permanentLock;
                const locked = isLocked(portal, c.id);
                const allOn = (ch: 'inApp' | 'email') => (evs.every((e) => getCell(portal, role, e.id)[ch]) ? true : evs.some((e) => getCell(portal, role, e.id)[ch]) ? 'indeterminate' : false);
                return (
                  <CategoryRows key={c.id}>
                    <tr className="bg-indigo-50/60 border-t border-neutral-200">
                      <td className="px-4 py-2.5 font-semibold text-neutral-900">
                        <span className="inline-flex items-center gap-2">
                          <FontAwesomeIcon name={c.icon as FontAwesomeIconName} className="w-3.5 h-3.5" aria-hidden="true" />
                          {c.label}
                          {permanent ? (
                            <Tooltip><TooltipTrigger asChild><Badge variant="outline" className="gap-1 font-normal"><FontAwesomeIcon name="lock" className="w-3 h-3" aria-hidden="true" />Locked</Badge></TooltipTrigger><TooltipContent>Always on. Users cannot turn this off.</TooltipContent></Tooltip>
                          ) : (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button type="button" onClick={() => toggleLock(portal, c.id)} aria-label={`${locked ? 'Unlock' : 'Lock'} ${c.label}`} className="text-neutral-700 hover:text-blue-500">
                                  <FontAwesomeIcon name={locked ? 'lock' : 'lockOpen'} className="w-3.5 h-3.5" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent>{locked ? 'Locked: users cannot turn these off. Click to unlock.' : 'Unlocked: users can turn these off. Click to lock.'}</TooltipContent>
                            </Tooltip>
                          )}
                        </span>
                      </td>
                      {(['inApp', 'email'] as const).map((ch) => (
                        <td key={ch} className="px-2 py-2.5 text-center">
                          <Checkbox checked={permanent ? true : allOn(ch)} disabled={permanent} aria-label={`${ch === 'inApp' ? 'In App' : 'Email'} for all ${c.label}`}
                            onCheckedChange={(v) => setCategory(portal, role, c.id, ch, !!v)} />
                        </td>
                      ))}
                      <td />
                    </tr>
                    {evs.map((e) => {
                      const cell = getCell(portal, role, e.id);
                      return (
                        <tr key={e.id} className="border-t border-neutral-100 hover:bg-neutral-50">
                          <td className="px-4 py-3 pl-9 text-neutral-900">{e.label}</td>
                          {(['inApp', 'email'] as const).map((ch) => (
                            <td key={ch} className="px-2 py-3 text-center">
                              <Checkbox checked={permanent ? true : cell[ch]} disabled={permanent} aria-label={`${ch === 'inApp' ? 'In App' : 'Email'} for ${e.label}`}
                                onCheckedChange={(v) => setCell(portal, role, e.id, ch, !!v)} />
                            </td>
                          ))}
                          <td className="px-2 py-3 text-center">
                            <button type="button" onClick={() => setPreview(e)} aria-label={`Preview notification: ${e.label}`} className="text-neutral-700 hover:text-blue-500">
                              <FontAwesomeIcon name="eye" className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </CategoryRows>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-neutral-700">We may still send you important notifications about your account outside of the notification settings.</p>
          <Button onClick={() => toast.success('Notification settings saved.')}>Save Now</Button>
        </div>
      </div>

      <RecipientsDrawer key={`${portal}-${role}-${drawer}`} open={drawer} portal={portal} role={role} onClose={() => setDrawer(false)} />
      <NotificationPreviewDialog portal={portal} event={preview} onClose={() => setPreview(null)} />
    </div>
  );
}

function CategoryRows({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

function RecipientsDrawer({ open, portal, role, onClose }: { open: boolean; portal: Portal; role: string; onClose: () => void }) {
  const [draft, setDraft] = useState<Recipient[]>(() => getRecipients(portal, role).map((r) => ({ ...r })));
  const [q, setQ] = useState('');
  const [email, setEmail] = useState('');
  const [err, setErr] = useState('');
  const shown = draft.filter((r) => `${r.name} ${r.email}`.toLowerCase().includes(q.toLowerCase()));

  function add() {
    const v = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return setErr('Enter a valid email address.');
    if (draft.some((r) => r.email.toLowerCase() === v.toLowerCase())) return setErr('This address is already added.');
    setDraft([{ id: v, name: v, email: v, selected: true, external: true }, ...draft]);
    setEmail('');
    setErr('');
  }

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col gap-0">
        <SheetHeader>
          <SheetTitle>Recipients</SheetTitle>
          <SheetDescription>Who receives {role} notifications. <ChangeTag kind="reference" /></SheetDescription>
        </SheetHeader>
        <div className="px-4 space-y-3 flex-1 overflow-y-auto pb-4">
          <div className="relative">
            <FontAwesomeIcon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-600" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name or email..." className="pl-9" />
          </div>
          <div>
            <p className="text-xs font-medium text-neutral-700 mb-1">Add external recipient</p>
            <div className="flex gap-2">
              <Input value={email} onChange={(e) => { setEmail(e.target.value); setErr(''); }} onKeyDown={(e) => e.key === 'Enter' && add()} placeholder="Add email address..." />
              <Button variant="outline" onClick={add}>Add</Button>
            </div>
            {err && <p className="mt-1 text-xs text-negative-default">{err}</p>}
          </div>
          <ul className="space-y-1">
            {shown.map((r) => (
              <li key={r.id} className="flex items-start gap-3 rounded-md px-2 py-2 hover:bg-neutral-50">
                <Checkbox className="mt-0.5" checked={r.selected} disabled={r.blocked} aria-label={`Include ${r.name}`}
                  onCheckedChange={(v) => setDraft(draft.map((x) => (x.id === r.id ? { ...x, selected: !!v } : x)))} />
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-2 text-sm font-medium text-neutral-900">{r.name}{r.external && <Badge variant="outline" className="font-normal">External recipient</Badge>}</p>
                  {r.name !== r.email && <p className="text-xs text-neutral-700 break-all">{r.email}</p>}
                  {r.blocked && <p className="text-xs text-neutral-600">Has blocked all notifications</p>}
                </div>
              </li>
            ))}
            {shown.length === 0 && <li className="py-6 text-center text-sm text-neutral-600">No one matches.</li>}
          </ul>
        </div>
        <SheetFooter className="border-t border-neutral-200 flex-row justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => { setRecipients(portal, role, draft); toast.success('Recipients updated.'); onClose(); }}>Save</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
