import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import { ComposeEmailWizard, personaKey, type PersonaOption } from './ComposeEmailWizard';
import { PersonaPickerDialog } from './compose/PersonaPickerDialog';
import type { AudienceType } from '../../data/mockEmailTemplates';
import type { SurfaceKey } from '../../data/surfaceMergeFields';

const peopleIn = (p: PersonaOption) => new Set(p.recipients.filter((r) => r.email).map((r) => r.email!.toLowerCase())).size;

/**
 * The compose flow every Bulk Email screen shares: a pop-up asking who the email is for (skipped when there is
 * only one group to choose from), then the three-step panel (Recipients, Compose, Preview). The merge fields
 * on offer depend on the screen (see surfaceMergeFields.ts).
 */
export function BulkEmailFlow({
  open,
  onClose,
  surface,
  portal = 'site',
  personas,
  selectionSummary,
  audienceType,
  sourceSurface,
  sourceSurfaceCandidates,
}: {
  open: boolean;
  onClose: () => void;
  surface: SurfaceKey;
  portal?: 'site' | 'school';
  personas: PersonaOption[];
  /** The line shown in the panel header and the pop-up, e.g. "2 schedules selected · Group". */
  selectionSummary: string;
  audienceType?: AudienceType;
  sourceSurface?: string;
  sourceSurfaceCandidates?: string[];
}) {
  const available = personas.filter((p) => peopleIn(p) > 0);
  const single = available.length <= 1;
  const [phase, setPhase] = useState<'persona' | 'sheet'>('persona');
  const [picked, setPicked] = useState<string[]>([]);
  const [changing, setChanging] = useState(false);

  useEffect(() => {
    if (!open) return;
    setChanging(false);
    if (available.length === 0) {
      // Nobody with an email address in any group: say so instead of opening an empty panel.
      toast.info(`No one with an email address was found for ${selectionSummary.split(' · ')[0]}.`);
      onClose();
      return;
    }
    if (single) {
      setPicked(available.map(personaKey));
      setPhase('sheet');
    } else {
      setPicked([]);
      setPhase('persona');
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const popupOpen = open && (phase === 'persona' || changing);

  return (
    <>
      <PersonaPickerDialog
        open={popupOpen}
        onOpenChange={(o) => {
          if (o) return;
          if (changing) setChanging(false);
          else onClose();
        }}
        personas={personas}
        selected={picked}
        selectionSummary={selectionSummary.split(' · ')[0]}
        onConfirm={(p) => { setPicked(p); setChanging(false); setPhase('sheet'); }}
      />
      <ComposeEmailWizard
        layout="sheet"
        open={open && phase === 'sheet'}
        onClose={onClose}
        selectedRecipients={[]}
        personas={personas}
        initialPersonas={picked}
        onChangePersonas={single ? undefined : () => setChanging(true)}
        audienceType={audienceType ?? personas[0]?.audience ?? 'Student'}
        portal={portal}
        surface={surface}
        sourceSurface={sourceSurface ?? 'General'}
        sourceSurfaceCandidates={sourceSurfaceCandidates}
        selectionSummary={selectionSummary}
      />
    </>
  );
}
