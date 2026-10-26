import { toast } from 'sonner';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { Badge } from '../ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import { FontAwesomeIcon, type FontAwesomeIconName } from '../font-awesome-icon';
import { ChangeTag } from './changes';
import { EVENTS, NOTIF_CATEGORIES, getMyPref, isLocked, setMyCategory, setMyPref, useNotifStore, type Portal } from '../../data/notificationStore';

/** Personal notification preferences. Categories an admin has locked cannot be turned off. */
export function MyNotificationsPage({ portal }: { portal: Portal }) {
  useNotifStore();
  const events = EVENTS[portal].filter((e) => e.matrix !== false && !e.roles);
  const cats = NOTIF_CATEGORIES[portal].filter((c) => events.some((e) => e.category === c.id));
  return (
    <div className="p-4 sm:p-6">
      <div className="max-w-4xl rounded-xl bg-card shadow-[0_1px_1.5px_rgba(0,0,0,0.1)] p-6">
        <h1 className="flex items-center gap-2 text-lg font-semibold text-neutral-900">
          My Notifications <ChangeTag kind="reference" />
          {portal === 'school' && <ChangeTag kind="new" label="New: School events" />}
        </h1>
        <p className="mt-1 text-sm text-neutral-700">Control how you receive notifications. These preferences apply only to your account.</p>

        <div className="mt-5 rounded-lg border border-neutral-200 overflow-hidden">
          <div className="grid grid-cols-[1fr_5rem_5rem] bg-neutral-50 px-4 py-2.5 text-xs font-medium uppercase tracking-wider text-neutral-700">
            <span>Notification event</span>
            <span className="text-center"><FontAwesomeIcon name="bell" className="w-3 h-3 mr-1" aria-hidden="true" />In app</span>
            <span className="text-center"><FontAwesomeIcon name="envelope" className="w-3 h-3 mr-1" aria-hidden="true" />Email</span>
          </div>
          {cats.map((c) => {
            const evs = events.filter((e) => e.category === c.id);
            const locked = isLocked(portal, c.id);
            const all = (ch: 'inApp' | 'email') => (evs.every((e) => getMyPref(portal, e.id)[ch]) ? true : evs.some((e) => getMyPref(portal, e.id)[ch]) ? 'indeterminate' : false);
            return (
              <div key={c.id}>
                <div className="grid grid-cols-[1fr_5rem_5rem] items-center bg-indigo-50/60 border-t border-neutral-200 px-4 py-2.5">
                  <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-900">
                    <FontAwesomeIcon name={c.icon as FontAwesomeIconName} className="w-3.5 h-3.5" aria-hidden="true" />
                    {c.label}
                    {locked && (
                      <Tooltip><TooltipTrigger asChild><Badge variant="outline" className="gap-1 font-normal normal-case tracking-normal"><FontAwesomeIcon name="lock" className="w-3 h-3" aria-hidden="true" />Locked</Badge></TooltipTrigger><TooltipContent>These notifications are locked. You cannot turn them off.</TooltipContent></Tooltip>
                    )}
                  </span>
                  {(['inApp', 'email'] as const).map((ch) => (
                    <span key={ch} className="text-center">
                      <Checkbox checked={locked ? true : all(ch)} disabled={locked} aria-label={`${ch === 'inApp' ? 'In App' : 'Email'} for all ${c.label}`} onCheckedChange={(v) => setMyCategory(portal, c.id, ch, !!v)} />
                    </span>
                  ))}
                </div>
                {evs.map((e) => {
                  const p = getMyPref(portal, e.id);
                  return (
                    <div key={e.id} className="grid grid-cols-[1fr_5rem_5rem] items-center border-t border-neutral-100 px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-neutral-900">{e.label}</p>
                        <p className="text-xs text-neutral-700">{e.description}</p>
                      </div>
                      {(['inApp', 'email'] as const).map((ch) => (
                        <span key={ch} className="text-center">
                          <Checkbox checked={locked ? true : p[ch]} disabled={locked} aria-label={`${ch === 'inApp' ? 'In App' : 'Email'} for ${e.label}`} onCheckedChange={(v) => setMyPref(portal, e.id, ch, !!v)} />
                        </span>
                      ))}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
        <div className="mt-4 flex justify-end">
          <Button onClick={() => toast.success('Preferences saved.')}>Save preferences</Button>
        </div>
      </div>
    </div>
  );
}
