import { EmailConfigurationPage } from '../email/EmailConfigurationPage';
import { SchoolConfigurationPage } from '../school/SchoolConfigurationPage';
import { ChangeTag } from './changes';

const note = 'px-6 pt-6 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-neutral-700';

/** Our existing Email Setup, shown inside the new Notification area. Display name is in the reference too. */
export function SiteEmailSetup() {
  return (
    <div>
      <p className={note}>Email Display Name <ChangeTag kind="reference" /> Default reply-to, tenant logo and footer <ChangeTag kind="ours" /></p>
      <EmailConfigurationPage onlyTab="setup" />
    </div>
  );
}
export function SchoolEmailSetup() {
  return (
    <div>
      <p className={note}>Email Display Name <ChangeTag kind="reference" /> Reply-to, logo and footer <ChangeTag kind="ours" /> <ChangeTag kind="new" label="New: School portal" /></p>
      <SchoolConfigurationPage onlyTab="setup" />
    </div>
  );
}
export function SiteAttachmentTemplates() {
  return (
    <div>
      <p className={note}>Dynamic documents generated per recipient <ChangeTag kind="ours" label="Ours: not in the reference" /></p>
      <EmailConfigurationPage onlyTab="attachment-templates" />
    </div>
  );
}
