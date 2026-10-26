import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { FontAwesomeIcon } from '../font-awesome-icon';
import { renderMergeFields } from '../../data/messageMerge';
import { mockStudents } from '../../data/mockStudents';
import { mockCandidates } from '../../data/mockData';
import { tenantEmailConfig } from '../../data/tenantEmailConfig';
import type { AudienceType } from '../../data/mockEmailTemplates';
import { eventOf, getTemplate, renderSample, templatesFor, whenText, type LayoutId, type NotifEvent, type Portal, type TemplateRecord } from '../../data/notificationStore';
import { ChangeTag } from './changes';

const hasOwnHeader = (l: LayoutId) => l === 'own-header' || l === 'own-exxat' || l === 'share-profile-exxat';
const hasExxatFooter = (l: LayoutId) => l === 'exxat-footer' || l === 'own-exxat' || l === 'share-profile-exxat';

export function FrameHeader({ layout, portal }: { layout: LayoutId; portal: Portal }) {
  if (!hasOwnHeader(layout)) return null;
  const cfg = tenantEmailConfig[portal];
  return (
    <div className="flex flex-col items-center gap-2 border-b border-neutral-200 py-3">
      {cfg.logoDataUrl ? (
        <img src={cfg.logoDataUrl} alt="" className="h-8 max-w-[160px] object-contain" />
      ) : (
        <span className="size-8 rounded-md bg-neutral-100 text-neutral-600 flex items-center justify-center"><FontAwesomeIcon name="building" className="w-4 h-4" aria-hidden="true" /></span>
      )}
      <span className="text-sm font-semibold text-neutral-900">{cfg.displayName}</span>
    </div>
  );
}

export function FrameFooter({ layout }: { layout: LayoutId }) {
  if (!hasExxatFooter(layout)) return null;
  return (
    <div className="border-t border-neutral-200 py-3 text-center text-base font-semibold text-neutral-900">
      Exxat<span className="text-pink-600">One</span>
    </div>
  );
}

// Sample recipients for previewing Bulk Email templates through the merge engine.
function sampleRecipient(a: AudienceType) {
  const s = mockStudents[0];
  const c = mockCandidates[0];
  switch (a) {
    case 'Student': return { id: s.id, name: `${s.firstName} ${s.lastName}`, email: s.email };
    case 'Staff-Personnel': return { id: 'per-001', name: 'Sandra Okonkwo', email: 's.okonkwo@medstarhealth.org' };
    case 'Preceptor': return { id: 'prec-001', name: 'David Whitfield', email: 'd.whitfield@medstarhealth.org' };
    case 'Placement Faculty/CI': return { id: 'fac-001', name: 'Denise Carrington', email: 'd.carrington@bowiestate.edu' };
    case 'Candidate': return { id: c.id, name: `${c.firstName} ${c.lastName}`, email: c.email };
    default: return { id: 'sp-001:r.blackwell@bowiestate.edu', name: 'Dr. Renee Blackwell', email: 'r.blackwell@bowiestate.edu' };
  }
}

/** Subject and body with sample values filled in and merged values highlighted. */
export function renderTemplate(t: Pick<TemplateRecord, 'group' | 'subject' | 'body' | 'audience' | 'portal'>) {
  if (t.group === 'notification') return { subject: renderSample(t.subject), body: renderSample(t.body) };
  const r = sampleRecipient(t.audience);
  const opts = { portal: t.portal, html: true, mark: true } as const;
  return { subject: renderMergeFields(t.subject, t.audience, r, opts).text, body: renderMergeFields(t.body, t.audience, r, opts).text };
}

export function EmailBodyPreview({ t, layout }: { t: Pick<TemplateRecord, 'group' | 'subject' | 'body' | 'audience' | 'portal'>; layout: LayoutId }) {
  const r = renderTemplate(t);
  return (
    <div className="rounded-lg border border-neutral-200 bg-card overflow-hidden">
      <FrameHeader layout={layout} portal={t.portal} />
      <div className="px-5 py-4 space-y-3">
        <h3 className="text-base font-semibold text-neutral-900" dangerouslySetInnerHTML={{ __html: r.subject }} />
        <div className="text-sm text-neutral-800 space-y-3 [&_p]:m-0" dangerouslySetInnerHTML={{ __html: r.body }} />
      </div>
      <FrameFooter layout={layout} />
    </div>
  );
}

export function TemplatePreviewDialog({ template, onClose }: { template: TemplateRecord | null; onClose: () => void }) {
  return (
    <Dialog open={!!template} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Preview email</DialogTitle>
          <DialogDescription>
            {template?.name}. Sample values are filled in. Highlighted text comes from merge fields.
            {template?.group === 'bulk' && <> <ChangeTag kind="new" label="New: real sample records" /></>}
          </DialogDescription>
        </DialogHeader>
        {template && <EmailBodyPreview t={template} layout={template.layout} />}
      </DialogContent>
    </Dialog>
  );
}

/** Preview of one notification, as it appears in the app and as an email. */
export function NotificationPreviewDialog({ portal, event, onClose }: { portal: Portal; event: NotifEvent | null; onClose: () => void }) {
  const def = event ? templatesFor(portal, 'notification', event.category, event.id)[0] : undefined;
  const standard = event ? getTemplate(`n-${event.id}`) : undefined;
  const t = def ?? standard;
  return (
    <Dialog open={!!event} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Notification preview</DialogTitle>
          <DialogDescription className="flex items-center gap-2">
            {event && eventOf(portal, event.id) && <span className="text-neutral-900">{event.label}</span>}
            <Badge variant="outline" className="font-normal">{def?.type ?? 'Standard'}</Badge>
          </DialogDescription>
        </DialogHeader>
        {event && t && (
          <Tabs defaultValue="app">
            <TabsList>
              <TabsTrigger value="app"><FontAwesomeIcon name="bell" className="w-3.5 h-3.5 mr-1.5" aria-hidden="true" />In app</TabsTrigger>
              <TabsTrigger value="email"><FontAwesomeIcon name="envelope" className="w-3.5 h-3.5 mr-1.5" aria-hidden="true" />Email</TabsTrigger>
            </TabsList>
            <TabsContent value="app" className="pt-3">
              <div className="rounded-md border border-neutral-200 border-l-4 border-l-purple-500 bg-card p-3">
                <p className="flex items-center gap-1.5 text-xs font-medium text-purple-600"><FontAwesomeIcon name="bell" className="w-3 h-3" aria-hidden="true" /> Update</p>
                <div className="mt-2 flex items-start gap-3">
                  <span className="size-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs">MC</span>
                  <div>
                    <p className="text-xs text-neutral-600">maya.chen@mailinator.com · {whenText(new Date().toISOString())}</p>
                    <p className="text-sm font-semibold text-neutral-900" dangerouslySetInnerHTML={{ __html: renderSample(t.subject, false) }} />
                  </div>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="email" className="pt-3">
              <EmailBodyPreview t={t} layout={t.layout} />
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}
