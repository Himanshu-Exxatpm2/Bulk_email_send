import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { RadioGroup, RadioGroupItem } from '../../ui/radio-group';
import { cn } from '../../ui/utils';
import { personaKey, type PersonaOption } from '../ComposeEmailWizard';

const unique = (rows: { email: string | null }[]) => new Set(rows.filter((r) => r.email).map((r) => r.email!.toLowerCase())).size;

/**
 * First thing a sender sees after Compose Email: who is this email for? One group is chosen, so the template, the
 * merge fields and the wording all fit one audience. Its people are then listed in step 1, where individuals can be unticked.
 */
export function PersonaPickerDialog({
  open,
  onOpenChange,
  personas,
  selected,
  onConfirm,
  selectionSummary,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  personas: PersonaOption[];
  selected: string[];
  onConfirm: (picked: string[]) => void;
  selectionSummary?: string;
}) {
  const [picked, setPicked] = useState<string>(selected[0] ?? '');
  useEffect(() => { if (open) setPicked(selected[0] ?? ''); }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Who do you want to email?</DialogTitle>
          <DialogDescription>
            {selectionSummary ? `${selectionSummary}. ` : ''}Pick who this email is for. You can untick individual people on the next screen.
          </DialogDescription>
        </DialogHeader>
        <RadioGroup value={picked} onValueChange={setPicked} className="gap-0 divide-y divide-neutral-100 overflow-hidden rounded-md border border-neutral-200" aria-label="Who do you want to email?">
          {personas.map((p) => {
            const n = unique(p.recipients);
            const none = n === 0;
            const key = personaKey(p);
            return (
              <label key={key} className={cn('flex items-start gap-3 px-4 py-3', none ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:bg-neutral-50')}>
                <RadioGroupItem className="mt-0.5" value={key} disabled={none} aria-label={p.label} />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="text-sm font-medium text-neutral-900">{p.label}</span>
                    <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-500">{none ? 'none found' : `${n} ${n === 1 ? 'person' : 'people'}`}</span>
                  </span>
                  {p.description && <span className="mt-0.5 block text-xs text-neutral-700">{p.description}</span>}
                </span>
              </label>
            );
          })}
        </RadioGroup>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button disabled={!picked} onClick={() => onConfirm([picked])}>Continue</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
