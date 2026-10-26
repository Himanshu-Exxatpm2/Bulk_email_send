import type { AudienceType } from './mockEmailTemplates';

// System-generated attachment templates (e.g. thank-you letters), authored in
// Site Configuration → Attachment Templates. Distinct from mockEmailTemplates
// (those are email bodies; these render into a generated document attached
// to a send). Merge-field validation runs at save time in that screen — a
// template can't be saved unless every {{token}} in its content resolves
// against the audience's merge-field schema, so validationStatus is always
// 'valid' for anything that made it into this array.
export interface EmailAttachmentTemplate {
  id: string;
  name: string;
  audienceType: AudienceType;
  content: string;               // HTML rendered into the generated document
  requiredMergeFields: string[]; // tokens referenced in content, e.g. '{{studentName}}'
  validationStatus: 'valid';
  createdAt: string;             // YYYY-MM-DD
}

export const mockEmailAttachmentTemplates: EmailAttachmentTemplate[] = [
  {
    id: 'atpl-001',
    name: 'Clinical Rotation Thank-You Letter',
    audienceType: 'Student',
    content: `<p>Dear {{studentName}},</p>
<p>On behalf of <strong>{{hospitalName}}</strong>, thank you for completing your clinical rotation, <strong>{{rotationName}}</strong>, under the supervision of {{preceptorName}}.</p>
<p>Your dedication throughout this placement reflects well on you and on {{school}}. We wish you continued success in your program.</p>
<p>Warm regards,<br>{{hospitalName}} Clinical Education</p>`,
    requiredMergeFields: ['{{studentName}}', '{{hospitalName}}', '{{rotationName}}', '{{preceptorName}}', '{{school}}'],
    validationStatus: 'valid',
    createdAt: '2026-08-12',
  },
  {
    id: 'atpl-002',
    name: 'School Partnership Appreciation Letter',
    audienceType: 'School Contact',
    content: `<p>Dear {{schoolContactName}},</p>
<p>Thank you for the continued partnership between <strong>{{schoolName}}</strong> and <strong>{{hospitalName}}</strong>. We're grateful for {{coordinatorName}}'s coordination on our recent placements.</p>
<p>We look forward to many more successful rotations together.</p>
<p>Best regards,<br>{{hospitalName}} Clinical Education</p>`,
    requiredMergeFields: ['{{schoolContactName}}', '{{schoolName}}', '{{hospitalName}}', '{{coordinatorName}}'],
    validationStatus: 'valid',
    createdAt: '2026-08-14',
  },
  {
    id: 'atpl-003',
    name: 'Preceptor Appreciation Certificate',
    audienceType: 'Preceptor',
    content: `<p>Dear {{preceptorName}},</p>
<p>Thank you for precepting students at <strong>{{siteName}}</strong>, {{locationName}}. Your mentorship makes a lasting impact on the next generation of clinicians.</p>
<p>With gratitude,<br>{{siteName}} Clinical Education</p>`,
    requiredMergeFields: ['{{preceptorName}}', '{{siteName}}', '{{locationName}}'],
    validationStatus: 'valid',
    createdAt: '2026-09-02',
  },
];

// Site Configuration writes through these so Compose (which reads the same
// array) sees new, edited and deleted templates. The type only accepts
// validationStatus: 'valid' — the save-time merge-field check in Site
// Configuration is what earns a template the right to be passed in here.
export function upsertAttachmentTemplate(tpl: EmailAttachmentTemplate) {
  const idx = mockEmailAttachmentTemplates.findIndex((t) => t.id === tpl.id);
  if (idx === -1) mockEmailAttachmentTemplates.push(tpl);
  else mockEmailAttachmentTemplates[idx] = tpl;
}

export function removeAttachmentTemplate(id: string) {
  const idx = mockEmailAttachmentTemplates.findIndex((t) => t.id === id);
  if (idx !== -1) mockEmailAttachmentTemplates.splice(idx, 1);
}
