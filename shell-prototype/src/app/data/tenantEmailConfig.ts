// Shared mutable singleton — updated by EmailConfigurationPage (site) and
// SchoolConfigurationPage (school) when the user saves Email Setup.
// Read by ComposeEmailWizard to render real branding in the Preview step.

export interface TenantPortalConfig {
  displayName: string;
  logoDataUrl: string | null; // base64 data URL from logo upload, or null
  footer: string;
  replyTo: string;
}

export const tenantEmailConfig: { site: TenantPortalConfig; school: TenantPortalConfig } = {
  site: {
    displayName: 'MedStar Health Clinical Education',
    logoDataUrl: null,
    footer:
      'This email was sent by MedStar Health Clinical Education via Exxat One. If you believe you received this in error, please contact support@exxat.com.',
    replyTo: 'clinical.placements@medstarhealth.org',
  },
  school: {
    displayName: 'Bowie State University Clinical Placement Office',
    logoDataUrl: null,
    footer:
      'This email was sent by Bowie State University Clinical Placement Office via Exxat One. For questions, contact clinicalplacements@bowiestate.edu.',
    replyTo: 'clinicalplacements@bowiestate.edu',
  },
};
