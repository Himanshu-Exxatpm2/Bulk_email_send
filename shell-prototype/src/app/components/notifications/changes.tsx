import { createContext, useContext, type ReactNode } from 'react';
import { cn } from '../ui/utils';

// "Show changes" marks every part of the Notification area by where it came from:
//   reference  taken from the notifications reference prototype
//   new        added for this prototype, not in the reference
//   ours       already in our prototype before this work and kept
export type ChangeKind = 'reference' | 'new' | 'ours';

export const ShowChangesContext = createContext<boolean>(false);

const STYLE: Record<ChangeKind, { label: string; cls: string }> = {
  reference: { label: 'From reference', cls: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  new: { label: 'New', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  ours: { label: 'Ours', cls: 'bg-neutral-100 text-neutral-700 border-neutral-300' },
};

/** A small pill, visible only while "Show changes" is on. */
export function ChangeTag({ kind, label, className }: { kind: ChangeKind; label?: string; className?: string }) {
  const show = useContext(ShowChangesContext);
  if (!show) return null;
  const s = STYLE[kind];
  return (
    <span className={cn('inline-flex items-center rounded-full border px-1.5 py-0 text-[10px] font-semibold leading-4 whitespace-nowrap align-middle', s.cls, className)} title={label ?? s.label}>
      {label ?? s.label}
    </span>
  );
}

/** Outlines a block in the colour of its origin while "Show changes" is on. */
export function Changed({ kind, children, className }: { kind: ChangeKind; children: ReactNode; className?: string }) {
  const show = useContext(ShowChangesContext);
  const ring = { reference: 'ring-indigo-300', new: 'ring-emerald-300', ours: 'ring-neutral-300' }[kind];
  return <div className={cn(show && 'rounded-md ring-2 ring-offset-2 ring-offset-white', show && ring, className)}>{children}</div>;
}

export interface ChangeItem { kind: ChangeKind; area: string; item: string }

// The full list, shown in the "What changed" dialog and copied into the README.
export const CHANGE_LIST: ChangeItem[] = [
  // From the reference prototype
  { kind: 'reference', area: 'Navigation', item: 'A Notification group in Configuration with Email Setup, Email Templates, Notification Configuration and My Notifications.' },
  { kind: 'reference', area: 'Notification Configuration', item: 'Events by In app and Email channels, grouped by category, with a User (role) dropdown.' },
  { kind: 'reference', area: 'Notification Configuration', item: 'Lock and unlock a category; Messages is permanently locked; turn a channel on or off for a whole category.' },
  { kind: 'reference', area: 'Notification Configuration', item: 'Recipients drawer: search, tick who receives the role\'s notifications, add an external recipient, and users who have blocked all notifications.' },
  { kind: 'reference', area: 'Notification Configuration', item: 'Preview a notification as In app and as Email, with merge values highlighted.' },
  { kind: 'reference', area: 'Notification Configuration', item: 'Save Now.' },
  { kind: 'reference', area: 'My Notifications', item: 'Personal In app and Email preferences per event, with a one-line description; locked categories cannot be turned off; Save preferences.' },
  { kind: 'reference', area: 'Email Templates', item: 'Templates organised by event, with a template count on each event, and a deep-linkable selection.' },
  { kind: 'reference', area: 'Email Templates', item: 'Several templates per event: Default badge, Standard (system, read-only) and Customized.' },
  { kind: 'reference', area: 'Email Templates', item: 'Card actions: Preview, Clone, Edit, Delete, Set as default (immediate, with a toast), and an expandable Edit history.' },
  { kind: 'reference', area: 'Email Templates', item: 'Rules: Standard templates cannot be edited or deleted, only cloned; a default cannot be deleted until another is set.' },
  { kind: 'reference', area: 'Email Templates', item: 'Add template: start from scratch or pick an existing template as the base. Clone: name the copy, nothing is created until you confirm.' },
  { kind: 'reference', area: 'Template editor', item: 'Full-page editor: name, read-only category, live header and footer around Subject and Body, Preview, Save, overflow menu with Delete.' },
  { kind: 'reference', area: 'Template editor', item: 'Attachments (up to 5, 10 MB each), Set as default toggle, header and footer layout options.' },
  { kind: 'reference', area: 'Template editor', item: 'Merge fields and Links lists, and typing @ in a field to pick one.' },
  // New for this prototype
  { kind: 'new', area: 'Email Templates', item: 'A Bulk Email group beside Automated notifications. Our existing Bulk Email templates get the same cards, rules, clone, default and history.' },
  { kind: 'new', area: 'Email Templates', item: 'Edits to Bulk Email templates now flow to the compose wizard (before, the config page kept its own copy).' },
  { kind: 'new', area: 'Template editor', item: 'Bulk Email templates: audience type, reply-to override, and the full merge-field catalogue with search and groups.' },
  { kind: 'new', area: 'Template editor', item: 'Preview of a Bulk Email template with real sample records through the merge engine, merged values highlighted.' },
  { kind: 'new', area: 'Template editor', item: 'Deep links added to the catalogue (schedule, request, placement, requirement, Exxat One home) for Bulk Email.' },
  { kind: 'new', area: 'School portal', item: 'The same four sections for the School portal, with School events and School roles (School Admin, Program Coordinator, Clinical Instructor).' },
  { kind: 'new', area: 'This page', item: 'Show changes and What changed, so every part is marked From reference, New or Ours.' },
  // Already ours
  { kind: 'ours', area: 'Email Setup', item: 'Display name plus default reply-to, tenant logo and footer (the reference has display name only).' },
  { kind: 'ours', area: 'Attachment Templates', item: 'Dynamic documents generated per recipient, kept as their own section.' },
  { kind: 'ours', area: 'Bulk Email', item: 'The existing templates, audience types and merge-field engine that the new pages build on.' },
];

export function changeListText() {
  const title = { reference: 'From the reference prototype', new: 'New in this prototype', ours: 'Already ours, kept' };
  return (['reference', 'new', 'ours'] as ChangeKind[])
    .map((k) => `${title[k]}\n${CHANGE_LIST.filter((c) => c.kind === k).map((c) => `- ${c.area}: ${c.item}`).join('\n')}`)
    .join('\n\n');
}
